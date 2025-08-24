import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';

// --- JEDNOTNÁ A FINÁLNÍ DEFINICE VŠECH SESTAV ---

// Definujeme typy payloadů, které reálně používáme
type PayloadType = 'dateRange' | 'exactDate' | 'dateRangeFromOnly';

interface ReportConfig {
    dateType: 'dateRange' | 'exactDate' | 'rangeFromOnly';
    partnerIds?: number[]; 
    stockIds?: number[];   
}

// Jedno pole, kde má každá sestava přiřazený svůj funkční typ payloadu
const allReportsConfig: { id: string; name: string; config: ReportConfig }[] = [
    // 1. Sestavy funkční s plným časovým rozsahem (OD-DO)
    { id: 'D001', name: 'D001 - Přehled prodejů', config: { dateType: 'dateRange' } },
    { id: 'D005', name: 'D005 - Přehled konkurenčních cen', config: { dateType: 'dateRange' } },
    { id: 'P001', name: 'P001 - Přehled nákupů zboží', config: { dateType: 'dateRange' } },
    { id: 'S002', name: 'S002 - Přehled přecenění', config: { dateType: 'dateRange' } },
    { id: 'S003', name: 'S003 - Půlnoční zásoby PHM', config: { dateType: 'dateRange' } },
    { id: 'S004', name: 'S004 - Půlnoční registry stojanů', config: { dateType: 'dateRange' } },
    { id: 'T001', name: 'T001 - Přehled neautorizovaných transakcí', config: { dateType: 'dateRange' } },
    { id: 'T002', name: 'T002 - Přehled odběrů podle řidiče', config: { dateType: 'dateRange' } },
    { id: 'T003', name: 'T003 - Přehled odběrů podle vozidla', config: { dateType: 'dateRange' } },

    // 2. Sestavy funkční s konkrétním datem (YMD)
    { id: 'D002', name: 'D002 - Přehled prodejů PHM pro FÚ', config: { dateType: 'exactDate' } },
    { id: 'P002', name: 'P002 - Přehled dodávek PHM pro FÚ', config: { dateType: 'exactDate' } },
    { id: 'S001', name: 'S001 - Přehled pohybů zboží', config: { dateType: 'exactDate' } },

    // 3. Sestavy funkční s časovým rozsahem "OD" a speciálními filtry
    { id: 'D003', name: 'D003 - Přehled prodejů se slevovou kartou', config: { dateType: 'rangeFromOnly', partnerIds: [1], stockIds: [101] } },
    { id: 'D004', name: 'D004 - Přehled smazaných položek účtenek', config: { dateType: 'rangeFromOnly', stockIds: [101] } },
    { id: 'D006', name: 'D006 - Export položek pokladních dokladů', config: { dateType: 'rangeFromOnly', stockIds: [101] } },
];

test.describe('Finální E2E cyklus pro všechny sestavy s dynamickým payloadem', () => {

    for (const report of allReportsConfig) {
        test(`Životní cyklus sestavy: ${report.name}`, async ({ page }) => {
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

                // 2. KROK: Přidání speciálních filtrů podle konfigurace
                if (report.config.partnerIds) {
                    builder.withPartnerFilter(report.config.partnerIds);
                }
                if (report.config.stockIds) {
                    builder.withStockFilter(report.config.stockIds);
                }

                // 3. KROK: Sestavení finálního payloadu
                const reportPayload = builder.build();

                await apiClient.createUserReport('60193531', reportPayload);

                const allReports = await apiClient.getUserReportsList();
                const createdReport = allReports.find(r => r.name === report.name);
                test.fail(!createdReport, `Uložená sestava '${report.name}' nebyla nalezena v seznamu.`);

                newReportDbId = createdReport!.id;
                const itemsCount = createdReport.items;

                if (itemsCount === null) {
                    const errorMessage = `Počet objektů pro období '${report.name}' je 'null'.`;
                    logger.error(errorMessage);
                    test.fail(true, errorMessage);
                } else if (itemsCount === 0) {
                    logger.warn(`Vytvořena Sestava: ${newReportDbId} pro období "${report.name}". Sestava obsahuje: 0 položek.`);
                    } else {
                logger.info(`Vytvořena Sestava: ${newReportDbId} pro období "${report.name}". Sestava obsahuje: ${itemsCount} položek.`);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě během životního cyklu sestavy '${report.name}'.`, error);
                throw error;
            } finally {
            if (newReportDbId) {
                logger.trace(`(FINALLY) Pokouším se smazat sestavu '${report.name}' s ID: ${newReportDbId}...`);
                const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                const apiClient = new ApiClient(page.request, token!);
                await apiClient.deleteUserReport(newReportDbId);
                logger.silly(`Požadavek na smazání sestavy '${report.name}' (ID: ${newReportDbId}) byl odeslán.`);

                logger.trace(`Ověřuji, že sestava (ID: ${newReportDbId}) byla skutečně smazána...`);
                const reportsAfterDelete = await apiClient.getUserReportsList();
                const deletedReportExists = reportsAfterDelete.some(r => r.id === newReportDbId);
                expect(deletedReportExists, `Sestava '${report.name}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                logger.debug(`Ověření úspěšné: Sestava '${report.name}' (ID: ${newReportDbId}) byla smazána ze serveru.`);
                }
            }
        });
    }
}); 