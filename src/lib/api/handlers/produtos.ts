import { supabase } from '@/integrations/supabase/client';
import { Logger } from '@/lib/logging/logger';
import { ApiResponse } from '../response';
import { 
  Produto, 
  ProdutoInsert, 
  ProdutoUpdate, 
  ProdutoWithOfertas, 
  ProdutoFormData, 
  ProdutoFilters, 
  ProdutoStats,
  ProdutosResponse,
  ProdutoBundleData,
  OfertaFormData,
  JornadaFormData
} from '@/types/produtos';

export class ProdutosHandler {
  /**
   * Lista todos os produtos do cliente atual
   */
  static async listarProdutos(
    clienteId: string,
    filters?: ProdutoFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ProdutosResponse>> {
    try {
      console.log('Listando produtos', { clienteId, filters, page, limit });

      // Construir query base
      let query = supabase
        .from('produtos')
        .select(`
          *,
          ofertas:ofertas(id, nome, descricao, preco, status, created_at)
        `)
        .eq('cliente_id', clienteId)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,descricao.ilike.%${filters.search}%`);
      }

      // Aplicar paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data: produtos, error, count } = await query;

      if (error) {
        console.error('Erro ao listar produtos', { error, clienteId });
        return {
          success: false,
          error: 'Erro ao carregar produtos',
          details: error.message
        };
      }

      // Buscar estatísticas
      const stats = await this.obterEstatisticas(clienteId);
      if (!stats.success) {
        console.warn('Erro ao obter estatísticas dos produtos', { clienteId });
      }

      // Processar dados
      const produtosComOfertas: ProdutoWithOfertas[] = (produtos || []).map(produto => ({
        ...produto,
        ofertas: produto.ofertas || [],
        ofertas_count: produto.ofertas?.length || 0
      }));

      const totalPages = count ? Math.ceil(count / limit) : 1;

      return {
        success: true,
        data: {
          produtos: produtosComOfertas,
          stats: stats.data || {
            total: 0,
            ativos: 0,
            inativos: 0,
            com_ofertas: 0
          },
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages
          }
        }
      };

    } catch (error) {
      console.error('Erro inesperado ao listar produtos', { error, clienteId });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um produto específico por ID
   */
  static async buscarProduto(
    clienteId: string,
    produtoId: string
  ): Promise<ApiResponse<ProdutoWithOfertas>> {
    try {
      console.log('Buscando produto', { clienteId, produtoId });

      const { data: produto, error } = await supabase
        .from('produtos')
        .select(`
          *,
          ofertas:ofertas(id, nome, descricao, preco, status, created_at)
        `)
        .eq('cliente_id', clienteId)
        .eq('id', produtoId)
        .single();

      if (error) {
        console.error('Erro ao buscar produto', { error, clienteId, produtoId });
        return {
          success: false,
          error: 'Produto não encontrado',
          details: error.message
        };
      }

      const produtoComOfertas: ProdutoWithOfertas = {
        ...produto,
        ofertas: produto.ofertas || [],
        ofertas_count: produto.ofertas?.length || 0
      };

      return {
        success: true,
        data: produtoComOfertas
      };

    } catch (error) {
      console.error('Erro inesperado ao buscar produto', { error, clienteId, produtoId });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria um novo produto
   */
  static async criarProduto(
    clienteId: string,
    dados: ProdutoFormData
  ): Promise<ApiResponse<Produto>> {
    try {
      console.log('Criando produto', { clienteId, dados });

      const produtoData: ProdutoInsert = {
        cliente_id: clienteId,
        nome: dados.nome,
        descricao: dados.descricao || null,
        status: dados.status || 'ativo'
      };

      const { data: produto, error } = await supabase
        .from('produtos')
        .insert(produtoData)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar produto', { error, clienteId, dados });
        return {
          success: false,
          error: 'Erro ao criar produto',
          details: error.message
        };
      }

      console.log('Produto criado com sucesso', { produtoId: produto.id, clienteId });
      return {
        success: true,
        data: produto
      };

    } catch (error) {
      console.error('Erro inesperado ao criar produto', { error, clienteId, dados });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Atualiza um produto existente
   */
  static async atualizarProduto(
    clienteId: string,
    produtoId: string,
    dados: Partial<ProdutoFormData>
  ): Promise<ApiResponse<Produto>> {
    try {
      console.log('Atualizando produto', { clienteId, produtoId, dados });

      const updateData: ProdutoUpdate = {
        nome: dados.nome,
        descricao: dados.descricao,
        status: dados.status
      };

      const { data: produto, error } = await supabase
        .from('produtos')
        .update(updateData)
        .eq('cliente_id', clienteId)
        .eq('id', produtoId)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar produto', { error, clienteId, produtoId, dados });
        return {
          success: false,
          error: 'Erro ao atualizar produto',
          details: error.message
        };
      }

      console.log('Produto atualizado com sucesso', { produtoId, clienteId });
      return {
        success: true,
        data: produto
      };

    } catch (error) {
      console.error('Erro inesperado ao atualizar produto', { error, clienteId, produtoId, dados });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Remove um produto
   */
  static async removerProduto(
    clienteId: string,
    produtoId: string
  ): Promise<ApiResponse<void>> {
    try {
      console.log('Removendo produto', { clienteId, produtoId });

      // Verificar se o produto tem ofertas ativas
      const { data: ofertas, error: ofertasError } = await supabase
        .from('ofertas')
        .select('id')
        .eq('cliente_id', clienteId)
        .eq('produto_id', produtoId)
        .eq('status', 'ativo');

      if (ofertasError) {
        console.error('Erro ao verificar ofertas do produto', { error: ofertasError, clienteId, produtoId });
        return {
          success: false,
          error: 'Erro ao verificar dependências',
          details: ofertasError.message
        };
      }

      if (ofertas && ofertas.length > 0) {
        return {
          success: false,
          error: 'Não é possível remover produto com ofertas ativas',
          details: 'Remova todas as ofertas antes de excluir o produto'
        };
      }

      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('cliente_id', clienteId)
        .eq('id', produtoId);

      if (error) {
        console.error('Erro ao remover produto', { error, clienteId, produtoId });
        return {
          success: false,
          error: 'Erro ao remover produto',
          details: error.message
        };
      }

      console.log('Produto removido com sucesso', { produtoId, clienteId });
      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      console.error('Erro inesperado ao remover produto', { error, clienteId, produtoId });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Obtém estatísticas dos produtos
   */
  static async obterEstatisticas(clienteId: string): Promise<ApiResponse<ProdutoStats>> {
    try {
      console.log('Obtendo estatísticas dos produtos', { clienteId });

      // Contar total de produtos
      const { count: total, error: totalError } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId);

      if (totalError) {
        console.error('Erro ao contar produtos', { error: totalError, clienteId });
        return {
          success: false,
          error: 'Erro ao obter estatísticas',
          details: totalError.message
        };
      }

      // Contar produtos ativos
      const { count: ativos, error: ativosError } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('status', 'ativo');

      if (ativosError) {
        console.error('Erro ao contar produtos ativos', { error: ativosError, clienteId });
        return {
          success: false,
          error: 'Erro ao obter estatísticas',
          details: ativosError.message
        };
      }

      // Contar produtos inativos
      const { count: inativos, error: inativosError } = await supabase
        .from('produtos')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteId)
        .eq('status', 'inativo');

      if (inativosError) {
        console.error('Erro ao contar produtos inativos', { error: inativosError, clienteId });
        return {
          success: false,
          error: 'Erro ao obter estatísticas',
          details: inativosError.message
        };
      }

      // Contar produtos com ofertas
      const { data: produtosComOfertas, error: ofertasError } = await supabase
        .from('produtos')
        .select(`
          id,
          ofertas:ofertas!inner(id)
        `)
        .eq('cliente_id', clienteId);

      if (ofertasError) {
        console.error('Erro ao contar produtos com ofertas', { error: ofertasError, clienteId });
        return {
          success: false,
          error: 'Erro ao obter estatísticas',
          details: ofertasError.message
        };
      }

      const stats: ProdutoStats = {
        total: total || 0,
        ativos: ativos || 0,
        inativos: inativos || 0,
        com_ofertas: produtosComOfertas?.length || 0
      };

      return {
        success: true,
        data: stats
      };

    } catch (error) {
      console.error('Erro inesperado ao obter estatísticas', { error, clienteId });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Cria produto com ofertas e jornadas em uma única transação atômica
   */
  static async criarProdutoBundle(
    clienteId: string,
    bundleData: ProdutoBundleData
  ): Promise<ApiResponse<{ id: string; status: string }>> {
    try {
      console.log('Criando produto bundle', { clienteId, bundleData });

      // Validar dados do produto
      if (!bundleData.produto.nome?.trim()) {
        return {
          success: false,
          error: 'Nome do produto é obrigatório',
          details: 'VALIDATION_ERROR'
        };
      }

      // Verificar se nome já existe (case-insensitive)
      const { data: existingProduto, error: checkError } = await supabase
        .from('produtos')
        .select('id')
        .eq('cliente_id', clienteId)
        .ilike('nome', bundleData.produto.nome.trim())
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao verificar nome duplicado', { error: checkError, clienteId });
        return {
          success: false,
          error: 'Erro ao verificar nome do produto',
          details: checkError.message
        };
      }

      if (existingProduto) {
        return {
          success: false,
          error: 'Já existe um produto com esse nome',
          details: 'CONFLICT_DUPLICATE_NAME'
        };
      }

      // Validar ofertas se existirem
      if (bundleData.ofertas && bundleData.ofertas.length > 0) {
        for (const oferta of bundleData.ofertas) {
          if (oferta.valor_total <= 0) {
            return {
              success: false,
              error: 'Valor total deve ser maior que zero',
              details: 'VALIDATION_ERROR'
            };
          }
          if (!oferta.ciclo || oferta.ciclo < 1) {
            return {
              success: false,
              error: 'Ciclo deve ser um número de meses maior que zero',
              details: 'VALIDATION_ERROR'
            };
          }
        }
      }

      // Validar jornadas se existirem
      if (bundleData.jornadas && bundleData.jornadas.length > 0) {
        for (const jornada of bundleData.jornadas) {
          if (!jornada.nome?.trim()) {
            return {
              success: false,
              error: 'Nome da jornada é obrigatório',
              details: 'VALIDATION_ERROR'
            };
          }
          for (const passo of jornada.passos) {
            if (!passo.nome?.trim()) {
              return {
                success: false,
                error: 'Nome do passo é obrigatório',
                details: 'VALIDATION_ERROR'
              };
            }
            if (!['sessao', 'reuniao', 'material', 'bonus', 'outro'].includes(passo.tipo)) {
              return {
                success: false,
                error: 'Tipo de passo inválido',
                details: 'VALIDATION_ERROR'
              };
            }
          }
        }
      }

      // Iniciar transação
      const { data: produto, error: produtoError } = await supabase
        .from('produtos')
        .insert({
          cliente_id: clienteId,
          nome: bundleData.produto.nome.trim(),
          descricao: bundleData.produto.descricao?.trim() || null,
          status: bundleData.produto.status || 'ativo'
        })
        .select()
        .single();

      if (produtoError) {
        console.error('Erro ao criar produto', { error: produtoError, clienteId, bundleData });
        return {
          success: false,
          error: 'Erro ao criar produto',
          details: produtoError.message
        };
      }

      // Criar ofertas se existirem
      if (bundleData.ofertas && bundleData.ofertas.length > 0) {
        const ofertasData = bundleData.ofertas.map(oferta => ({
          cliente_id: clienteId,
          produto_id: produto.id,
          nome: oferta.nome.trim(),
          preco: oferta.valor_total,
          descricao: `${oferta.ciclo} ${oferta.ciclo === 1 ? 'mês' : 'meses'}${oferta.observacoes ? ` - ${oferta.observacoes.trim()}` : ''}`,
          status: 'ativo'
        }));

        const { error: ofertasError } = await supabase
          .from('ofertas')
          .insert(ofertasData);

        if (ofertasError) {
          console.error('Erro ao criar ofertas', { error: ofertasError, produtoId: produto.id });
          // Rollback: deletar produto criado
          await supabase.from('produtos').delete().eq('id', produto.id);
          return {
            success: false,
            error: 'Erro ao criar ofertas',
            details: ofertasError.message
          };
        }
      }

      // Criar jornadas e passos se existirem
      if (bundleData.jornadas && bundleData.jornadas.length > 0) {
        for (const jornadaData of bundleData.jornadas) {
          // Criar jornada
          const { data: jornada, error: jornadaError } = await supabase
            .from('jornadas')
            .insert({
              cliente_id: clienteId,
              produto_id: produto.id,
              nome: jornadaData.nome.trim(),
              ordem: 0, // Será ajustado pelo backend se necessário
              status: 'ativo'
            })
            .select()
            .single();

          if (jornadaError) {
            console.error('Erro ao criar jornada', { error: jornadaError, produtoId: produto.id });
            // Rollback: deletar produto e ofertas criados
            await supabase.from('ofertas').delete().eq('produto_id', produto.id);
            await supabase.from('produtos').delete().eq('id', produto.id);
            return {
              success: false,
              error: 'Erro ao criar jornada',
              details: jornadaError.message
            };
          }

          // Criar passos da jornada
          if (jornadaData.passos && jornadaData.passos.length > 0) {
            const passosData = jornadaData.passos.map((passo, index) => ({
              cliente_id: clienteId,
              jornada_id: jornada.id,
              nome: passo.nome.trim(),
              tipo: passo.tipo,
              descricao: passo.observacoes?.trim() || null,
              ordem: passo.ordem || index + 1,
              status: 'ativo'
            }));

            const { error: passosError } = await supabase
              .from('passos')
              .insert(passosData);

            if (passosError) {
              console.error('Erro ao criar passos', { error: passosError, jornadaId: jornada.id });
              // Rollback: deletar tudo criado
              await supabase.from('passos').delete().eq('jornada_id', jornada.id);
              await supabase.from('jornadas').delete().eq('produto_id', produto.id);
              await supabase.from('ofertas').delete().eq('produto_id', produto.id);
              await supabase.from('produtos').delete().eq('id', produto.id);
              return {
                success: false,
                error: 'Erro ao criar passos',
                details: passosError.message
              };
            }
          }
        }
      }

      console.log('Produto bundle criado com sucesso', { produtoId: produto.id, clienteId });
      return {
        success: true,
        data: {
          id: produto.id,
          status: 'created'
        }
      };

    } catch (error) {
      console.error('Erro inesperado ao criar produto bundle', { error, clienteId, bundleData });
      return {
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}
