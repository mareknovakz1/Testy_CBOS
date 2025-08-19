import { Page, Locator, expect } from '@playwright/test';
import { logger } from './logger';

/**
 * Klikne na lokátor a souběžně čeká na odpověď z API a na zmizení spinneru.
 * @param page - Instance stránky z Playwright.
 * @param locatorToClick - Lokátor, na který se má kliknout.
 */
async function clickAndwaitForTableUpdate(page: Page, locatorToClick: Locator) {
  // Čekej souběžně na odpověď z API a proveď kliknutí
  await Promise.all([
    page.waitForResponse(
      response => 
        // ZDE UPRAV URL PODLE VAŠÍ APLIKACE!
        response.url().includes('/api/obchodni-mista/') && response.status() === 200, 
      { timeout: 15000 }
    ),
    locatorToClick.click()
  ]);

  // Pro jistotu ještě počkej na zmizení jakéhokoliv spinneru
  await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 10000 });
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

    // --- Vzestupné třídění (první klik) ---
    logger.trace(`Klikám na hlavičku '${columnName}' pro vzestupné seřazení.`);
    await headerLocator.click();
    await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 15000 });

    const processedValuesAsc = (await getSortedValues(cellLocator, initialValues[0])).slice(0, 10);
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


    // --- Sestupné třídění (druhý klik) ---
    logger.trace(`Klikám na hlavičku '${columnName}' pro sestupné seřazení.`);
    await headerLocator.click();
    await expect(page.locator('.spinner, .loading-overlay')).not.toBeVisible({ timeout: 15000 });

    const processedValuesDesc = (await getSortedValues(cellLocator, processedValuesAsc[0])).slice(0, 10);
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

  } catch (error: any) {
    logger.error(`Došlo k chybě při ověřování třídění pro sloupec '${columnName}': ${error.message}`);
    throw error;
  }
}