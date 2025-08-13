import { logger } from '../../../support/logger';
import { Page, expect } from '@playwright/test';
import { baseURL } from '../../../support/constants';
import { test } from '../../../support/fixtures/auth_FE.fixture';

test.describe('Komplexní filtrace v sestavách', () => {

  // Tento test předpokládá, že fixture vás přihlásí a beforeEach vás dostane na správnou stránku s filtry.
  // Pokud ne, je potřeba doplnit navigační kroky do beforeEach.
  test.beforeEach(async ({ page }) => {
    logger.info('Spouštím přípravnou fázi testu (beforeEach).');
    await page.goto(baseURL); // Upravte URL na konkrétní stránku s filtry, pokud je to potřeba
    // await page.getByRole('link', { name: 'Sestavy' }).click(); // Příklad navigačního kroku
  });

  test('Ověření filtrování s více parametry a zobrazení výsledků', async ({ page }) => {
    try {
      logger.info('Zahajuji test komplexního filtrování.');
      
      logger.debug("Klikám na doklady");
      await page.getByText('Doklady', { exact: true }).click();
      logger.debug("Klikám na účtenky");
      await page.getByRole('link', { name: 'Účtenky' }).click();


      logger.debug('Vybírám všechny možnosti v checkboxových sekcích.');
      await page.getByLabel('Typ účtenky').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
      logger.debug('Vybírám všechny možnosti v sekci "Způsob platby".');
      await page.getByLabel('Způsob platby').getByRole('row', { name: 'Vyber vše' }).locator('label').click();
      logger.debug('Vybírám všechny možnosti v sekci "Vydavatel karty".');
      await page.getByLabel('Vydavatel karty').locator('thead').getByRole('cell').filter({ hasText: /^$/ }).click();
      logger.debug('Vybírám všechny možnosti v sekci "Centrální skupina zboží".');
      await page.getByLabel('Centrální skupina zboží').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
      logger.debug('Vybírám všechny možnosti v sekci "Centrální kategorie zboží".');
      await page.getByLabel('Cent. kategorie zboží').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();
      logger.debug('Vybírám všechny možnosti v sekci "Způsob platby".');
      await page.getByLabel('Operátor').getByRole('row', { name: 'Vyber vše' }).locator('span').first().click();

      logger.debug('Vyplňuji Číslo účtenky od.');
      await page.locator('.control.has-icons-right > .input').first().fill('0');
      logger.debug('Vyplňuji číslo účtenky do.');
      await page.locator('div:nth-child(2) > .field > div > .control > .input').first().fill('1000000');
      logger.debug('Vyplňuji Celkovou částku účtenky.');
      await page.locator('.columns.is-multiline.is-desktop > div > .field > div > .control > .input').first().fill('0');
      logger.debug('Vyplňuji Částku jedné položky.');
      await page.locator('.columns.is-multiline.is-desktop > div:nth-child(2) > .field > div > .control > .input').first().fill('500000');

      logger.trace("Klikám na tlačítko 'Zobrazit'.");
      await page.getByRole('button', { name: '󰓦 Zobrazit' }).click();

      logger.info('Ověřuji, že se po aplikaci filtrů zobrazila tabulka s výsledky.');
      const resultsTable = page.locator('#results-container, .results-table'); // Příklad lokátoru
      await expect(resultsTable).toBeVisible({ timeout: 15000 }); // Zvýšený timeout pro případ delšího načítání

      logger.info('Test komplexního filtrování byl úspěšně dokončen.');

    } catch (error) {
      logger.error(`Test komplexního filtrování selhal: ${error.message}`);
      throw error;
    }
  });
});