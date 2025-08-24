/**
 * NEKOMPLETNÍ 
 */
import { logger } from '../../../support/logger';
import { Page, expect } from '@playwright/test';
import { baseURL } from '../../../support/constants';
import { test } from '../../../support/fixtures/auth_FE.fixture';

/**
 * Pomocná funkce pro zapouzdření opakujícího se procesu vytváření sestavy.
 * @param page - Instance Playwright stránky.
 * @param reportId - ID sestavy k výběru (např. 'D001').
 * @param configureSteps - Asynchronní funkce obsahující unikátní kroky pro konfiguraci dané sestavy.
 */

/*
async function createReportWorkflow(
  page: Page,
  reportId: string,
  configureSteps: (page: Page) => Promise<void>
) {
  async function startReportCreation(page: Page, reportId: string) {
  logger.info(`Zahajuji vytváření sestavy typu: ${reportId}`);
  
  logger.trace(`Vybírám typ sestavy '${reportId}' z comboboxu.`);
  await page.getByRole('navigation').filter({ hasText: 'Typ sestavy Vyberte ze' }).getByRole('combobox').selectOption(reportId);

  logger.trace("Klikám na tlačítko 'Přidat'.");
  await page.getByRole('button', { name: '󱇬 Přidat' }).click();

  logger.trace("Klikám na první tlačítko 'Následující krok'.");
  await page.getByRole('button', { name: 'Následující krok 󰅂' }).click();
}


//Dokončí proces kliknutím na "Vytvořit sestavu" a ověří úspěch.
/*
async function finishReportCreation(page: Page) {
  logger.info("Dokončuji vytváření sestavy.");
  
  const createButton = page.getByRole('button', { name: 'Vytvořit sestavu' });
  await expect(createButton).toBeVisible(); // Stabilizační bod
  
  logger.trace("Klikám na finální tlačítko 'Vytvořit sestavu'.");
  await createButton.click();

  logger.info("Ověřuji zobrazení notifikace o úspěšném vytvoření.");
  await expect(page.locator('.toast-success, #notifikace-uspechu')).toBeVisible();
}
}

test.describe.serial('E2E testy pro generování uživatelských sestav', () => {

  // Společná příprava pro všechny testy v této sadě
  test.beforeEach(async ({ page }) => {
    logger.info(`Naviguji na základní URL: ${baseURL}`);
    await page.goto(baseURL);

    logger.debug("Klikám na odkaz 'Sestavy'.");
    await page.getByText('Sestavy', { exact: true }).click();

    logger.debug("Klikám na odkaz 'Uživatelské sestavy'.");
    await page.getByRole('link', { name: 'Uživatelské sestavy' }).click();
  });


  test('Vytvoření sestavy D001 - Přehled prodejů', async ({ page }) => {
    try {
        await createReportWorkflow(page, 'D001', async (page) => {
            logger.debug("Konfiguruji sestavu D001: Hledám a klikám na všechny řádky 'Výběr položky'.");

            const itemRows = page.getByRole('row', { name: 'Výběr položky' });
            
            for (const row of await itemRows.all()) {
                logger.trace("Klikám na prvek pro výběr ('span' nebo 'label') uvnitř řádku.");
                const clickableElement = row.locator('span').first().or(row.locator('label').first());
                await clickableElement.click();
            }
        });
    } catch (error) {
        logger.error(`Test na vytvoření sestavy D001 selhal: ${error.message}`);
        throw error;
         }
    });

  test('Vytvoření sestavy D002 - Přehled skladových pohybů', async ({ page }) => {
    try {
      // Pro sestavu D002 nejsou žádné další kroky potřeba
      await createReportWorkflow(page, 'D002', async () => {
        logger.debug('Sestava D002 nevyžaduje další specifickou konfiguraci.');
      });
    } catch (error) {
      logger.error(`Test na vytvoření sestavy D002 selhal: ${error.message}`);
      throw error;
    }
  });

  test('Vytvoření sestavy D003 - Přehled inventur', async ({ page }) => {
    try {
      await createReportWorkflow(page, 'D003', async (page) => {
        logger.debug('Konfiguruji specifické parametry pro sestavu D003.');
        
        // !!! VAROVÁNÍ: Nestabilní lokátor
        await page.locator('[id="5691-content"]').getByRole('combobox').selectOption('1');
        
        logger.trace("Odebírám všechny předvybrané položky.");
        await page.getByRole('row', { name: '󰅘 Odeber vše' }).locator('a').click();
        
        logger.trace("Vybírám první dostupnou položku.");
        await page.getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
      });
    } catch (error) {
      logger.error(`Test na vytvoření sestavy D003 selhal: ${error.message}`);
      throw error;
    }
  });
  
  test('Vytvoření sestavy D004 - Přehled platebních karet', async ({ page }) => {
    try {
      await createReportWorkflow(page, 'D004', async (page) => {
        logger.debug('Konfiguruji specifické parametry pro sestavu D004.');

        // !!! VAROVÁNÍ: Nestabilní lokátory
        await page.locator('[id="6269-content"]').getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
        await page.locator('[id="6287-content"]').getByRole('row', { name: 'Výběr položky' }).locator('label').click();
        await page.locator('[id="6491-content"]').getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
        
        logger.debug("Vyplňuji pole 'Prodejní cena od' hodnotou 100.");
        await page.getByPlaceholder('Prodejní cena od').fill('100');
      });
    } catch (error) {
      logger.error(`Test na vytvoření sestavy D004 selhal: ${error.message}`);
      throw error;
    }
  });

    test('Vytvoření sestavy D005 - Přehled skladových karet', async ({ page }) => {
        try {
        await createReportWorkflow(page, 'D005', async (page) => {
            logger.debug('Konfiguruji specifické parametry pro sestavu D005.');
    
            // !!! VAROVÁNÍ: Nestabilní lokátory
            await page.getByRole('row', { name: '󰅘 Odeber vše' }).locator('a').click();
            await page.getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
            await page.getByRole('button', { name: 'Vytvořit sestavu' }).click();
        });
        } catch (error) {
        logger.error(`Test na vytvoření sestavy D005 selhal: ${error.message}`);
        throw error;
        }
    });


  test('Vytvoření sestavy T003 - Přehled fleetových karet', async ({ page }) => {
    try {
      await createReportWorkflow(page, 'T003', async (page) => {
        logger.debug('Konfiguruji specifické parametry pro sestavu T003.');
        
        logger.trace("Odebírám všechny předvybrané položky.");
        await page.getByRole('row', { name: '󰅘 Odeber vše' }).locator('a').click();

        // !!! VAROVÁNÍ: Nestabilní lokátory
        await page.locator('[id="14907-content"]').getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
        await page.locator('[id="14923-content"]').getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
        
        logger.trace("Přepínám na záložku 'Držitel fleetových karet'.");
        await page.getByRole('tabpanel', { name: 'Držitel fleetových karet' }).locator('span').first().click();
        
        // !!! VAROVÁNÍ: Nestabilní lokátor
        await page.locator('[id="15145-content"]').getByRole('row', { name: 'Výběr položky' }).locator('span').first().click();
      });
    } catch (error) {
      logger.error(`Test na vytvoření sestavy T003 selhal: ${error.message}`);
      throw error;
    }
  });

});*/