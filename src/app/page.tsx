import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Master Agentes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Sistema completo de automação com agentes IA para WhatsApp, ChatVolt e muito mais.
            Gerencie contatos, conversas e automatize seu atendimento.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Acessar Dashboard
            </Link>
            <Link
              href="/api/docs/chatvolt-integration"
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Documentação API
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Agentes Inteligentes</h3>
            <p className="text-gray-600">
              Crie e gerencie agentes IA especializados em vendas, atendimento, suporte e geração de leads.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão de Contatos</h3>
            <p className="text-gray-600">
              Organize e gerencie todos os seus contatos com tags, origem e histórico completo de interações.
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Integração ChatVolt</h3>
            <p className="text-gray-600">
              Integração completa com ChatVolt via API e webhooks para automação em tempo real.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8">Recursos Principais</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">🤖 Agentes IA Especializados</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Agentes de vendas automatizados</li>
                <li>• Suporte técnico inteligente</li>
                <li>• Geração e qualificação de leads</li>
                <li>• Atendimento personalizado 24/7</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">🔗 Integrações Poderosas</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• API REST completa para ChatVolt</li>
                <li>• Webhooks em tempo real</li>
                <li>• Sincronização automática de dados</li>
                <li>• Documentação completa da API</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">📊 Analytics e Relatórios</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Dashboard com métricas em tempo real</li>
                <li>• Relatórios de performance dos agentes</li>
                <li>• Análise de conversas e interações</li>
                <li>• Estatísticas de conversão</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">⚙️ Configuração Flexível</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Interface intuitiva de configuração</li>
                <li>• Personalização de agentes</li>
                <li>• Gerenciamento de credenciais</li>
                <li>• Configuração de webhooks</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-gray-600 mb-8">
            Configure seus agentes IA e comece a automatizar seu atendimento hoje mesmo.
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
          >
            Começar Agora
          </Link>
        </div>
      </div>
    </div>
  )
}

