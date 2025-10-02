import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteClientRequest {
  cliente_id: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cliente_id }: DeleteClientRequest = await req.json()
    const authHeader = req.headers.get('Authorization')!

    if (!cliente_id) {
      return new Response(
        JSON.stringify({ error: 'ID do cliente é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Usuário não autenticado:', userError);
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o usuário atual pode excluir clientes
    console.log('🔍 Verificando permissões do usuário:', user.id);
    
    // 1. Verificar se é super admin via user_metadata
    const isSuperAdmin = user.user_metadata?.role === 'super_admin';
    console.log('👑 É super admin?', isSuperAdmin);
    
    // 2. Verificar se tem role admin em algum cliente
    const { data: userRoles, error: roleError } = await supabaseClient
      .from('user_client_roles')
      .select('role, cliente_id')
      .eq('user_id', user.id)

    console.log('📋 Roles encontrados:', userRoles);

    if (roleError) {
      console.error('❌ Erro ao buscar roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões do usuário' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const hasAdminRole = userRoles && userRoles.some(role => role.role === 'admin');
    console.log('👑 Tem role admin?', hasAdminRole);
    
    // 3. Verificar se pode excluir clientes (super admin OU tem role admin)
    const canDeleteClients = isSuperAdmin || hasAdminRole;
    console.log('✅ Pode excluir clientes?', canDeleteClients);
    
    if (!canDeleteClients) {
      console.log('❌ Usuário não tem permissão para excluir clientes');
      return new Response(
        JSON.stringify({ error: 'Apenas administradores podem excluir clientes' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o cliente existe
    const { data: cliente, error: clienteError } = await supabaseClient
      .from('clientes')
      .select('id, nome')
      .eq('id', cliente_id)
      .single()

    if (clienteError || !cliente) {
      console.error('❌ Cliente não encontrado:', clienteError);
      return new Response(
        JSON.stringify({ error: 'Cliente não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Cliente encontrado:', cliente);

    // 1. Buscar usuários vinculados ao cliente usando API REST
    console.log('🔍 Buscando vínculos para cliente:', cliente_id);
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const rolesResponse = await fetch(`${supabaseUrl}/rest/v1/user_client_roles?cliente_id=eq.${cliente_id}&select=user_id,role`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!
      }
    });

    console.log('📡 Roles response status:', rolesResponse.status);
    console.log('📡 Roles response headers:', Object.fromEntries(rolesResponse.headers.entries()));

    if (!rolesResponse.ok) {
      const rolesError = await rolesResponse.json();
      console.error('❌ Erro ao buscar vínculos:', rolesError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar usuários vinculados' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const userRolesToDelete = await rolesResponse.json();

    console.log('👥 Usuários vinculados encontrados:', userRolesToDelete?.length || 0);

    // 2. Processar usuários vinculados (se houver)
    if (userRolesToDelete && userRolesToDelete.length > 0) {
      const userIds = userRolesToDelete.map(role => role.user_id);
      
      // 2.1. Excluir perfis dos usuários primeiro
      console.log('🗑️ Excluindo perfis dos usuários...');
      const { error: deleteProfilesError } = await supabaseClient
        .from('profiles')
        .delete()
        .in('user_id', userIds);

      if (deleteProfilesError) {
        console.error('⚠️ Erro ao excluir perfis:', deleteProfilesError);
        // Não falhamos aqui, continuamos
      } else {
        console.log('✅ Perfis excluídos com sucesso');
      }

      // 2.2. Excluir usuários do Supabase Auth usando API REST
      console.log('🗑️ Excluindo usuários do auth...');
      for (const userId of userIds) {
        try {
          const deleteUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceRoleKey!
            }
          });

          if (!deleteUserResponse.ok) {
            const deleteUserError = await deleteUserResponse.json();
            console.error(`⚠️ Erro ao excluir usuário ${userId}:`, deleteUserError);
          } else {
            console.log(`✅ Usuário ${userId} excluído do auth`);
          }
        } catch (userDeleteError) {
          console.error(`⚠️ Erro ao excluir usuário ${userId}:`, userDeleteError);
        }
      }

      // 2.3. Excluir vínculos na tabela user_client_roles por último
      console.log('🗑️ Excluindo vínculos...');
      const { error: deleteRolesError } = await supabaseClient
        .from('user_client_roles')
        .delete()
        .eq('cliente_id', cliente_id);

      if (deleteRolesError) {
        console.error('❌ Erro ao excluir vínculos:', deleteRolesError);
        return new Response(
          JSON.stringify({ error: 'Erro ao excluir vínculos de usuários' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ Vínculos excluídos com sucesso');
    }

    // 5. Excluir o cliente
    const { error: deleteClienteError } = await supabaseClient
      .from('clientes')
      .delete()
      .eq('id', cliente_id);

    if (deleteClienteError) {
      console.error('❌ Erro ao excluir cliente:', deleteClienteError);
      return new Response(
        JSON.stringify({ error: 'Erro ao excluir cliente' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('✅ Cliente excluído com sucesso');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Cliente e usuários relacionados excluídos com sucesso',
        deleted_users: userRolesToDelete?.length || 0,
        cliente_nome: cliente.nome
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
