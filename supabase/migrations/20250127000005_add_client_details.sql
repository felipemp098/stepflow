-- Migration: Add Client Details
-- Description: Add additional fields to clientes table for complete client information
-- Date: 2025-01-27

-- Add new columns to clientes table
ALTER TABLE public.clientes 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_clientes_email ON public.clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON public.clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX IF NOT EXISTS idx_clientes_status ON public.clientes(status);
