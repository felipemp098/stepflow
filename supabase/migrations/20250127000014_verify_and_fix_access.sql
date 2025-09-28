-- Migration: Verify and Fix User Access
-- Description: Verifies and fixes user access to clients
-- Date: 2025-01-27

-- First, let's check what clients exist and what access the user has
SELECT 
  'Current clients:' as info,
  id,
  nome,
  status
FROM public.clientes
ORDER BY nome;

-- Check current user access
SELECT 
  'Current user access:' as info,
  ucr.user_id,
  ucr.cliente_id,
  ucr.role,
  c.nome as cliente_nome
FROM public.user_client_roles ucr
JOIN public.clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559'
ORDER BY c.nome;

-- Add access for the specific client if it doesn't exist
INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
VALUES (
  'd3426630-0c63-4ea1-ac5c-09f2da108559'::UUID,
  '3a038c70-2a7b-46e1-85ad-8dadef47a8d8'::UUID,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, cliente_id) DO NOTHING;

-- Also add access to the seed clients
INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
SELECT 
  'd3426630-0c63-4ea1-ac5c-09f2da108559'::UUID,
  id,
  'admin',
  NOW(),
  NOW()
FROM public.clientes
WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002'
)
ON CONFLICT (user_id, cliente_id) DO NOTHING;

-- Verify all access was created
SELECT 
  'Final user access:' as info,
  ucr.user_id,
  ucr.cliente_id,
  ucr.role,
  c.nome as cliente_nome
FROM public.user_client_roles ucr
JOIN public.clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559'
ORDER BY c.nome;

