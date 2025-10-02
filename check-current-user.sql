-- Script para verificar usuário atual e adicionar como admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar todos os usuários logados recentemente
SELECT 
  id,
  email,
  last_sign_in_at,
  created_at
FROM auth.users 
ORDER BY last_sign_in_at DESC NULLS LAST
LIMIT 10;

-- 2. Verificar roles de todos os usuários
SELECT 
  ucr.user_id,
  u.email,
  ucr.role,
  c.nome as cliente_nome
FROM user_client_roles ucr
JOIN auth.users u ON u.id = ucr.user_id
JOIN clientes c ON c.id = ucr.cliente_id
ORDER BY ucr.created_at DESC;

-- 3. Adicionar TODOS os usuários como admin (se necessário)
-- Descomente as linhas abaixo se quiser adicionar todos os usuários como admin

/*
INSERT INTO user_client_roles (user_id, cliente_id, role)
SELECT 
  u.id,
  (SELECT id FROM clientes LIMIT 1),
  'admin'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_client_roles ucr 
  WHERE ucr.user_id = u.id AND ucr.role = 'admin'
);
*/
