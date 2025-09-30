import { http } from './http'

export type Guest = { id: number; name: string; email?: string; phone?: string; event_id: number }
export type GuestCreate = { name: string; email?: string; phone?: string; event_id: number }
export type GuestUpdate = Omit<GuestCreate, 'event_id'>
export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const guestsService = {
  async listByEvent(eventId: number, page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Guest>> {
    const { data } = await http.get<Guest[]>(`/guests/event/${eventId}`)
    const total = data.length
    const totalPages = Math.ceil(total / perPage)
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const items = data.slice(startIndex, endIndex)

    return {
      items,
      total,
      page,
      per_page: perPage,
      total_pages: totalPages
    }
  },

  async listAllByEvent(eventId: number): Promise<Guest[]> {
    const { data } = await http.get<Guest[]>(`/guests/event/${eventId}`)
    return data
  },

  async create(payload: GuestCreate) {
    const { data } = await http.post<Guest>(`/guests`, payload)
    return data
  },

  async update(id: number, payload: GuestUpdate) {
    const { data } = await http.put<Guest>(`/guests/${id}`, payload)
    return data
  },

  async remove(id: number) {
    await http.delete(`/guests/${id}`)
  }
}
