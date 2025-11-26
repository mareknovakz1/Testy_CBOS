/**
 * @file Objednvaky_life_cycle_regrese.spec.ts
 * @description Regresní E2E testy pro životní cyklus objednávky (Refactored - Functional Steps).
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import { ACC_OWNER_ID } from '../../../../support/constants';
import allOrderData from '../../../../test-data/Objednavky_life_cycle_regrese.json';
import * as t from '../../../../api/types/documents'; 

// -------------------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------------------

type OrderStepData = {
    name: string;
    tags?: string[];
    description?: string;
    stockId?: number;
    ownerId?: number;
    ownerName?: string;
    supplierId?: number;
    supplierName?: string;
    transporterId?: string;
    transporterName?: string;
    year?: number;
    params?: t.GetListOfStockCardsParams;
    amount?: number;
    expectationState?: string; 
    sendOrder?: boolean;
    saveEmail?: boolean;
    comment?: string;
    agreement?: boolean;
    email?: string;
};

type OrderTestCase = {
    caseName: string;
    step1_CreateOrder?: OrderStepData;
    step2_GetOrdersList?: OrderStepData;
    step3_GetStockCard?: OrderStepData;
    step4_AddOrderItem?: OrderStepData;
    step5_GetOrderItems?: OrderStepData;
    step6_SendOrder?: OrderStepData;        
    step7_ApproveDifference?: OrderStepData;
    step8_ApproveOrder?: OrderStepData; 
};

// Kontext pro sdílení stavu mezi kroky
interface TestContext {
    apiClient: any; // Type based on your fixture
    uniqueOrderDescription: string;
    createdOrderId?: number;
    foundStockCardId?: number;
    createdOrderItemId?: number;
}

// -------------------------------------------------------------------------
// REGISTR KROKŮ (MAPPING)
// -------------------------------------------------------------------------
// Mapování názvu akce z JSONu (např. "CreateOrder") na TypeScript funkci
const STEP_REGISTRY: Record<string, (ctx: TestContext, data: OrderStepData) => Promise<void>> = {
    "CreateOrder": createOrder,
    "GetOrdersList": getOrderAndVerify,
    "GetStockCard": getStockCard,
    "AddOrderItem": addOrderItem,
    "GetOrderItems": getOrderItemId,
    "SendOrder": sendOrder,
    "ApproveDifference": approveDifference,
    "ApproveOrder": approveOrder,
    "DeleteOrder": deleteOrder
};

// -------------------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------------------

function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

// -------------------------------------------------------------------------
// STEP FUNCTIONS
// -------------------------------------------------------------------------

/** Vytvoření objednávky */
async function createOrder(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 1: ${stepData.name}`, async () => {
        const tomorrow = getTomorrowDate();
        const stockId = stepData.stockId!;
        
        const payload: t.CreateOrderPayload = {
            orderDate: new Date().toISOString(),
            deliveryDate: tomorrow.toISOString(),
            description: ctx.uniqueOrderDescription,
            ownerName: stepData.ownerName!,
            ownerId: stepData.ownerId!,
            stockId: stockId,
            supplierId: stepData.supplierId!,
            supplierName: stepData.supplierName!,
        };

        await ctx.apiClient.documents.postOrder(stockId, payload);
        logger.info(`Krok 1 OK: Objednávka vytvořena.`);
    });
}

/** Ověření a získání ID objednávky */
async function getOrderAndVerify(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 2: ${stepData.name}`, async () => {
        const payload = { stockId: stepData.stockId!, year: stepData.year! };
        
        const response = await ctx.apiClient.reports.getListOfOrders(payload); 
        const foundOrder = response.find((order: any) => order.description === ctx.uniqueOrderDescription);
        
        expect(foundOrder, `Objednávka s popisem ${ctx.uniqueOrderDescription} nenalezena.`).toBeDefined();
        
        ctx.createdOrderId = foundOrder.id;
        logger.info(`Krok 2 OK: Objednávka ID ${ctx.createdOrderId} nalezena.`);
    });
}

