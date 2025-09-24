-- Migration: Create User Sessions
-- Description: Track user sessions for account management
-- Date: 2025-01-27

-- Create user_sessions table
CREATE TABLE public.user_sessions (
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

-- Create indexes for performance
CREATE INDEX idx_user_sessions_user_id_last_seen ON public.user_sessions(user_id, last_seen_at DESC);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);

-- Create function to update last_seen_at
CREATE OR REPLACE FUNCTION public.update_session_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_seen_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own sessions" ON public.user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.user_sessions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "System can insert sessions" ON public.user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sessions" ON public.user_sessions
  FOR UPDATE USING (true);
