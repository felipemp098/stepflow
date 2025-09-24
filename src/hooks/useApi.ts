import { useAuth } from '@/contexts/AuthContext';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ApiRequestOptions extends RequestInit {
  requireTenant?: boolean;
}

interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

/**
 * Hook para fazer requisições à API com validação automática de tenant
 */
export function useApi() {
  const { currentCliente } = useAuth();

  const request = useCallback(async <T = any>(
    url: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { requireTenant = true, ...fetchOptions } = options;

    // Verificar se o header de tenant é necessário
    if (requireTenant && !currentCliente) {
      return {
        error: {
          code: 'TENANT_REQUIRED',
          message: 'Nenhum cliente selecionado',
          details: { url }
        }
      };
    }

    // Preparar headers
    const headers = new Headers(fetchOptions.headers);
    
    if (currentCliente && requireTenant) {
      headers.set('X-Client-Id', currentCliente.id);
    }

    // Obter token do Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers.set('Authorization', `Bearer ${session.access_token}`);
    }

    // URL base da Edge Function
    const baseUrl = 'https://irwreedairelbbekrvyq.supabase.co/functions/v1';
    const fullUrl = url.startsWith('/') ? `${baseUrl}${url}` : url;

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });

      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        return {
          error: data.error || {
            code: 'HTTP_ERROR',
            message: `Erro HTTP ${response.status}`,
            details: { status: response.status, statusText: response.statusText }
          }
        };
      }

      return data;
    } catch (error) {
      return {
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Erro de rede',
          details: { url, error: error instanceof Error ? error.stack : undefined }
        }
      };
    }
  }, [currentCliente]);

  // Métodos de conveniência
  const get = useCallback(<T = any>(url: string, options: ApiRequestOptions = {}) => {
    return request<T>(url, { ...options, method: 'GET' });
  }, [request]);

  const post = useCallback(<T = any>(url: string, body?: any, options: ApiRequestOptions = {}) => {
    return request<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }, [request]);

  const put = useCallback(<T = any>(url: string, body?: any, options: ApiRequestOptions = {}) => {
    return request<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }, [request]);

  const del = useCallback(<T = any>(url: string, options: ApiRequestOptions = {}) => {
    return request<T>(url, { ...options, method: 'DELETE' });
  }, [request]);

  return {
    request,
    get,
    post,
    put,
    delete: del,
    currentCliente,
  };
}

/**
 * Hook para requisições específicas do dashboard
 */
export function useDashboardApi() {
  const { get } = useApi();

  const getAlertas = useCallback(() => {
    return get('/api/dash/alertas');
  }, [get]);

  const getPendencias = useCallback(() => {
    return get('/api/dash/pendencias');
  }, [get]);

  const getProximosPassos = useCallback(() => {
    return get('/api/dash/proximos-passos');
  }, [get]);

  const getAgenda = useCallback(() => {
    return get('/api/dash/agenda');
  }, [get]);

  const getContratosRecentes = useCallback(() => {
    return get('/api/dash/contratos-recentes');
  }, [get]);

  const getAtividade = useCallback(() => {
    return get('/api/dash/atividade');
  }, [get]);

  const getResumo = useCallback(() => {
    return get('/api/dash/resumo');
  }, [get]);

  return {
    getAlertas,
    getPendencias,
    getProximosPassos,
    getAgenda,
    getContratosRecentes,
    getAtividade,
    getResumo,
  };
}

/**
 * Hook para requisições de contratos
 */
export function useContratosApi() {
  const { get, post, put, delete: del } = useApi();

  const listContratos = useCallback((options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const params = new URLSearchParams();
    if (options.status) params.set('status', options.status);
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.offset) params.set('offset', options.offset.toString());
    
    const queryString = params.toString();
    const url = queryString ? `/api/contratos?${queryString}` : '/api/contratos';
    
    return get(url);
  }, [get]);

  const getContrato = useCallback((id: string) => {
    return get(`/api/contratos/${id}`);
  }, [get]);

  const createContrato = useCallback((data: any) => {
    return post('/api/contratos', data);
  }, [post]);

  const updateContrato = useCallback((id: string, data: any) => {
    return put(`/api/contratos/${id}`, data);
  }, [put]);

  const deleteContrato = useCallback((id: string) => {
    return del(`/api/contratos/${id}`);
  }, [del]);

  const getContratoAlunos = useCallback((contratoId: string) => {
    return get(`/api/contratos/${contratoId}/alunos`);
  }, [get]);

  const addContratoAluno = useCallback((contratoId: string, alunoId: string) => {
    return post(`/api/contratos/${contratoId}/alunos/${alunoId}`);
  }, [post]);

  const removeContratoAluno = useCallback((contratoId: string, alunoId: string) => {
    return del(`/api/contratos/${contratoId}/alunos/${alunoId}`);
  }, [del]);

  const getContratoParcelas = useCallback((contratoId: string) => {
    return get(`/api/contratos/${contratoId}/parcelas`);
  }, [get]);

  const updateParcelaStatus = useCallback((parcelaId: string, status: string) => {
    return put(`/api/contratos/parcelas/${parcelaId}/status`, { status });
  }, [put]);

  return {
    listContratos,
    getContrato,
    createContrato,
    updateContrato,
    deleteContrato,
    getContratoAlunos,
    addContratoAluno,
    removeContratoAluno,
    getContratoParcelas,
    updateParcelaStatus,
  };
}

/**
 * Hook para requisições de clientes (apenas admins)
 * Não requer tenant pois é uma operação administrativa
 */
export function useClientesApi() {
  const { get, post, put, delete: del } = useApi();

  const listClientes = useCallback(() => {
    return get('/api/clientes', { requireTenant: false });
  }, [get]);

  const getCliente = useCallback((id: string) => {
    return get(`/api/clientes/${id}`, { requireTenant: false });
  }, [get]);

  const createCliente = useCallback((data: any) => {
    return post('/api/clientes', data, { requireTenant: false });
  }, [post]);

  const updateCliente = useCallback((id: string, data: any) => {
    return put(`/api/clientes/${id}`, data, { requireTenant: false });
  }, [put]);

  const deleteCliente = useCallback((id: string) => {
    return del(`/api/clientes/${id}`, { requireTenant: false });
  }, [del]);

  const getClienteUsers = useCallback((id: string) => {
    return get(`/api/clientes/${id}/users`, { requireTenant: false });
  }, [get]);

  return {
    listClientes,
    getCliente,
    createCliente,
    updateCliente,
    deleteCliente,
    getClienteUsers,
  };
}
