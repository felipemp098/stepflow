import { supabase } from '@/integrations/supabase/client';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '@/lib/api/response';
import { Logger } from '@/lib/logging/logger';

interface ClienteOverview {
  cliente: {
    id: string;
    nome: string;
    status: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    cnpj?: string;
    endereco?: string;
    instagram?: string;
    observacoes?: string;
    created_at: string;
  };
  metricas: {
    receita_total_contratos: number;
    parcelas_em_aberto_qtd: number;
    parcelas_em_aberto_valor: number;
    parcelas_atrasadas_qtd: number;
    parcelas_atrasadas_valor: number;
    entradas_pendentes_qtd: number;
    contratos_ativos_qtd: number;
    alunos_vinculados_qtd: number;
  };
  contratos: {
    items: Array<{
      id: string;
      produto_nome: string;
      oferta_nome: string;
      inicio: string;
      encerramento: string;
      valor_total: number;
      valor_entrada: number;
      parcelas: number;
      status: string;
    }>;
    page: number;
    page_size: number;
    total: number;
  };
  alunos: {
    items: Array<{
      id: string;
      nome: string;
      email: string;
      status: string;
      created_at: string;
    }>;
    page: number;
    page_size: number;
    total: number;
  };
}

export class ClientOverviewHandler {
  private requestId: string;
  private logger: ReturnType<typeof Logger.createRequestLogger>;

  constructor(requestId: string) {
    this.requestId = requestId;
    this.logger = Logger.createRequestLogger();
  }

  /**
   * Busca overview completo do cliente com métricas, contratos e alunos
   */
  async getOverview(
    clienteId: string,
    options: {
      c_page?: number;
      c_size?: number;
      a_page?: number;
      a_size?: number;
      c_search?: string;
      a_search?: string;
      c_status?: string;
      a_status?: string;
    } = {}
  ): Promise<ApiResponse<ClienteOverview>> {
    try {
      this.logger.info('Buscando overview do cliente', { clienteId, options, requestId: this.requestId });

      // Buscar dados do cliente
      const cliente = await this.getClienteData(clienteId);
      if (!cliente) {
        return createErrorResponse('NOT_FOUND', 'Cliente não encontrado');
      }

      // Buscar métricas
      const metricas = await this.getClienteMetricas(clienteId);

      // Buscar contratos com paginação e filtros
      const contratos = await this.getClienteContratos(clienteId, {
        page: options.c_page || 1,
        size: options.c_size || 10,
        search: options.c_search || '',
        status: options.c_status || 'all'
      });

      // Buscar alunos com paginação e filtros
      const alunos = await this.getClienteAlunos(clienteId, {
        page: options.a_page || 1,
        size: options.a_size || 10,
        search: options.a_search || '',
        status: options.a_status || 'all'
      });

      const overview: ClienteOverview = {
        cliente,
        metricas,
        contratos,
        alunos
      };

      this.logger.info('Overview do cliente carregado com sucesso', { 
        clienteId, 
        contratosCount: contratos.items.length,
        alunosCount: alunos.items.length,
        requestId: this.requestId 
      });

      return createSuccessResponse(overview);
    } catch (error) {
      this.logger.error('Erro ao buscar overview do cliente', { 
        clienteId, 
        error, 
        requestId: this.requestId 
      });
      return createErrorResponse('UNEXPECTED_ERROR', 'Erro inesperado ao buscar overview do cliente');
    }
  }

  /**
   * Busca dados cadastrais do cliente
   */
  private async getClienteData(clienteId: string) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (error) {
      this.logger.error('Erro ao buscar dados do cliente', { clienteId, error: error.message, requestId: this.requestId });
      throw error;
    }

