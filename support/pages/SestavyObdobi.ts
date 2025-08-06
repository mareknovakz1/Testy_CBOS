/*
* Class pro zadání období při tvorbě nebo editaci sestav
* Class předpokládá otevřenou sestavu na 1. kroku úpravy nebo vytváření
* Všechny vstupy nejsou validní pro všechny sestavy
*/
import { type Page, expect } from '@playwright/test';
import { logger } from '../logger';

export class SestavyObdobi {

    // 'page' je nyní privátní a pouze pro čtení, přístupná v celé třídě přes 'this.page'
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

/* @param Period
* Rozsah DD.MM.YYYY - DD.MM.YYYY
* Přesné období string YYYY.MM.DD
* Plovoucí období q1,q2,q3,q4, actualWeek, lastWeek, last2Weeks, actualMonth, lastMonth, last3Months
*/
    async select(choosenPeriod: 'Rozsah' | 'Přesné období' | 'Plovoucí období', period: string) {

        logger.trace('Je radiobutton aktivní?');
        const radioLocator = this.page.getByRole('radio', { name: choosenPeriod });
        const isAlreadyChecked = await radioLocator.isChecked();

        if (!isAlreadyChecked) {
            logger.trace(`Volba '${choosenPeriod}' není aktivní, provádím kliknutí.`);
            await this.page.getByText(choosenPeriod, { exact: true }).click();
        }

        try {
            switch (choosenPeriod) {
                case 'Rozsah': {
                    logger.debug(`Vybrán typ období 'Rozsah' s periodou: ${period}`);
                    
                     //Rozdělení periody na začátek a konec
                    logger.trace("Rozdělení a validace rozsahu na začátek a konec");
                    const parts = period.split(' - ');
                    if (parts.length !== 2 || !parts[0] || !parts[1]) {
                        throw new Error(`Neplatný formát periody pro Rozsah: "${period}". Očekávaný formát je "DD.MM.YYYY - DD.MM.YYYY".`);
                    }
                    const [beginDate, endDate] = parts;
                    logger.silly(`Zadaný rozsah: OD ${beginDate}, DO ${endDate}`);
                    
                    //Otevření kalendáře pro zadání rozsahu
                    logger.trace("Vybírám typ období 'Rozsah'");
                    await this.page.getByText('Rozsah', { exact: true }).click();
                    logger.trace("Otevírám kalendář pro 'Začátek období'");
                    await this.page.locator('div.field').filter({ hasText: 'Začátek období' }).getByRole('textbox').click();

                    //Otevření konce období
                    //logger.trace("Čekám na viditelnost pole pro zadání konce období");
                    //const konecInput = this.page.getByLabel('textbox').nth(2).locator('input'); 

                    logger.trace("Čekám na viditelnost polí pro zadání data...");
                    //await expect(zacatekInput).toBeVisible();
                    //await expect(konecInput).toBeVisible();

                    logger.trace(`Datumy k vyplnění: OD ${beginDate}, DO ${endDate}`);

                    if (!beginDate || !endDate) {
                        throw new Error(`Neplatný formát periody pro Rozsah: "${period}". Očekávaný formát je "DD.MM.YYYY - DD.MM.YYYY".`);
                    }
                }

                case 'Přesné období': {
                    logger.info(`Vybrán typ období 'Přesné období' s periodou: ${period}`);
                    
                    logger.trace("Kliknutí na volbu 'Přesné období'");
                    await this.page.getByText(choosenPeriod, { exact: true }).click();
                    
                    logger.trace(`Výběr konkrétního období: ${period}`);
                    // Používáme getByRole pro lepší sémantiku a robustnost
                    await this.page.getByRole('button', { name: period, exact: true }).click();
                    break;
                }

                case 'Plovoucí období': {
                    logger.info(`Vybrán typ období 'Plovoucí období' s periodou: ${period}`);

                    logger.trace("Kliknutí na volbu 'Plovoucí období'");
                    await this.page.getByText(choosenPeriod, { exact: true }).click();
                    
                    logger.trace(`Výběr konkrétního plovoucího období: ${period}`);
                    await this.page.getByRole('button', { name: period, exact: true }).click();
                    break;
                }

                default: {
                    // Pokud je zadán neplatný typ období, logujeme chybu a vyhodíme výjimku, aby test selhal
                    const errorMessage = `Není zadaný validní typ období: '${choosenPeriod}'`;
                    logger.error(errorMessage);
                    throw new Error(errorMessage);
                }
            }
        } catch (error) {
            logger.error(`Nastala chyba při výběru období: ${error}`);
            throw error;
        }
    }
}