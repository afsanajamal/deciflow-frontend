// Authentication composable
import type { LoginRequest, LoginResponse, User } from '~/types/auth'

export function useAuth() {
  const authStore = useAuthStore()

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    const data = await apiCall<LoginResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password } as LoginRequest),
    })

    authStore.setAuth(data.user, data.token)
    return data
  }

  /**
   * Logout and clear auth state
   */
  const logout = async () => {
    try {
      // Call logout endpoint to revoke token
      await apiCall('/v1/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state regardless of API call result
      authStore.logout()
      await navigateTo('/login')
    }
  }

  /**
   * Fetch current user details with role and department
   */
  const fetchMe = async () => {
    const user = await apiCall<User>('/v1/me')
    authStore.setUser(user)
    return user
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string | string[]) => {
    if (!authStore.user?.role?.name) return false

    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(authStore.user.role.name)
  }

  /**
   * Check if user can perform action on request
   */
  const canEditRequest = (requestUserId: number, requestStatus: string) => {
    // Only owner can edit
    if (requestUserId !== authStore.user?.id) return false

    // Only DRAFT requests can be edited
    return requestStatus === 'DRAFT'
  }

  return {
    // Methods
    login,
    logout,
    fetchMe,
    hasRole,
    canEditRequest,

    // State (computed from store)
    user: computed(() => authStore.user),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    role: computed(() => authStore.role),
    department: computed(() => authStore.department),
    isSuperAdmin: computed(() => authStore.isSuperAdmin),
    isDeptAdmin: computed(() => authStore.isDeptAdmin),
    isApprover: computed(() => authStore.isApprover),
    isRequester: computed(() => authStore.isRequester),
    isAdmin: computed(() => authStore.isAdmin),
    canApprove: computed(() => authStore.canApprove),
  }
}
