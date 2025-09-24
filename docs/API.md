# Stepflow API - Documentação

## Visão Geral

A API do Stepflow implementa um sistema de RBAC (Role-Based Access Control) com isolamento multi-tenant baseado no header `X-Client-Id`. Todas as rotas de dados exigem autenticação e validação de tenant.

## Autenticação

### Header Obrigatório

Todas as rotas multi-tenant exigem o header:

```
X-Client-Id: <uuid-do-cliente>
```

### Token de Autenticação

```
Authorization: Bearer <jwt-token>
```

## Sistema de Papéis (RBAC)

### Papéis Disponíveis

- **admin**: Acesso completo ao sistema, pode gerenciar clientes
- **cliente**: Acesso limitado ao próprio tenant, pode gerenciar contratos e alunos
- **aluno**: Acesso mínimo, apenas leitura de recursos próprios

### Matriz de Permissões

| Recurso | GET | POST/PUT | DELETE |
|---------|-----|----------|--------|
| Clientes | admin, cliente | admin | admin |
| Contratos | admin, cliente | admin, cliente | admin |
| Alunos | admin, cliente | admin, cliente | admin |
| Produtos/Ofertas/Jornadas/Passos | admin, cliente | admin, cliente | admin |
| Parcelas | admin, cliente | admin, cliente (update status) | admin |
| Dashboard | admin, cliente | — | — |

## Formato de Resposta

### Sucesso

```json
{
  "data": { ... },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2025-01-27T10:00:00.000Z"
  }
}
```

