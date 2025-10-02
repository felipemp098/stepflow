import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientes } from '@/hooks/useClientes';
import { toast } from 'sonner';
import { UserCreatedAlert } from '@/components/ui-custom/UserCreatedAlert';

export default function ClientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createCliente, updateCliente, loadCliente, cliente, loadingCliente, creating, updating, creatingUser, userError } = useClientes();
  
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cnpj: '',
    cpf: '',
    endereco: '',
    instagram: '',
    observacoes: '',
    status: 'ativo'
  });

  const [createdUser, setCreatedUser] = useState<{
    id: string;
    email: string;
    temp_password: string;
  } | null>(null);

  // Função para limpar o formulário
  const clearForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      cnpj: '',
      cpf: '',
      endereco: '',
      instagram: '',
      observacoes: '',
      status: 'ativo'
    });
  };

  // Carregar dados do cliente se estiver editando
  useEffect(() => {
    if (isEditMode && id) {
      loadCliente(id);
    }
  }, [isEditMode, id, loadCliente]);

  // Preencher formulário quando cliente carregar
  useEffect(() => {
    if (isEditMode && cliente) {
      setFormData({
        nome: cliente.nome || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        cnpj: cliente.cnpj || '',
        cpf: cliente.cpf || '',
        endereco: cliente.endereco || '',
        instagram: cliente.instagram || '',
        observacoes: cliente.observacoes || '',
        status: cliente.status || 'ativo'
      });
    }
  }, [isEditMode, cliente]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && id) {
        const result = await updateCliente(id, formData);
        if (result.success) {
          toast.success('Cliente atualizado com sucesso!');
          navigate('/clients');
        } else {
          toast.error(result.error || 'Erro ao atualizar cliente');
        }
        } else {
          const result = await createCliente(formData);
          if (result.success) {
            if (result.userCreated && result.createdUser) {
              // Se o usuário foi criado, mostrar alerta com credenciais
              setCreatedUser(result.createdUser);
              toast.success('Cliente e usuário criados com sucesso!');
              // Limpar formulário após sucesso
              clearForm();
            } else {
              toast.success('Cliente criado com sucesso! (Usuário não foi criado - email não informado)');
              navigate('/clients');
            }
          } else {
            toast.error(result.error || 'Erro ao criar cliente');
            // Se falhou, não navegar - deixar usuário tentar novamente
          }
        }
    } catch (error) {
      toast.error('Erro inesperado ao salvar cliente');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <h1 className="text-2xl font-semibold text-fg-1">
            {isEditMode ? 'Editar Cliente' : 'Adicionar Cliente'}
          </h1>
          <p className="text-fg-3 mt-1">
            {isEditMode ? 'Atualize as informações do cliente' : 'Cadastre um novo cliente no sistema'}
          </p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
      >
        <Card className="shadow-card-md w-full">
          <CardHeader className="border-b border-hairline">
            <CardTitle className="text-lg font-semibold text-fg-1">
              {isEditMode ? 'Editar Informações' : 'Informações do Cliente'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loadingCliente ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-fg-3" />
                <span className="ml-2 text-fg-3">Carregando dados do cliente...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Alerta de usuário criado */}
                {createdUser && (
                  <UserCreatedAlert 
                    user={createdUser}
                    onClose={() => {
                      setCreatedUser(null);
                      navigate('/clients');
                    }}
                  />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error de criação de usuário */}
                  {userError && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Cliente criado com sucesso, mas houve um erro ao criar o usuário: {userError}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Nome e Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-fg-1 font-medium">
                      Nome Completo *
                    </Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome completo do cliente"
                      value={formData.nome}
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                      className="bg-background border-hairline"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-fg-1 font-medium">
                      Status
                    </Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="bg-background border-hairline">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="suspenso">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* E-mail e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-fg-1 font-medium">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="cliente@exemplo.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-background border-hairline"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telefone" className="text-fg-1 font-medium">
                      Telefone
                    </Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange('telefone', e.target.value)}
                      className="bg-background border-hairline"
                    />
                  </div>
                </div>

                {/* CNPJ e CPF */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cnpj" className="text-fg-1 font-medium">
                      CNPJ
                    </Label>
                    <Input
                      id="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      className="bg-background border-hairline"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cpf" className="text-fg-1 font-medium">
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      className="bg-background border-hairline"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-2">
                  <Label htmlFor="endereco" className="text-fg-1 font-medium">
                    Endereço
                  </Label>
                  <Input
                    id="endereco"
                    placeholder="Rua, número, bairro, cidade - UF"
                    value={formData.endereco}
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    className="bg-background border-hairline"
                  />
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-fg-1 font-medium">
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="@usuario"
                    value={formData.instagram}
                    onChange={(e) => handleInputChange('instagram', e.target.value)}
                    className="bg-background border-hairline"
                  />
                </div>

                {/* Observações */}
                <div className="space-y-2">
                  <Label htmlFor="observacoes" className="text-fg-1 font-medium">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Informações adicionais sobre o cliente..."
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    className="bg-background border-hairline resize-none"
                    rows={4}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={creating || updating || creatingUser}
                  >
                    {(creating || updating || creatingUser) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditMode ? 'Atualizar Cliente' : 
                     creatingUser ? 'Criando Usuário...' : 
                     'Salvar Cliente'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/clients')}
                    className="border-hairline"
                    disabled={creating || updating}
                  >
                    Cancelar
                  </Button>
                </div>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}