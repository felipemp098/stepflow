import { BaseApiHandler } from './base';
import { ApiResponse } from '@/lib/api/response';

export class DashboardHandler extends BaseApiHandler {
  /**
   * Busca dados do dashboard - alertas
   */
  async getAlertas(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Buscar contratos com problemas
      const { data: contratosProblematicos, error: contratosError } = await this.list<any>('contratos', {
        filters: { status: 'pendente' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      });

      if (contratosError) {
        throw new Error(`Erro ao buscar contratos: ${contratosError.message}`);
      }

      // Buscar parcelas atrasadas
      const hoje = new Date().toISOString().split('T')[0];
      const { data: parcelasAtrasadas, error: parcelasError } = await this.list<any>('parcelas', {
        filters: { 
          status: 'atrasada',
          data_vencimento: hoje
        },
        orderBy: { column: 'data_vencimento', ascending: true },
        limit: 10
      });

      if (parcelasError) {
        throw new Error(`Erro ao buscar parcelas: ${parcelasError.message}`);
      }

      // Buscar jornadas com problemas
      const { data: jornadasProblematicas, error: jornadasError } = await this.list<any>('jornadas_instancia', {
        filters: { status: 'pausado' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      });

      if (jornadasError) {
        throw new Error(`Erro ao buscar jornadas: ${jornadasError.message}`);
      }

      return {
        contratos_problematicos: contratosProblematicos || [],
        parcelas_atrasadas: parcelasAtrasadas || [],
        jornadas_problematicas: jornadasProblematicas || []
      };
    }, 'dashboard:alertas');
  }

