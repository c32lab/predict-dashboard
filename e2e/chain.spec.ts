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
    await expect(page.getByText('Industry Chain')).toBeVisible()
  })

  test('chain nav link is active', async ({ page }) => {
    await page.goto('/chain')
    const link = page.getByRole('link', { name: 'Chain' })
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
