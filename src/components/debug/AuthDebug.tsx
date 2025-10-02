import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Database, User, Shield } from 'lucide-react';

export function AuthDebug() {
  const { user, clientes, currentCliente, userRoles, loading } = useAuth();
  const [debugData, setDebugData] = useState<any>(null);
  const [debugLoading, setDebugLoading] = useState(false);

  const runDebug = async () => {
    setDebugLoading(true);
    try {
      console.log('🔍 Iniciando debug de autenticação...');
      
      // 1. Verificar usuário atual
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('👤 Usuário atual:', currentUser);
      
      // 2. Verificar vínculos diretamente
      const { data: roles, error: rolesError } = await supabase
        .from('user_client_roles')
        .select('*')
        .eq('user_id', currentUser?.id);
      
      console.log('🔗 Vínculos encontrados:', roles);
      console.log('❌ Erro vínculos:', rolesError);
      
      // 3. Verificar clientes
      const { data: allClientes, error: clientesError } = await supabase
        .from('clientes')
        .select('*');
      
      console.log('🏢 Todos os clientes:', allClientes);
      console.log('❌ Erro clientes:', clientesError);
      
      // 4. Verificar políticas RLS
      const { data: policies, error: policiesError } = await supabase
        .rpc('get_table_policies', { table_name: 'user_client_roles' });
      
      console.log('🛡️ Políticas RLS:', policies);
      console.log('❌ Erro políticas:', policiesError);
      
      setDebugData({
        user: currentUser,
        roles,
        rolesError,
        allClientes,
        clientesError,
        policies,
        policiesError,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Erro no debug:', error);
      setDebugData({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setDebugLoading(false);
    }
  };

  const testDirectQuery = async () => {
    try {
      console.log('🧪 Testando consulta direta...');
      
      // Testar consulta que o frontend faz
      const { data, error } = await supabase
        .from('user_client_roles')
        .select(`
          *,
          clientes:cliente_id (
            id,
            nome,
            status
          )
        `)
        .eq('user_id', user?.id);
      
      console.log('📊 Resultado da consulta:', data);
      console.log('❌ Erro da consulta:', error);
      
      alert(`Consulta direta: ${error ? `Erro: ${error.message}` : `Sucesso: ${data?.length} vínculos encontrados`}`);
    } catch (error) {
      console.error('❌ Erro na consulta direta:', error);
      alert(`Erro na consulta: ${error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Debug de Autenticação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={runDebug} disabled={debugLoading}>
              {debugLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Executar Debug
            </Button>
            <Button onClick={testDirectQuery} variant="outline">
              Testar Consulta Direta
            </Button>
          </div>

          {/* Estado Atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <User className="h-4 w-4" />
                Estado do Usuário
              </h4>
              <div className="space-y-1 text-sm">
                <div>ID: {user?.id || 'N/A'}</div>
                <div>Email: {user?.email || 'N/A'}</div>
                <div>Loading: {loading ? 'Sim' : 'Não'}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Estado dos Clientes
              </h4>
              <div className="space-y-1 text-sm">
                <div>Total: {clientes.length}</div>
                <div>Atual: {currentCliente?.nome || 'Nenhum'}</div>
                <div>Papéis: {userRoles.length}</div>
              </div>
            </div>
          </div>

          {/* Lista de Clientes */}
          {clientes.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Clientes Disponíveis</h4>
              <div className="space-y-1">
                {clientes.map((cliente) => (
                  <div key={cliente.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{cliente.nome}</span>
                    <Badge variant={cliente.status === 'ativo' ? 'default' : 'secondary'}>
                      {cliente.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dados de Debug */}
          {debugData && (
            <div>
              <h4 className="font-semibold mb-2">Resultado do Debug</h4>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-96">
                {JSON.stringify(debugData, null, 2)}
              </pre>
            </div>
          )}

          {/* Alertas */}
          {clientes.length === 0 && !loading && (
            <Alert>
              <AlertDescription>
                ⚠️ Nenhum cliente encontrado. Verifique se o usuário tem vínculos na tabela user_client_roles.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


