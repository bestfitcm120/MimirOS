import axios from 'axios'

const BASE = '/api/llm'

export interface CompletionRequest {
  system?: string
  user: string
  max_tokens?: number
  model?: string
}

export interface CompletionResponse {
  text: string
  model: string
  provider: string
}

export interface LLMStatus {
  provider: string
  base_url: string
  model: string
  configured: boolean
}

export interface OpenRouterModel {
  id: string
  name: string
  context_length?: number
  pricing?: { prompt?: string; completion?: string }
}

export async function llmComplete(req: CompletionRequest): Promise<CompletionResponse> {
  const { data } = await axios.post<CompletionResponse>(`${BASE}/complete`, req)
  return data
}

export async function getLLMStatus(): Promise<LLMStatus> {
  const { data } = await axios.get<LLMStatus>(`${BASE}/status`)
  return data
}

export async function listOpenRouterModels(): Promise<OpenRouterModel[]> {
  const { data } = await axios.get<{ models: OpenRouterModel[] }>(`${BASE}/models`)
  return data.models
}
