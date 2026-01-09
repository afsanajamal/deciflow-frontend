// Request and approval types
import type { User } from './auth'

export type RequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'RETURNED'
  | 'CANCELLED'
  | 'ARCHIVED'

export type RequestCategory = 'EQUIPMENT' | 'SOFTWARE' | 'SERVICE' | 'TRAVEL'

export type Urgency = 'NORMAL' | 'URGENT'

export type ApprovalStepStatus = 'pending' | 'approved' | 'rejected' | 'returned'

export interface Request {
  id: number
  user_id: number
  department_id: number
  title: string
  description: string
  category: RequestCategory
  amount: number
  vendor_name?: string | null
  urgency: Urgency
  urgency_reason?: string | null
  travel_start_date?: string | null
  travel_end_date?: string | null
  status: RequestStatus
  created_at: string
  updated_at: string

  // Relationships (when included)
  user?: User
  department?: { id: number; name: string }
  approval_steps?: ApprovalStep[]
  attachments?: RequestAttachment[]
  audit_logs?: AuditLog[]
}

export interface ApprovalStep {
  id: number
  request_id: number
  step_number: number
  approver_role: string
  approver_id?: number | null
  status: ApprovalStepStatus
  comment?: string | null
  approved_at?: string | null
  created_at: string
  updated_at: string

  // Relationships
  approver?: User
}

export interface RequestAttachment {
  id: number
  request_id: number
  file_name: string
  file_path: string
  file_size: number
  mime_type: string
  uploaded_by: number
  created_at: string
  updated_at: string

  // Relationships
  uploader?: User
}

export interface AuditLog {
  id: number
  request_id: number
  user_id: number
  action: string
  from_status?: string | null
  to_status?: string | null
  meta?: Record<string, any> | null
  created_at: string

  // Relationships
  user?: User
}

// Input types for creating/updating requests
export interface CreateRequestInput {
  title: string
  description: string
  category: RequestCategory
  amount: number
  vendor_name?: string
  urgency: Urgency
  urgency_reason?: string
  travel_start_date?: string
  travel_end_date?: string
}

export interface UpdateRequestInput extends Partial<CreateRequestInput> {}

export interface RequestFilters {
  status?: RequestStatus
  category?: RequestCategory
  department_id?: number
  amount_min?: number
  amount_max?: number
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
}

export interface ApprovalActionInput {
  comment?: string
}
