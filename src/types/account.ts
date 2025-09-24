// Types for Account/Profile management

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  avatar_url?: string;
  phone?: string;
}

export interface UserSettings {
  user_id: string;
  
  // UI Preferences
  theme: 'light' | 'dark' | 'system';
  density: 'comfortable' | 'compact';
  reduced_motion: boolean;
  
  // Localization
  language: string;
  timezone: string;
  date_format: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  number_format: string;
  
  // Notifications
  email_alerts_financeiro: boolean;
  email_alerts_operacional: boolean;
  email_resumo_semanal: boolean;
  
  // Global UI Integration
  default_client_id?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  device_label: string;
  ip?: string;
  user_agent?: string;
  created_at: string;
  last_seen_at: string;
  current?: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface UpdateSettingsRequest {
  // UI Preferences
  theme?: 'light' | 'dark' | 'system';
  density?: 'comfortable' | 'compact';
  reduced_motion?: boolean;
  
  // Localization
  language?: string;
  timezone?: string;
  date_format?: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd';
  number_format?: string;
  
  // Notifications
  email_alerts_financeiro?: boolean;
  email_alerts_operacional?: boolean;
  email_resumo_semanal?: boolean;
  
  // Global UI Integration
  default_client_id?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: {
      field?: string;
      [key: string]: any;
    };
  };
}
