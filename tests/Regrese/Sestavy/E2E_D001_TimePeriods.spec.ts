import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';

// --- Typové definice pro parametrizaci ---
interface RangeTestCase { name: string; type: 'range'; payload: { from: Date; to: Date | null }; }
interface FloatingTestCase { name: string; type: 'floating'; payload: string; }
interface ExactDateTestCase { name: string; type: 'exact'; payload: Date; }
type TestCase = RangeTestCase | FloatingTestCase | ExactDateTestCase;

// --- KONFIGURACE ---
const REPORT_DEFINITION_ID = 'D001';
const BASE_REPORT_NAME = 'D001: Přehled prodejů';

// --- DEFINICE TESTOVACÍCH PŘÍPADŮ ---
const testCases: TestCase[] = [
    { name: "Rozsah (výchozí)", type: 'range', payload: { from: new Date("2025-07-01T00:00:00Z"), to: new Date() } },
    { name: "Přesné období: Aktuální den", type: 'exact', payload: new Date() },
    { name: "Plovoucí období: První čtvrtletí", type: 'floating', payload: 'q1' },
    { name: "Plovoucí období: Druhé čtvrtletí", type: 'floating', payload: 'q2' },
    { name: "Plovoucí období: Třetí čtvrtletí", type: 'floating', payload: 'q3' },
    { name: "Plovoucí období: Čtvrté čtvrtletí", type: 'floating', payload: 'q4' },
    { name: "Plovoucí období: Aktuální týden", type: 'floating', payload: 'actualWeek' },
    { name: "Plovoucí období: Minulý týden", type: 'floating', payload: 'lastWeek' },
    { name: "Plovoucí období: Předchozí 2 týdny", type: 'floating', payload: 'last2Weeks' },
    { name: "Plovoucí období: Aktuální měsíc", type: 'floating', payload: 'actualMonth' },
    { name: "Plovoucí období: Minulý měsíc", type: 'floating', payload: 'lastMonth' },
    { name: "Plovoucí období: Předchozí 3 měsíce", type: 'floating', payload: 'last3Months' },
];

// --- GENERUJEME TESTOVACÍ SÉRIE PRO KAŽDÉ OBDOBÍ ---

for (const testCase of testCases) {

    // Pro každý testovací případ vytvoříme samostatnou testovací sérii
    test.describe(`D001 – Ověření sestavy pro období: ${testCase.name}`, () => {

        let newReportDbId: number | string | undefined;
        let apiClient: ApiClient; // Definujeme ApiClient zde pro přístup v `afterEach`

        // `beforeEach` se spustí před každým testem v této sérii (zde máme jen jeden)
        test.beforeEach(async ({ page }) => {
            // Inicializace a příprava společná pro test
            await page.goto('/');
            const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
            expect(token, "Autentizační token musí být přítomen").toBeTruthy();
            apiClient = new ApiClient(page.request, token!);
        });

        // `afterEach` se postará o úklid po každém testu v sérii
        test.afterEach(async () => {
            if (newReportDbId) {
                logger.trace(`(AFTER EACH) Mažu sestavu s ID: ${newReportDbId}...`);
                try {
                    await apiClient.deleteUserReport(newReportDbId);
                    const finalList = await apiClient.getUserReportsList();
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
        test(`Vytvoření, ověření a smazání sestavy`, async () => {
            try {
                // --- VYTVOŘENÍ SESTAVY ---
                const dynamicReportName = `${BASE_REPORT_NAME} - ${testCase.name}`;
                logger.trace(`Vytvářím sestavu '${dynamicReportName}'...`);

                const reportBuilder = new ReportBuilder(REPORT_DEFINITION_ID, dynamicReportName);

                // Dynamické sestavení payloadu
                if (testCase.type === 'range') {
                    reportBuilder.withDateRange(testCase.payload.from, testCase.payload.to);
                } else if (testCase.type === 'floating') {
                    reportBuilder.withFloatingPeriod(testCase.payload);
                } else if (testCase.type === 'exact') {
                    reportBuilder.withExactDate(testCase.payload);
                }

                const reportPayload = reportBuilder.build();
                await apiClient.createUserReport('60193531', reportPayload);

                // --- PŘEČTENÍ SEZNAMU A ZÍSKÁNÍ ID ---
                const allReports = await apiClient.getUserReportsList();
                const createdReport = allReports.find(report => report.name === dynamicReportName);
                
                test.fail(!createdReport, `Uložená sestava '${dynamicReportName}' nebyla nalezena v seznamu.`);
                
                newReportDbId = createdReport.id; // Uložíme ID pro `afterEach`
                const itemsCount = createdReport.items;

                logger.info(`Vytvořena Sestava: ${newReportDbId} pro období "${testCase.name}". Sestava obsahuje: ${itemsCount} položek.`);
                expect(newReportDbId).toBeDefined();

                // --- OVĚŘENÍ POČTU POLOŽEK ---
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
                throw error; // Znovu vyhodíme chybu, aby byl test označen jako neúspěšný
            }
        });
    });
}