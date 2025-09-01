/**
 * Vykoná životní cyklus všech sestav
 * Vytvoření -> přečtení -> kontorla -> smazání
 * @sestavy
 * @api
 * @regression
 * @medium
 */
import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';

// --- JEDNOTNÁ A FINÁLNÍ DEFINICE VŠECH SESTAV ---

interface ReportConfig {
    dateType: 'dateRange' | 'exactDate' | 'rangeFromOnly';
    partnerIds?: number[];
    stockIds?: number[];
}

// Konstanta pro nastavení, zda je sestava sdílená (veřejná)
const sentPublic: boolean = true;

// Jedno pole, kde má každá sestava přiřazený svůj funkční typ payloadu a Test Case ID
const allReportsConfig: { id: string; name: string; config: ReportConfig; testCaseId: string; }[] = [
    // 1. Sestavy funkční s plným časovým rozsahem (OD-DO)
    { id: 'D001', name: 'D001 - Přehled prodejů', config: { dateType: 'dateRange' }, testCaseId: 'TC-1249' },
    { id: 'D005', name: 'D005 - Přehled konkurenčních cen', config: { dateType: 'dateRange' }, testCaseId: 'TC-1250' },
    { id: 'P001', name: 'P001 - Přehled nákupů zboží', config: { dateType: 'dateRange' }, testCaseId: 'TC-1251' },
    { id: 'S002', name: 'S002 - Přehled přecenění', config: { dateType: 'dateRange' }, testCaseId: 'TC-1252' },
    { id: 'S003', name: 'S003 - Půlnoční zásoby PHM', config: { dateType: 'dateRange' }, testCaseId: 'TC-1253' },
    { id: 'S004', name: 'S004 - Půlnoční registry stojanů', config: { dateType: 'dateRange' }, testCaseId: 'TC-1254' },
    { id: 'T001', name: 'T001 - Přehled neautorizovaných transakcí', config: { dateType: 'dateRange' }, testCaseId: 'TC-1255' },
    { id: 'T002', name: 'T002 - Přehled odběrů podle řidiče', config: { dateType: 'dateRange' }, testCaseId: 'TC-1256' },
    { id: 'T003', name: 'T003 - Přehled odběrů podle vozidla', config: { dateType: 'dateRange' }, testCaseId: 'TC-1257' },

    // 2. Sestavy funkční s konkrétním datem (YMD)
    { id: 'D002', name: 'D002 - Přehled prodejů PHM pro FÚ', config: { dateType: 'exactDate' }, testCaseId: 'TC-1258' },
    { id: 'P002', name: 'P002 - Přehled dodávek PHM pro FÚ', config: { dateType: 'exactDate' }, testCaseId: 'TC-1259' },
    { id: 'S001', name: 'S001 - Přehled pohybů zboží', config: { dateType: 'exactDate' }, testCaseId: 'TC-1260' },

    // 3. Sestavy funkční s časovým rozsahem "OD" a speciálními filtry
    { id: 'D003', name: 'D003 - Přehled prodejů se slevovou kartou', config: { dateType: 'rangeFromOnly', partnerIds: [1], stockIds: [230] }, testCaseId: 'TC-1261' },
    { id: 'D004', name: 'D004 - Přehled smazaných položek účtenek', config: { dateType: 'rangeFromOnly', stockIds: [230] }, testCaseId: 'TC-1262' },
    { id: 'D006', name: 'D006 - Export položek pokladních dokladů', config: { dateType: 'rangeFromOnly', stockIds: [230] }, testCaseId: 'TC-1263' },
];

test.describe('Cyklus pro všechny sdílené sestavy', () => {

    for (const report of allReportsConfig) {
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

                // OPRAVA: Použita správná metoda 'getListOfUsersReports'
                const allReports = await apiClient.getListOfUsersReports('60193531');
                
                // OPRAVA: Přidán typ pro 'r' pro odstranění chyby
                const createdReport = allReports.find((r: { name: string; }) => r.name === report.name);

                if (createdReport) {
                    logger.info(`Sestava '${report.name}' byla úspěšně vytvořena.`);
                    newReportDbId = createdReport.id;
                    const itemsCount = createdReport.items;
                    const isPublic = createdReport.public;

                    // OPRAVA: Test selže, pokud je items null
                    expect(itemsCount, `CHYBA: Sestava '${report.name}' selhala při generování na serveru (items je null).`).not.toBeNull();

                    if (itemsCount === 0) {
                        logger.warn(`Vytvořena sestava: ${newReportDbId} pro "${report.name}". Sestava obsahuje: 0 položek.`);
                    } else {
                        logger.info(`Vytvořena sestava: ${newReportDbId} pro "${report.name}". Sestava obsahuje: ${itemsCount} položek.`);
                    }
                    
                    // Ověření, že sestava je skutečně sdílená
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
                    // OPRAVA: Použita správná metoda 'getListOfUsersReports'
                    const reportsAfterDelete = await apiClient.getListOfUsersReports('60193531');
                    
                    // OPRAVA: Přidán typ pro 'r' pro odstranění chyby
                    const deletedReportExists = reportsAfterDelete.some((r: { id: number | string; }) => r.id === newReportDbId);
                    
                    expect(deletedReportExists, `Sestava '${report.name}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                    logger.debug(`Ověření úspěšné: Sestava '${report.name}' (ID: ${newReportDbId}) byla smazána ze serveru.`);
                }
            }
        });
    }
});