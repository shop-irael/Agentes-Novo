"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Loader2, User, Mail, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function PerfilPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (session) {
      setName(session.user.name || "")
    }
  }, [session])

  const handleSaveChanges = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const response = await axios.put("/api/user/profile", { name })
      await update({ name: response.data.name }) // Atualiza a sessão no cliente
      toast({ title: "Perfil atualizado com sucesso!" })
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atualizar perfil." })
      console.error(error)
    } finally {
      setSaving(false)
    }
  }
  
  if (!session) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  const getInitials = (name) => {
    if (!name) return "U"
    const names = name.split(" ")
    const firstInitial = names[0]?.[0] || ""
    const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : ""
    return `${firstInitial}${lastInitial}`.toUpperCase()
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveChanges} className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={session.user.image} />
                <AvatarFallback className="text-3xl">{getInitials(session.user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    id="name" 
                    className="pl-9" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input className="pl-9" value={session.user.email} disabled />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

