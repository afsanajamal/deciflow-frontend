// Authentication and user types

export interface Role {
  id: number
  name: 'super_admin' | 'dept_admin' | 'approver' | 'requester'
}

export interface Department {
  id: number
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  role_id: number
  department_id: number
  role: Role
  department: Department
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
