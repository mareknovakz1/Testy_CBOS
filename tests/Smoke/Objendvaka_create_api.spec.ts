/**
 * @file Objendvaka_create_api.spec.ts
 * @author Marek Novák
 * @date 10.09.2025
 * 
 * @description
 * Smoke API test pro vytvoření objednávky přes endpoint POST /documents-api/orders/{stockId}.
 * Test ověřuje, že objednávka může být úspěšně vytvořena s platnými daty.
 * Test je navržen jako rychlý kontrolní bod (smoke test) pro základní funkčnost API.
 * 
 * @logic
 * 1. Načte testovací data z externího JSON souboru.
 * 2. Přihlásí se do aplikace a získá autentizační token.
 * 3. Inicializuje ApiClient s tokenem.
 * 4. Sestaví payload pro vytvoření objednávky s datem nastaveným na zítřek.
 * 5. Odešle POST požadavek na vytvoření objednávky.
 * 
 * @precontitions
 * - Platný autentizační token získaný přihlášením.
 * - Testovací data v `Objednvaka_create_api.json` musí být validní.
 * 
 * @tags @smoke @API @order @high
 */

import { test, expect } from '../../support/fixtures/auth.fixture';
import { ApiClient, OrderPayload} from '../../support/ApiClient.legacy';
import { logger } from '../../support/logger';
import allOrderData from '../../test-data/Objednvaka_create_api.json';

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
  test(`${allOrderData[0].TC} Test POST /documents-api/orders/{stockId} @regression @order @api @high @smoke`, async () => {
    const testCase = allOrderData[0];
    logger.info(`Zahajuji testovací případ ${testCase.TC} pro: POST /documents-api/orders/{stockId}`);
    
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
  });
});