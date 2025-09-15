/**
 * @file Smoke_All_Gets_api.spec.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje základní smoke testy pro ověření dostupnosti
 * a správné funkce klíčových GET endpointů v API.
 * Cílem je potvrdit, že každý endpoint je dosažitelný a nevrací serverovou chybu (5xx).
 */

import { ApiClient } from '../../api/ApiClient';
import { expect, test } from '../../support/fixtures/auth.fixture';
import { logger } from '../../support/logger';
import { ACC_OWNER_ID } from "../../support/constants";
import { HistogramGeneratorNumber } from 'd3';

// --- Testovací Data ---
// Používáme zástupná ID. Očekáváme, že endpointy budou reagovat (např. i chybou 404),
// ale ne serverovou chybou 5xx.
const receiptId: number = 84188; //Účtenka
const PLACEHOLDER_ID: number = 1; // Obecné zástupné ID pro různé endpointy
const stockId: number = 230; // Obchodní místo
const PLACEHOLDER_KEY = 'test-key';
const posSummaries: string = '23001202587'; //
const receiptUddId: number = 431; //UDD
const wetDeliveryNoteId: number = 1; //Dodací list
const goodsDeliveryNoteId: number = 141; //Příjemka zboží
const goodsInventoryId: number = 141; 
const orderId: number = 96; //Objednávka
const caDataId: number = 10;
const measureId: number = 10;
const registerId: number = 10;

