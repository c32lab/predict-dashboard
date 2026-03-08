import { test, expect } from '@playwright/test'

test.describe('Responsive Layout - Mobile (375x667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('shows hamburger menu, hides desktop nav', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const hamburger = page.getByTestId('hamburger-btn')
    await expect(hamburger).toBeVisible()
    const desktopNav = page.getByTestId('desktop-nav')
    await expect(desktopNav).toBeHidden()
  })

  test('hamburger toggles mobile menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('hamburger-btn').click()
    const mobileMenu = page.getByTestId('mobile-menu')
    await expect(mobileMenu).toBeVisible()
    await expect(mobileMenu.getByText('Dashboard')).toBeVisible()
    await expect(mobileMenu.getByText('Accuracy')).toBeVisible()
    await expect(mobileMenu.getByText('Chain')).toBeVisible()
    await expect(mobileMenu.getByText('Backtest')).toBeVisible()
    await expect(mobileMenu.getByText('Quality')).toBeVisible()
    await expect(mobileMenu.getByText('Decay')).toBeVisible()
  })

  test('mobile menu closes on link click', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByTestId('hamburger-btn').click()
    await page.getByTestId('mobile-menu').getByText('Accuracy').click()
    await expect(page).toHaveURL('/accuracy')
    await expect(page.getByTestId('hamburger-btn')).toBeVisible()
    await expect(page.getByTestId('mobile-menu')).toHaveCount(0)
  })

  test('pages render without horizontal overflow', async ({ page }) => {
    for (const path of ['/', '/accuracy', '/chain', '/quality', '/decay']) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1)
    }
  })
})

test.describe('Responsive Layout - Tablet (768x1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test('shows desktop nav at md breakpoint', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const desktopNav = page.getByTestId('desktop-nav')
    await expect(desktopNav).toBeVisible()
    await expect(desktopNav.getByText('Dashboard')).toBeVisible()
  })

  test('hamburger is hidden', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('hamburger-btn')).toBeHidden()
  })
})

test.describe('Responsive Layout - Desktop (1280x720)', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test('full nav visible with all links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const nav = page.getByTestId('desktop-nav')
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Dashboard')).toBeVisible()
    await expect(nav.getByText('Accuracy')).toBeVisible()
    await expect(nav.getByText('Chain')).toBeVisible()
    await expect(nav.getByText('Backtest')).toBeVisible()
    await expect(nav.getByText('Quality')).toBeVisible()
    await expect(nav.getByText('Decay')).toBeVisible()
  })

  test('hamburger is not visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.getByTestId('hamburger-btn')).toBeHidden()
  })
})
