import { http } from './http'

export type UserItem = {
  id: number
  email: string
  full_name?: string | null
  role: 'distributor' | 'superadmin'
  disabled: boolean
}

export type UserUpdatePayload = {
  email?: string
  full_name?: string
  role?: 'distributor' | 'superadmin'
  password?: string
}

export type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export const usersService = {
  async list(page = 1, perPage = 10) {
    const { data } = await http.get<PaginatedResponse<UserItem>>('/users/', {
      params: { page, per_page: perPage }
    })
    return data
  },
  async update(userId: number, payload: UserUpdatePayload) {
    // Use the simple-update endpoint which is specifically designed for profile updates
    const { data } = await http.put<UserItem>(`/users/simple-update/${userId}`, payload)
    return data
  },
  async remove(userId: number) {
    const { data } = await http.delete(`/users/${userId}`)
    return data
  },
  async disable(userId: number) {
    const { data } = await http.post(`/users/${userId}/disable`)
    return data
  },
  async enable(userId: number) {
    const { data } = await http.post(`/users/${userId}/enable`)
    return data
  },
  async block(userId: number) {
    const { data } = await http.post(`/users/${userId}/block`)
    return data
  },
  async unblock(userId: number) {
    const { data } = await http.post(`/users/${userId}/unblock`)
    return data
  },
}
