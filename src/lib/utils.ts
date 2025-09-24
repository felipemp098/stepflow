import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para formatar valor monetário
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para converter string monetária para número
export function parseCurrency(value: string): number {
  // Remove tudo exceto números e vírgula/ponto
  const cleanValue = value.replace(/[^\d,.-]/g, '');
  // Substitui vírgula por ponto para parseFloat
  const normalizedValue = cleanValue.replace(',', '.');
  return parseFloat(normalizedValue) || 0;
}

// Função para aplicar máscara monetária em input
export function applyCurrencyMask(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) return '';
  
  // Converte para centavos
  const amount = parseInt(numbers) / 100;
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount);
}

// Função para lidar com input monetário em tempo real
export function handleCurrencyInput(value: string, currentValue: number): { display: string; numeric: number } {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');
  
  if (!numbers) {
    return { display: '', numeric: 0 };
  }
  
  // Converte para centavos
  const amount = parseInt(numbers) / 100;
  
  // Formata para exibição
  const display = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(amount);
  
  return { display, numeric: amount };
}