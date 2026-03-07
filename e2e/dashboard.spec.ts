import { test, expect } from '@playwright/test'

test.describe('Predict Dashboard', () => {
  test('page loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })

  test('nav bar is visible on dashboard', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
  })

  test('dashboard link is active on home page', async ({ page }) => {
    await page.goto('/')
    const dashLink = page.getByRole('link', { name: 'Dashboard' })
    await expect(dashLink).toBeVisible()
    await expect(dashLink).toHaveClass(/text-blue-400/)
  })

  test('shows loading state or content', async ({ page }) => {
    await page.goto('/')
    // Either loading spinner or actual content should be present
    const body = page.locator('body')
    await expect(body).not.toBeEmpty()
  })
})
