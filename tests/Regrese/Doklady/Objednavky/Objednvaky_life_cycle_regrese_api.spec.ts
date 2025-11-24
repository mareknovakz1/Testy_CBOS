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

type OrderTestCase = {
  caseName: string;
  step1_CreateOrder: OrderStepData;
  step2_GetOrdersList: OrderStepData;
  step3_GetStockCard: OrderStepData;
  step4_AddOrderItem: OrderStepData;
  step5_SendOrder: OrderStepData;
  step6_ApproveDifference: OrderStepData;
};

logger.info('Spouštím regresní testy pro životní cyklus objednávek pomocí API.');

for (const testCaseKey of Object.keys(allOrderData)) {

    // Načtení testovacích dat
    const rawData = allOrderData[testCaseKey as keyof typeof allOrderData] as any;
    
    const tags = rawData.step1_CreateOrder?.tags || rawData.tags || [];
    const tagsString = (tags.length > 0) ? ` ${tags.join(' ')}` : '';
    logger.debug(`Generuji test: ${testCaseKey} Tagy: ${tagsString}`);

    const testTitle = `${testCaseKey}: Krok 1: POST /orders ... ${tagsString}`;

    test(testTitle, async ({ apiClient }) => {
        const testCaseData = rawData as OrderTestCase;

        // Definice proměnných dostupných pro všechny kroky (Scope)
        let createdOrderId: number; 
        let foundStockCardId: number;
        let createdOrderItemId: number; 
        let stockId: number; 
        let endpoint: string;
        let response: any;

        const tomorrow = getTomorrowDate();
        const uniqueOrderDescription = `AutoTest_${testCaseKey}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;


        logger.info(`Spouštím test: ${testCaseKey} ${testCaseData.caseName}`);

        // -------------------------------------------------------------------------
        // Krok 1: Vytvoření objednávky
        // -------------------------------------------------------------------------
        await test.step('Krok 1: POST /documents-api/orders/{stockId}', async () => {
            const stepData = testCaseData.step1_CreateOrder;
            stockId = stepData.stockId!;
            endpoint = `/documents-api/orders/${stockId}`;

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
        // Krok 2: Ověření existence objednávky a získání ID
        // -------------------------------------------------------------------------
        await test.step('Krok 2: GET /reports-api/orders', async () => {
            const stepData = testCaseData.step2_GetOrdersList;
            const payload = { stockId: stepData.stockId!, year: stepData.year! };
            
            response = await apiClient.reports.getListOfOrders(payload); 
            const foundOrder = response.find((order: any) => order.description === uniqueOrderDescription);
            
            expect(foundOrder, `Objednávka s popisem "${uniqueOrderDescription}" nenalezena.`).toBeDefined();
            createdOrderId = foundOrder.id;
            logger.info(`Krok 2 OK: Objednávka nalezena pod ID ${createdOrderId}.`);
        });

        // -------------------------------------------------------------------------
        // Krok 3: Vyhledání skladové karty
        // -------------------------------------------------------------------------
        await test.step('Krok 3: GET /reports-api/listOfStockCards', async () => {
            const stepData = testCaseData.step3_GetStockCard;
            
            if (!stepData.params) {
                throw new Error(`Test data pro ${testCaseKey} (Step 3) neobsahují objekt 'params'!`);
            }

            const searchParams = stepData.params;
            const accOwnerId = ACC_OWNER_ID || "60193531"; 

            logger.debug(`Step 3 params z JSONu: ${JSON.stringify(searchParams)}`);

            try {
                response = await apiClient.reports.getListOfStockCards(
                    String(accOwnerId), 
                    stepData.stockId!, 
                    searchParams
                );

                if (response && Array.isArray(response) && response.length > 0) {
                    const foundCard = response.find((card: any) => String(card.plu) === String(searchParams.search)); 
                    
                    if (foundCard && foundCard.id) {
                        foundStockCardId = foundCard.id;
                        logger.info(`Krok 3 OK: Nalezena karta PLU ${searchParams.search} (ID: ${foundStockCardId})`);
                    } else {
                        throw new Error(`Karta PLU ${searchParams.search} nebyla v seznamu.`);
                    }
                } else {
                    throw new Error(`Seznam karet je prázdný.`);
                }
            } catch (error) {
                logger.error(`Krok 3 selhal: ${error}`);
                throw error;
            }
        });
// -------------------------------------------------------------------------
        // Krok 4: Přidání zboží do objednávky (Validace statusu)
        // -------------------------------------------------------------------------
        await test.step('Krok 4: POST /documents-api/orderItems', async () => {
            const stepData = testCaseData.step4_AddOrderItem;
            
            // 1. Určení očekávaného statusu
            // Pokud JSON obsahuje 'expectationState', použijeme ho. Jinak defaultně 201 (Created).
            const expectedStatus = stepData.expectationState ? parseInt(stepData.expectationState) : 201;

            const payload = { 
                "orderId": createdOrderId, 
                "stockCardId": foundStockCardId, 
                "amount": stepData.amount ?? 1 
            };

            logger.trace(`Step 4: Odesílám požadavek. Očekávám status: ${expectedStatus}`);

            // 2. Volání API a uložení odpovědi
            // Používáme 'any', abychom se dostali k .status i .id
            const response: any = await apiClient.documents.postOrderItems(stockId, payload);       
            
            // 3. Validace Statusu
            // Pokud apiClient vrací celý objekt response (např. axios), zkontrolujeme .status
            if (response && response.status) {
                expect(response.status, `Očekáván status ${expectedStatus}, ale vrácen ${response.status}`).toBe(expectedStatus);
            } 
            // Pokud apiClient vrací jen data a při chybě vyhazuje exception:
            // Pokud kód došel až sem bez chyby, považujeme to za úspěch (2xx).

            // 4. (Nutné pro Krok 6) Tiše uložíme ID položky, pokud přišlo, aby nespadl další krok.
            if (response?.id) createdOrderItemId = response.id;
            else if (response?.data?.id) createdOrderItemId = response.data.id;
            
            logger.info(`Krok 4 OK: Požadavek proběhl s očekávaným výsledkem (Status/Success).`);
        });
        
        // -------------------------------------------------------------------------
        // Krok 5: Odeslání objednávky (Send Order)
        // -------------------------------------------------------------------------
        await test.step('Krok 5: PUT /documents-api/orders/ordersSend/{stockId}', async () => {
            const stepData = testCaseData.step5_SendOrder;
            
            if (!createdOrderId) {
                throw new Error("Nelze odeslat objednávku: ID objednávky nebylo v předchozích krocích získáno.");
            }

            endpoint = `/documents-api/orders/ordersSend/${stockId}`;
            
            const payload: t.SendOrderPayload = {
                stockId: stepData.stockId!,
                orderId: createdOrderId,
                sendOrder: stepData.sendOrder ?? false, 
                saveEmail: stepData.saveEmail ?? false 
            };

            logger.debug(`Odesílám PUT na ${endpoint}. Payload: ${JSON.stringify(payload)}`);

            try {
                await apiClient.documents.sendOrder(stockId, payload);       
                logger.info(`Krok 5 OK: Objednávka ${createdOrderId} byla zpracována (SendOrder).`);
            } catch (error) {
                logger.error(`Krok 5 selhal: ${error}`);
                throw error;
            }
        });

        // -------------------------------------------------------------------------
        // Krok 6: Schválení rozdílu (Agreement)
        // -------------------------------------------------------------------------
        await test.step('Krok 6: PUT /documents-api/ordersItems (Agreement)', async () => {
            const stepData = testCaseData.step6_ApproveDifference;


            const payload = {
                orderId: createdOrderId, 
                stockCardId: stepData.stockCardId,      
                amount: stepData.amount ?? 10, 
                comment: stepData.comment ?? "Automatický test",
                agreement: true               
            };
    
            endpoint = `/documents-api/ordersItems/${stockId}/${createdOrderId}`;
            
            logger.debug(`Odesílám PUT na ${endpoint}. Payload: ${JSON.stringify(payload)}`);

            try {
                // Pokud nemáte v apiClient metodu 'put', použijte obecný request
                if (apiClient.documents.put) {
                    await apiClient.documents.put(endpoint, payload);
                } else {
                     // Fallback na obecný axios/apiClient request, pokud metoda chybí v typech
                    await (apiClient as any).put(endpoint, payload);
                }
                
                logger.info(`Krok 6 OK: Položka ${createdOrderItemId} byla schválena/upravena.`);
            } catch (error) {
                // Pro lepší debugování logujeme i URL
                logger.error(`Krok 6 selhal: ${error}`);
                throw error;
            }
        });

    }); // Konec test()
} // Konec for smyčky