    return data;
  }

  /**
   * Calcula métricas do cliente
   */
  private async getClienteMetricas(clienteId: string) {
    // Receita total (contratos não cancelados)
    const { data: receitaData } = await supabase
      .from('contratos')
      .select('valor_total')
      .eq('cliente_id', clienteId)
      .neq('status', 'cancelado');

    const receita_total_contratos = receitaData?.reduce((sum, contrato) => sum + (contrato.valor_total || 0), 0) || 0;

    // Parcelas em aberto
    const { data: parcelasAberto } = await supabase
      .from('parcelas')
      .select('valor')
      .eq('cliente_id', clienteId)
      .eq('status', 'aberto');

    const parcelas_em_aberto_qtd = parcelasAberto?.length || 0;
    const parcelas_em_aberto_valor = parcelasAberto?.reduce((sum, parcela) => sum + (parcela.valor || 0), 0) || 0;

    // Parcelas atrasadas (abertas e vencimento < hoje)
    const hoje = new Date().toISOString().split('T')[0];
    const { data: parcelasAtrasadas } = await supabase
      .from('parcelas')
      .select('valor')
      .eq('cliente_id', clienteId)
      .eq('status', 'aberto')
      .lt('vencimento', hoje);

    const parcelas_atrasadas_qtd = parcelasAtrasadas?.length || 0;
    const parcelas_atrasadas_valor = parcelasAtrasadas?.reduce((sum, parcela) => sum + (parcela.valor || 0), 0) || 0;

    // Entradas pendentes
    const { count: entradasPendentes } = await supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId)
      .gt('valor_entrada', 0)
      .neq('entrada_status', 'pago');

    const entradas_pendentes_qtd = entradasPendentes || 0;

    // Contratos ativos (status != 'cancelado' e hoje entre início e encerramento)
    const { count: contratosAtivos } = await supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId)
      .neq('status', 'cancelado')
      .lte('inicio', hoje)
      .gte('encerramento', hoje);

    const contratos_ativos_qtd = contratosAtivos || 0;

    // Alunos vinculados (distintos em contratos_alunos)
    const { data: alunosVinculados } = await supabase
      .from('contratos_alunos')
      .select('aluno_id')
      .eq('contratos.cliente_id', clienteId);

    const alunos_vinculados_qtd = new Set(alunosVinculados?.map(ca => ca.aluno_id)).size || 0;

    return {
      receita_total_contratos,
      parcelas_em_aberto_qtd,
      parcelas_em_aberto_valor,
      parcelas_atrasadas_qtd,
      parcelas_atrasadas_valor,
      entradas_pendentes_qtd,
      contratos_ativos_qtd,
      alunos_vinculados_qtd
    };
  }

  /**
   * Busca contratos do cliente com paginação e filtros
   */
  private async getClienteContratos(
    clienteId: string,
    options: {
      page: number;
      size: number;
      search: string;
      status: string;
    }
  ) {
    const { page, size, search, status } = options;
    const offset = (page - 1) * size;

    let query = supabase
      .from('contratos')
      .select(`
        id,
        produto_nome,
        oferta_nome,
        inicio,
        encerramento,
        valor_total,
        valor_entrada,
        parcelas,
        status
      `)
      .eq('cliente_id', clienteId)
      .range(offset, offset + size - 1)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`produto_nome.ilike.%${search}%,oferta_nome.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: items, error: itemsError } = await query;

    if (itemsError) {
      this.logger.error('Erro ao buscar contratos do cliente', { 
        clienteId, 
        error: itemsError.message, 
        requestId: this.requestId 
      });
      throw itemsError;
    }

    // Contar total para paginação
    let countQuery = supabase
      .from('contratos')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteId);

    if (search) {
      countQuery = countQuery.or(`produto_nome.ilike.%${search}%,oferta_nome.ilike.%${search}%`);
    }

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      this.logger.error('Erro ao contar contratos do cliente', { 
        clienteId, 
        error: countError.message, 
        requestId: this.requestId 
      });
      throw countError;
    }

    return {
      items: items || [],
      page,
      page_size: size,
      total: count || 0
    };
  }

  /**
   * Busca alunos do cliente com paginação e filtros
   */
  private async getClienteAlunos(
    clienteId: string,
    options: {
      page: number;
      size: number;
      search: string;
      status: string;
    }
  ) {
    const { page, size, search, status } = options;
    const offset = (page - 1) * size;

    // Buscar alunos através da relação contratos_alunos
    let query = supabase
      .from('contratos_alunos')
      .select(`
        aluno_id,
        alunos!inner(
          id,
          nome,
          email,
          status,
          created_at
        )
      `)
      .eq('contratos.cliente_id', clienteId)
      .range(offset, offset + size - 1)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (search) {
      query = query.or(`alunos.nome.ilike.%${search}%,alunos.email.ilike.%${search}%`);
    }

    if (status !== 'all') {
      query = query.eq('alunos.status', status);
    }

    const { data: contratosAlunos, error: itemsError } = await query;

    if (itemsError) {
      this.logger.error('Erro ao buscar alunos do cliente', { 
        clienteId, 
        error: itemsError.message, 
        requestId: this.requestId 
      });
      throw itemsError;
    }

    // Extrair alunos únicos
    const alunosMap = new Map();
    contratosAlunos?.forEach(ca => {
      if (ca.alunos && !alunosMap.has(ca.alunos.id)) {
        alunosMap.set(ca.alunos.id, ca.alunos);
      }
    });

    const items = Array.from(alunosMap.values());

    // Contar total para paginação
    let countQuery = supabase
      .from('contratos_alunos')
      .select('aluno_id', { count: 'exact', head: true })
      .eq('contratos.cliente_id', clienteId);

    if (search) {
      countQuery = countQuery.or(`alunos.nome.ilike.%${search}%,alunos.email.ilike.%${search}%`);
    }

    if (status !== 'all') {
      countQuery = countQuery.eq('alunos.status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      this.logger.error('Erro ao contar alunos do cliente', { 
        clienteId, 
        error: countError.message, 
        requestId: this.requestId 
      });
      throw countError;
    }

    return {
      items,
      page,
      page_size: size,
      total: count || 0
    };
  }
}
