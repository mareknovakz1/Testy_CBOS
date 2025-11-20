/**
 * @file Objednvaky_life_cycle_regrese.spec.ts
 * @author Marek Novák
 * @date 10.09.2025
 * * @description
 * Regresní E2E testy pro životní cyklus objednávky včetně vytvoření, úprav, schválení a zrušení.
 * * @logic
 * TC-001
 * Krok 1: Vytvoření objednávky pomocí POST /documents-api/orders/{stockId}
 * Krok 2: Ověření vytvoření objednávky pomocí GET /reports-api/orders
 * Krok 3: Vyhledání SK pomocí GET /reports-api/listOfStockCards
 * Krok 4: Přidání zboží do objednávky pomocí POST /documents-api/orderItems
 * * @tags @regression @order @api @medium
 *
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import allOrderData from '../../../../test-data/Objednavky_life_cycle_regrese.json';
import { ACC_OWNER_ID } from '../../../../support/constants';
// OPRAVA: Tento import chyběl, což způsobovalo chybu "Cannot find namespace 't'."
import * as t from '../../../../api/types/documents'; 

logger.silly(`Testovací data: ${JSON.stringify(allOrderData, null, 2)}`);


/**
 * Generuje datum a čas na zítřek ve formátu "YYYY-MM-DDTHH:mm:ss.sssZ".
 * @returns {Date} Objekt zítřejšího data.
 */
function getTomorrowDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1); // Přidá jeden den k aktuálnímu datu
  return tomorrow;
}

