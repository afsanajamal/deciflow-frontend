# E2E Tests - Quick Start

## Prerequisites Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Database seeded with test users
- [ ] Playwright browsers installed

## 30-Second Setup

### 1. Start Backend (in backend directory)
```bash
cd ../deciflow-backend
php artisan serve
```

### 2. Seed Database (if not already done)
```bash
cd ../deciflow-backend
php artisan migrate:fresh --seed
```

### 3. Run Tests (in frontend directory)
```bash
# Interactive mode (recommended)
npm run e2e:ui

# Or run all tests
npm run e2e
```

## Test Users

Make sure these users exist in your database:

| Email | Password | Role |
|-------|----------|------|
| requester@deciflow.com | password | requester |
| approver@deciflow.com | password | approver |
| deptadmin@deciflow.com | password | dept_admin |
| superadmin@deciflow.com | password | super_admin |

## Available Tests (19 total)

### Authentication (6 tests)
- ✅ Display login form
- ✅ Login as requester
- ✅ Login as approver
- ✅ Invalid credentials error
- ✅ Field validation
- ✅ Logout

### Request Creation (6 tests)
- ✅ Navigate to create page
- ✅ Create new request
- ✅ Form validation
- ✅ Save as draft
- ✅ Display in list
- ✅ Show details

### Approval Workflow (7 tests)
- ✅ Submit for approval
- ✅ View pending requests
- ✅ Approve request
- ✅ Reject request
- ✅ Display timeline
- ✅ Show approval history
- ✅ Permission checks

## Common Commands

```bash
# Run with UI (best for debugging)
npm run e2e:ui

# Run all tests
npm run e2e

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run in browser (headed mode)
npx playwright test --headed

# Generate test code by recording actions
npx playwright codegen http://localhost:3000
```

## Troubleshooting

### Backend not running
```bash
cd ../deciflow-backend
php artisan serve
```

### Missing test users
```bash
cd ../deciflow-backend
php artisan migrate:fresh --seed
```

### Browsers not installed
```bash
npx playwright install
```

## Next Steps

1. ✅ Run tests: `npm run e2e:ui`
2. ✅ Review passing tests
3. ✅ Add more test scenarios
4. ✅ Integrate into CI/CD

For detailed documentation, see:
- `E2E-SETUP.md` - Complete setup guide
- `tests/e2e/README.md` - Detailed testing docs
