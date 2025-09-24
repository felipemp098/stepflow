-- Migration: Create User Settings
-- Description: User preferences and settings for the account page
-- Date: 2025-01-27

-- Create enum for theme
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');

-- Create enum for density
CREATE TYPE density_preference AS ENUM ('comfortable', 'compact');

-- Create enum for date format
CREATE TYPE date_format_preference AS ENUM ('dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy-MM-dd');

-- Create user_settings table
CREATE TABLE public.user_settings (
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

-- Create index for performance
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- Create function to automatically create user_settings when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
