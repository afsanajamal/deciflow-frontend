import { vi } from 'vitest'
import type { Request, ApprovalStep, RequestStatus, RequestCategory } from '~/types/request'
import type { Attachment } from '~/types/attachment'

/**
 * Create a mock request object with default values
 */
export function createMockRequest(overrides?: Partial<Request>): Request {
  return {
    id: 1,
    user_id: 1,
    department_id: 1,
    title: 'Test Request',
    description: 'Test description',
    category: 'SOFTWARE' as RequestCategory,
    amount: 100000,
    status: 'DRAFT' as RequestStatus,
    urgency: 'NORMAL',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock approval step
 */
export function createMockApprovalStep(overrides?: Partial<ApprovalStep>): ApprovalStep {
  return {
    id: 1,
    request_id: 1,
    step_number: 1,
    approver_role: 'approver',
    status: 'pending',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock attachment
 */
export function createMockAttachment(overrides?: Partial<Attachment>): Attachment {
  return {
    id: 1,
    request_id: 1,
    file_name: 'test.pdf',
    file_path: '/uploads/test.pdf',
    file_size: 1024000,
    mime_type: 'application/pdf',
    uploaded_by: 1,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}

/**
 * Create a mock user object
 */
export function createMockUser(overrides?: any) {
  return {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role_id: 1,
    department_id: 1,
    role: {
      id: 1,
      name: 'requester' as const,
    },
    department: {
      id: 1,
      name: 'IT Department',
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}

/**
 * Mock i18n translation function
 */
export function mockI18n() {
  return {
    t: (key: string, params?: any) => {
      if (params) return `${key}:${JSON.stringify(params)}`
      return key
    },
    locale: { value: 'en' },
  }
}

/**
 * Mock router
 */
export function mockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: { value: { params: {}, query: {} } },
  }
}

/**
 * Mock route
 */
export function mockRoute(overrides?: any) {
  return {
    params: {},
    query: {},
    path: '/',
    ...overrides,
  }
}

/**
 * Mock message service
 */
export function mockMessage() {
  return {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }
}

/**
 * Create a mock file
 */
export function createMockFile(
  name: string = 'test.pdf',
  size: number = 1024,
  type: string = 'application/pdf'
): File {
  const content = 'x'.repeat(size)
  return new File([content], name, { type })
}

/**
 * Wait for async operations
 */
export async function waitFor(callback: () => boolean, timeout: number = 1000): Promise<void> {
  const start = Date.now()
  while (!callback()) {
    if (Date.now() - start > timeout) {
      throw new Error('Timeout waiting for condition')
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }
}

/**
 * Mock fetch response
 */
export function mockFetchResponse(data: any, ok: boolean = true, status: number = 200) {
  return {
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob([JSON.stringify(data)]),
  }
}

/**
 * Mock async data response for Nuxt composables
 */
export function mockAsyncData<T>(data: T, pending: boolean = false, error: any = null) {
  return {
    data: { value: data },
    pending: { value: pending },
    error: { value: error },
    refresh: vi.fn(),
  }
}

/**
 * Generate array of mock requests
 */
export function createMockRequests(count: number, overrides?: Partial<Request>): Request[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRequest({
      id: i + 1,
      title: `Request ${i + 1}`,
      ...overrides,
    })
  )
}

/**
 * Generate array of mock approval steps
 */
export function createMockApprovalSteps(count: number, overrides?: Partial<ApprovalStep>): ApprovalStep[] {
  return Array.from({ length: count }, (_, i) =>
    createMockApprovalStep({
      id: i + 1,
      step_number: i + 1,
      ...overrides,
    })
  )
}
