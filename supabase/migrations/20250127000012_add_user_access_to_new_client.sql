-- Migration: Add User Access to New Client
-- Description: Adds admin access for the user to the newly created client
-- Date: 2025-01-27

-- Add admin access for the user to the newly created client
INSERT INTO public.user_client_roles (user_id, cliente_id, role, created_at, updated_at)
VALUES (
  'd3426630-0c63-4ea1-ac5c-09f2da108559'::UUID,
  '3a038c70-2a7b-46e1-85ad-8dadef47a8d8'::UUID,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (user_id, cliente_id) DO NOTHING;

-- Verify the access was created
SELECT 
  ucr.user_id,
  ucr.cliente_id,
  ucr.role,
  c.nome as cliente_nome
FROM public.user_client_roles ucr
JOIN public.clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559'
ORDER BY c.nome;