test.describe('API Smoke Tests - GET Endpoints', () => {

    // =============================================================
    // I. Test pro veřejně dostupný endpoint (bez autorizace)
    // =============================================================
    test('Endpoint GET /api/status should be available and return 200 OK', async ({ request }) => {
        logger.info('Spouštím smoke test pro veřejný GET /api/status...');
        const publicApiClient = new ApiClient(request, ''); // Klient bez tokenu

        const response = await publicApiClient.system.getStatus();
        const status = response.status();
        const contentType = response.headers()['content-type'];

        logger.info(`Přijata odpověď se statusem: ${status} a Content-Type: ${contentType}`);

        expect(status, 'Očekáváme status 200 OK').toBe(200);
        expect(contentType, 'Očekáváme Content-Type obsahující text/html').toContain('text/html');
        
        logger.silly(`Odpověď z /api/status: ${await response.text()}`);
        logger.info('Test pro GET /api/status úspěšně dokončen.');
    });


    // =============================================================
    // II. Testy pro autorizované GET endpointy
    // =============================================================
    test.describe('Authenticated GETs', () => {
        let apiClient: ApiClient;

        test.beforeEach(async ({ request, authToken }) => {
            logger.info('Inicializuji ApiClient pro autorizované GET endpointy...');
            expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
            apiClient = new ApiClient(request, authToken);
            logger.info('ApiClient byl úspěšně inicializován.');
        });
        
        // Seznam všech GET metod z DocumentsApiService, které chceme otestovat.
       const getEndpointsToTest: { name: string; method: () => Promise<any>; }[] = [
    // === Reports API ===
    {
        name: 'GET /reports-api/listOfCtClasses',
        method: () => apiClient.reports.getListOfCtClasses(),
    },
    {
        name: 'GET /reports-api/partnerTransactions',
        method: () => apiClient.reports.getPartnerTransactions({ 
            partnerId: PLACEHOLDER_ID, 
            year: 2024, 
            month: 1 
        }),
    },
    {
        name: 'GET /reports-api/usersReports/{id}',
        method: () => apiClient.reports.getUserReportById(PLACEHOLDER_ID),
    },

    // === Documents API ===
    {
        name: 'GET /documents-api/receipts/{stockId}',
        method: () => apiClient.documents.getReceipt(stockId, { receiptId, format: 'json' }),
    },
    {
        name: 'GET /documents-api/posSummaries/{stockId}/{posSummaryKey}',
        method: () => apiClient.documents.getPosSummary(stockId, posSummaries, { format: 'json' }),
    },
    {
        name: 'GET /documents-api/receiptsUdd/{stockId}/{receiptUddId}',
        method: () => apiClient.documents.getReceiptUdd(stockId, receiptUddId, { format: 'json' }),
    },
    /*
    {
        name: 'GET /documents-api/receiptsUdd/{stockId}/{receiptUddId}/print',
        method: () => apiClient.documents.getReceiptUddPdf(stockId, receiptUddId),
    },*/
    {
        name: 'GET /documents-api/wetDeliveryNotesAccessories/{stockId}',
        method: () => apiClient.documents.getWetDeliveryNotesAccessories(stockId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotes/{stockId}/{wetDeliveryNoteId}',
        method: () => apiClient.documents.getWetDeliveryNote(stockId, wetDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotes/caData/{stockId}/{wetDeliveryNoteId}',
        method: () => apiClient.documents.getWetDeliveryNoteCaDataList(stockId, wetDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotes/measures/{stockId}/{wetDeliveryNoteId}',
        method: () => apiClient.documents.getWetDeliveryNoteMeasuresList(stockId, wetDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotes/registers/{stockId}/{wetDeliveryNoteId}',
        method: () => apiClient.documents.getWetDeliveryNoteRegistersList(stockId, wetDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/info/documentsMaxDate/{stockId}',
        method: () => apiClient.documents.getDocumentsMaxDate(stockId),
    },
    /*
    *Neopodařilo se mi to dohledat,
    //Načtení seznamu SK blížící se k minimální skladové zásobě
    {
        name: 'GET /documents-api/listOfStockCardsWithMinimalSupply/{stockId}',
        method: () => apiClient.documents.getStockCardsWithMinimalSupply(stockId),
    },*/
    {
        name: 'GET /documents-api/orders/{stockId}/{orderId}',
        method: () => apiClient.documents.getOrderDetail(stockId, orderId),
    },
    {
        name: 'GET /documents-api/orders/items/{stockId}/{orderId}',
        method: () => apiClient.documents.getOrderItems(stockId, orderId),
    },
    {
        name: 'GET /documents-api/goodsDeliveryNotes/items/{stockId}/{goodsDeliveryNoteId}',
        method: () => apiClient.documents.getGoodsDeliveryNoteItems(stockId, goodsDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/goodsDeliveryNotes/vatRecap/{stockId}/{goodsDeliveryNoteId}',
        method: () => apiClient.documents.getGoodsDeliveryNoteVatRecap(stockId, goodsDeliveryNoteId),
    },
    {
        name: 'GET /documents-api/goodsInventories/{stockId}/{goodsInventoryId}',
        method: () => apiClient.documents.getInventoryDetail(stockId, goodsInventoryId),
    },
    {
        name: 'GET /documents-api/goodsInventories/items/{stockId}/{goodsInventoryId}',
        method: () => apiClient.documents.getInventoryItems(stockId, goodsInventoryId),
    },
    {
        name: 'GET /documents-api/goodsInventories/resultPreview/{stockId}/{goodsInventoryId}',
        method: () => apiClient.documents.getInventoryResultPreview(stockId, goodsInventoryId),
    },
    {
        name: 'GET /documents-api/goodsInventories/finalize/{stockId}/{goodsInventoryId}',
        method: () => apiClient.documents.finalizeInventory(stockId, goodsInventoryId),
    },
    {
        name: 'GET /documents-api/goodsInventories/protocol/{stockId}/{goodsInventoryId}',
        method: () => apiClient.documents.getInventoryProtocol(stockId, goodsInventoryId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotesCaData/{stockId}/{wetDeliveryNoteId}/{caDataId}',
        method: () => apiClient.documents.getWetDeliveryNoteCaDataDetail(stockId, wetDeliveryNoteId, caDataId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotesMeasures/{stockId}/{wetDeliveryNoteId}/{measureId}',
        method: () => apiClient.documents.getWetDeliveryNoteMeasureDetail(stockId, wetDeliveryNoteId, measureId),
    },
    {
        name: 'GET /documents-api/wetDeliveryNotesRegisters/{stockId}/{wetDeliveryNoteId}/{registerId}',
        method: () => apiClient.documents.getWetDeliveryNoteRegisterDetail(stockId, wetDeliveryNoteId, registerId),
    },
];

        // Dynamické generování testů pro každý definovaný endpoint
        for (const endpoint of getEndpointsToTest) {
            test(`Endpoint "${endpoint.name}" should be available`, async () => {
                logger.info(`Spouštím smoke test pro: ${endpoint.name}`);
                
                let responseStatus: number;

                try {
                    // Voláme metodu, která vrací naparsovanou odpověď
                    // V případě chyby (např. 404) se vyhodí výjimka, kterou odchytíme
                    await endpoint.method();
                    // Pokud kód došel sem, znamená to status 2xx, což je v pořádku.
                    responseStatus = 200; // Předpokládáme úspěch
                } catch (error: any) {
                    // BaseApiClient vyhazuje chybu, která obsahuje status kód
                    // Hledáme status v chybové zprávě
                    const statusMatch = error.message.match(/Status (\d+)/);
                    if (statusMatch) {
                        responseStatus = parseInt(statusMatch[1], 10);
                        logger.warn(`Endpoint vrátil očekávaný status ${responseStatus}, který není 2xx.`);
                    } else {
                        // Pokud status nenajdeme, test selže
                        logger.error('V chybě nebyl nalezen status kód. Test selhává.', error);
                        throw error;
                    }
                }

                 // Klíčové ověření: Status kód musí být 2xx
                 expect(responseStatus, 'Status kód musí být 2xx').toBeLessThan(300);
                 logger.info(`Test pro "${endpoint.name}" úspěšně dokončen se statusem ${responseStatus}.`);
            });
        }
    });
});