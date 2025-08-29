import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';

// --- Typové definice pro parametrizaci (rozšířeno o ID) ---
interface TestCase {
    id: string; // PŘIDÁNO: ID testovacího případu
    name: string;
    type: 'range' | 'floating' | 'exact';
    payload: any;
}

// --- KONFIGURACE ---
const REPORT_DEFINITION_ID = 'D001';
const BASE_REPORT_NAME = 'D001: Přehled prodejů';
const USER_ID = '60193531'; 

// --- DEFINICE TESTOVACÍCH PŘÍPADŮ S ID ---
const testCases: TestCase[] = [
    { id: "TC-1297", name: "Rozsah (výchozí)", type: 'range', payload: { from: new Date("2025-07-01T00:00:00Z"), to: new Date() } },
    { id: "TC-1298", name: "Přesné období: Aktuální den", type: 'exact', payload: new Date() },
    { id: "TC-1299", name: "Plovoucí období: První čtvrtletí", type: 'floating', payload: 'q1' },
    { id: "TC-1300", name: "Plovoucí období: Druhé čtvrtletí", type: 'floating', payload: 'q2' },
    { id: "TC-1301", name: "Plovoucí období: Třetí čtvrtletí", type: 'floating', payload: 'q3' },
    { id: "TC-1302", name: "Plovoucí období: Čtvrté čtvrtletí", type: 'floating', payload: 'q4' },
    { id: "TC-1303", name: "Plovoucí období: Aktuální týden", type: 'floating', payload: 'actualWeek' },
    { id: "TC-1304", name: "Plovoucí období: Minulý týden", type: 'floating', payload: 'lastWeek' },
    { id: "TC-1305", name: "Plovoucí období: Předchozí 2 týdny", type: 'floating', payload: 'last2Weeks' },
    { id: "TC-1306", name: "Plovoucí období: Aktuální měsíc", type: 'floating', payload: 'actualMonth' },
    { id: "TC-1307", name: "Plovoucí období: Minulý měsíc", type: 'floating', payload: 'lastMonth' },
    { id: "TC-1308", name: "Plovoucí období: Předchozí 3 měsíce", type: 'floating', payload: 'last3Months' },
];

// --- GENERUJEME TESTOVACÍ SÉRIE PRO KAŽDÉ OBDOBÍ ---

for (const testCase of testCases) {

    // Pro každý testovací případ vytvoříme samostatnou testovací sérii
    test.describe(`D001 – Ověření sestavy pro období: ${testCase.name}`, () => {

        let newReportDbId: number | string | undefined;
        let apiClient: ApiClient;

        test.beforeEach(async ({ page }) => {
            await page.goto('/');
            const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
            expect(token, "Autentizační token musí být přítomen").toBeTruthy();
            apiClient = new ApiClient(page.request, token!);
        });

        test.afterEach(async () => {
            if (newReportDbId) {
                logger.trace(`(AFTER EACH) Mažu sestavu s ID: ${newReportDbId}...`);
                try {
                    await apiClient.deleteUserReport(newReportDbId);
                    const finalList = await apiClient.getListOfUsersReports(USER_ID); 
                    const deletedReportExists = finalList.some(report => report.id === newReportDbId);
                    expect(deletedReportExists, `Sestava s ID ${newReportDbId} by měla být smazána.`).toBe(false);
                    logger.debug(`Ověření úspěšné. Sestava s ID ${newReportDbId} byla smazána.`);
                } catch (cleanupError) {
                    logger.error(`Chyba při mazání sestavy (ID: ${newReportDbId}) v 'afterEach' bloku.`, cleanupError);
                }
            } else {
                logger.warn(`Nebylo vytvořeno ID sestavy pro období "${testCase.name}", úklid se neprovádí.`);
            }
        });
        
        // Hlavní testovací logika
        // UPRAVENO: Přidání ID do názvu testu pro lepší identifikaci v reportech
        test(`${testCase.id}: Vytvoření, ověření a smazání sestavy @API @regresion @Sestavy @Periods @medium`, async () => {
            try {
                const dynamicReportName = `${BASE_REPORT_NAME} - ${testCase.name}`;
                logger.trace(`Vytvářím sestavu '${dynamicReportName}'...`);

                const reportBuilder = new ReportBuilder(REPORT_DEFINITION_ID, dynamicReportName);

                if (testCase.type === 'range') {
                    reportBuilder.withDateRange(testCase.payload.from, testCase.payload.to);
                } else if (testCase.type === 'floating') {
                    reportBuilder.withFloatingPeriod(testCase.payload);
                } else if (testCase.type === 'exact') {
                    reportBuilder.withExactDate(testCase.payload);
                }

                const reportPayload = reportBuilder.build();
                await apiClient.createUserReport(USER_ID, reportPayload);

                const allReports = await apiClient.getListOfUsersReports(USER_ID);
                const createdReport = allReports.find(report => report.name === dynamicReportName);
                
                test.fail(!createdReport, `Uložená sestava '${dynamicReportName}' nebyla nalezena v seznamu.`);
                
                newReportDbId = createdReport!.id;
                const itemsCount = createdReport!.items;

                logger.info(`Vytvořena Sestava: ${newReportDbId} pro období "${testCase.name}". Sestava obsahuje: ${itemsCount} položek.`);
                expect(newReportDbId).toBeDefined();

                if (itemsCount === null) {
                    const errorMessage = `Počet objektů pro období '${testCase.name}' je 'null'.`;
                    logger.error(errorMessage);
                    test.fail(true, errorMessage);
                } else if (itemsCount === 0) {
                    logger.warn(`Detail sestavy: Sestava obsahuje 0 položek.`);
                } else {
                    logger.info(`Sestava obsahuje ${itemsCount} položek.`);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě v testu pro období "${testCase.name}"`, error);
                throw error;
            }
        });
    });
}