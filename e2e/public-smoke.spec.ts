import { expect, test } from '@playwright/test';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
test('public site and login load without browser errors', async ({ page }: { page: any }) => {
  const errors: string[] = [];
  page.on('pageerror', (error: Error) => errors.push(error.message));

  await page.goto('/');
  await expect(page).toHaveTitle(/Officia MENA/i);
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /Google/i })).toBeVisible();
  expect(errors).toEqual([]);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
test('dashboard is protected for anonymous visitors', async ({ page }: { page: any }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});
