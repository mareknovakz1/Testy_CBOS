/**
 * @file SystemApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje SystemApiService, specializovanou službu pro komunikaci
 * se systémovými endpointy API.
 * 
 * @classdesc
 * SystemApiService dědí od BaseApiClient a přidává metody specifické pro
 * operace se systémem, jako je získání systémových informací nebo konfigurace.
 * 
 */

import { APIResponse } from '@playwright/test';
import { BaseApiClient } from '../BaseApiClient';
// Import SystemTypes už zde nepotřebujeme, protože nepracujeme s daty
// import * as SystemTypes from '../types/system'; 

export class SystemApiService extends BaseApiClient {
    
    /**
     * Získá celou odpověď ze serveru pro endpoint /api/status.
     * Tato metoda je určena pro ověření stavového kódu a hlaviček.
     * @returns {Promise<APIResponse>} Surový objekt odpovědi z Playwrightu.
     */
    public async getStatus(): Promise<APIResponse> {

        return this.getResponse('/api/status', {}, { isPublic: true });
    }
}