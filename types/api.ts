// API response types

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface ValidationError {
  message: string
  errors: Record<string, string[]>
}
