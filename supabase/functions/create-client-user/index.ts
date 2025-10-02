import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { cliente_id, nome, email, telefone } = await req.json()

    if (!cliente_id || !nome || !email) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios: cliente_id, nome, email' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o usuário atual pode criar usuários
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
    console.log('❌ Erro na busca de roles:', roleError);

    if (roleError) {
      console.error('❌ Erro ao buscar roles:', roleError);
      return new Response(
        JSON.stringify({ error: 'Erro ao verificar permissões do usuário', details: roleError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const hasAdminRole = userRoles && userRoles.some(role => role.role === 'admin');
    console.log('👑 Tem role admin?', hasAdminRole);
    
    // 3. Verificar se pode criar usuários (super admin OU tem role admin)
    const canCreateUsers = isSuperAdmin || hasAdminRole;
    console.log('✅ Pode criar usuários?', canCreateUsers);
    
    if (!canCreateUsers) {
      console.log('❌ Usuário não tem permissão para criar usuários');
      console.log('📊 Detalhes:', {
        isSuperAdmin,
        hasAdminRole,
        userRoles,
        userMetadata: user.user_metadata
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Apenas administradores podem criar usuários',
          user_id: user.id,
          isSuperAdmin,
          hasAdminRole,
          user_roles: userRoles
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se o cliente_id existe
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

    // Gerar senha temporária
    const tempPassword = generateTempPassword()
    console.log('🔑 Senha temporária gerada:', tempPassword);
    
    // Verificar se temos Service Role Key
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    console.log('🔑 Service Role Key presente?', !!serviceRoleKey);
    console.log('🔑 Service Role Key prefix:', serviceRoleKey?.substring(0, 20) + '...');
    console.log('🌐 Supabase URL:', supabaseUrl);
    
    // Criar usuário no Supabase Auth usando API REST
    console.log('👤 Criando usuário no auth com dados:', {
      email,
      email_confirm: true,
      user_metadata: {
        full_name: nome,
        phone: telefone || null
      }
    });
    
    // Usar API REST diretamente
    const createUserResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!
      },
      body: JSON.stringify({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: nome,
          phone: telefone || null
        }
      })
    });
    
    console.log('📡 Response status:', createUserResponse.status);
    console.log('📡 Response headers:', Object.fromEntries(createUserResponse.headers.entries()));
    
    const createUserData = await createUserResponse.json();
    console.log('📡 Response data:', createUserData);
    
    if (!createUserResponse.ok) {
      console.error('❌ Erro na API REST:', createUserData);
      return new Response(
        JSON.stringify({ error: `Erro ao criar usuário: ${createUserData.message || createUserData.error_description || 'Erro desconhecido'}` }),
        { 
          status: createUserResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    const newUser = createUserData;

    // Vincular usuário ao cliente com role 'cliente' usando API REST
    console.log('🔗 Vinculando usuário ao cliente...');
    const linkResponse = await fetch(`${supabaseUrl}/rest/v1/user_client_roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: newUser.id,
        cliente_id: cliente_id,
        role: 'cliente'
      })
    });
    
    console.log('📡 Link response status:', linkResponse.status);
    console.log('📡 Link response headers:', Object.fromEntries(linkResponse.headers.entries()));

    if (!linkResponse.ok) {
      const linkError = await linkResponse.json();
      console.error('❌ Erro ao vincular usuário ao cliente:', linkError);
      
      // Tentar remover o usuário criado em caso de erro no vínculo
      await supabaseClient.auth.admin.deleteUser(newUser.id);
      
      return new Response(
        JSON.stringify({ error: `Erro ao vincular usuário: ${linkError.message || 'Erro desconhecido'}` }),
        { 
          status: linkResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ Usuário vinculado ao cliente com sucesso');

    // Verificar se o perfil já existe antes de criar
    console.log('🔍 Verificando se perfil já existe...');
    const checkProfileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${newUser.id}&select=user_id`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey!
      }
    });

    const existingProfiles = await checkProfileResponse.json();
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Perfil já existe, atualizando...');
      // Atualizar perfil existente
      const updateProfileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${newUser.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          full_name: nome,
          avatar_url: null
        })
      });

      if (!updateProfileResponse.ok) {
        const updateError = await updateProfileResponse.json();
        console.error('⚠️ Erro ao atualizar perfil:', updateError);
      } else {
        console.log('✅ Perfil atualizado com sucesso');
      }
    } else {
      console.log('👤 Criando novo perfil do usuário...');
      // Criar novo perfil
      const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: newUser.id,
          full_name: nome,
          avatar_url: null
        })
      });

      if (!profileResponse.ok) {
        const profileError = await profileResponse.json();
        console.error('⚠️ Erro ao criar perfil:', profileError);
        // Não falhamos aqui pois o usuário já foi criado e vinculado
      } else {
        console.log('✅ Perfil criado com sucesso');
      }
    }

    // Enviar email de boas-vindas
    try {
      console.log('📧 Enviando email de boas-vindas...');
      
      const welcomeEmailResponse = await fetch(`${supabaseUrl}/functions/v1/send-welcome-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceRoleKey!
        },
        body: JSON.stringify({
          email: email,
          nome: nome,
          senha_temporaria: tempPassword,
          cliente_nome: cliente.nome
        })
      });

      if (welcomeEmailResponse.ok) {
        console.log('✅ Email de boas-vindas enviado com sucesso');
      } else {
        console.warn('⚠️ Falha ao enviar email de boas-vindas:', await welcomeEmailResponse.text());
      }
    } catch (emailError) {
      console.warn('⚠️ Erro ao enviar email de boas-vindas:', emailError);
      // Não falhamos a operação se o email falhar
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.id,
          email: newUser.email,
          temp_password: tempPassword
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateTempPassword(): string {
  // Gerar senha temporária de 8 caracteres com letras e números
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let password = ''
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}