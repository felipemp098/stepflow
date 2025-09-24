import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface UserProfile {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  avatar_url?: string;
  phone?: string;
}

interface UserSettings {
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  reduced_motion: boolean;
  language: string;
  timezone: string;
  date_format: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  number_format: string;
  email_alerts_financeiro: boolean;
  email_alerts_operacional: boolean;
  email_resumo_semanal: boolean;
  default_client_id?: string;
  created_at: string;
  updated_at: string;
}

interface UserSession {
  id: string;
  user_id: string;
  device_label: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
  last_seen_at: string;
  current?: boolean;
}

interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

function createResponse<T>(data: T, status: number = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function createErrorResponse(code: string, message: string, status: number = 400, details?: any): Response {
  return new Response(JSON.stringify({ 
    error: { code, message, details } 
  }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function validateUser(request: Request): Promise<{ user: any; supabase: any } | null> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return { user, supabase };
}

// GET /me - Get user profile
async function handleGetProfile(request: Request): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    // Get user profile from profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao buscar perfil do usuário', 500);
    }

    const userProfile: UserProfile = {
      id: user.id,
      name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      email_verified: !!user.email_confirmed_at,
      created_at: user.created_at,
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
      phone: user.user_metadata?.phone
    };

    return createResponse(userProfile);
  } catch (error) {
    console.error('Error in handleGetProfile:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// PUT /me/profile - Update user profile
async function handleUpdateProfile(request: Request): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    const body = await request.json();
    const { name, avatar_url, phone } = body;

    // Validate input
    if (name && (name.length < 2 || name.length > 100)) {
      return createErrorResponse('VALIDATION_ERROR', 'Nome deve ter entre 2 e 100 caracteres', 400, { field: 'name' });
    }

    if (phone && !/^\+?[\d\s\-\(\)]+$/.test(phone)) {
      return createErrorResponse('VALIDATION_ERROR', 'Formato de telefone inválido', 400, { field: 'phone' });
    }

    // Update or create profile
    const profileData = {
      user_id: user.id,
      full_name: name,
      avatar_url: avatar_url,
      updated_at: new Date().toISOString()
    };

    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao atualizar perfil', 500);
    }

    // Update user metadata if needed
    if (name || phone) {
      const metadata: any = {};
      if (name) metadata.full_name = name;
      if (phone) metadata.phone = phone;

      const { error: metadataError } = await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: metadata
      });

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError);
        // Don't fail the request, just log the error
      }
    }

    const userProfile: UserProfile = {
      id: user.id,
      name: profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      email_verified: !!user.email_confirmed_at,
      created_at: user.created_at,
      avatar_url: profile.avatar_url,
      phone: user.user_metadata?.phone
    };

    return createResponse(userProfile);
  } catch (error) {
    console.error('Error in handleUpdateProfile:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// GET /me/settings - Get user settings
async function handleGetSettings(request: Request): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao buscar configurações', 500);
    }

    // Return settings with defaults if not found
    const userSettings: UserSettings = {
      user_id: user.id,
      theme: settings?.theme || 'system',
      density: settings?.density || 'comfortable',
      reduced_motion: settings?.reduced_motion || false,
      language: settings?.language || 'pt-BR',
      timezone: settings?.timezone || 'UTC',
      date_format: settings?.date_format || 'dd/MM/yyyy',
      number_format: settings?.number_format || 'pt-BR',
      email_alerts_financeiro: settings?.email_alerts_financeiro ?? true,
      email_alerts_operacional: settings?.email_alerts_operacional ?? true,
      email_resumo_semanal: settings?.email_resumo_semanal ?? false,
      default_client_id: settings?.default_client_id,
      created_at: settings?.created_at || new Date().toISOString(),
      updated_at: settings?.updated_at || new Date().toISOString()
    };

    return createResponse(userSettings);
  } catch (error) {
    console.error('Error in handleGetSettings:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// PUT /me/settings - Update user settings
async function handleUpdateSettings(request: Request): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    const body = await request.json();

    // Validate input
    const validationError = validateSettings(body);
    if (validationError) {
      return validationError;
    }

    // Validate default_client_id if provided
    if (body.default_client_id) {
      const { data: clientRole, error: roleError } = await supabase
        .from('user_client_roles')
        .select('cliente_id')
        .eq('user_id', user.id)
        .eq('cliente_id', body.default_client_id)
        .single();

      if (roleError || !clientRole) {
        return createErrorResponse('VALIDATION_ERROR', 'Cliente não encontrado ou sem permissão', 400, { field: 'default_client_id' });
      }
    }

    // Prepare update data
    const updateData: any = {
      user_id: user.id,
      updated_at: new Date().toISOString()
    };

    // Only include fields that are provided
    const allowedFields = [
      'theme', 'density', 'reduced_motion', 'language', 'timezone', 
      'date_format', 'number_format', 'email_alerts_financeiro', 
      'email_alerts_operacional', 'email_resumo_semanal', 'default_client_id'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data: settings, error } = await supabase
      .from('user_settings')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao atualizar configurações', 500);
    }

    return createResponse(settings);
  } catch (error) {
    console.error('Error in handleUpdateSettings:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// GET /me/sessions - Get user sessions
async function handleGetSessions(request: Request): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    const { data: sessions, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('last_seen_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao buscar sessões', 500);
    }

    // Mark current session (simplified approach)
    const userSessions: UserSession[] = (sessions || []).map(session => ({
      ...session,
      current: false // In a real implementation, you'd track this properly
    }));

    return createResponse(userSessions);
  } catch (error) {
    console.error('Error in handleGetSessions:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// DELETE /me/sessions/:id - Delete user session
async function handleDeleteSession(request: Request, sessionId: string): Promise<Response> {
  const auth = await validateUser(request);
  if (!auth) {
    return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado', 401);
  }

  const { user, supabase } = auth;

  try {
    // Check if session exists and belongs to user
    const { data: session, error: fetchError } = await supabase
      .from('user_sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !session) {
      return createErrorResponse('NOT_FOUND', 'Sessão não encontrada', 404);
    }

    // Delete the session
    const { error: deleteError } = await supabase
      .from('user_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting session:', deleteError);
      return createErrorResponse('INTERNAL_ERROR', 'Erro ao encerrar sessão', 500);
    }

    return createResponse({});
  } catch (error) {
    console.error('Error in handleDeleteSession:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
}

// Helper function to validate settings
function validateSettings(data: any): Response | null {
  if (data.theme && !['light', 'dark', 'system'].includes(data.theme)) {
    return createErrorResponse('VALIDATION_ERROR', 'Tema inválido', 400, { field: 'theme' });
  }

  if (data.density && !['comfortable', 'compact'].includes(data.density)) {
    return createErrorResponse('VALIDATION_ERROR', 'Densidade inválida', 400, { field: 'density' });
  }

  if (data.date_format && !['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'].includes(data.date_format)) {
    return createErrorResponse('VALIDATION_ERROR', 'Formato de data inválido', 400, { field: 'date_format' });
  }

  if (data.timezone && !isValidTimezone(data.timezone)) {
    return createErrorResponse('VALIDATION_ERROR', 'Timezone inválido', 400, { field: 'timezone' });
  }

  if (data.language && !isValidLanguage(data.language)) {
    return createErrorResponse('VALIDATION_ERROR', 'Idioma inválido', 400, { field: 'language' });
  }

  if (data.number_format && !isValidNumberFormat(data.number_format)) {
    return createErrorResponse('VALIDATION_ERROR', 'Formato de número inválido', 400, { field: 'number_format' });
  }

  return null;
}

// Helper function to validate timezone
function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate language
function isValidLanguage(language: string): boolean {
  try {
    Intl.Locale(language);
    return true;
  } catch {
    return false;
  }
}

// Helper function to validate number format
function isValidNumberFormat(format: string): boolean {
  try {
    Intl.NumberFormat(format);
    return true;
  } catch {
    return false;
  }
}

// Main handler
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const method = req.method;

  try {
    // Route handling
    if (method === 'GET' && path === '/me') {
      return await handleGetProfile(req);
    }
    
    if (method === 'PUT' && path === '/me/profile') {
      return await handleUpdateProfile(req);
    }
    
    if (method === 'GET' && path === '/me/settings') {
      return await handleGetSettings(req);
    }
    
    if (method === 'PUT' && path === '/me/settings') {
      return await handleUpdateSettings(req);
    }
    
    if (method === 'GET' && path === '/me/sessions') {
      return await handleGetSessions(req);
    }
    
    if (method === 'DELETE' && path.startsWith('/me/sessions/')) {
      const sessionId = path.split('/')[3];
      return await handleDeleteSession(req, sessionId);
    }

    // 404 for unmatched routes
    return createErrorResponse('NOT_FOUND', 'Endpoint não encontrado', 404);
  } catch (error) {
    console.error('Unexpected error:', error);
    return createErrorResponse('INTERNAL_ERROR', 'Erro interno do servidor', 500);
  }
});
