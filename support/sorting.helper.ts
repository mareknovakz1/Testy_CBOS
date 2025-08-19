import { Page, expect } from '@playwright/test';
import { logger } from './logger';

// Tato funkce už nepotřebuje `locatorToClick` jako argument
async function clickHeaderAndWait(page: Page, columnName: string) {
    logger.silly(`Klikám na záhlaví '${columnName}' a čekám na ustálení stránky...`);
    // Najdeme lokátor znovu, těsně před kliknutím
    await page.locator('thead').getByRole('cell', { name: columnName, exact: true }).click({ timeout: 10000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    await page.waitForTimeout(200);
    logger.silly('Stránka je ustálená, pokračuji v testu.');
}

async function getColumnIndex(page: Page, columnName: string): Promise<number> {
    const headers = await page.locator('thead th').all();
    for (let i = 0; i < headers.length; i++) {
        const headerText = await headers[i].textContent();
        if (headerText?.trim() === columnName) {
            return i + 1;
        }
    }
    throw new Error(`Sloupec s názvem '${columnName}' nebyl v záhlaví tabulky nalezen.`);
}

/**
 * Získá a vyčistí data z daného sloupce.
 */
async function getColumnData(page: Page, cellLocator: any): Promise<string[]> {
    const rawTexts = await cellLocator.allInnerTexts();
    // Odfiltrujeme prázdné řetězce a očistíme data
    return rawTexts.map(val => val.trim()).filter(val => val !== '');
}

export async function verifyColumnSorting(
    page: Page,
    columnName: string,
    dataType: 'string' | 'number' = 'string'
) {
    try {
        logger.info(`--- Zahajuji dynamický test třídění pro sloupec: ${columnName} ---`);

        const columnIndex = await getColumnIndex(page, columnName);
        const cellLocator = page.locator(`tbody tr td:nth-child(${columnIndex})`);

        const initialValues = await getColumnData(page, cellLocator);
        // Upravená kontrola pro případ, kdy má sloupec jen jednu unikátní hodnotu
        const uniqueValues = new Set(initialValues);
        if (uniqueValues.size <= 1) {
            logger.warn(`Nelze spolehlivě ověřit třídění pro sloupec '${columnName}', protože obsahuje pouze jednu unikátní hodnotu.`);
            return;
        }

        // --- PRVNÍ KLIK ---
        logger.trace(`Provádím první klik na '${columnName}'...`);
        await clickHeaderAndWait(page, columnName);
        const valuesAfterFirstClick = await getColumnData(page, cellLocator);
        logger.silly(`[${columnName}] Data po PRVNÍM kliku:`, { data: valuesAfterFirstClick });

        const expectedAsc = [...valuesAfterFirstClick].sort((a, b) => {
            if (dataType === 'number') return parseFloat(a.replace(/ /g, '')) - parseFloat(b.replace(/ /g, ''));
            return a.localeCompare(b, 'cs', { numeric: true });
        });
        const expectedDesc = [...valuesAfterFirstClick].sort((a, b) => {
            if (dataType === 'number') return parseFloat(b.replace(/ /g, '')) - parseFloat(a.replace(/ /g, ''));
            return b.localeCompare(a, 'cs', { numeric: true });
        });

        let firstClickDirection: 'asc' | 'desc';
        // Porovnáváme spojené řetězce, abychom ignorovali pořadí duplikátů
        if (valuesAfterFirstClick.join('') === expectedDesc.join('')) {
            firstClickDirection = 'desc';
            logger.info(`✔ Detekováno SESTUPNÉ řazení po prvním kliku pro '${columnName}'.`);
        } else if (valuesAfterFirstClick.join('') === expectedAsc.join('')) {
            firstClickDirection = 'asc';
            logger.info(`✔ Detekováno VZESTUPNÉ řazení po prvním kliku pro '${columnName}'.`);
        } else {
            const errorMessage = `CHYBA PŘI PRVNÍM KLIKU na '${columnName}'!`;
            logger.error(errorMessage, {
                'Přijatá data': valuesAfterFirstClick,
                'Očekávaná sestupně': expectedDesc
            });
            throw new Error(errorMessage);
        }

        // --- DRUHÝ KLIK ---
        logger.trace(`Provádím druhý klik na '${columnName}'...`);
        await clickHeaderAndWait(page, columnName);
        const valuesAfterSecondClick = await getColumnData(page, cellLocator);
        logger.silly(`[${columnName}] Data po DRUHÉM kliku:`, { data: valuesAfterSecondClick });

        if (firstClickDirection === 'desc') {
            expect(valuesAfterSecondClick.join(''), `Očekáváno vzestupné řazení.`).toEqual(expectedAsc.join(''));
            logger.info(`✔ Třídění vzestupně pro '${columnName}' po druhém kliku je v pořádku.`);
        } else {
            expect(valuesAfterSecondClick.join(''), `Očekáváno sestupné řazení.`).toEqual(expectedDesc.join(''));
            logger.info(`✔ Třídění sestupně pro '${columnName}' po druhém kliku je v pořádku.`);
        }

    } catch (error: any) {
        logger.error(`Došlo k obecné chybě při ověřování třídění pro sloupec '${columnName}': ${error.message}`);
        throw error;
    }
}