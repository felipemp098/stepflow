/**
 * Script para verificar e corrigir role de admin do usuário atual
 */

import { supabase } from '@/integrations/supabase/client';

export class FixAdminRole {
  /**
   * Verifica o usuário atual e seus roles
   */
  static async checkCurrentUser() {
    try {
      console.log('🔍 Verificando usuário atual...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ Usuário não autenticado:', userError);
        return null;
      }
      
      console.log('👤 Usuário atual:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      });
      
      // Buscar roles do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_client_roles')
        .select(`
          *,
          clientes!inner(nome, id)
        `)
        .eq('user_id', user.id);
      
      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
        return null;
      }
      
      console.log('📋 Roles do usuário:', userRoles);
      
      return { user, userRoles };
    } catch (error) {
      console.error('❌ Erro ao verificar usuário:', error);
      return null;
    }
  }

  /**
   * Cria role de admin para o usuário atual no primeiro cliente disponível
   */
  static async makeUserAdmin() {
    try {
      console.log('🔧 Tornando usuário admin...');
      
      const userData = await this.checkCurrentUser();
      if (!userData) return false;
      
      const { user, userRoles } = userData;
      
      // Verificar se já é admin
      const isAlreadyAdmin = userRoles?.some(role => role.role === 'admin');
      if (isAlreadyAdmin) {
        console.log('✅ Usuário já é admin!');
        return true;
      }
      
      // Buscar primeiro cliente disponível
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .limit(1);
      
      if (clientesError || !clientes || clientes.length === 0) {
        console.error('❌ Nenhum cliente encontrado');
        return false;
      }
      
      const cliente = clientes[0];
      console.log('📋 Usando cliente:', cliente);
      
      // Criar vínculo de admin
      const { error: insertError } = await supabase
        .from('user_client_roles')
        .insert({
          user_id: user.id,
          cliente_id: cliente.id,
          role: 'admin'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar vínculo admin:', insertError);
        return false;
      }
      
      console.log('✅ Usuário agora é admin do cliente:', cliente.nome);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao tornar usuário admin:', error);
      return false;
    }
  }

  /**
   * Cria role de admin para um usuário específico
   */
  static async makeSpecificUserAdmin(userId: string) {
    try {
      console.log('🔧 Tornando usuário específico admin...', userId);
      
      // Verificar se o usuário existe
      const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (userError || !user) {
        console.error('❌ Usuário não encontrado:', userError);
        return false;
      }
      
      console.log('👤 Usuário encontrado:', {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      });
      
      // Verificar se já é admin
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_client_roles')
        .select(`
          *,
          clientes!inner(nome, id)
        `)
        .eq('user_id', userId);
      
      if (rolesError) {
        console.error('❌ Erro ao buscar roles:', rolesError);
        return false;
      }
      
      const isAlreadyAdmin = userRoles?.some(role => role.role === 'admin');
      if (isAlreadyAdmin) {
        console.log('✅ Usuário já é admin!');
        console.log('📋 Roles atuais:', userRoles);
        return true;
      }
      
      // Buscar primeiro cliente disponível
      const { data: clientes, error: clientesError } = await supabase
        .from('clientes')
        .select('id, nome')
        .limit(1);
      
      if (clientesError || !clientes || clientes.length === 0) {
        console.error('❌ Nenhum cliente encontrado');
        return false;
      }
      
      const cliente = clientes[0];
      console.log('📋 Usando cliente:', cliente);
      
      // Criar vínculo de admin
      const { error: insertError } = await supabase
        .from('user_client_roles')
        .insert({
          user_id: userId,
          cliente_id: cliente.id,
          role: 'admin'
        });
      
      if (insertError) {
        console.error('❌ Erro ao criar vínculo admin:', insertError);
        return false;
      }
      
      console.log('✅ Usuário agora é admin do cliente:', cliente.nome);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao tornar usuário admin:', error);
      return false;
    }
  }

  /**
   * Executa a correção completa
   */
  static async fix() {
    console.log('🚀 Iniciando correção de role de admin...\n');
    
    // Verificar usuário atual
    const userData = await this.checkCurrentUser();
    if (!userData) {
      console.log('❌ Não foi possível verificar o usuário');
      return;
    }
    
    console.log('');
    
    // Tornar admin se necessário
    const success = await this.makeUserAdmin();
    
    if (success) {
      console.log('\n🎉 Correção concluída! Agora você pode criar usuários.');
      console.log('📝 Recarregue a página e tente criar um cliente novamente.');
    } else {
      console.log('\n❌ Falha na correção. Verifique os logs acima.');
    }
  }
}

// Função para executar no console do browser
(window as any).fixAdminRole = FixAdminRole.fix;
