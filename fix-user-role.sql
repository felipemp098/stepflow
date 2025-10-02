-- Script para corrigir o role do usuário
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se existem clientes
SELECT id, nome FROM clientes;

-- 2. Adicionar o usuário como admin no primeiro cliente
INSERT INTO user_client_roles (user_id, cliente_id, role)
VALUES (
  'd3426630-0c63-4ea1-ac5c-09f2da108559',
  (SELECT id FROM clientes LIMIT 1),
  'admin'
);

-- 3. Verificar se foi criado
SELECT 
  ucr.id,
  ucr.user_id,
  ucr.role,
  ucr.cliente_id,
  c.nome as cliente_nome,
  ucr.created_at
FROM user_client_roles ucr
JOIN clientes c ON c.id = ucr.cliente_id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
