/**
 * @file Sestavy_life_cycle_api.spec.ts
 * @author Marek Novák (via Gemini)
 * @date 05.11.2025
 * @description
 * Regresní E2E API test pro kompletní životní cyklus uživatelské sestavy.
 * Tento skript dynamicky generuje testy pro všechny případy v JSON datech.
 *
 * @logic
 * Krok 1: Vytvoření sestavy (POST /reports-api/usersReports)
 * Krok 2: Ověření vytvoření a čtení dat (GET /reports-api/listOfUsersReports)
 * Krok 3: Smazání sestavy (DELETE /reports-api/usersReports/{id})
 *
 * @tags @regression @report @api @medium
 */

import { test, expect } from '../../../support/fixtures/auth.fixture';
import { logger } from '../../../support/logger';
import * as ReportTypes from '../../../api/types/reports';
import { ACC_OWNER_ID } from '../../../support/constants';
import allReportData from '../../../test-data/Sestavy_life_cycle_regrese.json';

//logger.silly(`Načtena testovací data: ${JSON.stringify(allReportData, null, 2)}`);

// OPRAVA: Projdeme všechny klíče v JSON souboru (např. "TC_Sestavy_001", "TC_Sestavy_002", ...)
for (const testCaseKey of Object.keys(allReportData)) {

    // Dynamicky vytvoříme test pro každý klíč
    test(`${testCaseKey}: Krok 1: POST, Krok 2: GET, Krok 3: DELETE @regression @report @api @medium`, async ({ apiClient }) => {

        // OPRAVA: Načteme data pro aktuální test case
        const testCaseData = allReportData[testCaseKey as keyof typeof allReportData];

        // Proměnné sdílené mezi kroky
        let createdReportId: number;
        
        // Získáme základní název z testovacích dat
        const baseReportName = testCaseData.step1_CreateReport.name;
        // Vytvoříme unikátní název, abychom sestavu spolehlivě našli
        const uniqueReportName = `${baseReportName} - ${Date.now()}`;
        
        // Proměnné pro logování v 'catch' bloku
        let endpoint: string;
        let response: any;

        logger.info(`Spouštím test životního cyklu sestavy: ${uniqueReportName} (Definice: ${testCaseData.step1_CreateReport.reportDefinitionId})`);
        logger.trace('ApiClient byl inicializován fixturou.');

        // Krok 1: Vytvoření sestavy
        await test.step('Krok 1: POST /reports-api/usersReports/{accOwner}', async () => {
            endpoint = `/reports-api/usersReports/${ACC_OWNER_ID}`;
            logger.info(`Krok 1: Vytváření nové sestavy: ${uniqueReportName}`);

            // Načteme data pro krok 1 z aktuální iterace
            const testCase = testCaseData.step1_CreateReport;

            // Sestavíme payload s použitím dat z JSONu
            const payload: ReportTypes.postUserReportPayload = {
                name: uniqueReportName, // Stále používáme unikátní jméno
                public: testCase.public,
                reportDefinitionId: testCase.reportDefinitionId,
                // Použijeme 'as any' pro snadné přetypování z JSONu
                settings: testCase.settings as any 
            };
            
            logger.debug(`Payload pro ${endpoint}: ${JSON.stringify(payload, null, 2)}`);

            try {
                logger.trace(`Odesílám POST požadavek na ${endpoint}`);
                response = await apiClient.reports.postUserReport(ACC_OWNER_ID, payload);
                logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);
                
                logger.info('Krok 1: Sestava úspěšně vytvořena (Status 201 OK).');

            } catch (error) {
                const fullUrl = `${apiClient.reports.baseURL}${endpoint}`;
                logger.error(`Krok 1 (${testCaseKey}): Test selhal s chybou: ${error}, URL: ${fullUrl}`);
                throw error;
            }
        });

        // Krok 2: Přečtení ID a validace
        await test.step('Krok 2: GET /reports-api/listOfUsersReports/{accOwner}', async () => {
            endpoint = `/reports-api/listOfUsersReports/${ACC_OWNER_ID}`;
            logger.info(`Krok 2: Ověření vytvoření sestavy a čtení dat.`);
            
            // Načteme data pro krok 2 z aktuální iterace
            const testCase = testCaseData.step2_GetReportList;

            const params: ReportTypes.getListOfUsersReports = {
                offset: testCase.offset,
                limit: testCase.limit, 
                sort: testCase.sort 
            };

            logger.debug(`Parametry pro ${endpoint}: ${JSON.stringify(params)}`);

            try {
                logger.trace(`Odesílám GET požadavek na ${endpoint}`);
                
                // Používáme zděděnou metodu .get() pro spolehlivé předání parametrů
                response = await apiClient.reports.get(endpoint, params);
                
                logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);

                if (!response || !Array.isArray(response) || response.length === 0) {
                    logger.error('Krok 2: Seznam sestav je prázdný nebo neplatný.');
                    throw new Error('Odpověď ze seznamu sestav je prázdná.');
                }

                const lastReport = response[0];
                
                // Ověříme, že je to ta, kterou jsme právě vytvořili
                expect(lastReport.name, `Nalezená sestava '${lastReport.name}' neodpovídá vytvořené '${uniqueReportName}'`).toBe(uniqueReportName);

                createdReportId = lastReport.id;
                expect(createdReportId, "Nalezená sestava nemá platné ID.").toBeGreaterThan(0);
                logger.info(`Krok 2: Sestava '${uniqueReportName}' úspěšně nalezena s ID: ${createdReportId}.`);

                // Validace 'itemsCount' dle tvého plánu
                const itemsCount = lastReport.items; 
                logger.debug(`Nalezen počet položek (itemsCount): ${itemsCount}`);

                if (itemsCount === null) {
                    logger.error('Krok 2: Počet položek (itemsCount) je "null", což značí chybu.');
                    throw new Error('Počet položek v sestavě je null.');
                } else if (itemsCount === 0) {
                    logger.warn(`${lastReport.testCaseID} ${lastReport.reportDefinitionId} ${lastReport.name} Krok 2: Počet položek (itemsCount) je 0. Sestava je prázdná, ale test pokračuje.`);
                } else {
                    logger.info(`Krok 2: Sestava obsahuje ${itemsCount} položek.`);
                }

                logger.debug(`Sestava '${uniqueReportName}' má vlastnost public: ${lastReport.public}`);
                if (testCaseData.step1_CreateReport.public === false) {
                     expect(lastReport.public, `Sestava '${uniqueReportName}' by neměla být veřejná.`).toBe(false);
                }

                createdReportId = lastReport.id;

                createdReportId = lastReport.id;

            } catch (error) {
                const fullUrl = `${apiClient.reports.baseURL}${endpoint}?${new URLSearchParams(params as any)}`;
                logger.error(`Krok 2 (${testCaseKey}): Test selhal s chybou: ${error}, URL: ${fullUrl}`);
                throw error;
            }
        });

        //Krok 3: Smazání sestavy (Úklid)
        await test.step('Krok 3: DELETE /reports-api/usersReports/{id} (Úklid)', async () => {
            
            if (!createdReportId) {
                logger.error('Krok 3: Nelze provést úklid, protože ID sestavy (createdReportId) nebylo získáno v Kroku 2.');
                throw new Error("createdReportId chybí pro Krok 3.");
            }
            
            endpoint = `/reports-api/usersReports/${createdReportId}`;
            logger.info(`Krok 3: Mažu vytvořenou sestavu s ID: ${createdReportId}`);

            try {
                logger.trace(`Odesílám DELETE požadavek na ${endpoint}`);
                response = await apiClient.reports.deleteUserReport(createdReportId);
                logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);

                logger.info(`Krok 3: Sestava s ID ${createdReportId} úspěšně smazána.`);

            } catch (error) {
                const fullUrl = `${apiClient.reports.baseURL}${endpoint}`;
                logger.error(`Krok 3 (${testCaseKey}): Úklid selhal s chybou: ${error}, URL: ${fullUrl}`);
                throw error;
            }
        });

    }); // Konec bloku test
} // Konec cyklu for