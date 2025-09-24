import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

export interface TenantContext {
  tenantId: string;
  userRole: UserRole | null;
  userId: string;
}

export interface TenantValidationResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  context?: TenantContext;
}

/**
 * Middleware para validação de tenant e RBAC
 * Valida o header X-Client-Id e verifica se o usuário tem acesso ao tenant
 */
export class TenantMiddleware {
  private static readonly TENANT_HEADER = 'X-Client-Id';
  private static readonly ADMIN_BYPASS = process.env.ADMIN_BYPASS === 'true';

  /**
   * Valida o header de tenant e retorna o contexto do usuário
   */
  static async validateTenant(
    tenantId: string,
    userId: string,
    requireAdmin: boolean = false
  ): Promise<TenantValidationResult> {
    try {
      // Validar formato UUID do tenant
      if (!this.isValidUUID(tenantId)) {
        return {
          success: false,
          error: {
            code: 'TENANT_HEADER_INVALID',
            message: 'Formato de UUID inválido no header X-Client-Id',
            details: { tenantId }
          }
        };
      }

      // Verificar se o tenant existe
      const { data: tenant, error: tenantError } = await supabase
        .from('clientes')
        .select('id, nome, status')
        .eq('id', tenantId)
        .single();

      if (tenantError || !tenant) {
        return {
          success: false,
          error: {
            code: 'TENANT_FORBIDDEN',
            message: 'Cliente não encontrado ou sem acesso',
            details: { tenantId }
          }
        };
      }

      // Verificar se o tenant está ativo
      if (tenant.status !== 'ativo') {
        return {
          success: false,
          error: {
            code: 'TENANT_FORBIDDEN',
            message: 'Cliente inativo',
            details: { tenantId, status: tenant.status }
          }
        };
      }

      // Buscar papel do usuário no tenant
      const { data: userRole, error: roleError } = await supabase
        .from('user_client_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('cliente_id', tenantId)
        .single();

      if (roleError || !userRole) {
        return {
          success: false,
          error: {
            code: 'TENANT_FORBIDDEN',
            message: 'Usuário sem vínculo com o cliente informado',
            details: { tenantId, userId }
          }
        };
      }

      // Verificar se é admin global (bypass opcional)
      if (requireAdmin && userRole.role !== 'admin') {
        return {
          success: false,
          error: {
            code: 'ROLE_FORBIDDEN',
            message: 'Acesso negado: papel insuficiente',
            details: { required: 'admin', current: userRole.role }
          }
        };
      }

      return {
        success: true,
        context: {
          tenantId,
          userRole: userRole.role,
          userId
        }
      };

    } catch (error) {
      console.error('Erro na validação de tenant:', error);
      return {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
          details: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
        }
      };
    }
  }

  /**
   * Extrai o tenant ID do header da requisição
   */
  static extractTenantFromHeaders(headers: Headers): string | null {
    return headers.get(this.TENANT_HEADER);
  }

  /**
   * Valida se uma string é um UUID válido
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Verifica se o usuário é admin global
   */
  static async isGlobalAdmin(userId: string): Promise<boolean> {
    if (this.ADMIN_BYPASS) {
      const { data } = await supabase
        .from('user_client_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .limit(1);
      
      return data && data.length > 0;
    }
    return false;
  }

  /**
   * Aplica validação de tenant em uma requisição
   */
  static async validateRequest(
    headers: Headers,
    userId: string,
    requireAdmin: boolean = false
  ): Promise<TenantValidationResult> {
    const tenantId = this.extractTenantFromHeaders(headers);

    // Verificar se o header está presente
    if (!tenantId) {
      // Se ADMIN_BYPASS está habilitado e é admin, permitir sem header
      if (this.ADMIN_BYPASS && requireAdmin && await this.isGlobalAdmin(userId)) {
        return {
          success: true,
          context: {
            tenantId: '',
            userRole: 'admin',
            userId
          }
        };
      }

      return {
        success: false,
        error: {
          code: 'TENANT_HEADER_REQUIRED',
          message: 'Header X-Client-Id é obrigatório',
          details: { header: this.TENANT_HEADER }
        }
      };
    }

    return this.validateTenant(tenantId, userId, requireAdmin);
  }
}
