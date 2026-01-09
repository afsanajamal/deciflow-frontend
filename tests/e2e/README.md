# E2E Tests with Playwright

This directory contains End-to-End (E2E) tests for the DeciFlow application using Playwright. These tests interact with the real backend API and test the full application flow.

## Prerequisites

Before running E2E tests, ensure:

1. **Backend is running**: The Laravel backend must be running on `http://localhost:8000`
   ```bash
   cd ../deciflow-backend
   php artisan serve
   ```

2. **Database is seeded**: The database should have test users
   ```bash
   cd ../deciflow-backend
   php artisan migrate:fresh --seed
   ```

3. **Frontend dependencies installed**:
   ```bash
   npm install
   ```

## Test Users

The tests use these seeded users (update `helpers/auth.ts` if your seeds are different):

- **Super Admin**: `superadmin@deciflow.com` / `password`
- **Dept Admin**: `deptadmin@deciflow.com` / `password`
- **Approver**: `approver@deciflow.com` / `password`
- **Requester**: `requester@deciflow.com` / `password`

## Running Tests

### Run all E2E tests
```bash
npm run e2e
```

### Run tests in UI mode (interactive)
```bash
npm run e2e:ui
```

### Run tests in debug mode
```bash
npm run e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run tests in a specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run tests in headed mode (see the browser)
```bash
npx playwright test --headed
```

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Authentication flow tests
├── request-create.spec.ts    # Request creation tests
├── request-approval.spec.ts  # Approval workflow tests
├── helpers/
│   ├── auth.ts              # Authentication helpers
│   └── api.ts               # Backend API helpers
└── README.md                # This file
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await loginAs(page, 'requester')
  })

  test('should do something', async ({ page }) => {
    // Navigate
    await page.goto('/some-page')

    // Interact
    await page.click('button')

    // Assert
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Using API Helpers for Test Setup

```typescript
import { getAuthToken, createTestRequest } from './helpers/api'

test('should display request', async ({ page, request }) => {
  // Create test data via API
  const token = await getAuthToken(request, 'user@example.com', 'password')
  const testRequest = await createTestRequest(request, token, {
    title: 'Test Request',
    category: 'SOFTWARE',
    amount: 50000,
  })

  // Test the UI
  await page.goto(`/requests/${testRequest.id}`)
  await expect(page.locator('text=Test Request')).toBeVisible()
})
```

## Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports are generated in the `playwright-report/` directory.

## Debugging Tips

1. **Use UI Mode**: `npm run e2e:ui` provides a visual interface to see tests run
2. **Use Debug Mode**: `npm run e2e:debug` allows stepping through tests
3. **Take Screenshots**: Tests automatically capture screenshots on failure
4. **View Traces**: Failed tests generate traces that can be viewed with `npx playwright show-trace`
5. **Use `page.pause()`**: Add `await page.pause()` in your test to pause execution

## Common Issues

### Backend not running
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**: Start the Laravel backend with `php artisan serve`

### Frontend not starting
```
Error: Timed out waiting for http://localhost:3000
```
**Solution**: The test runner should auto-start the dev server, but you can manually start it with `npm run dev`

### Authentication failures
```
Error: Login failed
```
**Solution**: Ensure database is seeded with test users. Run `php artisan db:seed` in the backend

### Flaky tests
- Use `await page.waitForLoadState('networkidle')` to wait for network requests
- Use explicit waits: `await expect(element).toBeVisible({ timeout: 5000 })`
- Check for race conditions in async operations

## Configuration

E2E test configuration is in `playwright.config.ts` at the project root.

Key settings:
- `testDir`: `./tests/e2e`
- `baseURL`: `http://localhost:3000`
- `workers`: 1 (to avoid database conflicts)
- `fullyParallel`: false (tests run sequentially)
- `webServer`: Auto-starts the dev server

## Best Practices

1. **Use test IDs**: Add `data-testid` attributes to important elements for reliable selection
2. **Clean up test data**: Use API helpers to create/delete test data
3. **Keep tests independent**: Each test should be able to run alone
4. **Use realistic test data**: Test with data similar to production
5. **Test user journeys**: Focus on complete user workflows
6. **Handle timing**: Use proper waits instead of arbitrary `setTimeout`
7. **Check both happy and error paths**: Test successful and failed scenarios

## CI/CD Integration

To run E2E tests in CI:

```yaml
# Example GitHub Actions workflow
- name: Run E2E tests
  run: |
    # Start backend
    cd backend && php artisan serve &

    # Run migrations and seeds
    php artisan migrate:fresh --seed

    # Run E2E tests
    cd ../frontend
    npm run e2e
```

Set `CI=true` environment variable to enable CI-specific settings (retries, no server reuse, etc.)
