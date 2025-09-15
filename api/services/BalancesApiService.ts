/**
 * @file BalancesApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje BalancesApiService, specializovanou službu pro komunikaci
 * s endpointy API týkajícími se zůstatků (balances).
 * 
 * @classdesc
 * BalancesApiService dědí od BaseApiClient a přidává metody specifické pro
 * operace se zůstatky, jako je získání aktuálních zůstatků uživatele.
 */

import { BaseApiClient } from '../BaseApiClient';

export class BalancesApiService extends BaseApiClient {};