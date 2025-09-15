/**
 * @file ApiClient.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje hlavní třídu ApiClient, která slouží jako centrální 
 * vstupní bod (fasáda) pro všechny API služby v testovací sadě.
 * * @classdesc
 * Sjednocuje všechny specializované API servisy (Reports, Documents, Auth, atd.)
 * do jednoho snadno použitelného objektu.
 */

import { APIRequestContext } from '@playwright/test';

import { AdministrationApiService } from './services/AdministrationApiService';
import { AuthApiService } from './services/AuthApiService';
import { BalancesApiService } from './services/BalancesApiService';
import { DashboardApiService } from './services/DashboardApiService';
import { DocumentsApiService } from './services/DocumentsApiService';
import { ReportsApiService } from './services/ReportsApiService';
// import { SocketApiService } from './api/services/SocketApiService';
import { SystemApiService } from './services/SystemApiService';

export class ApiClient {
    public readonly administration: AdministrationApiService;
    public readonly auth: AuthApiService;
    public readonly balances: BalancesApiService;
    public readonly dashboard: DashboardApiService;
    public readonly documents: DocumentsApiService;
    public readonly reports: ReportsApiService;
    // public readonly socket: SocketApiService;
    public readonly system: SystemApiService; 

    constructor(request: APIRequestContext, authToken: string) {
        this.administration = new AdministrationApiService(request, authToken);
        this.auth = new AuthApiService(request, authToken);
        this.balances = new BalancesApiService(request, authToken);
        this.dashboard = new DashboardApiService(request, authToken);
        this.documents = new DocumentsApiService(request, authToken);
        this.reports = new ReportsApiService(request, authToken);
        // this.socket = new SocketApiService(request, authToken);
        this.system = new SystemApiService(request, authToken); 
    }
}