import { test, expect } from '../../../support/fixtures/auth_FE.fixture';
import { logger } from '../../../support/logger';
import { verifyColumnSorting } from '../../../support/sorting.helper';
import { sortingColumns } from '../../../test-data/ObchodniMista.json';


test.describe('Testování třídění v tabulce Obchodních míst', () => {

  test.beforeEach(async ({ page }) => {
    logger.info('Spouštím přípravnou fázi: navigace na Obchodní místa.');
    await page.getByText('Sklad', { exact: true }).click();
    await page.getByRole('link', { name: 'Obchodní místa', exact: true }).click();
    await expect(page.locator('.spinner, .loading-overlay')).toBeVisible();
    logger.info('Čekám 5s na načtení dat v tabulce')
    await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 5000 }); // Dáme tomu delší časový limit
    logger.info('Data byla načtena, pokračuji testem.');
  });

 test('Ověření správného třídění pro všechny sloupce definované v JSON', async ({ page }) => {
    try {
      logger.info(`Zahajuji testování třídění pro ${sortingColumns.length} sloupců.`);

      // Nyní procházíme pole, které je uvnitř JSON objektu
      for (const column of sortingColumns) {
        await verifyColumnSorting(
            page,
            column.name,
            column.cellSelector,
            column.type as 'string' | 'number' 
        );
      }  

      logger.info('Všechny testy třídění byly úspěšně dokončeny.');

    } catch (error) {
      logger.error(`Hlavní test třídění selhal: ${error.message}`);
      throw error;
    }
  });
});