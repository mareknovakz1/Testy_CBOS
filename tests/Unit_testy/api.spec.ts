import { test, expect } from '../../support/fixtures/auth.fixture';
import { ApiClient } from '../../support/ApiClient';
import { logger } from '../../support/logger';
import { ReportBuilder } from '../../support/ReportBuilder';

test.describe.serial('API Testy pro každý endpoint zvlášť s ošetřením chyb', () => {
    let apiClient: ApiClient;
    
    // Proměnné pro předávání stavu mezi testy
    let createdReportId: number | null = null;
    let createdReportName: string | null = null;

    // Inicializace ApiClientu před každým testem
test.beforeEach(async ({ page }) => {
    logger.silly('Spouštím beforeEach: Inicializuji ApiClient...');
    await page.goto('/'); 

    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    expect(token, 'Chybí autorizační token z fixture!').toBeTruthy();
    apiClient = new ApiClient(page.request, token!);
    logger.trace('ApiClient úspěšně inicializován.');
});
    test.afterAll(async ({ request }) => {
        if (createdReportId) {
            logger.warn(`(AFTER ALL) Bezpečnostní úklid: Sestava s ID ${createdReportId} nebyla smazána během testů. Mažu ji nyní.`);
            const token = await request.storageState().then(s => s.origins[0].localStorage.find(i => i.name === 'auth_token')?.value);
            if (token) {
                const finalApiClient = new ApiClient(request, token);
                await finalApiClient.deleteUserReport(createdReportId);
            }
        }
    });

    // 1. Test pro vytvoření sestavy
     test('POST /usersReports - Vytvoření nové sestavy', async () => {
        const endpoint = '/reports-api/usersReports/{userId}';
        logger.info(`🚀 Spouštím test endpointu: POST ${endpoint}`);

        try {
            // ✅ POUŽITÍ REPORT BUILDERU
            const uniqueName = `Testovací sestava ${Date.now()}`;
            const builder = new ReportBuilder('D001', uniqueName);
            
            // Sestavíme payload pomocí builderu
            const testPayload = builder
                .withDateRange(new Date('2025-07-31T22:00:00.000Z'), new Date('null'))
                .withStockFilter([101])
                .withGrouping(['date', 'stockLabel']) // Příklad seskupení
                .build();

            logger.debug('Request payload (sestavený přes builder):\n' + JSON.stringify(testPayload, null, 2));

            const createdReport = await apiClient.createUserReport('60193531', testPayload);
            logger.debug('Response data:\n' + JSON.stringify(createdReport, null, 2));

            expect(createdReport).toBeDefined();
            expect(createdReport.id).toBeDefined();
            
            createdReportId = createdReport.id;
            createdReportName = createdReport.name;

            logger.info(`Test úspěšně dokončen: Sestava vytvořena s ID: ${createdReportId}`);
        } catch (error) {
            logger.error(`CHYBA v testu 'POST /usersReports':`, error);
            throw error;
        }
    });

    // 2. Test pro získání náhledu
    test('GET /userReportPreview/{SestavaId} - Získání náhledu sestavy', async () => {
        test.skip(!createdReportId, 'Tento test vyžaduje ID z předchozího testu (create).');
        const endpoint = `/reports-api/userReportPreview/${createdReportId}`;
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);
        
        try {
            const previewData = await apiClient.getUserReportPreview(createdReportId!);
            logger.debug('Response data:\n' + JSON.stringify(previewData, null, 2));

            expect(previewData).toBeDefined();
            expect(Array.isArray(previewData.data)).toBe(true);

            logger.info(`Test úspěšně dokončen: Náhled pro sestavu ${createdReportId} ověřen.`);
        } catch (error) {
            logger.error(`CHYBA v testu 'GET /userReportPreview':`, error);
            throw error;
        }
    });

    // 3. Test pro ověření sestavy v seznamu
    test('GET /listOfUsersReports - Ověření vytvořené sestavy v seznamu', async () => {
        test.skip(!createdReportId, 'Tento test vyžaduje ID z předchozího testu (create).');
        const endpoint = '/reports-api/listOfUsersReports/{userId}';
        logger.info(` Spouštím test endpointu: GET ${endpoint}`);
        
        try {
            const allReports = await apiClient.getUserReportsList();
            const foundReport = allReports.data.find((r: any) => r.id === createdReportId);
            logger.debug('Response data (nalezená sestava):\n' + JSON.stringify(foundReport, null, 2));

            expect(foundReport).toBeDefined();
            expect(foundReport.name).toBe(createdReportName);

            logger.info(` Test úspěšně dokončen: Sestava ${createdReportId} nalezena v seznamu.`);
        } catch (error) {
            logger.error(` CHYBA v testu 'GET /listOfUsersReports':`, error);
            throw error;
        }
    });

    // 4. Test pro smazání sestavy
    test('DELETE /usersReports/{SestavaId} - Smazání sestavy', async () => {
        test.skip(!createdReportId, 'Tento test vyžaduje ID z předchozího testu (create).');
        const endpoint = `/reports-api/usersReports/${createdReportId}`;
        logger.info(` Spouštím test endpointu: DELETE ${endpoint}`);

        try {
            await expect(apiClient.deleteUserReport(createdReportId!)).resolves.not.toThrow();
            logger.trace(`Požadavek na smazání sestavy ${createdReportId} byl úspěšně odeslán.`);
            
            logger.trace('Ověřuji, že sestava byla skutečně smazána...');
            const reportsAfterDelete = await apiClient.getUserReportsList();
            const deletedReport = reportsAfterDelete.data.find((r: any) => r.id === createdReportId);
            
            expect(deletedReport).toBeUndefined();
            
            logger.info(` Test úspěšně dokončen: Sestava ${createdReportId} byla smazána a ověřena.`);
            
            createdReportId = null; 
        } catch (error) {
            logger.error(` CHYBA v testu 'DELETE /usersReports':`, error);
            throw error;
        }
    });

    // 5. Nezávislý test pro seznam partnerů
    test('GET /listOfPartners - Získání seznamu partnerů', async () => {
        const endpoint = '/reports-api/listOfPartners';
        logger.info(`🚀 Spouštím test endpointu: GET ${endpoint}`);

        try {
            const response = await apiClient.getListOfPartners();
            logger.debug('Response data:\n' + JSON.stringify(response, null, 2));

            expect(response).toBeDefined();
            expect(Array.isArray(response.data)).toBe(true);
            
            logger.info(` Test úspěšně dokončen: Seznam partnerů získán.`);
        } catch (error) {
            logger.error(` CHYBA v testu 'GET /listOfPartners':`, error);
            throw error;
        }
    });
});