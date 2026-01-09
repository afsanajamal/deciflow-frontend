// Approvals composable
import type { Request, ApprovalActionInput } from '~/types/request'

export function useApprovals() {
  /**
   * Get approval inbox - requests pending approval by current user
   * Note: Backend returns a simple array, not paginated
   */
  const getApprovalInbox = () => {
    return useApi<Request[]>('/v1/approvals/inbox')
  }

  /**
   * Approve a request
   */
  const approveRequest = async (id: number, data?: ApprovalActionInput): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/approve`, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * Reject a request
   */
  const rejectRequest = async (id: number, data: ApprovalActionInput): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Return a request to requester
   */
  const returnRequest = async (id: number, data: ApprovalActionInput): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/return`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  return {
    getApprovalInbox,
    approveRequest,
    rejectRequest,
    returnRequest,
  }
}
