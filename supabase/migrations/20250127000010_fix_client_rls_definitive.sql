-- Migration: Fix Client RLS Policies - Definitive Solution
-- Description: Implements proper RLS policies that work with application authentication
-- Date: 2025-01-27

-- Drop all existing policies on clientes table
DROP POLICY IF EXISTS "Users can view clients they have access to" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clientes;

-- Ensure RLS is enabled
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin (works with application auth)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has admin role for any client
  RETURN EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has access to a specific client
CREATE OR REPLACE FUNCTION public.has_client_access(client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user has access to this client
  RETURN EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND cliente_id = client_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for clientes table
-- 1. Users can view clients they have access to
CREATE POLICY "Users can view clients they have access to" 
ON public.clientes 
FOR SELECT 
USING (public.has_client_access(id));

-- 2. Admin users can create clients
CREATE POLICY "Admin users can create clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (public.is_user_admin());

-- 3. Admin users can update clients
CREATE POLICY "Admin users can update clients" 
ON public.clientes 
FOR UPDATE 
USING (public.is_user_admin())
WITH CHECK (public.is_user_admin());

-- 4. Admin users can delete clients
CREATE POLICY "Admin users can delete clients" 
ON public.clientes 
FOR DELETE 
USING (public.is_user_admin());

-- Create a function to manually add admin access (for testing)
CREATE OR REPLACE FUNCTION public.add_admin_access_manual(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Add admin role for all existing clients
  INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
  SELECT 
    user_id_param,
    id,
    'admin',
    NOW(),
    NOW()
  FROM public.clientes
  WHERE status = 'ativo'
  ON CONFLICT (user_id, cliente_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin access for the current user if not already exists
SELECT public.add_admin_access_manual('d3426630-0c63-4ea1-ac5c-09f2da108559'::UUID);

-- Test the policies
SELECT 
  auth.uid() as current_user_id,
  public.is_user_admin() as is_admin,
  COUNT(*) as admin_roles_count
FROM public.user_client_roles 
WHERE user_id = auth.uid() AND role = 'admin';