  /**
   * Busca dados do dashboard - pendências
   */
  async getPendencias(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Buscar contratos pendentes
      const { data: contratosPendentes, error: contratosError } = await this.list<any>('contratos', {
        filters: { status: 'pendente' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 20
      });

      if (contratosError) {
        throw new Error(`Erro ao buscar contratos pendentes: ${contratosError.message}`);
      }

      // Buscar alunos sem contrato
      const { data: alunosSemContrato, error: alunosError } = await this.list<any>('alunos', {
        filters: { status: 'ativo' },
        orderBy: { column: 'created_at', ascending: false },
        limit: 20
      });

      if (alunosError) {
        throw new Error(`Erro ao buscar alunos: ${alunosError.message}`);
      }

      return {
        contratos_pendentes: contratosPendentes || [],
        alunos_sem_contrato: alunosSemContrato || []
      };
    }, 'dashboard:pendencias');
  }

  /**
   * Busca dados do dashboard - próximos passos
   */
  async getProximosPassos(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Buscar passos pendentes para execução
      const { data: passosPendentes, error: passosError } = await this.list<any>('passos_instancia', {
        filters: { status: 'pendente' },
        orderBy: { column: 'created_at', ascending: true },
        limit: 20
      });

      if (passosError) {
        throw new Error(`Erro ao buscar passos pendentes: ${passosError.message}`);
      }

      return {
        passos_pendentes: passosPendentes || []
      };
    }, 'dashboard:proximos-passos');
  }

  /**
   * Busca dados do dashboard - agenda
   */
  async getAgenda(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const hoje = new Date();
      const proximos7Dias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      // Buscar parcelas com vencimento nos próximos 7 dias
      const { data: parcelasVencendo, error: parcelasError } = await this.list<any>('parcelas', {
        filters: { 
          status: 'pendente'
        },
        orderBy: { column: 'data_vencimento', ascending: true },
        limit: 20
      });

      if (parcelasError) {
        throw new Error(`Erro ao buscar parcelas: ${parcelasError.message}`);
      }

      // Filtrar parcelas que vencem nos próximos 7 dias
      const parcelasFiltradas = parcelasVencendo?.filter((parcela: any) => {
        const dataVencimento = new Date(parcela.data_vencimento);
        return dataVencimento >= hoje && dataVencimento <= proximos7Dias;
      }) || [];

      return {
        parcelas_vencendo: parcelasFiltradas
      };
    }, 'dashboard:agenda');
  }

  /**
   * Busca dados do dashboard - contratos recentes
   */
  async getContratosRecentes(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const { data: contratosRecentes, error: contratosError } = await this.list<any>('contratos', {
        orderBy: { column: 'created_at', ascending: false },
        limit: 10
      });

      if (contratosError) {
        throw new Error(`Erro ao buscar contratos recentes: ${contratosError.message}`);
      }

      return {
        contratos_recentes: contratosRecentes || []
      };
    }, 'dashboard:contratos-recentes');
  }

  /**
   * Busca dados do dashboard - atividade
   */
  async getAtividade(): Promise<ApiResponse<any[]>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      const ultimos30Dias = new Date();
      ultimos30Dias.setDate(ultimos30Dias.getDate() - 30);

      // Buscar contratos criados nos últimos 30 dias
      const { data: contratosCriados, error: contratosError } = await this.list<any>('contratos', {
        filters: {},
        orderBy: { column: 'created_at', ascending: false },
        limit: 50
      });

      if (contratosError) {
        throw new Error(`Erro ao buscar atividade de contratos: ${contratosError.message}`);
      }

      // Filtrar contratos dos últimos 30 dias
      const contratosFiltrados = contratosCriados?.filter((contrato: any) => {
        const dataCriacao = new Date(contrato.created_at);
        return dataCriacao >= ultimos30Dias;
      }) || [];

      return {
        atividade_contratos: contratosFiltrados,
        periodo: {
          inicio: ultimos30Dias.toISOString(),
          fim: new Date().toISOString()
        }
      };
    }, 'dashboard:atividade');
  }

  /**
   * Busca resumo geral do dashboard
   */
  async getResumo(): Promise<ApiResponse<any>> {
    const permissionResult = this.validatePermission('dashboard', 'read');
    if (!permissionResult.success) {
      return permissionResult.error!;
    }

    return this.executeWithErrorHandling(async () => {
      // Contar contratos por status
      const { data: contratos, error: contratosError } = await this.list<any>('contratos', {
        select: 'id, status'
      });

      if (contratosError) {
        throw new Error(`Erro ao buscar resumo de contratos: ${contratosError.message}`);
      }

      // Contar alunos por status
      const { data: alunos, error: alunosError } = await this.list<any>('alunos', {
        select: 'id, status'
      });

      if (alunosError) {
        throw new Error(`Erro ao buscar resumo de alunos: ${alunosError.message}`);
      }

      // Contar parcelas por status
      const { data: parcelas, error: parcelasError } = await this.list<any>('parcelas', {
        select: 'id, status'
      });

      if (parcelasError) {
        throw new Error(`Erro ao buscar resumo de parcelas: ${parcelasError.message}`);
      }

      // Agregar dados
      const resumo = {
        contratos: {
          total: contratos?.length || 0,
          ativos: contratos?.filter((c: any) => c.status === 'ativo').length || 0,
          pendentes: contratos?.filter((c: any) => c.status === 'pendente').length || 0,
          cancelados: contratos?.filter((c: any) => c.status === 'cancelado').length || 0
        },
        alunos: {
          total: alunos?.length || 0,
          ativos: alunos?.filter((a: any) => a.status === 'ativo').length || 0,
          inativos: alunos?.filter((a: any) => a.status === 'inativo').length || 0,
          suspensos: alunos?.filter((a: any) => a.status === 'suspenso').length || 0
        },
        parcelas: {
          total: parcelas?.length || 0,
          pendentes: parcelas?.filter((p: any) => p.status === 'pendente').length || 0,
          pagas: parcelas?.filter((p: any) => p.status === 'paga').length || 0,
          atrasadas: parcelas?.filter((p: any) => p.status === 'atrasada').length || 0
        }
      };

      return resumo;
    }, 'dashboard:resumo');
  }
}
