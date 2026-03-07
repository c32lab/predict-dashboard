import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test('nav bar has all links', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('nav')
    await expect(nav.getByText('Dashboard')).toBeVisible()
    await expect(nav.getByText('Accuracy')).toBeVisible()
    await expect(nav.getByText('Chain')).toBeVisible()
  })

  test('navigate to Accuracy page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Accuracy' }).click()
    await expect(page).toHaveURL('/accuracy')
    await expect(page.locator('h1')).toContainText('Prediction Accuracy')
  })

  test('navigate to Chain page', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Chain' }).click()
    await expect(page).toHaveURL('/chain')
    await expect(page.getByText('Industry Chain')).toBeVisible()
  })

  test('navigate to Backtest page', async ({ page }) => {
    await page.goto('/')
    await page.click('nav a[href="/backtest"]')
    await expect(page).toHaveURL('/backtest')
    // Backtest page fetches static JSON; may show loading state if files are missing
    const heading = page.getByText('Backtest Results')
    const loading = page.getByText('Loading backtest data')
    const error = page.getByText('Failed to load backtest data')
    await expect(heading.or(loading).or(error).first()).toBeVisible()
  })

  test('navigate back to Dashboard', async ({ page }) => {
    await page.goto('/accuracy')
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/')
  })

  test('no console errors on page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/')
    // Allow time for lazy-loaded components
    await page.waitForTimeout(2000)
    expect(errors).toEqual([])
  })
})
