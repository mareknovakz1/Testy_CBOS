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

const sentPublic:boolean = true; //public - sestava je sdílená

// Jedno pole, kde má každá sestava přiřazený svůj funkční typ payloadu
const allReportsConfig: { id: string; //ID vytvořené sestavy - načteno z oracle
                        name: string; //Libovolné jméno
                        config: ReportConfig, 
                        testCaseId: string; //ID test casu
                    }[] = [
    // 1. Sestavy funkční s plným časovým rozsahem (OD-DO)
    { id: 'D001', name: 'D001 - Přehled prodejů', config: { dateType: 'dateRange' }, testCaseId: 'TC-1234' },
    { id: 'D005', name: 'D005 - Přehled konkurenčních cen', config: { dateType: 'dateRange' }, testCaseId: 'TC-1235' },
    { id: 'P001', name: 'P001 - Přehled nákupů zboží', config: { dateType: 'dateRange' }, testCaseId: 'TC-1236' },
    { id: 'S002', name: 'S002 - Přehled přecenění', config: { dateType: 'dateRange' }, testCaseId: 'TC-1237' },
    { id: 'S003', name: 'S003 - Půlnoční zásoby PHM', config: { dateType: 'dateRange' }, testCaseId: 'TC-1238' },
    { id: 'S004', name: 'S004 - Půlnoční registry stojanů', config: { dateType: 'dateRange' }, testCaseId: 'TC-1239' },
    { id: 'T001', name: 'T001 - Přehled neautorizovaných transakcí', config: { dateType: 'dateRange' }, testCaseId: 'TC-1240' },
    { id: 'T002', name: 'T002 - Přehled odběrů podle řidiče', config: { dateType: 'dateRange' }, testCaseId: 'TC-1241' },
    { id: 'T003', name: 'T003 - Přehled odběrů podle vozidla', config: { dateType: 'dateRange' }, testCaseId: 'TC-1242' },

    // 2. Sestavy funkční s konkrétním datem (YMD)
    { id: 'D002', name: 'D002 - Přehled prodejů PHM pro FÚ', config: { dateType: 'exactDate' }, testCaseId: 'TC-1243' },
    { id: 'P002', name: 'P002 - Přehled dodávek PHM pro FÚ', config: { dateType: 'exactDate' }, testCaseId: 'TC-1244' },
    { id: 'S001', name: 'S001 - Přehled pohybů zboží', config: { dateType: 'exactDate' }, testCaseId: 'TC-1245' },

    // 3. Sestavy funkční s časovým rozsahem "OD" a speciálními filtry
    { id: 'D003', name: 'D003 - Přehled prodejů se slevovou kartou', config: { dateType: 'rangeFromOnly', partnerIds: [1], stockIds: [230] }, testCaseId: 'TC-1246' },
    { id: 'D004', name: 'D004 - Přehled smazaných položek účtenek', config: { dateType: 'rangeFromOnly', stockIds: [230] }, testCaseId: 'TC-1247' },
    { id: 'D006', name: 'D006 - Export položek pokladních dokladů', config: { dateType: 'rangeFromOnly', stockIds: [230] }, testCaseId: 'TC-1248' },
];

test.describe('Cyklus pro všechny sestavy s dynamickým payloadem', () => {

    for (const report of allReportsConfig) {
        test(`${report.testCaseId}: Životní cyklus sestavy: ${report.name}, @regression @API @sestavy @high`, async ({ page }) => {
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
                reportPayload.public = sentPublic; 
                await apiClient.createUserReport('60193531', reportPayload);

                const allReports = await apiClient.getListOfUsersReports('60193531'); 
                const createdReport = allReports.find(r => r.name === report.name);
                if (createdReport) {
                logger.info(`Sestava '${report.name}' byla úspěšně vytvořena.`);
                
                // ZDE JSOU PROMĚNNÉ STÁLE PLATNÉ
                newReportDbId = createdReport.id;
                logger.silly('Response vytvořené sestavy:', createdReport);
                const itemsCount = createdReport.items;
                const isPublic = createdReport.public;

                    //Kontorla item != null - pravděpoodbná chyba
                     expect(itemsCount, `CHYBA: Sestava '${report.name}' selhala při generování na serveru (items je null).`).not.toBeNull();

                    if (itemsCount === 0) {
                        const errorMessage = `Počet objektů pro období '${report.name}' je '${itemsCount}'.`;
                        logger.warn(errorMessage);
                    } else {
                        logger.debug(`Vytvořena Sestava: ${newReportDbId} pro období "${report.name}". Sestava obsahuje: ${itemsCount} položek.`);
                    }
                
                expect(isPublic, `Sestava '${report.name}' měla být sdílená, ale není!`).toBe(true);
                logger.info(`Test je v pořádku, sestava "${report.name}" je sdílená.`);

                } else {
                    logger.error(`Sestava '${report.name}' nebyla nalezena v seznamu.`);
                    test.fail(true, `Uložená sestava '${report.name}' nebyla nalezena v seznamu.`);
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
                const reportsAfterDelete = await apiClient.getListOfUsersReports('60193531');
                const deletedReportExists = reportsAfterDelete.some(r => r.id === newReportDbId);
                expect(deletedReportExists, `Sestava '${report.name}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                logger.debug(`Ověření úspěšné: Sestava '${report.name}' (ID: ${newReportDbId}) byla smazána ze serveru.`);
                }
            }
        });
    }
}); 