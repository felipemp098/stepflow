-- Migration: Fix Authentication Context for RLS
-- Description: Fixes RLS policies to work with proper authentication context
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

-- Create a more robust function to check if user is admin
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

-- Create a function to get current user ID safely
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies for clientes table
-- 1. Users can view clients they have access to
CREATE POLICY "Users can view clients they have access to" 
ON public.clientes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND cliente_id = clientes.id
  )
);

-- 2. Admin users can create clients
CREATE POLICY "Admin users can create clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Admin users can update clients
CREATE POLICY "Admin users can update clients" 
ON public.clientes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 4. Admin users can delete clients
CREATE POLICY "Admin users can delete clients" 
ON public.clientes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Test the policies
SELECT 
  auth.uid() as current_user_id,
  public.get_current_user_id() as get_current_user_id,
  public.is_user_admin() as is_admin,
  COUNT(*) as admin_roles_count
FROM public.user_client_roles 
WHERE user_id = auth.uid() AND role = 'admin';
