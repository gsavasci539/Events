import { http } from './http'

export type Event = {
  id: number
  title: string
  description?: string
  location?: string
  start_time: string
  end_time?: string
  owner_id?: number
  owner_email?: string
  is_blocked: boolean
  is_online?: boolean
  online_link?: string
  location_lat?: number
  location_lng?: number
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const eventsService = {
  async list(page: number = 1, perPage: number = 10) {
    const { data } = await http.get<PaginatedResponse<Event>>(`/events/`, {
      params: { page, per_page: perPage }
    })
    return data
  },
  async detail(id: number) {
    const { data } = await http.get<Event>(`/events/${id}`)
    return data
  },
  async create(payload: Partial<Event>) {
    const { data } = await http.post<Event>('/events/', payload)
    return data
  },
  async update(id: number, payload: Partial<Event>) {
    const { data } = await http.put<Event>(`/events/${id}`, payload)
    return data
  },
  async remove(id: number) {
    const { data } = await http.delete(`/events/${id}`)
    return data
  },
  async block(id: number) {
    const { data } = await http.post<Event>(`/events/${id}/block`)
    return data
  },
  async unblock(id: number) {
    const { data } = await http.post<Event>(`/events/${id}/unblock`)
    return data
  },
}
