import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Função para formatar data
export function formatDate(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(date))
}

// Função para formatar data e hora
export function formatDateTime(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(date))
}

// Função para capitalizar primeira letra
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Função para gerar cores de status
export function getStatusColor(status) {
  const colors = {
    ativo: "bg-green-100 text-green-800",
    inativo: "bg-gray-100 text-gray-800",
    pausado: "bg-yellow-100 text-yellow-800",
    encerrada: "bg-red-100 text-red-800",
    novo: "bg-blue-100 text-blue-800",
    convertido: "bg-green-100 text-green-800",
    descartado: "bg-gray-100 text-gray-800"
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}

// Função para truncar texto
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

