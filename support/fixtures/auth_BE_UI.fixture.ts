import { test as baseTest, expect, Page } from '@playwright/test';
import { logger } from '../logger';
import { nameOne as username, passwordOne, baseURL } from '../constants';
import { ApiClient } from '../ApiClient';

// Typ pro objekt, který bude naše hlavní fixtura vracet
type AuthContext = {
    page: Page;
    token: string;
};

// Typy pro všechny naše nové fixtures
type MyFixtures = {
    auth: AuthContext;
    apiClient: ApiClient;
};

export const test = baseTest.extend<MyFixtures>({
    /**
     * Hlavní fixtura pro autentizaci.
     * Provede přihlášení přes UI, odchytí token z API odpovědi a poskytne 
     * přihlášenou stránku a token v jednom objektu.
     */
    auth: async ({ page }, use) => {
        logger.trace("Fixture 'auth': Spouštím kombinované přihlášení...");

        // Souběžně čekáme na odpověď od autorizačního API
        const responsePromise = page.waitForResponse('**/auth-api/user/authorization', { timeout: 15000 });
        logger.trace("Nastaveno čekání na odpověď z endpointu /auth-api/user/authorization.");

        // Provedeme přihlášení přes UI
        logger.info(`Zahajuji přihlášení na: ${baseURL} pro uživatele ${username}`);
        await page.goto('/');
        await page.locator('input[type="text"]').fill(username);
        await page.locator('input[type="password"]').fill(passwordOne);
        await page.getByRole('button', { name: 'Log in' }).click();

        // Zpracujeme odchycenou odpověď z API
        logger.trace("Čekám na dokončení API požadavku na autorizaci...");
        const response = await responsePromise;
        const responseStatus = response.status();
        const responseJson = await response.json();
        
        // --- ZDE JE POŽADOVANÉ LOGOVÁNÍ ---
        logger.silly('Přijatá data z API (response body):', responseJson);
        logger.trace(`Odpověď z API přijata se statusem: ${responseStatus}`);

        if (!response.ok()) {
            logger.error(`Chyba při autorizaci! API vrátilo status ${responseStatus}.`, responseJson);
            throw new Error(`Nepodařilo se získat token, status: ${responseStatus}`);
        }

        const token = responseJson.accessToken;
        expect(token, "Bearer token nebyl nalezen v API odpovědi!").toBeTruthy();
        logger.trace("Bearer token úspěšně extrahován z odpovědi.");

        // Ošetření nedeterministického UI
        const dashboardElement = page.getByText('Sklad', { exact: true });
        try {
            await expect(dashboardElement).toBeVisible({ timeout: 15000 });
            logger.info("Uživatel byl úspěšně přihlášen a přesměrován na dashboard.");
        } catch (e) {
            logger.warn("Dashboard nebyl viditelný, zkouším vybrat síť...");
            const networkSelect = page.locator('select#account');
            await expect(networkSelect).toBeVisible({ timeout: 5000 });
            await networkSelect.selectOption({ label: 'ČEPRO, a.s.' });
            await page.getByRole('button', { name: 'Potvrdit' }).click();;
            await expect(dashboardElement).toBeVisible({ timeout: 10000 });
            logger.info("Výběr sítě byl úspěšný, uživatel je na dashboardu.");
        }

        // Předáme objekt s přihlášenou stránkou a tokenem
        logger.trace("Předávám přihlášený kontext (page, token) testu.");
        await use({ page, token });
    },

    apiClient: async ({ request, auth }, use) => {
        logger.trace("Spouštím 'apiClient' fixture...");
        const client = new ApiClient(request, auth.token);
        logger.trace('Instance ApiClient připravena a autorizována.');
        await use(client);
    }
});

export { expect };