/**
 * @file system.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje deklarované payloady a odpovědi pro systémové endpointy API.
 * 
 * @classdesc
 * 
 */


//GET /api/status.
//Response
export interface StatusResponse {
  app_name: string;
  status: 'running' | string; // Můžeme být specifičtější, pokud známe všechny stavy
  version: string;
}

