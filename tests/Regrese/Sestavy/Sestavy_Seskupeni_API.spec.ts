import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ReportBuilder } from '../../../support/ReportBuilder';
import { logger } from '../../../support/logger';
import { ApiClient } from '../../../support/ApiClient';

// Pro lepší typovou bezpečnost definujeme jednoduché rozhraní pro objekt sestavy
interface Report {
    id: number | string;
    name: string;
    items: number | null;
}

/**
 * Vytvoří sadu kumulativních testů pro danou sestavu a její úrovně seskupení.
 * @param reportId - ID sestavy (např. 'D001').
 * @param groupIds - Pole řetězců představujících ID pro seskupení.
 * @param testCaseIds - Pole ID testovacích případů odpovídajících jednotlivým úrovním seskupení.
 */
function createCumulativeGroupingTests(
    reportId: string,
    groupIds: string[],
    testCaseIds: string[]
) {
    // Kontrola, zda máme dostatek Test Case ID pro všechny generované testy
    if (testCaseIds.length !== groupIds.length + 1) {
        throw new Error(`Počet Test Case ID (${testCaseIds.length}) neodpovídá počtu testů (${groupIds.length + 1}) pro sestavu ${reportId}.`);
    }

    test.describe(`${reportId} - Kumulativní testování seskupování`, () => {
        
        // Vytvoření konstanty pro ID uživatele, aby se neopakovalo
        const testUserId = '60193531';

        for (let i = 0; i <= groupIds.length; i++) {

            const currentGroupIds = groupIds.slice(0, i);
            const testCaseName = i === 0
                ? 'Bez seskupení'
                : `Seskupeno podle: ${currentGroupIds.join(', ')}`;

            // Všimněte si, že z fixture bereme přímo 'apiClient'
            test(`${testCaseIds[i]}: Životní cyklus ${reportId}: ${testCaseName} @regression @API @medium @sestavy`, async ({ apiClient }) => {
                let newReportDbId: number | string | undefined;
                const reportFullName = `${reportId} - Kumulativní test: ${i}`;

                try {
                    // 1. Vytvoření sestavy
                    const reportPayload = new ReportBuilder(reportId, reportFullName)
                        .withDateRange(new Date('2025-01-01'), new Date('2025-12-31'))
                        .withGrouping(currentGroupIds)
                        .build();

                    logger.debug(`Odesílám payload pro '${testCaseName}': ${JSON.stringify(reportPayload.settings.groupId)}`);
                    await apiClient.createUserReport(testUserId, reportPayload);

                    // 2. Přečtení a ověření
                    const allReports: Report[] = await apiClient.getListOfUsersReports(testUserId);
                    const createdReport = allReports.find((r: Report) => r.name === reportFullName);

                    expect(createdReport, `Uložená sestava '${reportFullName}' nebyla nalezena.`).toBeDefined();

                    newReportDbId = createdReport!.id;
                    const itemsCount = createdReport!.items;

                    expect(itemsCount, `Počet objektů pro '${testCaseName}' je 'null' nebo 0.`).not.toBeNull();
                    expect(itemsCount).toBeGreaterThan(0);

                    logger.info(`Vytvořena sestava '${testCaseName}' (ID: ${newReportDbId}). Obsahuje: ${itemsCount} položek.`);

                } finally {
                    // 3. Úklid a ověření smazání
                    if (newReportDbId) {
                        await apiClient.deleteUserReport(newReportDbId);
                        const reportsAfterDelete = await apiClient.getListOfUsersReports(testUserId);
                        const deletedReportExists = reportsAfterDelete.some((r: Report) => r.id === newReportDbId);

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
// Vytvoříme 12 testů (1 bez seskupení + 11 úrovní), takže potřebujeme 12 ID
const d001TestCaseIds = [
    'TC-1266', 'TC-1267', 'TC-1268', 'TC-1269', 'TC-1270', 'TC-1271',
    'TC-1272', 'TC-1273', 'TC-1274', 'TC-1275', 'TC-1276', 'TC-1277'
];

const p001GroupIds = [
    "plu", "supplierLabel", "stockLabel", "groupLabel", "documentLabel"
];
// Vytvoříme 6 testů (1 bez seskupení + 5 úrovní), takže potřebujeme 6 ID
const p001TestCaseIds = [
    'TC-1278', 'TC-1279', 'TC-1280', 'TC-1281', 'TC-1282', 'TC-1283'
];


// --- Spuštění testů ---
createCumulativeGroupingTests('D001', d001GroupIds, d001TestCaseIds);
createCumulativeGroupingTests('P001', p001GroupIds, p001TestCaseIds);