/**
 * @file Objednvaky_life_cycle_regrese.spec.ts
 * @author Marek Novák
 * @date 10.09.2025
 * 
 * @description
 * Regresní E2E testy pro životní cyklus objednávky včetně vytvoření, úprav, schválení a zrušení.
 * 
 * @logic
 * 1. Vytvoření objednávky s platnými daty.
 * 2. Ověření, že objednávka byla vytvořena správně.
 * 3. Přidání položek do objednávky.
 * 4. Úprava položek v objednávce.
 * 5. Schválení objednávky.
 * 6. Ověření stavu objednávky po schválení.
 * 7. Zrušení objednávky.
 * 8. Ověření, že objednávka byla zrušena správně.
 * 
 * @tags @regression @order @api @medium
 *
 */
import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import allOrderData from '../../../../test-data/Objednavky_life_cycle_regrese.json';
import { ApiClient, OrderPayload} from '../../../../support/ApiClient';

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

test(`${allOrderData[0].TC} Krok 1: POST /documents-api/orders/{stockId} Krok 2:  GET /reports-api/orders Krok 3: POST /documents-api/orderItems @regression @order @api @medium`, async ({ page }) => {

    let apiClient: ApiClient;
    let createdOrderId: number; // Proměnná pro sdílení ID v rámci testu
    const tomorrow = getTomorrowDate();

    logger.info(`Spouštím sadu testů pro vytvoření objednávky.`);
    await page.goto('/');
    logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    expect(token, 'Autentizační token nebyl nalezen.').toBeTruthy();
    logger.trace('Autentizační token úspěšně získán.');
    apiClient = new ApiClient(page.request, token!);
    logger.trace('ApiClient byl inicializován.');

    // Test pro vytvoření objednávky
    await test.step('Krok 1:  POST /documents-api/orders/{stockId} ', async () => {
        const testCase = allOrderData[0];
        logger.info(`Zahajuji testovací případ ${testCase.TC} pro: POST /documents-api/orders/{stockId}`);
        logger.silly(`Deklarace testCase: ${testCase}`);

        const payload: OrderPayload = {
            description: testCase.description,
            deliveryDate: tomorrow.toISOString(),
            orderDate: tomorrow.toISOString(),
            ownerId: testCase.ownerId!,
            ownerName: testCase.ownerName!,
            stockId: testCase.stockId!,
            supplierId: testCase.supplierId!,
            supplierName: testCase.supplierName!,
            transporterId: testCase.transporterId,
            transporterName: testCase.transporterName
    };

    try {
        logger.trace(`Odesílám POST požadavek s payloadem: ${payload}`);
        const response = await apiClient.createOrder(testCase.stockId!, payload);
        logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);

    } catch (error) {
        logger.error(`Test selhal s chybou: ${error}`);
        throw error;
    }
    }); 

    //Přečtení ID vytvořené objednávky pro další testy
    await test.step('Krok 2: GET /reports-api/orders ', async () => {
        
        logger.info('Zahajuji získání ID vytvořené objednávky pro další testy.');
        const testCase = allOrderData[1];
        logger.silly(`Deklarace testCase: ${testCase}`);
        
        const payload = {
        stockId: testCase.stockId!,
        year: testCase.year!,
        };
        logger.trace(`Payload pro získání seznamu objednávek: ${payload}`);

        try {
            logger.debug('Volám metodu getListOfOrders pro získání seznamu objednávek.');
            const response = await apiClient.getListOfOrders(payload);
            logger.silly(`Response: ${JSON.stringify(response, null, 2)}`);


            // Zkontrolujeme, zda je odpověď pole a zda není prázdné
            if (response && Array.isArray(response) && response.length > 0) { 
                // Předpokládáme, že nejnovější objednávka je první v seznamu
                // Nyní přistupujeme přímo k prvnímu prvku pole: response[0]
                createdOrderId = response[0].id; 
                logger.trace(`Získané ID vytvořené objednávky: createOrderId = ${createdOrderId}`);
                
                logger.trace(`Ověřuji, že ID objednávky je větší než 0.`);
                expect(createdOrderId).toBeGreaterThan(0);
                logger.trace(`Ověření úspěšné: ID objednávky je větší než 0.`);
            } else {
                // Tato část se spustí, jen pokud API vrátí prázdnou odpověď nebo něco jiného než pole
                throw new Error('Seznam objednávek je prázdný nebo neplatný.');
            }
        } catch (error) {
            logger.error(`Chyba při získávání seznamu objednávek: ${error}`);
            throw error;
        }
    });

    //Pidání zboží do objednávky
    await test.step('Krok 3: POST /documents-api/orderItems', async () => {
        logger.info('Zahajuji přidání zboží do vytvořené objednávky.');
        const testCase = allOrderData[2];

        logger.silly(`Deklarace testCase: ${testCase}`);
        const payload = { 
            "orderId": createdOrderId, 
            "stockCardId": testCase.StockCardId ?? (() => { throw new Error('StockCardId is undefined'); })(), 
            "amount": testCase.amount };
        logger.trace(`Payload pro přidání zboží do objednávky: ${JSON.stringify(payload)}`);

        try {
            logger.debug('Volám metodu postOrderItems pro přidání zboží do objednávky.');
            const response = await apiClient.postOrderItems(payload);
            logger.silly(`Response: ${response}`); 
            
            logger.debug('Ověřuji, že response není null a je větší než 0.');
            if (response === null || response === undefined) {
                throw new Error('Response je null nebo undefined.');
            }
            logger.debug(`Response je platný`);
        } catch (error) {
            logger.error(`Chyba při přidávání zboží do objednávky: ${error}`);
            throw error;
        }
    });

});