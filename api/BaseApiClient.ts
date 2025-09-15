/**
 * @file BaseApiClient.ts
 * @author Marek Novák (upraveno AI)
 * @date 12.09.2025
 * @description
 * Tento soubor obsahuje univerzální, nízkoúrovňovou třídu BaseApiClient,
 * která slouží jako základní stavební kámen pro komunikaci s jakýmkoliv API.
 *
 * @classdesc
 * Třída BaseApiClient se stará o veškerou opakující se logiku spojenou
 * s HTTP požadavky, jako jsou:
 * - Přidávání autorizačních hlaviček
 * - Centralizované a detailní logování
 * - Jednotné a robustní zpracování chybových stavů
 *
 * Sama o sobě neobsahuje žádnou logiku specifickou pro konkrétní endpointy.
 * Je to "motor", který pohání specifické API služby (např. DocumentsApiService).
 */

import { APIRequestContext, APIResponse } from '@playwright/test'; // Importy z Playwright pro práci s API
import { logger } from '../support/logger';                           
import { baseURL } from '../support/constants';                       // Import základní URL adresy
import { performance } from 'perf_hooks';                           // Pro měření doby odezvy
import { randomUUID } from 'crypto';                                  // Pro generování unikátních ID požadavků
import { ApiError } from './ApiError';                                // Import vlastní třídy pro API chyby

