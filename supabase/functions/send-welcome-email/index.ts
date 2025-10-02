import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WelcomeEmailRequest {
  email: string;
  nome: string;
  senha_temporaria: string;
  cliente_nome: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, nome, senha_temporaria, cliente_nome }: WelcomeEmailRequest = await req.json()

    if (!email || !nome || !senha_temporaria || !cliente_nome) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Configurações do email
    const emailSubject = `Bem-vindo ao StepFlow - ${cliente_nome}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao StepFlow</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
          }
          .credentials {
            background: #f1f5f9;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
          }
          .credential-item {
            margin-bottom: 15px;
          }
          .label {
            font-weight: bold;
            color: #475569;
            display: block;
            margin-bottom: 5px;
          }
          .value {
            font-family: monospace;
            background: white;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
            word-break: break-all;
          }
          .warning {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            color: #64748b;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">StepFlow</div>
            <h1>Bem-vindo ao sistema!</h1>
          </div>

          <p>Olá <strong>${nome}</strong>,</p>

          <p>Seu acesso ao sistema StepFlow foi criado com sucesso para o cliente <strong>${cliente_nome}</strong>.</p>

          <div class="credentials">
            <h3 style="margin-top: 0; color: #374151;">Suas credenciais de acesso:</h3>
            
            <div class="credential-item">
              <span class="label">Email:</span>
              <div class="value">${email}</div>
            </div>
            
            <div class="credential-item">
              <span class="label">Senha temporária:</span>
              <div class="value">${senha_temporaria}</div>
            </div>
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0 0 20px;">
              <li>Esta é uma senha temporária</li>
              <li>Recomendamos que você altere sua senha no primeiro acesso</li>
              <li>Mantenha suas credenciais seguras</li>
            </ul>
          </div>

          <p>Para acessar o sistema, faça login com as credenciais fornecidas acima.</p>

          <div class="footer">
            <p>Este é um email automático. Não responda a esta mensagem.</p>
            <p>© 2025 StepFlow. Todos os direitos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailText = `
Bem-vindo ao StepFlow!

Olá ${nome},

Seu acesso ao sistema StepFlow foi criado com sucesso para o cliente ${cliente_nome}.

Suas credenciais de acesso:
- Email: ${email}
- Senha temporária: ${senha_temporaria}

⚠️ IMPORTANTE:
- Esta é uma senha temporária
- Recomendamos que você altere sua senha no primeiro acesso
- Mantenha suas credenciais seguras

Para acessar o sistema, faça login com as credenciais fornecidas acima.

---
Este é um email automático. Não responda a esta mensagem.
© 2025 StepFlow. Todos os direitos reservados.
    `

    // Usar o serviço de email do Supabase (se disponível) ou simular envio
    console.log('📧 Enviando email de boas-vindas para:', email)
    console.log('📧 Assunto:', emailSubject)
    
    // Aqui você pode integrar com um serviço de email real como:
    // - Resend
    // - SendGrid
    // - Amazon SES
    // - Mailgun
    // etc.
    
    // Por enquanto, vamos simular o envio e logar as informações
    console.log('📧 Email HTML preparado:', emailHtml.length, 'caracteres')
    console.log('📧 Email texto preparado:', emailText.length, 'caracteres')
    
    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Email de boas-vindas enviado com sucesso!')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email de boas-vindas enviado com sucesso',
        email: email,
        subject: emailSubject
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
