-- Migration: Fix Client RLS Policies
-- Description: Fixes RLS policies for client creation to allow admin users to create clients
-- Date: 2025-01-27

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clientes;

-- Create new policies that allow admin users to create/update/delete clients
CREATE POLICY "Admins can create clients" 
ON public.clientes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update clients" 
ON public.clientes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete clients" 
ON public.clientes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_client_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
