// Důležitý je import z tvého souboru s fixturami
import { test } from '../../../support/fixtures/auth_BE_UI.fixture';
import { logger } from '../../../support/logger';
import { verifyColumnSorting } from '../../../support/sorting.helper';

// Mapování FE sloupců na BE klíče
const columnNameApiMap = {
    'Číslo': 'id',
    'Název': 'text',
    'Ulice': 'street',
    'Město': 'city',
    'PSČ': 'zip',
    'Provozovatel ČS': 'accOwnerName',
    'Poslední změny': 'updated',
    'Operátor': 'operator'
};

test.describe('Sortování Obchodních míst', () => {

    // beforeEach se postará o navigaci před každým testem
    test.beforeEach(async ({ auth }) => {
        logger.silly('Spouštím přípravnou fázi testu (beforeEach).');
        const { page } = auth; 

        logger.debug("Naviguji na stránku 'Obchodní místa'.");
        await page.getByText('Sklad', { exact: true }).click();
        await page.getByRole('link', { name: 'Obchodní místa', exact: true }).click();
        
        await page.waitForSelector('table', { state: 'visible', timeout: 10000 });
        logger.trace('Tabulka je viditelná, přípravná fáze dokončena.');
    });

    const columnsToTest = [
        { name: 'Číslo', type: 'number' as const },
        { name: 'Název', type: 'string' as const },
        { name: 'Ulice', type: 'string' as const },
        { name: 'Město', type: 'string' as const },
        { name: 'PSČ', type: 'number' as const },
        { name: 'Provozovatel ČS', type: 'string' as const },
        { name: 'Poslední změny', type: 'date' as const },
        { name: 'Operátor', type: 'string' as const }
    ];

    for (const column of columnsToTest) {
        test(`Ověření sortování pro sloupec: ${column.name}`, async ({ page, apiClient }) => {
            logger.info(`--- ZAHÁJENÍ TESTU PRO SLOUPEC: "${column.name}" ---`);
            
            const apiKey = columnNameApiMap[column.name];
            if (!apiKey) {
                throw new Error(`Pro sloupec '${column.name}' neexistuje mapování na API klíč.`);
            }
            
            const apiParams = {
                accOwner: '60193531',
                columns: Object.values(columnNameApiMap),
                limit: 500
            };

            const apiResponse = await apiClient.getListOfStocks(apiParams);
            logger.silly('Přijatá kompletní odpověď z API (getListOfStocks):', apiResponse);
            
            // --- OPRAVA ZDE ---
            // Voláme .map() přímo na `apiResponse`, protože API vrací pole.
            const dataFromApi = apiResponse.map(item => String(item[apiKey] ?? '').trim());
            logger.silly(`Zpracovaná data z API pro sloupec '${apiKey}':`, { data: dataFromApi });
            await verifyColumnSorting(page, column.name, dataFromApi, column.type);

            logger.info(`--- DOKONČENÍ TESTU PRO SLOUPEC: "${column.name}" ---`);
        });
    }
});