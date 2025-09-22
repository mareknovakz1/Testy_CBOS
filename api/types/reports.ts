/**
 * @file reports.types.ts
 * @author Marek Novák
 * @date 12.09.2025
 * @description
 * Datové kontrakty pro ReportsApiService.
 * Obsahuje typy pro request payloady a response objekty.
 */

//================ General & Status Types ================
export type GenericApiResponse = Record<string, any>;
export type Format = 'xlsx' | 'csv' | 'csv2' | 'pdf';

export interface StatusResponse {
    app_name: string;
    status: string;
    version: string;
}

//================ Params for GET methods ================

export interface GetListOfCardIssuersParams {
    issuerType?: string;
    groupsConversionBy?: string;
}

export interface GetListOfBonusClassesParams {
    accOwner: string;
}

export interface GetListOfLocalCardsParams {
    listType?: 'unassigned';
    partnerId?: number;
    accOwner?: string;
    cardType?: 1 | 2 | 3 | 4;
    cardIdentification?: 'D' | 'U' | 'V';
}

export interface GetListOfPartnersParams {
    partnerType?: 'O' | 'F' | 'D' | 'W' | 'T' | 'G' | 'L';
    accOwner?: string;
    id?: number;
    ico?: string;
    balanceInterval?: 'W' | 'H' | 'M' | 'F';
    stockId?: string; // e.g., "1,2"
    allStocks?: boolean;
}

export interface GetListOfForeignStocksPricesParams {
    accOwner: string;
    stockId?: number;
    dateFrom?: string; // ISO Date
    dateTo?: string; // ISO Date
    year?: number;
    month?: number;
    day?: number;
}

export interface GetListOfReceiptsParams {
    stockId: number;
    year: number;
    month: number;
    day?: number;
    accOwner?: string;
    termId?: boolean;
    recType?: string;
    paidBy?: string;
    operator?: string;
    dateFrom?: string; // ISO Date
    dateTo?: string; // ISO Date
    cardIssuerId?: number;
    totalReceiptPriceFrom?: number;
    totalReceiptPriceTo?: number;
    receiptItemPriceFrom?: number;
    receiptItemPriceTo?: number;
    cgroupId?: string;
    lgroupId?: string;
    categoryId?: string;
    receiptNrFrom?: string;
    receiptNrTo?: string;
    search?: string;
    searchType?: 'EAN' | 'PLU' | 'card' | 'receiptText' | 'fullSearch';
}

export interface GetListOfStockCardsParams {
    stkitmType?: 'D' | 'S' | 'W';
    cgroupId?: number;
    supplyStatus?: 1 | 2 | 3;
    withSupplyOnly?: boolean;
    withSellingPrice?: boolean;
    notApprovedOnly?: boolean;
    tandemOnly?: boolean;
    mainOnly?: boolean;
    takeMain?: boolean;
    ownerId?: number;
    supplierId?: number;
    vatClsId?: number;
    ctClsId?: number;
    lgroupId?: number;
    category?: string;
    valid?: boolean;
}

export interface GetListOfRolesParams {
    scheme: 'cbos' | 'gpos';
    scale?: number;
    type?: 'S' | 'U';
}

export interface GetListOfGoodsDeliveryNotesParams {
    stockId: number;
    year: number;
    sign: '+' | '-';
    month?: number;
    day?: number;
    documentType?: number;
    documentSubType?: number;
    ownerId?: number;
    supplierId?: number;
    documentsStatus?: number;
    operator?: string;
}

export interface getListOfUsersReports {
    offset: number; //inicializační honota offset
    limit: number; //Doporučeno 1
    sort: string; //Doporučeno -updatet
}

export interface GetPartnerTransactionsParams {
    partnerId: number;
    year: number;
    month: number;
    day?: number;
    stkitmType?: string;
    groupId?: number;
    stockId?: number;
    cardIdentification?: 'D' | 'V' | 'U';
    responseType?: string;
    format?: Format;
}

export interface GetStockCardTransactionsParams {
    stockCardId: number;
    dateFrom: string; // ISO Date
    dateTo?: string; // ISO Date
    excludeSpecialTransactions?: boolean;
}

export interface GetUserReportPreviewParams {
    format?: Format;
    sort?: string;
    offset?: number;
    limit?: number;
}

//================ Payloads for POST/PUT methods ================


interface postUserReportParameters {
    tabsParam: string;
    exportIntoTabs: boolean;
    exportFileName: boolean;
    exportDateTime: boolean;
    summaries: boolean;
}

export interface postUserReportPayload {
    testCaseId: string;
    name: string;
    public: boolean;
    reportDefinitionId: string;
    settings: {
        availableFilters: string[];      
        dateModelType: string;
        dateFrom: string;                
        dateTo: string | null;          
        stockId: (string | number)[];
        stkitmType: (string | number)[];
        groupId: (string | number)[];
        goodsOwnerId: (string | number)[];
        paidBy: (string | number)[];
        cardOwnerId: (string | number)[];
        cardIssuerId: (string | number)[]; 
        sort: string;
        exportParameters: postUserReportParameters; 
    };
}

export interface UpdateUserReportPayload {
    settings?: object;
    name?: string;
    public?: boolean;
}

export interface CreatePriceTagsPayload {
    plus: any[];
}

