// Core API composable for making HTTP requests

/**
 * Wrapper around useFetch with auto-injected auth headers and error handling
 */
export function useApi<T>(url: string, options: any = {}) {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  return useFetch(url, {
    baseURL: config.public.apiBase,
    headers: {
      Authorization: authStore.token ? `Bearer ${authStore.token}` : '',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    onResponseError({ response }: { response: any }) {
      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
    },
    ...options,
  }) as any
}

/**
 * Alternative API call function for client-side only calls
 * Useful for mutations (POST, PUT, DELETE) that don't need SSR
 */
export async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const headers = new Headers(options.headers)

  // Add auth header if token exists
  if (authStore.token) {
    headers.set('Authorization', `Bearer ${authStore.token}`)
  }

  // Add content-type if not FormData (FormData sets its own boundary)
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  // Always request JSON response
  headers.set('Accept', 'application/json')

  const response = await fetch(`${config.public.apiBase}${endpoint}`, {
    ...options,
    headers,
  })

  // Handle errors
  if (!response.ok) {
    if (response.status === 401) {
      authStore.logout()
      await navigateTo('/login')
    }

    // Try to parse error response
    const error = await response.json().catch(() => ({
      message: `HTTP ${response.status}: ${response.statusText}`,
    }))

    throw new Error(error.message || error.error?.message || `Request failed with status ${response.status}`)
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}
