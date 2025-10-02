import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { Database } from '@/integrations/supabase/types';
import { Logger } from '@/lib/logging/logger';

type Cliente = Database['public']['Tables']['clientes']['Row'];
type ClienteInsert = Database['public']['Tables']['clientes']['Insert'];
type ClienteUpdate = Database['public']['Tables']['clientes']['Update'];

export class ClientesHandler {
  private requestId: string;
  private logger: ReturnType<typeof Logger.createRequestLogger>;

  constructor(requestId: string) {
    this.requestId = requestId;
    this.logger = Logger.createRequestLogger();
  }
  /**
   * Lista todos os clientes (apenas admins)
   */
  async list(): Promise<ApiResponse<Cliente[]>> {
    try {
      this.logger.info('Listando clientes', { requestId: this.requestId });
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true });

      if (error) {
        this.logger.error('Erro ao buscar clientes', { error: error.message, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', `Erro ao buscar clientes: ${error.message}`);
      }

      this.logger.info('Clientes listados com sucesso', { count: data?.length || 0, requestId: this.requestId });
      return createSuccessResponse(data || []);
    } catch (error) {
      this.logger.error('Erro inesperado ao listar clientes', { error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao listar clientes');
    }
  }

  /**
   * Busca um cliente por ID
   */
  async getById(id: string): Promise<ApiResponse<Cliente>> {
    try {
      this.logger.info('Buscando cliente por ID', { id, requestId: this.requestId });
      
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Erro ao buscar cliente', { id, error: error.message, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', `Erro ao buscar cliente: ${error.message}`);
      }

      if (!data) {
        this.logger.warn('Cliente não encontrado', { id, requestId: this.requestId });
        return createErrorResponse('NOT_FOUND', 'Cliente não encontrado');
      }

      this.logger.info('Cliente encontrado', { id, requestId: this.requestId });
      return createSuccessResponse(data);
    } catch (error) {
      this.logger.error('Erro inesperado ao buscar cliente', { id, error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao buscar cliente');
    }
  }

  /**
   * Cria um novo cliente (apenas admins)
   */
  async create(clienteData: ClienteInsert): Promise<ApiResponse<Cliente>> {
    try {
      this.logger.info('Criando cliente', { nome: clienteData.nome, requestId: this.requestId });
      
      const { data, error } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select()
        .single();

      if (error) {
        this.logger.error('Erro ao criar cliente', { error: error.message, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', `Erro ao criar cliente: ${error.message}`);
      }

      this.logger.info('Cliente criado com sucesso', { id: data.id, nome: data.nome, requestId: this.requestId });
      return createSuccessResponse(data);
    } catch (error) {
      this.logger.error('Erro inesperado ao criar cliente', { error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao criar cliente');
    }
  }

  /**
   * Atualiza um cliente (apenas admins)
   */
  async update(id: string, clienteData: ClienteUpdate): Promise<ApiResponse<Cliente>> {
    try {
      this.logger.info('Atualizando cliente', { id, changes: clienteData, requestId: this.requestId });
      
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ...clienteData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Erro ao atualizar cliente', { id, error: error.message, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', `Erro ao atualizar cliente: ${error.message}`);
      }

      if (!data) {
        this.logger.warn('Cliente não encontrado para atualização', { id, requestId: this.requestId });
        return createErrorResponse('NOT_FOUND', 'Cliente não encontrado');
      }

      this.logger.info('Cliente atualizado com sucesso', { id, requestId: this.requestId });
      return createSuccessResponse(data);
    } catch (error) {
      this.logger.error('Erro inesperado ao atualizar cliente', { id, error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao atualizar cliente');
    }
  }

  /**
   * Remove um cliente e todos os usuários relacionados (apenas admins)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      this.logger.info('Removendo cliente e usuários relacionados', { id, requestId: this.requestId });
      
      // Usar Edge Function para exclusão em cascata
      const supabaseUrl = process.env.SUPABASE_URL;
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        this.logger.error('Usuário não autenticado para exclusão', { id, requestId: this.requestId });
        return createErrorResponse('UNAUTHORIZED', 'Usuário não autenticado');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/delete-client-cascade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        this.logger.error('Erro ao remover cliente via Edge Function', { id, error: result.error, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', result.error || 'Erro ao remover cliente');
      }

      this.logger.info('Cliente e usuários relacionados removidos com sucesso', { 
        id, 
        deleted_users: result.deleted_users,
        cliente_nome: result.cliente_nome,
        requestId: this.requestId 
      });
      
      return createSuccessResponse(undefined);
    } catch (error) {
      this.logger.error('Erro inesperado ao remover cliente', { id, error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao remover cliente');
    }
  }

  /**
   * Lista usuários e seus papéis para um cliente
   */
  async getUsers(id: string): Promise<ApiResponse<any[]>> {
    try {
      this.logger.info('Buscando usuários do cliente', { id, requestId: this.requestId });
      
      const { data, error } = await supabase
        .from('user_client_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          updated_at,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('cliente_id', id)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Erro ao buscar usuários do cliente', { id, error: error.message, requestId: this.requestId });
        return createErrorResponse('DATABASE_ERROR', `Erro ao buscar usuários do cliente: ${error.message}`);
      }

      this.logger.info('Usuários do cliente buscados com sucesso', { id, count: data?.length || 0, requestId: this.requestId });
      return createSuccessResponse(data || []);
    } catch (error) {
      this.logger.error('Erro inesperado ao buscar usuários do cliente', { id, error, requestId: this.requestId });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao buscar usuários do cliente');
    }
  }
}
