// Authentication store
import { defineStore } from 'pinia'
import type { User } from '~/types/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    role: (state) => state.user?.role?.name,
    department: (state) => state.user?.department,
    isSuperAdmin: (state) => state.user?.role?.name === 'super_admin',
    isDeptAdmin: (state) => state.user?.role?.name === 'dept_admin',
    isApprover: (state) => state.user?.role?.name === 'approver',
    isRequester: (state) => state.user?.role?.name === 'requester',
    isAdmin: (state) =>
      state.user?.role?.name === 'super_admin' || state.user?.role?.name === 'dept_admin',
    canApprove: (state) =>
      state.user?.role?.name === 'approver' ||
      state.user?.role?.name === 'dept_admin' ||
      state.user?.role?.name === 'super_admin',
  },

  actions: {
    setAuth(user: User, token: string) {
      this.user = user
      this.token = token

      // Persist to localStorage (client-side only)
      if (process.client) {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    setUser(user: User) {
      this.user = user

      if (process.client) {
        localStorage.setItem('auth_user', JSON.stringify(user))
      }
    },

    logout() {
      this.user = null
      this.token = null

      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },

    hydrate() {
      // Restore from localStorage on app init (client-side only)
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const userJson = localStorage.getItem('auth_user')

        if (token && userJson) {
          try {
            this.token = token
            this.user = JSON.parse(userJson)
          } catch (error) {
            console.error('Failed to hydrate auth state:', error)
            this.logout()
          }
        }
      }
    },
  },
})
