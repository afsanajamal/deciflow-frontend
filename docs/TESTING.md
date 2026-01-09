# Testing Documentation

## Overview

DeciFlow Frontend employs a comprehensive testing strategy covering unit tests, component tests, and end-to-end tests. The testing pyramid ensures code quality, prevents regressions, and validates user workflows.

## Testing Stack

- **Vitest** - Unit and component testing framework
- **Vue Test Utils** - Official Vue component testing library
- **Playwright** - End-to-end testing framework
- **@vitest/ui** - Visual test runner interface
- **@vitest/coverage-v8** - Code coverage reporting

## Test Types

### 1. Component Tests (Vitest + Vue Test Utils)

Test individual Vue components in isolation.

**Location**: `tests/component/`

**Current Coverage**: 76 tests across 5 component files

**Example Test**:

```typescript
// tests/component/RequestStatusBadge.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RequestStatusBadge from '~/components/request/RequestStatusBadge.vue'

describe('RequestStatusBadge', () => {
  it('renders approved status correctly', () => {
    const wrapper = mount(RequestStatusBadge, {
      props: { status: 'APPROVED' }
    })

    expect(wrapper.text()).toContain('Approved')
    expect(wrapper.find('.badge').classes()).toContain('badge-success')
  })

  it('renders correct color for each status', () => {
    const statuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']

    statuses.forEach(status => {
      const wrapper = mount(RequestStatusBadge, {
        props: { status }
      })

      expect(wrapper.find('.badge').exists()).toBe(true)
    })
  })
})
```

### 2. End-to-End Tests (Playwright)

Test complete user workflows with real backend integration.

**Location**: `tests/e2e/`

**Current Coverage**: 20 tests across 3 test suites

**Test Suites**:
- `auth.spec.ts` - Authentication flows (6 tests)
- `request-create.spec.ts` - Request creation workflows (8 tests)
- `request-approval.spec.ts` - Approval workflows (6 tests)

**Example Test**:

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')

    // Fill login form
    await page.fill('input[type="email"]', 'requester@deciflow.com')
    await page.fill('input[type="password"]', 'password')
    await page.click('button[type="submit"]')

    // Verify redirect to dashboard
    await expect(page).not.toHaveURL(/\/login/)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('text=/invalid credentials/i')).toBeVisible()
  })
})
```

## Running Tests

### Component Tests

```bash
# Run in watch mode (development)
npm run test

# Run once (CI)
npm run test:run

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Run all E2E tests (headless)
npm run e2e

# Run with UI (interactive mode)
npm run e2e:ui

# Run in debug mode
npm run e2e:debug

# Run specific test file
npx playwright test auth.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test by name
npx playwright test -g "should login successfully"
```

### View Test Reports

```bash
# View Playwright HTML report
npx playwright show-report

# View Vitest coverage report
open coverage/index.html
```

## Test File Structure

### Component Test Structure

```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import ComponentName from '~/components/path/ComponentName.vue'

describe('ComponentName', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(ComponentName, {
      props: {
        // Default props
      }
    })
  })

  describe('Rendering', () => {
    it('renders correctly with props', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.text()).toContain('Expected text')
    })
  })

  describe('User Interactions', () => {
    it('emits event on button click', async () => {
      await wrapper.find('button').trigger('click')
      expect(wrapper.emitted('click')).toBeTruthy()
    })
  })

  describe('Computed Properties', () => {
    it('computes value correctly', () => {
      // Test computed values
    })
  })

  describe('Edge Cases', () => {
    it('handles empty data', () => {
      // Test edge cases
    })
  })
})
```

### E2E Test Structure

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/starting-page')
  })

  test('should perform action successfully', async ({ page }) => {
    // Arrange - set up test data
    // Act - perform user actions
    // Assert - verify expectations
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Test error scenarios
  })
})
```

## Testing Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Follow Arrange-Act-Assert pattern
- One assertion per test (when possible)

### 2. Component Testing

**Do:**
- Test component behavior, not implementation
- Test user interactions (clicks, inputs)
- Test prop changes and emitted events
- Test edge cases and error states
- Mock external dependencies

**Don't:**
- Test framework features (Vue internals)
- Test third-party library behavior
- Over-mock (test real behavior when possible)
- Test private methods directly

### 3. E2E Testing

**Do:**
- Test critical user journeys
- Use data-testid for stable selectors
- Wait for elements properly
- Test against real backend when possible
- Include positive and negative scenarios

**Don't:**
- Test every possible path (use unit tests)
- Rely on brittle CSS selectors
- Use hardcoded wait times (`page.waitForTimeout`)
- Share state between tests

### 4. Accessibility Testing

Test accessibility in component tests:

```typescript
it('is keyboard accessible', async () => {
  await wrapper.find('button').trigger('keydown.enter')
  expect(wrapper.emitted('click')).toBeTruthy()
})

it('has proper ARIA labels', () => {
  expect(wrapper.find('button').attributes('aria-label')).toBe('Submit')
})
```

