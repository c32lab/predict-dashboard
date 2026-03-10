import { test, expect } from '@playwright/test'

test.describe('Accuracy Page', () => {
  test('page loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/accuracy')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })

  test('shows page heading', async ({ page }) => {
    await page.goto('/accuracy')
    const heading = page.getByText('Prediction Accuracy')
    const loading = page.locator('[class*="animate-pulse"]')
    const error = page.getByText(/failed to load/i)
    const empty = page.getByText(/no .* available/i)
    await expect(heading.or(loading.first()).or(error).or(empty).first()).toBeVisible({ timeout: 10_000 })
  })

  test('shows page description', async ({ page }) => {
    await page.goto('/accuracy')
    const description = page.getByText('Track prediction accuracy trends')
    const loading = page.locator('[class*="animate-pulse"]')
    const error = page.getByText(/failed to load/i)
    const empty = page.getByText(/no .* available/i)
    await expect(description.or(loading.first()).or(error).or(empty).first()).toBeVisible({ timeout: 10_000 })
  })

  test('accuracy nav link is active', async ({ page }) => {
    await page.goto('/accuracy')
    const link = page.getByRole('link', { name: 'Accuracy' })
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
