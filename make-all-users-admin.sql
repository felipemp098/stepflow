-- Script para tornar TODOS os usuários como admin
-- Execute este script no SQL Editor do Supabase

-- Adicionar todos os usuários como admin no primeiro cliente
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

-- Verificar resultado
SELECT 
  ucr.user_id,
  u.email,
  ucr.role,
  c.nome as cliente_nome
FROM user_client_roles ucr
JOIN auth.users u ON u.id = ucr.user_id
JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.role = 'admin'
ORDER BY ucr.created_at DESC;
