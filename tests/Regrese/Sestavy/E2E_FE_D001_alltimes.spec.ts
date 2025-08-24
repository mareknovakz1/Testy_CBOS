import { logger } from '../../../support/logger';
import { Page } from '@playwright/test';
import { baseURL } from '../../../support/constants';
import { test, expect } from '../../../support/fixtures/auth_FE.fixture'; 

/**
 * Vytvoří novou sestavu pro zadané plovoucí období.
 * @param page - Objekt stránky z Playwrightu.
 * @param nazevObdobi - Název období, který se má vybrat (např. 'Druhé čtvrtletí').
 * @returns Vrací `true` v případě úspěchu, `false` v případě chyby.
 */
export async function CreateReportFloatPeriod(page: Page, nazevObdobi: string): Promise<boolean> {
  // INFO: Hlavní milník - Oznamuje, co se chystáme dělat a s jakými daty.
  logger.info(`Zahajuji vytváření sestavy pro období: '${nazevObdobi}'`);

  try {
    logger.debug('Klikám na tlačítko "Přidat" pro vytvoření nové sestavy');
    await page.getByRole('button', { name: '󱇬 Přidat' }).click();

    logger.trace("Otevírám dialog pro výběr období.");
    await page.locator('label').filter({ hasText: 'Plovoucí období: Období, kter' }).locator('span').first().click();

    logger.debug(`Vybírám zadané období: '${nazevObdobi}'.`);
    await page.getByRole('button', { name: nazevObdobi }).click();

    logger.trace("Klikám na tlačítko 'Následující krok'.");
    await page.getByRole('button', { name: 'Následující krok 󰅂' }).click();

    logger.trace("Klikám podruhé na tlačítko 'Následující krok'.");
    await page.getByRole('button', { name: 'Následující krok 󰅂' }).click();

    logger.trace("Klikám na finální tlačítko 'Vytvořit sestavu'.");
    await page.getByRole('button', { name: 'Vytvořit sestavu' }).click();

    logger.info(`Požadavek na vytvoření sestavy pro období '${nazevObdobi}' byl úspěšně odeslán.`);
    return true;

  } catch (error) {
    logger.error(`Došlo k chybě při vytváření sestavy pro období '${nazevObdobi}': ${error}`);
    return false;
  }
}
// Seznam plovoucích období, která budou testována
const Periods = ['Aktuální týden',
                'Druhé čtvrtletí', 
                'Třetí čtvrtletí', 
                'Čtvrté čtvrtletí', 
                'První čtvrtletí',  
                'Předchozí 2 týdny', 
                'Aktuální měsíc', 
                'Předchozí 3 měsíce',
                'minulý měsíc',
                'minulý týden'];

test.describe.serial('E2E testy pro sestavu D001 s plovoucím obdobím', () => {
    test.beforeEach(async ({ page }) => {
    logger.info('Spouštím test E2E_FE_D001_.alltimes.spec.ts');  
    logger.trace('Naviguji na přihlašovací stránku a přihlašuji se');
    await page.goto(baseURL);


    //Vybrání sestav
    logger.info('Přihlášení úspěšné, čekám na načtení stránky');
    logger.debug('KLikám na tlačítko "Sestavy" v navigaci');
    await page.getByText('Sestavy', { exact: true }).click();
    logger.debug('Klikám na "Uživatelské sestavy" v navigaci');
    await page.getByRole('link', { name: 'Uživatelské sestavy' }).click();
    logger.debug('Vybírám typ sestavy D001 z rozbalovacího menu');
    await page.getByRole('navigation').filter({ hasText: 'Typ sestavy Vyberte ze' }).getByRole('combobox').selectOption('D001');

    logger.info('Sestava D001 byla úspěšně vybrána, pokračuji k vytvoření sestavy');
    });

    for (const period of Periods) {

        test(`Vytvoření sestavy pro období: '${period}'`, async ({ page }) => {
            logger.info(`Zahajuji test pro vytvoření sestavy pro období: '${period}'`);

            // Zavoláme funkci pro vytvoření sestavy.
            // Použijeme try...catch pro odchycení a zalogování případné chyby.
            try {
                const success = await CreateReportFloatPeriod(page, period);

                // Pro ověření výsledku použijeme `expect` místo `test.fail`.
                // Je to čistší způsob, jak nechat test selhat s jasnou zprávou.
                expect(success, `Vytvoření sestavy pro období '${period}' selhalo.`).toBe(true);
                
                logger.info(`Sestava D001 pro období '${period}' byla úspěšně vytvořena.`);

            } catch (error) {
                logger.error(`Došlo k neočekávané chybě při testování období '${period}'`, error);
                // Znovu vyhodíme chybu, aby byl test správně označen jako neúspěšný.
                throw error;
            }    
        });
    }
});