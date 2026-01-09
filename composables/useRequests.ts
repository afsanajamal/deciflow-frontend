// Requests composable
import type { CreateRequestInput, Request, RequestFilters } from '~/types/request'
import type { PaginatedResponse } from '~/types/api'

export function useRequests() {
  /**
   * Create a new request
   */
  const createRequest = async (data: CreateRequestInput): Promise<Request> => {
    return apiCall<Request>('/v1/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update an existing request (DRAFT only)
   */
  const updateRequest = async (id: number, data: Partial<CreateRequestInput>): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Submit a request for approval
   */
  const submitRequest = async (id: number): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/submit`, {
      method: 'POST',
    })
  }

  /**
   * Cancel a request
   */
  const cancelRequest = async (id: number): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/cancel`, {
      method: 'POST',
    })
  }

  /**
   * Archive a request (admin only)
   */
  const archiveRequest = async (id: number): Promise<Request> => {
    return apiCall<Request>(`/v1/requests/${id}/archive`, {
      method: 'POST',
    })
  }

  /**
   * List requests with filters
   */
  const listRequests = (filters?: RequestFilters) => {
    const query = filters ? `?${new URLSearchParams(filters as any).toString()}` : ''
    return useApi<PaginatedResponse<Request>>(`/v1/requests${query}`)
  }

  /**
   * Get a single request by ID
   */
  const getRequest = (id: number | string) => {
    return useApi<Request>(`/v1/requests/${id}`)
  }

  return {
    createRequest,
    updateRequest,
    submitRequest,
    cancelRequest,
    archiveRequest,
    listRequests,
    getRequest,
  }
}
