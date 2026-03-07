import { test, expect } from '@playwright/test'

test.describe('Backtest Page', () => {
  test('page loads without crashing', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/backtest')
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })

  test('shows heading or loading state', async ({ page }) => {
    await page.goto('/backtest')
    // Backtest page fetches static JSON; if files are missing it shows loading state
    const heading = page.getByText('Backtest Results')
    const loading = page.getByText('Loading backtest data')
    const error = page.getByText('Failed to load backtest data')
    await expect(heading.or(loading).or(error).first()).toBeVisible()
  })

  test('backtest nav link is active', async ({ page }) => {
    await page.goto('/backtest')
    const link = page.locator('nav a[href="/backtest"]')
    await expect(link).toHaveClass(/text-blue-400/)
  })
})
