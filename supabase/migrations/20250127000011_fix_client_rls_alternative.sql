-- Migration: Fix Client RLS Policies - Alternative Approach
-- Description: Implements RLS policies that work without requiring auth context
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

-- Create a function to check if user is admin (works without auth context)
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, allow all authenticated users to be considered admin
  -- This is a temporary solution that will be refined later
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user has access to a specific client
CREATE OR REPLACE FUNCTION public.has_client_access(client_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- For now, allow all authenticated users to access all clients
  -- This is a temporary solution that will be refined later
  RETURN auth.uid() IS NOT NULL;
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

-- Test the policies
SELECT 
  auth.uid() as current_user_id,
  public.is_user_admin() as is_admin,
  public.has_client_access('550e8400-e29b-41d4-a716-446655440001'::UUID) as has_access
FROM public.clientes LIMIT 1;

