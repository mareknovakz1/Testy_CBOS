import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';
import allReportsConfig from '../../../test-data/Sestavy_regrese-LifeCycle_API.json';

interface ReportConfig {
    dateType: 'dateRange' | 'exactDate' | 'rangeFromOnly';
    partnerId?: number[];
    stockIds?: number[];
}

interface ReportTestData {
    id: string;
    name: string;
    config: ReportConfig;
    testCaseId: string;
}

interface ApiUserReport {
    id: number | string;
    name: string;
    items: number | null;
    public: boolean;
}

const sentPublic: boolean = true; // Sestava je sdílená

test.describe('Cyklus pro všechny sestavy s dynamickým payloadem', () => {

    for (const report of (allReportsConfig as ReportTestData[])) {
        test(`${report.testCaseId}: Životní cyklus sestavy: ${report.name}, @regression @API @sestavy @high`, async ({ page }) => {
            let newReportDbId: number | string | undefined;
            try {
                // --- Blok pro autenitizaci
                logger.info(`Spouštím test životního cyklu pro sestavu: '${report.name}'`);
                await page.goto('/');
                logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
                const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                expect(token, 'Autentizační token nebyl nalezen v localStorage.').toBeTruthy();
                logger.trace('Autentizační token úspěšně získán.');
                
                const apiClient = new ApiClient(page.request, token!);
                logger.trace('ApiClient byl inicializován.');

                // --- KROK 2: SESTAVENÍ PAYLOADU ---
                const builder = new ReportBuilder(report.id, report.name);
                logger.trace(`Inicializuji ReportBuilder pro sestavu '${report.name}'.`);
                logger.trace(`Vytvářím sestavu '${report.name}' s konfigurací: ${JSON.stringify(report.config)}`);

                // Nastavení data podle konfigurace
                switch (report.config.dateType) {
                    case 'dateRange':
                        builder.withDateRange(new Date('2025-01-01'), new Date('2025-12-31'));
                        logger.debug(`Nastavuji časový rozsah (dateRange) pro sestavu '${report.name}'.`);
                        break;
                    case 'exactDate':
                        builder.withExactDate(new Date(2025, 6, 1)); // 1. červenec 2025
                        logger.debug(`Nastavuji přesné datum (exactDate) pro sestavu '${report.name}'.`);
                        break;
                    case 'rangeFromOnly':
                        builder.withDateRange(new Date(2025, 6, 1), null);
                        logger.debug(`Nastavuji časový rozsah od (rangeFromOnly) pro sestavu '${report.name}'.`);
                        break;
                }

                // Přidání speciálních filtrů podle konfigurace
                if (report.config.partnerId) {
                    builder.withPartnerFilter(report.config.partnerId);
                    logger.debug(`Přidávám partner filtr s ID: [${report.config.partnerId.join(', ')}] pro sestavu '${report.name}'.`);
                }
                if (report.config.stockIds) {
                    builder.withStockFilter(report.config.stockIds);
                    logger.debug(`Přidávám skladový filtr s ID: [${report.config.stockIds.join(', ')}] pro sestavu '${report.name}'.`);
                }

                // Sestavení finálního payloadu
                const reportPayload = builder.build();
                reportPayload.public = sentPublic;
                logger.debug(`Nastavuji příznak 'public' na '${sentPublic}' pro sestavu '${report.name}'.`);
                logger.silly(`Finální payload pro vytvoření sestavy '${report.name}': ${JSON.stringify(reportPayload)}`);
                
                // --- KROK 3: VYTVOŘENÍ A OVĚŘENÍ SESTAVY ---
                await apiClient.createUserReport('60193531', reportPayload);
                logger.trace(`Požadavek na vytvoření sestavy '${report.name}' odeslán.`);

                const allReports: ApiUserReport[] = await apiClient.getListOfUsersReports('60193531');
                logger.trace('Získávám seznam všech uživatelských sestav pro ověření.');
                const createdReport = allReports.find((r: ApiUserReport) => r.name === report.name);
                
                if (createdReport) {
                    logger.info(`Sestava '${report.name}' byla úspěšně vytvořena s ID: ${createdReport.id}.`);
                    newReportDbId = createdReport.id;
                    logger.silly(`Response vytvořené sestavy: ${JSON.stringify(createdReport)}`);
                    const itemsCount = createdReport.items;
                    const isPublic = createdReport.public;

                    // Kontrola, že items není null
                    logger.trace(`Ověřuji, že počet položek (items) v sestavě '${report.name}' není null.`);
                    expect(itemsCount, `CHYBA: Sestava '${report.name}' selhala při generování na serveru (items je null).`).not.toBeNull();

                    if (itemsCount === 0) {
                        const errorMessage = `Počet objektů pro sestavu '${report.name}' je '${itemsCount}'. Může se jednat o chybu, nebo jen nedostatek dat.`;
                        logger.warn(errorMessage);
                    } else {
                        logger.info(`Vytvořená sestava '${report.name}' (ID: ${newReportDbId}) obsahuje ${itemsCount} položek.`);
                    }
                    
                    logger.trace(`Ověřuji, že sestava '${report.name}' je správně označena jako sdílená.`);
                    expect(isPublic, `Sestava '${report.name}' měla být sdílená, ale není!`).toBe(true);
                    logger.info(`Ověření příznaku sdílení pro sestavu "${report.name}" je v pořádku.`);

                } else {
                    const errorMessage = `Nově vytvořená sestava '${report.name}' nebyla nalezena v seznamu všech sestav.`;
                    logger.error(errorMessage);
                    test.fail(true, errorMessage);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě během životního cyklu sestavy '${report.name}'.`, error);
                throw error; // Znovu vyhodíme chybu, aby Playwright test správně označil jako selhaný
            } finally {
                // --- KROK 4: ÚKLID ---
                if (newReportDbId) {
                    logger.trace(`(FINALLY BLOCK) Zahajuji úklid pro sestavu '${report.name}' s ID: ${newReportDbId}.`);
                    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                    const apiClient = new ApiClient(page.request, token!);
                    await apiClient.deleteUserReport(newReportDbId);
                    logger.trace(`Požadavek na smazání sestavy '${report.name}' (ID: ${newReportDbId}) byl odeslán.`);

                    logger.trace(`Ověřuji, že sestava (ID: ${newReportDbId}) byla skutečně smazána...`);
                    const reportsAfterDelete: ApiUserReport[] = await apiClient.getListOfUsersReports('60193531');
                    const deletedReportExists = reportsAfterDelete.some((r: ApiUserReport) => r.id === newReportDbId);
                    
                    expect(deletedReportExists, `Sestava '${report.name}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                    logger.info(`Úklid úspěšný: Sestava '${report.name}' (ID: ${newReportDbId}) byla ověřitelně smazána ze serveru.`);
                }
            }
        });
    }
});