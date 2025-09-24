-- Migration: Seed Data for RBAC Testing
-- Description: Creates test data for multi-tenant RBAC system
-- Date: 2025-01-27

-- Insert test clients (tenants)
INSERT INTO public.clientes (id, nome, status) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Cliente A - Academia Fitness', 'ativo'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Cliente B - Escola Online', 'ativo');

-- Note: user_client_roles will be populated when users are created
-- For testing purposes, we'll create a test admin user in the application

-- Insert test products for Cliente A
INSERT INTO public.produtos (id, cliente_id, nome, descricao, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Plano Básico', 'Plano básico de treino', 'ativo'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Plano Premium', 'Plano premium com personal trainer', 'ativo');

-- Insert test products for Cliente B
INSERT INTO public.produtos (id, cliente_id, nome, descricao, status) VALUES
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Curso Básico', 'Curso básico de programação', 'ativo'),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Curso Avançado', 'Curso avançado com projetos', 'ativo');

-- Insert test offers for Cliente A
INSERT INTO public.ofertas (id, cliente_id, produto_id, nome, descricao, preco, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Oferta Plano Básico', 'Oferta especial plano básico', 99.90, 'ativo'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Oferta Plano Premium', 'Oferta especial plano premium', 199.90, 'ativo');

-- Insert test offers for Cliente B
INSERT INTO public.ofertas (id, cliente_id, produto_id, nome, descricao, preco, status) VALUES
  ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'Oferta Curso Básico', 'Oferta especial curso básico', 299.90, 'ativo'),
  ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Oferta Curso Avançado', 'Oferta especial curso avançado', 599.90, 'ativo');

-- Insert test journeys for Cliente A
INSERT INTO public.jornadas (id, cliente_id, produto_id, nome, descricao, ordem, status) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Onboarding', 'Jornada de boas-vindas', 1, 'ativo'),
  ('880e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'Treino Personalizado', 'Jornada de treino personalizado', 1, 'ativo');

-- Insert test journeys for Cliente B
INSERT INTO public.jornadas (id, cliente_id, produto_id, nome, descricao, ordem, status) VALUES
  ('880e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'Introdução', 'Jornada de introdução ao curso', 1, 'ativo'),
  ('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'Projetos Práticos', 'Jornada de projetos práticos', 1, 'ativo');

-- Insert test steps for Cliente A
INSERT INTO public.passos (id, cliente_id, jornada_id, nome, descricao, tipo, conteudo, ordem, status) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Email de Boas-vindas', 'Envio de email de boas-vindas', 'email', '{"subject": "Bem-vindo!", "body": "Obrigado por se inscrever!"}', 1, 'ativo'),
  ('990e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '880e8400-e29b-41d4-a716-446655440001', 'Agendamento de Avaliação', 'Agendamento da avaliação física', 'webhook', '{"url": "https://api.example.com/agendar", "method": "POST"}', 2, 'ativo');

-- Insert test steps for Cliente B
INSERT INTO public.passos (id, cliente_id, jornada_id, nome, descricao, tipo, conteudo, ordem, status) VALUES
  ('990e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 'Email de Acesso', 'Envio de credenciais de acesso', 'email', '{"subject": "Suas credenciais", "body": "Aqui estão suas credenciais de acesso!"}', 1, 'ativo'),
  ('990e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '880e8400-e29b-41d4-a716-446655440003', 'Primeira Aula', 'Notificação da primeira aula', 'push', '{"title": "Primeira Aula", "body": "Sua primeira aula está disponível!"}', 2, 'ativo');

-- Insert test students for Cliente A
INSERT INTO public.alunos (id, cliente_id, nome, email, status) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'João Silva', 'joao@example.com', 'ativo'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Maria Santos', 'maria@example.com', 'ativo');

-- Insert test students for Cliente B
INSERT INTO public.alunos (id, cliente_id, nome, email, status) VALUES
  ('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Pedro Costa', 'pedro@example.com', 'ativo'),
  ('aa0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Ana Oliveira', 'ana@example.com', 'ativo');

-- Insert test contracts for Cliente A
INSERT INTO public.contratos (id, cliente_id, nome, status, valor_total, data_inicio, data_fim) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Contrato João Silva', 'ativo', 99.90, '2025-01-01', '2025-12-31'),
  ('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Contrato Maria Santos', 'ativo', 199.90, '2025-01-01', '2025-12-31');

-- Insert test contracts for Cliente B
INSERT INTO public.contratos (id, cliente_id, nome, status, valor_total, data_inicio, data_fim) VALUES
  ('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'Contrato Pedro Costa', 'ativo', 299.90, '2025-01-01', '2025-12-31'),
  ('bb0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Contrato Ana Oliveira', 'ativo', 599.90, '2025-01-01', '2025-12-31');

-- Insert contract-student relationships
INSERT INTO public.contrato_alunos (id, cliente_id, contrato_id, aluno_id) VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001'),
  ('cc0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002'),
  ('cc0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440003', 'aa0e8400-e29b-41d4-a716-446655440003'),
  ('cc0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440004', 'aa0e8400-e29b-41d4-a716-446655440004');

-- Insert test installments for Cliente A
INSERT INTO public.parcelas (id, cliente_id, contrato_id, valor, data_vencimento, status) VALUES
  ('dd0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 99.90, '2025-01-31', 'pendente'),
  ('dd0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440002', 199.90, '2025-01-31', 'pendente');

-- Insert test installments for Cliente B
INSERT INTO public.parcelas (id, cliente_id, contrato_id, valor, data_vencimento, status) VALUES
  ('dd0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440003', 299.90, '2025-01-31', 'pendente'),
  ('dd0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440004', 599.90, '2025-01-31', 'pendente');
