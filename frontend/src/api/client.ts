import axios from 'axios'

export interface SessionSearchItem {
  id: string
  title: string
  conferenceName: string
  trackName: string
  startTime: string
}

export interface SpeakerSearchItem {
  id: string
  name: string
  company: string
  photoUrl?: string
}

export interface SearchResultDto {
  sessions: SessionSearchItem[]
  speakers: SpeakerSearchItem[]
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT from localStorage if present
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export async function searchApi(q: string): Promise<SearchResultDto> {
  const { data } = await apiClient.get<SearchResultDto>('/api/search', { params: { q } })
  return data
}
