import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface TenantContext {
  userId: string;
  tenantId: string;
  userRole: string;
}

async function validateTenant(headers: Headers, userId: string): Promise<{ success: boolean; context?: TenantContext; error?: any }> {
  const clientId = headers.get('x-client-id');
  
  if (!clientId) {
    return {
      success: false,
      error: {
        code: 'TENANT_HEADER_REQUIRED',
        message: 'Header X-Client-Id é obrigatório'
      }
    };
  }

  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(clientId)) {
    return {
      success: false,
      error: {
        code: 'TENANT_HEADER_INVALID',
        message: 'Formato UUID inválido no header X-Client-Id'
      }
    };
  }

  // Create Supabase client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: {
        headers: { Authorization: headers.get('Authorization')! },
      },
    }
  );

  // Check user has access to this tenant
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_client_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('cliente_id', clientId)
    .single();

  if (rolesError || !userRoles) {
    return {
      success: false,
      error: {
        code: 'TENANT_FORBIDDEN',
        message: 'Usuário não tem acesso a este cliente'
      }
    };
  }

  return {
    success: true,
    context: {
      userId,
      tenantId: clientId,
      userRole: userRoles.role
    }
  };
}

async function handleDashboardResumo(context: TenantContext): Promise<Response> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Set tenant context for RLS
    await supabase.rpc('set_current_client', { client_id: context.tenantId });

    // Get dashboard data
    const [contratos, alunos, produtos] = await Promise.all([
      supabase.from('contratos').select('count', { count: 'exact' }).eq('cliente_id', context.tenantId),
      supabase.from('alunos').select('count', { count: 'exact' }).eq('cliente_id', context.tenantId),
      supabase.from('produtos').select('count', { count: 'exact' }).eq('cliente_id', context.tenantId)
    ]);

    const data = {
      contratos: contratos.count || 0,
      alunos: alunos.count || 0,
      produtos: produtos.count || 0,
      cliente: context.tenantId,
      role: context.userRole
    };

    return new Response(
      JSON.stringify({
        data,
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar dados do dashboard'
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleContratos(context: TenantContext): Promise<Response> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    // Set tenant context for RLS
    await supabase.rpc('set_current_client', { client_id: context.tenantId });

    // Get contratos data
    const { data: contratos, error } = await supabase
      .from('contratos')
      .select('*')
      .eq('cliente_id', context.tenantId);

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        data: contratos || [],
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro ao buscar contratos'
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    // Create Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Token de autenticação inválido',
          },
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate tenant
    const tenantValidation = await validateTenant(req.headers, user.id);
    
    if (!tenantValidation.success) {
      return new Response(
        JSON.stringify({
          error: tenantValidation.error,
          meta: {
            request_id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const context = tenantValidation.context!;

    // Route requests
    if (path === '/api/dash/resumo' && method === 'GET') {
      return await handleDashboardResumo(context);
    }

    if (path === '/api/contratos' && method === 'GET') {
      return await handleContratos(context);
    }

    // Default response for other routes
    return new Response(
      JSON.stringify({
        error: {
          code: 'NOT_FOUND',
          message: 'Rota não encontrada',
          details: { path, method }
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
