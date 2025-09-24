# 🔧 Configuração do Seu Usuário Admin

## ✅ Situação Atual

Você já tem um usuário administrador:
- **Email**: `fmedeiros8570@gmail.com`
- **ID**: `d3426630-0c63-4ea1-ac5c-09f2da108559`
- **Status**: Admin existente

## 🚀 Passo a Passo para Configurar

### 1. Executar Script de Vinculação

Execute este script no **Supabase SQL Editor**:

```sql
-- Copie e cole o conteúdo do arquivo: scripts/link-existing-admin.sql
```

Este script irá:
- ✅ Vincular seu usuário aos 2 clientes (Academia Fitness e Escola Online)
- ✅ Definir papel de admin para ambos os clientes
- ✅ Mostrar confirmação dos vínculos criados

### 2. Verificar Configuração

Após executar o script, você deve ver algo como:

```
email                          | cliente_nome              | role  | created_at
fmedeiros8570@gmail.com        | Cliente A - Academia...   | admin | 2025-01-27...
fmedeiros8570@gmail.com        | Cliente B - Escola...     | admin | 2025-01-27...
```

### 3. Testar o Sistema

1. **Faça login** com seu email: `fmedeiros8570@gmail.com`
2. **Acesse**: `http://localhost:5173/test-rbac`
3. **Verifique** se:
   - ✅ Seu email aparece como "Admin Principal"
   - ✅ 2 clientes estão disponíveis no seletor
   - ✅ Você pode trocar entre os clientes
   - ✅ Seu papel é "admin" em ambos

### 4. Executar Testes

Na página de teste, clique em **"Executar Testes"** e verifique:

#### ✅ Testes que devem passar:

1. **Autenticação**: `fmedeiros8570@gmail.com` autenticado
2. **Clientes Disponíveis**: 2 clientes (Academia Fitness + Escola Online)
3. **Cliente Atual**: Cliente selecionado com papel "admin"
4. **Header X-Client-Id**: Requisição funcionando
5. **Permissões RBAC**: Acesso total como admin

#### 🔄 Teste de Isolamento:

1. **Selecione "Cliente A - Academia Fitness"**
2. **Execute os testes** - deve mostrar dados da academia
3. **Troque para "Cliente B - Escola Online"**
4. **Execute novamente** - deve mostrar dados da escola
5. **Verifique** se os dados são diferentes entre os clientes

### 5. Criar Usuários Adicionais (Opcional)

Se quiser testar outros papéis, execute:

```sql
-- Copie o conteúdo de: scripts/setup-existing-admin.sql
```

Isso criará:
- **Cliente**: `cliente@teste.com` / `cliente123` (papel cliente)
- **Aluno**: `aluno@teste.com` / `aluno123` (papel aluno)

## 🎯 O que Esperar

### Como Admin (`fmedeiros8570@gmail.com`):

#### ✅ **Permissões Totais**:
- Acesso a `/api/clientes` (gerenciar clientes)
- Acesso a `/api/contratos` (gerenciar contratos)
- Acesso a `/api/dash/*` (dashboard completo)
- Criação, edição e exclusão em todos os recursos

#### 🔄 **Isolamento Multi-tenant**:
- **Cliente A**: Vê apenas dados da Academia Fitness
- **Cliente B**: Vê apenas dados da Escola Online
- **Troca dinâmica**: Muda dados conforme cliente selecionado

#### 📊 **Logs Estruturados**:
```json
{
  "request_id": "req_123456789",
  "user_id": "d3426630-0c63-4ea1-ac5c-09f2da108559",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "route": "/api/contratos",
  "method": "GET",
  "status": 200,
  "latency_ms": 150,
  "timestamp": "2025-01-27T10:00:00.000Z",
  "level": "info",
  "message": "Request completed"
}
```

## 🔍 Validação Final

### Checklist de Sucesso:

- [ ] Script executado sem erros
- [ ] Login com `fmedeiros8570@gmail.com` funcionando
- [ ] 2 clientes aparecendo no seletor
- [ ] Papel "admin" em ambos os clientes
- [ ] Testes automatizados passando
- [ ] Dados isolados por cliente
- [ ] Logs estruturados aparecendo
- [ ] Performance adequada

### Comportamento Esperado:

1. **Seleção de Cliente A**: Dados da Academia Fitness
2. **Seleção de Cliente B**: Dados da Escola Online
3. **Permissões**: Acesso total como admin
4. **Header**: X-Client-Id automático
5. **Logs**: JSON estruturado no console

## 🚨 Troubleshooting

### "Nenhum cliente disponível"
- **Causa**: Vínculos não foram criados
- **Solução**: Executar `scripts/link-existing-admin.sql`

### "Papel não definido"
- **Causa**: user_client_roles não configurado
- **Solução**: Verificar se o script foi executado corretamente

### "Dados não isolados"
- **Causa**: RLS pode não estar ativo
- **Solução**: Verificar se as migrações foram aplicadas

## 🎉 Sucesso!

Quando tudo estiver funcionando, você terá:

- ✅ **Admin principal** configurado
- ✅ **2 clientes** para teste
- ✅ **Isolamento multi-tenant** ativo
- ✅ **RBAC** funcionando
- ✅ **Sistema pronto** para produção

**Seu sistema RBAC está configurado e pronto para uso! 🚀**
