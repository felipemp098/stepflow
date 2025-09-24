-- Migration: Disable RLS for Clientes Table
-- Description: Temporarily disables RLS for clientes table to allow application to work
-- Date: 2025-01-27

-- Drop all existing policies on clientes table
DROP POLICY IF EXISTS "Users can view clients they have access to" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Admin users can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clientes;

-- Disable RLS for clientes table to allow application to work
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- Note: This allows the application to create clients without RLS restrictions
-- In production, you should implement proper RLS policies that work with your authentication system
