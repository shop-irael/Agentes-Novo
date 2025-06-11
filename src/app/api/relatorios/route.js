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
    const periodo = searchParams.get("periodo") || "7dias"

    // Calcular data de início baseada no período
    const now = new Date()
    let startDate = new Date()
    
    switch (periodo) {
      case "7dias":
        startDate.setDate(now.getDate() - 7)
        break
      case "30dias":
        startDate.setDate(now.getDate() - 30)
        break
      case "90dias":
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Buscar dados de agentes para relatórios
    const agentes = await prisma.agente.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        nome: true,
        tipo: true,
        status: true,
        estatisticas: true,
        createdAt: true
      }
    })

    // Buscar conversas para gráficos temporais
    const conversas = await prisma.conversa.findMany({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startDate
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    })

    // Processar dados para gráficos
    const dadosPorDia = {}
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0]
      dadosPorDia[dateKey] = {
        data: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        atendimentos: 0,
        conversas: 0
      }
    }

    // Contar conversas por dia
    conversas.forEach(conversa => {
      const dateKey = conversa.createdAt.toISOString().split("T")[0]
      if (dadosPorDia[dateKey]) {
        dadosPorDia[dateKey].conversas++
      }
    })

    // Dados por tipo de agente
    const tiposAgentes = agentes.reduce((acc, agente) => {
      acc[agente.tipo] = (acc[agente.tipo] || 0) + 1
      return acc
    }, {})

    const relatorio = {
      periodo,
      dadosPorDia: Object.values(dadosPorDia),
      tiposAgentes: Object.entries(tiposAgentes).map(([nome, valor]) => ({ nome, valor })),
      resumo: {
        totalAgentes: agentes.length,
        agentesAtivos: agentes.filter(a => a.status === "ativo").length,
        totalConversas: conversas.length,
        conversasAtivas: conversas.filter(c => c.status === "ativa").length
      }
    }

    return NextResponse.json(relatorio)
  } catch (error) {
    console.error("Erro ao gerar relatório:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

