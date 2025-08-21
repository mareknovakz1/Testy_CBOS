import { Page, expect } from '@playwright/test';
import { logger } from './logger';

/**
 * Klikne na záhlaví sloupce a spolehlivě počká na dokončení akce.
 */
async function clickHeaderAndWait(page: Page, columnName: string) {
    logger.silly(`Klikám na záhlaví '${columnName}' a čekám na ustálení stránky...`);
    await page.locator('thead').getByRole('cell', { name: columnName, exact: true }).click({ timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(200);
    logger.silly('Stránka je ustálená, pokračuji v testu.');
}

/**
 * Získá pozici (index) sloupce na základě textu jeho záhlaví.
 */
async function getColumnIndex(page: Page, columnName: string): Promise<number> {
    logger.trace(`Získávám index pro sloupec '${columnName}'...`);
    const headers = await page.locator('thead th').all();
    for (let i = 0; i < headers.length; i++) {
        const headerText = await headers[i].textContent();
        if (headerText?.trim() === columnName) {
            logger.silly(`Nalezen index ${i + 1} pro sloupec '${columnName}'.`);
            return i + 1; // nth-child v CSS je 1-based
        }
    }
    throw new Error(`Sloupec s názvem '${columnName}' nebyl v záhlaví tabulky nalezen.`);
}

/**
 * Získá a vyčistí data z daného sloupce.
 */
async function getColumnData(page: Page, cellLocator: any): Promise<string[]> {
    logger.trace('Získávám a čistím data ze sloupce zobrazeného v UI...');
    const rawTexts = await cellLocator.allInnerTexts();
    // Odfiltrujeme všechny řetězce, které neobsahují písmena nebo čísla
    return rawTexts
        .map(val => val.trim())
        .filter(val => /[a-zA-Z0-9]/.test(val));
}

/**
 * Převede český formát data na porovnatelný objekt Date.
 * @param dateString Datum ve formátu "DD.MM.YYYY HH:mm".
 */
function parseCzechDate(dateString: string): Date {
    const parts = dateString.match(/(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return new Date(0); // Vrať neplatné datum, pokud formát nesedí
    // Měsíce v JavaScriptu jsou 0-indexované (0=leden), proto parts[2] - 1
    return new Date(Number(parts[3]), Number(parts[2]) - 1, Number(parts[1]), Number(parts[4]), Number(parts[5]));
}

/**
 * Ověří funkčnost třídění sloupce porovnáním dat z UI proti datům z API.
 * Provede JEDEN klik a zkontroluje, zda je výsledek správně seřazen.
 */
export async function verifyColumnSorting(
    page: Page,
    columnName: string,
    expectedDataFromApi: string[],
    dataType: 'string' | 'number' | 'date' = 'string'
) {
    try {
        logger.info(`--- Zahajuji test třídění pro sloupec '${columnName}' (typ: ${dataType}) proti API ---`);

        const columnIndex = await getColumnIndex(page, columnName);
        const cellLocator = page.locator(`tbody tr td:nth-child(${columnIndex})`);
        
        const uniqueApiValues = new Set(expectedDataFromApi);
        if (uniqueApiValues.size <= 1) {
            logger.warn(`Nelze ověřit třídění pro '${columnName}', API vrátilo pouze jednu unikátní hodnotu.`);
            return;
        }

        // --- PROVEDEME KLIK V UI ---
        logger.trace(`Provádím klik na '${columnName}'...`);
        await clickHeaderAndWait(page, columnName);
        
        const sortedValuesFromUi = await getColumnData(page, cellLocator);
        logger.silly(`[${columnName}] Vyčištěná data z UI po kliku:`, { data: sortedValuesFromUi });

        // --- PŘIPRAVÍME OČEKÁVANÉ POŘADÍ Z DAT Z API ---
        const expectedAsc = [...expectedDataFromApi].sort((a, b) => {
            if (dataType === 'number') return parseFloat(a.replace(/ /g, '')) - parseFloat(b.replace(/ /g, ''));
            if (dataType === 'date') return parseCzechDate(a).getTime() - parseCzechDate(b).getTime();
            return a.toLowerCase().localeCompare(b.toLowerCase(), 'cs', { numeric: true });
        });
        
        const expectedDesc = [...expectedDataFromApi].sort((a, b) => {
            if (dataType === 'number') return parseFloat(b.replace(/ /g, '')) - parseFloat(a.replace(/ /g, ''));
            if (dataType === 'date') return parseCzechDate(b).getTime() - parseCzechDate(a).getTime();
            return b.toLowerCase().localeCompare(a.toLowerCase(), 'cs', { numeric: true });
        });

        // --- ZKONTROLUJEME, ZDA SE UI SHODUJE S NĚKTEROU Z VARIANT Z API ---
        const receivedStr = JSON.stringify(sortedValuesFromUi);
        const expectedAscStr = JSON.stringify(expectedAsc);
        const expectedDescStr = JSON.stringify(expectedDesc);

        if (receivedStr === expectedAscStr) {
            logger.info(`✔ Data na UI odpovídají VZESTUPNĚ seřazeným datům z API.`);
        } else if (receivedStr === expectedDescStr) {
            logger.info(`✔ Data na UI odpovídají SESTUPNĚ seřazeným datům z API.`);
        } else {
            const errorMessage = `CHYBA: Data na UI ve sloupci '${columnName}' neodpovídají datům z API!`;
            logger.error(errorMessage, {
                'Data zobrazená na UI': sortedValuesFromUi,
                'Očekávaná (sestupně z API)': expectedDesc,
                'Očekávaná (vzestupně z API)': expectedAsc
            });
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        logger.error(`Došlo k obecné chybě při ověřování třídění pro sloupec '${columnName}': ${error.message}`);
        throw error;
    }
}