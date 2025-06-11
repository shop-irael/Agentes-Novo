import { z } from "zod"

// Schema para criação/edição de agente
export const agenteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo"),
  tipo: z.enum(["atendimento", "vendas", "suporte", "leads"], {
    required_error: "Selecione um tipo de agente"
  }),
  configuracoes: z.object({
    mensagem_boas_vindas: z.string().optional(),
    horario_atendimento: z.object({
      inicio: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido"),
      fim: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido")
    }).optional(),
    integracao: z.object({
      chatvolt: z.object({
        api_key: z.string().optional(),
        org_id: z.string().optional(),
        bot_id: z.string().optional()
      }).optional(),
      n8n: z.object({
        url: z.string().url().optional().or(z.literal("")),
        token: z.string().optional()
      }).optional()
    }).optional()
  }).optional()
})

// Schema para configuração do ChatVolt
export const chatVoltConfigSchema = z.object({
  api_key: z.string().min(10, "API Key deve ter pelo menos 10 caracteres"),
  org_id: z.string().min(5, "Organization ID deve ter pelo menos 5 caracteres"),
  webhook_secret: z.string().optional()
})

// Schema para contato
export const contatoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  origem: z.string().default("manual"),
  tags: z.array(z.string()).default([])
})

// Schema para perfil do usuário
export const perfilSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(50, "Nome muito longo")
})

