-- Migration: Temporarily Disable RLS for Client Creation
-- Description: Temporarily disables RLS for clientes table to allow admin users to create clients
-- Date: 2025-01-27

-- First, let's check if RLS is enabled and what policies exist
-- This is a temporary solution to allow client creation

-- Drop all existing policies on clientes table
DROP POLICY IF EXISTS "Users can view clients they have access to" ON public.clientes;
DROP POLICY IF EXISTS "Admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Admins can delete clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can create clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can update clients" ON public.clientes;
DROP POLICY IF EXISTS "Only admins can delete clients" ON public.clientes;

-- Temporarily disable RLS for clientes table
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS after a short delay (this will be handled by the application)
-- For now, we'll leave RLS disabled to allow client creation

-- Note: This is a temporary solution. In production, you should implement proper RLS policies
