import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "10")

    // Buscar atividades recentes (baseado em agentes e conversas)
    const agentes = await prisma.agente.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: limit,
      select: {
        id: true,
        nome: true,
        tipo: true,
        status: true,
        updatedAt: true,
        estatisticas: true
      }
    })

    const conversas = await prisma.conversa.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: "desc"
      },
      take: limit,
      select: {
        id: true,
        clienteNome: true,
        status: true,
        updatedAt: true,
        agente: {
          select: {
            nome: true
          }
        }
      }
    })

    // Combinar e formatar atividades
    const atividades = [
      ...agentes.map(agente => ({
        tipo: "agente",
        titulo: `Agente "${agente.nome}" ${agente.status === "ativo" ? "ativado" : "atualizado"}`,
        descricao: `Tipo: ${agente.tipo}`,
        timestamp: agente.updatedAt,
        metadata: {
          agentId: agente.id,
          status: agente.status
        }
      })),
      ...conversas.map(conversa => ({
        tipo: "conversa",
        titulo: `Nova conversa com ${conversa.clienteNome}`,
        descricao: `Via agente: ${conversa.agente?.nome || "N/A"}`,
        timestamp: conversa.updatedAt,
        metadata: {
          conversaId: conversa.id,
          status: conversa.status
        }
      }))
    ]

    // Ordenar por timestamp e limitar
    atividades.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    const atividadesLimitadas = atividades.slice(0, limit)

    return NextResponse.json(atividadesLimitadas)
  } catch (error) {
    console.error("Erro ao buscar atividades:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

