/**
 * @file Sestavy_Life_Cycle_API.spec.ts
 * @author Novák Marek
 * @date 16.09.2025
 * 
 * @description
 * Regresní test k projetí kompletního živontího cyklu všech sestav
 * 1. VYtvoření sestavy
 * 2. Přečtení id a items a public
 * 3. Vyhodnocení - je items > 0, je public true|false
 * 3. Smazání
 * 
 * @logic
 * 0. Autenitizace
 * 1. Sestaví payload pro sestavu z jsonu
 * 2. Payload je poslán na POST /reports-api/userReports
 * 3. GET
 * @precondtions
 * Pro spuštění je nutné mít platný autentizační token, který se získává přihlášením.
 */
import { test, expect } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../api/ApiClient';
import { logger } from '../../../support/logger';
import allReportsConfig from '../../../test-data/Sestavy_Life_Cycle_API.json';
import { ACC_OWNER_ID, baseURL } from '../../../support/constants';
import {postUserReportPayload} from '../../../api/types/reports'

//Defince struktury testovacíh dat

test.describe('Cyklus pro všechny sestavy, základní projetí, public = false', () => {
    let apiClient: ApiClient;

        for(const report of (allReportsConfig as unknown as postUserReportPayload[])){
            test(`${report.testCaseId}: Životní cyklus sestavy: ${report.name}, @regression @API @sestavy @high`, async ({ page }) => {
            let newReportDbId: number | string | undefined;
                try {
                    // --- Blok pro autenitizaci
                    logger.info(`Spouštím test životního cyklu pro sestavu: '${report.name}'`);
                    await page.goto('/');
                    logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
                    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
                    expect(token, 'Autentizační token nebyl nalezen v localStorage.').toBeTruthy();
                    logger.trace('Autentizační token úspěšně získán.');

                    const apiClient = new ApiClient(page.request, token!);
                    logger.trace('ApiClient byl inicializován.');

                    logger.trace('Deklarace a definicie: const payload')
                    const { testCaseId, ...apiPayload } = report;
                    logger.silly(`Definován payload = ${JSON.stringify(apiPayload)}`);

                    logger.trace(`Příprava na odeslání ${baseURL}/report-api/${ACC_OWNER_ID}`);
                    await apiClient.reports.postUserReport(
                         ACC_OWNER_ID,
                    apiPayload as postUserReportPayload
                    );

                    logger.debug('Přečtení Id sestavy');
                    const paramsGetListoUserReports = { limit: 1, sort: '-updated', offset: 0};
                    logger.debug(`Zavolání ${baseURL}/reports-api/ListfUserReports/${ACC_OWNER_ID}`);
                    const allReports = await apiClient.reports.getListOfUsersReports(ACC_OWNER_ID, paramsGetListoUserReports);
                    logger.silly(`Uložení allReports: ${allReports}`);

                    logger.debug('Check length of response /reports-api/ListOfUserReports');
                    if (!allReports || allReports.length === 0) {
                        throw new Error('List of reports empty, it is not possible find ID.');
                    }
                    logger.debug('Length of response - Ok');
                    logger.trace(`Save allReports: ${JSON.stringify(allReports, null, 2)}`);

                    logger.trace('Define reportsID');//Last created report
                    const reportId = allReports[0].id;

                    if(reportId === 0 || reportId === null){
                        throw new Error(`ID of report is ${reportId}`);
                    }
                    logger.debug(`Check Id is ok ReportsId = ${reportId}`);

                    logger.trace('Define itemsID'); //Counts items in report
                    const itemsCount:number = allReports[0].items;

                    logger.debug(`Ověřuji, že počet položek (items) v sestavě '${report.name}' není null.`);
                    expect(itemsCount, `CHYBA: Sestava '${report.name}' selhala při generování na serveru (items je null).`).not.toBeNull();

                    if (itemsCount === 0 || itemsCount === null) {
                        throw new Error(`Počet objektů pro sestavu '${report.name}' je '${itemsCount}'. Může se jednat o chybu, nebo jen nedostatek dat.`);
                    } else {
                        logger.info(`Vytvořená sestava '${report.name}' (ID: ${newReportDbId}) obsahuje ${itemsCount} položek.`);
                    }
                
                    //Delete last report (cleaning)
                    logger.debug('Remove last User report');
                    await apiClient.reports.deleteUserReport(reportId);
                    
                    //check removing last report
                    logger.debug('Call GET /ListOfUserReports');
                    const newAllReports = await apiClient.reports.getListOfUsersReports(ACC_OWNER_ID, paramsGetListoUserReports);
                    
                    logger.trace('Define newReportId'); //Id after removing last report
                    const newReportId:number = newAllReports[0].id;
                    logger.trace(`newReportID = ${newReportId}`);
                    if(reportId === newReportId){
                        throw new Error('Report was not deleted');
                    }

                }catch (error) {
                    logger.fatal(`Unknown fatal error'${report.name}'.`, error);
                    throw error;
                }finally{
            }
        }); 
    } 
}); 