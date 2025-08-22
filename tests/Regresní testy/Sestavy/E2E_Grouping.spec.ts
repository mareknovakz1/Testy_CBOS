import { test, expect } from '../../support/fixtures/auth.fixture';
import { ReportBuilder } from '../../support/ReportBuilder';
import { logger } from '../../support/logger';
import { ApiClient } from '../../support/ApiClient';

/**
 * Vytvoří sadu kumulativních testů pro danou sestavu a její úrovně seskupení.
 * @param reportId - ID sestavy (např. 'D001').
 * @param groupIds - Pole řetězců představujících ID pro seskupení.
 */
function createCumulativeGroupingTests(reportId: string, groupIds: string[]) {
    
    test.describe(`${reportId} - Kumulativní testování seskupování`, () => {
        for (let i = 0; i <= groupIds.length; i++) {
            
            const currentGroupIds = groupIds.slice(0, i);
            const testCaseName = i === 0 
                ? 'Bez seskupení' 
                : `Seskupeno podle: ${currentGroupIds.join(', ')}`;

            // Všimněte si, že z fixture bereme přímo 'apiClient'
            test(`Životní cyklus ${reportId}: ${testCaseName}`, async ({ apiClient }) => {
                let newReportDbId: number | string | undefined;
                const reportFullName = `${reportId} - Kumulativní test: ${i}`;

                try {
                    // 1. Vytvoření sestavy
                    const reportPayload = new ReportBuilder(reportId, reportFullName)
                        .withDateRange(new Date('2025-01-01'), new Date('2025-12-31'))
                        .withGrouping(currentGroupIds)
                        .build();

                    logger.debug(`Odesílám payload pro '${testCaseName}': ${JSON.stringify(reportPayload.settings.groupId)}`);
                    await apiClient.createUserReport('60193531', reportPayload);

                    // 2. Přečtení a ověření
                    const allReports = await apiClient.getUserReportsList();
                    const createdReport = allReports.find(r => r.name === reportFullName);
                    test.fail(!createdReport, `Uložená sestava '${reportFullName}' nebyla nalezena.`);

                    newReportDbId = createdReport!.id;
                    const itemsCount = createdReport!.items;

                    if (itemsCount === null || itemsCount === 0) {
                        test.fail(true, `Počet objektů pro '${testCaseName}' je 'null' nebo 0.`);
                    } else {
                        logger.info(`Vytvořena sestava '${testCaseName}' (ID: ${newReportDbId}). Obsahuje: ${itemsCount} položek.`);
                    }

                } finally {
                    // 3. Úklid a ověření smazání
                    if (newReportDbId) {
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
}

// --- Definice dat pro jednotlivé sestavy ---
const d001GroupIds = [
    "date", "monthLabel", "stockLabel", "stkitmTypeLabel",
    "groupLabel", "plu", "recText", "paidByLabel", "vatValue",
    "cardIssuerLabel", "localCardOwnerLabel"
];

const p001GroupIds = [
    "plu", "supplierLabel", "stockLabel", "groupLabel", "documentLabel"
];

// --- Spuštění testů ---
createCumulativeGroupingTests('D001', d001GroupIds);
createCumulativeGroupingTests('P001', p001GroupIds);