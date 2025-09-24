import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, Users, Loader2, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { StatusChip } from '@/components/ui-custom/StatusChip';
import { EmptyState } from '@/components/ui-custom/EmptyState';
import { useClientes } from '@/hooks/useClientes';
import { Database } from '@/integrations/supabase/types';

type Cliente = Database['public']['Tables']['clientes']['Row'];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Hook para gerenciar clientes
  const {
    clientes,
    loading,
    error,
    deleteCliente,
    clearError
  } = useClientes();

  // Filtrar clientes localmente
  const filteredClients = clientes.filter(cliente => {
    const matchesSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || cliente.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    window.location.href = '/clients/add';
  };

  const handleDeleteClient = async (id: string, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      const result = await deleteCliente(id);
      if (!result.success) {
        alert(`Erro ao excluir cliente: ${result.error}`);
      }
    }
  };

  const handleEditClient = (id: string) => {
    window.location.href = `/clients/edit/${id}`;
  };

  const handleViewClient = (id: string) => {
    window.location.href = `/clients/${id}`;
  };

  // Mostrar erro se houver
  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Clientes" 
          description="Gerencie seus clientes"
          action={{ label: 'Adicionar Cliente', onClick: handleAddClient }}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={clearError}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Clientes" 
          description="Gerencie seus clientes"
          action={{ label: 'Adicionar Cliente', onClick: handleAddClient }}
        />
        <Card className="shadow-card-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-fg-3">Carregando clientes...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader 
          title="Clientes" 
          description="Gerencie seus clientes"
          action={{ label: 'Adicionar Cliente', onClick: handleAddClient }}
        />
        <EmptyState
          icon={Users}
          title="Nenhum cliente encontrado"
          description="Comece adicionando seu primeiro cliente ao sistema"
          action={{ label: 'Adicionar Cliente', onClick: handleAddClient }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Clientes" 
        description="Gerencie seus clientes e relacionamentos"
        action={{ label: 'Adicionar Cliente', onClick: handleAddClient }}
      />

      {/* Filters */}
      <Card className="shadow-card-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-3" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-hairline"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('all')}
                className="border-hairline"
              >
                Todos
              </Button>
              <Button 
                variant={selectedStatus === 'ativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('ativo')}
                className="border-hairline"
              >
                Ativos
              </Button>
              <Button 
                variant={selectedStatus === 'inativo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('inativo')}
                className="border-hairline"
              >
                Inativos
              </Button>
              <Button 
                variant={selectedStatus === 'suspenso' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('suspenso')}
                className="border-hairline"
              >
                Suspensos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="shadow-card-md">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-hairline">
                <TableHead className="text-fg-2 font-medium text-left">Nome</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">E-mail</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">Telefone</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">Alunos</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">Contratos</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">Status</TableHead>
                <TableHead className="text-fg-2 font-medium text-center">Data de criação</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((cliente, index) => (
                <motion.tr
                  key={cliente.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.16, 
                    delay: index * 0.05,
                    ease: [0.2, 0, 0, 1] 
                  }}
                  className="border-b border-hairline hover:bg-surface-1/50 transition-colors"
                >
                  <TableCell className="text-left">
                    <div className="font-medium text-fg-1">{cliente.nome}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-fg-2">
                      <Mail className="h-4 w-4" />
                      <span className="text-fg-3">
                        {cliente.email || 'Não informado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2 text-fg-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-fg-3">
                        {cliente.telefone || 'Não informado'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-fg-3" />
                      <span className="text-fg-2 font-medium">
                        {Math.floor(Math.random() * 20) + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-4 w-4 text-fg-3" />
                      <span className="text-fg-2 font-medium">
                        {Math.floor(Math.random() * 10) + 1}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center">
                      <StatusChip status={cliente.status === 'ativo' ? 'active' : cliente.status === 'inativo' ? 'inactive' : 'pending'}>
                        {cliente.status === 'ativo' ? 'Ativo' : 
                         cliente.status === 'inativo' ? 'Inativo' : 'Suspenso'}
                      </StatusChip>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-fg-3">
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString('pt-BR') : 'Não informado'}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-hairline">
                        <DropdownMenuItem 
                          className="text-fg-1 hover:bg-accent cursor-pointer"
                          onClick={() => handleViewClient(cliente.id)}
                        >
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-fg-1 hover:bg-accent cursor-pointer"
                          onClick={() => handleEditClient(cliente.id)}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-error hover:bg-error/5 cursor-pointer"
                          onClick={() => handleDeleteClient(cliente.id, cliente.nome)}
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

      {filteredClients.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
        >
          <Card className="shadow-card-md">
            <CardContent className="p-12 text-center">
              <h3 className="text-lg font-semibold text-fg-1 mb-2">Nenhum resultado encontrado</h3>
              <p className="text-fg-3">Tente ajustar os filtros ou termo de busca</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}