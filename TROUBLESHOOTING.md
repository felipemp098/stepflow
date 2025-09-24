# 🐛 Troubleshooting - Carregamento Infinito

## 🔍 Problema Identificado

O carregamento infinito geralmente indica um erro no contexto de autenticação ou na busca dos dados do usuário.

## 🛠️ Soluções Implementadas

### 1. ✅ Melhorias no AuthContext

- **Logs detalhados** para identificar onde está travando
- **Tratamento de erros** mais robusto
- **Controle de loading** melhorado
- **Prevenção de memory leaks**

### 2. ✅ Componente de Debug

Adicionei um componente de debug na página de teste para visualizar o estado atual.

## 🚀 Como Diagnosticar

### Passo 1: Abrir DevTools

1. **Pressione F12** ou **Ctrl+Shift+I**
2. **Vá para a aba Console**
3. **Acesse** `http://localhost:5173/test-rbac`

### Passo 2: Verificar Logs

Procure por estas mensagens no console:

```
🔍 Sessão existente: fmedeiros8570@gmail.com
👤 Sessão encontrada, buscando dados...
🔍 Buscando dados do usuário: d3426630-0c63-4ea1-ac5c-09f2da108559
✅ Papéis encontrados: [...]
✅ Clientes únicos: [...]
✅ Definindo cliente atual: {...}
```

### Passo 3: Identificar o Problema

#### ❌ **Se não aparecer nenhum log:**
- Problema na inicialização do Supabase
- Verificar se as variáveis de ambiente estão corretas

#### ❌ **Se parar em "Sessão encontrada":**
- Problema na função `fetchUserData`
- Verificar se as tabelas existem

#### ❌ **Se parar em "Buscando dados do usuário":**
- Problema na consulta SQL
- Verificar se os vínculos existem

#### ❌ **Se aparecer erro de RLS:**
- Políticas RLS bloqueando a consulta
- Usuário não tem permissão

## 🔧 Soluções por Problema

### Problema 1: Erro de RLS (Row Level Security)

**Sintomas:**
```
❌ Erro ao buscar papéis do usuário: {code: '42501', message: 'new row violates row-level security policy'}
```

**Solução:**
```sql
-- Temporariamente desabilitar RLS para debug
ALTER TABLE public.user_client_roles DISABLE ROW LEVEL SECURITY;

-- Testar a consulta
SELECT * FROM public.user_client_roles WHERE user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';

-- Reabilitar RLS
ALTER TABLE public.user_client_roles ENABLE ROW LEVEL SECURITY;
```

### Problema 2: Usuário não encontrado

**Sintomas:**
```
❌ Erro ao buscar papéis do usuário: {code: 'PGRST116', message: 'The result contains 0 rows'}
```

**Solução:**
```sql
-- Executar o script de vinculação novamente
-- scripts/link-existing-admin.sql
```

### Problema 3: Tabelas não existem

**Sintomas:**
```
❌ Erro ao buscar papéis do usuário: {code: '42P01', message: 'relation "public.user_client_roles" does not exist'}
```

**Solução:**
```bash
# Aplicar migrações novamente
supabase db push
```

### Problema 4: Permissões insuficientes

**Sintomas:**
```
❌ Erro ao obter sessão: {code: 'PGRST301', message: 'JWT expired'}
```

**Solução:**
1. **Fazer logout** e **login novamente**
2. **Verificar** se o token não expirou

## 🧪 Teste Manual

### 1. Verificar Dados no Banco

Execute no **Supabase SQL Editor**:
```sql
-- Copie o conteúdo de: scripts/debug-user-data.sql
```

### 2. Testar Consulta Manual

```sql
-- Testar a consulta que o frontend faz
SELECT 
  ucr.*,
  c.*
FROM public.user_client_roles ucr
JOIN public.clientes c ON ucr.cliente_id = c.id
WHERE ucr.user_id = 'd3426630-0c63-4ea1-ac5c-09f2da108559';
```

### 3. Verificar Políticas RLS

```sql
-- Ver políticas ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_client_roles', 'clientes');
```

## 🔄 Solução Rápida

Se nada funcionar, execute esta sequência:

### 1. Limpar Estado
```javascript
// No console do browser
localStorage.clear();
sessionStorage.clear();
```

### 2. Recriar Vínculos
```sql
-- Executar novamente
-- scripts/link-existing-admin.sql
```

### 3. Fazer Login Novamente
- **Logout** completo
- **Login** com `fmedeiros8570@gmail.com`
- **Acessar** `/test-rbac`

## 📊 Componente de Debug

Na página de teste, você verá:

- ✅ **Estado de loading**
- ✅ **Status da autenticação**
- ✅ **Clientes disponíveis**
- ✅ **Cliente atual selecionado**
- ✅ **Papéis do usuário**
- ✅ **Botões para verificar dados**

## 🎯 Próximos Passos

1. **Abrir DevTools** e verificar logs
2. **Executar** `scripts/debug-user-data.sql`
3. **Verificar** se os vínculos existem
4. **Testar** consulta manual
5. **Usar** componente de debug

## 📞 Informações para Debug

Quando reportar o problema, inclua:

1. **Logs do console** (F12 → Console)
2. **Resultado** do script `debug-user-data.sql`
3. **Estado** mostrado no componente de debug
4. **Erros** específicos encontrados

---

**Com essas ferramentas, conseguiremos identificar e resolver o problema rapidamente! 🔧**
