import { test as base, Locator, expect } from '@playwright/test';
import { SmartFinder } from '../../ai-core/smart-finder';
import { logger } from '../logger';
// Importujeme konstanty pro přihlášení
import { baseURL, username, passwordOne, ACC_OWNER_ID } from '../constants';

// Definice typu pro naši fixturu
type AiFixture = {
    ai: (key: string, description: string) => Promise<Locator>;
    aiPage: SmartFinder;
    login: () => Promise<void>; // <--- NOVÁ FUNKCE
};

export const aiTest = base.extend<AiFixture>({
    
    // 1. Inicializace SmartFinderu
    aiPage: async ({ page }, use, testInfo) => {
        const safeTestName = testInfo.titlePath.join('_').replace(/[^a-zA-Z0-9]/g, '_');
        logger.debug(`[AiFixture] Inicializuji SmartFinder pro test: ${safeTestName}`);
        const finder = new SmartFinder(page, safeTestName);
        await use(finder);
    },

    // 2. Helper funkce 'ai()'
    ai: async ({ page, aiPage }, use) => {
        const aiHelper = async (key: string, description: string): Promise<Locator> => {
            // Logger přesunut do SmartFinderu, zde jen voláme
            const selector = await aiPage.find(key, description);
            return page.locator(selector);
        };
        await use(aiHelper);
    },

    // 3. NOVINKA: Helper funkce 'login()'
    // Tato funkce využívá 'ai' a 'page', které si Playwright sám injektuje
    login: async ({ page, ai }, use) => {
        
        const loginAction = async () => {
            logger.info('SPUŠTĚNA AUTOMATICKÁ PŘIHLAŠOVACÍ SEKVEDNCE');
            
            const targetUrl = `${baseURL}/login`;
            await page.goto(targetUrl);

            // Čekání na networkidle
            try {
                await page.waitForLoadState('networkidle', { timeout: 8000 });
            } catch (e) { /* Ignorujeme timeout při načítání */ }

            // --- A) VYPLNĚNÍ ÚDAJŮ ---
            const usernameInput = await ai('cbos-login-username', 'Input pole pro uživatelské jméno');
            await expect(usernameInput).toBeVisible();
            await usernameInput.fill(username);

            const passwordInput = await ai('cbos-login-password', 'Input pole pro heslo');
            await passwordInput.fill(passwordOne);

            const loginBtn = await ai('cbos-login-submit-btn', 'Tlačítko pro odeslání přihlášení (Login, Vstoupit)');
            await loginBtn.click();

            // --- B) ŘEŠENÍ VÝBĚRU SÍTĚ (Robustní logika) ---
            logger.debug('[Login] Čekám na případný výběr sítě...');
            await page.waitForTimeout(1000); 

            try {
                // Hledáme tlačítko Potvrdit s krátkým timeoutem
                const confirmBtn = await ai('network-confirm-btn', 'Tlačítko pro potvrzení výběru sítě (Potvrdit).');
                
                if (await confirmBtn.isVisible({ timeout: 4000 })) {
                    logger.info('[Login] Detekován mezikrok výběru sítě.');
                    
                    // Pokus o výběr v comboboxu
                    try {
                        const networkCombo = await ai('network-combobox', 'Combobox pro výběr vlastníka sítě.');
                        if (await networkCombo.isVisible()) {
                            logger.info(`[Login] Vybírám síť ID: ${ACC_OWNER_ID}`);
                            await networkCombo.selectOption(ACC_OWNER_ID);
                        }
                    } catch (e) {
                        logger.warn('[Login] Nepodařilo se vybrat hodnotu v comboboxu, pokračuji s defaultní.');
                    }

                    await confirmBtn.click();
                    await page.waitForLoadState('networkidle', { timeout: 15000 });
                }
            } catch (e) {
                // Pokud AI nenašlo tlačítko, znamená to, že jsme rovnou v aplikaci (což je OK)
                if (e instanceof Error && e.message.includes('AI nedokázalo najít')) {
                    logger.debug('[Login] Výběr sítě nevyžadován (element nenalezen).');
                } else {
                    logger.error('[Login] Chyba při výběru sítě:', e);
                }
            }

            // --- C) KONTROLA VÝSLEDKU ---
            if (page.url().includes('login')) {
                logger.error('[Login] Přihlášení se nezdařilo (jsme stále na login URL).');
                throw new Error('Login failed: Still on login page.');
            } else {
                logger.info(`[Login] Úspěšně přihlášeno. URL: ${page.url()}`);
            }
        };

        // Zpřístupníme funkci testu
        await use(loginAction);
    }
});

export { expect };