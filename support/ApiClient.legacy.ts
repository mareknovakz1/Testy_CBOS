/*
 * API Client - Knihovna pro komunikaci s API
 * ? za promněnnou znamná - proměnná je volitelná -> zbytek je povinný
 *
 * ================= ADMINISTRATION-API =================
 * getPriceCategory() GET /administration-api/stockCardsCategories/{categoryId}
 * getStockCardsGroupsLocal() GET /administration-api/stockCardsGroupsLocal/{stockId}
 * getStockCardsSupergroupsLocal() GET /administration-api/stockCardsSupergroupsLocal/{stockId}
 * getListOfPosTerminals() GET /administration-api/listOfPosTerminals/{stockId}
 * getListOfHotKeysDefinitions() GET /administration-api/listOfHotKeysDefinitions/{stockId}/{posTerminalId}
 * getListOfCardDefinitions() GET /administration-api/listOfCardDefinitions/{accOwner}
 * getListOfForeignStocks() GET /administration-api/listOfForeignStocks/{accOwner}/{stockId}
 * getStockCardsCategories() GET /administration-api/stockCardsCategories/{accOwner}
 * getStockCardsGroupsCentral() GET /administration-api/stockCardsGroupsCentral/{accOwner}
 * getFsFeatures() GET /administration-api/fsfeature/{accOwner}
 *
 * ===================== AUTH-API =======================
 * authorizeUser() POST /auth-api/user/authorization
 *
 * ==================== BALANCES-API ====================
 * getSupplyPeriodsEnums() GET /balances-api/supplyPeriodsEnums/{stockId}
 * getListOfDailyBalances() GET /balances-api/dailyBillances/{stockId}
 * getDailyRevenues() GET /balances-api/dailyRevenues/{stockId}
 * getTurnovers() GET /balances-api/turnovers/{stockId}
 *
 * =================== DASHBOARD-API ====================
 * getTablesCountInfo() GET /dashboard-api/tablesCountInfo
 * getStocksTanks() GET /dashboard-api/stocksTanks/{stockId}
 * 
 * ==================== REPORTS-API =====================
 * getListOfUsersReports() GET /reports-api/listOfUsersReports/{accOwner}
 * createUserReport() POST /reports-api/usersReports/{SestavaId}
 * deleteUserReport() DELETE /reports-api/usersReports/{SestavaId}
 * getUserReportPreview() GET /reports-api/userReportPreview/{SestavaId}
 * getListOfPartners() GET /reports-api/listOfPartners
 * getUsers() GET /reports-api/listOfOperators
 * getCardIssuers() GET /reports-api/listOfCardIssuers
 * getReceipts() GET /reports-api/listOfReceipts
 * getListOfStocks() GET /reports-api/listOfStocks
 * getListOfStockCards() GET /reports-api/listOfStockCards/{accOwnerId}/{stockId}
 * getListOfLocalCards() GET /reports-api/listOfLocalCards
 * getListOfPricesCategories() GET /reports-api/listOfPricesCategories
 * getListOfEuroOilCardRequests() GET /reports-api/listOfEuroOilCardRequests
 * getListOfBonusClasses() GET /reports-api/listOfBonusClasses
 * getListOfOperators() GET /reports-api/listOfOperators
 * getListOfReceiptsUdd() GET /reports-api/listOfReceiptsUdd
 * getListOfPosTankTickets() GET /reports-api/listOfPosTankTickets
 * getListOfPosMoneyOperations() GET /reports-api/listOfPosMoneyOperations
 * getListOfPosTankVouchers() GET /reports-api/listOfPosTankVouchers
 * getListOfGoodsInventories() GET /reports-api/listOfGoodsInventories
 * getListOfOrders() GET /reports-api/listOfOrders 
 * getListOfWetDeliveryNotes() GET /reports-api/listOfWetDeliveryNotes
 * getListOfPosSummaries() GET /reports-api/listOfPosSummaries
 * getListOfUsers() GET /reports-api/listOfUsers
 * getListOfRoles() GET /reports-api/listOfRoles
 * getListOfVatClasses() GET /reports-api/listOfVatClasses
 * getListOfCardIssuers() GET /reports-api/listOfCardIssuers
 * getListOfForeignStocksCCS() GET /reports-api/listOfForeignStocksCCS
 * getListOfCurrencyRates() GET /reports-api/listOfCurrencyRates
 * 
 * =================== DOCUMENTS-API ====================
 * POST /documents-api/goodsDeliveryNotes/{stockId}
 * getOrderDetail() GET /documents-api/orders/{stockId}/{orderId} ---
 *
 * ===================== SOCKET-API =====================
 * getRegisteredClients() GET /socket-api/registeredClients
 *
 * ======================= OTHER ========================
 * getDashboard() GET /dashboard
 */


import { APIRequestContext } from '@playwright/test';
import { logger } from './logger';
import { baseURL } from './constants';


export interface UserReport {
    id: number | string;
    name: string;
    items: number | null;
    public: boolean;
    // ... případně doplňte další vlastnosti, které API vrací
}

/**
 * Definuje strukturu datového těla (payload) pro vytvoření
 * dodacího listu pro suché zboží.
 */
    export interface GoodsDeliveryNotePayload {
        accOwner: string;
        deliveryNoteNr: string;
        documentType: number;
        documentSubType: number;
        deliveryDate: string; // ISO 8601 formát, např. "2025-08-27T11:45:52.414Z"
        stockId: number;
        ownerId: number;
        ownerName: string;
        supplierId: number;
        supplierName: string;
        transporterId: number;
        transporterName: string;
        sign: string;
    }

    /**
     * deklarace payload pro: 
     * createOrder() POST /api/orders/stockId{stockId}
     */ 
    export interface OrderPayload {
            // --- Hlavička dodacího listu ---
        deliveryDate: string;      // (required) Datum doručení (ISO 8601)
        orderDate: string;         // (required) Datum objednání (ISO 8601)
        ownerId: number;           // (required) ID vlastníka
        ownerName: string;         // (required) Jméno vlastníka
        stockId: number;           // (required) ID obchodního místa
        supplierId: number;        // (required) ID dodavatele
        supplierName: string;      // (required) Jméno dodavatele
        description?: string;      // Popis (volitelný)
        transporterId?: string;    // ID přepravce (volitelné)
        transporterName?: string;  // Jméno přepravce (volitelné)

        // --- Položky dodacího listu ---
        items?: {
            goodsDeliveryNoteId: number; // (required)
            stockCardId: number;         // (required)
            stockCardName: string;       // (required)
            amount: number;              // (required)
            purchPrice: number;          
            vatValue: number;            
            vatClsId: number;            
            itemVat: number;             
            itemPrice: number;           
            itemPriceWithVat: number;    
            plu: string;                 
            newEan?: string;
            stockCardExtId?: number;
            newSalePriceWithoutVat?: number;
            newSalePriceWithVat?: number;

            // Vnořená tandemová karta (objekt je volitelný, ale pokud existuje, jeho pole jsou povinná)
            tandemStockCard?: {
            stockCardId: number;       // (required)
            stockCardName: string;     // (required)
            amount: number;            // (required)
            purchPrice: number;        // (required)
            vatValue: number;          // (required)
            vatClsId: number;          // (required)
            itemVat: number;           // (required)
            itemPrice: number;         // (required)
            itemPriceWithVat: number;  // (required)
            plu: string;               // (required)
            stockCardExtId?: number;
            newSalePriceWithoutVat?: number;
            newSalePriceWithVat?: number;
        };
    }[]; // Pole položek na dodacím listu
}

