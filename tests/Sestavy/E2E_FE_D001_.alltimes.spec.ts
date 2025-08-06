import { test, expect } from '../../support/fixtures/auth_FE.fixture';
import { logger } from '../../support/logger';
import { DashboardPage } from '../../support/pages/Dashboard';
import { SestavyPage } from '../../support/pages/SestavyPage';
// 1. Přidán import pro novou třídu SestavyObdobi
import { SestavyObdobi } from '../../support/pages/SestavyObdobi'; 

test.describe('E2E: Test pomocných funkcí pro navigaci a nastavení sestav', () => {

    test('ověří výběr sestavy a nastavení všech typů období', async ({ page }) => {
        
        logger.debug('Spouštím test pro ověření pomocných funkcí navigace a nastavení období.');

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

        logger.info('ÚSPĚCH: Navigace a přidání sestavy proběhlo v pořádku.');
        logger.info('--- Zahajuji testování výběru období ---');

        // 2. Inicializace třídy pro práci s obdobím
        const periodPage = new SestavyObdobi(page);

        // --- TEST 1: Výběr období 'Rozsah' ---
        const periodRozsah = '01.07.2025 - 31.08.2025';
        logger.debug(`Testuji výběr období typu 'Rozsah' s hodnotou: ${periodRozsah}`);
        await periodPage.select('Rozsah', periodRozsah);
        // Ověření, že se vstupní pole správně vyplnila
        await expect(page.getByLabel('Začátek období')).toHaveValue('01.07.2025');
        await expect(page.getByLabel('Konec období')).toHaveValue('31.08.2024');
        logger.info(`OK: Období 'Rozsah' bylo úspěšně nastaveno.`);
        await page.waitForTimeout(500); // Krátká pauza pro přehlednost při sledování testu

        // --- TEST 2: Výběr 'Přesného období' ---
        // Použijte přesný text tlačítka, které je v aplikaci
        const periodPresne = '2024'; 
        logger.debug(`Testuji výběr 'Přesného období' s hodnotou: ${periodPresne}`);
        await periodPage.select('Přesné období', periodPresne);
        // Ověření, že je dané tlačítko aktivní (pomocí atributu aria-pressed nebo specifické třídy)
        await expect(page.getByRole('button', { name: periodPresne, exact: true })).toHaveAttribute('aria-pressed', 'true');
        logger.info(`OK: 'Přesné období' bylo úspěšně nastaveno.`);
        await page.waitForTimeout(500);

        // --- TEST 3: Výběr 'Plovoucího období' ---
        // Použijte přesný text tlačítka, např. 'Minulý měsíc'
        const periodPlovouci = 'Minulý měsíc';
        logger.debug(`Testuji výběr 'Plovoucího období' s hodnotou: ${periodPlovouci}`);
        await periodPage.select('Plovoucí období', periodPlovouci);
        // Ověření, že je dané tlačítko aktivní
        await expect(page.getByRole('button', { name: periodPlovouci, exact: true })).toHaveAttribute('aria-pressed', 'true');
        logger.info(`OK: 'Plovoucí období' bylo úspěšně nastaveno.`);
        
        logger.info('--- VŠECHNY TESTY OBDOBÍ BYLY ÚSPĚŠNĚ PROVEDENY ---');
    });
});