### Erro

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro",
    "details": { ... }
  },
  "meta": {
    "request_id": "req_123456789",
    "timestamp": "2025-01-27T10:00:00.000Z"
  }
}
```

## Códigos de Erro

### Validação de Tenant

- `TENANT_HEADER_REQUIRED` (400): Header X-Client-Id ausente
- `TENANT_HEADER_INVALID` (400): Formato UUID inválido
- `TENANT_FORBIDDEN` (403): Usuário sem acesso ao cliente

### RBAC

- `ROLE_FORBIDDEN` (403): Papel insuficiente para a operação

### Outros

- `NOT_FOUND` (404): Recurso não encontrado
- `VALIDATION_ERROR` (400): Dados inválidos
- `INTERNAL_ERROR` (500): Erro interno do servidor

## Endpoints

### Dashboard

#### GET /api/dash/alertas
Retorna alertas do dashboard.

**Permissões**: admin, cliente

**Resposta**:
```json
{
  "data": {
    "contratos_problematicos": [...],
    "parcelas_atrasadas": [...],
    "jornadas_problematicas": [...]
  }
}
```

#### GET /api/dash/pendencias
Retorna pendências do dashboard.

**Permissões**: admin, cliente

#### GET /api/dash/proximos-passos
Retorna próximos passos a serem executados.

**Permissões**: admin, cliente

#### GET /api/dash/agenda
Retorna agenda de eventos próximos.

**Permissões**: admin, cliente

#### GET /api/dash/contratos-recentes
Retorna contratos criados recentemente.

**Permissões**: admin, cliente

#### GET /api/dash/atividade
Retorna atividade recente do sistema.

**Permissões**: admin, cliente

#### GET /api/dash/resumo
Retorna resumo estatístico do dashboard.

**Permissões**: admin, cliente

### Clientes

#### GET /api/clientes
Lista todos os clientes.

**Permissões**: admin

**Resposta**:
```json
{
  "data": [
    {
      "id": "uuid",
      "nome": "Nome do Cliente",
      "status": "ativo",
      "created_at": "2025-01-27T10:00:00.000Z",
      "updated_at": "2025-01-27T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/clientes/:id
Busca um cliente por ID.

**Permissões**: admin

#### POST /api/clientes
Cria um novo cliente.

**Permissões**: admin

**Body**:
```json
{
  "nome": "Nome do Cliente",
  "status": "ativo"
}
```

#### PUT /api/clientes/:id
Atualiza um cliente.

**Permissões**: admin

#### DELETE /api/clientes/:id
Remove um cliente.

**Permissões**: admin

#### GET /api/clientes/:id/users
Lista usuários de um cliente.

**Permissões**: admin

### Contratos

#### GET /api/contratos
Lista contratos do cliente.

**Permissões**: admin, cliente

**Query Parameters**:
- `status` (opcional): Filtrar por status
- `limit` (opcional): Limite de resultados
- `offset` (opcional): Offset para paginação

**Resposta**:
```json
{
  "data": [
    {
      "id": "uuid",
      "cliente_id": "uuid",
      "nome": "Nome do Contrato",
      "status": "ativo",
      "valor_total": 999.90,
      "data_inicio": "2025-01-01",
      "data_fim": "2025-12-31",
      "created_at": "2025-01-27T10:00:00.000Z",
      "updated_at": "2025-01-27T10:00:00.000Z"
    }
  ]
}
```

#### GET /api/contratos/:id
Busca um contrato por ID.

**Permissões**: admin, cliente

#### POST /api/contratos
Cria um novo contrato.

**Permissões**: admin, cliente

**Body**:
```json
{
  "nome": "Nome do Contrato",
  "status": "ativo",
  "valor_total": 999.90,
  "data_inicio": "2025-01-01",
  "data_fim": "2025-12-31"
}
```

#### PUT /api/contratos/:id
Atualiza um contrato.

**Permissões**: admin, cliente

#### DELETE /api/contratos/:id
Remove um contrato.

**Permissões**: admin

#### GET /api/contratos/:id/alunos
Lista alunos vinculados ao contrato.

**Permissões**: admin, cliente

#### POST /api/contratos/:id/alunos/:alunoId
Vincula um aluno ao contrato.

**Permissões**: admin, cliente

#### DELETE /api/contratos/:id/alunos/:alunoId
Remove um aluno do contrato.

**Permissões**: admin, cliente

#### GET /api/contratos/:id/parcelas
Lista parcelas do contrato.

**Permissões**: admin, cliente

#### PUT /api/contratos/parcelas/:parcelaId/status
Atualiza status de uma parcela.

**Permissões**: admin, cliente

**Body**:
```json
{
  "status": "paga"
}
```

## Configurações Operacionais

### Variáveis de Ambiente

- `ADMIN_BYPASS` (true|false): Permite admin sem header X-Client-Id
- `TENANT_HEADER_NAME` (default: X-Client-Id): Nome do header de tenant
- `TIMEZONE_DB=UTC`: Padronização de timezone

### Exemplo de Configuração

```env
ADMIN_BYPASS=false
TENANT_HEADER_NAME=X-Client-Id
TIMEZONE_DB=UTC
```

## Logs Estruturados

Todos os logs seguem o formato JSON estruturado:

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

## Segurança

### Row Level Security (RLS)

Todas as tabelas multi-tenant têm RLS habilitado com políticas que:

1. Filtram dados pelo `cliente_id` do usuário
2. Respeitam as permissões de papel
3. Previnem vazamento de dados entre tenants

### Validação de Tenant

O middleware de tenant:

1. Valida formato UUID do header
2. Verifica existência do cliente
3. Confirma vínculo usuário-cliente
4. Determina papel do usuário no tenant

### Auditoria

Ações sensíveis são logadas para auditoria:

```json
{
  "action": "CREATE",
  "entity": "contrato",
  "entity_id": "uuid",
  "user_id": "uuid",
  "tenant_id": "uuid",
  "user_role": "cliente",
  "changes": { ... }
}
```

## Exemplos de Uso

### Frontend com React

```typescript
import { useApi } from '@/hooks/useApi';

function ContratosList() {
  const { get } = useApi();
  const [contratos, setContratos] = useState([]);

  useEffect(() => {
    const fetchContratos = async () => {
      const response = await get('/api/contratos');
      if (response.data) {
        setContratos(response.data);
      }
    };

    fetchContratos();
  }, []);

  return (
    <div>
      {contratos.map(contrato => (
        <div key={contrato.id}>{contrato.nome}</div>
      ))}
    </div>
  );
}
```

### Cliente HTTP Direto

```bash
curl -X GET "https://api.stepflow.com/api/contratos" \
  -H "X-Client-Id: 550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <jwt-token>"
```

## Troubleshooting

### Erro: TENANT_HEADER_REQUIRED

Verifique se o header `X-Client-Id` está presente na requisição.

### Erro: TENANT_FORBIDDEN

Verifique se:
1. O usuário tem vínculo com o cliente
2. O cliente está ativo
3. O UUID do cliente está correto

### Erro: ROLE_FORBIDDEN

Verifique se o usuário tem o papel necessário para a operação.

### Performance

Para otimizar performance:
1. Use paginação com `limit` e `offset`
2. Filtre por status quando possível
3. Monitore logs de latência
