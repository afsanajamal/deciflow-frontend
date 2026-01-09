// Authentication middleware - protects routes requiring login
import type { RouteLocationNormalized } from '#vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const authStore = useAuthStore()

  // Ensure auth is hydrated from localStorage
  if (!authStore.isAuthenticated && process.client) {
    authStore.hydrate()
  }

  // If still not authenticated after hydration, redirect to login
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
