-- Script para Habilitar Envio de Webhook via Edge Function
-- Execute este script no Supabase SQL Editor

-- 1. Remover trigger atual
DROP TRIGGER IF EXISTS trigger_prepare_client_webhook ON public.clientes;

-- 2. Criar função que chama Edge Function
CREATE OR REPLACE FUNCTION public.prepare_client_webhook_data()
RETURNS TRIGGER AS $$
DECLARE
  webhook_data JSONB;
  webhook_url TEXT := 'https://webhooks.adviser-pro.com.br/webhook/stepflow/create-user';
  edge_function_url TEXT;
  response JSONB;
BEGIN
  -- Log de entrada
  INSERT INTO public.webhook_logs (
    event_type,
    payload,
    status,
    created_at
  ) VALUES (
    'trigger_executed',
    jsonb_build_object(
      'message', 'Trigger executado - chamando Edge Function',
      'cliente_id', NEW.id,
      'cliente_nome', NEW.nome
    ),
    'success',
    NOW()
  );
  
  -- Preparar dados para webhook
  webhook_data := jsonb_build_object(
    'event_type', 'client_created',
    'timestamp', NOW(),
    'cliente', jsonb_build_object(
      'id', NEW.id,
      'nome', NEW.nome,
      'status', NEW.status,
      'email', NEW.email,
      'telefone', NEW.telefone,
      'cnpj', NEW.cnpj,
      'cpf', NEW.cpf,
      'endereco', NEW.endereco,
      'instagram', NEW.instagram,
      'observacoes', NEW.observacoes,
      'created_at', NEW.created_at,
      'created_by', NEW.created_by
    ),
    'webhook_url', webhook_url,
    'action_required', 'create_user_via_n8n'
  );
  
  -- URL da Edge Function
  edge_function_url := 'https://irwreedairelbbekrvyq.supabase.co/functions/v1/send-webhook';
  
  -- Chamar Edge Function
  BEGIN
    SELECT content::jsonb INTO response
    FROM http((
      'POST',
      edge_function_url,
      ARRAY[
        http_header('Content-Type', 'application/json'),
        http_header('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd3JlZWRhaXJlbGJia2VydnlxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ0NzQ5MCwiZXhwIjoyMDUxMDIzNDkwfQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ')
      ],
      'application/json',
      webhook_data::text
    ));
    
    -- Log de sucesso
    INSERT INTO public.webhook_logs (
      event_type,
      payload,
      status,
      response_data,
      created_at
    ) VALUES (
      'webhook_sent_via_edge_function',
      webhook_data,
      'sent',
      response,
      NOW()
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Log de erro
    INSERT INTO public.webhook_logs (
      event_type,
      payload,
      status,
      error_message,
      created_at
    ) VALUES (
      'webhook_send_error',
      webhook_data,
      'error',
      SQLERRM,
      NOW()
    );
  END;
  
  -- Log de saída
  INSERT INTO public.webhook_logs (
    event_type,
    payload,
    status,
    created_at
  ) VALUES (
    'trigger_completed',
    jsonb_build_object(
      'message', 'Trigger finalizado - Edge Function chamada',
      'cliente_id', NEW.id,
      'webhook_url', webhook_url
    ),
    'success',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar trigger
CREATE TRIGGER trigger_prepare_client_webhook
  AFTER INSERT ON public.clientes
  FOR EACH ROW
  EXECUTE FUNCTION public.prepare_client_webhook_data();

-- 4. Verificar configuração
SELECT 
  'Sistema configurado:' as info,
  'Webhook será enviado via Edge Function' as status;

-- 5. Testar criação de cliente
INSERT INTO public.clientes (
  nome,
  status,
  email,
  telefone,
  cnpj,
  cpf,
  endereco,
  instagram,
  observacoes,
  created_by
) VALUES (
  'Cliente Teste Edge Function',
  'ativo',
  'teste@edgefunction.com',
  '(11) 77777-7777',
  '11.777.777/0001-77',
  '777.777.777-77',
  'Rua Edge Function, 777 - São Paulo/SP',
  '@edgefunction',
  'Cliente criado para testar Edge Function',
  auth.uid()
) RETURNING id, nome, created_at;

-- 6. Verificar logs
SELECT 
  'Logs de webhook:' as info,
  id,
  event_type,
  status,
  created_at,
  payload->'cliente'->>'nome' as cliente_nome,
  response_data->>'success' as success
FROM public.webhook_logs
WHERE event_type IN ('webhook_sent_via_edge_function', 'webhook_send_error')
  AND created_at > NOW() - INTERVAL '2 minutes'
ORDER BY created_at DESC;
