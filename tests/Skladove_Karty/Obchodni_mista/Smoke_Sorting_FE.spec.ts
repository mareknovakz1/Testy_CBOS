import { test } from '../../../support/fixtures/auth_FE.fixture';
import { logger } from '../../../support/logger';
import { verifyColumnSorting } from '../../../support/sorting.helper'; 
import { baseURL } from '../../../support/constants';

test.describe('Sortování obchodních míst', () => {

    // Tato přípravná fáze se spustí jednou před každým testem z cyklu níže.
    test.beforeEach(async ({ page }) => {
        logger.info('Spouštím přípravnou fázi testu (beforeEach).');
        await page.goto(baseURL); 
        await page.getByText('Sklad', { exact: true }).click();
        await page.getByRole('link', { name: 'Obchodní místa', exact: true }).click();
    });

    // Definice sloupců, které chceme testovat
    const columnsToTest = [
        { name: 'Číslo', type: 'number' as const },
        { name: 'Název', type: 'string' as const },
        { name: 'Ulice', type: 'string' as const },
        { name: 'Město', type: 'string' as const },
        { name: 'PSČ', type: 'number' as const },
        { name: 'Skladové karty', type: 'number' as const },
        { name: 'Provozovatel ČS', type: 'string' as const },
        { name: 'Operátor', type: 'string' as const }
    ];

    // Pro každý sloupec v konfiguraci se dynamicky vytvoří samostatný test
    for (const column of columnsToTest) {
        
        test(`Ověření sortování pro sloupec: ${column.name}`, async ({ page }) => {
            await verifyColumnSorting(page, column.name);
        });
    }
});