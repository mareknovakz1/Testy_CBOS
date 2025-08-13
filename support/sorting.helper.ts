import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';

// Pomocná funkce pro načtení a očištění hodnot z buňky s čekáním na změnu
async function getSortedValues(cellLocator: Locator, oldFirstValue?: string) {
  if (oldFirstValue) {
    await expect(cellLocator.first()).not.toHaveText(oldFirstValue, { timeout: 5000 });
  }
  const values = await cellLocator.allInnerTexts();
  return values.map(val => val.trim());
}

export async function verifyColumnSorting(
  page: Page,
  columnName: string,
  cellSelector: string,
  dataType: 'string' | 'number' = 'string'
) {
  try {
    logger.info(`--- Zahajuji test třídění pro sloupec: ${columnName} ---`);

    // Správný locator pro hlavičku podle role
    const headerLocator = page.getByRole('cell', { name: columnName });
    const cellLocator = page.locator(cellSelector);

    // Načti počáteční hodnoty
    const initialValues = await cellLocator.allInnerTexts();
    if (initialValues.length <= 1) {
      const message = `Nelze ověřit třídění pro sloupec '${columnName}', protože tabulka obsahuje příliš málo dat (${initialValues.length} řádků).`;
      logger.fatal(message);
      throw new Error(message);
    }

    // --- Sestupné třídění ---
    logger.trace(`Klikám na hlavičku '${columnName}' pro sestupné seřazení.`);
    await headerLocator.click();
    await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 15000 });

    const processedValuesDesc = (await getSortedValues(cellLocator, initialValues[0])).slice(0, 10);
    logger.silly('Očištěná data (sestupně)', processedValuesDesc);

    const expectedSortedValuesDesc = [...processedValuesDesc].sort((a, b) => {
      if (dataType === 'number') {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numB - numA;
      }
      return b.localeCompare(a, 'cs');
    });
    logger.silly('Očekávané seřazené hodnoty (sestupně)', expectedSortedValuesDesc);
    expect(processedValuesDesc).toEqual(expectedSortedValuesDesc);
    logger.info(`✔ Třídění sestupně pro '${columnName}' je v pořádku.`);

    // --- Vzestupné třídění ---
    logger.trace(`Klikám na hlavičku '${columnName}' pro vzestupné seřazení.`);
    await headerLocator.click();
    await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 15000 });

    const processedValuesAsc = (await getSortedValues(cellLocator, processedValuesDesc[0])).slice(0, 10);
    logger.silly('Očištěná data (vzestupně)', processedValuesAsc);

    const expectedSortedValuesAsc = [...processedValuesAsc].sort((a, b) => {
      if (dataType === 'number') {
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numA - numB;
      }
      return a.localeCompare(b, 'cs');
    });
    logger.silly('Očekávané seřazené hodnoty (vzestupně)', expectedSortedValuesAsc);
    expect(processedValuesAsc).toEqual(expectedSortedValuesAsc);
    logger.info(`✔ Třídění vzestupně pro '${columnName}' je v pořádku.`);

  } catch (error: any) {
    logger.error(`Došlo k chybě při ověřování třídění pro sloupec '${columnName}': ${error.message}`);
    throw error;
  }
}
