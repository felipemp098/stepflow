-- Migration: Auto Grant Client Access
-- Description: Creates a trigger that automatically grants admin access to users who create clients
-- Date: 2025-01-27

-- Create a function that automatically grants admin access to the user who creates a client
CREATE OR REPLACE FUNCTION public.auto_grant_client_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if the user is authenticated
  IF auth.uid() IS NOT NULL THEN
    -- Grant admin access to the user who created the client
    INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
    VALUES (
      auth.uid(),
      NEW.id,
      'admin',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, cliente_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that runs after a client is inserted
CREATE TRIGGER trigger_auto_grant_client_access
  AFTER INSERT ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_client_access();

-- Test the trigger by checking if it works
-- This will be tested when a new client is created
SELECT 'Trigger created successfully' as status;
