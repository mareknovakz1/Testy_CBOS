import { type Page, expect } from '@playwright/test';
import { logger } from '../logger';

export class DashboardPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Najede myší na hlavní položku menu (<div>) a klikne na položku v podmenu.
     * @param menuItemText - Text hlavní položky menu, na kterou se má najet (např. 'Sestavy').
     * @param subMenuItemText - Text položky v podmenu, na kterou se má kliknout (např. 'Uživatelské sestavy').
     */
    async hoverAndClickInMenu(menuItemText: string, subMenuItemText: string) {
        logger.debug(`Provádím akci v menu: Hover na "${menuItemText}", Click na "${subMenuItemText}"`);

        // OPRAVA: Použijeme spolehlivý lokátor, který jste našel.
        // Hledá <div> se specifickými CSS třídami, který obsahuje daný text.
        const menuTrigger = this.page
            .locator('div.navbar-link.is-hoverable')
            .filter({ hasText: menuItemText });
        
        logger.trace(`Najíždím myší na "${menuItemText}"...`);
        await menuTrigger.hover();

        const subMenuItem = this.page.getByRole('link', { name: subMenuItemText });
        await expect(subMenuItem, `Položka menu "${subMenuItemText}" se nezobrazila po najetí myší.`).toBeVisible();
        logger.trace(`Položka "${subMenuItemText}" je viditelná.`);
        
        await subMenuItem.click();
        logger.info(`Úspěšně kliknuto na "${menuItemText}" -> "${subMenuItemText}".`);
    }
}