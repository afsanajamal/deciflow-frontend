import type { APIRequestContext } from '@playwright/test'

/**
 * API Helper for interacting with the Laravel backend
 * Base URL: http://localhost:8000/api
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Login and get authentication token
 */
export async function getAuthToken(
  request: APIRequestContext,
  email: string,
  password: string
): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      email,
      password,
    },
  })

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()} ${await response.text()}`)
  }

  const data = await response.json()
  return data.token || data.access_token
}

/**
 * Create a test purchase request
 */
export async function createTestRequest(
  request: APIRequestContext,
  token: string,
  requestData: {
    title: string
    description?: string
    category: string
    amount: number
    urgency?: string
    vendor_name?: string
  }
) {
  const response = await request.post(`${API_BASE_URL}/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: requestData,
  })

  if (!response.ok()) {
    throw new Error(`Failed to create request: ${response.status()} ${await response.text()}`)
  }

  return await response.json()
}

/**
 * Get all requests
 */
export async function getRequests(request: APIRequestContext, token: string) {
  const response = await request.get(`${API_BASE_URL}/requests`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok()) {
    throw new Error(`Failed to get requests: ${response.status()}`)
  }

  return await response.json()
}

/**
 * Delete a request
 */
export async function deleteRequest(
  request: APIRequestContext,
  token: string,
  requestId: number
) {
  const response = await request.delete(`${API_BASE_URL}/requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok()) {
    throw new Error(`Failed to delete request: ${response.status()}`)
  }

  return response.ok()
}

/**
 * Submit a request for approval
 */
export async function submitRequest(
  request: APIRequestContext,
  token: string,
  requestId: number
) {
  const response = await request.post(`${API_BASE_URL}/requests/${requestId}/submit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok()) {
    throw new Error(`Failed to submit request: ${response.status()}`)
  }

  return await response.json()
}

/**
 * Approve a request
 */
export async function approveRequest(
  request: APIRequestContext,
  token: string,
  requestId: number,
  comment?: string
) {
  const response = await request.post(
    `${API_BASE_URL}/requests/${requestId}/approve`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: comment ? { comment } : {},
    }
  )

  if (!response.ok()) {
    throw new Error(`Failed to approve request: ${response.status()}`)
  }

  return await response.json()
}

/**
 * Reject a request
 */
export async function rejectRequest(
  request: APIRequestContext,
  token: string,
  requestId: number,
  comment: string
) {
  const response = await request.post(
    `${API_BASE_URL}/requests/${requestId}/reject`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        comment,
      },
    }
  )

  if (!response.ok()) {
    throw new Error(`Failed to reject request: ${response.status()}`)
  }

  return await response.json()
}

/**
 * Return a request to requester
 */
export async function returnRequest(
  request: APIRequestContext,
  token: string,
  requestId: number,
  comment: string
) {
  const response = await request.post(
    `${API_BASE_URL}/requests/${requestId}/return`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        comment,
      },
    }
  )

  if (!response.ok()) {
    throw new Error(`Failed to return request: ${response.status()}`)
  }

  return await response.json()
}
