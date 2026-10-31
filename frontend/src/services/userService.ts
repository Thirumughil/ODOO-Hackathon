import api from './api'
import type { UserProfile } from './authService'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const userService = {
  /**
   * Fetch all registered users (Admin only)
   */
  async getUsers(): Promise<UserProfile[]> {
    const response = await api.get<ApiResponse<{ users: UserProfile[] }>>('/users')
    return response.data.data?.users || []
  },

  /**
   * Fetch single user by ID
   */
  async getUserById(id: string | number): Promise<UserProfile | null> {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>(`/users/${id}`)
    return response.data.data?.user || null
  },

  /**
   * Invite a new staff member (Admin only)
   */
  async inviteStaff(name: string, email: string): Promise<UserProfile> {
    const response = await api.post<ApiResponse<{ user: UserProfile }>>('/admin/staff', {
      name,
      email,
    })
    return response.data.data?.user
  },
}

export default userService
