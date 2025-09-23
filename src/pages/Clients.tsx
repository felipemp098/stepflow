import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { StatusChip } from '@/components/ui-custom/StatusChip';
import { EmptyState } from '@/components/ui-custom/EmptyState';

const mockClients = [
  {
    id: '1',
    name: 'Tech Solutions Corp',
    email: 'contato@techsolutions.com',
    phone: '(11) 99999-1234',
    status: 'active' as const,
    createdAt: '2024-01-15',
  },
  {
    id: '2', 
    name: 'Digital Innovators Ltd',
    email: 'hello@digitalinnovators.com',
    phone: '(11) 98888-5678',
    status: 'active' as const,
    createdAt: '2024-02-03',
  },
  {
    id: '3',
    name: 'Future Systems Inc',
    email: 'info@futuresystems.com',
    phone: '(11) 97777-9012',
    status: 'pending' as const,
    createdAt: '2024-02-10',
  },
  {
    id: '4',
    name: 'Smart Business Co',
    email: 'contact@smartbusiness.com',
    phone: '(11) 96666-3456',
    status: 'inactive' as const,
    createdAt: '2024-01-28',
  },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddClient = () => {
    window.location.href = '/clients/add';
  };

  if (mockClients.length === 0) {
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
                variant={selectedStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('active')}
                className="border-hairline"
              >
                Ativos
              </Button>
              <Button 
                variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus('pending')}
                className="border-hairline"
              >
                Pendentes
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
                <TableHead className="text-fg-2 font-medium">Nome</TableHead>
                <TableHead className="text-fg-2 font-medium">E-mail</TableHead>
                <TableHead className="text-fg-2 font-medium">Telefone</TableHead>
                <TableHead className="text-fg-2 font-medium">Status</TableHead>
                <TableHead className="text-fg-2 font-medium">Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, index) => (
                <motion.tr
                  key={client.id}
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
                    <div className="font-medium text-fg-1">{client.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-fg-2">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-fg-2">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={client.status}>
                      {client.status === 'active' ? 'Ativo' : 
                       client.status === 'pending' ? 'Pendente' : 'Inativo'}
                    </StatusChip>
                  </TableCell>
                  <TableCell>
                    <span className="text-fg-3">
                      {new Date(client.createdAt).toLocaleDateString('pt-BR')}
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
                        <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-error hover:bg-error/5">
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