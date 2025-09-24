import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from 'jsr:@supabase/supabase-js@2';

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

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

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-client-id',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extrair ID do cliente da URL
    const clienteId = pathParts[pathParts.length - 1];
    
    if (!clienteId) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'CLIENT_ID_REQUIRED',
            message: 'ID do cliente é obrigatório'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar formato UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(clienteId)) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'INVALID_CLIENT_ID',
            message: 'Formato de ID do cliente inválido'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validar header X-Client-Id
    const clientHeader = req.headers.get('X-Client-Id');
    if (!clientHeader) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'TENANT_HEADER_REQUIRED',
            message: 'Header X-Client-Id é obrigatório'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verificar compatibilidade entre rota e header
    if (clienteId !== clientHeader) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'CLIENT_MISMATCH',
            message: 'Rota e contexto de cliente não coincidem'
          }
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Usuário não autenticado'
          }
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extrair parâmetros de query
    const searchParams = url.searchParams;
    const c_page = parseInt(searchParams.get('c_page') || '1');
    const c_size = parseInt(searchParams.get('c_size') || '10');
    const a_page = parseInt(searchParams.get('a_page') || '1');
    const a_size = parseInt(searchParams.get('a_size') || '10');
    const c_search = searchParams.get('c_search') || '';
    const a_search = searchParams.get('a_search') || '';
    const c_status = searchParams.get('c_status') || 'all';
    const a_status = searchParams.get('a_status') || 'all';

    // Buscar dados do cliente
    const { data: cliente, error: clienteError } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', clienteId)
      .single();

    if (clienteError || !cliente) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'NOT_FOUND',
            message: 'Cliente não encontrado'
          }
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calcular métricas
    const metricas = await calculateMetricas(supabase, clienteId);

    // Buscar contratos
    const contratos = await getContratos(supabase, clienteId, {
      page: c_page,
      size: c_size,
      search: c_search,
      status: c_status
    });

    // Buscar alunos
    const alunos = await getAlunos(supabase, clienteId, {
      page: a_page,
      size: a_size,
      search: a_search,
      status: a_status
    });

    const overview: ClienteOverview = {
      cliente,
      metricas,
      contratos,
      alunos
    };

    return new Response(
      JSON.stringify({
        data: overview,
        meta: {
          request_id: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Erro na Edge Function:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor'
        }
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

/**
 * Calcula métricas do cliente
 */
async function calculateMetricas(supabase: any, clienteId: string) {
  // Receita total (contratos não cancelados)
  const { data: receitaData } = await supabase
    .from('contratos')
    .select('valor_total')
    .eq('cliente_id', clienteId)
    .neq('status', 'cancelado');

  const receita_total_contratos = receitaData?.reduce((sum: number, contrato: any) => sum + (contrato.valor_total || 0), 0) || 0;

  // Parcelas em aberto
  const { data: parcelasAberto } = await supabase
    .from('parcelas')
    .select('valor')
    .eq('cliente_id', clienteId)
    .eq('status', 'aberto');

  const parcelas_em_aberto_qtd = parcelasAberto?.length || 0;
  const parcelas_em_aberto_valor = parcelasAberto?.reduce((sum: number, parcela: any) => sum + (parcela.valor || 0), 0) || 0;

  // Parcelas atrasadas (abertas e vencimento < hoje)
  const hoje = new Date().toISOString().split('T')[0];
  const { data: parcelasAtrasadas } = await supabase
    .from('parcelas')
    .select('valor')
    .eq('cliente_id', clienteId)
    .eq('status', 'aberto')
    .lt('vencimento', hoje);

  const parcelas_atrasadas_qtd = parcelasAtrasadas?.length || 0;
  const parcelas_atrasadas_valor = parcelasAtrasadas?.reduce((sum: number, parcela: any) => sum + (parcela.valor || 0), 0) || 0;

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

  const alunos_vinculados_qtd = new Set(alunosVinculados?.map((ca: any) => ca.aluno_id)).size || 0;

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
async function getContratos(
  supabase: any,
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
    throw new Error(`Erro ao buscar contratos: ${itemsError.message}`);
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
    throw new Error(`Erro ao contar contratos: ${countError.message}`);
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
async function getAlunos(
  supabase: any,
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
    throw new Error(`Erro ao buscar alunos: ${itemsError.message}`);
  }

  // Extrair alunos únicos
  const alunosMap = new Map();
  contratosAlunos?.forEach((ca: any) => {
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
    throw new Error(`Erro ao contar alunos: ${countError.message}`);
  }

  return {
    items,
    page,
    page_size: size,
    total: count || 0
  };
}
