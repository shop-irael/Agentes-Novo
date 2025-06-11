import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { chatVoltConfigSchema } from "@/lib/validations"

// GET - Buscar configuração do ChatVolt do usuário
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const config = await prisma.configuracaoChatVolt.findFirst({
      where: {
        userId: session.user.id
      },
      select: {
        id: true,
        apiKey: true,
        orgId: true,
        webhookSecret: true,
        ativo: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!config) {
      return NextResponse.json({
        configured: false,
        message: "Configuração do ChatVolt não encontrada"
      })
    }

    // Mascarar a API key para segurança
    const configMasked = {
      ...config,
      apiKey: config.apiKey.substring(0, 8) + "..." + config.apiKey.slice(-4)
    }

    return NextResponse.json({
      configured: true,
      config: configMasked
    })

  } catch (error) {
    console.error("Erro ao buscar configuração ChatVolt:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// POST - Criar ou atualizar configuração do ChatVolt
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validar dados
    const validatedData = chatVoltConfigSchema.parse(body)

    // Verificar se já existe uma configuração
    const configExistente = await prisma.configuracaoChatVolt.findFirst({
      where: {
        userId: session.user.id
      }
    })

    let config

    if (configExistente) {
      // Atualizar configuração existente
      config = await prisma.configuracaoChatVolt.update({
        where: {
          id: configExistente.id
        },
        data: {
          apiKey: validatedData.api_key,
          orgId: validatedData.org_id,
          webhookSecret: validatedData.webhook_secret,
          ativo: true,
          updatedAt: new Date()
        }
      })
    } else {
      // Criar nova configuração
      config = await prisma.configuracaoChatVolt.create({
        data: {
          apiKey: validatedData.api_key,
          orgId: validatedData.org_id,
          webhookSecret: validatedData.webhook_secret,
          ativo: true,
          userId: session.user.id
        }
      })
    }

    // Gerar URLs de integração
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
    const integrationUrls = {
      api_endpoint: `${baseUrl}/api/chatvolt`,
      webhook_url: `${baseUrl}/api/chatvolt/webhook`,
      documentation: `${baseUrl}/docs/chatvolt-integration`
    }

    return NextResponse.json({
      success: true,
      message: "Configuração salva com sucesso",
      config_id: config.id,
      integration_urls: integrationUrls,
      instructions: {
        api_usage: "Use os headers x-api-key e x-org-id para autenticação",
        webhook_setup: "Configure o webhook_url no seu painel do ChatVolt",
        available_routes: [
          "GET /api/chatvolt?rota=produtos",
          "GET /api/chatvolt?rota=agentes", 
          "GET /api/chatvolt?rota=contatos",
          "GET /api/chatvolt?rota=conversas",
          "GET /api/chatvolt?rota=status"
        ]
      }
    })

  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { 
          error: "Dados inválidos",
          details: error.errors
        }, 
        { status: 400 }
      )
    }

    console.error("Erro ao salvar configuração ChatVolt:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// PUT - Ativar/desativar configuração
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { ativo } = await request.json()

    if (typeof ativo !== "boolean") {
      return NextResponse.json(
        { error: "Campo 'ativo' deve ser boolean" }, 
        { status: 400 }
      )
    }

    const config = await prisma.configuracaoChatVolt.updateMany({
      where: {
        userId: session.user.id
      },
      data: {
        ativo: ativo,
        updatedAt: new Date()
      }
    })

    if (config.count === 0) {
      return NextResponse.json(
        { error: "Configuração não encontrada" }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Configuração ${ativo ? "ativada" : "desativada"} com sucesso`
    })

  } catch (error) {
    console.error("Erro ao atualizar status da configuração:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// DELETE - Remover configuração
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const config = await prisma.configuracaoChatVolt.deleteMany({
      where: {
        userId: session.user.id
      }
    })

    if (config.count === 0) {
      return NextResponse.json(
        { error: "Configuração não encontrada" }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Configuração removida com sucesso"
    })

  } catch (error) {
    console.error("Erro ao remover configuração:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

