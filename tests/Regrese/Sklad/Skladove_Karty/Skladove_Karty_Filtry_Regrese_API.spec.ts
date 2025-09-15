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
import { ApiClient, ListOfStockCardsPayload } from '../../../../support/ApiClient.legacy';
import { logger } from '../../../../support/logger';
import allFilterCasesData from '../../../../test-data/Skladove_Karty_Filtry_Regrese.json';
import { ACC_OWNER_ID, baseURL } from '../../../../support/constants';

interface VerificationRule {
    key: string;
    condition: 'toBe' | 'toBeGreaterThan' | 'not.toBeNull';
    value?: any;
}

interface FilterTestCase {
    testCaseId: string;
    name: string;
    filter: ListOfStockCardsPayload;
    verification?: VerificationRule[];
}

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
    const stockId = 230;

    test.beforeEach(async ({ page }) => {
        logger.info(`Spouštím sadu testů pro filtry skladových karet.`);
        await page.goto('/');
        logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Autentizační token nebyl nalezen.').toBeTruthy();
        logger.trace('Autentizační token úspěšně získán.');
        apiClient = new ApiClient(page.request, token!);
        logger.trace('ApiClient byl inicializován.');
    });

    for (const testCase of allFilterCases) {
        
        test(`${testCase.testCaseId}: Filtrování podle '${testCase.name}'`, async () => {
            try {
    logger.info(`ZAHÁJEN TEST ${testCase.testCaseId}: Filtrování podle '${testCase.name}'`);
    logger.debug(`${baseURL}/stock-cards/v1/accounts/${ACC_OWNER_ID}/stocks/${stockId}/cards payload: ${JSON.stringify(testCase.filter, null, 2)}`);
    
    const response = await apiClient.getListOfStockCards(ACC_OWNER_ID, stockId, testCase.filter);
    
    expect(Array.isArray(response), `Odpověď API není pole pro filtr '${testCase.name}'.`).toBe(true);

    // TATO PODMÍNKA SLOUŽÍ JAKO "HLÍDAČ"
    // Kód uvnitř if se spustí, jen když 'verification' existuje a není prázdné
    if (testCase.verification && testCase.verification.length > 0) {
        
        // SCÉNÁŘ 1: Test case MÁ ověřovací pravidla
        
        logger.info(`Nalezeno ${response.length} skladových karet k ověření.`);
        expect(response.length, `Pro filtr '${testCase.name}' nebyly nalezeny žádné položky k ověření.`).toBeGreaterThan(0);

        logger.trace(`Zahajuji ověřování každé z ${response.length} nalezených položek...`);
        
        // Protože je tato smyčka uvnitř 'if', TypeScript ví, že 'testCase.verification' je zde vždy pole.
        for (const item of response) {
            for (const rule of testCase.verification) { 
                const actualValue = resolveNestedValue(item, rule.key);
                const expectation = expect(actualValue, `Chyba u karty ID [${item.id}], název [${item.name}] pro pravidlo [${rule.key}]`);

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
                        const errorMessage = `Neznámá ověřovací podmínka: '${rule.condition}' v test case '${testCase.testCaseId}'`;
                        logger.error(errorMessage); 
                        throw new Error(errorMessage);
                }
            }
        }
    } else {
        // SCÉNÁŘ 2: Test case NEMÁ ověřovací pravidla (např. TC-14)
        
        logger.info(`Test '${testCase.name}' nemá detailní pravidla, ověřuji pouze existenci dat v odpovědi.`);
        expect(response.length, `Odpověď pro filtr '${testCase.name}' je prázdná, ale očekávala se data.`).toBeGreaterThan(0);
        logger.info(`Nalezeno ${response.length} položek, což je pro tento test v pořádku.`);
    }

    logger.info(`TEST ${testCase.testCaseId} ÚSPĚŠNÝ: Ověření dokončeno.`);

} catch (error) {
    logger.error(`TEST ${testCase.testCaseId} SELHAL s chybou:`, error);
    throw error;
}
        });
    }
});