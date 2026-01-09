import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RequestStatusBadge from '~/components/request/RequestStatusBadge.vue'

describe('RequestStatusBadge', () => {

  it('renders correctly', () => {
    const wrapper = mount(RequestStatusBadge, {
      props: {
        status: 'DRAFT',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays correct status text', () => {
    const wrapper = mount(RequestStatusBadge, {
      props: {
        status: 'APPROVED',
      },
    })

    expect(wrapper.text()).toContain('status.APPROVED')
  })

  describe('status type mapping', () => {
    it('shows default type for DRAFT status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'DRAFT',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('default')
    })

    it('shows info type for SUBMITTED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'SUBMITTED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('info')
    })

    it('shows info type for IN_REVIEW status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'IN_REVIEW',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('info')
    })

    it('shows success type for APPROVED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'APPROVED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('success')
    })

    it('shows error type for REJECTED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'REJECTED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('error')
    })

    it('shows warning type for RETURNED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'RETURNED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('warning')
    })

    it('shows default type for CANCELLED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'CANCELLED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('default')
    })

    it('shows default type for ARCHIVED status', () => {
      const wrapper = mount(RequestStatusBadge, {
        props: {
          status: 'ARCHIVED',
        },
      })

      const component = wrapper.vm as any
      expect(component.statusType).toBe('default')
    })
  })

  it('updates when status prop changes', async () => {
    const wrapper = mount(RequestStatusBadge, {
      props: {
        status: 'DRAFT',
      },
    })

    expect(wrapper.text()).toContain('status.DRAFT')

    await wrapper.setProps({ status: 'APPROVED' })

    expect(wrapper.text()).toContain('status.APPROVED')
  })
})
