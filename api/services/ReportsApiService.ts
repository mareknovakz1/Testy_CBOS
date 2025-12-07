/**
 * @file ReportsApiService.ts
 * @author Marek Novák
 * @date 29.09.2025
 * @description
 * This file contains the ReportsApiService, a dedicated service class for
 * interacting with the reporting-related endpoints of the API.
 * @classdesc
 * The ReportsApiService extends the BaseApiClient and provides specific
 * methods for report-related operations, such as fetching various lists
 * and generating reports.
 */

import { BaseApiClient } from '../BaseApiClient';
import * as ReportTypes from '../types/reports';
import * as t from '../types/reports'; // Ujisti se, že máš správný import
import { GetJournalsValidatorParams, JournalValidatorItem } from '../types/reports';

export class ReportsApiService extends BaseApiClient {
  
    // ========================
    // Group: Seznamy
    // ========================

    //Sestaví seznam vydavatelů karet.
    public async getListOfCardIssuers(params: ReportTypes.GetListOfCardIssuersParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfCardIssuers', params);
    }

    /**
     * Načte seznam bonusových tříd.
     */
    public async getListOfBonusClasses(params: ReportTypes.GetListOfBonusClassesParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfBonusClasses', params);
    }
    
    /**
     * Sestaví seznam tříd spotřebních daní.
     */
    public async getListOfCtClasses(): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfCtClasses');
    }

    /**
     * Sestaví seznam lokálních fleet karet.
     */
    public async getListOfLocalCards(params: ReportTypes.GetListOfLocalCardsParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfLocalCards', params);
    }

    /**
     * Sestaví seznam partnerů.
     */
    public async getListOfPartners(params: ReportTypes.GetListOfPartnersParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api//listOfPartners', params);
    }
    
    /**
     * Sestaví seznam žádostí o Euro-Oil kartu.
     */
    public async getListOfEuroOilCardRequests(stockId: number): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfEuroOilCardRequests', { stockId });
    }

    /**
     * Sestaví seznam centrálních kurzů.
     */
    public async getListOfCurrencyRates(accOwner?: string): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfCurrencyRates', { accOwner });
    }

 /**
 * Sestaví seznam konkurenčních obchodních míst - CCS.
 * @param params Objekt s query parametry (sort, limit, offset, atd.)
 */
