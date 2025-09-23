import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';

export default function ClientForm() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic here
    console.log('Form submitted');
    navigate('/clients');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/clients')}
          className="text-fg-2 hover:text-fg-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-fg-1">Adicionar Cliente</h1>
          <p className="text-fg-3 mt-1">Cadastre um novo cliente no sistema</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="shadow-card-md max-w-2xl">
          <CardHeader className="border-b border-hairline">
            <CardTitle className="text-lg font-semibold text-fg-1">Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-fg-1 font-medium">
                    Nome da Empresa *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Tech Solutions Corp"
                    required
                    className="bg-background border-hairline"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-fg-1 font-medium">
                    Status Inicial
                  </Label>
                  <Select defaultValue="active">
                    <SelectTrigger className="bg-background border-hairline">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-hairline">
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-fg-1 font-medium">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contato@empresa.com"
                    required
                    className="bg-background border-hairline"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-fg-1 font-medium">
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    className="bg-background border-hairline"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-fg-1 font-medium">
                    Endereço
                  </Label>
                  <Input
                    id="address"
                    placeholder="Rua, número, bairro"
                    className="bg-background border-hairline"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-fg-1 font-medium">
                      Cidade
                    </Label>
                    <Input
                      id="city"
                      placeholder="São Paulo"
                      className="bg-background border-hairline"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-fg-1 font-medium">
                      Estado
                    </Label>
                    <Input
                      id="state"
                      placeholder="SP"
                      className="bg-background border-hairline"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-fg-1 font-medium">
                      CEP
                    </Label>
                    <Input
                      id="zip"
                      placeholder="00000-000"
                      className="bg-background border-hairline"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-fg-1 font-medium">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Informações adicionais sobre o cliente..."
                  className="bg-background border-hairline resize-none"
                  rows={4}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Cliente
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/clients')}
                  className="border-hairline"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}