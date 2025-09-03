/**
 * @file Skladove_Karty_Filtry_Regrese_API.spec.ts
 * @author Marek Novák
 * @date 03.09.2025
 *
 * @description
 * Regresní API testy pro endpoint `getListOfStockCards`.
 * Cílem je ověřit, že všechny podporované filtry správně omezují vrácenou datovou sadu.
 * Testy jsou data-driven, přičemž testovací vektory jsou definovány v externím JSON souboru.
 *
 * @logic
 * Skript iteruje pole testovacích případů `allFilterCases`. Každý objekt v poli reprezentuje
 * jeden samostatný test, který je definován filtrem (`filter`) a sadou ověřovacích pravidel (`verification`).
 *
 * @preconditions
 * - Pro spuštění je nutné mít platný autentizační token, který se získává přihlášením.
 * - Konstanta `ACC_OWNER_ID` musí být správně nastavena.
 *
 * @tags @regression, @StockCards, @API
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { ApiClient, ListOfStockCardsPayload } from '../../../../support/ApiClient';
import { logger } from '../../../../support/logger';
import allFilterCasesData from '../../../../test-data/Skladove_Karty_Filtry_Regrese.json';
import { ACC_OWNER_ID } from '../../../../support/constants';

interface VerificationRule {
    key: string;
    condition: 'toBe' | 'toBeGreaterThan' | 'not.toBeNull';
    value?: any;
}

interface FilterTestCase {
    testCaseId: string;
    name: string;
    filter: ListOfStockCardsPayload;
    verification: VerificationRule[];
}

// OPRAVA 1: Použití typového tvrzení `as` k vyřešení konfliktu typů
const allFilterCases = allFilterCasesData as FilterTestCase[];

/**
 * Pomocná funkce pro získání hodnoty z vnořeného objektu pomocí tečkové notace.
 * @param obj Objekt, ve kterém se má hledat.
 * @param path Cesta k vlastnosti, např. "supplier.id".
 * @returns Hodnota vlastnosti nebo undefined.
 */
const resolveNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((prev, curr) => prev?.[curr], obj);
};

test.describe('Testy filtrů skladových karet @regression @StockCards @API', () => {
    
    let apiClient: ApiClient;
    const stockId = 1;

    test.beforeAll(async ({ page }) => {
        logger.info(`Spouštím sadu testů pro filtry skladových karet.`);
        await page.goto('/');
        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Autentizační token nebyl nalezen.').toBeTruthy();
        apiClient = new ApiClient(page.request, token!);
    });

    for (const testCase of allFilterCases) {
        
        test(`${testCase.testCaseId}: Filtrování podle '${testCase.name}'`, async () => {
            
            logger.info(`Spouštím test pro filtr: ${JSON.stringify(testCase.filter)}`);
            
            const response = await apiClient.getListOfStockCards(ACC_OWNER_ID, stockId, testCase.filter);

            expect(Array.isArray(response)).toBe(true);
            
            // OPRAVA 2: Přesunutí vlastní chybové zprávy na správné místo
            expect(response.length, `Pro filtr '${testCase.name}' nebyly nalezeny žádné skladové karty.`).toBeGreaterThan(0);
            
            logger.info(`Nalezeno ${response.length} skladových karet.`);

            logger.trace(`Ověřuji každou z ${response.length} položek...`);
            for (const item of response) {
                for (const rule of testCase.verification) {
                    const actualValue = resolveNestedValue(item, rule.key);
                    const expectation = expect(actualValue, `Chyba u karty [${item.name}] pro pravidlo [${rule.key}]`);

                    switch (rule.condition) {
                        case 'toBe':
                            expectation.toBe(rule.value);
                            break;
                        case 'toBeGreaterThan':
                            expectation.toBeGreaterThan(rule.value as number);
                            break;
                        case 'not.toBeNull':
                            expectation.not.toBeNull();
                            break;
                        default:
                            throw new Error(`Neznámá ověřovací podmínka: '${rule.condition}'`);
                    }
                }
            }
            logger.info(`Všech ${response.length} položek úspěšně prošlo ověřením pro filtr '${testCase.name}'.`);
        });
    }
});