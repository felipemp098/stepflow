import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CreateUserData {
  cliente_id: string;
  nome: string;
  email: string;
  telefone?: string;
}

interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    temp_password: string;
  };
  error?: string;
}

interface UseCreateUserReturn {
  // Loading states
  creating: boolean;
  
  // Error states
  error: string | null;
  
  // Actions
  createUser: (data: CreateUserData) => Promise<CreateUserResponse>;
  
  // Utils
  clearError: () => void;
}

export function useCreateUser(): UseCreateUserReturn {
  // State
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to handle API errors
  const handleApiError = (error: any): string => {
    console.log('🔍 Analisando erro:', error);
    
    // Se é um Error object com message
    if (error instanceof Error) {
      console.log('📝 Erro é instância de Error:', error.message);
      return error.message;
    }
    
    // Se tem propriedade error.message
    if (error?.error?.message) {
      console.log('📝 Erro tem error.message:', error.error.message);
      return error.error.message;
    }
    
    // Se tem propriedade message direta
    if (error?.message) {
      console.log('📝 Erro tem message direta:', error.message);
      return error.message;
    }
    
    // Se tem propriedade error direta (string)
    if (error?.error && typeof error.error === 'string') {
      console.log('📝 Erro tem error string:', error.error);
      return error.error;
    }
    
    // Se tem propriedade msg
    if (error?.msg) {
      console.log('📝 Erro tem msg:', error.msg);
      return error.msg;
    }
    
    // Se é uma string direta
    if (typeof error === 'string') {
      console.log('📝 Erro é string direta:', error);
      return error;
    }
    
    console.log('❌ Erro não identificado, retornando genérico');
    return 'Erro desconhecido';
  };

  // Create user for client
  const createUser = useCallback(async (data: CreateUserData): Promise<CreateUserResponse> => {
    setCreating(true);
    setError(null);
    
    try {
      console.log('🔍 Criando usuário para cliente:', data);
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Fazer chamada para a Edge Function
      const response = await fetch('https://irwreedairelbbekrvyq.supabase.co/functions/v1/create-client-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Determinar mensagem de erro específica
        let errorMessage = 'Erro ao criar usuário';
        if (result.error) {
          if (result.error.includes('email_exists') || result.error.includes('already been registered')) {
            errorMessage = 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.';
          } else if (result.error.includes('invalid_email')) {
            errorMessage = 'Email inválido. Por favor, verifique o formato do email.';
          } else if (result.error.includes('password')) {
            errorMessage = 'Erro na senha do usuário. Tente novamente.';
          } else if (result.error.includes('permission') || result.error.includes('forbidden')) {
            errorMessage = 'Sem permissão para criar usuários. Contate o administrador.';
          } else {
            errorMessage = result.error;
          }
        } else if (result.msg) {
          if (result.msg.includes('already been registered')) {
            errorMessage = 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.';
          } else {
            errorMessage = result.msg;
          }
        } else {
          errorMessage = `Erro HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      console.log('📊 Usuário criado com sucesso:', result.user);
      return result;
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao criar usuário:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCreating(false);
    }
  }, []);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Loading states
    creating,
    
    // Error states
    error,
    
    // Actions
    createUser,
    
    // Utils
    clearError,
  };
}
