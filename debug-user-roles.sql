-- Script para debugar roles do usuário
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar o usuário específico
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- 2. Verificar TODOS os usuários
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Verificar roles do usuário específico
SELECT 
  ucr.id,
  ucr.user_id,
  ucr.role,
  ucr.cliente_id,
  c.nome as cliente_nome,
  ucr.created_at
FROM user_client_roles ucr
LEFT JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- 4. Verificar TODOS os roles
SELECT 
  ucr.id,
  ucr.user_id,
  ucr.role,
  ucr.cliente_id,
  c.nome as cliente_nome,
  u.email,
  ucr.created_at
FROM user_client_roles ucr
LEFT JOIN clientes c ON c.id = ucr.cliente_id
LEFT JOIN auth.users u ON u.id = ucr.user_id
ORDER BY ucr.created_at DESC;

-- 5. Verificar se existem clientes
SELECT id, nome, created_at FROM clientes ORDER BY created_at DESC;
