# Test Fixes Needed

## Summary
The test suite has 60 failing tests out of 76. I've made progress on the core issues, but there are several patterns that need to be addressed.

## What I Fixed
1. ✅ Added global mocks for `useAttachments` and `useI18n` in `tests/setup.ts`
2. ✅ Added Suspense wrapper helper for async components in AttachmentList.test.ts
3. ✅ Fixed some basic test configuration issues

## Remaining Issues

### 1. Naive UI Component Stubs Prevent Content Rendering
**Problem:** Components like `NButton`, `NCard`, `NText` are globally stubbed in `tests/setup.ts` (line 64-58), which means they don't render their slot content.

**Solution:** Remove or set to `false` the stubs that prevent content rendering:
```typescript
// In tests/setup.ts, change from:
config.global.stubs = {
  NButton: true,  // ❌ Prevents slot content rendering
  NCard: true,
  ...
}

// To:
config.global.stubs = {
  NButton: false,  // ✅ Allows slot content rendering
  NCard: false,
  NText: false,
  // Only stub components that have complex functionality
  NUpload: true,
  NDatePicker: true,
}
```

### 2. Missing Global Vue Imports
**Problem:** FileUpload tests fail with "ref is not defined"

**Solution:** Add Vue's reactive functions to globals in `tests/setup.ts`:
```typescript
import { ref, computed, watch } from 'vue'

global.ref = ref
global.computed = computed
global.watch = watch
```

### 3. Local i18n Mocks Override Global Mock
**Problem:** Individual test files (RequestStatusBadge.test.ts, ApprovalTimeline.test.ts, etc.) have local `vi.mock('vue-i18n')` that override the global mock.

**Solution:** Remove the local i18n mocks from these files:
- `tests/component/RequestStatusBadge.test.ts` (lines 6-10)
- `tests/component/ApprovalTimeline.test.ts`
- `tests/component/RequestCard.test.ts`
- `tests/component/FileUpload.test.ts`

The global mock in `tests/setup.ts` is sufficient.

### 4. AttachmentList Tests Need Suspense Wrapper
**Problem:** Only one test uses the Suspense wrapper, but all tests for async components need it.

**Solution:** Update all AttachmentList tests to use `mountWithSuspense` instead of `mount`:
```typescript
// Change from:
const wrapper = mount(AttachmentList, { props: { requestId: 1 } })

// To:
const wrapper = await mountWithSuspense(AttachmentList, { props: { requestId: 1 } })
```

This needs to be done for about 18 tests in `tests/component/AttachmentList.test.ts`.

### 5. Missing date-fns Global Mock
**Problem:** date-fns formatting isn't mocked globally.

**Solution:** Add to `tests/setup.ts`:
```typescript
vi.mock('date-fns', () => ({
  format: (date: Date | string, formatStr: string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  },
}))
```

## Quick Fix Priority

1. **High Priority** - Remove component stubs (fixes 40+ tests)
2. **High Priority** - Add Vue global imports (fixes 16 FileUpload tests)
3. **Medium Priority** - Remove local i18n mocks (improves test clarity)
4. **Low Priority** - Update AttachmentList tests to use Suspense (already have one working example)

## Test Status After Core Fixes
- ✅ 16 tests passing (status type mapping tests)
- ⏳ 60 tests failing (mostly due to stubbed components not rendering content)
- 📊 21% pass rate → Should reach 80%+ after stub fixes

## Example Files to Update

1. `tests/setup.ts` - Add global imports, fix stubs
2. `tests/component/RequestStatusBadge.test.ts` - Remove local i18n mock
3. `tests/component/ApprovalTimeline.test.ts` - Remove local i18n mock
4. `tests/component/RequestCard.test.ts` - Remove local i18n mock
5. `tests/component/FileUpload.test.ts` - Remove local i18n mock
6. `tests/component/AttachmentList.test.ts` - Update remaining tests to use Suspense
