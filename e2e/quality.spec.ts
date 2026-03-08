import { test, expect } from '@playwright/test'

test.describe('Quality Page', () => {
  test('page loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/quality')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })

  test('shows page heading', async ({ page }) => {
    await page.goto('/quality')
    await expect(page.locator('h1')).toContainText('Quality Report')
  })

  test('quality nav link is active', async ({ page }) => {
    await page.goto('/quality')
    const link = page.getByRole('link', { name: 'Quality' })
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
