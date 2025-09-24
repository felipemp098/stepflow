import { TenantMiddleware, TenantContext } from '@/lib/middleware/tenant';
import { Logger } from '@/lib/logging/logger';
import { 
  createTenantErrorResponse,
  createGenericErrorResponse,
  ApiResponse 
} from '@/lib/api/response';

import { ClientesHandler } from './handlers/clientes';
import { ContratosHandler } from './handlers/contratos';
import { DashboardHandler } from './handlers/dashboard';

/**
 * Router principal da API com validação de tenant e RBAC
 */
export class ApiRouter {
  private logger = Logger.createRequestLogger();

  /**
   * Processa uma requisição HTTP
   */
  async handleRequest(
    request: Request,
    userId: string
  ): Promise<Response> {
    const startTime = Date.now();
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    try {
      // Validar tenant e obter contexto
      const tenantValidation = await TenantMiddleware.validateRequest(
        request.headers,
        userId,
        this.requiresAdminAccess(path, method)
      );

      if (!tenantValidation.success) {
        const response = createTenantErrorResponse(
          tenantValidation.error!.code,
          tenantValidation.error!.message,
          tenantValidation.error!.details,
          this.logger.requestId
        );

        return new Response(JSON.stringify(response), {
          status: this.getHttpStatus(tenantValidation.error!.code),
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const context = tenantValidation.context!;
      const latency = Date.now() - startTime;

      // Log da requisição bem-sucedida
      this.logger.log(context, path, method, 200);

      // Roteamento para handlers específicos
      const response = await this.routeRequest(path, method, context, request);

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      const latency = Date.now() - startTime;
      
      // Log do erro
      if (error instanceof Error) {
        Logger.logError(
          { userId, tenantId: '', userRole: null },
          path,
          method,
          error,
          this.logger.requestId
        );
      }

      const response = createGenericErrorResponse(
        error instanceof Error ? error.message : 'Erro interno do servidor',
        undefined,
        this.logger.requestId
      );

      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  /**
   * Determina se a rota requer acesso de admin
   */
  private requiresAdminAccess(path: string, method: string): boolean {
    const adminPaths = [
      '/api/clientes',
      '/api/users'
    ];

    const adminMethods = ['POST', 'PUT', 'DELETE'];

    return adminPaths.some(adminPath => path.startsWith(adminPath)) ||
           adminMethods.includes(method);
  }

  /**
   * Converte código de erro para status HTTP
   */
  private getHttpStatus(errorCode: string): number {
    switch (errorCode) {
      case 'TENANT_HEADER_REQUIRED':
      case 'TENANT_HEADER_INVALID':
        return 400;
      case 'TENANT_FORBIDDEN':
      case 'ROLE_FORBIDDEN':
        return 403;
      case 'NOT_FOUND':
        return 404;
      default:
        return 500;
    }
  }

  /**
   * Roteia a requisição para o handler apropriado
   */
  private async routeRequest(
    path: string,
    method: string,
    context: TenantContext,
    request: Request
  ): Promise<ApiResponse> {
    const pathParts = path.split('/').filter(Boolean);
    
    // Rota /api/clientes
    if (pathParts[0] === 'api' && pathParts[1] === 'clientes') {
      const handler = new ClientesHandler(context, this.logger.requestId);
      
      if (pathParts.length === 2) {
        // GET /api/clientes
        if (method === 'GET') {
          return handler.list();
        }
        // POST /api/clientes
        if (method === 'POST') {
          const body = await request.json();
          return handler.create(body);
        }
      } else if (pathParts.length === 3) {
        const id = pathParts[2];
        
        // GET /api/clientes/:id
        if (method === 'GET') {
          return handler.getById(id);
        }
        // PUT /api/clientes/:id
        if (method === 'PUT') {
          const body = await request.json();
          return handler.update(id, body);
        }
        // DELETE /api/clientes/:id
        if (method === 'DELETE') {
          return handler.delete(id);
        }
      } else if (pathParts.length === 4 && pathParts[3] === 'users') {
        // GET /api/clientes/:id/users
        if (method === 'GET') {
          const id = pathParts[2];
          return handler.getUsers(id);
        }
      }
    }

    // Rota /api/contratos
    if (pathParts[0] === 'api' && pathParts[1] === 'contratos') {
      const handler = new ContratosHandler(context, this.logger.requestId);
      
      if (pathParts.length === 2) {
        // GET /api/contratos
        if (method === 'GET') {
          const url = new URL(request.url);
          const status = url.searchParams.get('status');
          const limit = url.searchParams.get('limit');
          const offset = url.searchParams.get('offset');
          
          return handler.list({
            status: status || undefined,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
          });
        }
        // POST /api/contratos
        if (method === 'POST') {
          const body = await request.json();
          return handler.create(body);
        }
      } else if (pathParts.length === 3) {
        const id = pathParts[2];
        
        // GET /api/contratos/:id
        if (method === 'GET') {
          return handler.getById(id);
        }
        // PUT /api/contratos/:id
        if (method === 'PUT') {
          const body = await request.json();
          return handler.update(id, body);
        }
        // DELETE /api/contratos/:id
        if (method === 'DELETE') {
          return handler.delete(id);
        }
      } else if (pathParts.length === 4) {
        const contratoId = pathParts[2];
        const action = pathParts[3];
        
        // GET /api/contratos/:id/alunos
        if (action === 'alunos' && method === 'GET') {
          return handler.getAlunos(contratoId);
        }
        // GET /api/contratos/:id/parcelas
        if (action === 'parcelas' && method === 'GET') {
          return handler.getParcelas(contratoId);
        }
      } else if (pathParts.length === 5) {
        const contratoId = pathParts[2];
        const action = pathParts[3];
        const param = pathParts[4];
        
        // POST /api/contratos/:id/alunos/:alunoId
        if (action === 'alunos' && method === 'POST') {
          return handler.addAluno(contratoId, param);
        }
        // DELETE /api/contratos/:id/alunos/:alunoId
        if (action === 'alunos' && method === 'DELETE') {
          return handler.removeAluno(contratoId, param);
        }
        // PUT /api/contratos/:id/parcelas/:parcelaId/status
        if (action === 'parcelas' && method === 'PUT') {
          const body = await request.json();
          return handler.updateParcelaStatus(param, body.status);
        }
      }
    }

    // Rota /api/dash
    if (pathParts[0] === 'api' && pathParts[1] === 'dash') {
      const handler = new DashboardHandler(context, this.logger.requestId);
      
      if (pathParts.length === 3) {
        const action = pathParts[2];
        
        // GET /api/dash/alertas
        if (action === 'alertas' && method === 'GET') {
          return handler.getAlertas();
        }
        // GET /api/dash/pendencias
        if (action === 'pendencias' && method === 'GET') {
          return handler.getPendencias();
        }
        // GET /api/dash/proximos-passos
        if (action === 'proximos-passos' && method === 'GET') {
          return handler.getProximosPassos();
        }
        // GET /api/dash/agenda
        if (action === 'agenda' && method === 'GET') {
          return handler.getAgenda();
        }
        // GET /api/dash/contratos-recentes
        if (action === 'contratos-recentes' && method === 'GET') {
          return handler.getContratosRecentes();
        }
        // GET /api/dash/atividade
        if (action === 'atividade' && method === 'GET') {
          return handler.getAtividade();
        }
        // GET /api/dash/resumo
        if (action === 'resumo' && method === 'GET') {
          return handler.getResumo();
        }
      }
    }

    // Rota não encontrada
    return {
      error: {
        code: 'NOT_FOUND',
        message: 'Rota não encontrada',
        details: { path, method }
      },
      meta: {
        request_id: this.logger.requestId,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Instância singleton do router
export const apiRouter = new ApiRouter();
