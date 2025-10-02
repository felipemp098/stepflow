# Guia de Execução do Sistema de Criação de Cliente e Usuário

## 🚀 Passos para Implementar o Sistema

### 1. Execute os Scripts SQL (em ordem)

Execute os seguintes scripts no **Supabase SQL Editor**:

#### 1.1. Script Principal
```sql
-- Execute: create-client-user-system.sql
-- Este script cria as funções básicas e o trigger
```

#### 1.2. Script de Webhook
```sql
-- Execute: webhook-endpoint-setup.sql
-- Este script configura o processamento de webhooks
```

#### 1.3. Script de Teste
```sql
-- Execute: test-complete-system.sql
-- Este script testa todo o sistema
```

### 2. Deploy da Edge Function

#### 2.1. Criar a Edge Function
```bash
# No terminal, dentro da pasta do projeto
supabase functions deploy create-client-user
```

#### 2.2. Configurar Variáveis de Ambiente
No Supabase Dashboard > Edge Functions > create-client-user:
- Adicione as variáveis de ambiente necessárias

### 3. Testar o Sistema

#### 3.1. Teste via Frontend
1. Acesse a página de criação de cliente
2. Preencha os dados do cliente
3. Clique em "Criar Cliente"
4. Verifique se não há erros no console

#### 3.2. Teste via SQL
Execute o script `test-complete-system-final.sql` para verificar:
- ✅ Cliente criado
- ✅ Logs de webhook gerados
- ✅ Dados preparados para criação de usuário

### 4. Verificar Logs

#### 4.1. Logs de Webhook
```sql
SELECT 
  id,
  event_type,
  status,
  created_at,
  payload->'cliente'->>'nome' as cliente_nome
FROM public.webhook_logs
WHERE event_type = 'client_created'
ORDER BY created_at DESC
LIMIT 10;
```

#### 4.2. Logs de Usuário
```sql
SELECT 
  id,
  event_type,
  status,
  created_at,
  payload->'usuario_cliente'->>'email' as usuario_email
FROM public.webhook_logs
WHERE event_type = 'user_created_for_client'
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Próximos Passos

#### 5.1. Integração com API Externa
- Configure o webhook para enviar dados para sua API externa
- URL configurada: `https://webhooks.adviser-pro.com.br/webhook/stepflow/create-user`

#### 5.2. Criação de Usuário via Edge Function
- A Edge Function `create-client-user` está pronta
- Ela criará o usuário no Supabase Auth
- E criará o vínculo na tabela `user_client_roles`

#### 5.3. Notificações por Email
- Configure um serviço de email (SendGrid, Resend, etc.)
- Atualize a função `send_client_creation_notification`

## 🔧 Solução de Problemas

### Erro: "column app_metadata does not exist"
- ✅ **Resolvido**: O script `create-client-user-system.sql` não usa essa coluna

### Erro: "syntax error at or near ORDER"
- ✅ **Resolvido**: O script `webhook-endpoint-setup.sql` foi corrigido

### Clientes não aparecem no select
- Execute o script `fix-rls-policies.sql`
- Verifique se o usuário tem vínculos na tabela `user_client_roles`

## 📊 Estrutura do Sistema

### Tabelas Envolvidas
- `clientes`: Dados do cliente
- `user_client_roles`: Vínculos entre usuários e clientes
- `webhook_logs`: Logs de webhooks e eventos

### Funções Principais
- `create_client_user()`: Trigger que executa ao criar cliente
- `create_user_for_client()`: Cria usuário para cliente existente
- `process_client_created_webhook()`: Processa webhook localmente

### Edge Functions
- `create-client-user`: Cria usuário no Supabase Auth

## 🎯 Resultado Esperado

Após executar todos os scripts:

1. **Ao criar um cliente**:
   - Cliente é inserido na tabela `clientes`
   - Trigger executa automaticamente
   - Webhook é preparado com dados do cliente
   - Logs são gerados
   - Dados são enviados para API externa

2. **Usuário cliente**:
   - Pode ser criado via Edge Function
   - Vínculo é criado na tabela `user_client_roles`
   - Email e senha são gerados automaticamente

3. **Logs e Monitoramento**:
   - Todos os eventos são logados
   - Status de cada operação é rastreado
   - Dados são enviados para webhook externo

## ✅ Checklist de Execução

- [ ] Executar `create-client-user-system.sql`
- [ ] Executar `webhook-endpoint-setup.sql`
- [ ] Executar `test-complete-system.sql`
- [ ] Deploy da Edge Function `create-client-user`
- [ ] Testar criação de cliente via frontend
- [ ] Verificar logs de webhook
- [ ] Configurar webhook externo
- [ ] Testar criação de usuário via Edge Function

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs na tabela `webhook_logs`
2. Execute o script de teste para diagnosticar
3. Verifique se todas as funções foram criadas corretamente
4. Confirme se o trigger está ativo
