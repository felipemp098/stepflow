-- Script para adicionar usuário como admin
-- Execute este script no SQL Editor do Supabase

-- Verificar se o usuário existe
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- Verificar se já tem roles
SELECT 
  ucr.id,
  ucr.role,
  c.nome as cliente_nome,
  c.id as cliente_id
FROM user_client_roles ucr
JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- Buscar primeiro cliente disponível
SELECT id, nome FROM clientes LIMIT 1;

-- Adicionar usuário como admin no primeiro cliente
-- (Substitua 'CLIENTE_ID_AQUI' pelo ID do cliente retornado na query acima)
INSERT INTO user_client_roles (user_id, cliente_id, role)
VALUES (
  'd3426630-0c63-4ea1-ac5c-09f2da108559',
  (SELECT id FROM clientes LIMIT 1),
  'admin'
);

-- Verificar se foi criado com sucesso
SELECT 
  ucr.id,
  ucr.role,
  c.nome as cliente_nome,
  c.id as cliente_id,
  ucr.created_at
FROM user_client_roles ucr
JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
