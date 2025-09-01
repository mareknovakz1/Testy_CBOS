import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger'; // Předpokládaný import
import { ApiClient } from '../../../../support/ApiClient'; // Předpokládaný import
import { baseURL } from '../../../../support/constants'; // Předpokládaný import
import * as testData from '../../../../test-data/orderData.json';

const allOrderTestCases = testData.testCases;

test.describe('API testy objednávky', () => {

    
    for (const testCase of allOrderTestCases) {
        test(`${testCase.testCaseId}: ${testCase.description} @regression @api @objednavky @medium`, async ({ page }) => {
            logger.info(`Test ${testCase.testCaseId}: ${testCase.description}`);
      
        try {
             /**
             * Blok s autenitizací 
             */
            await page.goto('/');
            const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
            expect(token).toBeTruthy();
            const apiClient = new ApiClient(page.request, token!);
            logger.debug('Autenitizace úspěšně dokončena.')
               
            logger.debug('Dynamické vytváření deliveryDate a orderDate')
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + testCase.daysToDelivery);
            logger.trace(`deliveryDate: ${deliveryDate}`)

            logger.trace('Deklarace a definice orderPayload.')
            const orderPayload = {
            ...testCase.PostPayload, // Rozšíření statického payloadu z JSON
                "deliveryDate": deliveryDate.toISOString(),
                "orderDate": new Date().toISOString() // Aktuální datum a čas
                };
            
            logger.debug(`Odesíláme: ${baseURL}//documents-api/orders/${testCase.stockId}`)
            const response = await apiClient.createOrder(testCase.stockId, orderPayload);
     
            logger.trace(`Dostáváme response pro ${baseURL}//documents-api/orders/${testCase.stockId}`)
            logger.silly(`Response pro: ${baseURL}//documents-api/orders/${testCase.stockId}: ${response}`)

            // Ověření, že odpověď má očekávaný status kód (např. 201 Created)
            expect(response.status()).toBe(201);
            logger.info(`Objednávka pro test ${testCase.testCaseId} úspěšně vytvořena s HTTP kódem 201.`);

            // Možné ověření, že tělo odpovědi není prázdné
            const responseBody = await response.json();
            expect(responseBody).not.toBeNull();
            // Ověření dalších dat
            expect(responseBody.id).toBeDefined();

            } catch (error) {
                logger.error(`Chyba během testu ${testCase.testCaseId}:`, error);
                throw error;
           }
        });
    }
});