import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface WebhookData {
  event_type: string;
  timestamp: string;
  cliente: {
    id: string;
    nome: string;
    status: string;
    email: string;
    telefone: string;
    cnpj: string;
    cpf: string;
    endereco: string;
    instagram: string;
    observacoes: string;
    created_at: string;
    created_by: string;
  };
  webhook_url: string;
  action_required: string;
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
    const webhookData: WebhookData = await req.json();
    
    console.log('📤 Enviando webhook para n8n:', {
      cliente: webhookData.cliente.nome,
      webhook_url: webhookData.webhook_url
    });

    // Enviar webhook para n8n
    const response = await fetch(webhookData.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    
    console.log('✅ Webhook enviado com sucesso:', responseData);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook enviado com sucesso',
        cliente: webhookData.cliente.nome,
        webhook_url: webhookData.webhook_url,
        response: responseData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Erro ao enviar webhook:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Erro ao enviar webhook',
        message: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
});


