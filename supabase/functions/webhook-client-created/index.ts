import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface WebhookPayload {
  event_type: string;
  timestamp: string;
  cliente: {
    id: string;
    nome: string;
    status: string;
    email?: string;
    telefone?: string;
    cnpj?: string;
    cpf?: string;
    endereco?: string;
    instagram?: string;
    observacoes?: string;
    created_at: string;
    created_by: string;
  };
  usuario_cliente: {
    id: string;
    email: string;
    password: string;
    role: string;
    created_at: string;
  };
  webhook_url: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido' }),
        { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse do payload
    const payload: WebhookPayload = await req.json();
    
    console.log('📨 Webhook recebido:', {
      event_type: payload.event_type,
      cliente_id: payload.cliente.id,
      cliente_nome: payload.cliente.nome,
      usuario_email: payload.usuario_cliente.email,
      timestamp: payload.timestamp
    });

    // Validar payload
    if (!payload.cliente || !payload.usuario_cliente) {
      return new Response(
        JSON.stringify({ error: 'Payload inválido' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Processar webhook
    const result = await processClientCreatedWebhook(payload);

    // Log de sucesso
    console.log('✅ Webhook processado com sucesso:', {
      cliente_id: payload.cliente.id,
      usuario_id: payload.usuario_cliente.id,
      result
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook processado com sucesso',
        data: result
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});

async function processClientCreatedWebhook(payload: WebhookPayload) {
  // Aqui você pode implementar a lógica específica do seu negócio
  // Por exemplo:
  // - Enviar email de boas-vindas
  // - Criar configurações iniciais
  // - Integrar com sistemas externos
  // - Enviar notificações

  const result = {
    cliente_id: payload.cliente.id,
    cliente_nome: payload.cliente.nome,
    usuario_id: payload.usuario_cliente.id,
    usuario_email: payload.usuario_cliente.email,
    processed_at: new Date().toISOString(),
    actions: [
      'Usuário cliente criado',
      'Vínculo cliente-usuário estabelecido',
      'Webhook processado',
      'Notificação enviada'
    ]
  };

  // Exemplo: Enviar email de boas-vindas
  await sendWelcomeEmail(payload);

  // Exemplo: Criar configurações iniciais
  await createInitialSettings(payload);

  return result;
}

async function sendWelcomeEmail(payload: WebhookPayload) {
  // Implementar envio de email
  // Exemplo com Resend, SendGrid, etc.
  console.log('📧 Enviando email de boas-vindas para:', payload.usuario_cliente.email);
  
  // Simular envio de email
  const emailData = {
    to: payload.usuario_cliente.email,
    subject: `Bem-vindo ao StepFlow, ${payload.cliente.nome}!`,
    html: `
      <h1>Bem-vindo ao StepFlow!</h1>
      <p>Olá, ${payload.cliente.nome}!</p>
      <p>Seu usuário cliente foi criado com sucesso.</p>
      <p><strong>Email:</strong> ${payload.usuario_cliente.email}</p>
      <p><strong>Senha temporária:</strong> ${payload.usuario_cliente.password}</p>
      <p>Por favor, altere sua senha no primeiro login.</p>
      <p>Atenciosamente,<br>Equipe StepFlow</p>
    `
  };
  
  console.log('📧 Dados do email:', emailData);
}

async function createInitialSettings(payload: WebhookPayload) {
  // Implementar criação de configurações iniciais
  console.log('⚙️ Criando configurações iniciais para cliente:', payload.cliente.id);
  
  // Exemplo: Criar configurações padrão
  const settings = {
    cliente_id: payload.cliente.id,
    usuario_id: payload.usuario_cliente.id,
    theme: 'light',
    notifications: true,
    language: 'pt-BR',
    created_at: new Date().toISOString()
  };
  
  console.log('⚙️ Configurações criadas:', settings);
}


