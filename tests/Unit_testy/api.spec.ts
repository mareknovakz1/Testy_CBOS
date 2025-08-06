import { test, expect } from '../../support/fixtures/auth.fixture'; // Použijeme fixture pro přihlášení
import { ApiClient } from '../../support/ApiClient'; // <-- Ujistěte se, že cesta je správná
import { logger } from '../../support/logger';   // <-- Ujistěte se, že cesta je správná

// Token nyní přijde z `auth.fixture`, takže tato konstanta není nutná.
// const AUTH_TOKEN = ...

test.describe('API Testy pro ApiClient', () => {
    let apiClient: ApiClient;

    // Inicializujeme ApiClient s tokenem z fixture před každým testem
    test.beforeEach(async ({ page }) => {
        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Chybí autorizační token z fixture!').toBeTruthy();
        apiClient = new ApiClient(page.request, token!);
    });

    // Test 1: Kompletní životní cyklus jedné sestavy
    test('Kompletní životní cyklus sestavy (Create, Preview, Delete)', async () => {
        let reportId: number | null = null; // Proměnná pro ID je lokální pro tento test

        try {
            // --- 1. ARRANGE: Příprava testovacích dat ---
            const uniqueReportName = `Testovací sestava ${Date.now()}`;
            const testPayload = {
                reportDefinitionId: 'D001',
                name: uniqueReportName,
                public: false,
                settings: {
                    dateModelType: 'range',
                    dateFrom: '2025-01-01T00:00:00.000Z',
                    dateTo: '2025-12-31T00:00:00.000Z',
                    stockId: [101]
                }
            };

            // --- 2. ACT & ASSERT: Vytvoření sestavy ---
            logger.info('Krok 1: Vytváření nové sestavy...');
            const createdReport = await apiClient.createUserReport(testPayload.reportDefinitionId, testPayload);
            
            expect(createdReport).toBeDefined();
            expect(createdReport.id).toBeDefined();
            expect(typeof createdReport.id).toBe('number');
            expect(createdReport.name).toBe(uniqueReportName);
            
            reportId = createdReport.id; // Uložíme ID pro pozdější smazání
            logger.info(`Sestava úspěšně vytvořena s ID: ${reportId}`);

            // --- 3. ACT & ASSERT: Získání náhledu sestavy ---
            logger.info(`Krok 2: Získávání náhledu pro sestavu ID: ${reportId}...`);
            expect(reportId).not.toBeNull();
            const previewData = await apiClient.getUserReportPreview(reportId!);
            expect(previewData).toBeDefined();
            expect(Array.isArray(previewData.data)).toBe(true); 
            logger.info('Náhled sestavy úspěšně ověřen.');

            // --- 4. ACT & ASSERT: Ověření v seznamu sestav ---
            logger.info('Krok 3: Ověření existence sestavy v celkovém seznamu...');
            const allReports = await apiClient.getUserReportsList();
            const foundReport = allReports.data.find((r: any) => r.id === reportId);
            
            expect(foundReport).toBeDefined();
            expect(foundReport.name).toBe(uniqueReportName);
            logger.info('Sestava nalezena v seznamu.');

        } finally {
            // --- 5. CLEANUP: Smazání vytvořené sestavy ---
            // Tento blok se provede VŽDY, i když některý `expect` v `try` bloku selže.
            if (reportId) {
                logger.trace(`(FINALLY) Uklízím testovací sestavu s ID: ${reportId}`);
                await apiClient.deleteUserReport(reportId);
            }
        }
    });

    // Test 2: Samostatné endpointy (zůstávají beze změny)
    test('Získání seznamu všech sestav (getUserReportsList)', async () => {
        const response = await apiClient.getUserReportsList();
        expect(response).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);
    });

    test('Získání seznamu partnerů (getListOfPartners)', async () => {
        const response = await apiClient.getListOfPartners();
        expect(response).toBeDefined();
        expect(Array.isArray(response.data)).toBe(true);
    });
});