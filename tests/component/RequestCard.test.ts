import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RequestCard from '~/components/request/RequestCard.vue'
import type { Request, RequestStatus, RequestCategory } from '~/types/request'

const mockRequest: Request = {
  id: 1,
  user_id: 1,
  department_id: 1,
  title: 'Test Request',
  description: 'This is a test request description',
  category: 'SOFTWARE',
  amount: 50000,
  status: 'DRAFT',
  urgency: 'NORMAL',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  vendor_name: 'Test Vendor',
}

describe('RequestCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('displays request title', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.text()).toContain('Test Request')
  })

  it('displays request category', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.text()).toContain('request.category')
    expect(wrapper.text()).toContain('category.SOFTWARE')
  })

  it('displays formatted amount', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.text()).toContain('¥50,000')
  })

  it('displays request description', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.text()).toContain('This is a test request description')
  })

  it('displays request ID', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.text()).toContain('#1')
  })

  it('displays created date', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    // Date formatted as "Jan 15, 2024" by our date-fns mock
    expect(wrapper.text()).toContain('Jan 15, 2024')
  })

  it('does not display description if not provided', () => {
    const requestWithoutDescription = {
      ...mockRequest,
      description: '',
    }

    const wrapper = mount(RequestCard, {
      props: {
        request: requestWithoutDescription,
      },
    })

    expect(wrapper.text()).not.toContain('This is a test request description')
  })

  it('emits click event when card is clicked', async () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')?.[0]).toEqual([mockRequest])
  })

  it('renders RequestStatusBadge component', () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    expect(wrapper.findComponent({ name: 'RequestStatusBadge' }).exists()).toBe(true)
  })

  it('formats large amounts correctly', () => {
    const requestWithLargeAmount = {
      ...mockRequest,
      amount: 1000000,
    }

    const wrapper = mount(RequestCard, {
      props: {
        request: requestWithLargeAmount,
      },
    })

    expect(wrapper.text()).toContain('¥1,000,000')
  })

  it('handles different status values', async () => {
    const wrapper = mount(RequestCard, {
      props: {
        request: mockRequest,
      },
    })

    const statuses: RequestStatus[] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'RETURNED']

    for (const status of statuses) {
      await wrapper.setProps({
        request: { ...mockRequest, status },
      })

      const badge = wrapper.findComponent({ name: 'RequestStatusBadge' })
      expect(badge.props('status')).toBe(status)
    }
  })

  it('handles different categories', async () => {
    const categories: RequestCategory[] = ['SOFTWARE', 'EQUIPMENT', 'TRAVEL', 'SERVICE']

    for (const category of categories) {
      const wrapper = mount(RequestCard, {
        props: {
          request: { ...mockRequest, category },
        },
      })

      expect(wrapper.text()).toContain(`category.${category}`)
    }
  })
})
