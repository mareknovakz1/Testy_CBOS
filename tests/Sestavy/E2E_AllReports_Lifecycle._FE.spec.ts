import { test, expect } from '../../support/fixtures/auth_FE.fixture';
import { logger } from '../../support/logger';
import { DashboardPage } from '../../support/pages/Dashboard';
import { SestavyPage } from '../../support/pages/SestavyPage';

test.describe('E2E: Test pomocných funkcí pro navigaci v sestavách', () => {

    test('ověří funkci pro výběr a přidání sestavy', async ({ page }) => {
        
        logger.debug('Spouštím test pro ověření pomocných funkcí navigace.');

        const dashboardPage = new DashboardPage(page);
        logger.trace("Volám metodu: dashboardPage.hoverAndClickInMenu('Sestavy', 'Uživatelské sestavy')");
        await dashboardPage.hoverAndClickInMenu('Sestavy', 'Uživatelské sestavy');

        logger.trace("Ověřuji URL, zda obsahuje '/reports'");
        await expect(page).toHaveURL(/.*\/reports/);
        
        logger.debug('Čekám na plné načtení tabulky se sestavami...');
        await expect(page.locator('table.table')).toBeVisible({ timeout: 10000 });
        logger.debug('Tabulka je viditelná, stránka je připravena.');

        const reportsPage = new SestavyPage(page);
        logger.trace("Volám metodu: reportsPage.selectAndAddReport('D001 - Přehled prodejů')");
        await reportsPage.selectAndAddReport('D001 - Přehled prodejů');

        logger.info('ÚSPĚCH: Obě pomocné metody byly úspěšně provedeny.');
    });
});