/**
 * Script de teste para criação automática de usuário ao criar cliente
 */

import { supabase } from '@/integrations/supabase/client';

export class TestCreateUser {
  /**
   * Testa a criação de cliente com usuário automático
   */
  static async testCreateClientWithUser() {
    try {
      console.log('🧪 Testando criação de cliente com usuário automático...');

      // Dados do cliente de teste
      const clienteData = {
        nome: 'Cliente Teste Usuário',
        email: 'cliente.teste@exemplo.com',
        telefone: '(11) 99999-9999',
        status: 'ativo',
        endereco: 'Rua Teste, 123 - São Paulo/SP',
        observacoes: 'Cliente criado para teste de usuário automático'
      };

      console.log('📝 Dados do cliente:', clienteData);

      // Criar cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .insert(clienteData)
        .select()
        .single();

      if (clienteError) {
        console.error('❌ Erro ao criar cliente:', clienteError);
        return false;
      }

      console.log('✅ Cliente criado:', cliente);

      // Verificar se o usuário foi criado
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_client_roles')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('cliente_id', cliente.id)
        .eq('role', 'user');

      if (rolesError) {
        console.error('❌ Erro ao buscar usuários do cliente:', rolesError);
        return false;
      }

      console.log('👥 Usuários vinculados ao cliente:', userRoles);

      if (userRoles && userRoles.length > 0) {
        console.log('✅ Usuário criado automaticamente!');
        console.log('📧 Email do usuário:', userRoles[0].profiles?.full_name);
        return true;
      } else {
        console.log('⚠️ Nenhum usuário foi criado automaticamente');
        return false;
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      return false;
    }
  }

  /**
   * Testa a Edge Function de criação de usuário
   */
  static async testCreateUserEdgeFunction() {
    try {
      console.log('🧪 Testando Edge Function de criação de usuário...');

      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        console.error('❌ Usuário não autenticado');
        return false;
      }

      // Buscar um cliente existente
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .limit(1);

      if (clientesError || !clientes || clientes.length === 0) {
        console.error('❌ Nenhum cliente encontrado para teste');
        return false;
      }

      const cliente = clientes[0];
      console.log('📋 Usando cliente:', cliente);

      // Dados do usuário de teste
      const userData = {
        cliente_id: cliente.id,
        nome: 'Usuário Teste Edge Function',
        email: `usuario.teste.${Date.now()}@exemplo.com`,
        telefone: '(11) 88888-8888'
      };

      console.log('📝 Dados do usuário:', userData);

      // Chamar Edge Function
      const response = await fetch('https://irwreedairelbbekrvyq.supabase.co/functions/v1/create-client-user', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();
      console.log('📊 Resposta da Edge Function:', result);

      if (response.ok && result.success) {
        console.log('✅ Edge Function funcionando!');
        console.log('🔑 Senha temporária:', result.user?.temp_password);
        return true;
      } else {
        console.error('❌ Erro na Edge Function:', result.error);
        return false;
      }

    } catch (error) {
      console.error('❌ Erro no teste da Edge Function:', error);
      return false;
    }
  }

  /**
   * Executa todos os testes
   */
  static async runAllTests() {
    console.log('🚀 Iniciando testes de criação de usuário...\n');

    // Teste 1: Edge Function
    console.log('1️⃣ Testando Edge Function...');
    const edgeFunctionTest = await this.testCreateUserEdgeFunction();
    console.log('');

    // Teste 2: Criação automática (se a Edge Function funcionar)
    if (edgeFunctionTest) {
      console.log('2️⃣ Testando criação automática de usuário...');
      const autoCreateTest = await this.testCreateClientWithUser();
      console.log('');
    }

    console.log('🎉 Testes concluídos!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Verifique se a Edge Function está deployada');
    console.log('2. Teste a criação de cliente no frontend');
    console.log('3. Verifique se o usuário aparece na lista de usuários do cliente');
  }
}

// Função para executar no console do browser
(window as any).testCreateUser = TestCreateUser.runAllTests;
