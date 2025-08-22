/**
 * Tento skript slouží pouze pro ověření samotného přihlašovacího fixture
 * a základního nastavení testovacího prostředí.
 */

//Test pro přihlášení přes token
/*import {test, expect} from '../../support/fixtures/auth.fixture';

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
});*/

//Test pro přihlášení přes UI

import { test, expect } from '../../support/fixtures/auth.fixture';
import { logger } from '../../support/logger';

test.describe('Test přihlášení přes UI', () => {
    test('po spuštění fixtury je uživatel přihlášen', async ({ page }) => {
        logger.info('Test: Ověřuji stav po automatickém přihlášení přes UI fixture.');

        // 1. Ověříme, že URL adresa již není na kořenové/přihlašovací stránce
        await expect(page).not.toHaveURL('/');

        // 2. Ověříme přítomnost klíčového prvku, na který fixtura čekala
        const heading = page.getByRole('heading', { name: 'Sestavy' });
        await expect(heading).toBeVisible();

        logger.info('ÚSPĚCH: Fixtura pro UI přihlášení funguje správně.');
    });
});