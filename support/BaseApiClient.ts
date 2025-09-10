/**
 * @file BaseApiClient.ts
 * @author Marek Novák
 * @date 10.09.2025
 * @description
 * Tento soubor obsahuje univerzální, nízkoúrovňovou třídu BaseApiClient,
 * která slouží jako základní stavební kámen pro komunikaci s jakýmkoliv API.
 *
 * @classdesc
 * Třída BaseApiClient se stará o veškerou opakující se logiku spojenou
 * s HTTP požadavky, jako jsou:
 * - Přidávání autorizačních hlaviček
 * - Centralizované logování
 * - Jednotné zpracování chybových stavů
 *
 * Sama o sobě neobsahuje žádnou logiku specifickou pro konkrétní endpointy.
 * Je to "motor", který pohání specifické API služby (např. PartnerApiService).
 */

import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from './logger';
import { baseURL } from './constants';  

export class BaseApiClient {
    protected request: APIRequestContext;
    protected authToken: string | null;
    protected baseURL: string;

    constructor(request: APIRequestContext, authToken: string) {
        this.request = request;
        this.authToken = authToken;
        this.baseURL = baseURL;
    }
}
