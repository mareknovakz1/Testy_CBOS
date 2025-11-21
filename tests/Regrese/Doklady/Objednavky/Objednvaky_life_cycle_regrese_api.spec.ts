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
    PLU?: number;
    stockCardId?: number;
    amount?: number;
    // Zde definujeme, že v JSONu může být objekt parametrů pro filtraci
    params?: t.GetListOfStockCardsParams; 
};

type OrderTestCase = {
    step1_CreateOrder: OrderStepData;
    step2_GetOrdersList: OrderStepData;
    step3_GetStockCard: OrderStepData;
    step4_AddOrderItem: OrderStepData;
};

logger.info('Spouštím regresní testy pro životní cyklus objednávek pomocí API.');

for (const testCaseKey of Object.keys(allOrderData)) {

    logger.debug(`Načítám testovací data pro případ: ${testCaseKey}`);
    const testCaseData = allOrderData[testCaseKey as keyof typeof allOrderData] as OrderTestCase;
    const tags = testCaseData.step1_CreateOrder?.tags;
    
    const tagsString = (tags && tags.length > 0) ? ` ${tags.join(' ')}` : '';
    const testTitle = `${testCaseKey}: Life Cycle Objednávky${tagsString}`;

    test(testTitle, async ({ apiClient }) => {

        let createdOrderId: number; 
        let foundStockCardId: number; 
        let stockId: number; 
        const tomorrow = getTomorrowDate();
        const uniqueOrderDescription = `AutoTest_${testCaseKey}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        let endpoint: string;
        let response: any;

        logger.info(`Spouštím test: ${testCaseKey} | Unikátní ID: ${uniqueOrderDescription}`);

        // Krok 1: Vytvoření objednávky
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

        // Krok 2: Ověření existence objednávky
        await test.step('Krok 2: GET /reports-api/orders', async () => {
            const stepData = testCaseData.step2_GetOrdersList;
            const payload = { stockId: stepData.stockId!, year: stepData.year! };
            
            response = await apiClient.reports.getListOfOrders(payload); 
            const foundOrder = response.find((order: any) => order.description === uniqueOrderDescription);
            
            expect(foundOrder, `Objednávka nenalezena.`).toBeDefined();
            createdOrderId = foundOrder.id;
            logger.info(`Krok 2 OK: Objednávka nalezena pod ID ${createdOrderId}.`);
        });

        // -------------------------------------------------------------------------
        // Krok 3: Vyhledání skladové karty (Čteno z JSON params)
        // -------------------------------------------------------------------------
        await test.step('Krok 3: GET /reports-api/listOfStockCards', async () => {
            const stepData = testCaseData.step3_GetStockCard;
            endpoint = `/reports-api/listOfStockCards`; 
            
            // 2. ZMĚNA: Načítáme kompletní parametry přímo z JSONu
            // Pokud by v JSONu params chyběly, vyhodíme chybu.
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
                    // Porovnáváme s PLU, které je v "search" parametru
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

        // Krok 4: Přidání zboží
        await test.step('Krok 4: POST /documents-api/orderItems', async () => {
            const stepData = testCaseData.step4_AddOrderItem;
            const payload = { 
                "orderId": createdOrderId, 
                "stockCardId": foundStockCardId, 
                "amount": stepData.amount ?? 5
            };

            await apiClient.documents.postOrderItem(stockId, payload);       
            logger.info(`Krok 4 OK: Položka přidána do objednávky.`);
        });

    });
}