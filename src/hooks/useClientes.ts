import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useCreateUser } from './useCreateUser';

type Cliente = Database['public']['Tables']['clientes']['Row'];
type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
type ClienteUpdate = Database['public']['Tables']['clientes']['Update'];

interface UseClientesReturn {
  // Data
  clientes: Cliente[];
  cliente: Cliente | null;
  
  // Loading states
  loading: boolean;
  loadingCliente: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  creatingUser: boolean;
  
  // Error states
  error: string | null;
  clienteError: string | null;
  userError: string | null;
  
  // Actions
  loadClientes: () => Promise<void>;
  loadCliente: (id: string) => Promise<void>;
  createCliente: (data: ClienteInsert) => Promise<{ success: boolean; error?: string; userCreated?: boolean; createdUser?: { id: string; email: string; temp_password: string } }>;
  updateCliente: (id: string, data: ClienteUpdate) => Promise<{ success: boolean; error?: string }>;
  deleteCliente: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  // Utils
  clearError: () => void;
  clearClienteError: () => void;
  refreshClientes: () => Promise<void>;
}

export function useClientes(): UseClientesReturn {
  
  // State
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingCliente, setLoadingCliente] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Error states
  const [error, setError] = useState<string | null>(null);
  const [clienteError, setClienteError] = useState<string | null>(null);

  // Hook para criação de usuários
  const { createUser, creating: creatingUser, error: userError } = useCreateUser();

  // Helper function to handle API errors
  const handleApiError = (error: any): string => {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'Erro desconhecido';
  };

  // Load all clientes
  const loadClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Carregando clientes...');
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });
      
      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }
      
      console.log('📊 Clientes carregados:', data);
      setClientes(data || []);
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao carregar clientes:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load single cliente
  const loadCliente = useCallback(async (id: string) => {
    setLoadingCliente(true);
    setClienteError(null);
    
    try {
      console.log('🔍 Carregando cliente:', id);
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        throw new Error(`Erro ao buscar cliente: ${error.message}`);
      }
      
      console.log('📊 Cliente carregado:', data);
      setCliente(data || null);
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao carregar cliente:', errorMessage);
      setClienteError(errorMessage);
    } finally {
      setLoadingCliente(false);
    }
  }, []);

  // Create cliente
  const createCliente = useCallback(async (data: ClienteInsert): Promise<{ success: boolean; error?: string; userCreated?: boolean; createdUser?: { id: string; email: string; temp_password: string } }> => {
    setCreating(true);
    setError(null);
    
    try {
      console.log('🔍 Criando cliente:', data);
      
      const { data: newCliente, error } = await supabase
        .from('clientes')
        .insert(data)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }
      
      console.log('📊 Cliente criado:', newCliente);
      
      // Add to local state
      if (newCliente) {
        setClientes(prev => [...prev, newCliente]);
      }

      // Criar usuário automaticamente se o cliente tem email
      let userCreated = false;
      let createdUser = undefined;
      if (newCliente && newCliente.email) {
        try {
          console.log('🔍 Criando usuário para o cliente...');
          
          // Criar usuário no auth (Edge Function criará o vínculo)
          const userResult = await createUser({
            cliente_id: newCliente.id,
            nome: newCliente.nome,
            email: newCliente.email,
            telefone: newCliente.telefone || undefined
          });

          if (userResult.success && userResult.user) {
            console.log('📊 Usuário criado com sucesso:', userResult.user);
            userCreated = true;
            createdUser = userResult.user;
          } else {
            console.error('❌ Falha ao criar usuário:', userResult.error);
            
            // Se falhou ao criar usuário, remover o cliente criado
            console.log('🗑️ Removendo cliente devido à falha na criação do usuário...');
            await supabase
              .from('clientes')
              .delete()
              .eq('id', newCliente.id);
            
            // Remover do estado local também
            setClientes(prev => prev.filter(c => c.id !== newCliente.id));
            
            // Determinar mensagem de erro específica
            let errorMessage = 'Erro ao criar usuário';
            if (userResult.error && typeof userResult.error === 'string') {
              if (userResult.error.includes('email_exists') || userResult.error.includes('already been registered')) {
                errorMessage = 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.';
              } else if (userResult.error.includes('invalid_email')) {
                errorMessage = 'Email inválido. Por favor, verifique o formato do email.';
              } else if (userResult.error.includes('password')) {
                errorMessage = 'Erro na senha do usuário. Tente novamente.';
              } else if (userResult.error.includes('permission') || userResult.error.includes('forbidden')) {
                errorMessage = 'Sem permissão para criar usuários. Contate o administrador.';
              } else {
                errorMessage = `Erro ao criar usuário: ${userResult.error}`;
              }
            }
            
            return { 
              success: false, 
              error: errorMessage,
              userCreated: false,
              createdUser: undefined
            };
          }
        } catch (userErr) {
          console.error('❌ Erro ao criar usuário:', userErr);
          
          // Se falhou ao criar usuário, remover o cliente criado
          console.log('🗑️ Removendo cliente devido ao erro na criação do usuário...');
          await supabase
            .from('clientes')
            .delete()
            .eq('id', newCliente.id);
          
          // Remover do estado local também
          setClientes(prev => prev.filter(c => c.id !== newCliente.id));
          
          // Determinar mensagem de erro específica
          let errorMessage = 'Erro inesperado ao criar usuário';
          if (userErr && typeof userErr === 'string') {
            if (userErr.includes('email_exists') || userErr.includes('already been registered')) {
              errorMessage = 'Este email já está sendo usado por outro usuário. Por favor, use um email diferente.';
            } else if (userErr.includes('network') || userErr.includes('fetch')) {
              errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
            } else if (userErr.includes('timeout')) {
              errorMessage = 'Tempo limite excedido. Tente novamente.';
            } else {
              errorMessage = `Erro ao criar usuário: ${userErr}`;
            }
          }
          
          return { 
            success: false, 
            error: errorMessage,
            userCreated: false,
            createdUser: undefined
          };
        }
      }
      
      return { success: true, userCreated, createdUser };
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao criar cliente:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCreating(false);
    }
  }, [createUser]);

  // Update cliente
  const updateCliente = useCallback(async (id: string, data: ClienteUpdate): Promise<{ success: boolean; error?: string }> => {
    setUpdating(true);
    setError(null);
    
    try {
      console.log('🔍 Atualizando cliente:', id, data);
      
      const { data: updatedCliente, error } = await supabase
        .from('clientes')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      }
      
      console.log('📊 Cliente atualizado:', updatedCliente);
      
      // Update local state
      if (updatedCliente) {
        setClientes(prev => prev.map(c => c.id === id ? updatedCliente : c));
        if (cliente?.id === id) {
          setCliente(updatedCliente);
        }
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao atualizar cliente:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUpdating(false);
    }
  }, [cliente]);

  // Delete cliente
  const deleteCliente = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    setDeleting(true);
    setError(null);
    
    try {
      console.log('🔍 Excluindo cliente e usuários relacionados:', id);
      
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Chamar Edge Function para exclusão em cascata
      const response = await fetch('https://irwreedairelbbekrvyq.supabase.co/functions/v1/delete-client-cascade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cliente_id: id
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Erro na Edge Function:', result);
        throw new Error(result.error || 'Erro ao excluir cliente');
      }
      
      console.log('📊 Cliente e usuários excluídos:', result);
      
      // Remove from local state
      setClientes(prev => prev.filter(c => c.id !== id));
      if (cliente?.id === id) {
        setCliente(null);
      }
      
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao excluir cliente:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setDeleting(false);
    }
  }, [cliente]);

  // Utility functions
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearClienteError = useCallback(() => {
    setClienteError(null);
  }, []);

  const refreshClientes = useCallback(async () => {
    await loadClientes();
  }, [loadClientes]);

  // Auto-load clientes on mount
  useEffect(() => {
    loadClientes();
  }, [loadClientes]);

  return {
    // Data
    clientes,
    cliente,
    
    // Loading states
    loading,
    loadingCliente,
    creating,
    updating,
    deleting,
    creatingUser,
    
    // Error states
    error,
    clienteError,
    userError,
    
    // Actions
    loadClientes,
    loadCliente,
    createCliente,
    updateCliente,
    deleteCliente,
    
    // Utils
    clearError,
    clearClienteError,
    refreshClientes,
  };
}