public async getListOfForeignStocksCCS(params: ReportTypes.GetListOfForeignStocksCCSParams): Promise<ReportTypes.GenericApiResponse> {
    // This passes the params {sort, offset, limit} directly
    return this.get('/reports-api/listOfForeignStocksCCS', params);
}

    /**
     * Sestaví seznam konkurenčních cen.
     */
    public async getListOfForeignStocksPrices(params: ReportTypes.GetListOfForeignStocksPricesParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfForeignStocksPrices', params);
    }
    
    /**
     * Sestaví seznam cenových kategorií.
     */
    public async getListOfPricesCategories(type?: 'A' | 'F' | 'P'): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfPricesCategories', { type });
    }
    
    /**
     * Sestaví seznam účtenek.
     */
    public async getListOfReceipts(params: ReportTypes.GetListOfReceiptsParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfReceipts', params);
    }

    /**
     * Sestaví seznam účtenek UDD.
     */
    public async getListOfReceiptsUdd(stockId: number, year: number, accOwner?: string): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfReceiptsUdd', { stockId, year, accOwner });
    }
    
    /**
     * Sestaví seznam skladových karet.
     */
    public async getListOfStockCards(accOwner: string, stockId: number, params: ReportTypes.GetListOfStockCardsParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/listOfStockCards/${accOwner}/${stockId}`, params);
    }

    /**
     * Sestaví seznam jedinečných PLU skladových karet.
     */
    public async getListOfRootStockCards(params: { stkitmType?: 'D' | 'S' | 'W'; accOwner?: string; stockId?: number; plu?: string; ean?: string; valid?: boolean } = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfRootStockCards', params);
    }
    
    /**
     * Sestaví seznam skladů.
     */
    public async getListOfStocks(params: { valid?: boolean, withVirtualStock?: boolean } = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfStocks', params);
    }
    
    /**
     * Sestaví seznam uživatelů.
     */
    public async getListOfUsers(params: { cbosScale?: number, accOwner?: string, stockId?: number } = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfUsers', params);
    }

    /**
     * Sestaví seznam tříd DPH.
     */
    public async getListOfVatClasses(): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfVatClasses');
    }

    /**
     * Sestaví seznam šablon pro nastavení práv.
     */
    public async getListOfRoles(params: ReportTypes.GetListOfRolesParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfRoles', params);
    }

    /**
     * Seznam příjemek / výdejek.
     */
    public async getListOfGoodsDeliveryNotes(params: ReportTypes.GetListOfGoodsDeliveryNotesParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfGoodsDeliveryNotes', params);
    }

    /**
     * Sestaví seznam inventur.
     */
    public async getListOfGoodsInventories(params: { stockId: number; year: number; month?: number; day?: number; search?: string; searchType?: string; groupId?: number; documentsStatus?: number; operator?: string; }): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfGoodsInventories', params);
    }
    
    /**
     * Sestaví seznam objednávek.
     */
    public async getListOfOrders(params: { stockId: number; year: number; month?: number; day?: number; fullSearch?: string; supplierId?: number; documentsStatus?: number; operator?: string; }): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfOrders', params);
    }
    
    /**
     * *Zobrazí senznam registrů.
     */
    public async getListOfRegisters(params: { stockId?: number; sort?: number; offset?: number; limit?: number; format?: string;}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfRegisters', params);
    }
    
    // ========================
    // Group: Reporty
    // ========================

    /**
     * Sestaví přehled transakcí pro partnera.
     */
    public async getPartnerTransactions(params: ReportTypes.GetPartnerTransactionsParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/partnerTransactions', params);
    }
    
    /**
     * Sestaví přehled pohybů na skladové kartě.
     */
    public async getStockCardTransactions(params: ReportTypes.GetStockCardTransactionsParams): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/stockCardTransactions', params);
    }

    // ========================
    // Group: Sestavy (UserReports)
    // ========================

    /**
     * Získá seznam uživatelských reportů pro daný účet.
     */
    public async getListOfUsersReports(accOwner: string, payload: ReportTypes.getListOfUsersReports): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/listOfUsersReports/${accOwner}`);
    }
    
    /**
     * Získá detail uživatelského reportu podle ID.
     */
    public async getUserReportById(id: number): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/usersReports/${id}`);
    }

    /**
     * Vytvoří sestavu
     */
    public async postUserReport(accOwner: string, payload: ReportTypes.postUserReportPayload): Promise<ReportTypes.GenericApiResponse> {
        return this.post(`/reports-api/usersReports/${accOwner}`, payload);
    }

    /**
     * Aktualizuje existující uživatelský report.
     */
    public async putUserReport(id: number, payload: ReportTypes.UpdateUserReportPayload): Promise<ReportTypes.GenericApiResponse> {
        return this.put(`/reports-api/usersReports/${id}`, payload);
    }
    
    /**
     * Smaže uživatelský report.
     */
    public async deleteUserReport(id: number): Promise<void> {
        return this.delete(`/reports-api/usersReports/${id}`);
    }
    
    //Získá náhled dat pro uživatelský report (JSON nebo soubor).
    public async getUserReportPreview(id: string, params: ReportTypes.GetUserReportPreviewParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/userReportPreview/${id}`, params);
    }

    /**
 * Získá seznam stvrzenek o složení hotovosti.
 * @param params Objekt s parametry { stockId, dateFrom, dateTo?, format? }.
 */
    public async getListOfPosTankTickets(params: ReportTypes.GetListOfPosTankTicketsParams): Promise<t.GenericApiResponse> {
    // BaseApiClient automaticky převede 'params' objekt na query string
    return this.get(`/reports-api/listOfPosTankTickets`, params);
    }

    /**
     * Získá seznam vkladů a výběrů hotovosti.
     * @param params Objekt s parametry { stockId, dateFrom, dateTo?, format? }.
     */
    public async getListOfPosMoneyOperations(params: ReportTypes.GetListOfPosMoneyOperationsParams): Promise<t.GenericApiResponse> {
    // BaseApiClient automaticky převede 'params' objekt na query string
    return this.get(`/reports-api/listOfPosMoneyOperations`, params);
    }
    /**
     * Získá seznam přeplatkových poukázek.
     * @param params Objekt s parametry { stockId, dateFrom, ... }.
     */
    public async getListOfPosTankVouchers(params: ReportTypes.GetListOfPosTankVouchersParams): Promise<t.GenericApiResponse> {
    // BaseApiClient automaticky převede 'params' objekt na query string
    return this.get(`/reports-api/listOfPosTankVouchers`, params);
    }

    /**
 * Získá seznam čerpadlových dodacích listů.
 * @param params Objekt s parametry { stockId, year, ... }.
 */
public async getListOfWetDeliveryNotes(params: ReportTypes.GetListOfWetDeliveryNotesParams): Promise<t.GenericApiResponse> {
    // BaseApiClient automaticky převede 'params' objekt na query string
    return this.get(`/reports-api/listOfWetDeliveryNotes`, params);
    }

/**
 * Získá seznam výčetek hotovostních akceptorů
 * 
*/
async getListOfJournalsValidator(params: GetJournalsValidatorParams): Promise<JournalValidatorItem[]> {
    // BaseApiClient automaticky převede 'params' objekt na query string
    return this.get(`/reports-api/listOfCashAcceptorsCashCounts`, params);
    }

}

