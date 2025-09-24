-- Migration: Create User Account Tables (Safe Version)
-- Description: User preferences, settings and sessions for the account page
-- Date: 2025-01-27

-- Create enum for theme (if not exists)
DO $$ BEGIN
  CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for density (if not exists)
DO $$ BEGIN
  CREATE TYPE density_preference AS ENUM ('comfortable', 'compact');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for date format (if not exists)
DO $$ BEGIN
  CREATE TYPE date_format_preference AS ENUM ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_settings table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- UI Preferences
  theme theme_preference NOT NULL DEFAULT 'system',
  density density_preference NOT NULL DEFAULT 'comfortable',
  reduced_motion BOOLEAN NOT NULL DEFAULT false,
  
  -- Localization
  language TEXT NOT NULL DEFAULT 'pt-BR',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  date_format date_format_preference NOT NULL DEFAULT 'dd/MM/yyyy',
  number_format TEXT NOT NULL DEFAULT 'pt-BR',
  
  -- Notifications
  email_alerts_financeiro BOOLEAN NOT NULL DEFAULT true,
  email_alerts_operacional BOOLEAN NOT NULL DEFAULT true,
  email_resumo_semanal BOOLEAN NOT NULL DEFAULT false,
  
  -- Global UI Integration
  default_client_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table (if not exists)
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session metadata
  device_label TEXT NOT NULL,
  ip INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_last_seen ON public.user_sessions(user_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Create function to automatically create user_settings when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update last_seen_at
CREATE OR REPLACE FUNCTION public.update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create user_settings (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created' 
    AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();
  END IF;
END $$;

-- Create trigger to update updated_at (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_settings_updated_at' 
    AND tgrelid = 'public.user_settings'::regclass
  ) THEN
    CREATE TRIGGER update_user_settings_updated_at
      BEFORE UPDATE ON public.user_settings
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- Create trigger to update last_seen_at on update (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_sessions_last_seen' 
    AND tgrelid = 'public.user_sessions'::regclass
  ) THEN
    CREATE TRIGGER update_user_sessions_last_seen
      BEFORE UPDATE ON public.user_sessions
      FOR EACH ROW EXECUTE FUNCTION public.update_session_last_seen();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;

DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can insert sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "System can update sessions" ON public.user_sessions;

-- Create RLS policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sessions" ON public.user_sessions
  FOR UPDATE USING (true);
