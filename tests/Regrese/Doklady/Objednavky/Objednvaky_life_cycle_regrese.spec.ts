/**
 * @file Objednvaky_life_cycle_regrese.spec.ts
 * @author Marek Novák
 * @date 10.09.2025
 * 
 * @description
 * Regresní E2E testy pro životní cyklus objednávky včetně vytvoření, úprav, schválení a zrušení.
 * 
 * @logic
 * 
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

test.describe('Smoke testy - vytvoření a ověření objednávky', () => {
    let apiClient: ApiClient;
    let createdOrderId: number; // Proměnná pro sdílení ID v rámci `describe` bloku
    const tomorrow = getTomorrowDate();

    test.beforeEach(async ({ page }) => {
        logger.info(`Spouštím sadu testů pro vytvoření objednávky.`);
        await page.goto('/');
        logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Autentizační token nebyl nalezen.').toBeTruthy();
        logger.trace('Autentizační token úspěšně získán.');
        apiClient = new ApiClient(page.request, token!);
        logger.trace('ApiClient byl inicializován.');

    });
    // Test pro vytvoření objednávky
    test(`${allOrderData[0].TC} Test POST /documents-api/orders/{stockId} @regression @order @api @high`, async () => {
        logger.info(`Zahajuji testovací případ ${testCase.TC} pro: POST /documents-api/orders/{stockId}`);
        const testCase = allOrderData[0];
        logger.silly(`Deklarace testCase: ${testCase}`);

        const payload: OrderPayload = {
        deliveryDate: tomorrow.toISOString(),
        orderDate: tomorrow.toISOString(),
        ownerId: testCase.ownerId,
        ownerName: testCase.ownerName,
        stockId: testCase.stockId,
        supplierId: testCase.supplierId,
        supplierName: testCase.supplierName,
        description: testCase.description,
    };

    try {
        logger.trace(`Odesílám POST požadavek s payloadem: ${payload}`);
        const response = await apiClient.createOrder(testCase.stockId, payload);
        logger.silly(`Přijata odpověď: ${JSON.stringify(response, null, 2)}`);

    } catch (error) {
        logger.error(`Test selhal s chybou: ${error}`);
        throw error;
    }

    //Přečtení ID vytvořené objednávky pro další testy
    test(`Získání ID vytvořené objednávky pro další testy`, async () => {
        
        logger.info('Zahajuji získání ID vytvořené objednávky pro další testy.');
        const testCase = allOrderData[0];
        logger.silly(`Deklarace testCase: ${testCase}`);
        
        const payload = {
        stockId: testCase.stockId,
        supplierId: testCase.supplierId,
        ownerId: testCase.ownerId,
        description: testCase.description,
        };
        logger.trace(`Payload pro získání seznamu objednávek: ${payload}`);

        try {
            logger.debug('Volám metodu getListOrders pro získání seznamu objednávek.');
            const response = await apiClient.getListOrders(payload);
            logger.silly(`Response: ${response}`);


            if (response && response.data && response.data.length > 0) { //kontrola, zda je seznam objednávek neprázdný
                // Předpokládáme, že nejnovější objednávka je první v seznamu
                createdOrderId = response.data[0].id; // Uložení ID do sdílené proměnné
                logger.trace(`Získané ID vytvořené objednávky: createOrderId = ${createdOrderId}`);
                expect(createdOrderId).toBeGreaterThan(0);
            } else {
                throw new Error('Seznam objednávek je prázdný nebo neplatný.');
            }

        } catch (error) {
            logger.error(`Chyba při získávání seznamu objednávek: ${error}`);
            throw error;
        }
    });

    //Pidání zboží do objednávky
    test(`Přidání zboží do vytvořené objednávky`, async () => {
        logger.info('Zahajuji přidání zboží do vytvořené objednávky.');
        const testCase = allOrderData[0];

        logger.silly(`Deklarace testCase: ${testCase}`);
        const payload = { "order"

        };
});