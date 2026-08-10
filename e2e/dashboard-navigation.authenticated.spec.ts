import { expect, test } from '@playwright/test';

const hasAuthState = Boolean(process.env.PLAYWRIGHT_AUTH_STATE);

test('Maestro can be left for every primary dashboard page without a client crash', async ({ page }) => {
  test.skip(!hasAuthState, 'PLAYWRIGHT_AUTH_STATE is required for authenticated navigation tests.');
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));

  const destinations = [
    '/dashboard/hr', '/dashboard/accounting', '/dashboard/approvals', '/dashboard/inventory',
    '/dashboard/invoices', '/dashboard/expenses', '/dashboard/bank', '/dashboard/taxes',
  ];

  for (const destination of destinations) {
    await page.goto('/dashboard/ai-maestro');
    await expect(page).toHaveURL(/\/dashboard\/ai-maestro$/);
    await page.locator(`a[href="${destination}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${destination.replaceAll('/', '\\/')}$`));
    await expect(page.getByText(/Application error/i)).toHaveCount(0);
  }

  expect(errors).toEqual([]);
});
