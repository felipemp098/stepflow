import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClientDetail } from '@/hooks/useClientDetail';
import { useRBAC } from '@/hooks/useRBAC';
import { useDebounce } from '@/hooks/useDebounce';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  User,
  Instagram,
  CreditCard as CardIcon,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusChip } from '@/components/ui-custom/StatusChip';
import { KpiCard } from '@/components/ui-custom/KpiCard';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';
import { EmptyState } from '@/components/ui-custom/EmptyState';


export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Hook para gerenciar dados do cliente
  const {
    overview,
    loading,
    error,
    loadOverview,
    clearError
  } = useClientDetail();
  
  // Hook para validação RBAC
  const {
    validateClientAccess,
    loading: rbacLoading,
    error: rbacError
  } = useRBAC();
  
  // Filtros e busca
  const [contractSearch, setContractSearch] = useState('');
  const [contractStatus, setContractStatus] = useState('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatus, setStudentStatus] = useState('all');
  
  // Debounce para busca
  const debouncedContractSearch = useDebounce(contractSearch, 500);
  const debouncedStudentSearch = useDebounce(studentSearch, 500);
  
  // Paginação
  const [contractPage, setContractPage] = useState(1);
  const [studentPage, setStudentPage] = useState(1);
  const pageSize = 10;
  
  // Dados locais para paginação e filtros
  const [allContracts, setAllContracts] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  
  // Estado de validação de acesso
  const [accessValidated, setAccessValidated] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // Carregar dados do cliente
  const loadClientOverview = async () => {
    if (!id) return;
    
    await loadOverview(id, {
      c_page: contractPage,
      c_size: pageSize,
      a_page: studentPage,
      a_size: pageSize,
      c_search: contractSearch,
      a_search: studentSearch,
      c_status: contractStatus,
      a_status: studentStatus
    });
  };

  // Handlers
  const handleEditClient = () => {
    navigate(`/clients/edit/${id}`);
  };

  const handleCreateContract = () => {
    navigate(`/contratos/create?cliente_id=${id}`);
  };

  const handleAddStudent = () => {
    navigate(`/alunos/create?cliente_id=${id}`);
  };

  const handleBack = () => {
    navigate('/clients');
  };

  // Função para filtrar contratos localmente
  const getFilteredContracts = () => {
    if (!overview?.contratos.items) return [];
    
    let filtered = overview.contratos.items;
    
    // Filtrar por busca
    if (debouncedContractSearch) {
      filtered = filtered.filter(contract => 
        contract.produto_nome.toLowerCase().includes(debouncedContractSearch.toLowerCase()) ||
        contract.oferta_nome.toLowerCase().includes(debouncedContractSearch.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (contractStatus !== 'all') {
      filtered = filtered.filter(contract => contract.status === contractStatus);
    }
    
    return filtered;
  };

  // Função para filtrar alunos localmente
  const getFilteredStudents = () => {
    if (!overview?.alunos.items) return [];
    
    let filtered = overview.alunos.items;
    
    // Filtrar por busca
    if (debouncedStudentSearch) {
      filtered = filtered.filter(student => 
        student.nome.toLowerCase().includes(debouncedStudentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(debouncedStudentSearch.toLowerCase())
      );
    }
    
    // Filtrar por status
    if (studentStatus !== 'all') {
      filtered = filtered.filter(student => student.status === studentStatus);
    }
    
    return filtered;
  };

  // Função para paginar dados
  const getPaginatedData = (data: any[], page: number, size: number) => {
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    return data.slice(startIndex, endIndex);
  };

  // Handlers para filtros de contratos
  const handleContractSearchChange = (value: string) => {
    setContractSearch(value);
    setContractPage(1); // Reset para primeira página
  };

  const handleContractStatusChange = (value: string) => {
    setContractStatus(value);
    setContractPage(1); // Reset para primeira página
  };

  // Handlers para filtros de alunos
  const handleStudentSearchChange = (value: string) => {
    setStudentSearch(value);
    setStudentPage(1); // Reset para primeira página
  };

  const handleStudentStatusChange = (value: string) => {
    setStudentStatus(value);
    setStudentPage(1); // Reset para primeira página
  };

  // Handlers para paginação (apenas mudança de estado)
  const handleContractPageChange = (page: number) => {
    setContractPage(page);
  };

  const handleStudentPageChange = (page: number) => {
    setStudentPage(page);
  };

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Validar acesso e carregar dados ao montar componente
  useEffect(() => {
    const validateAndLoad = async () => {
      if (!id) return;
      
      // Validar acesso primeiro
      const validation = await validateClientAccess(id);
      
      if (!validation.canAccess) {
        setAccessError(validation.error || 'Acesso negado');
        setAccessValidated(true);
        return;
      }
      
      // Se tem acesso, carregar dados
      setAccessError(null);
      setAccessValidated(true);
      await loadClientOverview();
    };
    
    validateAndLoad();
  }, [id]);

  // Reset para primeira página quando filtros mudarem
  useEffect(() => {
    setContractPage(1);
  }, [debouncedContractSearch, contractStatus]);

  useEffect(() => {
    setStudentPage(1);
  }, [debouncedStudentSearch, studentStatus]);

  // Mostrar erro de acesso
  if (accessError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {accessError}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar erro geral
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={loadClientOverview}
            >
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mostrar loading
  if (loading || rbacLoading || !accessValidated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        
        <Card className="shadow-card-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-fg-3">Carregando detalhes do cliente...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!overview) return null;

  const { cliente, metricas } = overview;
  
  // Dados filtrados e paginados localmente
  const filteredContracts = getFilteredContracts();
  const filteredStudents = getFilteredStudents();
  
  const paginatedContracts = getPaginatedData(filteredContracts, contractPage, pageSize);
  const paginatedStudents = getPaginatedData(filteredStudents, studentPage, pageSize);
  
  const totalContracts = filteredContracts.length;
  const totalStudents = filteredStudents.length;

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-fg-1">Detalhes do Cliente</h1>
          <p className="text-sm text-fg-3 mt-1">Visualize e gerencie as informações do cliente</p>
        </div>
      </div>

      {/* Informações do Cliente - Layout de 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bloco 1 - Informações Principais (30%) */}
        <div className="lg:col-span-4">
          <Card className="shadow-card-md h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-fg-1 tracking-wide">
                {cliente.nome}
              </CardTitle>
              <div className="mt-2">
                <StatusChip status={cliente.status === 'ativo' ? 'active' : cliente.status === 'inativo' ? 'inactive' : 'pending'}>
                  {cliente.status === 'ativo' ? 'Ativo' : cliente.status === 'inativo' ? 'Inativo' : 'Suspenso'}
                </StatusChip>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* E-mail */}
              {cliente.email && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      E-mail
                    </label>
                    <a 
                      href={`mailto:${cliente.email}`}
                      className="text-fg-1 hover:text-blue-600 transition-colors duration-200 text-sm font-medium break-all"
                    >
                      {cliente.email}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Telefone */}
              {cliente.telefone && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg flex-shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      Telefone
                    </label>
                    <a 
                      href={`https://wa.me/${cliente.telefone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-1 hover:text-green-600 transition-colors duration-200 text-sm font-medium"
                    >
                      {cliente.telefone}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Instagram */}
              {cliente.instagram && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-pink-50 rounded-lg flex-shrink-0">
                    <Instagram className="h-5 w-5 text-pink-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      Instagram
                    </label>
                    <a 
                      href={`https://instagram.com/${cliente.instagram.startsWith('@') ? cliente.instagram.substring(1) : cliente.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fg-1 hover:text-pink-600 transition-colors duration-200 text-sm font-medium"
                    >
                      {cliente.instagram}
                    </a>
                  </div>
                </div>
              )}
              
              {/* Divisor */}
              <div className="border-t border-gray-200 my-6"></div>
              
              {/* Ações */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-fg-2 uppercase tracking-wider mb-3 block">
                  Ações
                </label>
                <div className="space-y-3">
                  <Button 
                    onClick={handleEditClient}
                    className="w-full justify-start h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    variant="default"
                  >
                    <Edit className="h-4 w-4 mr-3" />
                    Editar cliente
                  </Button>
                  <Button 
                    onClick={handleCreateContract}
                    className="w-full justify-start h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    variant="default"
                  >
                    <Plus className="h-4 w-4 mr-3" />
                    Criar contrato
                  </Button>
                  <Button 
                    onClick={handleAddStudent}
                    className="w-full justify-start h-11 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
                    variant="default"
                  >
                    <UserPlus className="h-4 w-4 mr-3" />
                    Adicionar aluno
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bloco 2 - Dados Cadastrais Detalhados (70%) */}
        <div className="lg:col-span-8">
          <Card className="shadow-card-md h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-fg-1 tracking-wide uppercase">
                Dados Cadastrais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endereço */}
              {cliente.endereco && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      Endereço
                    </label>
                    <p className="text-fg-1 text-sm font-medium leading-relaxed">
                      {cliente.endereco}
                    </p>
                  </div>
                </div>
              )}
              
              {/* CNPJ/CPF */}
              {(cliente.cpf || cliente.cnpj) && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg flex-shrink-0">
                    <CardIcon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      {cliente.cnpj ? 'CNPJ' : 'CPF'}
                    </label>
                    <p className="text-fg-1 text-sm font-medium">
                      {cliente.cpf || cliente.cnpj}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Data de cadastro */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                    Data de Cadastro
                  </label>
                  <p className="text-fg-1 text-sm font-medium">
                    {formatDate(cliente.created_at)}
                  </p>
                </div>
              </div>
              
              {/* Observações */}
              {cliente.observacoes && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-xs font-semibold text-fg-3 uppercase tracking-wider mb-1 block">
                      Observações
                    </label>
                    <p className="text-fg-1 text-sm font-medium leading-relaxed">
                      {cliente.observacoes}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas Financeiras */}
      <div className="space-y-4">
        {/* Linha 1: Faturamento total, Total de entradas, Parcelas em aberto, Parcelas atrasadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Faturamento total"
            value={formatCurrency(metricas.receita_total_contratos)}
            icon={TrendingUp}
            trend="up"
            color="green"
          />
          
          <KpiCard
            title="Total de entradas"
            value={formatCurrency(metricas.parcelas_em_aberto_valor + metricas.parcelas_atrasadas_valor)}
            icon={CreditCard}
            color="blue"
          />
          
          <KpiCard
            title="Parcelas em aberto"
            value={formatCurrency(metricas.parcelas_em_aberto_valor)}
            description={`${metricas.parcelas_em_aberto_qtd} parcelas`}
            icon={CreditCard}
            color="orange"
          />
          
          <KpiCard
            title="Parcelas atrasadas"
            value={formatCurrency(metricas.parcelas_atrasadas_valor)}
            description={`${metricas.parcelas_atrasadas_qtd} parcelas`}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Linha 2: Contratos ativos, Alunos ativos, Contratos pendentes, Contratos atrasados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Contratos ativos"
            value={metricas.contratos_ativos_qtd.toString()}
            icon={FileText}
            color="green"
          />
          
          <KpiCard
            title="Alunos ativos"
            value={metricas.alunos_vinculados_qtd.toString()}
            icon={Users}
            color="blue"
          />
          
          <KpiCard
            title="Contratos pendentes"
            value={metricas.entradas_pendentes_qtd.toString()}
            icon={AlertCircle}
            color="orange"
          />
          
          <KpiCard
            title="Contratos atrasados"
            value={metricas.parcelas_atrasadas_qtd.toString()}
            icon={AlertTriangle}
            color="red"
          />
        </div>
      </div>

      {/* Contratos */}
      <Card className="shadow-card-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-fg-1">Contratos do cliente</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-3" />
                <Input
                  placeholder="Buscar contratos..."
                  value={contractSearch}
                  onChange={(e) => handleContractSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedContracts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Este cliente ainda não possui contratos"
              description="Comece criando o primeiro contrato para este cliente"
              action={{ label: 'Criar contrato', onClick: handleCreateContract }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-hairline">
                  <TableHead className="text-fg-2 font-medium text-left">Produto</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Oferta</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Encerramento</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Valor total</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Entrada</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Parcelas</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedContracts.map((contrato) => (
                  <TableRow key={contrato.id} className="border-b border-hairline hover:bg-surface-1/50 transition-colors">
                    <TableCell className="text-left">
                      <div className="font-medium text-fg-1">{contrato.produto_nome}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{contrato.oferta_nome}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{formatDate(contrato.encerramento)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-medium text-fg-1">{formatCurrency(contrato.valor_total)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{formatCurrency(contrato.valor_entrada)}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{contrato.parcelas}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusChip status={contrato.status === 'ativo' ? 'active' : 'inactive'}>
                        {contrato.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </StatusChip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Paginação de contratos */}
          {totalContracts > pageSize && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContractPageChange(contractPage - 1)}
                      disabled={contractPage <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(totalContracts / pageSize)) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handleContractPageChange(page)}
                          isActive={contractPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContractPageChange(contractPage + 1)}
                      disabled={contractPage >= Math.ceil(totalContracts / pageSize)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alunos */}
      <Card className="shadow-card-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-fg-1">Alunos do cliente</CardTitle>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-fg-3" />
                <Input
                  placeholder="Buscar alunos..."
                  value={studentSearch}
                  onChange={(e) => handleStudentSearchChange(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum aluno cadastrado"
              description="Comece adicionando alunos para este cliente"
              action={{ label: 'Adicionar aluno', onClick: handleAddStudent }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-hairline">
                  <TableHead className="text-fg-2 font-medium text-left">Nome</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">E-mail</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Status</TableHead>
                  <TableHead className="text-fg-2 font-medium text-center">Data de criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedStudents.map((aluno) => (
                  <TableRow key={aluno.id} className="border-b border-hairline hover:bg-surface-1/50 transition-colors">
                    <TableCell className="text-left">
                      <div className="font-medium text-fg-1">{aluno.nome}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{aluno.email}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusChip status={aluno.status === 'ativo' ? 'active' : 'inactive'}>
                        {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </StatusChip>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-fg-2">{formatDate(aluno.created_at)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Paginação de alunos */}
          {totalStudents > pageSize && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStudentPageChange(studentPage - 1)}
                      disabled={studentPage <= 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, Math.ceil(totalStudents / pageSize)) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handleStudentPageChange(page)}
                          isActive={studentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStudentPageChange(studentPage + 1)}
                      disabled={studentPage >= Math.ceil(totalStudents / pageSize)}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
