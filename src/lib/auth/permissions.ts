import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];
type UserClientRole = Database['public']['Tables']['user_client_roles']['Row'] & {
  clientes: Database['public']['Tables']['clientes']['Row'];
};

/**
 * Verifica se o usuário é super admin via user_metadata
 */
export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.user_metadata?.role === 'super_admin';
}

/**
 * Verifica se o usuário tem role admin em algum cliente
 */
export function hasAdminRole(userRoles: UserClientRole[]): boolean {
  return userRoles.some(role => role.role === 'admin');
}

/**
 * Verifica se o usuário pode criar outros usuários
 */
export function canCreateUsers(user: User | null, userRoles: UserClientRole[]): boolean {
  return isSuperAdmin(user) || hasAdminRole(userRoles);
}

/**
 * Verifica se o usuário tem permissão para uma ação específica
 */
export function hasPermission(
  user: User | null,
  userRoles: UserClientRole[],
  resource: string,
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  // Super admin tem acesso a tudo
  if (isSuperAdmin(user)) {
    return true;
  }

  // Verificar permissões baseadas em roles
  const hasRolePermission = userRoles.some(role => {
    // Lógica de permissões baseada no recurso e ação
    switch (resource) {
      case 'clientes':
        return action === 'read' || (action === 'create' && role.role === 'admin');
      case 'contratos':
      case 'alunos':
      case 'produtos':
      case 'ofertas':
      case 'jornadas':
      case 'passos':
        return role.role === 'admin' || role.role === 'cliente';
      case 'parcelas':
        return role.role === 'admin' || (role.role === 'cliente' && action !== 'delete');
      case 'dashboard':
        return role.role === 'admin' || role.role === 'cliente';
      default:
        return false;
    }
  });

  return hasRolePermission;
}

/**
 * Obtém o nível de acesso mais alto do usuário
 */
export function getUserAccessLevel(user: User | null, userRoles: UserClientRole[]): 'super_admin' | 'admin' | 'cliente' | 'aluno' | 'none' {
  if (isSuperAdmin(user)) {
    return 'super_admin';
  }

  if (hasAdminRole(userRoles)) {
    return 'admin';
  }

  const roles = userRoles.map(role => role.role);
  if (roles.includes('cliente')) {
    return 'cliente';
  }

  if (roles.includes('aluno')) {
    return 'aluno';
  }

  return 'none';
}

/**
 * Verifica se o usuário pode acessar um cliente específico
 */
export function canAccessCliente(user: User | null, userRoles: UserClientRole[], clienteId: string): boolean {
  // Super admin pode acessar qualquer cliente
  if (isSuperAdmin(user)) {
    return true;
  }

  // Verificar se tem role para este cliente específico
  return userRoles.some(role => role.cliente_id === clienteId);
}

/**
 * Obtém todos os clientes que o usuário pode acessar
 */
export function getAccessibleClientes(user: User | null, userRoles: UserClientRole[]): string[] {
  // Super admin pode acessar todos os clientes
  if (isSuperAdmin(user)) {
    return userRoles.map(role => role.cliente_id);
  }

  // Retornar apenas clientes onde tem role
  return userRoles.map(role => role.cliente_id);
}
