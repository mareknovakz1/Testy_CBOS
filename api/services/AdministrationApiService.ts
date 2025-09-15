/**
 * @file AdministrationApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje AdministrationApiService, specializovanou službu pro komunikaci
 * se správními (administration) endpointy API.
 * @classdesc
 * AdministrationApiService dědí od BaseApiClient a přidává metody specifické pro
 * správní operace, jako je získání statusu API.
 * 
 */

import { BaseApiClient } from '../BaseApiClient';

export class AdministrationApiService extends BaseApiClient {
    /**
     * Získá aktuální stav API.
     * GET /api/status
     */
    public async getStatus(): Promise<ApiStatus> {
        // Všimni si, že BaseApiClient se postará o složení s baseURL
        const endpoint = '/api/status';
        return this.get<ApiStatus>(endpoint);
    }
}