import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProdutosHandler } from '@/lib/api/handlers/produtos';
import { 
  ProdutoWithOfertas, 
  ProdutoFormData, 
  ProdutoFilters, 
  ProdutoStats,
  ProdutosResponse,
  ProdutoBundleData
} from '@/types/produtos';
import { useToast } from '@/hooks/use-toast';

interface UseProdutosOptions {
  autoLoad?: boolean;
  page?: number;
  limit?: number;
  filters?: ProdutoFilters;
}

interface UseProdutosReturn {
  // Dados
  produtos: ProdutoWithOfertas[];
  stats: ProdutoStats | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;

  // Estados
  loading: boolean;
  error: string | null;

  // Ações
  carregarProdutos: (filters?: ProdutoFilters, page?: number) => Promise<void>;
  buscarProduto: (produtoId: string) => Promise<ProdutoWithOfertas | null>;
  criarProduto: (dados: ProdutoFormData) => Promise<boolean>;
  criarProdutoBundle: (dados: ProdutoBundleData) => Promise<boolean>;
  atualizarProduto: (produtoId: string, dados: Partial<ProdutoFormData>) => Promise<boolean>;
  removerProduto: (produtoId: string) => Promise<boolean>;
  atualizarFiltros: (filters: ProdutoFilters) => void;
  irParaPagina: (page: number) => void;
  recarregar: () => Promise<void>;
}

export function useProdutos(options: UseProdutosOptions = {}): UseProdutosReturn {
  const { user, currentCliente } = useAuth();
  const { toast } = useToast();
  
  const [produtos, setProdutos] = useState<ProdutoWithOfertas[]>([]);
  const [stats, setStats] = useState<ProdutoStats | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProdutoFilters>(options.filters || {});
  const [currentPage, setCurrentPage] = useState(options.page || 1);
  const [limit] = useState(options.limit || 10);

  // Carregar produtos
  const carregarProdutos = useCallback(async (
    newFilters?: ProdutoFilters, 
    page?: number
  ) => {
    if (!currentClientee?.id) {
      setError('Cliente não selecionado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProdutosHandler.listarProdutos(
        currentCliente.id,
        newFilters || filters,
        page || currentPage,
        limit
      );

      if (response.success && response.data) {
        setProdutos(response.data.produtos);
        setStats(response.data.stats);
        setPagination(response.data.pagination || null);
        setCurrentPage(page || currentPage);
      } else {
        setError(response.error || 'Erro ao carregar produtos');
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao carregar produtos',
          variant: 'destructive'
        });
      }
    } catch (err) {
      const errorMessage = 'Erro inesperado ao carregar produtos';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [currentCliente?.id, filters, currentPage, limit, toast]);

  // Buscar produto específico
  const buscarProduto = useCallback(async (produtoId: string): Promise<ProdutoWithOfertas | null> => {
    if (!currentCliente?.id) {
      toast({
        title: 'Erro',
        description: 'Cliente não selecionado',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const response = await ProdutosHandler.buscarProduto(currentCliente.id, produtoId);
      
      if (response.success && response.data) {
        return response.data;
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao buscar produto',
          variant: 'destructive'
        });
        return null;
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao buscar produto',
        variant: 'destructive'
      });
      return null;
    }
  }, [currentCliente?.id, toast]);

  // Criar produto
  const criarProduto = useCallback(async (dados: ProdutoFormData): Promise<boolean> => {
    if (!currentCliente?.id) {
      toast({
        title: 'Erro',
        description: 'Cliente não selecionado',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await ProdutosHandler.criarProduto(currentCliente.id, dados);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso'
        });
        // Recarregar lista
        await carregarProdutos();
        return true;
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao criar produto',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar produto',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentCliente?.id, carregarProdutos, toast]);

  // Criar produto bundle
  const criarProdutoBundle = useCallback(async (dados: ProdutoBundleData): Promise<boolean> => {
    if (!currentCliente?.id) {
      toast({
        title: 'Erro',
        description: 'Cliente não selecionado',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await ProdutosHandler.criarProdutoBundle(currentCliente.id, dados);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto criado com sucesso'
        });
        // Recarregar lista
        await carregarProdutos();
        return true;
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao criar produto',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar produto',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentCliente?.id, carregarProdutos, toast]);

  // Atualizar produto
  const atualizarProduto = useCallback(async (
    produtoId: string, 
    dados: Partial<ProdutoFormData>
  ): Promise<boolean> => {
    if (!currentCliente?.id) {
      toast({
        title: 'Erro',
        description: 'Cliente não selecionado',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await ProdutosHandler.atualizarProduto(
        currentCliente.id, 
        produtoId, 
        dados
      );
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto atualizado com sucesso'
        });
        // Recarregar lista
        await carregarProdutos();
        return true;
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao atualizar produto',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao atualizar produto',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentCliente?.id, carregarProdutos, toast]);

  // Remover produto
  const removerProduto = useCallback(async (produtoId: string): Promise<boolean> => {
    if (!currentCliente?.id) {
      toast({
        title: 'Erro',
        description: 'Cliente não selecionado',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const response = await ProdutosHandler.removerProduto(currentCliente.id, produtoId);
      
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Produto removido com sucesso'
        });
        // Recarregar lista
        await carregarProdutos();
        return true;
      } else {
        toast({
          title: 'Erro',
          description: response.error || 'Erro ao remover produto',
          variant: 'destructive'
        });
        return false;
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao remover produto',
        variant: 'destructive'
      });
      return false;
    }
  }, [currentCliente?.id, carregarProdutos, toast]);

  // Atualizar filtros
  const atualizarFiltros = useCallback((newFilters: ProdutoFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset para primeira página
  }, []);

  // Ir para página específica
  const irParaPagina = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Recarregar dados
  const recarregar = useCallback(async () => {
    await carregarProdutos();
  }, [carregarProdutos]);

  // Auto-load quando necessário
  useEffect(() => {
    if (options.autoLoad !== false && currentCliente?.id && user) {
      carregarProdutos();
    }
  }, [currentCliente?.id, user, options.autoLoad, carregarProdutos]);

  // Recarregar quando filtros ou página mudarem
  useEffect(() => {
    if (currentCliente?.id && user) {
      carregarProdutos(filters, currentPage);
    }
  }, [filters, currentPage, currentCliente?.id, user, carregarProdutos]);

  return {
    // Dados
    produtos,
    stats,
    pagination,

    // Estados
    loading,
    error,

    // Ações
    carregarProdutos,
    buscarProduto,
    criarProduto,
    criarProdutoBundle,
    atualizarProduto,
    removerProduto,
    atualizarFiltros,
    irParaPagina,
    recarregar
  };
}
