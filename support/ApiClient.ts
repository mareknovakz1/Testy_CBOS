/*
 * API Client - Knihovna pro GET requesty
getUserReportsList() GET /reports-api/usersReports 
createUserReport() POST /reports-api/usersReports/ 
deleteUserReport() DELETE /reports-api/usersReports/{SestavaId} 
getUserReportPreview GET /reports-api/userReportPreview/{SestavaId}   
listOfPartners() GET /reports-api/listOfPartners
getPriceCategory() GET /administration-api/stockCardsCategories/60193531
getUSers() GET /reports-api/listOfReceipts?year=${year}&stockId=${stockId}&totalReceiptPriceFrom=${totalReceiptPriceFrom}&receiptItemPriceFrom=${receiptItemPriceFrom}&offset=${offset}&limit=${limit}&sort=${sort}
getReceipts() GET /reports-api/receipts
getOfListSotcks() GET reports-api/listOfStocks
getListOfStockCards() GET reports-api/listOfStockCards/{accOwnerId}/{stockId} 
 */

import { APIRequestContext } from '@playwright/test';
import { logger } from '../support/logger';

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
    ): Promise<any> {
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

/**--- GET reports-api/listOfStockCards/{accOwnerId}/{stockId} ---
 * Získá seznam skladových karet pro daný accOwner a sklad.
 * @param {string | number} accOwnerId - ID vlastníka účtu (např. 60193531).
 * @param {string | number} stockId - ID skladu (např. 101).
 * @param {object} params - Objekt s volitelnými query parametry.
 * @param {string[]} [params.columns] - Pole sloupců k vrácení.
 * @param {boolean} [params.valid] - Filtr pro platné karty.
 * @param {boolean} [params.takeMain] - Zda se mají brát hlavní karty.
 * @param {number} [params.offset] - Posun pro stránkování.
 * @param {number} [params.limit] - Počet záznamů na stránku.
 * @param {string} [params.sort] - Řazení (např. '+operator').
 * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON (pole skladových karet).
 */
public async getListOfStockCards(
    accOwnerId: string | number,
    stockId: string | number,
    params: {
        columns?: string[];
        valid?: boolean;
        takeMain?: boolean;
        offset?: number;
        limit?: number;
        sort?: string;
    } = {}
): Promise<any> {
    const endpoint = `/reports-api/listOfStockCards/${accOwnerId}/${stockId}`;
    
    // Připravíme parametry dotazu z poskytnutého objektu.
    // Pro sloupce převedeme pole na string oddělený čárkami.
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
        logger.error(`Chyba při získávání seznamu skladových karet. Status: ${response.status()}`, errorText);
        throw new Error(`Chyba při získávání seznamu skladových karet. Status: ${response.status()}`);
    }

    logger.silly(`Seznam skladových karet byl úspěšně získán.`);
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
     * @param {string} stockId - ID skladu (povinný path parametr).
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON (očekává se pole objektů).
     */
    public async getStocksTanks(stockId: string): Promise<any> {
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
     * Získá seznam objednávek zboží.
     * --- GET /reports-api/listOfOrders ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.stockId - ID skladu.
     * @param {number | string} params.year - Rok.
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfOrders(
        params: {
            stockId: string;
            year: number | string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfOrders';
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
            logger.error(`Chyba při získávání seznamu objednávek. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání seznamu objednávek. Status: ${response.status()}`);
        }

        logger.silly(`Seznam objednávek byl úspěšně získán.`);
        return response.json();
    }
        /**
     * Získá seznam čerpadlových dodacích listů.
     * --- GET /reports-api/listOfWetDeliveryNotes ---
     * @param {object} params - Objekt s query parametry.
     * @param {string[]} [params.columns] - Seznam sloupců.
     * @param {string} params.accOwner - ID vlastníka účtu.
     * @param {string} params.stockId - ID skladu.
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
            stockId: string;
            year: number | string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
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

        if (!response.ok()) {
            const errorText = await response.text();
            logger.error(`Chyba při získávání čerpadlových dodacích listů. Status: ${response.status()}`, errorText);
            throw new Error(`Chyba při získávání čerpadlových dodacích listů. Status: ${response.status()}`);
        }

        logger.silly(`Seznam čerpadlových dodacích listů byl úspěšně získán.`);
        return response.json();
    }

    /**
     * Získá seznam denních uzávěrek.
     * --- GET /reports-api/listOfDailyBalances ---
     * @param {object} params - Objekt s query parametry.
     * @param {string} params.accOwner - ID vlastníka účtu.
     * @param {string} params.stockId - ID skladu.
     * @param {string} [params.dateFrom] - Datum od (ISO string).
     * @param {string} [params.dateTo] - Datum do (ISO string).
     * @param {string} [params.sort] - Řazení.
     * @param {number} [params.offset] - Posun pro stránkování.
     * @param {number} [params.limit] - Počet záznamů na stránku.
     * @returns {Promise<any>} Odpověď ze serveru ve formátu JSON.
     */
    public async getListOfDailyBalances(
        params: {
            accOwner: string;
            stockId: string;
            dateFrom?: string;
            dateTo?: string;
            sort?: string;
            offset?: number;
            limit?: number;
        }
    ): Promise<any> {
        const endpoint = '/reports-api/listOfDailyBalances';
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
    
}