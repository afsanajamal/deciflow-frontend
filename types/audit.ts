// Audit log types
import type { User } from './auth'

export interface AuditLog {
  id: number
  request_id: number
  user_id: number
  action: string
  from_status: string | null
  to_status: string | null
  meta: Record<string, any> | null
  created_at: string
  
  // Relationships
  user?: User
  request?: {
    id: number
    title: string
  }
}
