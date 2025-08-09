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
 */

import { APIRequestContext } from '@playwright/test';
import { logger } from '../support/logger';

export class ApiClient {
  private request: APIRequestContext;
  private token: string;

  /**
   * Konstruktor přijímá kontext pro posílání požadavků a autorizační token.
   * @param request - Objekt page.request z Playwrightu.
   * @param token - Bearer token pro autorizaci.
   */
  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  //--- GET getUserReportsList	/reports-api/usersReports	
  /*
   * Získá seznam všech uživatelských sestav.
   * @returns Odpověď ze serveru ve formátu JSON (pole sestav).
   */
  public async getUserReportsList(): Promise<any> {
    const endpoint = '/reports-api/listOfUsersReports/60193531?offset=0&limit=100&sort=-updated';
    logger.trace(`Odesílám GET požadavek na získání seznamu sestav: ${endpoint}`);

    const response = await this.request.get(endpoint, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok()) {
      logger.error(`Chyba při získávání seznamu sestav. Status: ${response.status()}`, await response.text());
      throw new Error(`Chyba při získávání seznamu sestav. Status: ${response.status()}`);
    }
    
    logger.silly(`Seznam sestav byl úspěšně získán.`);
    return response.json();
  }

   /**
    * --- POST createUserReport  /reports-api/usersReports/60193531 
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
  /**
   * --- METODA PRO SMAZÁNÍ SESTAVY ---
   * Smaže konkrétní uživatelskou sestavu.
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

  //--- GET getUserReportPreview ---
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
  /**
 * --- GET listOfPartners /reports-api/listOfPartners ---
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
  /**
   * --- GET filterOfReceipts /administration-api/stockCardsCategories/60193531 ---
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
  /**
   * --- GET getUSers /reports-api/listOfOperators ---
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
  /**
   * --- GET getCardIssuers /reports-api/listOfCardIssuers ---
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

  /**
 * --- GET listOfReceipts /reports-api/listOfReceipts ---
 * Získá seznam účtenek podle zadaných filtrů.
 * @param year - Rok (např. 2025)
 * @param stockId - ID skladu (např. 101)
 * @param totalReceiptPriceFrom - Minimální cena účtenky (např. 1)
 * @param receiptItemPriceFrom - Minimální cena položky účtenky (např. 0)
 * @param offset - Offset pro stránkování (např. 0)
 * @param limit - Limit pro stránkování (např. 10)
 * @param sort - Řazení (např. '-receipt')
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
}
