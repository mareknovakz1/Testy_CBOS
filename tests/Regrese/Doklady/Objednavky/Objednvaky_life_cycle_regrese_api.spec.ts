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

/** Krok 1: Vytvoření objednávky */
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

/** Krok 2: Ověření a získání ID objednávky */
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

/** Krok 3: Vyhledání skladové karty */
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

/** Krok 4: Přidání zboží do objednávky */
async function addOrderItem(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 4: ${stepData.name}`, async () => {
        if (!ctx.createdOrderId) throw new Error("Chybí Order ID z předchozích kroků.");
        if (!ctx.foundStockCardId) throw new Error("Chybí Stock Card ID z předchozích kroků.");

        const expectedStatus = stepData.expectationState ? parseInt(stepData.expectationState) : 201;
        const payload = { 
            "orderId": ctx.createdOrderId, 
            "stockCardId": ctx.foundStockCardId, 
            "amount": stepData.amount ?? 1 
        };

        logger.trace(`Krok 4: Odesílám items...`);
        const postResponse: any = await ctx.apiClient.documents.postOrderItems(stepData.stockId!, payload);        
        
        if (postResponse && postResponse.status) {
            expect(postResponse.status).toBe(expectedStatus);
        }
        logger.info(`Krok 4 OK: Item odeslán.`);
    });
}

/** Krok 5: Získání ID položky */
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

/** Krok 6: Odeslání objednávky */
async function sendOrder(ctx: TestContext, stepData: OrderStepData) {
    await test.step(`Krok 6: ${stepData.name}`, async () => {
        const payload: t.SendOrderPayload = {
            stockId: stepData.stockId!,
            orderId: ctx.createdOrderId!,
            sendOrder: stepData.sendOrder ?? false, 
            saveEmail: stepData.saveEmail ?? false 
        };

        await ctx.apiClient.documents.sendOrder(stepData.stockId!, payload);        
        logger.info(`Krok 6 OK: Objednávka odeslána.`);
    });
}

/** Krok 7: Schválení rozdílu */
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

/** Krok 8: Schválení objednávky (Validace) */
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

// -------------------------------------------------------------------------
// MAIN TEST LOOP
// -------------------------------------------------------------------------

logger.info('Spouštím regresní testy pro životní cyklus objednávek pomocí API.');

for (const testCaseKey of Object.keys(allOrderData)) {
    const rawData = allOrderData[testCaseKey as keyof typeof allOrderData] as any;
    const testCaseData = rawData as OrderTestCase;

    // Extrakce tagů z prvního kroku nebo rootu
    const tags = testCaseData.step1_CreateOrder?.tags || rawData.tags || [];
    const tagsString = (tags.length > 0) ? ` ${tags.join(' ')}` : '';
    const testTitle = `${testCaseKey}: Life Cycle ... ${tagsString}`;

    test(testTitle, async ({ apiClient }) => {
        logger.info(`Spouštím test: ${testCaseKey} ${testCaseData.caseName}`);

        // Inicializace kontextu pro tento konkrétní test case
        const context: TestContext = {
            apiClient,
            uniqueOrderDescription: `AutoTest_${testCaseKey}_${Date.now()}`
        };

        // Provolávání funkcí řízené existencí dat v JSONu
        if (testCaseData.step1_CreateOrder) {
            await createOrder(context, testCaseData.step1_CreateOrder);
        }

        if (testCaseData.step2_GetOrdersList) {
            await getOrderAndVerify(context, testCaseData.step2_GetOrdersList);
        }

        if (testCaseData.step3_GetStockCard) {
            await getStockCard(context, testCaseData.step3_GetStockCard);
        }

        if (testCaseData.step4_AddOrderItem) {
            await addOrderItem(context, testCaseData.step4_AddOrderItem);
        }

        if (testCaseData.step5_GetOrderItems) {
            await getOrderItemId(context, testCaseData.step5_GetOrderItems);
        }

        if (testCaseData.step6_SendOrder) {
            await sendOrder(context, testCaseData.step6_SendOrder);
        }

        if (testCaseData.step7_ApproveDifference) {
            await approveDifference(context, testCaseData.step7_ApproveDifference);
        }

        if (testCaseData.step8_ApproveOrder) {
            await approveOrder(context, testCaseData.step8_ApproveOrder);
        }
    });
}