import { expect, test } from '@playwright/test';

test('public site and login load without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Officia MENA/i);
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  expect(errors).toEqual([]);
});

test('dashboard is protected for anonymous visitors', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});
