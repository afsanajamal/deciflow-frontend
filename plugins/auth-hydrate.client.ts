// Hydrate auth state from localStorage before app initialization
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()

  // Hydrate auth state from localStorage immediately
  // This runs before middleware, so auth state is available for route guards
  authStore.hydrate()
})
