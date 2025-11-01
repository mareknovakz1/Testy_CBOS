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

// OPRAVA: Importujeme 'apiClient' přímo z naší auth fixtury
import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import allOrderData from '../../../../test-data/Objednavky_life_cycle_regrese.json';
// OPRAVA: Zde předpokládáme, že ApiClient je exportován, jak má 
import * as t from '../../../../api/types/documents'; 
import { ACC_OWNER_ID } from '../../../../support/constants';

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
test(`TC-001: Krok 1: POST /orders Krok 2: GET /orders Krok 3: GET /listOfStockCards Krok 4: POST /orderItems @regression @order @api @medium`, async ({ apiClient }) => {

    // OPRAVA: Tyto proměnné musí být v hlavním scope testu, aby byly sdíleny mezi kroky
    let createdOrderId: number; 
    let foundStockCardId: number; 
    let stockId: number; // stockId musíme také sdílet
    const tomorrow = getTomorrowDate();

    logger.info(`Spouštím sadu testů pro vytvoření objednávky.`);
    logger.trace('ApiClient byl inicializován fixturou.');

    // Krok 1: Test pro vytvoření objednávky
    await test.step('Krok 1:  POST /documents-api/orders/{stockId} ', async () => {
        // OPRAVA: Přístup k datům opraven z allOrderData[0] na správnou strukturu objektu
        const testCase = allOrderData.TC_001.step1_CreateOrder;
        logger.info(`Zahajuji testovací případ TC-001 pro: POST /documents-api/orders/{stockId}`);
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);

        // OPRAVA: Uložíme stockId pro použití v dalších krocích
        stockId = testCase.stockId!;

        // Formátování dat pro payload
        const orderDate = new Date().toISOString(); // Dnešní datum a čas
        const deliveryDate = tomorrow.toISOString();

        //Payload pro vytvoření objednávky
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
        logger.trace(`Odesílám POST požadavek s payloadem: ${JSON.stringify(payload, null, 2)}`);
        const response = await apiClient.documents.postOrder(stockId, payload);
        logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);

        //Výsledky testů
        logger.debug('Vyhodnocení testu TC-001 step 1')
        expect(response, 'Odpověď z API by neměla být null/undefined.').toBeDefined();
        expect(typeof response.id, 'ID objednávky by mělo být číslo.').toBe('number');
        expect(response.id, 'ID objednávky by mělo být větší než 0.').toBeGreaterThan(0);
        
        // OPRAVA (Kritická): Uložíme ID vytvořené objednávky pro další kroky
        createdOrderId = response.id;
        logger.info(`Objednávka úspěšně vytvořena s ID: ${createdOrderId}`);

    } catch (error) {
        logger.error(`Test selhal s chybou: ${error}`);
        throw error;
    }
    }); 

    // Krok 2: Ověření, že objednávka existuje v seznamu
    await test.step('Krok 2: GET /reports-api/orders ', async () => {
        
        logger.info('Zahajuji ověření existence objednávky v seznamu.');
        // OPRAVA: Přístup k datům pro Krok 2
        const testCase = allOrderData.TC_001.step2_GetOrdersList;
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        const payload = {
            stockId: testCase.stockId!,
            year: testCase.year!,
        };
        logger.trace(`Payload pro získání seznamu objednávek: ${JSON.stringify(payload)}`);

        try {
            logger.debug('Volám metodu getListOfOrders pro získání seznamu objednávek.');
            const response = await apiClient.reports.getListOfOrders(payload); 
            // logger.silly(`Response: ${JSON.stringify(response, null, 2)}`); // Může být příliš ukecané

            if (!response || !Array.isArray(response)) {
                throw new Error('Seznam objednávek je prázdný nebo neplatný.');
            }

            // OPRAVA (Logika): Ověříme, že naše objednávka je v seznamu.
            // Původní kód jen bral response[0].id, což je nestabilní.
            const foundOrder = response.find(order => order.id === createdOrderId);
            
            expect(foundOrder, `Vytvořená objednávka s ID ${createdOrderId} nebyla nalezena v seznamu.`).toBeDefined();
            logger.info(`Objednávka ${createdOrderId} byla úspěšně nalezena v seznamu.`);
            
        } catch (error) {
            logger.error(`Chyba při získávání seznamu objednávek: ${error}`);
            throw error;
        }
    });

    // Krok 3: Vyhledání skladové karty (Stock Card)
    await test.step('Krok 3: GET /reports-api/listOfStockCards', async () => {
        logger.info('Zahajuji vyhledání skladové karty (Stock Card) pomocí PLU.');
        // OPRAVA: Přístup k datům pro Krok 3
        const testCase = allOrderData.TC_001.step3_GetStockCard;
        // OPRAVA: stockId bereme z proměnné uložené v Kroku 1
        
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);
        
        const queryString = `stockId=${stockId}&plu=${testCase.PLU}`;
        logger.trace(`Payload (query string) pro získání seznamu skladových karet: ${queryString}`);

        try {
            logger.debug('Volám metodu getListOfStockCards pro získání seznamu karet.');
            
            // OPRAVA: Používáme proměnnou 'stockId'
            const response = await apiClient.reports.getListOfStockCards(queryString, stockId, ACC_OWNER_ID);
            // logger.silly(`Response: ${JSON.stringify(response, null, 2)}`);

            if (response && Array.isArray(response) && response.length > 0) {
                const foundCard = response.find(card => card.plu === testCase.PLU);
                
                if (foundCard && foundCard.id) {
                    // OPRAVA: Uložíme ID karty pro Krok 4
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
            logger.error(`Chyba při získávání seznamu skladových karet: ${error}`);
            throw error;
        }
    });


    // Krok 4: Přidání zboží do objednávky
    await test.step('Krok 4: POST /documents-api/orderItems', async () => {
        logger.info('Zahajuji přidání zboží do vytvořené objednávky.');
        const testCase = allOrderData.TC_001.step4_AddOrderItem;
        logger.silly(`Deklarace testCase: ${JSON.stringify(testCase, null, 2)}`);

        // Tento kód je v pořádku, pokud je 'amount' volitelný
        const amountToAdd = (testCase as any).amount ?? 5;
        if (!(testCase as any).amount) {
            logger.warn(`Testovací data (step4_AddOrderItem) neobsahují 'amount'. Používám výchozí hodnotu: ${amountToAdd}`);
        }

        const payload = { 
            "orderId": createdOrderId, // Použijeme ID z Kroku 1
            "stockCardId": foundStockCardId, // Použijeme ID z Kroku 3
            "amount": amountToAdd
        };
        logger.trace(`Payload pro přidání zboží do objednávky: ${JSON.stringify(payload)}`);

        try {
            logger.debug('Volám metodu postOrderItems pro přidání zboží do objednávky.');
            const response = apiClient.documents.postOrderItem(payload, stockId, ACC_OWNER_ID);       
            logger.silly(`Response: ${JSON.stringify(response)}`); 
            
            logger.debug('Ověřuji, že response není null.');
            if (response === null || response === undefined) {
                throw new Error('Response je null nebo undefined.');
            }
            expect(response, 'Odpověď z API by neměla být null/undefined.').toBeDefined();
            logger.info(`Položka byla úspěšně přidána do objednávky ${createdOrderId}.`);
        } catch (error) {
            logger.error(`Chyba při přidávání zboží do objednávky: ${error}`);
            throw error;
        }
    });

});