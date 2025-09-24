-- Migration: Fix Client RLS Policies - Definitive Solution
-- Description: Implements proper RLS policies for clientes table that allow admin users to create clients
-- Date: 2025-01-27

-- Drop all existing policies on clientes table
DROP POLICY IF EXISTS "Users can view clients they have access to" ON public.clientes;
DROP POLICY IF EXISTS "Admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clientes;

-- Ensure RLS is enabled
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Create a function to check if user is admin (for any client)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
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

-- Test the policies by checking if the current user is admin
SELECT 
  auth.uid() as current_user_id,
  public.is_user_admin() as is_admin,
  COUNT(*) as admin_roles_count
FROM public.user_client_roles 
WHERE user_id = auth.uid() AND role = 'admin';
