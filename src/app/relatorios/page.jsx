"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"

const dadosAtendimento = [
  { data: "01/03", atendimentos: 65 },
  { data: "02/03", atendimentos: 59 },
  { data: "03/03", atendimentos: 80 },
  { data: "04/03", atendimentos: 81 },
  { data: "05/03", atendimentos: 56 },
  { data: "06/03", atendimentos: 55 },
  { data: "07/03", atendimentos: 40 }
]

const dadosTiposAtendimento = [
  { nome: "Dúvidas", valor: 400 },
  { nome: "Vendas", valor: 300 },
  { nome: "Suporte", valor: 200 },
  { nome: "Reclamações", valor: 100 }
]

const CORES = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

export default function RelatoriosPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Select defaultValue="7dias">
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Período" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7dias">Últimos 7 dias</SelectItem>
            <SelectItem value="30dias">Últimos 30 dias</SelectItem>
            <SelectItem value="90dias">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Atendimentos por Dia</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosAtendimento}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="data" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="atendimentos" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tipos de Atendimento</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosTiposAtendimento}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosTiposAtendimento.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Desempenho dos Agentes</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { agente: "Bot Vendas", atendimentos: 120, satisfacao: 85 },
                { agente: "Bot Suporte", atendimentos: 98, satisfacao: 92 },
                { agente: "Bot Dúvidas", atendimentos: 86, satisfacao: 88 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="agente" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#8b5cf6" />
                <Bar dataKey="satisfacao" fill="#06b6d4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

