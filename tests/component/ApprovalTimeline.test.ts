import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ApprovalTimeline from '~/components/request/ApprovalTimeline.vue'
import type { ApprovalStep } from '~/types/request'

const mockApprovalSteps: ApprovalStep[] = [
  {
    id: 1,
    request_id: 1,
    step_number: 1,
    approver_role: 'approver',
    status: 'approved',
    approver_id: 2,
    approver: {
      id: 2,
      name: 'John Approver',
      email: 'approver@test.com',
      role_id: 3,
      department_id: 1,
      role: {
        id: 3,
        name: 'approver',
      },
      department: {
        id: 1,
        name: 'IT',
      },
      created_at: '2024-01-15T09:00:00Z',
      updated_at: '2024-01-15T09:00:00Z',
    },
    comment: 'Looks good, approved',
    approved_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    request_id: 1,
    step_number: 2,
    approver_role: 'dept_admin',
    status: 'pending',
    approver_id: 3,
    approver: {
      id: 3,
      name: 'Jane Admin',
      email: 'admin@test.com',
      role_id: 2,
      department_id: 1,
      role: {
        id: 2,
        name: 'dept_admin',
      },
      department: {
        id: 1,
        name: 'IT',
      },
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
    },
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
]

describe('ApprovalTimeline', () => {
  it('renders correctly with steps', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays timeline title', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    expect(wrapper.text()).toContain('approval.approvalTimeline')
  })

  it('displays all approval steps', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // Check that approval steps are rendered (i18n replaces {number} with actual number)
    expect(wrapper.text()).toContain('approval.step')
  })

  it('displays approver names', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    expect(wrapper.text()).toContain('John Approver')
    expect(wrapper.text()).toContain('Jane Admin')
  })

  it('displays approver roles', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // Check that role information is displayed
    expect(wrapper.text()).toContain('admin.role')
  })

  it('displays approval status badges', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // ApprovalTimeline uses NTag for status, not RequestStatusBadge
    expect(wrapper.text()).toContain('approval.approved')
  })

  it('displays actioned date for approved steps', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // Date is displayed (format may vary by timezone)
    expect(wrapper.text()).toContain('Jan 15, 2024')
  })

  it('displays comment when present', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    expect(wrapper.text()).toContain('Looks good, approved')
  })

  it('does not display comment when not present', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // Second step has no comment
    const stepTexts = wrapper.text()
    // Should have one comment section total
    expect(stepTexts.match(/approval.comment/g)?.length).toBe(1)
  })

  it('shows empty state when no steps', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: [],
      },
    })

    expect(wrapper.text()).toContain('approval.noPendingApprovals')
  })

  it('shows empty state when steps undefined', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {},
    })

    expect(wrapper.text()).toContain('approval.noPendingApprovals')
  })

  it('displays correct step types based on status', () => {
    const stepsWithDifferentStatuses: ApprovalStep[] = [
      {
        ...mockApprovalSteps[0],
        status: 'approved',
      },
      {
        ...mockApprovalSteps[1],
        id: 2,
        step_number: 2,
        status: 'rejected',
      },
      {
        ...mockApprovalSteps[1],
        id: 3,
        step_number: 3,
        status: 'returned',
      },
      {
        ...mockApprovalSteps[1],
        id: 4,
        step_number: 4,
        status: 'pending',
      },
    ]

    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: stepsWithDifferentStatuses,
      },
    })

    const component = wrapper.vm as any
    expect(component.getStepType('approved')).toBe('success')
    expect(component.getStepType('rejected')).toBe('error')
    expect(component.getStepType('returned')).toBe('warning')
    expect(component.getStepType('pending')).toBe('default')
  })

  it('handles missing approver information gracefully', () => {
    const stepsWithoutApprover: ApprovalStep[] = [
      {
        id: 1,
        request_id: 1,
        step_number: 1,
        approver_role: 'approver',
        status: 'pending',
        created_at: '2024-01-15T09:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
      },
    ]

    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: stepsWithoutApprover,
      },
    })

    expect(wrapper.text()).toContain('common.unknown')
  })

  it('capitalizes role names correctly', () => {
    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: mockApprovalSteps,
      },
    })

    // Verify that roles are displayed (capitalization is applied in rendering)
    expect(wrapper.text()).toContain('admin.role')
    expect(wrapper.exists()).toBe(true)
  })

  it('handles date formatting errors gracefully', () => {
    const stepsWithInvalidDate: ApprovalStep[] = [
      {
        ...mockApprovalSteps[0],
        approved_at: 'invalid-date',
      },
    ]

    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: stepsWithInvalidDate,
      },
    })

    // Verify component renders even with invalid date
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.text()).toContain('approval.step')
  })

  it('renders all step statuses', () => {
    const allStatusSteps: ApprovalStep[] = [
      { ...mockApprovalSteps[0], id: 1, step_number: 1, status: 'approved' },
      { ...mockApprovalSteps[0], id: 2, step_number: 2, status: 'rejected' },
      { ...mockApprovalSteps[0], id: 3, step_number: 3, status: 'returned' },
      { ...mockApprovalSteps[0], id: 4, step_number: 4, status: 'pending' },
    ]

    const wrapper = mount(ApprovalTimeline, {
      props: {
        steps: allStatusSteps,
      },
    })

    // Verify all status types are rendered
    expect(wrapper.text()).toContain('approval.approved')
    expect(wrapper.text()).toContain('approval.rejected')
    expect(wrapper.text()).toContain('approval.returned')
    expect(wrapper.text()).toContain('approval.pending')
  })
})
