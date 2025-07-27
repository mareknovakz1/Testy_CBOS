import { type Page, type Locator, expect } from '@playwright/test';
import { logger } from '../logger';

export class SestavyPage {
    readonly page: Page;
    readonly reportTypeSelect: Locator;
    readonly addButton: Locator;

    constructor(page: Page) {
        this.page = page;

        this.reportTypeSelect = page.locator('div.control.is-5-select select');
        this.addButton = page.getByRole('button', { name: 'Přidat' });
    }

    /**
     * Vybere zadaný typ sestavy z <select> elementu a klikne na tlačítko "Přidat".
     * @param reportName Název sestavy, jak je uveden ve <option> (např. "D001 - Přehled prodejů")
     */
    async selectAndAddReport(reportName: string) {
        logger.debug(`Krok 2: Vybírám možnost "${reportName}".`);

        // Pokud je label správně připojený k <select>, preferuj getByLabel – jinak používej přímo this.reportTypeSelect
        await this.reportTypeSelect.selectOption({ label: reportName });

        logger.debug(`Krok 3: Klikám na tlačítko "Přidat".`);
        await this.addButton.click();

        await expect(this.page.getByText('Přidání uživatelské sestavy')).toBeVisible();
        logger.info(`Úspěšně vybrána sestava "${reportName}" a spuštěn průvodce.`);
    }
}
