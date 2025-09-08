/**
 * @file Cerpadlove_listy_regrese_filtry_API.spec.ts
 * @author Marek Novák
 * @date 05.09.2025
 *
 * @description
 * API testy pro endpoint GET /reports-api/listOfWetDeliveryNotes
 * Tyto testy ověřují správnou funkčnost filtrování.
 *
 * @logic
 * Každý test se zaměřuje na jeden konkrétní filtr a ověřuje, zda response obsahuje pouze správně
 * filtrovaná data.
 *
 * @preconditions
 * - Platný autentizační token.
 *
 * @tags @regression @CDL @API @medium @search
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { ApiClient, listOfDriversPayload } from '../../../../support/ApiClient';
import { logger } from '../../../../support/logger';
import allFilterCasesData from '../../../../test-data/Cerpadlove_listy_regrese_filtry_API.json';
import { ACC_OWNER_ID } from '../../../../support/constants';

type VerificationCase = Record<string, string | number | boolean>;

logger.silly(`Test data: ${JSON.stringify(allFilterCasesData, null, 2)}`);

test.describe('Testy filtrů listOfDrivers', () => {

    let apiClient: ApiClient;

    test.beforeEach(async ({ page }) => {
        logger.info(`Spouštím sadu testů pro filtry seznamu řidičů.`);
        await page.goto('/');
        logger.trace('Naviguji na domovskou stránku pro získání tokenu.');
        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Autentizační token nebyl nalezen.').toBeTruthy();
        logger.trace('Autentizační token úspěšně získán.');
        apiClient = new ApiClient(page.request, token!);
        logger.trace('ApiClient byl inicializován.');
    });

    function isVerificationCase(obj: any): obj is VerificationCase {
        return obj !== null && typeof obj === 'object';
    }

    allFilterCasesData.forEach(testCase => {
    const { TC, name, filterParams } = testCase;

    test(`${TC} Test filtru: ${name} @regression @CDL @API @medium @search`, async () => {
        logger.info(`Spouštím test pro: ${name}`);

        const payload = {
            accOwner: ACC_OWNER_ID,
            ...filterParams
        };

        logger.debug(`Připravuji API volání s payloadem: ${JSON.stringify(payload)}`);
        logger.trace(`Volání API s payloadem: ${JSON.stringify(payload)}`);
        
        const response = await apiClient.getListOfWetDeliveryNotes(payload);
            
            logger.silly(`API Response pro test "${name}": ${JSON.stringify(response, null, 2)}`);

            if (!Array.isArray(response)) {
                logger.error(`Odpověď z API není polem, místo toho je: ${typeof response}`);
            }
            expect(Array.isArray(response), 'Odpověď není polem.').toBeTruthy();

            if (response.length === 0) {
                logger.warn(`Odpověď je prázdná, ačkoli se očekávala data.`);
            }
            expect(response.length, 'Odpověď je prázdná, ačkoli se očekávala data.').toBeGreaterThan(0);

            logger.trace(`Zahajuji ověření vrácených dat pro test "${name}".`);
               response.forEach((item: any) => {
                //ověření pro year
                if (payload.year) {
                    const yearInItem = new Date(item.deliveryDate).getFullYear();
                    logger.trace(`Ověřuji rok: Očekávaná hodnota: ${payload.year}, Nalezená hodnota: ${yearInItem}`);
                    expect(yearInItem).toBe(payload.year);
                }

                // Ověření pro "month"
                if (payload.month) {
                    const monthInItem = new Date(item.deliveryDate).getMonth(); 
                    logger.trace(`Ověřuji měsíc: Očekávaná hodnota: ${payload.month}, Nalezená hodnota: ${monthInItem}`); 
                    expect(monthInItem + 1).toBe(payload.month);//Leden se bere jako 0, proto se přidávám +1
                }

                 // Ověření pro 'operator'
                if (payload.operator) {
                    logger.trace(`Ověřuji operátora: očekávaná hodnota: ${payload.operator}, Nalezená hodnota: ${item.operator}`);
                     expect(item.operator).toBe(payload.operator);
                }

                 // Ověření pro 'documetType'
                if (payload.documentType) {
                    logger.trace(`Ověřuji druh dokladu: očekávaná hodnota: ${payload.documentType}, Nalezená hodnota: ${item.documetType}`);
                     expect(item.documentType).toBe(payload.documentType);
                }

                  // Ověření pro 'tankID'
                if (payload.tankId) {
                    logger.trace(`Ověřuji Nádrž (aktuální produkt): očekávaná hodnota: ${payload.tankId}, Nalezená hodnota: ${item.tankId}`);
                     expect(item.tankId).toBe(payload.tankId);
                }
            });

            logger.info(`Test pro ${name} proběhl úspěšně. Všechny záznamy odpovídají filtru.`);
        });
    });
});