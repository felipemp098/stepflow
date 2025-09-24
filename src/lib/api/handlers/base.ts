import { supabase } from '@/integrations/supabase/client';
import { TenantContext } from '@/lib/middleware/tenant';
import { RBACGuard } from '@/lib/middleware/rbac';
import { Logger } from '@/lib/logging/logger';
import { 
  createSuccessResponse, 
  createErrorResponse, 
  createTenantErrorResponse,
  createRBACErrorResponse,
  createGenericErrorResponse,
  ApiResponse 
} from '@/lib/api/response';

/**
 * Classe base para handlers de API com validação de tenant e RBAC
 */
export abstract class BaseApiHandler {
  protected context: TenantContext;
  protected requestId: string;
  protected logger: ReturnType<typeof Logger.createRequestLogger>;

  constructor(context: TenantContext, requestId: string) {
    this.context = context;
    this.requestId = requestId;
    this.logger = Logger.createRequestLogger();
  }

  /**
   * Valida se o usuário tem permissão para a ação
   */
  protected validatePermission(
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ): { success: boolean; error?: ApiResponse } {
    const result = RBACGuard.validatePermission(this.context, resource, action);
    
    if (!result.success) {
      Logger.logWarning(
        this.context,
        `${resource}:${action}`,
        `Acesso negado para usuário ${this.context.userId}`,
        { resource, action, userRole: this.context.userRole },
        this.requestId
      );

      return {
        success: false,
        error: createRBACErrorResponse(
          result.error!.code,
          result.error!.message,
          result.error!.details,
          this.requestId
        )
      };
    }

    return { success: true };
  }

  /**
   * Executa uma operação com tratamento de erro
   */
  protected async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<ApiResponse<T>> {
    try {
      const startTime = Date.now();
      const result = await operation();
      const latency = Date.now() - startTime;

      Logger.logRequest(
        this.context,
        operationName,
        'SUCCESS',
        200,
        latency,
        this.requestId
      );

      return createSuccessResponse(result, this.requestId);
    } catch (error) {
      Logger.logError(
        this.context,
        operationName,
        'ERROR',
        error instanceof Error ? error : { 
          code: 'OPERATION_ERROR', 
          message: error instanceof Error ? error.message : 'Erro desconhecido' 
        },
        this.requestId
      );

      return createGenericErrorResponse(
        error instanceof Error ? error.message : 'Erro na operação',
        error instanceof Error ? { stack: error.stack } : undefined,
        this.requestId
      );
    }
  }

  /**
   * Valida se o cliente_id está correto (imutável)
   */
  protected validateClientId(data: any): boolean {
    if (data && data.cliente_id && data.cliente_id !== this.context.tenantId) {
      Logger.logWarning(
        this.context,
        'validation:cliente_id',
        'Tentativa de alterar cliente_id',
        { 
          provided: data.cliente_id, 
          expected: this.context.tenantId 
        },
        this.requestId
      );
      return false;
    }
    return true;
  }

  /**
   * Adiciona cliente_id automaticamente aos dados
   */
  protected addClientId<T extends Record<string, any>>(data: T): T {
    return {
      ...data,
      cliente_id: this.context.tenantId,
    };
  }

  /**
   * Busca um recurso por ID com validação de tenant
   */
  protected async findById<T>(
    table: string,
    id: string,
    select: string = '*'
  ): Promise<{ data: T | null; error: any }> {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq('id', id)
      .single();

    return { data, error };
  }

  /**
   * Lista recursos com filtros e paginação
   */
  protected async list<T>(
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: T[]; error: any; count?: number }> {
    let query = supabase.from(table).select(options.select || '*');

    // Aplicar filtros
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    // Aplicar ordenação
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending !== false 
      });
    }

    // Aplicar paginação
    if (options.limit) {
      query = query.limit(options.limit);
      if (options.offset) {
        query = query.range(options.offset, options.offset + options.limit - 1);
      }
    }

    const { data, error, count } = await query;
    return { data: data || [], error, count };
  }

  /**
   * Cria um novo recurso
   */
  protected async create<T>(
    table: string,
    data: any
  ): Promise<{ data: T | null; error: any }> {
    const dataWithClientId = this.addClientId(data);
    const { data: result, error } = await supabase
      .from(table)
      .insert(dataWithClientId)
      .select()
      .single();

    return { data: result, error };
  }

  /**
   * Atualiza um recurso existente
   */
  protected async update<T>(
    table: string,
    id: string,
    data: any
  ): Promise<{ data: T | null; error: any }> {
    // Remove cliente_id se presente (imutável)
    const { cliente_id, ...updateData } = data;
    
    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    return { data: result, error };
  }

  /**
   * Remove um recurso (soft delete preferível)
   */
  protected async delete(
    table: string,
    id: string
  ): Promise<{ error: any }> {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    return { error };
  }

  /**
   * Log de auditoria para ações sensíveis
   */
  protected logAudit(
    action: string,
    entity: string,
    entityId: string,
    details?: any
  ): void {
    Logger.logAudit(
      this.context,
      action,
      entity,
      entityId,
      details,
      this.requestId
    );
  }
}
