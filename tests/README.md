# DeciFlow Frontend Tests

This directory contains all tests for the DeciFlow frontend application.

## Test Structure

```
tests/
├── component/          # Component tests
│   ├── RequestCard.test.ts
│   ├── RequestStatusBadge.test.ts
│   ├── ApprovalTimeline.test.ts
│   ├── AttachmentList.test.ts
│   └── FileUpload.test.ts
├── unit/              # Unit tests for composables, utils
├── e2e/               # End-to-end tests with Playwright
└── setup.ts           # Test setup and global mocks
```

## Running Tests

### Unit & Component Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Run E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Debug E2E tests
npm run e2e:debug
```

## Test Coverage

Current coverage thresholds:
- Lines: 70%
- Functions: 70%
- Branches: 70%
- Statements: 70%

## Component Tests

### RequestCard.test.ts
Tests for the request card component that displays request summaries.

**Coverage:**
- Rendering with different request data
- Click event handling
- Status badge display
- Amount formatting
- Date formatting
- Category display

### RequestStatusBadge.test.ts
Tests for the status badge component.

**Coverage:**
- All status types (DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED, RETURNED, CANCELLED, ARCHIVED)
- Correct color mapping for each status
- Dynamic status updates

### ApprovalTimeline.test.ts
Tests for the approval timeline component.

**Coverage:**
- Timeline rendering with multiple steps
- Step status display
- Approver information
- Comments display
- Date formatting
- Empty state
- Icon rendering based on status

### AttachmentList.test.ts
Tests for the attachment list component.

**Coverage:**
- Loading state
- Error state
- Empty state
- Attachment display
- File size formatting
- Download functionality
- Delete functionality (with permission check)
- File type icons
- Uploader information

### FileUpload.test.ts
Tests for the file upload component.

**Coverage:**
- File validation (size and type)
- Upload success handling
- Upload error handling
- Progress tracking
- Queue management
- Supported file types
- File size formatting

## Writing Tests

### Component Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import YourComponent from '~/components/path/YourComponent.vue'

// Mock dependencies
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('YourComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly', () => {
    const wrapper = mount(YourComponent, {
      props: {
        // your props
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  // More tests...
})
```

### Best Practices

1. **Clear test descriptions**: Use descriptive test names
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock external dependencies**: Mock APIs, composables, libraries
4. **Test user interactions**: Simulate clicks, inputs, etc.
5. **Test edge cases**: Empty states, errors, loading states
6. **Clean up**: Use `beforeEach` to reset mocks

## Mocking

### Global Mocks (in setup.ts)

- Nuxt composables (`useRouter`, `useRoute`, `useFetch`, etc.)
- Naive UI components (stubbed for faster tests)

### Test-specific Mocks

Mock in individual test files:

```typescript
vi.mock('~/composables/useYourComposable', () => ({
  default: () => ({
    someMethod: vi.fn(),
  }),
}))
```

## CI/CD Integration

Tests are automatically run in CI/CD pipeline:

1. Lint and type check
2. Unit and component tests
3. Coverage report
4. E2E tests

## Troubleshooting

### Tests failing with "Cannot find module"

- Ensure path aliases in `vitest.config.ts` match your imports
- Check that dependencies are installed: `npm install`

### Tests timing out

- Increase timeout in specific test: `it('test', { timeout: 10000 }, async () => {})`
- Or globally in `vitest.config.ts`

### Mock not working

- Ensure mock is defined before importing the component
- Use `vi.clearAllMocks()` in `beforeEach`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)
