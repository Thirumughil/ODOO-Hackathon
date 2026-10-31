import api from './api'

export interface UserProfile {
  id: string | number
  name: string
  email: string
  role: 'ADMIN' | 'STAFF' | 'CUSTOMER'
  status?: string
  emailVerified?: boolean
  createdAt?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const authService = {
  /**
   * Authenticate user with backend endpoint
   */
  async login(payload: LoginPayload): Promise<{ token: string; user: UserProfile }> {
    const response = await api.post<ApiResponse<{ accessToken: string; user: UserProfile }>>(
      '/auth/login',
      payload
    )

    const token = response.data.data?.accessToken
    const user = response.data.data?.user

    if (token) {
      localStorage.setItem('subscriptiq_token', token)
    }
    if (user) {
      localStorage.setItem('subscriptiq_user', JSON.stringify(user))
    }

    return { token, user }
  },

  /**
   * Register a new customer account
   */
  async register(payload: RegisterPayload): Promise<{ user: UserProfile; message: string }> {
    const response = await api.post<ApiResponse<{ user: UserProfile }>>(
      '/auth/register',
      payload
    )

    return {
      user: response.data.data?.user,
      message: response.data.message || 'Registration successful',
    }
  },

  /**
   * Request password reset link
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<Record<string, unknown>>>(
      '/auth/forgot-password',
      { email }
    )
    return { message: response.data.message || 'Reset link dispatched' }
  },

  /**
   * Validate and restore active session from backend
   */
  async fetchCurrentUser(): Promise<UserProfile | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await api.get<ApiResponse<{ user: UserProfile }>>('/auth/me')
      const user = response.data.data?.user
      if (user) {
        localStorage.setItem('subscriptiq_user', JSON.stringify(user))
        return user
      }
      return null
    } catch {
      this.clearSession()
      return null
    }
  },

  /**
   * Invalidate session locally and on backend
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignore network errors during logout
    } finally {
      this.clearSession()
    }
  },

  /**
   * Clear local authentication tokens
   */
  clearSession(): void {
    localStorage.removeItem('subscriptiq_token')
    localStorage.removeItem('subscriptiq_user')
    sessionStorage.removeItem('subscriptiq_token')
  },

  /**
   * Retrieve active authentication token
   */
  getToken(): string | null {
    return (
      localStorage.getItem('subscriptiq_token') ||
      sessionStorage.getItem('subscriptiq_token')
    )
  },

  /**
   * Check if token exists locally
   */
  isAuthenticated(): boolean {
    return Boolean(this.getToken())
  },

  /**
   * Get cached user profile
   */
  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem('subscriptiq_user')
    if (!raw) return null
    try {
      return JSON.parse(raw) as UserProfile
    } catch {
      return null
    }
  },

  /**
   * Alias for getCurrentUser for semantic clarity
   */
  getStoredUser(): UserProfile | null {
    return this.getCurrentUser()
  },
}

export default authService
