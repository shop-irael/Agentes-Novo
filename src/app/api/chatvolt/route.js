import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// API para integração com ChatVolt - Endpoint principal para produtos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const rota = searchParams.get("rota")
    const apiKey = request.headers.get("x-api-key")
    const orgId = request.headers.get("x-org-id")

    // Verificar se a API key e org ID foram fornecidos
    if (!apiKey || !orgId) {
      return NextResponse.json(
        { 
          error: "API Key e Organization ID são obrigatórios",
          message: "Forneça x-api-key e x-org-id nos headers da requisição"
        }, 
        { status: 401 }
      )
    }

    // Verificar se a configuração do ChatVolt existe e está ativa
    const config = await prisma.configuracaoChatVolt.findFirst({
      where: {
        apiKey: apiKey,
        orgId: orgId,
        ativo: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!config) {
      return NextResponse.json(
        { 
          error: "Configuração não encontrada ou inativa",
          message: "Verifique suas credenciais do ChatVolt"
        }, 
        { status: 403 }
      )
    }

    // Roteamento baseado no parâmetro 'rota'
    switch (rota) {
      case "produtos":
        return await handleProdutos(config.userId)
      
      case "agentes":
        return await handleAgentes(config.userId)
      
      case "contatos":
        return await handleContatos(config.userId)
      
      case "conversas":
        return await handleConversas(config.userId)
      
      case "status":
        return await handleStatus(config.userId)
      
      default:
        return NextResponse.json(
          { 
            error: "Rota não encontrada",
            message: "Rotas disponíveis: produtos, agentes, contatos, conversas, status",
            available_routes: ["produtos", "agentes", "contatos", "conversas", "status"]
          }, 
          { status: 404 }
        )
    }

  } catch (error) {
    console.error("Erro na API ChatVolt:", error)
    return NextResponse.json(
      { 
        error: "Erro interno do servidor",
        message: "Tente novamente mais tarde"
      }, 
      { status: 500 }
    )
  }
}

