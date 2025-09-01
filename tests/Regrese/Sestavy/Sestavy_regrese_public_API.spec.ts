/**
 * Vykoná životní cyklus všech sestav s public = true
 * Vytvoření -> přečtení -> kontrola -> smazání
 * @sestavy
 * @api
 * @regression
 * @medium
 */
import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';
import allReportsConfig from '../../../test-data/Sestavy_regrese_public_API.json';

// --- TYPOVÉ DEFINICE ---

interface ReportConfig {
    dateType: 'dateRange' | 'exactDate' | 'rangeFromOnly';
    partnerIds?: number[];
    stockIds?: number[];
}

interface ReportTestData {
    id: string;
    name: string;
    config: ReportConfig;
    testCaseId: string;
}

// Konstanta pro nastavení, zda je sestava sdílená (veřejná)
const sentPublic: boolean = true;

test.describe('Cyklus pro všechny sdílené sestavy', () => {

    for (const report of (allReportsConfig as ReportTestData[])) {
        // Přidáno ID test casu a požadované tagy do názvu testu
        test(`${report.testCaseId}: Životní cyklus sdílené sestavy: ${report.name} @regression @api @sestavy @medium`, async ({ page }) => {
            let newReportDbId: number | string | undefined;
            try {
                await page.goto('/');
                const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                expect(token).toBeTruthy();
                const apiClient = new ApiClient(page.request, token!);

                const builder = new ReportBuilder(report.id, report.name);
                logger.trace(`Vytvářím sestavu '${report.name}' s konfigurací: ${JSON.stringify(report.config)}`);

                // Nastavení data podle konfigurace
                switch (report.config.dateType) {
                    case 'dateRange':
                        builder.withDateRange(new Date('2025-01-01'), new Date('2025-12-31'));
                        break;
                    case 'exactDate':
                        builder.withExactDate(new Date(2025, 6, 1)); // 1. červenec 2025
                        break;
                    case 'rangeFromOnly':
                        builder.withDateRange(new Date(2025, 6, 1), null);
                        break;
                }

                // Přidání speciálních filtrů podle konfigurace
                if (report.config.partnerIds) {
                    builder.withPartnerFilter(report.config.partnerIds);
                }
                if (report.config.stockIds) {
                    builder.withStockFilter(report.config.stockIds);
                }

                // Sestavení finálního payloadu a nastavení jako sdílený
                const reportPayload = builder.build();
                reportPayload.public = sentPublic;
                await apiClient.createUserReport('60193531', reportPayload);

                const allReports = await apiClient.getListOfUsersReports('60193531');

                const createdReport = allReports.find((r: { name: string; id: number | string; items: number | null; public: boolean; }) => r.name === report.name);

                if (createdReport) {
                    logger.info(`Sestava '${report.name}' byla úspěšně vytvořena.`);
                    newReportDbId = createdReport.id;
                    const itemsCount = createdReport.items;
                    const isPublic = createdReport.public;

                    expect(itemsCount, `CHYBA: Sestava '${report.name}' selhala při generování na serveru (items je null).`).not.toBeNull();

                    if (itemsCount === 0) {
                        logger.warn(`Vytvořena sestava: ${newReportDbId} pro "${report.name}". Sestava obsahuje: 0 položek.`);
                    } else {
                        logger.info(`Vytvořena sestava: ${newReportDbId} pro "${report.name}". Sestava obsahuje: ${itemsCount} položek.`);
                    }
                    
                    expect(isPublic, `Sestava '${report.name}' měla být sdílená, ale není!`).toBe(true);
                    logger.info(`Ověření v pořádku, sestava "${report.name}" je sdílená.`);

                } else {
                    test.fail(true, `Uložená sestava '${report.name}' nebyla nalezena v seznamu.`);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě během životního cyklu sestavy '${report.name}'.`, error);
                throw error;
            } finally {
                // FUNKCE ÚKLIDU (DELETE)
                if (newReportDbId) {
                    logger.trace(`(FINALLY) Pokouším se smazat sestavu '${report.name}' s ID: ${newReportDbId}...`);
                    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                    const apiClient = new ApiClient(page.request, token!);
                    await apiClient.deleteUserReport(newReportDbId);
                    logger.silly(`Požadavek na smazání sestavy '${report.name}' (ID: ${newReportDbId}) byl odeslán.`);

                    logger.trace(`Ověřuji, že sestava (ID: ${newReportDbId}) byla skutečně smazána...`);
                    const reportsAfterDelete = await apiClient.getListOfUsersReports('60193531');
                    
                    const deletedReportExists = reportsAfterDelete.some((r: { id: number | string; }) => r.id === newReportDbId);
                    
                    expect(deletedReportExists, `Sestava '${report.name}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                    logger.debug(`Ověření úspěšné: Sestava '${report.name}' (ID: ${newReportDbId}) byla smazána ze serveru.`);
                }
            }
        });
    }
});