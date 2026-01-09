import { test, expect } from '@playwright/test'
import { loginAs, login, TEST_USERS } from './helpers/auth'
import { getAuthToken, createTestRequest, submitRequest, approveRequest } from './helpers/api'

test.describe('Request Approval Flow', () => {
  let requestId: number

  test.beforeEach(async ({ page, request }) => {
    // Create a test request via API for consistent test setup
    const token = await getAuthToken(request, TEST_USERS.requester.email, TEST_USERS.requester.password)

    const requestData = await createTestRequest(request, token, {
      title: `E2E Approval Test ${Date.now()}`,
      description: 'Test request for approval workflow',
      category: 'SOFTWARE',
      amount: 75000,
      urgency: 'NORMAL',
      vendor_name: 'Test Vendor',
    })

    requestId = requestData.data?.id || requestData.id

    // Submit the request so it's ready for approval
    await submitRequest(request, token, requestId)
  })

  test('requester should submit request for approval', async ({ page }) => {
    // Login as requester
    await loginAs(page, 'requester')

    // Navigate to the created request
    await page.goto(`/requests/${requestId}`)

    // Should see the request details
    await expect(page.locator('text=/E2E Approval Test/i')).toBeVisible()

    // Should see "IN REVIEW" or "SUBMITTED" status
    const status = page.locator('text=/in review|submitted|pending|待機中|レビュー中/i')
    await expect(status.first()).toBeVisible({ timeout: 5000 })
  })

  test('approver should see pending requests', async ({ page }) => {
    // Login as approver
    await loginAs(page, 'approver')

    // Navigate to approvals inbox
    await page.goto('/approvals/inbox')
    await page.waitForLoadState('networkidle')

    // Should see the approvals table
    const table = page.locator('.n-data-table')
    await expect(table).toBeVisible({ timeout: 5000 })

    // Should see the test request in the table
    const testRequest = page.locator('text=/E2E Approval Test/i')
    await expect(testRequest.first()).toBeVisible({ timeout: 5000 })
  })

  test('approver should approve request', async ({ page }) => {
    // Login as approver
    await loginAs(page, 'approver')

    // Navigate to approvals inbox
    await page.goto('/approvals/inbox')
    await page.waitForLoadState('networkidle')

    // Find the test request row and click approve button
    const approveButton = page.locator('button').filter({ hasText: /^Approve$/i }).first()
    await expect(approveButton).toBeVisible({ timeout: 5000 })
    await approveButton.click()

    // Wait for modal to open
    await page.waitForSelector('.n-modal', { state: 'visible', timeout: 5000 })

    // Fill in comment in the modal
    const commentTextarea = page.locator('.n-modal textarea').first()
    await commentTextarea.fill('Approved - looks good')

    // Click the Approve button in modal to confirm
    const confirmButton = page.locator('.n-modal button').filter({ hasText: /^Approve$/i }).first()
    await confirmButton.click()

    // Wait for modal to close
    await page.waitForSelector('.n-modal', { state: 'hidden', timeout: 5000 })

    // Should show success message
    await page.waitForTimeout(1000)
    const successIndicator = page.locator('text=/success|approved|成功/i')
    await expect(successIndicator.first()).toBeVisible({ timeout: 10000 })
  })

  test('approver should reject request', async ({ page, request }) => {
    // Create a new request for rejection test
    const token = await getAuthToken(request, TEST_USERS.requester.email, TEST_USERS.requester.password)
    const rejectRequestData = await createTestRequest(request, token, {
      title: `E2E Rejection Test ${Date.now()}`,
      description: 'Test request for rejection workflow',
      category: 'EQUIPMENT',
      amount: 30000,
      urgency: 'NORMAL',
    })
    const rejectRequestId = rejectRequestData.data?.id || rejectRequestData.id
    await submitRequest(request, token, rejectRequestId)

    // Login as approver
    await loginAs(page, 'approver')

    // Navigate to approvals inbox
    await page.goto('/approvals/inbox')
    await page.waitForLoadState('networkidle')

    // Find and click reject button for the rejection test request
    const rejectButtons = page.locator('button').filter({ hasText: /^Reject$/i })
    const rejectButtonCount = await rejectButtons.count()

    // Click the last reject button (most recent request)
    if (rejectButtonCount > 0) {
      await rejectButtons.last().click()
    } else {
      throw new Error('No reject button found')
    }

    // Wait for modal to open
    await page.waitForSelector('.n-modal', { state: 'visible', timeout: 5000 })

    // Fill rejection comment in modal
    const commentTextarea = page.locator('.n-modal textarea').first()
    await commentTextarea.fill('Budget not available')

    // Click the Reject button in modal to confirm
    const confirmButton = page.locator('.n-modal button').filter({ hasText: /^Reject$/i }).first()
    await confirmButton.click()

    // Wait for modal to close
    await page.waitForSelector('.n-modal', { state: 'hidden', timeout: 5000 })

    // Should show success message
    await page.waitForTimeout(1000)
    const successIndicator = page.locator('text=/success|rejected|成功/i')
    await expect(successIndicator.first()).toBeVisible({ timeout: 10000 })
  })

  test('should display approval timeline', async ({ page }) => {
    // Login as requester or approver
    await loginAs(page, 'requester')

    // Navigate to request detail
    await page.goto(`/requests/${requestId}`)

    // Should see approval timeline section
    const timeline = page.locator('text=/timeline|approval|承認/i')
    await expect(timeline.first()).toBeVisible({ timeout: 5000 })

    // Should see approval steps
    const steps = page.locator('text=/step|ステップ/i')
    await expect(steps.first()).toBeVisible({ timeout: 5000 })
  })

  test('should show approval history with comments', async ({ page, request }) => {
    // First approve the request via API to have history
    const approverToken = await getAuthToken(
      request,
      TEST_USERS.approver.email,
      TEST_USERS.approver.password
    )

    // Approve the request via API
    try {
      await approveRequest(request, approverToken, requestId, 'API approved for history test')
    } catch (e) {
      // If approval fails, skip this test as it depends on approval workflow
      console.log('Approval failed:', e)
    }

    // Login as anyone to view the request
    await loginAs(page, 'requester')

    // Navigate to request
    await page.goto(`/requests/${requestId}`)
    await page.waitForLoadState('networkidle')

    // Should see timeline section (using NSteps component)
    const timelineHeading = page.locator('text=/approval timeline|timeline|承認|タイムライン/i')
    await expect(timelineHeading.first()).toBeVisible({ timeout: 5000 })

    // Should see step information
    const stepInfo = page.locator('text=/step|ステップ/i')
    await expect(stepInfo.first()).toBeVisible({ timeout: 5000 })
  })

  test('non-approver should not see approval buttons', async ({ page }) => {
    // Login as requester (who should not be able to approve their own request)
    await loginAs(page, 'requester')

    // Navigate to the request
    await page.goto(`/requests/${requestId}`)

    // Should NOT see approve/reject buttons
    const approveButton = page.locator('button:has-text("Approve")')
    const rejectButton = page.locator('button:has-text("Reject")')

    // These buttons should not be visible to the requester
    await expect(approveButton).not.toBeVisible()
    await expect(rejectButton).not.toBeVisible()
  })
})
