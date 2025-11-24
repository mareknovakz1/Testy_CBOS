import { Page } from '@playwright/test';
import { getAIService } from './llm-service';
import { getCleanHTML } from './dom-cleaner';
import { LocatorStore } from './locator-store';
// Import tvého loggeru - předpokládám pojmenovaný export, případně uprav podle reality
import { logger } from '../support/logger'; 

export class SmartFinder {
    private page: Page;
    private store: LocatorStore;
    private aiService = getAIService(); // Gemini

    constructor(page: Page, testInfoTitle: string) {
        this.page = page;
        this.store = new LocatorStore(testInfoTitle);
    }

    /**
     * Hlavní metoda: Najde element, nebo ho opraví pomocí AI.
     * @param key Unikátní klíč (např. "login-btn")
     * @param description Popis pro AI (např. "Modré tlačítko Přihlásit")
     */
    async find(key: string, description: string): Promise<string> {
        logger.debug(`[SmartFinder] Start hledání pro klíč: "${key}"`);
        
        // Jaké hodnoty nám přišly
        logger.trace(`[SmartFinder] Hledám element podle popisu: "${description}"`);
        let selector = this.store.get(key);

        if (selector) {
            logger.trace(`[SmartFinder] V paměti nalezen selektor: "${selector}"`);

            try {
                logger.silly(`[SmartFinder] Ověřuji existenci selektoru "${selector}" v DOM...`);
                
                // Playwright check s krátkým timeoutem
                await this.page.waitForSelector(selector, { timeout: 2000, state: 'attached' });
                logger.info(`[SmartFinder] Cache Hit: Selektor "${selector}" je stále platný.`);
                return selector;

            } catch (e) {

                logger.warn(`[SmartFinder] Selektor "${selector}" selhal (nenalezen/timeout). Spouštím Self-healing.`);
            }
        } else {
            logger.info(`[SmartFinder] Nový, neznámý element "${key}". Iniciuji AI identifikaci.`);
        }

        logger.debug(`[SmartFinder] Stahuji a čistím HTML stránky...`);
        const htmlSnippet = await getCleanHTML(this.page);

        logger.silly(`[SmartFinder] Odesílám do AI HTML snippet (délka: ${htmlSnippet.length} znaků). Náhled: ${htmlSnippet.substring(0, 200)}...`);
        logger.debug(`[SmartFinder] Odesílám request na Gemini API...`);
        const newSelector = await this.aiService.findSelector(htmlSnippet, description);

        if (!newSelector) {
            logger.error(`[SmartFinder] AI selhalo. Nedokázalo najít selektor pro: "${description}"`);
            throw new Error(`AI nedokázalo najít element: ${description}.`);
        }

        logger.trace(`[SmartFinder] AI navrhlo kandidáta: "${newSelector}"`);

        try {
            logger.silly(`[SmartFinder] Validuji AI selektor na živé stránce...`);
            await this.page.waitForSelector(newSelector, { timeout: 5000 });
            logger.info(`[SmartFinder] AI úspěšně našlo a ověřilo nový selektor: "${newSelector}"`);

        } catch (e) {
            logger.error(`[SmartFinder] AI Hallucination! Selektor "${newSelector}" na stránce neexistuje.`);
            throw new Error(`AI vymyslelo selektor "${newSelector}", ale ten na stránce není.`);
        }

        //Uložení lokátoru
        this.store.save(key, newSelector, description);
        logger.debug(`[SmartFinder] Nový selektor uložen do locator-store.`);

        return newSelector;
    }
}