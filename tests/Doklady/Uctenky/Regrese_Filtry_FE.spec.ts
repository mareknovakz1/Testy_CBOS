import { logger } from '../../../support/logger';
import { Page, expect } from '@playwright/test';
import { baseURL } from '../../../support/constants';
import { test } from '../../../support/fixtures/auth_FE.fixture';

/**
 * Pomocná funkce pro aplikaci filtrů a ověření výsledků.
 * @param page - instance Playwright Page
 */
async function applyFiltersAndCheckResults(page: Page) {
    logger.debug("Klikám na tlačítko 'Zobrazit'.");
    await page.getByRole('button', { name: '󰓦 Zobrazit' }).click();

    logger.info('Ověřuji, že se po aplikaci filtrů zobrazila tabulka s výsledky.');
    const recordCountElement = page.getByText(/^Počet záznamů:/);
    const recordCountText = await recordCountElement.innerText();
    logger.info(`Nalezený text v UI: "${recordCountText}"`);
     
    //Návrat na Nastavení filtrů
    logger.debug('Vracím se na Nastavení filtrů');
    await page.getByRole('tab', { name: 'Nastavení filtrů' }).click();
    logger.info('Test filtrování podle typu účtenky byl úspěšný.');
}


test.describe('Filtrace v sestavě Účtenky', () => {

    // Tato část se spustí před každým testem v tomto bloku.
    test.beforeEach(async ({ page }) => {
        logger.info('Spouštím přípravnou fázi testu (beforeEach).');
        await page.goto(baseURL);
        
        logger.debug("Naviguji na stránku 'Účtenky'.");
        await page.getByText('Doklady', { exact: true }).click();
        await page.getByRole('link', { name: 'Účtenky' }).click();
    });

    test('Filtrování podle jednoho kritéria (Typ účtenky)', async ({ page }) => {
        logger.info('Zahajuji test filtrování podle typu účtenky.');
        await page.getByLabel('Typ účtenky').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
        await applyFiltersAndCheckResults(page);    
    });

    test('Filtrování podle číselného rozsahu a částky', async ({ page }) => {
        logger.info('Zahajuji test filtrování podle číselných hodnot.');

        logger.debug('Vyplňuji Číslo účtenky od-do.');
        await page.locator('.control.has-icons-right > .input').first().fill('0');
        await page.locator('div:nth-child(2) > .field > div > .control > .input').first().fill('1000000');
        
        logger.debug('Vyplňuji Celkovou částku účtenky.');
        await page.locator('.columns.is-multiline.is-desktop > div > .field > div > .control > .input').first().fill('0');

        await applyFiltersAndCheckResults(page);
        logger.info('Test filtrování podle číselných hodnot byl úspěšný.');
    });

    test('Komplexní filtrace s více parametry a zobrazení výsledků', async ({ page }) => {
        try {
            logger.info('Zahajuji test komplexního filtrování.');
            
            logger.debug('Vybírám všechny možnosti v checkboxových sekcích.');
            await page.getByLabel('Typ účtenky').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
            await page.getByLabel('Způsob platby').getByRole('row', { name: 'Vyber vše' }).locator('label').click();
            await page.getByLabel('Vydavatel karty').locator('thead').getByRole('cell').filter({ hasText: /^$/ }).click();
            await page.getByLabel('Centrální skupina zboží').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
            await page.getByLabel('Cent. kategorie zboží').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
            await page.getByLabel('Operátor').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();

            logger.debug('Vyplňuji číselné filtry.');
            await page.locator('.control.has-icons-right > .input').first().fill('0');
            await page.locator('div:nth-child(2) > .field > div > .control > .input').first().fill('1000000');
            await page.locator('.columns.is-multiline.is-desktop > div > .field > div > .control > .input').first().fill('0');
            await page.locator('.columns.is-multiline.is-desktop > div:nth-child(2) > .field > div > .control > .input').first().fill('500000');

            await applyFiltersAndCheckResults(page);

            logger.info('Test komplexního filtrování byl úspěšně dokončen.');

        } catch (error) {
            logger.error(`Test komplexního filtrování selhal: ${error.message}`);
            throw error;
        }
    });
});