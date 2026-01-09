// Rules composable
import type { Rule } from '~/types/rule'

export function useRules() {
  /**
   * Get all approval rules
   */
  const listRules = () => {
    return useApi<Rule[]>('/v1/rules')
  }

  /**
   * Create a new rule
   */
  const createRule = async (data: Partial<Rule>): Promise<Rule> => {
    return apiCall<Rule>('/v1/rules', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Update a rule
   */
  const updateRule = async (id: number, data: Partial<Rule>): Promise<Rule> => {
    return apiCall<Rule>(`/v1/rules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Delete a rule
   */
  const deleteRule = async (id: number): Promise<void> => {
    return apiCall<void>(`/v1/rules/${id}`, {
      method: 'DELETE',
    })
  }

  return {
    listRules,
    createRule,
    updateRule,
    deleteRule,
  }
}
