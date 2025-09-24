# 🧪 Guia de Validação - Sistema RBAC

## ✅ Migrações Aplicadas

Como você já aplicou as migrações, vamos validar se tudo está funcionando corretamente.

## 🚀 Passo a Passo para Validação

### 1. Criar Usuários de Teste

Execute o script SQL no Supabase SQL Editor:

```sql
-- Copie e cole o conteúdo do arquivo: scripts/create-test-users.sql
```

Ou execute no console do browser (após importar o script):

```javascript
// Importar o script de teste
import { TestSetup } from './src/lib/test-setup.ts';

// Executar setup completo
TestSetup.runAllTests();
```

### 2. Acessar a Página de Teste

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Acesse: `http://localhost:5173/test-rbac`

### 3. Testar Autenticação

1. **Faça login** com um dos usuários criados:
   - **Admin**: `admin@teste.com` / `admin123`
   - **Cliente**: `cliente@teste.com` / `cliente123`
   - **Aluno**: `aluno@teste.com` / `aluno123`

2. **Verifique** se o contexto de autenticação está funcionando:
   - Cliente selecionado automaticamente
   - Papel do usuário exibido
   - Lista de clientes disponíveis

### 4. Executar Testes Automatizados

Na página de teste, clique em **"Executar Testes"** e verifique:

#### ✅ Testes que devem passar:

1. **Autenticação**: Usuário autenticado com sucesso
2. **Clientes Disponíveis**: Pelo menos 1 cliente disponível
3. **Cliente Atual**: Cliente selecionado com papel correto
4. **Header X-Client-Id**: Requisição com header funcionando
5. **Permissões RBAC**: Acesso correto baseado no papel

#### ⚠️ Testes que podem gerar warning:

- **Isolamento Multi-tenant**: Se tiver apenas 1 cliente

### 5. Testar Manualmente

#### Teste de Permissões RBAC:

1. **Como Admin** (`admin@teste.com`):
   - ✅ Deve acessar `/api/contratos`
   - ✅ Deve acessar `/api/clientes`
   - ✅ Deve acessar `/api/dash/resumo`

2. **Como Cliente** (`cliente@teste.com`):
   - ✅ Deve acessar `/api/contratos`
   - ❌ NÃO deve acessar `/api/clientes`
   - ✅ Deve acessar `/api/dash/resumo`

3. **Como Aluno** (`aluno@teste.com`):
   - ❌ NÃO deve acessar `/api/contratos`
   - ❌ NÃO deve acessar `/api/clientes`
   - ❌ NÃO deve acessar `/api/dash/resumo`

#### Teste de Isolamento:

1. **Trocar de cliente** no seletor
2. **Verificar** se os dados mudam conforme o cliente
3. **Confirmar** que não há vazamento entre tenants

### 6. Verificar Logs

Abra o **DevTools** (F12) e verifique:

#### Console Logs:
```json
{
  "request_id": "req_123456789",
  "user_id": "uuid",
  "tenant_id": "uuid",
  "route": "/api/contratos",
  "method": "GET",
  "status": 200,
  "latency_ms": 150,
  "timestamp": "2025-01-27T10:00:00.000Z",
  "level": "info",
  "message": "Request completed"
}
```

#### Network Tab:
- Verificar se o header `X-Client-Id` está sendo enviado
- Verificar status codes das respostas
- Verificar formato das respostas JSON

### 7. Testar Casos de Erro

#### Sem Header X-Client-Id:
```bash
curl -X GET "http://localhost:5173/api/contratos" \
  -H "Authorization: Bearer <token>"
# Deve retornar: 400 TENANT_HEADER_REQUIRED
```

#### Header Inválido:
```bash
curl -X GET "http://localhost:5173/api/contratos" \
  -H "X-Client-Id: invalid-uuid" \
  -H "Authorization: Bearer <token>"
# Deve retornar: 400 TENANT_HEADER_INVALID
```

#### Sem Permissão:
```bash
curl -X GET "http://localhost:5173/api/clientes" \
  -H "X-Client-Id: <cliente-id>" \
  -H "Authorization: Bearer <aluno-token>"
# Deve retornar: 403 ROLE_FORBIDDEN
```

## 🔍 Checklist de Validação

- [ ] Migrações aplicadas sem erros
- [ ] Usuários de teste criados
- [ ] Login funcionando
- [ ] Cliente selecionado automaticamente
- [ ] Header X-Client-Id sendo enviado
- [ ] Permissões RBAC funcionando
- [ ] Isolamento multi-tenant ativo
- [ ] Logs estruturados aparecendo
- [ ] Casos de erro retornando códigos corretos
- [ ] Performance adequada (< 300ms)

## 🐛 Troubleshooting Comum

### "TENANT_HEADER_REQUIRED"
- **Causa**: Header X-Client-Id não está sendo enviado
- **Solução**: Verificar se o cliente está selecionado no frontend

### "TENANT_FORBIDDEN"
- **Causa**: Usuário não tem vínculo com o cliente
- **Solução**: Verificar tabela `user_client_roles`

### "ROLE_FORBIDDEN"
- **Causa**: Papel insuficiente para a operação
- **Solução**: Verificar matriz RBAC no código

### Dados não filtrados
- **Causa**: RLS pode não estar ativo
- **Solução**: Verificar se as políticas RLS foram aplicadas

### API não responde
- **Causa**: Router pode não estar configurado
- **Solução**: Verificar se as rotas estão definidas

## 📊 Métricas de Sucesso

### Performance:
- ✅ P95 < 300ms para GETs simples
- ✅ Logs estruturados funcionando
- ✅ Sem vazamento de dados entre tenants

### Segurança:
- ✅ RLS ativo em todas as tabelas
- ✅ Validação de tenant em todas as rotas
- ✅ Permissões RBAC funcionando
- ✅ Auditoria de ações sensíveis

### Funcionalidade:
- ✅ Seleção de cliente funcionando
- ✅ Header X-Client-Id automático
- ✅ Tratamento de erros padronizado
- ✅ API RESTful completa

## 🎉 Validação Completa

Quando todos os testes passarem, o sistema RBAC estará **100% funcional** e pronto para produção!

### Próximos Passos:
1. **Integrar** com o frontend existente
2. **Configurar** monitoramento de logs
3. **Implementar** automação de mensagens (próxima fase)
4. **Expandir** funcionalidades conforme necessário

---

**Sistema RBAC implementado com sucesso! 🚀**