## Test Coverage

### Current Coverage

**Component Tests**: 76 tests
- RequestStatusBadge: 11 tests
- RequestCard: 13 tests
- AttachmentList: 20 tests
- ApprovalTimeline: 16 tests
- FileUpload: 16 tests

**E2E Tests**: 20 tests
- Authentication: 6 tests
- Request Creation: 8 tests
- Approval Workflow: 6 tests

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 70,
    statements: 70
  }
}
```

### View Coverage Report

```bash
npm run test:coverage
open coverage/index.html
```

## Continuous Integration

Tests run automatically on every push via GitHub Actions.

### CI Workflow

**Component Tests**:
- Install dependencies
- Run Vitest tests
- Generate coverage report

**E2E Tests**:
- Spin up MySQL database
- Clone and setup Laravel backend
- Run migrations and seeders
- Start backend API server (port 8000)
- Start Nuxt dev server (port 3000)
- Run Playwright tests
- Upload test reports and videos

**Linting**:
- Run ESLint checks
- Verify code style

See `.github/workflows/test.yml` for full CI configuration.

## Debugging Tests

### Component Tests

```bash
# Run specific test file
npm run test RequestStatusBadge.test.ts

# Run in debug mode
node --inspect-brk node_modules/vitest/vitest.mjs run

# Use console.log in tests
it('debugs value', () => {
  console.log(wrapper.html())
  // Assertions
})
```

### E2E Tests

```bash
# Debug mode with Playwright Inspector
npm run e2e:debug

# Run headed mode (see browser)
npx playwright test --headed

# Take screenshots on failure (automatic)
```

Playwright automatically captures:
- Screenshots on failure
- Videos on failure
- Trace files for debugging

## Mocking

### Mock API Calls

```typescript
// Mock useApi composable
vi.mock('~/composables/useApi', () => ({
  useApi: () => ({
    get: vi.fn(() => Promise.resolve({ data: mockData })),
    post: vi.fn(() => Promise.resolve({ success: true }))
  })
}))
```

### Mock Pinia Store

```typescript
import { setActivePinia, createPinia } from 'pinia'

beforeEach(() => {
  setActivePinia(createPinia())
})

it('uses auth store', () => {
  const authStore = useAuthStore()
  authStore.user = mockUser
  // Test with mocked store
})
```

### Mock Router

```typescript
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }]
})

const wrapper = mount(Component, {
  global: {
    plugins: [router]
  }
})
```

## Test Data

### Test Fixtures

Store reusable test data in `tests/fixtures/`:

```typescript
// tests/fixtures/requests.ts
export const mockRequest = {
  id: 1,
  title: 'Test Request',
  amount: 50000,
  status: 'SUBMITTED',
  category: 'SOFTWARE'
}

export const mockRequests = [mockRequest, /* ... */]
```

### Test Users

Defined in `tests/e2e/helpers/auth.ts`:

```typescript
export const TEST_USERS = {
  requester: {
    email: 'requester@deciflow.com',
    password: 'password'
  },
  approver: {
    email: 'approver@deciflow.com',
    password: 'password'
  }
}
```

## Performance Testing

Monitor test execution time:

```bash
# Show slow tests
npm run test:run -- --reporter=verbose

# Set test timeout
test('slow operation', async () => {
  // test code
}, { timeout: 10000 }) // 10 seconds
```

## Common Testing Patterns

### Testing Async Operations

```typescript
it('loads data on mount', async () => {
  const wrapper = mount(Component)
  await wrapper.vm.$nextTick()

  expect(wrapper.vm.data).toBeDefined()
})
```

### Testing Form Validation

```typescript
it('validates required field', async () => {
  const wrapper = mount(FormComponent)

  // Submit without filling required field
  await wrapper.find('form').trigger('submit')

  // Check for validation error
  expect(wrapper.find('.error-message').text()).toContain('Required')
})
```

### Testing Conditional Rendering

```typescript
it('shows element when condition is true', async () => {
  const wrapper = mount(Component, {
    props: { showElement: false }
  })

  expect(wrapper.find('.conditional-element').exists()).toBe(false)

  await wrapper.setProps({ showElement: true })

  expect(wrapper.find('.conditional-element').exists()).toBe(true)
})
```

## Troubleshooting

### Common Issues

**Issue**: Tests fail in CI but pass locally
**Solution**: Check timezone differences, ensure test data is isolated

**Issue**: Flaky E2E tests
**Solution**: Add proper waits, use `waitForSelector`, avoid hardcoded timeouts

**Issue**: Component test fails to find element
**Solution**: Check if element is conditionally rendered, wait for nextTick

**Issue**: Mock not working
**Solution**: Ensure mock is defined before component import

## Related Documentation

- [Architecture](./ARCHITECTURE.md)
- [Components](./COMPONENTS.md)
- [Deployment](./DEPLOYMENT.md)
