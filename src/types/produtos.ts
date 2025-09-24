import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Tipos base do banco de dados
export type Produto = Tables<'produtos'>;
export type ProdutoInsert = TablesInsert<'produtos'>;
export type ProdutoUpdate = TablesUpdate<'produtos'>;

// Tipos estendidos para a aplicação
export interface ProdutoWithOfertas extends Produto {
  ofertas: Oferta[];
  ofertas_count: number;
}

export interface Oferta {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  status: string;
  created_at: string | null;
}

// Tipos para formulários
export interface ProdutoFormData {
  nome: string;
  descricao?: string;
  status?: 'ativo' | 'rascunho';
}

// Tipos para ofertas
export interface OfertaFormData {
  nome: string;
  valor_total: number;
  ciclo: number; // número de meses
  observacoes?: string;
}

// Tipos para passos
export interface PassoFormData {
  nome: string;
  tipo: 'sessao' | 'reuniao' | 'material' | 'bonus' | 'outro';
  observacoes?: string;
  ordem: number;
}

// Tipos para jornadas
export interface JornadaFormData {
  nome: string;
  passos: PassoFormData[];
}

// Tipos para criação completa (bundle)
export interface ProdutoBundleData {
  produto: ProdutoFormData;
  ofertas?: OfertaFormData[];
  jornadas?: JornadaFormData[];
}

// Tipos para filtros e busca
export interface ProdutoFilters {
  status?: string;
  search?: string;
}

// Tipos para estatísticas
export interface ProdutoStats {
  total: number;
  ativos: number;
  inativos: number;
  com_ofertas: number;
}

// Tipos para resposta da API
export interface ProdutosResponse {
  produtos: ProdutoWithOfertas[];
  stats: ProdutoStats;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
