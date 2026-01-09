import type { Page } from '@playwright/test'

/**
 * Test user credentials
 * Update these based on your seeded database users
 */
export const TEST_USERS = {
  superAdmin: {
    email: 'superadmin@deciflow.com',
    password: 'password',
    role: 'super_admin',
  },
  deptAdmin: {
    email: 'deptadmin@deciflow.com',
    password: 'password',
    role: 'dept_admin',
  },
  approver: {
    email: 'approver@deciflow.com',
    password: 'password',
    role: 'approver',
  },
  requester: {
    email: 'requester@deciflow.com',
    password: 'password',
    role: 'requester',
  },
}

/**
 * Login helper function
 * Logs in a user and waits for navigation to complete
 */
export async function login(page: Page, email: string, password: string) {
  // Navigate to login page
  await page.goto('/login')

  // Wait for the login form to be visible
  await page.waitForSelector('form', { state: 'visible' })

  // Fill in credentials
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)

  // Click login button
  await page.click('button[type="submit"]')

  // Wait for navigation to complete (should redirect away from login page)
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 })
}

/**
 * Login as a specific test user
 */
export async function loginAs(page: Page, userType: keyof typeof TEST_USERS) {
  const user = TEST_USERS[userType]
  await login(page, user.email, user.password)
}

/**
 * Logout helper function
 */
export async function logout(page: Page) {
  // Click on user menu or logout button
  // Update selector based on your actual UI
  await page.click('[data-testid="user-menu"]').catch(() => {
    // Fallback: look for logout button or link
    return page.click('text=Logout').catch(() => page.click('text=ログアウト'))
  })

  // Wait for redirect to login page
  await page.waitForURL(/\/login/, { timeout: 5000 })
}

/**
 * Get authentication state for session reuse
 * This can speed up tests by reusing authenticated sessions
 */
export async function getAuthState(page: Page, userType: keyof typeof TEST_USERS) {
  await loginAs(page, userType)
  return await page.context().storageState()
}
