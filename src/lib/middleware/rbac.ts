import { Database } from '@/integrations/supabase/types';
import { TenantContext } from './tenant';
import { User } from '@supabase/supabase-js';

type UserRole = Database['public']['Enums']['user_role'];

export interface RBACConfig {
  resource: string;
  actions: {
    read: UserRole[];
    create: UserRole[];
    update: UserRole[];
    delete: UserRole[];
  };
}

/**
 * Configuração de permissões RBAC por recurso
 * Baseado na matriz definida no PRD
 */
export const RBAC_MATRIX: Record<string, RBACConfig> = {
  clientes: {
    resource: 'clientes',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin'],
      update: ['admin'],
      delete: ['admin']
    }
  },
  contratos: {
    resource: 'contratos',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  alunos: {
    resource: 'alunos',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  produtos: {
    resource: 'produtos',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  ofertas: {
    resource: 'ofertas',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  jornadas: {
    resource: 'jornadas',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  passos: {
    resource: 'passos',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'],
      delete: ['admin']
    }
  },
  parcelas: {
    resource: 'parcelas',
    actions: {
      read: ['admin', 'cliente'],
      create: ['admin', 'cliente'],
      update: ['admin', 'cliente'], // Cliente pode atualizar status
      delete: ['admin']
    }
  },
  dashboard: {
    resource: 'dashboard',
    actions: {
      read: ['admin', 'cliente'],
      create: [],
      update: [],
      delete: []
    }
  }
};

/**
 * Middleware RBAC para validação de permissões
 */
export class RBACGuard {
  /**
   * Verifica se o usuário tem permissão para uma ação específica
   */
  static hasPermission(
    context: TenantContext,
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ): boolean {
    // Verificar se é super admin via user_metadata
    if (context.user?.user_metadata?.role === 'super_admin') {
      return true;
    }

    const config = RBAC_MATRIX[resource];
    
    if (!config) {
      console.warn(`Recurso não encontrado na matriz RBAC: ${resource}`);
      return false;
    }

    const allowedRoles = config.actions[action];
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return false;
    }

    return allowedRoles.includes(context.userRole!);
  }

  /**
   * Valida permissões e retorna erro se necessário
   */
  static validatePermission(
    context: TenantContext,
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ): { success: boolean; error?: any } {
    if (!this.hasPermission(context, resource, action)) {
      return {
        success: false,
        error: {
          code: 'ROLE_FORBIDDEN',
          message: 'Acesso negado: papel insuficiente para esta operação',
          details: {
            resource,
            action,
            requiredRoles: RBAC_MATRIX[resource]?.actions[action] || [],
            currentRole: context.userRole
          }
        }
      };
    }

    return { success: true };
  }

  /**
   * Middleware para validação de permissões em rotas
   */
  static requirePermission(
    resource: string,
    action: 'read' | 'create' | 'update' | 'delete'
  ) {
    return (context: TenantContext) => {
      return this.validatePermission(context, resource, action);
    };
  }

  /**
   * Middleware para múltiplas permissões (OR logic)
   */
  static requireAnyPermission(
    permissions: Array<{ resource: string; action: 'read' | 'create' | 'update' | 'delete' }>
  ) {
    return (context: TenantContext) => {
      for (const permission of permissions) {
        if (this.hasPermission(context, permission.resource, permission.action)) {
          return { success: true };
        }
      }

      return {
        success: false,
        error: {
          code: 'ROLE_FORBIDDEN',
          message: 'Acesso negado: nenhuma permissão suficiente encontrada',
          details: {
            requiredPermissions: permissions,
            currentRole: context.userRole
          }
        }
      };
    };
  }

  /**
   * Middleware para múltiplas permissões (AND logic)
   */
  static requireAllPermissions(
    permissions: Array<{ resource: string; action: 'read' | 'create' | 'update' | 'delete' }>
  ) {
    return (context: TenantContext) => {
      for (const permission of permissions) {
        const result = this.validatePermission(context, permission.resource, permission.action);
        if (!result.success) {
          return result;
        }
      }

      return { success: true };
    };
  }

  /**
   * Verifica se o usuário é admin
   */
  static isAdmin(context: TenantContext): boolean {
    return context.userRole === 'admin';
  }

  /**
   * Verifica se o usuário é cliente
   */
  static isClient(context: TenantContext): boolean {
    return context.userRole === 'cliente';
  }

  /**
   * Verifica se o usuário é aluno
   */
  static isStudent(context: TenantContext): boolean {
    return context.userRole === 'aluno';
  }

  /**
   * Middleware que exige papel de admin
   */
  static requireAdmin() {
    return (context: TenantContext) => {
      if (!this.isAdmin(context)) {
        return {
          success: false,
          error: {
            code: 'ROLE_FORBIDDEN',
            message: 'Acesso negado: papel de admin necessário',
            details: { currentRole: context.userRole }
          }
        };
      }
      return { success: true };
    };
  }

  /**
   * Middleware que exige papel de cliente ou admin
   */
  static requireClientOrAdmin() {
    return (context: TenantContext) => {
      if (!this.isClient(context) && !this.isAdmin(context)) {
        return {
          success: false,
          error: {
            code: 'ROLE_FORBIDDEN',
            message: 'Acesso negado: papel de cliente ou admin necessário',
            details: { currentRole: context.userRole }
          }
        };
      }
      return { success: true };
    };
  }
}
