-- Script simples para adicionar usuário como admin
-- Execute este script no SQL Editor do Supabase

-- Adicionar usuário como admin no primeiro cliente disponível
INSERT INTO user_client_roles (user_id, cliente_id, role)
VALUES (
  'd3426630-0c63-4ea1-ac5c-09f2da108559',
  (SELECT id FROM clientes LIMIT 1),
  'admin'
)
ON CONFLICT (user_id, cliente_id) 
DO UPDATE SET role = 'admin';

-- Verificar se foi criado
SELECT 
  ucr.role,
  c.nome as cliente_nome
FROM user_client_roles ucr
JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
