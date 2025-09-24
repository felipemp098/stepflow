-- Migration: Create Admin User with Access to All Clients
-- Description: Creates an admin user with access to all existing clients
-- Date: 2025-01-27

-- Insert admin user (this will be created by Supabase Auth)
-- We'll create the user_client_roles entries for the admin user

-- Get the current user ID (this will be replaced with the actual user ID when the migration runs)
-- For now, we'll use a placeholder that will be updated by the application

-- Insert user_client_roles for admin access to all clients
-- Note: This will be populated by the application when a user signs up as admin
-- For testing purposes, we'll create a function to handle this

-- Create function to add admin access to a user
CREATE OR REPLACE FUNCTION public.add_admin_access(user_id_param UUID)
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

-- Create function to add client access to a user
CREATE OR REPLACE FUNCTION public.add_client_access(user_id_param UUID, cliente_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Add client role for specific client
  INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
  VALUES (user_id_param, cliente_id_param, 'cliente', NOW(), NOW())
  ON CONFLICT (user_id, cliente_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to add student access to a user
CREATE OR REPLACE FUNCTION public.add_student_access(user_id_param UUID, cliente_id_param UUID)
RETURNS VOID AS $$
BEGIN
  -- Add student role for specific client
  INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
  VALUES (user_id_param, cliente_id_param, 'aluno', NOW(), NOW())
  ON CONFLICT (user_id, cliente_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the functions to add admin access for the current user
-- Replace 'd3426630-0c63-4ea1-ac5c-09f2da108559' with your actual user ID
SELECT public.add_admin_access('d3426630-0c63-4ea1-ac5c-09f2da108559'::UUID);

-- Verify the access was created
SELECT 
  ucr.user_id,
  ucr.cliente_id,
  ucr.role,
  c.nome as cliente_nome
FROM public.user_client_roles ucr
JOIN public.clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
