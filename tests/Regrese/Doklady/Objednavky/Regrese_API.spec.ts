/**
 * Regresní test API pro Objednávky
*/

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../../support/ApiClient';
import { ReportBuilder } from '../../../../support/ReportBuilder';
import { logger } from '../../../../support/logger';
import { baseURL } from '@playwright/config';


test.beforeEach(async ({ page }) => {
    logger.info('Spouštím Test: Regrese API Objednavky Medium');
    logger.debug('Přihlašuji se a získávám token...');
    await page.goto('/');
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    expect(token, "Autentizační token musí být přítomen").toBeTruthy();
}); 

test('TC-XY -01: Vytvoření a ověření objednávky přes API @regression @api @objednavky @medium', async ({ page }) => {
    logger.info('Test TC- XY - 01: Vytvoření a ověření objednávky přes API');
    const apiClient = new ApiClient(page.request, token!);
    let newOrderId: number | string | undefined;
    try{
        logger.debug('Vytvářím novou objednávku přes API...');
        logger.trace('Připravuji payload pro vytvoření objednávky...');
        const orderPayload = {
            "commentary": "Testovací objednávka vytvořená přes API",
            "created": new Date().toISOString(), // Aktuální datum a čas
            "day": null,
            "DeliveryDate": new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), //Dodání za 7 dní
            "description": "Objednávka API Test",
            "documenttID": null,
            "doceumentLabel": "2025-000049",
            "email": "marek.novak@octo-technology.cz", //odešle objednávku na email
            "goodDeliveryNoteDocumentLabel": null,
            "id": null,
        }
        logger.silly(`Payload pro: GET ${baseURL}/document ${JSON.stringify(orderPayload)}`);
        getOrderDetail()
    }
    catch (error) {
        logger.error('Chyba během testu TC- XY - 01:', error);
        throw error; // Znovu vyhodit chybu, aby test selhal
    }