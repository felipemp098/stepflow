import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

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
  
  // Error states
  error: string | null;
  clienteError: string | null;
  
  // Actions
  loadClientes: () => Promise<void>;
  loadCliente: (id: string) => Promise<void>;
  createCliente: (data: ClienteInsert) => Promise<{ success: boolean; error?: string }>;
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
  const createCliente = useCallback(async (data: ClienteInsert): Promise<{ success: boolean; error?: string }> => {
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
      
      return { success: true };
    } catch (err) {
      const errorMessage = handleApiError(err);
      console.error('❌ Erro ao criar cliente:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCreating(false);
    }
  }, []);

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
      console.log('🔍 Excluindo cliente:', id);
      
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(`Erro ao excluir cliente: ${error.message}`);
      }
      
      console.log('📊 Cliente excluído');
      
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
    
    // Error states
    error,
    clienteError,
    
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
