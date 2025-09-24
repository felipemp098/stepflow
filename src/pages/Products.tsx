import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, MoreHorizontal, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { useProdutos } from '@/hooks/useProdutos';
import { ProdutoWithOfertas } from '@/types/produtos';

export default function Products() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const {
    produtos,
    stats,
    pagination,
    loading,
    error,
    removerProduto,
    atualizarProduto,
    atualizarFiltros,
    irParaPagina,
    recarregar
  } = useProdutos({
    autoLoad: true,
    filters: {
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter
    }
  });

  const handleAddProduct = () => {
    navigate('/products/add');
  };

  const handleEditProduct = (produto: ProdutoWithOfertas) => {
    navigate(`/products/edit/${produto.id}`);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    atualizarFiltros({
      search: value || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter
    });
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    atualizarFiltros({
      search: searchTerm || undefined,
      status: value === 'all' ? undefined : value
    });
  };

  const handleDeleteProduct = async (produtoId: string) => {
    if (window.confirm('Tem certeza que deseja remover este produto?')) {
      await removerProduto(produtoId);
    }
  };

  const handleToggleStatus = async (produto: ProdutoWithOfertas) => {
    const newStatus = produto.status === 'ativo' ? 'inativo' : 'ativo';
    await atualizarProduto(produto.id, { status: newStatus });
  };

  if (loading && produtos.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Produtos" 
          description="Gerencie seus produtos e ofertas"
          action={{ label: 'Adicionar Produto', onClick: handleAddProduct }}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Produtos" 
          description="Gerencie seus produtos e ofertas"
          action={{ label: 'Adicionar Produto', onClick: handleAddProduct }}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={recarregar} variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (produtos.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Produtos" 
          description="Gerencie seus produtos e ofertas"
          action={{ label: 'Adicionar Produto', onClick: handleAddProduct }}
        />
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Comece criando seu primeiro produto no sistema"
          action={{ label: 'Adicionar Produto', onClick: handleAddProduct }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Produtos" 
        description="Gerencie seus produtos, ofertas e jornadas"
        action={{ label: 'Adicionar Produto', onClick: handleAddProduct }}
      />

      {/* Filtros e busca */}
      <Card className="p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </Card>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-fg-1">{stats.total}</div>
            <div className="text-sm text-fg-3">Total de produtos</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.ativos}</div>
            <div className="text-sm text-fg-3">Produtos ativos</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.inativos}</div>
            <div className="text-sm text-fg-3">Produtos inativos</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.com_ofertas}</div>
            <div className="text-sm text-fg-3">Com ofertas</div>
          </Card>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="shadow-card-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-hairline">
                <TableHead className="text-fg-2 font-medium">Nome</TableHead>
                <TableHead className="text-fg-2 font-medium">Status</TableHead>
                <TableHead className="text-fg-2 font-medium">Nº de ofertas</TableHead>
                <TableHead className="text-fg-2 font-medium">Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((produto, index) => (
                <motion.tr
                  key={produto.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.16, 
                    delay: index * 0.05,
                    ease: [0.2, 0, 0, 1] 
                  }}
                  className="border-b border-hairline hover:bg-surface-1/50 transition-colors"
                >
                  <TableCell>
                    <div>
                      <div className="font-medium text-fg-1">{produto.nome}</div>
                      {produto.descricao && (
                        <div className="text-sm text-fg-3 mt-1">{produto.descricao}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      produto.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {produto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-fg-2">{produto.ofertas_count}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-fg-3">
                      {produto.created_at 
                        ? new Date(produto.created_at).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-hairline">
                        <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-fg-1 hover:bg-accent"
                          onClick={() => handleEditProduct(produto)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-fg-1 hover:bg-accent"
                          onClick={() => handleToggleStatus(produto)}
                        >
                          {produto.status === 'ativo' ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                          Gerenciar ofertas
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-error hover:bg-error/5"
                          onClick={() => handleDeleteProduct(produto.id)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>

      {/* Paginação */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-fg-3">
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} produtos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => irParaPagina(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => irParaPagina(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}