// Payload pro listOfDrivers
export interface listOfDriversPayload {
    accOwner: number;
    valid?: boolean;
    partnerId?: number;

    [key: string]: any; 
}

    /**
     * Interface pro volitelné parametry API metody getListOfStockCards.
     */
    export interface ListOfStockCardsPayload {
        stkitmType?: 'D' | 'S' | 'W';
        cgroupId?: number;
        supplyStatus?: 1 | 2 | 3; //Pravděposobně neyužíváno na UI
        withSupplyOnly?: boolean;
        withSellingPrice?: boolean;
        notApprovedOnly?: boolean;
        tandemOnly?: boolean;
        mainOnly?: boolean;
        takeMain?: boolean; 
        ownerId?: number;
        supplierId?: number;
        vatClsId?: number; //Třída DPH
        ctClsId?: number; //Třída SD
        lgroupId?: number;
        category?: string;
        valid?: boolean;
        // Parametry pro stránkování a řazení
        offset?: number;
        limit?: number;
        sort?: string;

    [key: string]: any;
    }
    //Payload pro listOfWetDeliveryNotes
    export interface listOfWetDeliveryNotesPayload {
    stockId: number;
    year: number;
    month?: number;
    day?: number;
    fullSearch?: string;
    supplierId?: number;
    documentType?: number;
    documentsStatus?: number;
    tankId?: number;
    operator?: string;
    format?: string;
}

export type GetListOfOrdersPayload = {
    stockId: number;
    year: number;
    month?: number;
    day?: number;
    fullSearch?: string;
    supplierId?: number;
    documentsStatus?: number;
    operator?: string;

    [key: string]: any;
};

export interface postOrderItemsPayload {
    orderId: number;
    stockCardId: number;
    amount: number;
}



export class ApiClient {
    static getDashboard() {
        throw new Error('Method not implemented.');
    }
    static getListOfStocks(arg0: { accOwner: any; limit: number; }) {
        throw new Error('Method not implemented.');
    }
    static getListOfStockCards(ACC_OWNER_ID: any, STOCK_ID: any, arg2: { limit: number; }) {
        throw new Error('Method not implemented.');
    }
  private request: APIRequestContext;
  private token: string;

  /** Konstruktor přijímá kontext pro posílání požadavků a autorizační token.
   * @param request - Objekt page.request z Playwrightu.
   * @param token - Bearer token pro autorizaci.
   */
  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

