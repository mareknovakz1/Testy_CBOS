/*
 * API Client - Knihovna pro GET requesty
getUserReportsList() GET /reports-api/usersReports 
createUserReport() POST /reports-api/usersReports/ 
deleteUserReport() DELETE /reports-api/usersReports/{SestavaId} 
getUserReportPreview GET /reports-api/userReportPreview/{SestavaId}   
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
    logger.silly(`Odesílám GET požadavek na získání seznamu sestav: ${endpoint}`);

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
   */
  public async createUserReport(SestavaId: string, payload: any): Promise<any> {
    const endpoint = `/reports-api/usersReports/60193531`;
    logger.silly(`Odesílám POST požadavek na vytvoření sestavy: ${endpoint}`);

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
    logger.silly(`Odesílám DELETE požadavek na smazání sestavy: ${endpoint}`);

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
    logger.silly(`Odesílám GET požadavek na získání náhledu sestavy: ${endpoint}`);
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
}
