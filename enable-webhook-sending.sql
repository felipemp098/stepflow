-- Script para Habilitar Envio Automático de Webhook
-- Execute este script no Supabase SQL Editor

-- 1. Remover trigger atual
DROP TRIGGER IF EXISTS trigger_prepare_client_webhook ON public.clientes;

-- 2. Atualizar função para enviar webhook via HTTP
CREATE OR REPLACE FUNCTION public.prepare_client_webhook_data()
RETURNS TRIGGER AS $$
DECLARE
  webhook_data JSONB;
  webhook_url TEXT := 'https://webhooks.adviser-pro.com.br/webhook/stepflow/create-user';
  response RECORD;
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
      'message', 'Trigger executado - enviando webhook',
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
  
  -- Tentar enviar webhook via HTTP
  BEGIN
    -- Usar pg_net se disponível
    PERFORM net.http_post(
      url := webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := webhook_data::text
    );
    
    -- Log de sucesso
    INSERT INTO public.webhook_logs (
      event_type,
      payload,
      status,
      created_at
    ) VALUES (
      'webhook_sent_success',
      webhook_data,
      'sent',
      NOW()
    );
    
  EXCEPTION WHEN OTHERS THEN
    -- Se pg_net não funcionar, usar http
    BEGIN
      SELECT * INTO response
      FROM http((
        'POST',
        webhook_url,
        ARRAY[http_header('Content-Type', 'application/json')],
        'application/json',
        webhook_data::text
      ));
      
      -- Log de sucesso com http
      INSERT INTO public.webhook_logs (
        event_type,
        payload,
        status,
        response_data,
        created_at
      ) VALUES (
        'webhook_sent_http',
        webhook_data,
        'sent',
        jsonb_build_object('status', response.status),
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
      'message', 'Trigger finalizado - webhook enviado',
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
  'Sistema atualizado:' as info,
  'Webhook será enviado automaticamente para a URL' as status;

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
  'Cliente Teste Webhook Enviado',
  'ativo',
  'teste@webhookenviado.com',
  '(11) 66666-6666',
  '11.666.666/0001-66',
  '666.666.666-66',
  'Rua Webhook Enviado, 666 - São Paulo/SP',
  '@webhookenviado',
  'Cliente criado para testar envio de webhook',
  auth.uid()
) RETURNING id, nome, created_at;

-- 6. Verificar logs de envio
SELECT 
  'Logs de envio de webhook:' as info,
  id,
  event_type,
  status,
  created_at,
  payload->'cliente'->>'nome' as cliente_nome,
  error_message
FROM public.webhook_logs
WHERE event_type IN ('webhook_sent_success', 'webhook_sent_http', 'webhook_send_error')
  AND created_at > NOW() - INTERVAL '2 minutes'
ORDER BY created_at DESC;

-- 7. Verificar todos os logs
SELECT 
  'Todos os logs gerados:' as info,
  id,
  event_type,
  status,
  created_at,
  payload->'message' as message,
  payload->'cliente'->>'nome' as cliente_nome
FROM public.webhook_logs
WHERE created_at > NOW() - INTERVAL '2 minutes'
ORDER BY created_at DESC;
