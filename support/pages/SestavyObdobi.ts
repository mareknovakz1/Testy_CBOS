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

  
    /**
     * @param choosenPeriod Výběr typu období: 'Rozsah', 'Přesné období', 'Plovoucí období'
     * @param period Hodnota pro daný typ období:
     * - Rozsah: "DD.MM.YYYY - DD.MM.YYYY"
     * - Přesné období: např. "2023", "2024.01", "2024.Q1" (přesný text tlačítka)
     * - Plovoucí období: např. "Aktuální měsíc", "Minulý měsíc", "Poslední 3 měsíce" (přesný text tlačítka)
     */
    async select(choosenPeriod: 'Rozsah' | 'Přesné období' | 'Plovoucí období', period: string) {

        try {
            switch (choosenPeriod) {
                case 'Rozsah': {
                    logger.info(`Vybrán typ období 'Rozsah' s periodou: ${period}`);
                    
                    logger.trace("Kliknutí na volbu 'Rozsah'");
                    await this.page.getByLabel('Rozsah').click();

                    logger.trace(`Rozdělení periody '${period}' na začátek a konec`);
                    const [beginDate, endDate] = period.split(' - ');

                    // Pojistka pro případ, že formát periody je nesprávný
                    if (!beginDate || !endDate) {
                        throw new Error(`Neplatný formát periody pro Rozsah: "${period}". Očekávaný formát je "DD.MM.YYYY - DD.MM.YYYY".`);
                    }

                    logger.trace(`Začátek období: ${beginDate}, Konec období: ${endDate}`);

                    logger.trace('Vyplnění začátku období');
                    await this.page.getByLabel('Začátek období').fill(beginDate);

                    logger.trace('Vyplnění konce období');
                    await this.page.getByLabel('Konec období').fill(endDate);
                    break;
                }

                case 'Přesné období': {
                    logger.info(`Vybrán typ období 'Přesné období' s periodou: ${period}`);
                    
                    logger.trace("Kliknutí na volbu 'Přesné období'");
                    await this.page.getByLabel('Přesné období').click();

                    logger.trace(`Výběr konkrétního období: ${period}`);
                    // Používáme getByRole pro lepší sémantiku a robustnost
                    await this.page.getByRole('button', { name: period, exact: true }).click();
                    break;
                }

                case 'Plovoucí období': {
                    logger.info(`Vybrán typ období 'Plovoucí období' s periodou: ${period}`);

                    logger.trace("Kliknutí na volbu 'Plovoucí období'");
                    await this.page.getByLabel('Plovoucí období').click();
                    
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