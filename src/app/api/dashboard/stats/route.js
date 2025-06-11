import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Buscar agentes do usuário
    const agentes = await prisma.agente.findMany({
      where: {
        userId: session.user.id
      }
    })

    // Calcular estatísticas
    const agentesAtivos = agentes.filter(a => a.status === 'ativo').length
    const totalAtendimentos = agentes.reduce((sum, a) => sum + (a.estatisticas?.atendimentos_realizados || 0), 0)
    const totalMensagens = agentes.reduce((sum, a) => sum + (a.estatisticas?.mensagens_enviadas || 0), 0)

    // Buscar contatos
    const totalContatos = await prisma.contato.count({
      where: {
        userId: session.user.id
      }
    })

    // Buscar conversas (se existirem)
    const conversasAtivas = await prisma.conversa.count({
      where: {
        userId: session.user.id,
        status: 'ativa'
      }
    })

    const stats = {
      agentesAtivos,
      totalAgentes: agentes.length,
      totalAtendimentos,
      totalMensagens,
      totalContatos,
      conversasAtivas,
      planoAtual: session.user.plano || 'basico'
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

