import { test, expect } from '../../support/fixtures/auth.fixture';
import { ApiClient } from '../../support/ApiClient';
import { ReportBuilder } from '../../support/ReportBuilder';
import { logger } from '../../support/logger';

// --- Blok pro sestavení D001
const allGroupIds = [
    "date", "monthLabel", "stockLabel", "stkitmTypeLabel",
    "groupLabel", "plu", "recText", "paidByLabel", "vatValue",
    "cardIssuerLabel", "localCardOwnerLabel"
];

test.describe('D001 - Kumulativní testování seskupování', () => {

    // Cyklus, který postupně zvyšuje počet úrovní seskupení (od 0 do plného počtu)
    for (let i = 0; i <= allGroupIds.length; i++) {
        
        // Vytvoříme pole skupin pro aktuální iteraci
        const currentGroupIds = allGroupIds.slice(0, i);
        
        // Dynamický název testu podle aktuální konfigurace
        const testCaseName = (i === 0) 
            ? 'Bez seskupení' 
            : `Seskupeno podle: ${currentGroupIds.join(', ')}`;

        test(`Životní cyklus D001: ${testCaseName}`, async ({ page }) => {
            let newReportDbId: number | string | undefined;
            const reportId = 'D001';
            const reportFullName = `D001 - Kumulativní test: ${i}`;

            try {
                await page.goto('/');
                const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                expect(token).toBeTruthy();
                const apiClient = new ApiClient(page.request, token!);

                // 1. Vytvoření sestavy s daným seskupením
                const reportPayload = new ReportBuilder(reportId, reportFullName)
                    .withDateRange(new Date('2025-01-01'), new Date('2025-12-31'))
                    .withGrouping(currentGroupIds) // Aplikujeme aktuální seskupení
                    .build();
                
                logger.debug(`Odesílám payload pro '${testCaseName}': ${JSON.stringify(reportPayload.settings.groupId)}`);
                await apiClient.createUserReport('60193531', reportPayload);

                // 2. Přečtení a ověření
                const allReports = await apiClient.getUserReportsList();
                const createdReport = allReports.find(r => r.name === reportFullName);
                test.fail(!createdReport, `Uložená sestava '${reportFullName}' nebyla nalezena v seznamu.`);

                newReportDbId = createdReport!.id;
                const itemsCount = createdReport!.items;

                if (itemsCount === null) {
                    const errorMessage = `Počet objektů pro '${testCaseName}' je 'null'.`;
                    logger.error(errorMessage);
                    test.fail(true, errorMessage);
                } else {
                    logger.info(`Vytvořena sestava '${testCaseName}' (ID: ${newReportDbId}). Obsahuje: ${itemsCount} položek.`);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě u '${testCaseName}'.`, error);
                throw error;
            } finally {
                // 3. Úklid a ověření smazání
                if (newReportDbId) {
                    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                    const apiClient = new ApiClient(page.request, token!);
                    
                    await apiClient.deleteUserReport(newReportDbId);
                    
                    const reportsAfterDelete = await apiClient.getUserReportsList();
                    const deletedReportExists = reportsAfterDelete.some(r => r.id === newReportDbId);
                    
                    expect(deletedReportExists, `Sestava '${reportFullName}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                    logger.trace(`Ověření úspěšné: Sestava (ID: ${newReportDbId}) byla smazána.`);
                }
            }
        });
    }
});

test.describe('P001 - Kumulativní testování seskupování', () => {

    // --- DEFINICE ÚROVNÍ SESKUPOVÁNÍ PRO SESTAVU P001 ---
    const p001GroupIds = [
        "plu", "supplierLabel", "stockLabel", "groupLabel", "documentLabel"
    ];

    for (let i = 0; i <= p001GroupIds.length; i++) {
        
        const currentGroupIds = p001GroupIds.slice(0, i);
        
        const testCaseName = (i === 0) 
            ? 'Bez seskupení' 
            : `Seskupeno podle: ${currentGroupIds.join(', ')}`;

        test(`Životní cyklus P001: ${testCaseName}`, async ({ page }) => {
            let newReportDbId: number | string | undefined;
            const reportId = 'P001'; // Změna na P001
            const reportFullName = `P001 - Kumulativní test: ${i}`;

            try {
                await page.goto('/');
                const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                expect(token).toBeTruthy();
                const apiClient = new ApiClient(page.request, token!);

                const reportPayload = new ReportBuilder(reportId, reportFullName)
                    .withDateRange(new Date('2025-01-01'), new Date('2025-12-31'))
                    .withGrouping(currentGroupIds)
                    .build();
                
                logger.debug(`Odesílám payload pro P001 '${testCaseName}': ${JSON.stringify(reportPayload.settings.groupId)}`);
                await apiClient.createUserReport('60193531', reportPayload);

                const allReports = await apiClient.getUserReportsList();
                const createdReport = allReports.find(r => r.name === reportFullName);
                test.fail(!createdReport, `Uložená sestava '${reportFullName}' nebyla nalezena v seznamu.`);

                newReportDbId = createdReport!.id;
                const itemsCount = createdReport!.items;

                if (itemsCount === null) {
                    const errorMessage = `Počet objektů pro P001 '${testCaseName}' je 'null'.`;
                    logger.error(errorMessage);
                    test.fail(true, errorMessage);
                } else {
                    logger.info(`Vytvořena sestava P001 '${testCaseName}' (ID: ${newReportDbId}). Obsahuje: ${itemsCount} položek.`);
                }

            } catch (error) {
                logger.fatal(`Došlo k fatální chybě u P001 '${testCaseName}'.`, error);
                throw error;
            } finally {
                if (newReportDbId) {
                    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                    const apiClient = new ApiClient(page.request, token!);
                    
                    await apiClient.deleteUserReport(newReportDbId);
                    
                    const reportsAfterDelete = await apiClient.getUserReportsList();
                    const deletedReportExists = reportsAfterDelete.some(r => r.id === newReportDbId);
                    
                    expect(deletedReportExists, `Sestava '${reportFullName}' (ID: ${newReportDbId}) nebyla smazána!`).toBe(false);
                    logger.trace(`Ověření úspěšné: Sestava P001 (ID: ${newReportDbId}) byla smazána.`);
                }
            }
        });
    }
});