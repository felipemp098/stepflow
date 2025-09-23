import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';

const mockProducts = [
  {
    id: '1',
    name: 'Consultoria Premium',
    offers: 2,
    createdAt: '2024-01-10',
    description: 'Consultoria estratégica completa para empresas de tecnologia',
  },
  {
    id: '2',
    name: 'Mentoria Intensiva',
    offers: 3,
    createdAt: '2024-01-15',
    description: 'Programa de mentoria para líderes e executivos',
  },
  {
    id: '3',
    name: 'Treinamento Corporativo',
    offers: 1,
    createdAt: '2024-02-01',
    description: 'Capacitação de equipes em metodologias ágeis',
  },
];

export default function Products() {
  const handleAddProduct = () => {
    console.log('Add product');
  };

  if (mockProducts.length === 0) {
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
                <TableHead className="text-fg-2 font-medium">Nº de ofertas</TableHead>
                <TableHead className="text-fg-2 font-medium">Criado em</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product, index) => (
                <motion.tr
                  key={product.id}
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
                      <div className="font-medium text-fg-1">{product.name}</div>
                      <div className="text-sm text-fg-3 mt-1">{product.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-fg-2">{product.offers}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-fg-3">
                      {new Date(product.createdAt).toLocaleDateString('pt-BR')}
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
                        <DropdownMenuItem className="text-fg-1 hover:bg-accent">
                          Gerenciar ofertas
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
    </div>
  );
}