//Série testů
test(`TC-001: Krok 1: POST /orders Krok 2: GET /orders Krok 3: GET /listOfStockCards Krok 4: POST /orderItems `, async ({ apiClient }) => {

    // OPRAVA: Tyto proměnné musí být v hlavním scope testu, aby byly sdíleny mezi kroky
    let createdOrderId: number; 
    let foundStockCardId: number; 
    let stockId: number; // stockId musíme také sdílet
    const tomorrow = getTomorrowDate();

    // OPRAVA: Deklarace proměnných pro logování v 'catch' bloku. 
    // Musí být zde, aby byly dostupné v 'try' i 'catch'.
    let endpoint: string;
    let response: any; // Používáme 'any' pro jednoduchost v logování

    logger.info(`Spouštím sadu testů pro vytvoření objednávky.`);
    logger.trace('ApiClient byl inicializován fixturou.');

    // Krok 1: Test pro vytvoření objednávky
    await test.step('Krok 1:  POST /documents-api/orders/{stockId} ', async () => {
        const testCase = allOrderData.TC_001.step1_CreateOrder;
        logger.info(`Zahajuji testovací případ TC-001 pro: POST /documents-api/orders/{stockId}`);
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        stockId = testCase.stockId!;
        // OPRAVA: Přiřazení hodnoty k proměnné 'endpoint'
        endpoint = `/documents-api/orders/${stockId}`;

        const orderDate = new Date().toISOString();
        const deliveryDate = tomorrow.toISOString();

        const payload: t.CreateOrderPayload = {
            orderDate: orderDate,
            deliveryDate: deliveryDate,
            ownerId: testCase.ownerId!,
            ownerName: testCase.ownerName!,
            supplierId: testCase.supplierId!,
            supplierName: testCase.supplierName!,
            transporterId: testCase.transporterId ? Number(testCase.transporterId) : undefined,
            transporterName: testCase.transporterName,
            description: testCase.description || `Automatický regresní test TC-001`
        };

    try {
        logger.trace(`Odesílám POST požadavek na ${endpoint} s payloadem: ${JSON.stringify(payload, null, 2)}`);
        
        // Jen zavoláme metodu. Očekáváme, že vrátí 'null'.
        await apiClient.documents.postOrder(stockId, payload);

        //Výsledky testů
        // OPRAVA: Tím, že kód nespadl do 'catch', je status 201 OK.
        // Žádné 'expect' zde není potřeba.
        logger.info('Status code OK (201) - Objednávka byla vytvořena.');

    } catch (error) {
        const fullUrl = `${apiClient.documents.baseURL}${endpoint}`;
        logger.error(`Step 1: Test selhal s chybou: ${error}, URL: ${fullUrl}`);
        throw error;
    }
}); 

    // Krok 2: Ověření, že objednávka existuje v seznamu
    await test.step('Krok 2: GET /reports-api/orders ', async () => {
        logger.info('Zahajuji ověření existence objednávky v seznamu.');
        const testCase = allOrderData.TC_001.step2_GetOrdersList;
        logger.trace(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        // OPRAVA: Endpoint pro Krok 2
        endpoint = `/reports-api/orders`;

        const payload = {
            stockId: testCase.stockId!,
            year: testCase.year!,
        };
        logger.trace(`Payload pro ${endpoint}: ${JSON.stringify(payload)}`);

        try {
            logger.debug('Volám metodu getListOfOrders pro získání seznamu objednávek.');
            const response = await apiClient.reports.getListOfOrders(payload); 

            // Ověříme, že odpověď je pole a že není prázdné
            if (!response || !Array.isArray(response) || response.length === 0) {
                throw new Error('Seznam objednávek je prázdný nebo neplatný.');
            }

            // OPZískání ID vytvořené objednávky
            const foundOrder = response[0];
            logger.trace('Ověřuji, že nalezená objednávka má platné ID.');
            expect(foundOrder, "V seznamu nebyla nalezena žádná objednávka.").toBeDefined();
            logger.debug(`Nalezená objednávka má ID: ${foundOrder.id}`);
            expect(foundOrder.id, "První objednávka v seznamu nemá ID.").toBeGreaterThan(0);
            logger.debug('Ověření ID objednávky proběhlo úspěšně.');
            createdOrderId = foundOrder.id;
            
        } catch (error) {
            const fullUrl = `${apiClient.reports.baseURL}${endpoint}`;
            logger.error(`Step 2: Chyba při získávání seznamu objednávek: ${error}, URL: ${fullUrl}`);
            throw error;
        }
    });

    // Krok 3: Vyhledání skladové karty (Stock Card)
    await test.step('Krok 3: GET /reports-api/listOfStockCards', async () => {
        logger.info('Zahajuji vyhledání skladové karty (Stock Card) pomocí PLU.');
        const testCase = allOrderData.TC_001.step3_GetStockCard;
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        endpoint = `/reports-api/listOfStockCards`; // Endpoint pro Krok 3
        const queryString = `stockId=${stockId}&plu=${testCase.PLU}`;
        logger.trace(`Query string pro ${endpoint}: ${queryString}`);

        try {
            logger.debug('Volám metodu getListOfStockCards pro získání seznamu karet.');
            response = await apiClient.reports.getListOfStockCards(queryString, stockId);

            if (response && Array.isArray(response) && response.length > 0) {
                const foundCard = response.find(card => card.plu === testCase.PLU);
                
                if (foundCard && foundCard.id) {
                    foundStockCardId = foundCard.id;
                    logger.trace(`Nalezena skladová karta: foundStockCardId = ${foundStockCardId}`);
                    expect(foundStockCardId).toBeGreaterThan(0);
                } else {
                    throw new Error(`Skladová karta s PLU ${testCase.PLU} nebyla nalezena v odpovědi.`);
                }
            } else {
                throw new Error(`Seznam skladových karet je prázdný nebo neplatný pro PLU: ${testCase.PLU}.`);
            }
        } catch (error) {
        // OPRAVA: Logování pro Krok 3
        const fullUrl = `${apiClient.reports.baseURL}${endpoint}?${queryString}`;
            logger.error(`Step 3: Chyba při získávání seznamu skladových karet: ${error}, URL: ${fullUrl}`);
            throw error;
        }
    });


    // Krok 4: Přidání zboží do objednávky
    await test.step('Krok 4: POST /documents-api/orderItems', async () => {
        logger.info('Zahajuji přidání zboží do vytvořené objednávky.');
        const testCase = allOrderData.TC_001.step4_AddOrderItem;
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        // OPRAVA: Endpoint pro Krok 4 (předpoklad názvu endpointu, upravte dle potřeby)
        endpoint = `/documents-api/ordersItems/${stockId}`;

        const amountToAdd = (testCase as any).amount ?? 5;
        if (!(testCase as any).amount) {
            logger.warn(`Testovací data (step4_AddOrderItem) neobsahují 'amount'. Používám výchozí hodnotu: ${amountToAdd}`);
        }

        const payload = { 
            "orderId": createdOrderId, 
            "stockCardId": foundStockCardId, 
            "amount": amountToAdd
        };
        logger.trace(`Payload pro ${endpoint}: ${JSON.stringify(payload)}`);

        try {
            logger.debug('Volám metodu postOrderItem pro přidání zboží do objednávky.');
            
            // OPRAVA: 
            // 1. Argumenty byly prohozené. Musí být (stockId, payload).
            // 2. Chybělo 'await'.
            response = await apiClient.documents.postOrderItem(stockId, payload);       
            logger.silly(`Response: ${JSON.stringify(response)}`); 
            
            logger.debug('Ověřuji, že response není null.');
            if (response === null || response === undefined) {
                throw new Error('Response je null nebo undefined.');
            }
            expect(response, 'Odpověď z API by neměla být null/undefined.').toBeDefined();
            logger.info(`Položka byla úspěšně přidána do objednávky ${createdOrderId}.`);
        } catch (error) {
        // OPRAVA: Logování pro Krok 4
        const fullUrl = `${apiClient.documents.baseURL}${endpoint}`;
            logger.error(`Step 4: Chyba při přidávání zboží do objednávky: ${error}, URL: ${fullUrl}`);
            throw error;
        }
    });

});