/** Vyhledání skladové karty */
async function getStockCard(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 3: ${stepData.name}`, async () => {
        if (!stepData.params) throw new Error("Chybí params pro Krok 3");

        const response = await ctx.apiClient.reports.getListOfStockCards(
            String(ACC_OWNER_ID || "60193531"), 
            stepData.stockId!, 
            stepData.params
        );

        const foundCard = response.find((card: any) => String(card.plu) === String(stepData.params!.search)); 
        if (!foundCard) throw new Error(`Karta PLU ${stepData.params!.search} nenalezena.`);
        
        ctx.foundStockCardId = foundCard.id;
        logger.info(`Krok 3 OK: StockCard ID: ${ctx.foundStockCardId}`);
    });
}

/** Přidání zboží do objednávky */
async function addOrderItem(ctx: TestContext, stepData: OrderStepData) {
    // Vylepšený název kroku (aby v logu nebylo undefined)
    const stepName = stepData.name || stepData.description || 'AddOrderItem';

    await test.step(`Krok: ${stepName}`, async () => {
        if (!ctx.createdOrderId) throw new Error("Chybí Order ID z předchozích kroků.");
        
        // Získání očekávaného statusu (default 201)
        const expectedStatus = stepData.expectationState ? parseInt(stepData.expectationState) : 201;

        // Pokud nemáme ID karty v datech, zkusíme kontext
        const cardId = ctx.foundStockCardId; 
        if (!cardId) throw new Error("Chybí Stock Card ID (z kontextu kroku FindStockCard).");

        const payload = { 
            "orderId": ctx.createdOrderId, 
            "stockCardId": cardId, 
            "amount": stepData.amount ?? 1 
        };

        logger.trace(`Krok: Odesílám items (očekávám ${expectedStatus})...`);

        try {
            // --- POKUS O VOLÁNÍ API ---
            const postResponse: any = await ctx.apiClient.documents.postOrderItems(stepData.stockId!, payload);
            
            // --- A) API NEVRÁTILO CHYBU (2xx) ---
            
            // Pokud jsme čekali chybu (např. 409), ale API vrátilo úspěch (201), je to chyba testu!
            if (expectedStatus >= 400) {
                throw new Error(`Test selhal: Očekávána chyba ${expectedStatus}, ale API vrátilo úspěch (Status ${postResponse?.status}).`);
            }

            // Validace úspěšného statusu
            if (postResponse && postResponse.status) {
                expect(postResponse.status).toBe(expectedStatus);
            }
            logger.info(`Krok OK: Item přidán (Status ${expectedStatus}).`);

        } catch (error: any) {
            // --- B) API VRÁTILO CHYBU (4xx, 5xx) ---

            // Zkusíme vytáhnout status kód z chyby
            // BaseApiClient obvykle hází ApiError, který může mít property .status nebo ho musíme vyčíst
            const actualStatus = error.status || error.statusCode || (error.response ? error.response.status : undefined);

            logger.debug(`Zachycena chyba API. Status v erroru: ${actualStatus}. Očekáváno: ${expectedStatus}`);

            if (actualStatus && Number(actualStatus) === expectedStatus) {
                // HURÁ! Nastala přesně ta chyba, kterou jsme chtěli (např. 409 Conflict)
                logger.info(`Krok OK (Negativní test): Očekávaná chyba ${actualStatus} byla úspěšně zachycena.`);
                return; // Test považujeme za úspěšný
            }

            // Pokud nastala jiná chyba, nebo jsme chybu nečekali, pošleme ji dál (test selže)
            logger.error(`Krok selhal: Očekáván status ${expectedStatus}, ale přišel ${actualStatus}. Error message: ${error.message}`);
            throw error; 
        }
    });
}

/** Získání ID položky */
async function getOrderItemId(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 5: ${stepData.name}`, async () => {
        logger.debug(`Krok 5: Stahuji items pro objednávku ${ctx.createdOrderId}.`);

        const response = await ctx.apiClient.documents.getOrderItems(stepData.stockId!, ctx.createdOrderId!) as any;
        
        // Normalizace response (pole vs objekt s daty)
        const itemsResponse: any[] = Array.isArray(response) ? response : (response.data || response.items || []);
        
        expect(Array.isArray(itemsResponse), `Response items není pole.`).toBeTruthy();

        // Hledáme položku podle stockCardId
        const foundItems = itemsResponse.filter((item: any) => item.stockCardId === ctx.foundStockCardId);
        
        if (foundItems.length > 0) {
            // Seřadíme sestupně podle ID, bereme nejnovější
            foundItems.sort((a: any, b: any) => b.id - a.id);
            ctx.createdOrderItemId = foundItems[0].id;
            logger.info(`Krok 5 OK: Získáno ordersItemId: ${ctx.createdOrderItemId}`);
        } else {
            throw new Error(`Krok 5 Chyba: Položka stockCardId ${ctx.foundStockCardId} nebyla nalezena.`);
        }
    });
}