    /**
     * Získá seznam uživatelských sestav.
     * --- GET /reports-api/listOfUsersReports/{accOwner} ---
     * @param {string} accOwner - ID vlastníka účtu (povinný path parametr).
     * @param {object} params - Objekt s query parametry.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @param {string} [params.sort] - Řazení (např. '-operator').
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfUsersReports(
        accOwner: string,
        params: {
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<UserReport[]> {
        const endpoint = `/reports-api/listOfUsersReports/${accOwner}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params // Query parametry
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu uživatelských sestav. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu uživatelských sestav. Status: ${response.status()}`);
        }

        logger.silly(`Seznam uživatelských sestav byl úspěšně získán.`);
        return response.json();
    }

   /**--- POST createUserReport  /reports-api/usersReports/60193531 
   * Vytvoří novou uživatelskou sestavu.
   * Přijímá ID sestavy a hotový payload objekt.
   * @param SestavaId - ID sestavy.
   * @param payload - Kompletní objekt s daty sestavy, vytvořený pomocí ReportBuilder.
   * @param public - Sdílení sestaavy
   * @returns
   */
  public async createUserReport(SestavaId: string, payload: any): Promise<any> {
    const endpoint = `/reports-api/usersReports/60193531`;
     logger.trace(`Odesílaný PAYLOAD:\n${JSON.stringify(payload, null, 2)}`);

    const response = await this.request.post(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      data: payload 
    });

  } 
  /**--- METODA PRO SMAZÁNÍ SESTAVY ---
   * Smaže konkrétní uživatelskou sestavu.
   * DELETE /reports-api/userReports
   * @param SestavaId - ID sestavy, kterou chceme smazat.
   * @returns Prázdnou odpověď v případě úspěchu.
   */
  public async deleteUserReport(SestavaId: string | number): Promise<void> {
    const endpoint = `/reports-api/usersReports/${SestavaId}`;
    logger.trace(`Odesílám DELETE požadavek na smazání sestavy: ${endpoint}`);

    const response = await this.request.delete(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok()) {
      logger.error(`Chyba při mazání sestavy ${SestavaId}. Status: ${response.status()}`, await response.text());
      throw new Error(`Chyba při mazání sestavy ${SestavaId}. Status: ${response.status()}`);
    }  
    logger.silly(`Sestava ${SestavaId} byla úspěšně smazána (Status: ${response.status()}).`);
  }

  /**--- GET getUserReportPreview /reports-api/userReportPreview/{SestavaId} ---
   * Získá náhled sestavy podle jejího ID.
   * @param SestavaId - ID sestavy, pro kterou chceme získat náhled.
   * @param options - Volitelné parametry pro stránkování a řazení.
   * @returns Odpověď ze serveru ve formátu JSON (náhled sestavy).
   */
  public async getUserReportPreview(
    SestavaId: string | number,
    options: { offset?: number; limit?: number; sort?: string } = {}
  ): Promise<any> {
    const endpoint = `/reports-api/userReportPreview/${SestavaId}?offset=0&limit=1000&sort=date`;
    logger.trace(`Odesílám GET požadavek na získání náhledu sestavy: ${endpoint}`);
    const response = await this.request.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json, text/plain, */*'
      },
      params: {
        offset: options.offset ?? 0,
        limit: options.limit ?? 10,
        sort: options.sort ?? 'date'
      }
    });
    if (!response.ok()) {
      logger.error(`Chyba při získávání náhledu sestavy ${SestavaId}. Status: ${response.status()}`, await response.text());
      throw new Error(`Chyba při získávání náhledu sestavy ${SestavaId}. Status: ${response.status()}`);
    }
    logger.silly(`Náhled sestavy ${SestavaId} byl úspěšně získán.`);
    return response.json();
  }
  /** --- GET listOfPartners /reports-api/listOfPartners ---
 * Získá seznam partnerů (např. fleet karet) podle zadaných filtrů.
 * @param options - Objekt s parametry pro filtrování, např. { columns, accOwner, cardType, sort }.
 * @returns Odpověď ze serveru ve formátu JSON (pole partnerů).
 */
    public async getListOfPartners(options: {
    columns?: string[];
    accOwner?: string;
    cardType?: string;
    sort?: string;
    } = {}): Promise<any> {
    
    const endpoint = '/reports-api/listOfPartners';
    
    // Připravíme parametry pro request z poskytnutých možností
    const queryParams: { [key: string]: string | number } = {};
    if (options.columns) {
        queryParams.columns = options.columns.join(',');
    }
    if (options.accOwner) {
        queryParams.accOwner = options.accOwner;
    }
    if (options.cardType) {
        queryParams.localCardDetailType = options.cardType;
    }
    if (options.sort) {
        // Playwright správně zakóduje '+' jako '%2B'
        queryParams.sort = options.sort;
    }

    logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(queryParams)}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        },
        params: queryParams
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při získávání seznamu partnerů. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při získávání seznamu partnerů. Status: ${response.status()}`);
    }

    logger.silly(`Seznam partnerů byl úspěšně získán.`);
    return response.json();
    }
  /** --- GET filterOfReceipts /administration-api/stockCardsCategories/60193531 ---
   * Získá seznam filtrů pro účtenky.
   * @returns Odpověď ze serveru ve formátu JSON (pole filtrů).
   */
  public async getPriceCategory(): Promise<any> {
    const endpoint = '/administration-api/stockCardsCategories/60193531';
    logger.trace(`Odesílám GET požadavek na ${endpoint}`);

    const response = await this.request.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json, text/plain, */*'
      }
    });

    if (!response.ok()) {
      logger.error(`Chyba při získávání filtrů pro příjemky. Status: ${response.status()}`, await response.text());
      throw new Error(`Chyba při získávání filtrů pro příjemky. Status: ${response.status()}`);
    }

    logger.silly(`Filtry pro příjemky byly úspěšně získány.`);
    return response.json();
  }
 
  /** --- GET getUSers /reports-api/listOfOperators ---
   * Získá seznam uživatelů (operátorů).
   * @param stockId - ID skladu (např. 231)
   * @param year - Rok (např. 2025)
   * @param documentType - Typ dokumentu (např. 'R')
   * @returns Odpověď ze serveru ve formátu JSON (pole uživatelů).
   */
  public async getUsers(stockId: number, year: number, documentType: string): Promise<any> {
    const endpoint = `/reports-api/listOfOperators?stockId=${stockId}&year=${year}&documentType=${documentType}`;
    logger.trace(`Odesílám GET požadavek na ${endpoint}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        }
    });

    if (!response.ok()) {
        logger.error(`Chyba při získávání seznamu uživatelů. Status: ${response.status()}`, await response.text());
        throw new Error(`Chyba při získávání seznamu uživatelů. Status: ${response.status()}`);
    }

    logger.silly(`Seznam uživatelů byl úspěšně získán.`);
    return response.json();
  }  

  /**--- GET getCardIssuers /reports-api/listOfCardIssuers ---
   * Získá seznam vydavatelů karet podle zadaných filtrů.
   * @param columns - Pole názvů sloupců, které chceme zahrnout do odpovědi.
   * @returns Odpověď ze serveru ve formátu JSON (pole vydavatelů karet).
   */
  public async getCardIssuers(columns: string[]): Promise<any> {
    const endpoint = `/reports-api/listOfCardIssuers?columns=${columns.join(',')}`;
    logger.trace(`Odesílám GET požadavek na ${endpoint}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        }
    });

    if (!response.ok()) {
        logger.error(`Chyba při získávání vydavatelů karet. Status: ${response.status()}`, await response.text());
        throw new Error(`Chyba při získávání vydavatelů karet. Status: ${response.status()}`);
    }

    logger.silly(`Seznam vydavatelů karet byl úspěšně získán.`);
    return response.json();
  }

    /** --- GET listOfReceipts /reports-api/listOfReceipts ---
     * /reports-api/listOfReceipts{?stockId,accOwner,year,month,day,termId,operator,recType,paidBy,dateFrom,dateTo,ean,cardIssuerId,totalReceiptPriceFrom,totalReceiptPriceTo,receiptItemPriceFrom,receiptItemPriceTo,receiptNrFrom,receiptNrTo,cgroupId,lgroupId,categoryId,search,searchType}';
     * Získá seznam účtenek podle zadaných filtrů.
     * @param year - Rok (např. 2025)
     * @param stockId - ID skladu (např. 101)
     * @param totalReceiptPriceFrom - Minimální cena účtenky (např. 1)
     * @param receiptItemPriceFrom - Minimální cena položky účtenky (např. 0)
     * @param offset - Offset pro stránkování (např. 0)
     * @param limit - Limit pro stránkování (např. 10)
     * @param sort - Řazení (např. '-receipt')
     * @param recType - Typ účtenky (např. 'R')
     * @param cardIssuerID - ID vydavatele karty (např. 123)
     * @param groupId - ID centrální skupiny zboží (např. 456)
     * @param categoryId - ID centrální kategorie zboží (např. 789)
     * @param operator - Operátor (uživatel) (např. 'jan.novak')
     * @param paidBy - Způsob platby (např. 'B')
     * @param dateFrom - Datum od (např. '2025-01-01')
     * @param dateTo - Datum do (např. '2025-12-31')
     * @param receiptNrFrom - Číslo účtenky od (např. '0001')
     * @param receiptNrTo - Číslo účtenky do (např. '9999')
     * @param search - Hledaný text (např. 'test')
     * @param searchType - Typ hledání (např. 'fullSearch')
     * @returns Odpověď ze serveru ve formátu JSON (pole účtenek).
     */
    public async getReceipts(params: { [key: string]: string | number | string[] | number[] }): Promise<any> {
        
        const endpoint = '/reports-api/listOfReceipts';
        // Sestavení query stringu z objektu params
        const query = Object.entries(params)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `${key}=${value.join(',')}`;
                }
                return `${key}=${value}`;
            })
            .join('&');
        const url = `${endpoint}?${query}`;
        logger.trace(`Odesílám GET požadavek na ${url}`);

        const response = await this.request.get(url, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok()) {
            logger.error(`Chyba při získávání seznamu účtenek. Status: ${response.status()}`, await response.text());
            throw new Error(`Chyba při získávání seznamu účtenek. Status: ${response.status()}`);
        }

        logger.silly(`Seznam účtenek byl úspěšně získán.`);
        return response.json();
    }

    /**--- GET reports-api/listOfStocks
    *Získá sezanm OM
    *Implemenotvané URL pro získání OM
    *reports-api/listOfStocks?columns=id,text,street,city,zip,accOwner,accOwnerName,stockCardsCount,erpExtId,erpEnabled,erpName,valid,transferEnabled,cardEnabled,authEnabled,transferResult,cardResult,authResult,testResult,updated,operator,rate,patternStock,isDistributed,restrictedMode,auxiliaryStorage,franchiserId&accOwner=60193531&sort=street 
    * @param {string} [accOwner] - '00174939' Identifikace sítě, např. 
    * @param {number} [stockId] - Identifikace konkrétního skladu (obchodního místa).
    * @param {number} [cbosScale] - Určuje váhu CBoS práv, pro kterou se mají OM zobrazit.
    * @param {string} [sort='id'] - Název sloupce pro třídění. Pro sestupné řazení přidejte na začátek znaménko mínus (např. '-id').
    * @param {string} [columns] - Čárkou oddělený seznam sloupců, které má API vrátit.
    * @param {number} [limit=25] - Počet záznamů na stránku pro účely stránkování.
    * @param {number} [offset=0] - Počet záznamů, které se mají přeskočit (používá se pro stránkování).
    * @param {string} [q] - Řetězec pro fulltextové vyhledávání napříč relevantními poli.
    * @returns {Promise<Object>} Promise, který vrací objekt s polem obchodních míst v klíči `data` a informacemi o stránkování v klíči `pagination`.
    */
    public async getListOfStocks(params: { [key: string]: string | number | string[] | number[] }): Promise<any> {
        const endpoint = '/reports-api/listOfStocks';
        
        // Sestavení query stringu z objektu params
        const query = Object.entries(params)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return `${key}=${value.join(',')}`;
                }
                return `${key}=${value}`;
            })
            .join('&');
        
        const url = query ? `${endpoint}?${query}` : endpoint;
        logger.trace(`Odesílám GET požadavek na ${url}`);

        const response = await this.request.get(url, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok()) {
            logger.error(`Chyba při získávání seznamu obchodních míst. Status: ${response.status()}`, await response.text());
            throw new Error(`Chyba při získávání seznamu obchodních míst. Status: ${response.status()}`);
        }

        logger.silly(`Seznam obchodních míst byl úspěšně získán.`);
        return response.json();
    }

  
/**
 * Získá seznam skladových karet podle zadaných filtrů.
 * --- GET /reports-api/listOfStockCards/{accOwner}/{stockId} ---
 * @param {string} accOwner - (required) Identifikace sítě, např. '00174939'.
 * @param {string | number} stockId - (required) ID skladu nebo obchodního místa.
 * @param {ListOfStockCardsPayload} params - (optional) Objekt s volitelnými query parametry pro filtrování.
 * @returns {Promise<any>} Odpověď ze serveru obsahující seznam skladových karet.
 */
public async getListOfStockCards(
  accOwner: string,
  stockId: string | number,
  params: ListOfStockCardsPayload = {}
): Promise<any> {
  const endpoint = `/reports-api/listOfStockCards/${accOwner}/${stockId}`;
  
  logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

  const response = await this.request.get(endpoint, {
    headers: {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/json, text/plain, */*'
    },
    // Všechny volitelné parametry se předají zde
    params: params
  });

  logger.info(`/reports-api/listOfStockCards/ Status: ${response.status()}`)
  if (!response.ok()) {
    const errorText = await response.text();
    logger.error(`Chyba při získávání seznamu skladových karet pro accOwner ${accOwner}. Status: ${response.status()}`, errorText);
    throw new Error(`Chyba při získávání seznamu skladových karet. Status: ${response.status()}`);
  }

  logger.silly(`Seznam skladových karet pro accOwner ${accOwner} byl úspěšně získán.`);
  return response.json();
}
/**--- POST /auth-api/user/authorization ---
 * Autorizuje uživatele a získá autorizační token.
 * @param {string} operator - Přihlašovací jméno operátora.
 * @param {string} password - Heslo operátora.
 * @returns {Promise<any>} Odpověď ze serveru obsahující autorizační data (včetně tokenu).
 */
public async authorizeUser(operator: string, password: string): Promise<any> {
    const endpoint = '/auth-api/user/authorization';
    logger.trace(`Odesílám POST požadavek pro autorizaci uživatele: ${operator}`);

    // Vytvoření JSON objektu s přihlašovacími údaji
    const credentials = { operator, password };
    const jsonCredentials = JSON.stringify(credentials);
    
    // Podle cURL příkazu se tělo posílá jako base64 enkódovaný string
    const requestBody = Buffer.from(jsonCredentials).toString('base64');

    const response = await this.request.post(endpoint, {
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'text/plain'
            // Autorizační header (Bearer token) se zde nepoužívá, protože se teprve přihlašujeme
        },
        data: requestBody
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při autorizaci uživatele ${operator}. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při autorizaci uživatele ${operator}. Status: ${response.status()}`);
    }

    logger.silly(`Uživatel ${operator} byl úspěšně autorizován.`);
    return response.json();
}

