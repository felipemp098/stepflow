-- Script para verificar configurações do Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar configurações de auth (usando tabelas disponíveis)
SELECT 
  'auth.users' as tabela,
  count(*) as total_usuarios
FROM auth.users;

-- Verificar se há usuários confirmados
SELECT 
  'usuarios_confirmados' as tipo,
  count(*) as total
FROM auth.users 
WHERE email_confirmed_at IS NOT NULL;

-- 2. Verificar se há usuários com o mesmo email
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'henriquetoledooficial@henriquetoledooficial.com.br';

-- 3. Verificar configurações de RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'auth' 
AND tablename = 'users';

-- 4. Verificar se a Service Role Key tem permissões
SELECT 
  current_user,
  session_user,
  current_database();
