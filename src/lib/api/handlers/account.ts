import { BaseApiHandler } from './base';
import { ApiResponse } from '@/lib/api/response';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserProfile, 
  UserSettings, 
  UserSession, 
  UpdateProfileRequest, 
  UpdateSettingsRequest,
  ApiError 
} from '@/types/account';

export class AccountHandler extends BaseApiHandler {
  
  // GET /me - Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      // Get user profile from auth.users
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return this.error('INTERNAL_ERROR', 'Erro ao buscar perfil do usuário', 500);
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

      return this.success(userProfile);
    } catch (error) {
      console.error('Error in getProfile:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // PUT /me/profile - Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      // Validate input
      if (data.name && (data.name.length < 2 || data.name.length > 100)) {
        return this.error('VALIDATION_ERROR', 'Nome deve ter entre 2 e 100 caracteres', 400, { field: 'name' });
      }

      if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
        return this.error('VALIDATION_ERROR', 'Formato de telefone inválido', 400, { field: 'phone' });
      }

      // Update or create profile
      const profileData = {
        user_id: user.id,
        full_name: data.name,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString()
      };

      const { data: profile, error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return this.error('INTERNAL_ERROR', 'Erro ao atualizar perfil', 500);
      }

      // Update user metadata if needed
      if (data.name || data.phone) {
        const metadata: any = {};
        if (data.name) metadata.full_name = data.name;
        if (data.phone) metadata.phone = data.phone;

        const { error: metadataError } = await supabase.auth.updateUser({
          data: metadata
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

      return this.success(userProfile);
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // GET /me/settings - Get user settings
  async getSettings(): Promise<ApiResponse<UserSettings>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching settings:', error);
        return this.error('INTERNAL_ERROR', 'Erro ao buscar configurações', 500);
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

      return this.success(userSettings);
    } catch (error) {
      console.error('Error in getSettings:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // PUT /me/settings - Update user settings
  async updateSettings(data: UpdateSettingsRequest): Promise<ApiResponse<UserSettings>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      // Validate input
      const validationError = this.validateSettings(data);
      if (validationError) {
        return validationError;
      }

      // Validate default_client_id if provided
      if (data.default_client_id) {
        const { data: clientRole, error: roleError } = await supabase
          .from('user_client_roles')
          .select('cliente_id')
          .eq('user_id', user.id)
          .eq('cliente_id', data.default_client_id)
          .single();

        if (roleError || !clientRole) {
          return this.error('VALIDATION_ERROR', 'Cliente não encontrado ou sem permissão', 400, { field: 'default_client_id' });
        }
      }

      // Prepare update data
      const updateData: any = {
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      // Only include fields that are provided
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.density !== undefined) updateData.density = data.density;
      if (data.reduced_motion !== undefined) updateData.reduced_motion = data.reduced_motion;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;
      if (data.date_format !== undefined) updateData.date_format = data.date_format;
      if (data.number_format !== undefined) updateData.number_format = data.number_format;
      if (data.email_alerts_financeiro !== undefined) updateData.email_alerts_financeiro = data.email_alerts_financeiro;
      if (data.email_alerts_operacional !== undefined) updateData.email_alerts_operacional = data.email_alerts_operacional;
      if (data.email_resumo_semanal !== undefined) updateData.email_resumo_semanal = data.email_resumo_semanal;
      if (data.default_client_id !== undefined) updateData.default_client_id = data.default_client_id;

      const { data: settings, error } = await supabase
        .from('user_settings')
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return this.error('INTERNAL_ERROR', 'Erro ao atualizar configurações', 500);
      }

      return this.success(settings as UserSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // GET /me/sessions - Get user sessions
  async getSessions(): Promise<ApiResponse<UserSession[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return this.error('INTERNAL_ERROR', 'Erro ao buscar sessões', 500);
      }

      // Mark current session (this is a simplified approach)
      const currentSessionId = 'current'; // In a real implementation, you'd track this
      const userSessions: UserSession[] = (sessions || []).map(session => ({
        ...session,
        current: session.id === currentSessionId
      }));

      return this.success(userSessions);
    } catch (error) {
      console.error('Error in getSessions:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // DELETE /me/sessions/:id - Delete user session
  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return this.error('UNAUTHORIZED', 'Usuário não autenticado', 401);
      }

      // Check if session exists and belongs to user
      const { data: session, error: fetchError } = await supabase
        .from('user_sessions')
        .select('id, user_id')
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !session) {
        return this.error('NOT_FOUND', 'Sessão não encontrada', 404);
      }

      // Delete the session
      const { error: deleteError } = await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting session:', deleteError);
        return this.error('INTERNAL_ERROR', 'Erro ao encerrar sessão', 500);
      }

      return this.success(undefined);
    } catch (error) {
      console.error('Error in deleteSession:', error);
      return this.error('INTERNAL_ERROR', 'Erro interno do servidor', 500);
    }
  }

  // Helper method to validate settings
  private validateSettings(data: UpdateSettingsRequest): ApiResponse<any> | null {
    if (data.theme && !['light', 'dark', 'system'].includes(data.theme)) {
      return this.error('VALIDATION_ERROR', 'Tema inválido', 400, { field: 'theme' });
    }

    if (data.density && !['comfortable', 'compact'].includes(data.density)) {
      return this.error('VALIDATION_ERROR', 'Densidade inválida', 400, { field: 'density' });
    }

    if (data.date_format && !['dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd'].includes(data.date_format)) {
      return this.error('VALIDATION_ERROR', 'Formato de data inválido', 400, { field: 'date_format' });
    }

    if (data.timezone && !this.isValidTimezone(data.timezone)) {
      return this.error('VALIDATION_ERROR', 'Timezone inválido', 400, { field: 'timezone' });
    }

    if (data.language && !this.isValidLanguage(data.language)) {
      return this.error('VALIDATION_ERROR', 'Idioma inválido', 400, { field: 'language' });
    }

    if (data.number_format && !this.isValidNumberFormat(data.number_format)) {
      return this.error('VALIDATION_ERROR', 'Formato de número inválido', 400, { field: 'number_format' });
    }

    return null;
  }

  // Helper method to validate timezone
  private isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to validate language
  private isValidLanguage(language: string): boolean {
    try {
      Intl.Locale(language);
      return true;
    } catch {
      return false;
    }
  }

  // Helper method to validate number format
  private isValidNumberFormat(format: string): boolean {
    try {
      Intl.NumberFormat(format);
      return true;
    } catch {
      return false;
    }
  }
}
