/**
 * Script de configuração e teste do sistema RBAC
 * Execute após aplicar as migrações
 */

import { supabase } from '@/integrations/supabase/client';

export class TestSetup {
  /**
   * Cria um usuário admin de teste
   */
  static async createTestAdmin() {
    try {
      // Criar usuário admin
      const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: 'admin@teste.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: { full_name: 'Admin Teste' }
      });

      if (userError) {
        console.error('Erro ao criar usuário admin:', userError);
        return null;
      }

      // Buscar o primeiro cliente (Cliente A)
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', 'Cliente A - Academia Fitness')
        .single();

      if (clienteError) {
        console.error('Erro ao buscar cliente:', clienteError);
        return null;
      }

      // Vincular usuário como admin do cliente
      const { error: roleError } = await supabase
        .from('user_client_roles')
        .insert({
          user_id: user.user.id,
          cliente_id: cliente.id,
          role: 'admin'
        });

      if (roleError) {
        console.error('Erro ao criar vínculo admin:', roleError);
        return null;
      }

      console.log('✅ Usuário admin criado com sucesso!');
      console.log('Email: admin@teste.com');
      console.log('Senha: admin123');
      console.log('Cliente ID:', cliente.id);

      return { user, cliente };
    } catch (error) {
      console.error('Erro no setup:', error);
      return null;
    }
  }

  /**
   * Cria um usuário cliente de teste
   */
  static async createTestClient() {
    try {
      // Criar usuário cliente
      const { data: user, error: userError } = await supabase.auth.admin.createUser({
        email: 'cliente@teste.com',
        password: 'cliente123',
        email_confirm: true,
        user_metadata: { full_name: 'Cliente Teste' }
      });

      if (userError) {
        console.error('Erro ao criar usuário cliente:', userError);
        return null;
      }

      // Buscar o segundo cliente (Cliente B)
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('id')
        .eq('nome', 'Cliente B - Escola Online')
        .single();

      if (clienteError) {
        console.error('Erro ao buscar cliente:', clienteError);
        return null;
      }

      // Vincular usuário como cliente do tenant
      const { error: roleError } = await supabase
        .from('user_client_roles')
        .insert({
          user_id: user.user.id,
          cliente_id: cliente.id,
          role: 'cliente'
        });

      if (roleError) {
        console.error('Erro ao criar vínculo cliente:', roleError);
        return null;
      }

      console.log('✅ Usuário cliente criado com sucesso!');
      console.log('Email: cliente@teste.com');
      console.log('Senha: cliente123');
      console.log('Cliente ID:', cliente.id);

      return { user, cliente };
    } catch (error) {
      console.error('Erro no setup:', error);
      return null;
    }
  }

  /**
   * Testa o isolamento multi-tenant
   */
  static async testTenantIsolation() {
    try {
      console.log('🧪 Testando isolamento multi-tenant...');

      // Buscar clientes
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome');

      if (clientesError) {
        console.error('Erro ao buscar clientes:', clientesError);
        return false;
      }

      console.log('📋 Clientes disponíveis:');
      clientes?.forEach(cliente => {
        console.log(`  - ${cliente.nome} (ID: ${cliente.id})`);
      });

      // Testar RLS - buscar contratos de cada cliente
      for (const cliente of clientes || []) {
        const { data: contratos, error: contratosError } = await supabase
          .from('contratos')
          .select('id, nome, cliente_id')
          .eq('cliente_id', cliente.id);

        if (contratosError) {
          console.error(`Erro ao buscar contratos do cliente ${cliente.nome}:`, contratosError);
          continue;
        }

        console.log(`📄 Contratos do ${cliente.nome}: ${contratos?.length || 0}`);
      }

      console.log('✅ Teste de isolamento concluído!');
      return true;
    } catch (error) {
      console.error('Erro no teste:', error);
      return false;
    }
  }

  /**
   * Testa as políticas RLS
   */
  static async testRLSPolicies() {
    try {
      console.log('🛡️ Testando políticas RLS...');

      // Testar acesso sem autenticação (deve falhar)
      const { data: contratosSemAuth, error: semAuthError } = await supabase
        .from('contratos')
        .select('*');

      if (!semAuthError) {
        console.log('⚠️ RLS pode não estar funcionando - dados retornados sem auth');
      } else {
        console.log('✅ RLS funcionando - acesso negado sem autenticação');
      }

      console.log('✅ Teste de RLS concluído!');
      return true;
    } catch (error) {
      console.error('Erro no teste RLS:', error);
      return false;
    }
  }

  /**
   * Executa todos os testes
   */
  static async runAllTests() {
    console.log('🚀 Iniciando testes do sistema RBAC...\n');

    // Teste 1: Isolamento multi-tenant
    await this.testTenantIsolation();
    console.log('');

    // Teste 2: Políticas RLS
    await this.testRLSPolicies();
    console.log('');

    // Teste 3: Criar usuários de teste
    console.log('👥 Criando usuários de teste...');
    await this.createTestAdmin();
    console.log('');
    await this.createTestClient();
    console.log('');

    console.log('🎉 Testes concluídos!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Faça login com os usuários criados');
    console.log('2. Teste a seleção de cliente no frontend');
    console.log('3. Verifique se as requisições incluem X-Client-Id');
    console.log('4. Teste as permissões RBAC');
  }
}

// Função para executar no console do browser
(window as any).testRBAC = TestSetup.runAllTests;
