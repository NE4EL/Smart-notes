import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('login page opens and shows main controls', async ({ page }) => {
  await page.goto('/login')

  await expect(page).toHaveTitle('Умные заметки')
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Пароль')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Войти' })).toBeVisible()
})

test('registration link opens registration page', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Создать аккаунт' }).click()

  await expect(page).toHaveURL('/register')
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible()
})

test('mobile page has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/login')

  const sizes = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
  }))

  expect(sizes.pageWidth).toBeLessThanOrEqual(sizes.viewportWidth)
})

test('login page has no serious accessibility errors', async ({ page }) => {
  await page.goto('/login')

  const results = await new AxeBuilder({ page }).analyze()
  const seriousErrors = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )

  expect(seriousErrors).toEqual([])
})