// Definice typu pro HTTP metody pro lepší typovou kontrolu
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export class BaseApiClient {
    protected request: APIRequestContext;                             // Instance Playwright request kontextu
    protected authToken: string | null;                               // Autorizační token, může být null
    protected baseURL: string;                                        // Základní URL pro všechny požadavky

    constructor(request: APIRequestContext, authToken: string | null) {
        this.request = request;                                       // Uložení request kontextu z testu
        this.authToken = authToken;                                   // Uložení autorizačního tokenu
        this.baseURL = baseURL;                                       // Uložení základní URL
        logger.silly(`BaseApiClient instance vytvořena pro baseURL: ${this.baseURL}`);
    }

    // =================================================================
    // SOUKROMÉ POMOCNÉ METODY (CORE LOGIKA)
    // =================================================================

    /**
     * Centrální metoda pro odesílání všech HTTP požadavků.
     * Stará se o sestavení URL, hlaviček, logování a měření času.
     * @param method HTTP metoda (GET, POST, atd.)
     * @param endpoint Cesta k endpointu (např. '/users/1')
     * @param options Doplňující nastavení (payload, query parametry, atd.)
     * @returns Surová odpověď od API (APIResponse).
     */
    private async _sendRequest(method: HttpMethod, endpoint: string, options: { data?: any; params?: Record<string, any>; isPublic?: boolean } = {}): Promise<APIResponse> {
        const url = `${this.baseURL}${endpoint}`;                     // Sestavení kompletní URL
        const requestId = randomUUID().slice(0, 8);                   // Vygenerování krátkého ID pro párování logů

        // --- Sestavení hlaviček ---
        const headers: Record<string, string> = {
            'Accept': 'application/json, text/plain, */*',          // Jaké typy odpovědí přijímáme
            'Content-Type': 'application/json;charset=UTF-8',       // V jakém formátu posíláme data
            'X-Request-ID': requestId,                              // Přidání unikátního ID do hlavičky
        };

        if (!options.isPublic && this.authToken) {                    // Pokud endpoint není veřejný a máme token...
            headers['Authorization'] = `Bearer ${this.authToken}`;  // ...přidáme autorizační hlavičku.
        }

        // --- Maskování citlivých dat pro logování ---
        const maskedHeaders = { ...headers };                         // Vytvoření kopie hlaviček pro bezpečné logování
        if (maskedHeaders['Authorization']) {
            maskedHeaders['Authorization'] = '*** MASKED ***';        // Nahrazení tokenu zástupným textem
        }

        // --- Logování odchozího požadavku ---
        logger.trace(`[${requestId}] ---> ${method} ${url}`, {        // Log na nejnižší úrovni (trace)
            params: options.params,
            data: options.data,
            headers: maskedHeaders,
        });

        const startTime = performance.now();                          // Zaznamenání času před odesláním požadavku
        
        // --- Odeslání požadavku pomocí Playwright ---
        const response = await this.request[method.toLowerCase() as 'get' | 'post' | 'put' | 'delete'](url, {
            headers: headers,
            params: options.params,
            data: options.data,
        });
        
        const duration = (performance.now() - startTime).toFixed(2);  // Výpočet doby trvání požadavku v ms

        // --- Logování příchozí odpovědi ---
        logger.info(`[${requestId}] <--- ${response.status()} ${method} ${url} (${duration} ms)`);
        
        // Logování detailů odpovědi na úrovni 'silly' pro snadné zapnutí/vypnutí v konfiguraci
        const responseBody = await response.text();
        logger.silly(`[${requestId}] Response Headers:`, response.headers());
        logger.silly(`[${requestId}] Response Body:`, responseBody);

        return response; // Vrácení celé, nezměněné odpovědi
    }

    /**
     * Zpracuje odpověď, v případě chyby vyhodí strukturovanou ApiError.
     * V případě úspěchu naparsuje a vrátí tělo odpovědi.
     * @param response Surová APIResponse z metody _sendRequest.
     * @returns Naparsované tělo odpovědi.
     */
    private async _handleAndParseResponse<T>(response: APIResponse): Promise<T> {
        const responseBodyText = await response.text();               // Přečtení těla odpovědi jako text
        const requestId = response.headers()['x-request-id'] || 'N/A';


        if (!response.ok()) {                                         // Pokud status kód není 2xx...
            const errorMessage = `[${requestId}] API Error: Status ${response.status()} on ${response.url()}`;
            logger.error(errorMessage, { body: responseBodyText });   // ...zalogujeme chybu
            throw new ApiError(errorMessage, response.status(), responseBodyText); // ...a vyhodíme naši vlastní chybovou třídu
        }
        
        if (response.status() === 204 || responseBodyText.length === 0) { // Pokud je odpověď 'No Content' nebo prázdná...
            return null as T;                                         // ...vrátíme null.
        }

            const contentType = response.headers()['content-type'] || '';
        if (!contentType.includes('application/json')) {
            const errorMessage = `[${requestId}] API Error: Expected JSON response, but got '${contentType}' from ${response.url()}`;
            logger.error(errorMessage, { body: responseBodyText });
            // Vyhodíme chybu, protože jsme nedostali očekávaný formát
            throw new Error(errorMessage);
        }

        try {
            return JSON.parse(responseBodyText) as T;                 // Pokusíme se naparsovat text jako JSON
        } catch (e) {
            const errorMessage = `[${requestId}] Failed to parse JSON body from ${response.url()}`;
            logger.error(errorMessage, { body: responseBodyText });
            throw new Error(errorMessage);                            // Pokud se parsování nepovede, vyhodíme standardní chybu
        }
    }


    // =================================================================
    // VEŘEJNÉ METODY VRACEJÍCÍ CELOU ODPOVĚĎ (APIResponse)
    // =================================================================

    public async getResponse(endpoint: string, params: Record<string, any> = {}, options: { isPublic?: boolean } = {}): Promise<APIResponse> {
        return this._sendRequest('GET', endpoint, { params, ...options });
    }

    public async postResponse(endpoint: string, data: any, options: { isPublic?: boolean } = {}): Promise<APIResponse> {
        return this._sendRequest('POST', endpoint, { data, ...options });
    }
    
    public async putResponse(endpoint: string, data: any, options: { isPublic?: boolean } = {}): Promise<APIResponse> {
        return this._sendRequest('PUT', endpoint, { data, ...options });
    }

    public async deleteResponse(endpoint: string, options: { isPublic?: boolean } = {}): Promise<APIResponse> {
        return this._sendRequest('DELETE', endpoint, { ...options });
    }

    // =================================================================
    // VEŘEJNÉ METODY VRACEJÍCÍ POUZE TĚLO ODPOVĚDI (Promise<T>)
    // =================================================================

    public async get<T>(endpoint: string, params: Record<string, any> = {}, options: { isPublic?: boolean } = {}): Promise<T> {
        const response = await this.getResponse(endpoint, params, options);
        return this._handleAndParseResponse<T>(response);
    }

    public async post<T>(endpoint: string, data: any, options: { isPublic?: boolean } = {}): Promise<T> {
        const response = await this.postResponse(endpoint, data, options);
        return this._handleAndParseResponse<T>(response);
    }
    
    public async put<T>(endpoint: string, data: any, options: { isPublic?: boolean } = {}): Promise<T> {
        const response = await this.putResponse(endpoint, data, options);
        return this._handleAndParseResponse<T>(response);
    }

    public async delete<T>(endpoint: string, options: { isPublic?: boolean } = {}): Promise<T> {
        const response = await this.deleteResponse(endpoint, options);
        return this._handleAndParseResponse<T>(response);
    }
}