/** Odeslání objednávky */
async function sendOrder(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 6: ${stepData.name}`, async () => {
        const payload: t.SendOrderPayload = {
            stockId: stepData.stockId!,
            orderId: ctx.createdOrderId!,
            sendOrder: stepData.sendOrder ?? false, 
            saveEmail: stepData.saveEmail ?? false,
            email: stepData.email 
        };

        await ctx.apiClient.documents.sendOrder(stepData.stockId!, payload);        
        logger.info(`Krok 6 OK: Objednávka odeslána.`);
    });
}

/** Schválení rozdílu */
async function approveDifference(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 7: ${stepData.name}`, async () => {
        if (!ctx.createdOrderItemId) throw new Error("Chybí ordersItemId z Kroku 5!");

        const endpoint = `/documents-api/ordersItems/${stepData.stockId}/${ctx.createdOrderItemId}`;
        const payload = { 
            orderId: ctx.createdOrderId,
            stockCardId: ctx.foundStockCardId,
            amount: stepData.amount ?? 10, 
            comment: stepData.comment ?? "Schválení změny",
            agreement: true                
        };

        logger.debug(`Krok 7 PUT: ${endpoint}`);
        await ctx.apiClient.documents.put(endpoint, payload);
        
        logger.info(`Krok 7 OK: Rozdíl schválen.`);
    });
}

/** Schválení objednávky (Validace) */
async function approveOrder(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 8: ${stepData.name}`, async () => {
        if (!ctx.createdOrderId) {
             throw new Error("Nelze schválit objednávku: ID objednávky chybí z předchozích kroků.");
        }

        // Sestavení URL podle vzoru: /documents-api/orders/valid/{stockId}/{orderId}
        const endpoint = `/documents-api/orders/valid/${stepData.stockId}/${ctx.createdOrderId}`;

        // Payload přesně podle zaslaného CURLu
        const payload = {
            emulateJSON: true,
            emulateHTTP: true
        };

        logger.debug(`Krok 8: Volám POST ${endpoint} s payloadem: ${JSON.stringify(payload)}`);

        try {
            // Používáme generickou metodu .post na apiClient.documents (předpokládám, že ji BaseApiClient má)
            // Pokud by to nefungovalo, zkuste .put, ale curl naznačuje POST.
            await ctx.apiClient.documents.post(endpoint, payload);
            
            logger.info(`Krok 8 OK: Objednávka ${ctx.createdOrderId} byla úspěšně validována.`);
        } catch (error) {
            logger.error(`Krok 8 selhal na endpointu ${endpoint}. Chyba: ${error}`);
            throw error;
        }
    });
}

/** Smazání objednávky */
async function deleteOrder(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok: ${stepData.name || 'DeleteOrder'}`, async () => {
        if (!ctx.createdOrderId) {
            throw new Error("Nelze smazat objednávku: ID objednávky chybí z předchozích kroků.");
        }

        const endpoint = `/documents-api/orders/${stepData.stockId}/${ctx.createdOrderId}`;
        logger.debug(`Mažu objednávku: DELETE ${endpoint}`);

        // Volání API metody deleteOrder (kterou jsi definoval v zadání)
        await ctx.apiClient.documents.deleteOrder(stepData.stockId!, ctx.createdOrderId);

        logger.info(`Krok OK: Objednávka ID ${ctx.createdOrderId} byla úspěšně smazána.`);
    });
}

