import type { Mock } from 'vitest'

declare global {
  var definePageMeta: Mock
  var defineNuxtRouteMiddleware: Mock
  var navigateTo: Mock
  var useRouter: Mock
  var useRoute: Mock
  var useRuntimeConfig: Mock
  var useFetch: Mock
  var useAsyncData: Mock
  var useState: Mock
}

export {}
