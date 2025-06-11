"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, UserPlus, Download, Upload, Phone, Mail, Loader2, AlertTriangle } from "lucide-react"

export default function ContatosPage() {
  const [contatos, setContatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchContatos()
  }, [])

  const fetchContatos = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get("/api/contatos")
      setContatos(data)
    } catch (err) {
      setError("Falha ao carregar contatos.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredContatos = contatos.filter(contato =>
    (contato.nome && contato.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (contato.email && contato.email.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Contatos</h1>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" disabled><Upload className="w-4 h-4 mr-2" /> Importar</Button>
          <Button variant="outline" disabled><Download className="w-4 h-4 mr-2" /> Exportar</Button>
          <Button className="bg-purple-600 hover:bg-purple-700" disabled><UserPlus className="w-4 h-4 mr-2" /> Adicionar Contato</Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Lista de Contatos</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8"><Loader2 className="w-8 h-8 mx-auto animate-spin" /></div>
          ) : error ? (
            <div className="text-center py-8 text-red-600 flex items-center justify-center gap-2"><AlertTriangle className="w-5 h-5" /> {error}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Tags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContatos.length > 0 ? filteredContatos.map((contato) => (
                  <TableRow key={contato.id}>
                    <TableCell className="font-medium">{contato.nome}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {contato.telefone && <span className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3 text-gray-400" />{contato.telefone}</span>}
                        {contato.email && <span className="flex items-center gap-1 text-sm"><Mail className="w-3 h-3 text-gray-400" />{contato.email}</span>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{contato.origem}</Badge></TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {contato.tags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan="4" className="text-center">Nenhum contato encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

