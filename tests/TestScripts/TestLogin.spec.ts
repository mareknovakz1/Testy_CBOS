/**
 * Tento skript slouží pouze pro ověření samotného přihlašovacího fixture
 * a základního nastavení testovacího prostředí.
 */

import {test, expect} from '../../support/fixtures/auth.fixture';

test.describe('Test přihlášení', () => {
     test('Ověření úspěšného přihlášení pomocí fixture', async ({ page }) => {
        await page.goto('/');
            const storedToken = await page.evaluate(() => {
      // Zde musí být stejný klíč, jaký používáte ve fixture ('auth_token').
      return window.localStorage.getItem('auth_token');
    });
    console.log(`Nalezený token v localStorage: ${storedToken}`);
    expect(storedToken).toBeTruthy();
    expect(typeof storedToken).toBe('string');
    expect(storedToken!.length).toBeGreaterThan(20); // Očekáváme, že token bude delší než 20 znaků.
  });
});