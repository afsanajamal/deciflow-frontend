// Constants and enums

import type { RequestStatus, RequestCategory, Urgency } from '~/types/request'

export const STATUS: Record<RequestStatus, string> = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
  ARCHIVED: 'ARCHIVED',
}

export const CATEGORY: Record<RequestCategory, string> = {
  EQUIPMENT: 'EQUIPMENT',
  SOFTWARE: 'SOFTWARE',
  SERVICE: 'SERVICE',
  TRAVEL: 'TRAVEL',
}

export const URGENCY: Record<Urgency, string> = {
  NORMAL: 'NORMAL',
  URGENT: 'URGENT',
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  DEPT_ADMIN: 'dept_admin',
  APPROVER: 'approver',
  REQUESTER: 'requester',
} as const

// Status badge color mappings
export const STATUS_COLORS: Record<RequestStatus, string> = {
  DRAFT: 'default',
  SUBMITTED: 'processing',
  IN_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  RETURNED: 'orange',
  CANCELLED: 'default',
  ARCHIVED: 'default',
}

// Maximum file upload size (10MB in bytes)
export const MAX_FILE_SIZE = 10 * 1024 * 1024

// Allowed file types for attachments
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]

// Pagination defaults
export const DEFAULT_PER_PAGE = 20
export const DEFAULT_PAGE = 1
