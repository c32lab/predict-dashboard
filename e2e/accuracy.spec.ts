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
    await expect(page.locator('h1')).toContainText('Prediction Accuracy')
  })

  test('shows page description', async ({ page }) => {
    await page.goto('/accuracy')
    await expect(
      page.getByText('Track prediction accuracy trends')
    ).toBeVisible()
  })

  test('accuracy nav link is active', async ({ page }) => {
    await page.goto('/accuracy')
    const link = page.getByRole('link', { name: 'Accuracy' })
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
