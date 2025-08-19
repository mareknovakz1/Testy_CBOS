import { test as base, expect, Page } from '@playwright/test';
import { logger } from '../logger';
import { nameOne as username, passwordOne, baseURL } from '../constants';
import {name }

type MyAuthFixtures = {
    page: Page;
};

export const test = base.extend<MyAuthFixtures>({
    page: async ({ page }, use) => {
        logger.trace('Fixture: Spouštím přihlášení přes UI...');
        logger.info(`Připojuji na: ${baseURL} uživatele ${username}`);
        
        await page.goto('/');
        await page.locator('input[type="text"]').fill(username);
        await page.locator('input[type="password"]').fill(passwordOne);
        await page.getByRole('button', { name: 'Log in' }).click();
        logger.trace('Fixture: Proveden první krok přihlášení.');
        
        const networkSelect = page.locator('select#account');

         await Promise.race([
            // Událost 1: Čekání na viditelnost výběru sítě
            expect(networkSelect).toBeVisible({ timeout: 3000 }),
            
            // Událost 2: Čekání na změnu URL na Dashboard
            expect(page).toHaveURL(baseURL, { timeout: 10000 })
        ]);
        
        
        // Počkáme krátce, zda se objeví výběr sítě
       if (await networkSelect.isVisible()) {
            
            // --- ZDE JE KLÍČOVÁ ZMĚNA ---
            // Přidáme krátkou pauzu, abychom dali aplikaci čas na případné přesměrování
            logger.trace('Fixture: Detekován výběr sítě, čekám 1 sekundu pro stabilizaci...');
            await page.waitForTimeout(1000); // 1 sekunda

            // Po pauze se znovu zeptáme, jestli je výběr sítě stále viditelný
            if (await networkSelect.isVisible()) {
                logger.trace('Fixture: Výběr sítě je stále viditelný, provádím výběr.');
                await networkSelect.selectOption({ label: 'ČEPRO, a.s.' });
                await page.getByRole('button', { name: 'Potvrdit' }).click();
            } else {
                logger.trace('Fixture: Výběr sítě mezitím zmizel (automatické přihlášení), pokračuji.');
            }
        }
        // Finální ověření, že jsme se úspěšně dostali na cílovou stránku
        await expect(page).toHaveURL(baseURL, { timeout: 10000 });
        logger.trace('Fixture: Přihlášení úspěšně dokončeno.');
        
        await use(page);
    },
});

export { expect } from '@playwright/test';