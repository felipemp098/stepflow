-- Script para debugar qual usuário está logado
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar TODOS os usuários e seus últimos logins
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users 
ORDER BY last_sign_in_at DESC NULLS LAST;

-- 2. Verificar TODOS os roles existentes
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

-- 3. Verificar se o usuário específico tem roles
SELECT 
  ucr.id,
  ucr.user_id,
  ucr.role,
  ucr.cliente_id,
  c.nome as cliente_nome
FROM user_client_roles ucr
LEFT JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
