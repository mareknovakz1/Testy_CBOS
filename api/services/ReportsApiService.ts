/**
 * @file ReportsApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje ReportsApiService, specializovanou službu pro komunikaci
 * s reportovacími endpointy API.
 * * @classdesc
 * ReportsApiService dědí od BaseApiClient a přidává metody specifické pro
 * operace s reporty, jako je získání seznamu reportů nebo vytvoření nového reportu.
 * */

import { BaseApiClient } from '../BaseApiClient';
import * as ReportTypes from '../types/reports';

export class ReportsApiService extends BaseApiClient {
  
    // ========================
    // Group: Seznamy
    // ========================

    /*
    //Sestaví seznam vydavatelů karet.
    public async getListOfCardIssuers(params: ReportTypes.GetListOfCardIssuersParams = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfCardIssuers', params);
    }*/

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
     */
    public async getListOfForeignStocksCCS(columns?: string): Promise<ReportTypes.GenericApiResponse> {
        return this.get('/reports-api/listOfForeignStocksCCS', { columns });
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
     * Sestaví seznam příjemek / výdejek.
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

    // ... a tak dále pro všechny ostatní "listOf" endpointy
    
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
    // Group: Sestavy (Uživatelské reporty)
    // ========================

    /**
     * Získá seznam uživatelských reportů pro daný účet.
     */
    public async getListOfUsersReports(accOwner: string): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/listOfUsersReports/${accOwner}`);
    }
    
    /**
     * Získá detail uživatelského reportu podle ID.
     */
    public async getUserReportById(id: number): Promise<ReportTypes.GenericApiResponse> {
        return this.get(`/reports-api/usersReports/${id}`);
    }

    /**
     * Vytvoří nový uživatelský report.
     */
    public async postUserReport(accOwner: string, payload: ReportTypes.CreateUserReportPayload): Promise<ReportTypes.GenericApiResponse> {
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
 
    //Vytvoří cenovky
  /*  public async postPriceTags(stockId: number, payload: ReportTypes.CreatePriceTagsPayload, params: { format?: 'pdf', orientation?: string } = {}): Promise<ReportTypes.GenericApiResponse> {
        return this.post(`/priceTags`, payload, { params: { stockId, ...params } });*/
    
}