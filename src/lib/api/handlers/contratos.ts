import { BaseApiHandler } from './base';
import { ApiResponse } from '@/lib/api/response';
import { Database } from '@/integrations/supabase/types';

type Contrato = Database['public']['Tables']['contratos']['Row'];
type ContratoInsert = Database['public']['Tables']['contratos']['Insert'];
type ContratoUpdate = Database['public']['Tables']['contratos']['Update'];

export class ContratosHandler extends BaseApiHandler {
  /**
   * Lista contratos do cliente
   */
  async list(options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<ApiResponse<Contrato[]>> {
    const permissionResult = this.validatePermission('contratos', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const filters: Record<string, any> = {};
      if (options.status) {
        filters.status = options.status;
      }

      const { data, error } = await this.list<Contrato>('contratos', {
        filters,
        orderBy: { column: 'created_at', ascending: false },
        limit: options.limit,
        offset: options.offset
      });

      if (error) {
        throw new Error(`Erro ao buscar contratos: ${error.message}`);
      }

      return data;
    }, 'contratos:list');
  }

  /**
   * Busca um contrato por ID
   */
  async getById(id: string): Promise<ApiResponse<Contrato>> {
    const permissionResult = this.validatePermission('contratos', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data, error } = await this.findById<Contrato>('contratos', id);

      if (error) {
        throw new Error(`Erro ao buscar contrato: ${error.message}`);
      }

      if (!data) {
        throw new Error('Contrato não encontrado');
      }

      return data;
    }, `contratos:getById:${id}`);
  }

  /**
   * Cria um novo contrato
   */
  async create(contratoData: ContratoInsert): Promise<ApiResponse<Contrato>> {
    const permissionResult = this.validatePermission('contratos', 'create');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data, error } = await this.create<Contrato>('contratos', contratoData);

      if (error) {
        throw new Error(`Erro ao criar contrato: ${error.message}`);
      }

      this.logAudit('CREATE', 'contrato', data!.id, {
        nome: data!.nome,
        status: data!.status,
        valor_total: data!.valor_total
      });

      return data!;
    }, 'contratos:create');
  }

  /**
   * Atualiza um contrato
   */
  async update(id: string, contratoData: ContratoUpdate): Promise<ApiResponse<Contrato>> {
    const permissionResult = this.validatePermission('contratos', 'update');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Buscar contrato atual para auditoria
      const { data: currentContrato } = await this.findById<Contrato>('contratos', id);
      
      const { data, error } = await this.update<Contrato>('contratos', id, contratoData);

      if (error) {
        throw new Error(`Erro ao atualizar contrato: ${error.message}`);
      }

      if (!data) {
        throw new Error('Contrato não encontrado');
      }

      this.logAudit('UPDATE', 'contrato', id, {
        changes: contratoData,
        previous: currentContrato
      });

      return data;
    }, `contratos:update:${id}`);
  }

  /**
   * Remove um contrato (apenas admins)
   */
  async delete(id: string): Promise<ApiResponse<void>> {
    const permissionResult = this.validatePermission('contratos', 'delete');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Buscar contrato para auditoria
      const { data: contrato } = await this.findById<Contrato>('contratos', id);
      
      const { error } = await this.delete('contratos', id);

      if (error) {
        throw new Error(`Erro ao remover contrato: ${error.message}`);
      }

      this.logAudit('DELETE', 'contrato', id, {
        contrato: contrato
      });

      return undefined;
    }, `contratos:delete:${id}`);
  }

  /**
   * Lista alunos vinculados a um contrato
   */
  async getAlunos(contratoId: string): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('contratos', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data, error } = await this.list<any>('contrato_alunos', {
        select: `
          id,
          aluno_id,
          created_at,
          alunos!inner(
            id,
            nome,
            email,
            status
          )
        `,
        filters: { contrato_id: contratoId },
        orderBy: { column: 'created_at', ascending: false }
      });

      if (error) {
        throw new Error(`Erro ao buscar alunos do contrato: ${error.message}`);
      }

      return data;
    }, `contratos:getAlunos:${contratoId}`);
  }

  /**
   * Vincula um aluno a um contrato
   */
  async addAluno(contratoId: string, alunoId: string): Promise<ApiResponse<any>> {
    const permissionResult = this.validatePermission('contratos', 'update');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data, error } = await this.create<any>('contrato_alunos', {
        contrato_id: contratoId,
        aluno_id: alunoId
      });

      if (error) {
        throw new Error(`Erro ao vincular aluno ao contrato: ${error.message}`);
      }

      this.logAudit('ADD_ALUNO', 'contrato', contratoId, {
        aluno_id: alunoId
      });

      return data!;
    }, `contratos:addAluno:${contratoId}:${alunoId}`);
  }

  /**
   * Remove um aluno de um contrato
   */
  async removeAluno(contratoId: string, alunoId: string): Promise<ApiResponse<void>> {
    const permissionResult = this.validatePermission('contratos', 'update');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { error } = await this.list<any>('contrato_alunos', {
        filters: { 
          contrato_id: contratoId,
          aluno_id: alunoId 
        }
      });

      if (error) {
        throw new Error(`Erro ao remover aluno do contrato: ${error.message}`);
      }

      // Aqui seria implementado o delete real
      // Por enquanto, apenas log da ação
      this.logAudit('REMOVE_ALUNO', 'contrato', contratoId, {
        aluno_id: alunoId
      });

      return undefined;
    }, `contratos:removeAluno:${contratoId}:${alunoId}`);
  }

  /**
   * Lista parcelas de um contrato
   */
  async getParcelas(contratoId: string): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('contratos', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data, error } = await this.list<any>('parcelas', {
        filters: { contrato_id: contratoId },
        orderBy: { column: 'data_vencimento', ascending: true }
      });

      if (error) {
        throw new Error(`Erro ao buscar parcelas do contrato: ${error.message}`);
      }

      return data;
    }, `contratos:getParcelas:${contratoId}`);
  }

  /**
   * Atualiza status de uma parcela
   */
  async updateParcelaStatus(parcelaId: string, status: string): Promise<ApiResponse<any>> {
    const permissionResult = this.validatePermission('contratos', 'update');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const updateData: any = { status };
      
      if (status === 'paga') {
        updateData.data_pagamento = new Date().toISOString();
      }

      const { data, error } = await this.update<any>('parcelas', parcelaId, updateData);

      if (error) {
        throw new Error(`Erro ao atualizar status da parcela: ${error.message}`);
      }

      if (!data) {
        throw new Error('Parcela não encontrada');
      }

      this.logAudit('UPDATE_PARCELA_STATUS', 'parcela', parcelaId, {
        new_status: status,
        previous_status: data.status
      });

      return data;
    }, `contratos:updateParcelaStatus:${parcelaId}`);
  }
}
