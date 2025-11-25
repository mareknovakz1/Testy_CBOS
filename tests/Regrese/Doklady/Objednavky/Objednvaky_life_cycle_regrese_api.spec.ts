/**
 * @file Objednvaky_life_cycle_regrese.spec.ts
 * @description Regresní E2E testy pro životní cyklus objednávky (Plně Data-Driven).
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import { ACC_OWNER_ID } from '../../../../support/constants';
import allOrderData from '../../../../test-data/Objednavky_life_cycle_regrese.json';
import * as t from '../../../../api/types/documents'; 

logger.silly(`Testovací data: ${JSON.stringify(allOrderData, null, 2)}`);

function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

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
    PLU?: string;
    stockCardId?: number;
    amount?: number;
    params?: t.GetListOfStockCardsParams;
    sendOrder?: boolean;
    saveEmail?: boolean;
    comment?: string;
    agreement?: boolean;
    expectationState?: string; 
};

//Interface pro načtení testovacích dat
type OrderTestCase = {
    caseName: string;
    step1_CreateOrder: OrderStepData;
    step2_GetOrdersList: OrderStepData;
    step3_GetStockCard: OrderStepData;
    step4_AddOrderItem: OrderStepData;
    step5_GetOrderItems: OrderStepData;
    step6_SendOrder: OrderStepData;       
    step7_ApproveDifference: OrderStepData;
    step8_ApproveOrder: OrderStepData; 
};

logger.info('Spouštím regresní testy pro životní cyklus objednávek pomocí API.');

for (const testCaseKey of Object.keys(allOrderData)) {
    const rawData = allOrderData[testCaseKey as keyof typeof allOrderData] as any;
    const tags = rawData.step1_CreateOrder?.tags || rawData.tags || [];
    const tagsString = (tags.length > 0) ? ` ${tags.join(' ')}` : '';
    
    const testTitle = `${testCaseKey}: Life Cycle ... ${tagsString}`;

    test(testTitle, async ({ apiClient }) => {
        const testCaseData = rawData as OrderTestCase;

        let createdOrderId: number; 
        let foundStockCardId: number;
        let createdOrderItemId: number; 
        let stockId: number; 
        let endpoint: string;
        let response: any;
        
        const tomorrow = getTomorrowDate();
        const uniqueOrderDescription = `AutoTest_${testCaseKey}_${Date.now()}`;

        logger.info(`Spouštím test: ${testCaseKey} ${testCaseData.caseName}`);

        // -------------------------------------------------------------------------
        // Krok 1: Vytvoření objednávky
        // -------------------------------------------------------------------------
        await test.step('Krok 1: POST /documents-api/orders/{stockId}', async () => {
            const stepData = testCaseData.step1_CreateOrder;
            stockId = stepData.stockId!;
            
            const payload: t.CreateOrderPayload = {
                orderDate: new Date().toISOString(),
                deliveryDate: tomorrow.toISOString(),
                description: uniqueOrderDescription,
                ownerName: stepData.ownerName!,
                ownerId: stepData.ownerId!,
                stockId: stockId,
                supplierId: stepData.supplierId!,
                supplierName: stepData.supplierName!,
            };

            await apiClient.documents.postOrder(stockId, payload);
            logger.info(`Krok 1 OK: Objednávka vytvořena.`);
        }); 

        // -------------------------------------------------------------------------
        // Krok 2: Ověření a získání ID objednávky
        // -------------------------------------------------------------------------
        await test.step('Krok 2: GET /reports-api/orders', async () => {
            const stepData = testCaseData.step2_GetOrdersList;
            const payload = { stockId: stepData.stockId!, year: stepData.year! };
            
            response = await apiClient.reports.getListOfOrders(payload); 
            const foundOrder = response.find((order: any) => order.description === uniqueOrderDescription);
            
            expect(foundOrder, `Objednávka nenalezena.`).toBeDefined();
            createdOrderId = foundOrder.id;
            logger.info(`Krok 2 OK: Objednávka ID ${createdOrderId}.`);
        });

        // -------------------------------------------------------------------------
        // Krok 3: Vyhledání skladové karty
        // -------------------------------------------------------------------------
        await test.step('Krok 3: GET /reports-api/listOfStockCards', async () => {
            const stepData = testCaseData.step3_GetStockCard;
            if (!stepData.params) throw new Error("Chybí params pro Krok 3");

            response = await apiClient.reports.getListOfStockCards(
                String(ACC_OWNER_ID || "60193531"), 
                stepData.stockId!, 
                stepData.params
            );

            const foundCard = response.find((card: any) => String(card.plu) === String(stepData.params!.search)); 
            if (!foundCard) throw new Error(`Karta PLU ${stepData.params!.search} nenalezena.`);
            
            foundStockCardId = foundCard.id;
            logger.info(`Krok 3 OK: StockCard ID: ${foundStockCardId}`);
        });

        // -------------------------------------------------------------------------
        // Krok 4: Přidání zboží do objednávky (pouze POST)
        // -------------------------------------------------------------------------
        await test.step('Krok 4: POST /documents-api/orderItems', async () => {
            const stepData = testCaseData.step4_AddOrderItem;
            const expectedStatus = stepData.expectationState ? parseInt(stepData.expectationState) : 201;

            const payload = { 
                "orderId": createdOrderId, 
                "stockCardId": foundStockCardId, 
                "amount": stepData.amount ?? 1 
            };

            logger.trace(`Krok 4: Odesílám items...`);
            const postResponse: any = await apiClient.documents.postOrderItems(stockId, payload);       
            
            // Validace statusu, pokud wrapper vrací response objekt
            if (postResponse && postResponse.status) {
                expect(postResponse.status).toBe(expectedStatus);
            }
            logger.info(`Krok 4 OK: Item odeslán.`);
        });

        // -------------------------------------------------------------------------
        // Krok 5: Získání ID položky (NEW)
        // -------------------------------------------------------------------------
        await test.step('Krok 5: GET /documents-api/orders/items/{stockId}/{orderId}', async () => {
            logger.debug(`Krok 5: Stahuji items pro objednávku ${createdOrderId} k nalezení ID řádku.`);

            // OPRAVA: Přetypování na 'any', abychom obešli kontrolu GenericApiResponse,
            // nebo pokud metoda vrací { data: [] }, musíme přistoupit k .data.
            // Zde předpokládám, že volání vrací přímo pole, takže použijeme 'as any' nebo 'as any[]'.
            const response = await apiClient.documents.getOrderItems(stockId, createdOrderId) as any;
            
            // Ošetření: API wrapper někdy vrací pole přímo, někdy objekt { data: [...] }
            const itemsResponse: any[] = Array.isArray(response) ? response : (response.data || response.items || []);
            
            expect(Array.isArray(itemsResponse), `Response items není pole. Přišlo: ${typeof response}`).toBeTruthy();

            // Hledáme položku, která odpovídá našemu StockCardId
            const foundItems = itemsResponse.filter((item: any) => item.stockCardId === foundStockCardId);
            
            if (foundItems.length > 0) {
                // Seřadíme sestupně podle ID, abychom vzali tu nejnovější
                foundItems.sort((a: any, b: any) => b.id - a.id);
                createdOrderItemId = foundItems[0].id;
                logger.info(`Krok 5 OK: Získáno ordersItemId: ${createdOrderItemId}`);
            } else {
                throw new Error(`Krok 5 Chyba: Položka stockCardId ${foundStockCardId} v objednávce ${createdOrderId} nebyla nalezena.`);
            }
        });

        // -------------------------------------------------------------------------
        // Krok 6: Odeslání objednávky (Send Order)
        // -------------------------------------------------------------------------
        await test.step('Krok 6: PUT /documents-api/orders/ordersSend/{stockId}', async () => {
            const stepData = testCaseData.step6_SendOrder;
            
            const payload: t.SendOrderPayload = {
                stockId: stepData.stockId!,
                orderId: createdOrderId,
                sendOrder: stepData.sendOrder ?? false, 
                saveEmail: stepData.saveEmail ?? false 
            };

            await apiClient.documents.sendOrder(stockId, payload);       
            logger.info(`Krok 6 OK: Objednávka odeslána.`);
        });

        // -------------------------------------------------------------------------
        // Krok 7: Schválení rozdílu (Approve)
        // -------------------------------------------------------------------------
        await test.step('Krok 7: PUT /documents-api/ordersItems (Agreement)', async () => {
            const stepData = testCaseData.step7_ApproveDifference;
            
            if (!createdOrderItemId) throw new Error("Chybí ordersItemId z Kroku 5!");

            // Endpoint cílí na konkrétní řádek
            endpoint = `/documents-api/ordersItems/${stockId}/${createdOrderItemId}`;

            const payload = { 
                orderId: createdOrderId,       // ID hlavičky
                stockCardId: foundStockCardId, // ID zboží
                amount: stepData.amount ?? 10, 
                comment: stepData.comment ?? "Schválení změny",
                agreement: true               
            };

            logger.debug(`Krok 7: Odesílám: PUT: ${endpoint}, Payload: ${JSON.stringify(payload)}`);
            await apiClient.documents.put(endpoint, payload);
            
            logger.info(`Krok 7 OK: Rozdíl schválen pro Item ID ${createdOrderItemId}.`);
        });

    // -------------------------------------------------------------------------
        // Krok 8: Schválení objednávky (Approve / Valid)
        // -------------------------------------------------------------------------
        await test.step('Krok 8: PUT /documents-api/orders/valid/{stockId}/{orderId}', async () => {
            logger.info('Zahajuji schválení objednávky.');
            const stepData = testCaseData.step8_ApproveOrder; 

            if (!createdOrderId) {
                throw new Error("Nelze schválit objednávku: ID objednávky chybí.");
            }

            endpoint = `/documents-api/orders/valid/${stockId}/${createdOrderId}`;

            try {
                logger.debug(`Volám metodu approveOrder pro stockId: ${stockId}, orderId: ${createdOrderId}`);
                
                // Volání API metody
                await apiClient.documents.approveOrder(stockId, createdOrderId);
                
                logger.info(`Krok 8 OK: Objednávka ${createdOrderId} byla úspěšně schválena.`);

            } catch (error) {
                const fullUrl = `${apiClient.documents.baseURL}${endpoint}`;
                logger.error(`Krok 8 selhal: ${error}, URL: ${fullUrl}`);
                throw error;
            }
        });

    });
}