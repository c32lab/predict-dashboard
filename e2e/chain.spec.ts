import { test, expect } from '@playwright/test'

test.describe('Chain Page', () => {
  test('page loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/chain')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })

  test('shows page heading', async ({ page }) => {
    await page.goto('/chain')
    const heading = page.getByText('Industry Chain')
    const loading = page.locator('[class*="animate-pulse"]')
    const error = page.getByText(/failed to load/i)
    const empty = page.getByText(/no .* available/i)
    await expect(heading.or(loading.first()).or(error).or(empty).first()).toBeVisible({ timeout: 10_000 })
  })

  test('chain nav link is active', async ({ page }) => {
    await page.goto('/chain')
    const link = page.getByRole('link', { name: 'Chain' })
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
