import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import { ref, computed, watch } from 'vue'

// Make Vue functions globally available
;(global as any).ref = ref
;(global as any).computed = computed
;(global as any).watch = watch

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => {
      // Define translation templates for keys that need parameter interpolation
      const templates: Record<string, string> = {
        'attachment.uploadedBy': 'Uploaded by {name}',
        'error.loadFailed': '{resource} load failed',
      }

      if (params && Object.keys(params).length > 0) {
        // If we have a template, use it; otherwise construct a simple replacement
        const template = templates[key] || key
        let result = template
        Object.keys(params).forEach(param => {
          result = result.replace(`{${param}}`, params[param])
        })
        return result
      }
      return key
    },
    locale: ref('en'),
  }),
}))

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date | string, formatStr: string) => {
    const d = new Date(date)
    // Handle different format patterns
    if (formatStr.includes('MMM')) {
      // Format with month name like "Jan 15, 2024" or "Jan 15, 2024 10:00"
      const formatted = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      if (formatStr.includes('HH:mm') || formatStr.includes('h:mm')) {
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${formatted} ${hours}:${minutes}`
      }
      return formatted
    }
    if (formatStr.includes('HH:mm') || formatStr.includes('h:mm')) {
      // DateTime format like "2024-01-15 10:00"
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const hours = String(d.getHours()).padStart(2, '0')
      const minutes = String(d.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    }
    // Default date format like "Jan 15, 2024"
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  },
}))

// Mock Nuxt auto-imports
global.definePageMeta = vi.fn()
global.defineNuxtRouteMiddleware = vi.fn()
global.navigateTo = vi.fn()
global.useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
}))
global.useRoute = vi.fn(() => ({
  params: {},
  query: {},
  path: '/',
}))
global.useRuntimeConfig = vi.fn(() => ({
  public: {
    apiBase: 'http://localhost:8000/api',
  },
}))
global.useFetch = vi.fn()
global.useAsyncData = vi.fn()
global.useState = vi.fn((key, init) => {
  if (typeof init === 'function') {
    return { value: init() }
  }
  return { value: init }
})

// Mock useAttachments composable globally
;(global as any).useAttachments = vi.fn(() => ({
  getAttachments: vi.fn(() => Promise.resolve({
    data: ref([]),
    pending: ref(false),
    error: ref(null),
    refresh: vi.fn(),
  })),
  uploadAttachment: vi.fn(),
  downloadAttachment: vi.fn(),
  deleteAttachment: vi.fn(),
}))

// Create stub components that render their slots
const createSlotStub = (name: string) => ({
  name,
  template: '<div><slot /></div>',
})

// Configure Vue Test Utils
config.global.stubs = {
  NButton: createSlotStub('NButton'),
  NCard: {
    name: 'NCard',
    template: `
      <div class="n-card">
        <div v-if="title" class="n-card__header">{{ title }}<slot name="header-extra" /></div>
        <div class="n-card__content"><slot /></div>
        <div v-if="$slots.footer" class="n-card__footer"><slot name="footer" /></div>
      </div>
    `,
    props: ['title', 'hoverable', 'size'],
  },
  NInput: true,
  NSelect: true, // Complex select dropdown
  NDatePicker: true, // Complex date picker
  NForm: createSlotStub('NForm'),
  NFormItem: createSlotStub('NFormItem'),
  NTag: createSlotStub('NTag'),
  NSpace: createSlotStub('NSpace'),
  NText: createSlotStub('NText'),
  NAlert: createSlotStub('NAlert'),
  NSpin: {
    name: 'NSpin',
    template: '<div class="n-spin" :size="size"><slot /></div>',
    props: ['size'],
  },
  NEmpty: {
    name: 'NEmpty',
    template: '<div class="n-empty">{{ description }}</div>',
    props: ['description'],
  },
  NTimeline: createSlotStub('NTimeline'),
  NTimelineItem: {
    name: 'NTimelineItem',
    template: `
      <div class="n-timeline-item">
        <div v-if="title" class="n-timeline-item__title">{{ title }}</div>
        <slot />
      </div>
    `,
    props: ['title', 'type'],
  },
  NIcon: createSlotStub('NIcon'),
  NUpload: createSlotStub('NUpload'),
  NUploadDragger: createSlotStub('NUploadDragger'),
  NProgress: createSlotStub('NProgress'),
  NPopconfirm: {
    name: 'NPopconfirm',
    template: '<div><slot name="trigger" /><slot /></div>',
  },
  NTabs: createSlotStub('NTabs'),
  NTabPane: createSlotStub('NTabPane'),
  NH3: createSlotStub('NH3'),
  // Don't stub custom components
  RequestStatusBadge: false,
}
