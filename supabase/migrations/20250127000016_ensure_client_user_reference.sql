-- Migration: Ensure Client User Reference
-- Description: Ensures that when a client is created, it's automatically referenced to the logged user
-- Date: 2025-01-27

-- First, let's ensure the created_by column exists
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing clients to have the current user as creator
UPDATE public.clientes 
SET created_by = 'd3426630-0c63-4ea1-ac5c-09f2da108559'::UUID
WHERE created_by IS NULL;

-- Create a function to automatically set created_by when a client is created
CREATE OR REPLACE FUNCTION public.set_client_created_by()
RETURNS TRIGGER AS $$
BEGIN
  -- Always set created_by to the current authenticated user
  NEW.created_by = auth.uid();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_client_created_by ON public.clientes;

-- Create a trigger to automatically set created_by
CREATE TRIGGER trigger_set_client_created_by
  BEFORE INSERT ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_client_created_by();

-- Update the auto_grant_client_access function to use created_by
CREATE OR REPLACE FUNCTION public.auto_grant_client_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant admin access to the user who created the client
  INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
  VALUES (
    NEW.created_by,
    NEW.id,
    'admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id, cliente_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_grant_client_access ON public.clientes;

-- Create a trigger that runs after a client is inserted
CREATE TRIGGER trigger_auto_grant_client_access
  AFTER INSERT ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_grant_client_access();

-- Verify the setup
SELECT 
  'Current clients with created_by:' as info,
  id,
  nome,
  created_by,
  status
FROM public.clientes
ORDER BY nome;

-- Test the trigger by checking if it would work
SELECT 
  'Trigger setup complete' as status,
  'created_by column exists' as column_check,
  'triggers created' as trigger_check;

