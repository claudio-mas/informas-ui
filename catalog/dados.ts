export type Fatura = { id: string; cliente: string; cidade: string; vencimento: string; valor: number; situacao: "paga" | "pendente" | "vencida" }

const clientes = ["Alimentos Boa Safra", "Padaria São Jorge", "Mercado Açaí", "Laticínios Serra", "Doces Cônego", "Café Itaú", "Frigorífico União", "Hortifruti Paraná"]
const cidades = ["São Paulo", "Curitiba", "Belém", "Juiz de Fora", "Goiânia", "Ribeirão Preto"]
const situacoes = ["paga", "pendente", "vencida"] as const

/** 23 faturas determinísticas; algumas negativas (estornos), para testar a ordenação numérica. */
export const FATURAS: Fatura[] = Array.from({ length: 23 }, (_, i) => ({
  id: `F-${String(1001 + i)}`,
  cliente: clientes[i % clientes.length]!,
  cidade: cidades[(i * 5) % cidades.length]!,
  vencimento: `2026-${String((i % 12) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
  valor: i % 6 === 5 ? -((i * 37) % 300) - 12.5 : ((i * 941) % 9000) + 99.9,
  situacao: situacoes[i % 3]!,
}))
