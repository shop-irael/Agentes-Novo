import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// Webhook para receber eventos do ChatVolt
export async function POST(request) {
  try {
    const signature = request.headers.get("x-chatvolt-signature")
    const orgId = request.headers.get("x-org-id")
    const body = await request.text()
    
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization ID é obrigatório" }, 
        { status: 401 }
      )
    }

    // Buscar configuração do ChatVolt
    const config = await prisma.configuracaoChatVolt.findFirst({
      where: {
        orgId: orgId,
        ativo: true
      }
    })

    if (!config) {
      return NextResponse.json(
        { error: "Configuração não encontrada" }, 
        { status: 403 }
      )
    }

    // Verificar assinatura do webhook (se configurada)
    if (config.webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac("sha256", config.webhookSecret)
        .update(body)
        .digest("hex")
      
      if (signature !== `sha256=${expectedSignature}`) {
        return NextResponse.json(
          { error: "Assinatura inválida" }, 
          { status: 401 }
        )
      }
    }

    // Processar evento
    const event = JSON.parse(body)
    
    switch (event.type) {
      case "message.received":
        return await handleMessageReceived(config.userId, event.data)
      
      case "conversation.started":
        return await handleConversationStarted(config.userId, event.data)
      
      case "conversation.ended":
        return await handleConversationEnded(config.userId, event.data)
      
      case "contact.created":
        return await handleContactCreated(config.userId, event.data)
      
      default:
        console.log(`Evento não tratado: ${event.type}`)
        return NextResponse.json({ success: true, message: "Evento recebido" })
    }

  } catch (error) {
    console.error("Erro no webhook ChatVolt:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

// Handler para mensagem recebida
async function handleMessageReceived(userId, data) {
  try {
    // Buscar ou criar conversa
    let conversa = await prisma.conversa.findFirst({
      where: {
        chatvoltId: data.conversation_id,
        userId: userId
      }
    })

    if (!conversa) {
      // Criar nova conversa se não existir
      conversa = await prisma.conversa.create({
        data: {
          clienteNome: data.contact?.name || "Cliente ChatVolt",
          telefone: data.contact?.phone,
          email: data.contact?.email,
          origem: "chatvolt",
          chatvoltId: data.conversation_id,
          mensagens: [],
          userId: userId
        }
      })
    }

    // Adicionar nova mensagem
    const mensagensAtuais = conversa.mensagens || []
    const novaMensagem = {
      id: data.message_id,
      texto: data.message_text,
      tipo: data.message_type || "text",
      remetente: data.sender_type, // "user" ou "bot"
      timestamp: new Date().toISOString(),
      metadata: data.metadata || {}
    }

    mensagensAtuais.push(novaMensagem)

    // Atualizar conversa
    await prisma.conversa.update({
      where: { id: conversa.id },
      data: {
        mensagens: mensagensAtuais,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Mensagem processada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao processar mensagem:", error)
    return NextResponse.json(
      { error: "Erro ao processar mensagem" }, 
      { status: 500 }
    )
  }
}

// Handler para conversa iniciada
async function handleConversationStarted(userId, data) {
  try {
    // Verificar se a conversa já existe
    const conversaExistente = await prisma.conversa.findFirst({
      where: {
        chatvoltId: data.conversation_id,
        userId: userId
      }
    })

    if (conversaExistente) {
      return NextResponse.json({
        success: true,
        message: "Conversa já existe"
      })
    }

    // Criar nova conversa
    const conversa = await prisma.conversa.create({
      data: {
        clienteNome: data.contact?.name || "Cliente ChatVolt",
        telefone: data.contact?.phone,
        email: data.contact?.email,
        origem: "chatvolt",
        chatvoltId: data.conversation_id,
        status: "ativa",
        mensagens: [],
        userId: userId
      }
    })

    // Criar contato se não existir
    if (data.contact) {
      await criarOuAtualizarContato(userId, data.contact)
    }

    return NextResponse.json({
      success: true,
      conversa_id: conversa.id,
      message: "Conversa criada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao iniciar conversa:", error)
    return NextResponse.json(
      { error: "Erro ao iniciar conversa" }, 
      { status: 500 }
    )
  }
}

// Handler para conversa encerrada
async function handleConversationEnded(userId, data) {
  try {
    await prisma.conversa.updateMany({
      where: {
        chatvoltId: data.conversation_id,
        userId: userId
      },
      data: {
        status: "encerrada",
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: "Conversa encerrada com sucesso"
    })

  } catch (error) {
    console.error("Erro ao encerrar conversa:", error)
    return NextResponse.json(
      { error: "Erro ao encerrar conversa" }, 
      { status: 500 }
    )
  }
}

// Handler para contato criado
async function handleContactCreated(userId, data) {
  try {
    await criarOuAtualizarContato(userId, data)

    return NextResponse.json({
      success: true,
      message: "Contato processado com sucesso"
    })

  } catch (error) {
    console.error("Erro ao processar contato:", error)
    return NextResponse.json(
      { error: "Erro ao processar contato" }, 
      { status: 500 }
    )
  }
}

// Função auxiliar para criar ou atualizar contato
async function criarOuAtualizarContato(userId, contactData) {
  try {
    const { name, email, phone, tags } = contactData

    if (!name && !email && !phone) {
      return // Não há dados suficientes para criar contato
    }

    // Verificar se contato já existe
    const contatoExistente = await prisma.contato.findFirst({
      where: {
        userId: userId,
        OR: [
          email ? { email: email } : {},
          phone ? { telefone: phone } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      }
    })

    if (contatoExistente) {
      // Atualizar contato existente
      await prisma.contato.update({
        where: { id: contatoExistente.id },
        data: {
          nome: name || contatoExistente.nome,
          email: email || contatoExistente.email,
          telefone: phone || contatoExistente.telefone,
          tags: tags || contatoExistente.tags,
          updatedAt: new Date()
        }
      })
    } else {
      // Criar novo contato
      await prisma.contato.create({
        data: {
          nome: name || "Contato ChatVolt",
          email: email,
          telefone: phone,
          origem: "chatvolt",
          tags: tags || [],
          userId: userId
        }
      })
    }

  } catch (error) {
    console.error("Erro ao criar/atualizar contato:", error)
    throw error
  }
}

// GET para verificar status do webhook
export async function GET(request) {
  return NextResponse.json({
    status: "online",
    message: "Webhook ChatVolt funcionando",
    timestamp: new Date().toISOString()
  })
}

