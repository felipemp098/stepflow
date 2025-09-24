import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface RBACValidationResult {
  canAccess: boolean;
  error?: string;
  userRole?: string;
}

interface UseRBACReturn {
  // Validation
  validateClientAccess: (clientId: string) => Promise<RBACValidationResult>;
  
  // State
  loading: boolean;
  error: string | null;
}

export function useRBAC(): UseRBACReturn {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida se o usuário pode acessar os dados de um cliente específico
   */
  const validateClientAccess = useCallback(async (clientId: string): Promise<RBACValidationResult> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        return {
          canAccess: false,
          error: 'Usuário não autenticado'
        };
      }

      // Buscar papel do usuário
      const { data: userRole, error: roleError } = await supabase
        .from('user_client_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('cliente_id', clientId)
        .single();

      if (roleError && roleError.code !== 'PGRST116') {
        console.error('Erro ao buscar papel do usuário:', roleError);
        return {
          canAccess: false,
          error: 'Erro ao verificar permissões'
        };
      }

      const role = userRole?.role;

      // Regras de acesso conforme PRD
      if (role === 'aluno') {
        return {
          canAccess: false,
          error: 'Alunos não têm acesso a esta página',
          userRole: role
        };
      }

      if (role === 'admin') {
        // Admin pode acessar qualquer cliente
        return {
          canAccess: true,
          userRole: role
        };
      }

      if (role === 'cliente') {
        // Cliente só pode acessar o próprio
        if (user.currentCliente?.id === clientId) {
          return {
            canAccess: true,
            userRole: role
          };
        } else {
          return {
            canAccess: false,
            error: 'Você só pode acessar dados do seu próprio cliente',
            userRole: role
          };
        }
      }

      // Usuário sem papel definido
      return {
        canAccess: false,
        error: 'Usuário sem permissões definidas'
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro na validação RBAC:', errorMessage);
      setError(errorMessage);
      
      return {
        canAccess: false,
        error: 'Erro interno na validação de permissões'
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    validateClientAccess,
    loading,
    error
  };
}
