import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, Save, Loader2, Check, Plus, Trash2, MapPin, List, Users, FileText, Gift, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useProdutos } from '@/hooks/useProdutos';
import { ProdutoFormData, OfertaFormData, JornadaFormData, PassoFormData, ProdutoBundleData } from '@/types/produtos';
import { useToast } from '@/hooks/use-toast';
import { parseCurrency, applyCurrencyMask, formatCurrency, handleCurrencyInput } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const isEditing = Boolean(id);
  
  const {
    buscarProduto,
    criarProdutoBundle,
    loading
  } = useProdutos({ autoLoad: false });

  // Verificar se há cliente selecionado
  const { currentCliente, clientes } = useAuth();

  // Estados do wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Dados do formulário
  const [produtoData, setProdutoData] = useState<ProdutoFormData>({
    nome: '',
    descricao: '',
    status: 'ativo'
  });
  const [ofertas, setOfertas] = useState<OfertaFormData[]>([]);
  const [jornadas, setJornadas] = useState<JornadaFormData[]>([]);

  // Estados de validação
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do produto se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      setIsLoading(true);
      buscarProduto(id).then((produto) => {
        if (produto) {
          setProdutoData({
            nome: produto.nome,
            descricao: produto.descricao || '',
            status: produto.status as 'ativo' | 'rascunho'
          });
          // TODO: Carregar ofertas e jornadas do produto
        } else {
          toast({
            title: 'Erro',
            description: 'Produto não encontrado',
            variant: 'destructive'
          });
          navigate('/products');
        }
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [isEditing, id, buscarProduto, navigate, toast]);

  // Validações por passo
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!produtoData.nome.trim()) {
        newErrors.nome = 'Nome é obrigatório';
      } else if (produtoData.nome.trim().length < 2) {
        newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
      }
    }

    if (step === 2) {
      ofertas.forEach((oferta, index) => {
        if (!oferta.nome.trim()) {
          newErrors[`oferta_${index}_nome`] = 'Nome da oferta é obrigatório';
        }
        if (oferta.valor_total <= 0) {
          newErrors[`oferta_${index}_valor_total`] = 'Valor total deve ser maior que zero';
        }
        if (!oferta.ciclo || oferta.ciclo < 1) {
          newErrors[`oferta_${index}_ciclo`] = 'Ciclo deve ser um número de meses maior que zero';
        }
      });
    }

    if (step === 3) {
      jornadas.forEach((jornada, jIndex) => {
        if (!jornada.nome.trim()) {
          newErrors[`jornada_${jIndex}_nome`] = 'Nome da jornada é obrigatório';
        }
        jornada.passos.forEach((passo, pIndex) => {
          if (!passo.nome.trim()) {
            newErrors[`jornada_${jIndex}_passo_${pIndex}_nome`] = 'Nome do passo é obrigatório';
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navegação entre passos
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Salvar rascunho
  const saveDraft = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Implementar salvamento de rascunho
      toast({
        title: 'Rascunho salvo',
        description: 'Seu progresso foi salvo'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Finalizar criação
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const bundleData: ProdutoBundleData = {
        produto: produtoData,
        ofertas: ofertas.length > 0 ? ofertas : undefined,
        jornadas: jornadas.length > 0 ? jornadas : undefined
      };

      const success = await criarProdutoBundle(bundleData);
      
      if (success) {
        navigate('/products');
      }
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar produto',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Adicionar oferta
  const addOferta = () => {
    setOfertas(prev => [...prev, {
      nome: '',
      valor_total: 0,
      ciclo: 1, // 1 mês por padrão
      observacoes: ''
    }]);
  };

  // Remover oferta
  const removeOferta = (index: number) => {
    setOfertas(prev => prev.filter((_, i) => i !== index));
  };

  // Atualizar oferta
  const updateOferta = (index: number, field: keyof OfertaFormData, value: any) => {
    setOfertas(prev => prev.map((oferta, i) => 
      i === index ? { ...oferta, [field]: value } : oferta
    ));
  };

  // Adicionar jornada
  const addJornada = () => {
    setJornadas(prev => [...prev, {
      nome: '',
      passos: []
    }]);
  };

  // Remover jornada
  const removeJornada = (index: number) => {
    setJornadas(prev => prev.filter((_, i) => i !== index));
  };

  // Adicionar passo à jornada
  const addPasso = (jornadaIndex: number) => {
    setJornadas(prev => prev.map((jornada, i) => 
      i === jornadaIndex 
        ? { ...jornada, passos: [...jornada.passos, { nome: '', tipo: 'sessao', observacoes: '', ordem: jornada.passos.length + 1 }] }
        : jornada
    ));
  };

  // Remover passo da jornada
  const removePasso = (jornadaIndex: number, passoIndex: number) => {
    setJornadas(prev => prev.map((jornada, i) => 
      i === jornadaIndex 
        ? { ...jornada, passos: jornada.passos.filter((_, pi) => pi !== passoIndex) }
        : jornada
    ));
  };

  // Atualizar passo
  const updatePasso = (jornadaIndex: number, passoIndex: number, field: keyof PassoFormData, value: any) => {
    setJornadas(prev => prev.map((jornada, i) => 
      i === jornadaIndex 
        ? { 
            ...jornada, 
            passos: jornada.passos.map((passo, pi) => 
              pi === passoIndex ? { ...passo, [field]: value } : passo
            )
          }
        : jornada
    ));
  };

  // Atualizar nome da etapa
  const updateEtapaNome = (jornadaIndex: number, nome: string) => {
    setJornadas(prev => prev.map((jornada, i) => 
      i === jornadaIndex 
        ? { ...jornada, nome }
        : jornada
    ));
  };

  const handleBack = () => {
    navigate('/products');
  };

  // Função para obter ícone do tipo de passo
  const getPassoIcon = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return <Users className="h-4 w-4" />;
      case 'reuniao':
        return <Users className="h-4 w-4" />;
      case 'material':
        return <FileText className="h-4 w-4" />;
      case 'bonus':
        return <Gift className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  // Função para obter cor do tipo de passo
  const getPassoColor = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reuniao':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'material':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Verificar se há cliente selecionado
  if (!currentCliente) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <Package className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-fg-1">Cliente não selecionado</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {clientes.length === 0 
                ? 'Você não tem acesso a nenhum cliente. Entre em contato com o administrador.'
                : 'Selecione um cliente no cabeçalho para criar produtos.'
              }
            </p>
          </div>
          <Button onClick={() => navigate('/products')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-fg-1">
            {isEditing ? 'Editar Produto' : 'Criar Novo Produto'}
          </h1>
          <p className="text-sm text-fg-3 mt-1">
            {isEditing ? 'Atualize as informações do produto' : 'Configure seu produto em 4 passos simples'}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= step 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {currentStep > step ? <Check className="h-4 w-4" /> : step}
            </div>
            <span className={`ml-2 text-sm ${
              currentStep >= step ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {step === 1 && 'Produto'}
              {step === 2 && 'Ofertas'}
              {step === 3 && 'Entregáveis'}
              {step === 4 && 'Revisão'}
            </span>
            {step < 4 && <div className="w-8 h-px bg-border ml-4" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 1 && (
          <Step1Produto 
            data={produtoData}
            onChange={setProdutoData}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2Ofertas 
            ofertas={ofertas}
            onAdd={addOferta}
            onRemove={removeOferta}
            onUpdate={updateOferta}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3Entregaveis 
            jornadas={jornadas}
            onAddJornada={addJornada}
            onRemoveJornada={removeJornada}
            onAddPasso={addPasso}
            onRemovePasso={removePasso}
            onUpdatePasso={updatePasso}
            onUpdateEtapaNome={updateEtapaNome}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Revisao 
            produto={produtoData}
            ofertas={ofertas}
            jornadas={jornadas}
          />
        )}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isSubmitting}
            >
              Voltar
            </Button>
          )}
        </div>
        
        <div className="flex gap-3">
          {currentStep < 4 && (
            <Button
              variant="outline"
              onClick={saveDraft}
              disabled={isSubmitting}
            >
              Salvar e sair
            </Button>
          )}
          
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={isSubmitting}
            >
              Continuar
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Criar Produto
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes dos passos
function Step1Produto({ data, onChange, errors }: {
  data: ProdutoFormData;
  onChange: (data: ProdutoFormData) => void;
  errors: Record<string, string>;
}) {
  return (
    <Card className="shadow-card-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Informações do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto *</Label>
            <Input
              id="nome"
              value={data.nome}
              onChange={(e) => onChange({ ...data, nome: e.target.value })}
              placeholder="Digite o nome do produto"
              className={errors.nome ? 'border-destructive' : ''}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={data.status}
              onValueChange={(value) => onChange({ ...data, status: value as 'ativo' | 'rascunho' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="rascunho">Rascunho</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={data.descricao}
            onChange={(e) => onChange({ ...data, descricao: e.target.value })}
            placeholder="Descreva o produto (opcional)"
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Step2Ofertas({ ofertas, onAdd, onRemove, onUpdate, errors }: {
  ofertas: OfertaFormData[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, field: keyof OfertaFormData, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <Card className="shadow-card-md">
      <CardHeader>
        <CardTitle>Ofertas do Produto</CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure as opções de pagamento para este produto (opcional)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {ofertas.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma oferta adicionada</p>
            <p className="text-sm">Clique em "Adicionar oferta" para começar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ofertas.map((oferta, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Oferta {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {/* Linha 1: Nome, Valor, Ciclo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nome da oferta *</Label>
                      <Input
                        value={oferta.nome}
                        onChange={(e) => onUpdate(index, 'nome', e.target.value)}
                        placeholder="Ex: Plano Básico, Plano Premium"
                        className={errors[`oferta_${index}_nome`] ? 'border-destructive' : ''}
                      />
                      {errors[`oferta_${index}_nome`] && (
                        <p className="text-sm text-destructive">{errors[`oferta_${index}_nome`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Valor total *</Label>
                      <Input
                        value={oferta.valor_total > 0 ? formatCurrency(oferta.valor_total) : ''}
                        onChange={(e) => {
                          const { numeric } = handleCurrencyInput(e.target.value, oferta.valor_total);
                          onUpdate(index, 'valor_total', numeric);
                        }}
                        placeholder="R$ 0,00"
                        className={errors[`oferta_${index}_valor_total`] ? 'border-destructive' : ''}
                      />
                      {errors[`oferta_${index}_valor_total`] && (
                        <p className="text-sm text-destructive">{errors[`oferta_${index}_valor_total`]}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Ciclo (meses) *</Label>
                      <Input
                        type="number"
                        value={oferta.ciclo}
                        onChange={(e) => onUpdate(index, 'ciclo', parseInt(e.target.value) || 1)}
                        placeholder="1"
                        min="1"
                        className={errors[`oferta_${index}_ciclo`] ? 'border-destructive' : ''}
                      />
                      {errors[`oferta_${index}_ciclo`] && (
                        <p className="text-sm text-destructive">{errors[`oferta_${index}_ciclo`]}</p>
                      )}
                    </div>
                  </div>

                  {/* Linha 2: Observações */}
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={oferta.observacoes}
                      onChange={(e) => onUpdate(index, 'observacoes', e.target.value)}
                      placeholder="Informações adicionais sobre esta oferta"
                      rows={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button onClick={onAdd} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar oferta
        </Button>
      </CardContent>
    </Card>
  );
}

function Step3Entregaveis({ jornadas, onAddJornada, onRemoveJornada, onAddPasso, onRemovePasso, onUpdatePasso, onUpdateEtapaNome, errors }: {
  jornadas: JornadaFormData[];
  onAddJornada: () => void;
  onRemoveJornada: (index: number) => void;
  onAddPasso: (jornadaIndex: number) => void;
  onRemovePasso: (jornadaIndex: number, passoIndex: number) => void;
  onUpdatePasso: (jornadaIndex: number, passoIndex: number, field: keyof PassoFormData, value: any) => void;
  onUpdateEtapaNome: (jornadaIndex: number, nome: string) => void;
  errors: Record<string, string>;
}) {
  // Função para obter ícone do tipo de passo
  const getPassoIcon = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return <Users className="h-4 w-4" />;
      case 'reuniao':
        return <Users className="h-4 w-4" />;
      case 'material':
        return <FileText className="h-4 w-4" />;
      case 'bonus':
        return <Gift className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  // Função para obter cor do tipo de passo
  const getPassoColor = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reuniao':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'material':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card className="shadow-card-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Entregáveis do Produto
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure as etapas e passos que compõem este produto (opcional)
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {jornadas.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma etapa adicionada</h3>
            <p className="text-sm mb-4">As etapas representam as fases principais do seu produto</p>
            <p className="text-xs">Ex: Onboarding, Execução, Encerramento</p>
          </div>
        ) : (
          <div className="space-y-8">
            {jornadas.map((jornada, jIndex) => (
              <div key={jIndex} className="border-2 border-primary/20 rounded-xl p-6 bg-gradient-to-br from-primary/5 to-transparent">
                {/* Header da Jornada */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={jornada.nome}
                      onChange={(e) => onUpdateEtapaNome(jIndex, e.target.value)}
                      placeholder="Nome da etapa (ex: Onboarding, Execução)"
                      className={`text-lg font-semibold border-2 border-primary/30 bg-white/80 px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-primary/20 ${errors[`jornada_${jIndex}_nome`] ? 'border-destructive text-destructive' : 'border-primary/30'}`}
                    />
                    {errors[`jornada_${jIndex}_nome`] && (
                      <p className="text-sm text-destructive mt-1">{errors[`jornada_${jIndex}_nome`]}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveJornada(jIndex)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Passos da Jornada */}
                <div className="space-y-4">
                  {jornada.passos.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed border-muted-foreground/30 rounded-lg">
                      <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum passo adicionado</p>
                      <p className="text-xs">Os passos são as atividades específicas desta etapa</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {jornada.passos.map((passo, pIndex) => (
                        <div key={pIndex} className="bg-white border border-border rounded-lg p-4 shadow-sm">
                          <div className="flex items-start gap-4">
                            {/* Ícone do tipo */}
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${getPassoColor(passo.tipo)}`}>
                              {getPassoIcon(passo.tipo)}
                            </div>
                            
                            {/* Conteúdo do passo */}
                            <div className="flex-1 space-y-3">
                              {/* Linha 1: Nome, Tipo, Ordem */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">Nome do passo *</Label>
                                  <Input
                                    value={passo.nome}
                                    onChange={(e) => onUpdatePasso(jIndex, pIndex, 'nome', e.target.value)}
                                    placeholder="Ex: Reunião inicial, Material de estudo"
                                    className={errors[`jornada_${jIndex}_passo_${pIndex}_nome`] ? 'border-destructive' : ''}
                                  />
                                  {errors[`jornada_${jIndex}_passo_${pIndex}_nome`] && (
                                    <p className="text-xs text-destructive">{errors[`jornada_${jIndex}_passo_${pIndex}_nome`]}</p>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">Tipo *</Label>
                                  <Select
                                    value={passo.tipo}
                                    onValueChange={(value) => onUpdatePasso(jIndex, pIndex, 'tipo', value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="sessao">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          Sessão
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="reuniao">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-4 w-4" />
                                          Reunião
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="material">
                                        <div className="flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          Material
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="bonus">
                                        <div className="flex items-center gap-2">
                                          <Gift className="h-4 w-4" />
                                          Bônus
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="outro">
                                        <div className="flex items-center gap-2">
                                          <MoreHorizontal className="h-4 w-4" />
                                          Outro
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs font-medium text-muted-foreground">Ordem</Label>
                                  <Input
                                    type="number"
                                    value={passo.ordem}
                                    onChange={(e) => onUpdatePasso(jIndex, pIndex, 'ordem', parseInt(e.target.value) || 1)}
                                    placeholder="1"
                                    min="1"
                                    className="w-20"
                                  />
                                </div>
                              </div>

                              {/* Linha 2: Observações */}
                              <div className="space-y-1">
                                <Label className="text-xs font-medium text-muted-foreground">Observações</Label>
                                <Textarea
                                  value={passo.observacoes}
                                  onChange={(e) => onUpdatePasso(jIndex, pIndex, 'observacoes', e.target.value)}
                                  placeholder="Detalhes adicionais sobre este passo"
                                  rows={2}
                                />
                              </div>
                            </div>

                            {/* Botão remover */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemovePasso(jIndex, pIndex)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botão adicionar passo */}
                  <Button
                    onClick={() => onAddPasso(jIndex)}
                    variant="outline"
                    size="sm"
                    className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar passo à etapa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão adicionar jornada */}
        <Button 
          onClick={onAddJornada} 
          variant="outline" 
          className="w-full border-dashed border-primary/50 text-primary hover:bg-primary/5 h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar nova etapa
        </Button>
      </CardContent>
    </Card>
  );
}

function Step4Revisao({ produto, ofertas, jornadas }: {
  produto: ProdutoFormData;
  ofertas: OfertaFormData[];
  jornadas: JornadaFormData[];
}) {
  // Função para obter ícone do tipo de passo
  const getPassoIcon = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return <Users className="h-4 w-4" />;
      case 'reuniao':
        return <Users className="h-4 w-4" />;
      case 'material':
        return <FileText className="h-4 w-4" />;
      case 'bonus':
        return <Gift className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  // Função para obter cor do tipo de passo
  const getPassoColor = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'reuniao':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'material':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Função para obter cor do badge do tipo de passo
  const getPassoBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'sessao':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200';
      case 'reuniao':
        return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
      case 'material':
        return 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200';
      case 'bonus':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Resumo do Produto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-lg">{produto.nome}</h4>
              {produto.descricao && (
                <p className="text-muted-foreground mt-1">{produto.descricao}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant={produto.status === 'ativo' ? 'default' : 'secondary'} className="text-xs">
                {produto.status === 'ativo' ? 'Ativo' : 'Rascunho'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {ofertas.length > 0 && (
        <Card className="shadow-card-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ofertas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {ofertas.length === 1 
                ? '1 oferta configurada para este produto'
                : `${ofertas.length} ofertas configuradas para este produto`
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ofertas.map((oferta, index) => (
                <div key={index} className="flex justify-between items-center p-4 border rounded-lg bg-muted/30">
                  <div>
                    <h5 className="font-medium">{oferta.nome}</h5>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(oferta.valor_total)} - {oferta.ciclo} {oferta.ciclo === 1 ? 'mês' : 'meses'}
                    </p>
                    {oferta.observacoes && (
                      <p className="text-xs text-muted-foreground mt-1">{oferta.observacoes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {jornadas.length > 0 && (
        <Card className="shadow-card-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Etapas
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {jornadas.length === 1 
                ? '1 etapa configurada para este produto'
                : `${jornadas.length} etapas configuradas para este produto`
              }
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {jornadas.map((jornada, jIndex) => (
                <div key={jIndex} className="border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <h5 className="font-semibold text-lg">{jornada.nome}</h5>
                  </div>
                  
                  {jornada.passos.length > 0 ? (
                    <div className="space-y-2">
                      {jornada.passos.map((passo, pIndex) => (
                        <div key={pIndex} className="flex items-center gap-3 p-3 bg-white border border-border rounded-lg">
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${getPassoColor(passo.tipo)}`}>
                            {getPassoIcon(passo.tipo)}
                          </div>
                          <div className="flex-1">
                            <span className="font-medium">{passo.nome}</span>
                            {passo.observacoes && (
                              <span className="text-muted-foreground text-sm ml-2">- {passo.observacoes}</span>
                            )}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPassoBadgeColor(passo.tipo)}`}
                          >
                            {passo.tipo}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Nenhum passo adicionado</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
