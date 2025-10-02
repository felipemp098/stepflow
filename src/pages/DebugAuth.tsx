import React from 'react';
import { AuthDebug } from '@/components/debug/AuthDebug';
import { SectionHeader } from '@/components/ui-custom/SectionHeader';

export default function DebugAuth() {
  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Debug de Autenticação" 
        description="Ferramenta para diagnosticar problemas de carregamento de clientes"
      />
      
      <AuthDebug />
    </div>
  );
}

