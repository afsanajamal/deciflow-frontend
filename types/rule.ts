// Approval rule types

export interface ApprovalStep {
  step: number
  role: string
}

export interface Rule {
  id: number
  name: string
  min_amount: number
  max_amount: number | null
  approval_steps_json: ApprovalStep[]
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