/**--- GET /dashboard ---
 * Načte hlavní stránku dashboardu.
 * Očekává HTML odpověď.
 * @returns {Promise<string>} Promise, který vrací obsah stránky jako text.
 */
public async getDashboard(): Promise<string> {
    const endpoint = '/dashboard';
    logger.trace(`Odesílám GET požadavek na ${endpoint}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
            // Autorizační token se pro tento požadavek nepoužívá
        },
        ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při načítání dashboardu. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při načítání dashboardu. Status: ${response.status()}`);
    }

    logger.silly(`Dashboard byl úspěšně načten.`);
    return response.text();
}
/**--- GET /administration-api/stockCardsGroupsLocal/{stockId} ---
 * Získá lokální skupiny skladových karet pro daný sklad.
 * @param {string | number} stockId - ID skladu (např. 230).
 * @param {object} params - Volitelné parametry pro stránkování a řazení.
 * @param {number} [params.offset] - Posun pro stránkování (počet záznamů k přeskočení).
 * @param {number} [params.limit] - Maximální počet záznamů na stránku.
 * @param {string} [params.sort] - Klíč pro řazení (např. '+id' pro vzestupné řazení podle ID).
 * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
 */
public async getStockCardsGroupsLocal(
    stockId: string | number, 
    params: { offset?: number, limit?: number, sort?: string } = {}
): Promise<any> {
    const endpoint = `/administration-api/stockCardsGroupsLocal/${stockId}`;
    logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        },
        params: params,
        ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při získávání lokálních skupin skladových karet pro sklad ${stockId}. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při získávání lokálních skupin skladových karet. Status: ${response.status()}`);
    }

    logger.silly(`Lokální skupiny skladových karet pro sklad ${stockId} byly úspěšně získány.`);
    return response.json();
}
/**--- GET /administration-api/stockCardsSupergroupsLocal/{stockId} ---
 * Získá lokální nadskupiny skladových karet pro daný sklad.
 * @param {string | number} stockId - ID skladu (např. 230).
 * @param {object} params - Volitelné parametry pro stránkování a řazení.
 * @param {number} [params.offset] - Posun pro stránkování (počet záznamů k přeskočení).
 * @param {number} [params.limit] - Maximální počet záznamů na stránku.
 * @param {string} [params.sort] - Klíč pro řazení (např. '+id' pro vzestupné řazení podle ID).
 * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
 */
public async getStockCardsSupergroupsLocal(
    stockId: string | number, 
    params: { offset?: number, limit?: number, sort?: string } = {}
): Promise<any> {
    const endpoint = `/administration-api/stockCardsSupergroupsLocal/${stockId}`;
    logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        },
        params: params,
        ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při získávání lokálních nadskupin skladových karet pro sklad ${stockId}. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při získávání lokálních nadskupin skladových karet. Status: ${response.status()}`);
    }

    logger.silly(`Lokální nadskupiny skladových karet pro sklad ${stockId} byly úspěšně získány.`);
    return response.json();
}
    /**
     * Získá seznam POS terminálů pro daný sklad.
     * --- GET /administration-api/listOfPosTerminals/{stockId} ---
     * @param {string | number} stockId - ID skladu (např. 230).
     * @param {object} params - Volitelné parametry pro dotaz.
     * @param {string} [params.sort] - Klíč pro řazení (např. 'id').
     * @param {boolean} [params.octomat] - Filtr pro Octomat.
     * @param {boolean} [params.mpay] - Filtr pro mPay.
     * @param {boolean} [params.frank] - Filtr pro Frank.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfPosTerminals(
        stockId: string | number,
        params: { sort?: string, octomat?: boolean, mpay?: boolean, frank?: boolean } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/listOfPosTerminals/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu POS terminálů pro sklad ${stockId}. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu POS terminálů. Status: ${response.status()}`);
        }

        logger.silly(`Seznam POS terminálů pro sklad ${stockId} byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá definice rychlých voleb pro daný sklad a terminál.
     * --- GET /administration-api/listOfHotKeysDefinitions/{stockId}/{posTerminalId} ---
     * @param {string | number} stockId - ID skladu (např. 230).
     * @param {string | number} posTerminalId - ID POS terminálu (např. 23001).
     * @param {object} params - Volitelné parametry pro dotaz.
     * @param {number} [params.hotKeysGroupId] - ID skupiny rychlých voleb.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfHotKeysDefinitions(
        stockId: string | number,
        posTerminalId: string | number,
        params: { hotKeysGroupId?: number } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/listOfHotKeysDefinitions/${stockId}/${posTerminalId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání definic rychlých voleb. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání definic rychlých voleb. Status: ${response.status()}`);
        }

        logger.silly(`Definice rychlých voleb byly úspěšně získány.`);
        return response.json();
    }
    /**
     * Získá informace o počtech záznamů v tabulkách pro dashboard.
     * --- GET /dashboard-api/tablesCountInfo ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} [params.accOwner] - ID vlastníka účtu.
     * @param {string | number} [params.cardTypes] - Typy karet.
     * @param {string} [params.tables] - Název tabulky k dotazování (např. 'localCards').
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getTablesCountInfo(
        params: {
            accOwner?: string;
            cardTypes?: string | number;
            tables?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/dashboard-api/tablesCountInfo';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání informací o počtech tabulek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání informací o počtech tabulek. Status: ${response.status()}`);
        }

        logger.silly(`Informace o počtech tabulek byly úspěšně získány.`);
        return response.json();
    }
    /**
     * Získá seznam lokálních karet.
     * --- GET /reports-api/listOfLocalCards ---
     * @param {object} params - Objekt s query parametry.
     * @param {boolean} [params.valid] - Filtr pro platné karty.
     * @param {string} [params.accOwner] - ID vlastníka účtu.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @param {string} [params.sort] - Řazení (např. '+updated').
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfLocalCards(
        params: {
            valid?: boolean;
            accOwner?: string;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfLocalCards';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu lokálních karet. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu lokálních karet. Status: ${response.status()}`);
        }

        logger.silly(`Seznam lokálních karet byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá seznam cenových kategorií.
     * --- GET /reports-api/listOfPricesCategories ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} [params.accOwner] - ID vlastníka účtu.
     * @param {boolean} [params.valid] - Filtr pro platné kategorie.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfPricesCategories(
        params: {
            accOwner?: string;
            valid?: boolean;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfPricesCategories';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu cenových kategorií. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu cenových kategorií. Status: ${response.status()}`);
        }

        logger.silly(`Seznam cenových kategorií byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá seznam žádostí o EuroOil karty.
     * --- GET /reports-api/listOfEuroOilCardRequests ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} [params.stockId] - ID skladu.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @param {string} [params.sort] - Řazení (např. '-operator').
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfEuroOilCardRequests(
        params: {
            stockId?: string;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfEuroOilCardRequests';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání žádostí o EuroOil karty. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání žádostí o EuroOil karty. Status: ${response.status()}`);
        }

        logger.silly(`Seznam žádostí o EuroOil karty byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá seznam bonusových tříd.
     * --- GET /reports-api/listOfBonusClasses ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} [params.accOwner] - ID vlastníka účtu.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @param {string} [params.sort] - Řazení (např. '-operator').
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfBonusClasses(
        params: {
            accOwner?: string;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfBonusClasses';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu bonusových tříd. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu bonusových tříd. Status: ${response.status()}`);
        }

        logger.silly(`Seznam bonusových tříd byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá číselník období pro přehled skladových zásob.
     * --- GET /balances-api/supplyPeriodsEnums/{stockId} ---
     * @param {string} stockId - ID skladu (povinný path parametr).
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON (očekává se pole objektů).
     */
    public async getSupplyPeriodsEnums(stockId: string): Promise<any> {
        const endpoint = `/balances-api/supplyPeriodsEnums/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání číselníku období. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání číselníku období. Status: ${response.status()}`);
        }

        logger.silly(`Číselník období byl úspěšně získán.`);
        return response.json();
    }
        /**
     * Získá data o stavech nádrží pro dashboard.
     * --- GET /dashboard-api/stocksTanks/{stockId} ---
     * @param {number} stockId - ID skladu (povinný path parametr).
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON (pole objektů).
     */
    public async getStocksTanks(stockId: number): Promise<any> {
        const endpoint = `/dashboard-api/stocksTanks/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání dat o nádržích. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání dat o nádržích. Status: ${response.status()}`);
        }

        logger.silly(`Data o nádržích byla úspěšně získána.`);
        return response.json();
    }
    /**
     * Získá číselník operátorů pro filtry.
     * --- GET /reports-api/listOfOperators ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.stockId - ID skladu.
     * @param {number | string} params.year - Rok.
     * @param {string} params.documentType - Typ dokumentu (např. 'R' pro příjemky).
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON (očekává se pole objektů).
     */
    public async getListOfOperators(
        params: {
            stockId: string;
            year: number | string;
            documentType: string;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfOperators';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání číselníku operátorů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání číselníku operátorů. Status: ${response.status()}`);
        }

        logger.silly(`Číselník operátorů byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Získá seznam UDD příjemek.
     * --- GET /reports-api/listOfReceiptsUdd ---
     * @param {object} params - Objekt s query parametry.
     * @param {string[]} [params.columns] - Seznam sloupců k vrácení.
     * @param {string} [params.stockId] - ID skladu.
     * @param {number | string} [params.year] - Rok.
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfReceiptsUdd(
    params: {
        columns?: string[];
        stockId?: string;
        year?: number | string;
        sort?: string;
        offset?: number;
        limit?: number;
    } = {}
    ): Promise<any> {
    const endpoint = '/reports-api/listOfReceiptsUdd';

    // API očekává 'columns' jako string oddělený čárkou,
    // pro pohodlí v kódu můžeme přijímat pole a zde ho spojit.
    const queryParams: { [key: string]: any } = { ...params };
    if (params.columns && Array.isArray(params.columns)) {
        queryParams.columns = params.columns.join(',');
    }

    logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(queryParams)}`);

    const response = await this.request.get(endpoint, {
        headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/json, text/plain, */*'
        },
        params: queryParams
    });

    if (!response.ok()) {
        const errorText = await response.text();
        logger.error(`Chyba při získávání seznamu UDD příjemek. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při získávání seznamu UDD příjemek. Status: ${response.status()}`);
    }

    logger.silly(`Seznam UDD příjemek byl úspěšně získán.`);
    return response.json();
    }
        /**
     * Získá seznam stvrzenek o složení hotovosti (POS Tank Tickets).
     * --- GET /reports-api/listOfPosTankTickets ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.stockId - ID skladu.
     * @param {string} [params.dateFrom] - Datum od (ISO string).
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfPosTankTickets(
        params: {
            stockId: string;
            dateFrom?: string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfPosTankTickets';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu stvrzenek (Tank Tickets). Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu stvrzenek (Tank Tickets). Status: ${response.status()}`);
        }

        logger.silly(`Seznam stvrzenek (Tank Tickets) byl úspěšně získán.`);
        return response.json();
    }
        /**
     * Získá seznam vkladů a výběrů v hotovosti.
     * --- GET /reports-api/listOfPosMoneyOperations ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.stockId - ID skladu.
     * @param {string} [params.dateFrom] - Datum od (ISO string).
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfPosMoneyOperations(
        params: {
            stockId: string;
            dateFrom?: string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfPosMoneyOperations';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu peněžních operací. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu peněžních operací. Status: ${response.status()}`);
        }

        logger.silly(`Seznam peněžních operací byl úspěšně získán.`);
        return response.json();
    }
        /**
     * Získá seznam přeplatkových poukázek.
     * --- GET /reports-api/listOfPosTankVouchers ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.stockId - ID skladu.
     * @param {string} [params.dateFrom] - Datum od (ISO string).
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfPosTankVouchers(
        params: {
            stockId: string;
            dateFrom?: string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfPosTankVouchers';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu přeplatkových poukázek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu přeplatkových poukázek. Status: ${response.status()}`);
        }

        logger.silly(`Seznam přeplatkových poukázek byl úspěšně získán.`);
        return response.json();
    }
        /**
     * Získá seznam inventur zboží.
     * --- GET /reports-api/listOfGoodsInventories ---
     * @param {object} params - Objekt s query parametry.
     * @param {string[]} [params.columns] - Seznam sloupců k vrácení.
     * @param {string} params.accOwner - ID vlastníka účtu.
     * @param {string} params.stockId - ID skladu.
     * @param {number | string} params.year - Rok.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfGoodsInventories(
        params: {
            columns?: string[];
            accOwner: string;
            stockId: string;
            year: number | string;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfGoodsInventories';
        const queryParams: { [key: string]: any } = { ...params };
        if (params.columns) {
            queryParams.columns = params.columns.join(',');
        }

        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(queryParams)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: queryParams
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu inventur zboží. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu inventur zboží. Status: ${response.status()}`);
        }

        logger.silly(`Seznam inventur zboží byl úspěšně získán.`);
        return response.json();
    }

  /**
     * Získá seznam čerpadlových dodacích listů.
     * --- GET /reports-api/listOfWetDeliveryNotes ---
     * @param {object} params - Objekt s query parametry.
     * @param {string[]} [params.columns] - Seznam sloupců.
     * @param {string} params.accOwner - ID vlastníka účtu.
     * @param {number} params.stockId - ID skladu.
     * @param {number | string} params.year - Rok.
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfWetDeliveryNotes(
        params: {
            columns?: string[];
            accOwner: string;
            stockId: number;
            year: number | string;
            sort?: string;
            offset?: number;
            limit?: number;
        } & listOfWetDeliveryNotesPayload
    ): Promise<any> {
        const endpoint = '/reports-api/listOfWetDeliveryNotes';
        const queryParams: { [key: string]: any } = { ...params };
        
        if (params.columns) {
            queryParams.columns = params.columns.join(',');
        }

        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(queryParams)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: queryParams
        });

        logger.info(`URL: ${baseURL}/${endpoint} Status: ${response.status()}`);

        if (response.ok()) {
            logger.info(`Požadavek na '${endpoint}' byl úspěšný s HTTP status ${response.status()}`);
            logger.silly(`Seznam čerpadlových dodacích listů byl úspěšně získán.`);
            return response.json();
        } else {
            logger.error(`Požadavek na '${endpoint}' selhal s HTTP status ${response.status()}`);
            const errorText = await response.text();
            logger.error(`Chyba při získávání čerpadlových dodacích listů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání čerpadlových dodacích listů. Status: ${response.status()}`);
        }
    }

/**
     * Získá seznam denních uzávěrek (bilancí).
     * --- GET /balances-api/dailyBillances/{stockId} ---
     * @param {string} stockId - ID skladu (povinný path parametr).
     * @param {object} params - Objekt s query parametry.
     * @param {number | string} params.year - Rok.
     * @param {number | string} params.month - Měsíc.
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfDailyBalances(
        stockId: string,
        params: {
            year: number | string;
            month: number | string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        // POZOR: V reálné adrese endpointu je záměrný překlep "dailyBillances"
        const endpoint = `/balances-api/dailyBillances/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání denních uzávěrek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání denních uzávěrek. Status: ${response.status()}`);
        }

        logger.silly(`Seznam denních uzávěrek byl úspěšně získán.`);
        return response.json();
    }
        /**
         * Získá seznam poukázaných tržeb.
         * --- GET /balances-api/dailyRevenues/{stockId} ---
         * @param stockId ID skladu (path parametr).
         * @param params Objekt s query parametry (year, month, offset, limit, sort).
         * @returns {Promise<any>} Odpověď ze serveru.
         */
        public async getDailyRevenues(
            stockId: string,
            params: {
                year: number | string;
                month: number | string;
                offset?: number;
                limit?: number;
                sort?: string;
            }
        ): Promise<any> {
            const endpoint = `/balances-api/dailyRevenues/${stockId}`;
            logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

            const response = await this.request.get(endpoint, {
                headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
                params: params
            });

            if (!response.ok()) {
                const errorText = await response.text();
                logger.error(`Chyba při získávání poukázaných tržeb. Status: ${response.status()}`, errorText);
                throw new Error(`Chyba při získávání poukázaných tržeb. Status: ${response.status()}`);
            }
            return response.json();
    }

    /**
     * Získá seznam účetních uzávěrek (turnovers).
     * --- GET /balances-api/turnovers/{stockId} ---
     * @param stockId ID skladu (path parametr).
     * @param params Objekt s query parametry (year, offset, limit, sort).
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getTurnovers(
        stockId: string,
        params: {
            year: number | string;
            offset?: number;
            limit?: number;
            sort?: string;
        }
    ): Promise<any> {
        const endpoint = `/balances-api/turnovers/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání účetních uzávěrek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání účetních uzávěrek. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam pokladních uzávěrek.
     * --- GET /reports-api/listOfPosSummaries ---
     * @param params Objekt s query parametry (stockId, year, month, sort).
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfPosSummaries(
        params: {
            stockId: string;
            year: number | string;
            month: number | string;
            sort?: string;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfPosSummaries';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání pokladních uzávěrek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání pokladních uzávěrek. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam uživatelů.
     * --- GET /reports-api/listOfUsers ---
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfUsers(
        params: {
            accOwner: string;
            stockId?: string;
            sortNulls?: boolean;
            offset?: number;
            limit?: number;
            sort?: string;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfUsers';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu uživatelů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu uživatelů. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam šablon rolí.
     * --- GET /reports-api/listOfRoles ---
     * @param params Objekt s query parametry (valid, scheme).
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfRoles(
        params: {
            valid?: boolean;
            scheme?: 'cbos' | 'gpos';
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfRoles';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu rolí. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu rolí. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam tříd DPH.
     * --- GET /reports-api/listOfVatClasses ---
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfVatClasses(
        params: {
            valid?: boolean;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfVatClasses';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání tříd DPH. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání tříd DPH. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam definic ISO kódů karet.
     * --- GET /administration-api/listOfCardDefinitions/{accOwner} ---
     * @param accOwner ID vlastníka účtu (path parametr).
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfCardDefinitions(
        accOwner: string,
        params: {
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/listOfCardDefinitions/${accOwner}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání definic karet. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání definic karet. Status: ${response.status()}`);
        }
        return response.json();
    }

    /**
     * Získá seznam registrovaných socket klientů.
     * --- GET /socket-api/registeredClients ---
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getRegisteredClients(): Promise<any> {
        const endpoint = '/socket-api/registeredClients';
        logger.trace(`Odesílám GET požadavek na ${endpoint}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání registrovaných klientů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání registrovaných klientů. Status: ${response.status()}`);
        }
        return response.json();
    }

    /**
     * Získá seznam vydavatelů karet.
     * --- GET /reports-api/listOfCardIssuers ---
     * @param params Objekt s query parametry pro stránkování a řazení.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfCardIssuers(
        params: {
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfCardIssuers';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání vydavatelů karet. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání vydavatelů karet. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam konkurenčních OM pro CCS.
     * --- GET /reports-api/listOfForeignStocksCCS ---
     * @param params Objekt s query parametry pro stránkování a řazení.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfForeignStocksCCS(
        params: {
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/listOfForeignStocksCCS';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání konkurenčních OM (CCS). Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání konkurenčních OM (CCS). Status: ${response.status()}`);
        }
        return response.json();
    }

    /**
     * Získá seznam konkurenčních OM.
     * --- GET /administration-api/listOfForeignStocks/{accOwner}/{stockId} ---
     * @param accOwner ID vlastníka účtu.
     * @param stockId ID skladu.
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfForeignStocks(
        accOwner: string,
        stockId: string,
        params: {
            valid?: boolean;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/listOfForeignStocks/${accOwner}/${stockId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání konkurenčních OM. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání konkurenčních OM. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam kurzů měn.
     * --- GET /reports-api/listOfCurrencyRates ---
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getListOfCurrencyRates(
        params: {
            accOwner: string;
            offset?: number;
            limit?: number;
            sort?: string;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfCurrencyRates';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání kurzů měn. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání kurzů měn. Status: ${response.status()}`);
        }
        return response.json();
    }
    /**
     * Získá seznam kategorií zboží.
     * --- GET /administration-api/stockCardsCategories/{accOwner} ---
     * @param {string} accOwner - ID vlastníka účtu (path parametr).
     * @param {object} params - Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getStockCardsCategories(
        accOwner: string,
        params: {
            valid?: boolean;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/stockCardsCategories/${accOwner}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání kategorií zboží. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání kategorií zboží. Status: ${response.status()}`);
        }
        return response.json();
    }

        /**
     * Získá seznam centrálních skupin zboží.
     * --- GET /administration-api/stockCardsGroupsCentral/{accOwner} ---
     * @param accOwner ID vlastníka účtu.
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getStockCardsGroupsCentral(
        accOwner: string,
        params: {
            columns?: string[];
            fullSearch?: string;
            withHistory?: boolean;
            withEdit?: boolean;
            withItems?: boolean;
            withPlanned?: boolean;
            offset?: number;
            limit?: number;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/stockCardsGroupsCentral/${accOwner}`;
        
        const queryParams: { [key: string]: any } = { ...params };
        if (params.columns && Array.isArray(params.columns)) {
            queryParams.columns = params.columns.join(',');
        }

        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(queryParams)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: queryParams
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání centrálních skupin zboží. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání centrálních skupin zboží. Status: ${response.status()}`);
        }
        return response.json();
    }

    /**
     * Získá centrální parametry systému (features).
     * --- GET /administration-api/fsfeature/{accOwner} ---
     * @param accOwner ID vlastníka účtu.
     * @param params Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru.
     */
    public async getFsFeatures(
        accOwner: string,
        params: {
            withHistory?: boolean;
            sort?: string;
        } = {}
    ): Promise<any> {
        const endpoint = `/administration-api/fsfeature/${accOwner}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            params: params
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání centrálních parametrů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání centrálních parametrů. Status: ${response.status()}`);
        }
        return response.json();
    }

       /**
     * Vytvoří nový dodací list (příjemku) pro suché zboží.
     * --- POST /documents-api/goodsDeliveryNotes/{stockId} ---
     * @param {string | number} stockId - ID skladu, pro který se doklad vytváří (path parametr).
     * @param {GoodsDeliveryNotePayload} payload - Data pro vytvoření dodacího listu.
     * @returns {Promise<any>} Odpověď ze serveru, typicky objekt vytvořeného dokladu.
     */
    public async createGoodsDeliveryNote(
        stockId: string | number,
        payload: GoodsDeliveryNotePayload
    ): Promise<any> {
        const endpoint = `/documents-api/goodsDeliveryNotes/${stockId}`;
        logger.trace(`Odesílám POST požadavek na ${endpoint} s payloadem: ${JSON.stringify(payload, null, 2)}`);

        const response = await this.request.post(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*'
            },
            data: payload,
            ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při vytváření dodacího listu pro sklad ${stockId}. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při vytváření dodacího listu. Status: ${response.status()}`);
        }

        logger.silly(`Dodací list pro sklad ${stockId} byl úspěšně vytvořen.`);
        
        // API může vrátit prázdné tělo (201, 204) nebo vytvořený objekt (200, 201)
        // Bezpečnější je zkusit parsovat JSON, a pokud selže, vrátit text
        try {
            return await response.json();
        } catch (e) {
            return await response.text(); 
        }
    }
    /**  --- GET //reports-api/listOfForeignStocksPrices/{accOwner}
        * Získá seznam cen konkurenčních OM.
        * @param accOwner 
        * @param params Objekt s query parametry.
        * @returns {Promise<any>} Odpověď ze serveru.
        */
        public async getListOfForeignStocksPrices(
        accOwner: string,
        params: {
            dateFrom?: string;
            offset?: number;
            StockId?: string;
            limit?: number;
            sort?: string;
            withLoadData?: boolean;
        } = {}
    ): Promise<any> {
        const endpoint = `/reports-api/listOfForeignStocksPrices`;
        logger.trace(`Odesílám GET požadavek na ${endpoint} s accOwner: ${accOwner} a parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: { 'Authorization': `Bearer ${this.token}`, 'Accept': 'application/json, text/plain, */*' },
            // --- TOTO JE SPRÁVNÉ ŘEŠENÍ ---
            // Vytvoříme objekt 'params', který obsahuje jak accOwner,
            // tak všechny ostatní volitelné parametry.
            params: {
                accOwner: accOwner,
                ...params
            }
        });

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání cen konkurenčních cen. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání cen konkurenčních cen. Status: ${response.status()}`);
        }
        return response.json();
    }

    /**
     * Získá detail konkrétní objednávky zboží.
     * --- GET /documents-api/orders/{stockId}/{orderId} ---
     * @param {string | number} stockId - ID skladu, ke kterému objednávka patří.
     * @param {string | number} orderId - ID samotné objednávky.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON s detailem objednávky.
     */
    public async getOrderDetail(
        stockId: string | number,
        orderId: string | number
    ): Promise<any> {
        const endpoint = `/documents-api/orders/${stockId}/${orderId}`;
        logger.trace(`Odesílám GET požadavek na ${endpoint}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
        });

         logger.info(`URL: ${baseURL}/${endpoint} Status: ${response.status()}`);
        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání detailu objednávky ${orderId}. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání detailu objednávky ${orderId}. Status: ${response.status()}`);
        }

        logger.silly(`Detail objednávky ${orderId} byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Odešle nový požadavek na vytvoření objednávky zboží.
     * --- POST /api/orders/{stockId} ---
     * @param {string | number} stockId - ID skladu, pro který se objednávka vytváří (path parametr).
     * @param {OrderPayload} payload - Data pro vytvoření objednávky.
     * @returns {Promise<any>} Odpověď ze serveru, typicky objekt vytvořené objednávky.
     */
    // Define the payload structure for creating an order

    public async createOrder(
        stockId: string | number,
        payload: OrderPayload
    ): Promise<any> {
        const endpoint = `/documents-api/orders/${stockId}`;
        logger.trace(`Odesílám POST požadavek na ${endpoint} s payloadem: ${JSON.stringify(payload, null, 2)}`);
        const response = await this.request.post(endpoint, {
            headers: { 
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*'
            },
            data: payload,
            ignoreHTTPSErrors: true // Ekvivalent --insecure z cURL
        });

         logger.info(`URL: ${baseURL}/${endpoint} Status: ${response.status()}`);
        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při vytváření objednávky pro sklad ${stockId}. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při vytváření objednávky. Status: ${response.status()}`);
        }
        logger.silly(`Objednávka pro sklad ${stockId} byla úspěšně vytvořena.`);
        // API může vrátit prázdné tělo (201, 204) nebo vytvořený objekt (200, 201)
        // Bezpečnější je zkusit parsovat JSON, a pokud selže, vrátit text
        try {
            return await response.json();
        } catch (e) {
            return await response.text(); 
        }
    }
    
    /**
     * Získá data o minimální hlídané zásobě.
     * --- GET /minimalSupply ---
     * @param {string} accOwner - Identifikace sítě (povinný query parametr).
     * @param {object} params - Objekt s volitelnými query parametry.
     * @param {number | string} [params.stockId] - ID skladu nebo čárkou oddělený seznam ID.
     * @param {number} [params.coeficient] - Koeficient pro výpočet v procentech (např. 10).
     * @param {string} [params.sort] - Řazení výsledků.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet položek na stránku.
     * @param {'xlsx' | 'csv'} [params.format] - Formát pro export.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getMinimalSupply(
        accOwner: string,
        params: {
            stockId?: number | string;
            coeficient?: number;
            sort?: string;
            offset?: number;
            limit?: number;
            format?: 'xlsx' | 'csv';
        } = {}
    ): Promise<any> {
        const endpoint = '/reports-api/minimalSupply'; 
        logger.trace(`Odesílám GET požadavek na ${endpoint} s accOwner: ${accOwner} a parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            // Spojíme povinný accOwner s ostatními volitelnými parametry do jednoho objektu
            params: {
                accOwner: accOwner,
                ...params
            }
        });

         logger.info(`URL: ${baseURL}/${endpoint} Status: ${response.status()}`);
        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání minimální zásoby. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání minimální zásoby. Status: ${response.status()}`);
        }

        logger.silly(`Data o minimální zásobě byla úspěšně získána.`);
        return response.json();
    }

    /**
     * Získá seznam odběrů podle řidiče.
     * --- GET /reports-api/listOfDrivers ---
     * @param {listOfDriversPayload} params - Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfDrivers(
        params: listOfDriversPayload
    ): Promise<any> {
        const endpoint = '/reports-api/listOfDrivers';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        logger.info(`URL: ${baseURL}/${endpoint} Status: ${response.status()}`);

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu řidičů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu řidičů. Status: ${response.status()}`);
        }

        logger.silly(`Seznam řidičů byl úspěšně získán.`);
        return response.json();
    }

    /**
     * Získá seznam objednávek.
     * --- GET /reports-api/listOfOrders ---
     * @param {GetListOfOrdersPayload} params - Objekt s query parametry.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfOrders(
        params: GetListOfOrdersPayload
    ): Promise<any> {
        const endpoint = '/reports-api/listOfOrders';
        logger.trace(`Odesílám GET požadavek na ${endpoint} s parametry: ${JSON.stringify(params)}`);

        const response = await this.request.get(`${baseURL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*'
            },
            params: params
        });

        logger.info(`URL: ${baseURL}${endpoint} Status: ${response.status}`);

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání seznamu objednávek. Status: ${response.status}`, errorText);
            throw new Error(`Chyba při získávání seznamu objednávek. Status: ${response.status}`);
        }

        logger.silly(`Seznam objednávek byl úspěšně získán.`);
        return response.json();
    }
    /**
     * Vytvoří item na objednávce
     * --- POST /documents-api/orderItems ---
     * @param {postOrderItemsPayload} payload - Objekt s daty pro vytvoření položky objednávky.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async postOrderItems(
        payload: postOrderItemsPayload
    ): Promise<any> {
        const endpoint = '/documents-api/orderItems';
        logger.trace(`Odesílám POST požadavek na ${endpoint} s payloadem: ${JSON.stringify(payload)}`);

        const response = await this.request.post(`${baseURL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json, text/plain, */*',
            },
            data: payload
        });

        logger.info(`URL: ${baseURL}${endpoint} Status: ${response.status}`);

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při vytváření položky objednávky. Status: ${response.status}`, errorText);
            throw new Error(`Chyba při vytváření položky objednávky. Status: ${response.status}`);
        }
    }
}