/** Krok: Vytvoření kopie objednávky (Copy/Template) */
async function copyOrderFromOrder(ctx: TestContext, stepData: OrderStepData) {
    // Fallback pro název kroku
    const stepName = stepData.name || 'CopyOrderFromOrder';

    await test.step(`Krok: ${stepName}`, async () => {
        // Validace vstupů
        if (!ctx.createdOrderId) {
            throw new Error("Nelze kopírovat: V kontextu chybí ID zdrojové objednávky (createdOrderId).");
        }
        if (!stepData.stockId) {
            throw new Error("Chybí 'stockId' v definici kroku.");
        }

        logger.debug(`Kopíruji objednávku ID ${ctx.createdOrderId} na skladě ${stepData.stockId}...`);

        // Volání API metody (dle vašeho zadání)
        // Předpokládám, že vrací objekt nové objednávky (t.OrderResponse)
        const response: any = await ctx.apiClient.documents.copyOrderFromOrder(stepData.stockId, ctx.createdOrderId);

        // Aktualizace kontextu: Další kroky testu už budou pracovat s tou NOVOU objednávkou
        if (response && response.id) {
            logger.info(`Krok OK: Objednávka zkopírována. Původní ID: ${ctx.createdOrderId} -> Nové ID: ${response.id}`);
            ctx.createdOrderId = response.id;
        } else {
            logger.warn("API nevrátilo ID nové objednávky, kontext (createdOrderId) zůstává nezměněn. Zkontrolujte response.");
        }
    });
}

// -------------------------------------------------------------------------
// MAIN TEST LOOP (NOVÁ VERZE - PODPORUJE "steps")
// -------------------------------------------------------------------------

logger.info('Spouštím regresní testy pro životní cyklus objednávek pomocí API.');

// Iterace přes jednotlivé Test Case (TC_001, TC_002...)
for (const testCaseKey of Object.keys(allOrderData)) {
    const rawData = allOrderData[testCaseKey as keyof typeof allOrderData] as any;

    // 1. Načtení tagů z rootu (aby Playwright viděl @test)
    const tags = rawData.tags || [];
    const tagsString = (tags.length > 0) ? ` ${tags.join(' ')}` : '';
    
    // Sestavení názvu testu
    const testTitle = `${testCaseKey}: ${rawData.caseName || 'Unnamed'} ... ${tagsString}`;

    test(testTitle, async ({ apiClient }) => {
        logger.info(`Spouštím test: ${testCaseKey} - ${rawData.caseName}`);

        // Inicializace kontextu pro tento test
        const context: TestContext = {
            apiClient,
            uniqueOrderDescription: `AutoTest_${testCaseKey}_${Date.now()}`
        };

        // KONTROLA: Máme objekt 'steps'?
        if (!rawData.steps) {
            logger.warn(`Test case ${testCaseKey} přeskočen: Chybí objekt 'steps' v definici JSON.`);
            return;
        }

        // 2. Získání klíčů kroků (např. "01_CreateOrder", "02_Verify"...) a jejich seřazení
        const stepKeys = Object.keys(rawData.steps).sort();

        if (stepKeys.length === 0) {
            logger.warn(`Test case ${testCaseKey} má prázdný objekt 'steps'.`);
        }

        // 3. Iterace přes seřazené kroky
        for (const stepKey of stepKeys) {
            const stepData = rawData.steps[stepKey];
            
            // Přečteme akci definovanou v JSONu (např. "CreateOrder")
            const actionName = stepData.action;

            if (!actionName) {
                throw new Error(`Krok '${stepKey}' v testu '${testCaseKey}' nemá definovanou vlastnost 'action'!`);
            }

            // Najdeme odpovídající funkci v registru
            const actionFunction = STEP_REGISTRY[actionName];

            if (actionFunction) {
                // logger.debug(`Spouštím krok: ${stepKey} -> Akce: ${actionName}`);
                await actionFunction(context, stepData);
            } else {
                logger.warn(`VAROVÁNÍ: Neznámá akce '${actionName}' v kroku '${stepKey}'. Zkontrolujte STEP_REGISTRY.`);
            }
        }
    });
}