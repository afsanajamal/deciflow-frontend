# E2E Testing Setup Guide

This guide will help you set up and run End-to-End tests for the DeciFlow application.

## Quick Start

### 1. Ensure Backend is Running

The E2E tests require the Laravel backend to be running:

```bash
# Navigate to backend directory
cd ../deciflow-backend

# Start the backend server
php artisan serve
```

The backend should be accessible at `http://localhost:8000`

### 2. Seed the Database

E2E tests use real backend data. Make sure your database is seeded with test users:

```bash
cd ../deciflow-backend
php artisan migrate:fresh --seed
```

**Expected test users** (update `tests/e2e/helpers/auth.ts` if different):
- `superadmin@deciflow.com` / `password`
- `deptadmin@deciflow.com` / `password`
- `approver@deciflow.com` / `password`
- `requester@deciflow.com` / `password`

### 3. Install Playwright Browsers (First Time Only)

```bash
npx playwright install
```

### 4. Run E2E Tests

```bash
# Run all E2E tests
npm run e2e

# Run with UI (interactive mode - recommended for development)
npm run e2e:ui

# Run in debug mode (step through tests)
npm run e2e:debug

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in headed mode (see the browser)
npx playwright test --headed
```

## What Gets Tested

### ✅ Available Test Suites

1. **Authentication Flow** (`auth.spec.ts`)
   - Login with different user roles
   - Invalid credentials handling
   - Form validation
   - Logout functionality

2. **Request Creation** (`request-create.spec.ts`)
   - Navigate to create request page
   - Create new purchase request
   - Form validation
   - Save as draft
   - View request in list
   - View request details

3. **Approval Workflow** (`request-approval.spec.ts`)
   - Submit request for approval
   - View pending requests as approver
   - Approve requests
   - Reject requests
   - View approval timeline
   - Permission checks

## Test Structure

```
tests/e2e/
├── auth.spec.ts              # Login/logout tests
├── request-create.spec.ts    # Request creation tests
├── request-approval.spec.ts  # Approval workflow tests
├── helpers/
│   ├── auth.ts              # Login helpers and test users
│   └── api.ts               # Backend API helpers
└── README.md                # Detailed testing documentation
```

## Configuration

E2E tests are configured in `playwright.config.ts`:

- **Test directory**: `./tests/e2e`
- **Base URL**: `http://localhost:3000` (auto-started)
- **Backend API**: `http://localhost:8000/api`
- **Workers**: 1 (sequential execution to avoid database conflicts)
- **Retries**: 0 locally, 2 on CI
- **Browsers**: Chromium (default), Firefox and WebKit available

## Viewing Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Reports include:
- Test pass/fail status
- Screenshots of failures
- Video recordings of failed tests
- Execution traces for debugging

## Common Commands

```bash
# Run all tests
npm run e2e

# Run with UI mode (best for development)
npm run e2e:ui

# Run specific test
npx playwright test tests/e2e/auth.spec.ts

# Run specific test in headed mode
npx playwright test tests/e2e/auth.spec.ts --headed

# Run and update snapshots
npx playwright test --update-snapshots

# Generate test code (record actions)
npx playwright codegen http://localhost:3000

# Show test report
npx playwright show-report
```

## Debugging Tests

### Method 1: UI Mode (Recommended)
```bash
npm run e2e:ui
```
- Visual interface
- Time-travel debugging
- See network requests
- Inspect DOM

### Method 2: Debug Mode
```bash
npm run e2e:debug
```
- Step through tests
- Set breakpoints
- Inspect elements

### Method 3: Pause in Test
Add this line to your test:
```typescript
await page.pause()
```

### Method 4: Screenshots
Tests automatically capture screenshots on failure. Manual screenshot:
```typescript
await page.screenshot({ path: 'screenshot.png' })
```

## Troubleshooting

### "Backend not running" Error
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**: Start the backend
```bash
cd ../deciflow-backend
php artisan serve
```

### "Authentication failed" Error
**Solution**: Reseed the database
```bash
cd ../deciflow-backend
php artisan migrate:fresh --seed
```

### "Frontend not starting" Error
**Solution**: Check if port 3000 is available
```bash
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
npm run dev                     # Start manually if needed
```

### Tests Timing Out
- Increase timeout in `playwright.config.ts`
- Check network speed
- Verify backend is responding quickly

### Flaky Tests
- Use proper waits: `await expect(element).toBeVisible()`
- Avoid `setTimeout`, use `page.waitForLoadState()`
- Check for race conditions

## Writing New Tests

### Template for New Test File

```typescript
import { test, expect } from '@playwright/test'
import { loginAs } from './helpers/auth'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Login or setup
    await loginAs(page, 'requester')
  })

  test('should do something', async ({ page }) => {
    // 1. Navigate
    await page.goto('/some-page')

    // 2. Interact with UI
    await page.click('button')
    await page.fill('input', 'value')

    // 3. Assert expectations
    await expect(page.locator('text=Success')).toBeVisible()
  })
})
```

### Using API Helpers

For faster test setup, create data via API:

```typescript
import { getAuthToken, createTestRequest } from './helpers/api'

test('my test', async ({ page, request }) => {
  // Setup data via API
  const token = await getAuthToken(request, 'user@example.com', 'password')
  const req = await createTestRequest(request, token, {
    title: 'Test',
    category: 'SOFTWARE',
    amount: 10000
  })

  // Test the UI
  await page.goto(`/requests/${req.id}`)
  await expect(page).toHaveURL(/\/requests\/\d+/)
})
```

## Best Practices

1. ✅ **Use data-testid attributes** for reliable element selection
2. ✅ **Keep tests independent** - each test should work alone
3. ✅ **Clean up test data** - use API helpers to create/delete
4. ✅ **Test real user journeys** - complete workflows, not just clicks
5. ✅ **Handle async properly** - use proper waits, not timeouts
6. ✅ **Test both success and error paths**
7. ✅ **Use realistic data** - similar to production scenarios

## CI/CD Integration

For running in CI environments:

```yaml
# GitHub Actions example
- name: Start Backend
  run: |
    cd backend
    php artisan serve &
    php artisan migrate:fresh --seed

- name: Run E2E Tests
  run: npm run e2e
  env:
    CI: true
```

## Next Steps

1. Run the existing tests: `npm run e2e:ui`
2. Review the test code in `tests/e2e/`
3. Add data-testid attributes to your components for easier testing
4. Write tests for additional features
5. Integrate into your CI/CD pipeline

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Generator](https://playwright.dev/docs/codegen) - Record your actions as test code
- [Trace Viewer](https://playwright.dev/docs/trace-viewer) - Debug failed tests

## Support

For issues or questions:
1. Check `tests/e2e/README.md` for detailed documentation
2. Review example tests in `tests/e2e/`
3. Use Playwright UI mode for interactive debugging
4. Check Playwright documentation
