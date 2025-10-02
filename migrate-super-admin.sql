-- Script de migração para tornar usuário atual super admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar usuário atual
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- 2. Atualizar usuário para super admin
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "super_admin", "migrated_at": "2025-01-27T21:45:00Z"}'::jsonb
WHERE id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- 3. Verificar se foi atualizado
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- 4. Verificar todos os usuários e seus metadados
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users 
ORDER BY created_at ASC;
