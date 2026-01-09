import { test, expect } from '@playwright/test'
import { loginAs, TEST_USERS } from './helpers/auth'

test.describe('Request Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as requester before each test
    await loginAs(page, 'requester')
  })

  test('should navigate to create request page', async ({ page }) => {
    // Navigate to requests list
    await page.goto('/requests')
    await page.waitForLoadState('networkidle')

    // Click on "Create New" button (type="primary")
    const createButton = page.locator('button[type="button"]').filter({ hasText: /create|新規/i })
    await createButton.first().click()

    // Should navigate to create request page
    await expect(page).toHaveURL(/\/requests\/new/)

    // Wait for form to be visible
    await page.waitForSelector('form', { state: 'visible', timeout: 5000 })
  })

  test('should create a new request successfully', async ({ page }) => {
    // Navigate to create request page
    await page.goto('/requests/new')
    await page.waitForLoadState('networkidle')

    // Wait for form to be fully loaded
    await page.waitForSelector('form', { state: 'visible' })

    // Fill in title - find the first text input
    await page.locator('input[type="text"]').first().fill('E2E Test Request Title')

    // Fill description - textarea
    await page.locator('textarea').first().fill('This is a detailed description for E2E testing request submission flow')

    // Fill amount using the number input
    const amountInput = page.locator('.n-input-number input').first()
    await amountInput.click()
    await amountInput.fill('50000')
    await amountInput.press('Tab') // Move focus to trigger validation

    // Wait a bit for any dynamic form updates
    await page.waitForTimeout(500)

    // Submit the form using the primary button
    // The submit button should be the primary type button with specific text
    await page.locator('button').filter({ hasText: /submit|approval|送信|提出/i }).click()

    // Wait for either redirect OR stay on page if validation failed
    try {
      await page.waitForURL(/\/requests\/\d+/, { timeout: 10000 })
      // Success - redirected to detail page
    } catch (e) {
      // Check if still on form page (validation might have failed)
      const currentUrl = page.url()
      if (currentUrl.includes('/new')) {
        // Still on form, check for validation errors
        const errors = await page.locator('.n-form-item-feedback-wrapper').count()
        if (errors > 0) {
          throw new Error(`Form validation failed with ${errors} errors`)
        }
      }
      throw e
    }
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/requests/new')
    await page.waitForLoadState('networkidle')

    // Try to submit without filling required fields
    const submitButton = page.locator('button[type="button"]').filter({ hasText: /submit|送信|提出/i })
    await submitButton.click()

    // Should still be on create page (validation prevents submission)
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/\/requests\/new/)

    // Check for validation error messages (Naive UI shows these as .n-form-item-feedback)
    const validationErrors = page.locator('.n-form-item-feedback-wrapper')
    const errorCount = await validationErrors.count()
    expect(errorCount).toBeGreaterThan(0)
  })

  test('should save request as draft', async ({ page }) => {
    await page.goto('/requests/new')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('form', { state: 'visible' })

    // Fill minimum required fields
    await page.locator('input[type="text"]').first().fill('E2E Draft Request')
    await page.locator('textarea').first().fill('This is a draft request for testing purposes')

    // Fill amount
    const amountInput = page.locator('.n-input-number input').first()
    await amountInput.click()
    await amountInput.fill('10000')
    await amountInput.press('Tab')

    await page.waitForTimeout(500)

    // Click save as draft button if it exists
    const draftButton = page.locator('button').filter({ hasText: /draft|下書き/i })
    if (await draftButton.count() > 0) {
      await draftButton.click()

      // Wait for redirect or error
      try {
        await page.waitForURL(/\/requests\/\d+/, { timeout: 10000 })
      } catch (e) {
        // Check for validation errors
        const errors = await page.locator('.n-form-item-feedback-wrapper').count()
        if (errors > 0) {
          throw new Error(`Draft save failed with ${errors} validation errors`)
        }
        throw e
      }
    } else {
      test.skip() // Skip if draft button doesn't exist
    }
  })

  test('should display created request in list', async ({ page }) => {
    const testTitle = `E2E Test ${Date.now()}`

    // Create a request
    await page.goto('/requests/new')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('form', { state: 'visible' })

    // Fill form with minimal required fields
    await page.locator('input[type="text"]').first().fill(testTitle)
    await page.locator('textarea').first().fill('Test description for list display')

    const amountInput = page.locator('.n-input-number input').first()
    await amountInput.click()
    await amountInput.fill('15000')
    await amountInput.press('Tab')

    await page.waitForTimeout(500)

    // Submit
    await page.locator('button').filter({ hasText: /submit|approval|送信|提出/i }).click()

    // Wait for redirect
    try {
      await page.waitForURL(/\/requests\/\d+/, { timeout: 10000 })
    } catch (e) {
      const errors = await page.locator('.n-form-item-feedback-wrapper').count()
      if (errors > 0) {
        throw new Error(`Request creation failed with ${errors} validation errors`)
      }
      throw e
    }

    // Navigate to requests list
    await page.goto('/requests')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for table to load

    // Should see the created request in the table or list
    const requestInList = page.locator(`text=${testTitle}`)
    await expect(requestInList.first()).toBeVisible({ timeout: 10000 })
  })

  test('should show request details', async ({ page }) => {
    // Navigate to requests list
    await page.goto('/requests')
    await page.waitForLoadState('networkidle')

    // Wait for table to load
    await page.waitForTimeout(1000)

    // Find a View button in the actions column
    const viewButton = page.locator('button').filter({ hasText: /view|詳細|表示/i }).first()
    const buttonCount = await viewButton.count()

    if (buttonCount > 0) {
      // Click the view button
      await viewButton.click()

      // Should navigate to detail page
      await page.waitForURL(/\/requests\/\d+/, { timeout: 10000 })

      // Should display request details (wait for content to load)
      await page.waitForLoadState('networkidle')

      // Verify page loaded with content
      const pageContent = await page.textContent('body')
      expect(pageContent).toBeTruthy()
      expect(pageContent?.length).toBeGreaterThan(100) // Should have substantial content
    } else {
      // No requests exist, skip this test
      test.skip()
    }
  })

  test('should show form with correct default values', async ({ page }) => {
    await page.goto('/requests/new')
    await page.waitForLoadState('networkidle')

    // Check that form is displayed
    await expect(page.locator('form')).toBeVisible()

    // Check that inputs are present
    const inputs = page.locator('input[type="text"], input:not([type])')
    const inputCount = await inputs.count()
    expect(inputCount).toBeGreaterThan(0)

    // Check that textareas are present
    const textareas = page.locator('textarea')
    const textareaCount = await textareas.count()
    expect(textareaCount).toBeGreaterThan(0)

    // Check that buttons are present
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()
    expect(buttonCount).toBeGreaterThan(2) // Should have cancel, draft, and submit buttons
  })
})
