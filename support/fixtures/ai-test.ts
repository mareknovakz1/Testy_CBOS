import { test as base, Locator, expect } from '@playwright/test';
import { SmartFinder } from '../../ai-core/smart-finder';
import { logger } from '../logger';

// Definice typu pro naši novou fixturu
// 'ai' bude funkce, která přijme klíč + popis a vrátí Playwright Locator
type AiFixture = {
    ai: (key: string, description: string) => Promise<Locator>;
    aiPage: SmartFinder; // Exportujeme i celou instanci, kdybychom potřebovali víc metod
};

// Rozšíříme základní 'test' objekt o naši 'ai' fixturu
export const aiTest = base.extend<AiFixture>({
    
    // 1. Inicializace SmartFinderu pro daný test
    aiPage: async ({ page }, use, testInfo) => {
        // Vytvoříme bezpečný název souboru pro JSON (např. "Smoke_Login_Test")
        const safeTestName = testInfo.titlePath.join('_').replace(/[^a-zA-Z0-9]/g, '_');
        
        logger.debug(`[AiFixture] Inicializuji SmartFinder pro test: ${safeTestName}`);
        
        const finder = new SmartFinder(page, safeTestName);
        await use(finder);
    },

    // 2. Helper funkce 'ai()', kterou budeme volat v testu
    ai: async ({ page, aiPage }, use) => {
        
        const aiHelper = async (key: string, description: string): Promise<Locator> => {
            //Záznam volání v testu
            logger.trace(`[AiFixture] Volání ai('${key}')`);

            // Získáme selektor (z cache nebo od Gemini)
            // (Logování "Hledám..." a "Cache hit..." řeší SmartFinder uvnitř)
            const selector = await aiPage.find(key, description);
            
            // Vrátíme standardní Playwright Locator
            return page.locator(selector);
        };

        await use(aiHelper);
    }
});

// Exportujeme 'expect' z původního balíčku, aby testy vypadaly standardně
export { expect };