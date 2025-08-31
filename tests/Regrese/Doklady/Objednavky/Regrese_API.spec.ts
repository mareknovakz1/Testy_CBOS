import { test, expect } from '@playwright/test';
import { logger } from '../../../../support/logger'; // Předpokládaný import
import { ApiClient } from '../../../../support/ApiClient'; // Předpokládaný import
import { baseURL } from '../../../../support/constants'; // Předpokládaný import

// Tyto proměnné je nutné definovat v příslušném rozsahu (scope)
let token: string | null; 
const stock: number = 230;

// Zde je oprava - přidána chybějící otevírací složená závorka '{'
test.describe('API testy objednávky', () => {

    // Je vhodné přidat i beforeEach pro získání tokenu, pokud již neexistuje jinde
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token).toBeTruthy();
    });                                 

    test('TC-XY -01: Vytvoření a ověření objednávky přes API @regression @API @objednavky @medium', async ({ page }) => {
        logger.info('Test TC- XY - 01: Vytvoření a ověření objednávky přes API');
        const apiClient = new ApiClient(page.request, token!);
        
        try {
            logger.debug('Vytvářím novou objednávku přes API...');
            logger.trace('Připravuji payload pro vytvoření objednávky...');
            const orderPayload = {
                "DeliveryDate": new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), //Dodání za 7 dní
                "description": "Objednávka API Test",
                "orderDate": new Date().toISOString(), // Aktuální datum a čas
                "ownerId": "1",
                "ownerName": "ČEPRO, a.s.", //Vlastník sítě
                "suplierId": "8", //Banner Baterie ČR spol.s r.o.
                "SupplierName": "Banner Baterie ČR spol.s r.o.", //Dodvatel
                "transporterId": "434",
                "transporterName": "AutoMax Group s.r.o", //Přepravce
            };
            logger.silly(`Payload pro: GET ${baseURL}/document ${JSON.stringify(orderPayload)}`);
            await apiClient.createOrder(stock, orderPayload);
        } catch (error) {
            logger.error('Chyba během testu TC- XY - 01:', error);
            throw error; // Znovu vyhodit chybu, aby test selhal
        }
    });
});
// Zde je oprava - odstraněn chybně vložený JSON blok s chybovou hláškou