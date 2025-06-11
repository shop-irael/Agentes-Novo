import { NextResponse } from "next/server"

// API de documentação para integração com ChatVolt
export async function GET(request) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  
  const documentation = {
    title: "Master Agentes - API de Integração ChatVolt",
    version: "1.0.0",
    description: "API para integração entre Master Agentes e ChatVolt",
    base_url: `${baseUrl}/api/chatvolt`,
    
    authentication: {
      type: "API Key",
      headers: {
        "x-api-key": "Sua API Key do ChatVolt",
        "x-org-id": "Seu Organization ID do ChatVolt"
      },
      note: "Configure essas credenciais no painel de configurações do Master Agentes"
    },

    endpoints: {
      main_api: {
        url: "/api/chatvolt",
        method: "GET",
        description: "Endpoint principal para buscar dados",
        parameters: {
          rota: {
            type: "string",
            required: true,
            options: ["produtos", "agentes", "contatos", "conversas", "status"],
            description: "Tipo de dados a serem buscados"
          }
        },
        examples: [
          {
            title: "Buscar produtos (agentes)",
            url: `${baseUrl}/api/chatvolt?rota=produtos`,
            response: {
              success: true,
              total: 3,
              produtos: [
                {
                  id: "agent_123",
                  nome: "Bot de Vendas",
                  categoria: "vendas",
                  status: "ativo",
                  descricao: "Agente de vendas - Bot de Vendas",
                  preco: 0,
                  disponivel: true,
                  imagem: "https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Bot%20de%20Vendas.jpg",
                  detalhes: {
                    configuracoes: {},
                    estatisticas: {},
                    data_criacao: "2024-01-01T00:00:00.000Z",
                    ultima_atualizacao: "2024-01-01T00:00:00.000Z"
                  }
                }
              ],
              timestamp: "2024-01-01T00:00:00.000Z"
            }
          },
          {
            title: "Buscar status do sistema",
            url: `${baseUrl}/api/chatvolt?rota=status`,
            response: {
              success: true,
              status: "online",
              estatisticas: {
                agentes: {
                  total: 5,
                  ativos: 3,
                  inativos: 2
                },
                contatos: {
                  total: 150
                },
                conversas: {
                  total: 89,
                  ativas: 12,
                  encerradas: 77
                }
              },
              timestamp: "2024-01-01T00:00:00.000Z",
              versao_api: "1.0.0"
            }
          }
        ]
      },

      webhook: {
        url: "/api/chatvolt/webhook",
        method: "POST",
        description: "Webhook para receber eventos do ChatVolt",
        headers: {
          "x-org-id": "Seu Organization ID",
          "x-chatvolt-signature": "Assinatura do webhook (opcional)"
        },
        events: [
          {
            type: "message.received",
            description: "Nova mensagem recebida",
            payload: {
              type: "message.received",
              data: {
                message_id: "msg_123",
                conversation_id: "conv_456",
                message_text: "Olá, preciso de ajuda",
                message_type: "text",
                sender_type: "user",
                contact: {
                  name: "João Silva",
                  phone: "+5511999999999",
                  email: "joao@email.com"
                },
                metadata: {}
              }
            }
          },
          {
            type: "conversation.started",
            description: "Nova conversa iniciada",
            payload: {
              type: "conversation.started",
              data: {
                conversation_id: "conv_456",
                contact: {
                  name: "João Silva",
                  phone: "+5511999999999",
                  email: "joao@email.com"
                }
              }
            }
          },
          {
            type: "conversation.ended",
            description: "Conversa encerrada",
            payload: {
              type: "conversation.ended",
              data: {
                conversation_id: "conv_456"
              }
            }
          }
        ]
      },

      configuration: {
        url: "/api/chatvolt/config",
        methods: ["GET", "POST", "PUT", "DELETE"],
        description: "Gerenciar configurações do ChatVolt",
        authentication: "NextAuth Session",
        operations: [
          {
            method: "GET",
            description: "Buscar configuração atual",
            response: {
              configured: true,
              config: {
                id: "config_123",
                apiKey: "sk-1234...5678",
                orgId: "org_456",
                ativo: true,
                createdAt: "2024-01-01T00:00:00.000Z"
              }
            }
          },
          {
            method: "POST",
            description: "Criar/atualizar configuração",
            payload: {
              api_key: "sk-1234567890abcdef",
              org_id: "org_456789",
              webhook_secret: "webhook_secret_123"
            },
            response: {
              success: true,
              message: "Configuração salva com sucesso",
              config_id: "config_123",
              integration_urls: {
                api_endpoint: `${baseUrl}/api/chatvolt`,
                webhook_url: `${baseUrl}/api/chatvolt/webhook`,
                documentation: `${baseUrl}/docs/chatvolt-integration`
              }
            }
          }
        ]
      }
    },

    integration_guide: {
      step1: {
        title: "Configurar credenciais",
        description: "Acesse o painel do Master Agentes e configure suas credenciais do ChatVolt",
        url: `${baseUrl}/configuracoes`
      },
      step2: {
        title: "Configurar webhook",
        description: "No painel do ChatVolt, configure o webhook URL",
        webhook_url: `${baseUrl}/api/chatvolt/webhook`
      },
      step3: {
        title: "Testar integração",
        description: "Faça uma requisição de teste para verificar se tudo está funcionando",
        test_url: `${baseUrl}/api/chatvolt?rota=status`
      }
    },

    error_codes: {
      401: "API Key ou Organization ID não fornecidos ou inválidos",
      403: "Configuração não encontrada ou inativa",
      404: "Rota não encontrada",
      500: "Erro interno do servidor"
    },

    support: {
      documentation: `${baseUrl}/docs`,
      contact: "suporte@masteragentes.com",
      github: "https://github.com/masteragentes/api"
    }
  }

  return NextResponse.json(documentation, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  })
}

