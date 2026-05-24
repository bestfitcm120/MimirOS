import axios from 'axios'

export interface SearchResult {
  type: string
  id: string
  title: string
  summary?: string
  status?: string
  score: number
}

export interface SearchResponse {
  query: string
  count: number
  semantic_enabled: boolean
  embed_provider: string
  results: SearchResult[]
}

export async function search(
  q: string,
  userId: string,
  types?: string,
  semantic = true,
  limit = 20,
): Promise<SearchResponse> {
  const { data } = await axios.get<SearchResponse>('/api/search', {
    params: { q, user_id: userId, types, semantic, limit },
  })
  return data
}
