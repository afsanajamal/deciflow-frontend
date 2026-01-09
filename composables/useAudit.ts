// Audit logs composable
import type { AuditLog } from '~/types/audit'
import type { PaginatedResponse } from '~/types/api'

export function useAudit() {
  /**
   * Get all audit logs (super_admin only)
   */
  const getAuditLogs = (page: number = 1, perPage: number = 20) => {
    const query = `?page=${page}&per_page=${perPage}`
    return useApi<PaginatedResponse<AuditLog>>(`/v1/audit${query}`)
  }

  /**
   * Get audit logs for a specific request
   */
  const getRequestAudit = (requestId: number) => {
    return useApi<AuditLog[]>(`/v1/requests/${requestId}/audit`)
  }

  return {
    getAuditLogs,
    getRequestAudit,
  }
}
