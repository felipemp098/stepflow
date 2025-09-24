import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  UserProfile, 
  UserSettings, 
  UserSession, 
  UpdateProfileRequest, 
  UpdateSettingsRequest,
  ApiError 
} from '@/types/account';

const API_BASE_URL = 'https://irwreedairelbbekrvyq.supabase.co/functions/v1/account';

interface UseAccountReturn {
  // Profile
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<{ success: boolean; error?: string }>;
  
  // Settings
  settings: UserSettings | null;
  settingsLoading: boolean;
  settingsError: string | null;
  updateSettings: (data: UpdateSettingsRequest) => Promise<{ success: boolean; error?: string }>;
  
  // Sessions
  sessions: UserSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  deleteSession: (sessionId: string) => Promise<{ success: boolean; error?: string }>;
  
  // General
  refreshProfile: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshSessions: () => Promise<void>;
}

export function useAccount(): UseAccountReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  };

  // Helper function to handle API errors
  const handleApiError = (error: any): string => {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

  // Fetch user profile
  const fetchProfile = async () => {
    setProfileLoading(true);
    setProfileError(null);
    
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        console.log('🔍 Fetching profile with headers:', headers);
        
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          headers
        });
        
        const data = await response.json();
        console.log('📊 Profile response:', data);
        
        if (!response.ok) {
          throw data;
        }
        
        setProfile(data.data);
        return;
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      const userProfile = {
        id: user.id,
        name: profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        email_verified: !!user.email_confirmed_at,
        created_at: user.created_at,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        phone: user.user_metadata?.phone
      };

      console.log('📊 Direct Supabase profile:', userProfile);
      setProfile(userProfile);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setProfileError(handleApiError(error));
    } finally {
      setProfileLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me/profile`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw result;
        }
        
        setProfile(result.data);
        return { success: true };
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed for profile update, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          phone: data.phone,
          avatar_url: data.avatar_url
        }
      });

      if (updateError) {
        throw updateError;
      }

      // Also update profiles table if it exists
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: data.name,
          phone: data.phone,
          avatar_url: data.avatar_url,
          updated_at: new Date().toISOString()
        });

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Warning updating profiles table:', profileError);
        // Don't throw here, as the main update succeeded
      }

      // Update local state instead of refreshing
      setProfile(prev => ({
        ...prev,
        ...data,
        updated_at: new Date().toISOString()
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: handleApiError(error) };
    }
  };

  // Fetch user settings
  const fetchSettings = async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me/settings`, {
          method: 'GET',
          headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw data;
        }
        
        setSettings(data.data);
        return;
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed for settings, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Try to get settings from database first
      let settings = null;
      try {
        const { data: dbSettings, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (!error) {
          settings = dbSettings;
        }
      } catch (dbError) {
        console.warn('Database settings not available, using localStorage:', dbError);
      }

      // Fallback to localStorage if database is not available
      if (!settings) {
        const localSettings = localStorage.getItem(`user_settings_${user.id}`);
        if (localSettings) {
          try {
            settings = JSON.parse(localSettings);
          } catch (parseError) {
            console.warn('Error parsing localStorage settings:', parseError);
          }
        }
      }

      // Return settings with defaults if not found
      const userSettings = {
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

      console.log('📊 Settings loaded:', userSettings);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setSettingsError(handleApiError(error));
    } finally {
      setSettingsLoading(false);
    }
  };

  // Update user settings
  const updateSettings = async (data: UpdateSettingsRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me/settings`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw result;
        }
        
        setSettings(result.data);
        return { success: true };
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed for settings update, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Try to update database first
      let dbSuccess = false;
      try {
        const { error: upsertError } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            ...data,
            updated_at: new Date().toISOString()
          });

        if (!upsertError) {
          dbSuccess = true;
        }
      } catch (dbError) {
        console.warn('Database update failed, using localStorage:', dbError);
      }

      // Fallback to localStorage if database is not available
      if (!dbSuccess) {
        const currentSettings = localStorage.getItem(`user_settings_${user.id}`);
        let settings = {};
        
        if (currentSettings) {
          try {
            settings = JSON.parse(currentSettings);
          } catch (parseError) {
            console.warn('Error parsing current settings:', parseError);
          }
        }

        const updatedSettings = {
          ...settings,
          ...data,
          user_id: user.id,
          updated_at: new Date().toISOString()
        };

        localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(updatedSettings));
        console.log('📊 Settings saved to localStorage:', updatedSettings);
      }

      // Update local state instead of refreshing
      setSettings(prev => ({
        ...prev,
        ...data,
        updated_at: new Date().toISOString()
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: handleApiError(error) };
    }
  };

  // Fetch user sessions
  const fetchSessions = async () => {
    setSessionsLoading(true);
    setSessionsError(null);
    
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me/sessions`, {
          method: 'GET',
          headers
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw data;
        }
        
        setSessions(data.data);
        return;
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed for sessions, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Try to get sessions from database first
      let sessions = [];
      try {
        const { data: dbSessions, error } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('last_seen_at', { ascending: false });

        if (!error && dbSessions) {
          sessions = dbSessions;
        }
      } catch (dbError) {
        console.warn('Database sessions not available, using mock data:', dbError);
      }

      // Fallback to mock session data if database is not available
      if (sessions.length === 0) {
        sessions = [{
          id: 'current-session',
          user_id: user.id,
          device_label: 'Navegador Atual',
          ip: '127.0.0.1',
          user_agent: navigator.userAgent,
          created_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
          current: true
        }];
      }

      // Mark current session (simplified approach)
      const userSessions = sessions.map(session => ({
        ...session,
        current: session.id === 'current-session' || session.current
      }));

      console.log('📊 Sessions loaded:', userSessions);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessionsError(handleApiError(error));
    } finally {
      setSessionsLoading(false);
    }
  };

  // Delete user session
  const deleteSession = async (sessionId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Try Edge Function first
      try {
        const headers = await getAuthHeaders();
        const response = await fetch(`${API_BASE_URL}/me/sessions/${sessionId}`, {
          method: 'DELETE',
          headers
        });
        
        if (!response.ok) {
          const result = await response.json();
          throw result;
        }
        
        // Remove session from local state
        setSessions(prev => prev.filter(session => session.id !== sessionId));
        return { success: true };
      } catch (edgeError) {
        console.warn('⚠️ Edge Function failed for session delete, trying direct Supabase:', edgeError);
      }

      // Fallback to direct Supabase client
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      // Try to delete from database first
      let dbSuccess = false;
      try {
        const { error: deleteError } = await supabase
          .from('user_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', user.id); // Ensure user can only delete their own sessions

        if (!deleteError) {
          dbSuccess = true;
        }
      } catch (dbError) {
        console.warn('Database delete failed, using local state only:', dbError);
      }

      // For mock sessions or if database is not available, just remove from local state
      if (!dbSuccess || sessionId === 'current-session') {
        console.log('📊 Removing session from local state:', sessionId);
      }

      // Remove session from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { success: false, error: handleApiError(error) };
    }
  };

  // Refresh functions
  const refreshProfile = async () => {
    await fetchProfile();
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  const refreshSessions = async () => {
    await fetchSessions();
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchProfile();
    fetchSettings();
    fetchSessions();
  }, []);

  return {
    // Profile
    profile,
    profileLoading,
    profileError,
    updateProfile,
    
    // Settings
    settings,
    settingsLoading,
    settingsError,
    updateSettings,
    
    // Sessions
    sessions,
    sessionsLoading,
    sessionsError,
    deleteSession,
    
    // General
    refreshProfile,
    refreshSettings,
    refreshSessions
  };
}
