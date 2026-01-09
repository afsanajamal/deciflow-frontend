// Role-based middleware - checks if user has required role
import type { RouteLocationNormalized } from '#vue-router'

export default defineNuxtRouteMiddleware((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  const requiredRoles = to.meta.roles as string[] | undefined

  // If no roles specified, allow access
  if (!requiredRoles || requiredRoles.length === 0) {
    return
  }

  const userRole = authStore.user?.role?.name

  // If user doesn't have required role, show 403
  if (!userRole || !requiredRoles.includes(userRole)) {
    return abortNavigation({
      statusCode: 403,
      message: 'Access denied - insufficient permissions',
    })
  }
})
