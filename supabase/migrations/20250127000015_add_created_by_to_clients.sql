-- Migration: Add created_by column to clientes table
-- Description: Adds created_by column to track which user created each client
-- Date: 2025-01-27

-- Add created_by column to clientes table
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
  -- Set created_by to the current user if not already set
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Verify the changes
SELECT 
  'Updated clients:' as info,
  id,
  nome,
  created_by,
  status
FROM public.clientes
ORDER BY nome;

-- Check user access
SELECT 
  'User access after update:' as info,
  ucr.user_id,
  ucr.cliente_id,
  ucr.role,
  c.nome as cliente_nome,
  c.created_by
FROM public.user_client_roles ucr
JOIN public.clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559'
ORDER BY c.nome;