// Handler para produtos (compatibilidade com sistema original)
async function handleProdutos(userId) {
  try {
    // Buscar agentes do usuário (representando "produtos" do sistema)
    const agentes = await prisma.agente.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        nome: true,
        tipo: true,
        status: true,
        configuracoes: true,
        estatisticas: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Formatar dados para compatibilidade com ChatVolt
    const produtos = agentes.map(agente => ({
      id: agente.id,
      nome: agente.nome,
      categoria: agente.tipo,
      status: agente.status,
      descricao: `Agente de ${agente.tipo} - ${agente.nome}`,
      preco: agente.estatisticas?.preco || 0,
      disponivel: agente.status === "ativo",
      imagem: `https://via.placeholder.com/300x200/8b5cf6/ffffff?text=${encodeURIComponent(agente.nome)}.jpg`,
      detalhes: {
        configuracoes: agente.configuracoes,
        estatisticas: agente.estatisticas,
        data_criacao: agente.createdAt,
        ultima_atualizacao: agente.updatedAt
      }
    }))

    return NextResponse.json({
      success: true,
      total: produtos.length,
      produtos: produtos,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produtos" }, 
      { status: 500 }
    )
  }
}

// Handler para agentes
async function handleAgentes(userId) {
  try {
    const agentes = await prisma.agente.findMany({
      where: {
        userId: userId
      },
      include: {
        _count: {
          select: {
            conversas: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const agentesFormatados = agentes.map(agente => ({
      id: agente.id,
      nome: agente.nome,
      tipo: agente.tipo,
      status: agente.status,
      total_conversas: agente._count.conversas,
      configuracoes: agente.configuracoes,
      estatisticas: agente.estatisticas,
      data_criacao: agente.createdAt,
      ultima_atualizacao: agente.updatedAt
    }))

    return NextResponse.json({
      success: true,
      total: agentesFormatados.length,
      agentes: agentesFormatados,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao buscar agentes:", error)
    return NextResponse.json(
      { error: "Erro ao buscar agentes" }, 
      { status: 500 }
    )
  }
}

// Handler para contatos
async function handleContatos(userId) {
  try {
    const contatos = await prisma.contato.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100 // Limitar a 100 contatos por requisição
    })

    const contatosFormatados = contatos.map(contato => ({
      id: contato.id,
      nome: contato.nome,
      email: contato.email,
      telefone: contato.telefone,
      origem: contato.origem,
      tags: contato.tags,
      data_criacao: contato.createdAt,
      ultima_atualizacao: contato.updatedAt
    }))

    return NextResponse.json({
      success: true,
      total: contatosFormatados.length,
      contatos: contatosFormatados,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao buscar contatos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar contatos" }, 
      { status: 500 }
    )
  }
}

// Handler para conversas
async function handleConversas(userId) {
  try {
    const conversas = await prisma.conversa.findMany({
      where: {
        userId: userId
      },
      include: {
        agente: {
          select: {
            id: true,
            nome: true,
            tipo: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 50 // Limitar a 50 conversas por requisição
    })

    const conversasFormatadas = conversas.map(conversa => ({
      id: conversa.id,
      cliente_nome: conversa.clienteNome,
      telefone: conversa.telefone,
      email: conversa.email,
      status: conversa.status,
      origem: conversa.origem,
      chatvolt_id: conversa.chatvoltId,
      agente: conversa.agente,
      mensagens: conversa.mensagens,
      data_inicio: conversa.createdAt,
      ultima_interacao: conversa.updatedAt
    }))

    return NextResponse.json({
      success: true,
      total: conversasFormatadas.length,
      conversas: conversasFormatadas,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Erro ao buscar conversas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar conversas" }, 
      { status: 500 }
    )
  }
}

// Handler para status do sistema
async function handleStatus(userId) {
  try {
    // Buscar estatísticas gerais
    const [totalAgentes, agentesAtivos, totalContatos, totalConversas, conversasAtivas] = await Promise.all([
      prisma.agente.count({ where: { userId } }),
      prisma.agente.count({ where: { userId, status: "ativo" } }),
      prisma.contato.count({ where: { userId } }),
      prisma.conversa.count({ where: { userId } }),
      prisma.conversa.count({ where: { userId, status: "ativa" } })
    ])

    return NextResponse.json({
      success: true,
      status: "online",
      estatisticas: {
        agentes: {
          total: totalAgentes,
          ativos: agentesAtivos,
          inativos: totalAgentes - agentesAtivos
        },
        contatos: {
          total: totalContatos
        },
        conversas: {
          total: totalConversas,
          ativas: conversasAtivas,
          encerradas: totalConversas - conversasAtivas
        }
      },
      timestamp: new Date().toISOString(),
      versao_api: "1.0.0"
    })

  } catch (error) {
    console.error("Erro ao buscar status:", error)
    return NextResponse.json(
      { error: "Erro ao buscar status" }, 
      { status: 500 }
    )
  }
}

// POST para criar/atualizar dados via ChatVolt
export async function POST(request) {
  try {
    const apiKey = request.headers.get("x-api-key")
    const orgId = request.headers.get("x-org-id")
    const body = await request.json()

    if (!apiKey || !orgId) {
      return NextResponse.json(
        { error: "API Key e Organization ID são obrigatórios" }, 
        { status: 401 }
      )
    }

    // Verificar configuração
    const config = await prisma.configuracaoChatVolt.findFirst({
      where: {
        apiKey: apiKey,
        orgId: orgId,
        ativo: true
      }
    })

    if (!config) {
      return NextResponse.json(
        { error: "Configuração não encontrada ou inativa" }, 
        { status: 403 }
      )
    }

    // Processar dados recebidos do ChatVolt
    const { tipo, dados } = body

    switch (tipo) {
      case "nova_conversa":
        return await criarNovaConversa(config.userId, dados)
      
      case "atualizar_conversa":
        return await atualizarConversa(config.userId, dados)
      
      case "novo_contato":
        return await criarNovoContato(config.userId, dados)
      
      default:
        return NextResponse.json(
          { error: "Tipo de operação não suportado" }, 
          { status: 400 }
        )
    }

  } catch (error) {
    console.error("Erro no POST ChatVolt:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// Função para criar nova conversa
async function criarNovaConversa(userId, dados) {
  try {
    const conversa = await prisma.conversa.create({
      data: {
        clienteNome: dados.cliente_nome || "Cliente ChatVolt",
        telefone: dados.telefone,
        email: dados.email,
        origem: "chatvolt",
        chatvoltId: dados.chatvolt_id,
        mensagens: dados.mensagens || [],
        userId: userId,
        agenteId: dados.agente_id
      }
    })

    return NextResponse.json({
      success: true,
      conversa_id: conversa.id,
      message: "Conversa criada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao criar conversa:", error)
    return NextResponse.json(
      { error: "Erro ao criar conversa" }, 
      { status: 500 }
    )
  }
}

// Função para atualizar conversa
async function atualizarConversa(userId, dados) {
  try {
    const conversa = await prisma.conversa.update({
      where: {
        id: dados.conversa_id,
        userId: userId
      },
      data: {
        status: dados.status,
        mensagens: dados.mensagens,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      conversa_id: conversa.id,
      message: "Conversa atualizada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao atualizar conversa:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar conversa" }, 
      { status: 500 }
    )
  }
}

// Função para criar novo contato
async function criarNovoContato(userId, dados) {
  try {
    const contato = await prisma.contato.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        origem: "chatvolt",
        tags: dados.tags || [],
        userId: userId
      }
    })

    return NextResponse.json({
      success: true,
      contato_id: contato.id,
      message: "Contato criado com sucesso"
    })

  } catch (error) {
    console.error("Erro ao criar contato:", error)
    return NextResponse.json(
      { error: "Erro ao criar contato" }, 
      { status: 500 }
    )
  }
}

