import { test } from '../../../support/fixtures/auth.fixture';
import { logger } from '../../../support/logger';
import { verifyColumnSorting } from '../../../support/sorting.helper';
import { baseURL } from '../../../support/constants';
import { ApiClient } from '../../../support/ApiClient';

// --- NOVÉ: Mapování názvů sloupců na klíče z API ---
// Upravte klíče ('number', 'name', atd.) podle reálné struktury odpovědi z API
const columnNameApiMap = {
    'Číslo': 'number',
    'Název': 'name',
    'Ulice': 'street',
    'Město': 'city',
    'PSČ': 'zip',
    'Skladové karty': 'stockCardCount', // Příklady, upravte dle reality
    'Provozovatel ČS': 'operatorName',
    'Operátor': 'operator'
};

test.describe('Sortování obchodních míst proti API', () => {

    // Vytvoříme instanci ApiClient, která bude dostupná ve všech testech
    let apiClient: ApiClient;

    test.beforeAll(async ({ playwright }) => {
        // Inicializace ApiClienta - potřebuje vlastní request context
        const requestContext = await playwright.request.newContext();
        apiClient = new ApiClient(requestContext);
    });
    
    test.beforeEach(async ({ page }) => {
        // Navigace na stránce zůstává stejná
        logger.info('Spouštím přípravnou fázi testu (beforeEach).');
        await page.goto(baseURL);
        await page.getByText('Sklad', { exact: true }).click();
        await page.getByRole('link', { name: 'Obchodní místa', exact: true }).click();
    });

    const columnsToTest = [
        { name: 'Číslo', type: 'number' as const },
        { name: 'Název', type: 'string' as const },
        // ... a další sloupce
    ];

    for (const column of columnsToTest) {
        test(`Ověření sortování pro sloupec: ${column.name}`, async ({ page }) => {
            const apiKey = columnNameApiMap[column.name];
            if (!apiKey) {
                throw new Error(`Pro sloupec '${column.name}' neexistuje mapování na API klíč.`);
            }

            // --- KROK 1: Získání dat z API ---
            logger.info(`Získávám data z API pro sloupec '${column.name}'...`);
            // Upravte IDčka podle potřeby
            const accOwnerId = 60193531;
            const stockId = 101;
            const apiResponse = await apiClient.getListOfStockCards(accOwnerId, stockId, {
                columns: Object.values(columnNameApiMap), // Požádáme o všechny mapované sloupce
                limit: 100 // Ujistěte se, že načtete všechna data
            });

            // Získáme pole hodnot jen pro testovaný sloupec
            const dataFromApi = apiResponse.map(item => String(item[apiKey]).trim());
            logger.silly(`Data z API pro sloupec '${apiKey}':`, { data: dataFromApi });
            
            // --- KROK 2: Volání helperu s daty z API ---
            await verifyColumnSorting(page, column.name, dataFromApi, column.type);
        });
    }
});