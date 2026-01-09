import { test, expect } from '@playwright/test'
import { login, logout, TEST_USERS } from './helpers/auth'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the login page
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    // Check that login form elements are visible
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should login successfully as requester', async ({ page }) => {
    const user = TEST_USERS.requester

    await login(page, user.email, user.password)

    // Should redirect away from login page
    await expect(page).not.toHaveURL(/\/login/)

    // Should be on a logged-in page (home, dashboard, requests, etc.)
    await page.waitForLoadState('networkidle')
  })

  test('should login successfully as approver', async ({ page }) => {
    const user = TEST_USERS.approver

    await login(page, user.email, user.password)

    // Should redirect away from login page
    await expect(page).not.toHaveURL(/\/login/)
    await page.waitForLoadState('networkidle')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message (update selector based on your UI)
    const errorMessage = page.locator('text=/invalid credentials|login failed|incorrect/i')
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling fields
    await page.click('button[type="submit"]')

    // Should show validation errors or prevent submission
    // This depends on your frontend validation implementation
    await expect(page).toHaveURL(/\/login/)
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await login(page, TEST_USERS.requester.email, TEST_USERS.requester.password)

    // Then logout
    await logout(page)

    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/)
  })
})
