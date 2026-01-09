// Guest middleware - redirects authenticated users away from login
import type { RouteLocationNormalized } from '#vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const authStore = useAuthStore()

  // If already authenticated, redirect to home
  if (authStore.isAuthenticated) {
    return navigateTo('/')
  }
})
