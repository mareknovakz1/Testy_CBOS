import { expect, test } from '../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../support/ApiClient';
import { logger } from '../../../support/logger';

/**
 * Testy pro API klienta, který komunikuje s backendem pro získání filtrů účtenek.
 * UPOZORNĚNÍ: GETs nejsou filtrované a stahují data pro celou databázi.
 * ZAdávané filtry:
 * recType = N, S, C, R; - Typ účtenky 
 * paidBy = B,C,E,M,L,N,U,F,V,R,T - Způsob platby
 * cardIssuerId = int[getCardIssuers] - ID vydavatele karty
 * cardIssuerId = int[] centrální skupiny zboží
 * categoryId = int[getPriceCategory] - Centrální kategorie zboží
 * operator = string[getUsers] - Operátor (uživatel)
 * stockId = int - ID skladu
 * dateFrom = string - Datum od (YYYY-MM-DD)
 * totalReceiptPriceFrom = number - Cena účtenky od
 * totalReceiptPriceTo = number - Cena účtenky do
 * receiptItemPriceFrom = number - Cena položky účtenky od
 * receiptItemPriceTo = number - Cena položky účtenky do
 * receiptNrFrom = string - Číslo účtenky od
 * receiptNrTo = string - Číslo účtenky do
 * Search - number
 * Searchtype = fullSearch, EAN, PLU, card, receiptText
 */

test.describe.serial('API Testy pro získání filtrů účtenek', () => {
    let apiClient: ApiClient;

    // Inicializace ApiClientu před každým testem
    test.beforeEach(async ({ page }) => {
        logger.silly('Spouštím beforeEach: Inicializuji ApiClient...');
        await page.goto('/');

        const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
        expect(token, 'Chybí autorizační token z fixture!').toBeTruthy();
        apiClient = new ApiClient(page.request, token!);
        logger.trace('ApiClient úspěšně inicializován.');
    });

    test('GET /administration-api/stockCardsCategories/60193531 - Získání dat z centrální kategorie zboží', async () => {
        const endpoint = '/administration-api/stockCardsCategories/60193531';
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);

        try {
            const filters = await apiClient.getPriceCategory();
            logger.silly('Response data:\n' + JSON.stringify(filters, null, 2));

            expect(filters).toBeDefined();
            expect(Array.isArray(filters)).toBeTruthy();
            expect(filters.length).toBeGreaterThan(0);

            // Vytvoření pole všech name
            const centralniKategorieNames = filters.map((item: any) => item.name);
            logger.trace('Centrální kategorie zboží (name): ' + JSON.stringify(centralniKategorieNames));

            // Vytvoření pole všech id
            const centralniKategorieIds = filters.map((item: any) => item.id);
            logger.trace('Centrální kategorie zboží (id): ' + JSON.stringify(centralniKategorieIds));

            logger.trace('Filtry účtenek byly úspěšně získány.');
        } catch (error) {
            logger.error(`Chyba při získávání filtrů účtenek: ${error}`);
            throw error;
        }
    });

    test('GET /reports-api/listOfOperators - Získání seznamu uživatelů', async () => {
        const endpoint = '/reports-api/listOfOperators';
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);

        try {
            const users = await apiClient.getUsers(101, 2025, 'R');
            logger.silly('Response data:\n' + JSON.stringify(users, null, 2));

            expect(users).toBeDefined();
            expect(Array.isArray(users)).toBeTruthy();
            expect(users.length).toBeGreaterThan(0);

            // Vytvoření pole všech hodnot (např. value) uživatelů
            const userValues = users.map((user: any) => user.value);
            logger.trace('Uživatelé (value): ' + JSON.stringify(userValues));

            logger.trace('Seznam uživatelů byl úspěšně získán.');
        } catch (error) {
            logger.error(`Chyba při získávání seznamu uživatelů: ${error}`);
            throw error;
        }
    });

    test('GET /reports-api/listOfCardIssuers - Získání seznamu vydavatelů karet', async () => {
        const endpoint = '/reports-api/listOfCardIssuers?columns=id,issuerName,issuerType';
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);

        try {
            const cardIssuers = await apiClient.getCardIssuers(['id', 'issuerName', 'issuerType']);
            logger.silly('Response data:\n' + JSON.stringify(cardIssuers, null, 2));

            expect(cardIssuers).toBeDefined();
            expect(Array.isArray(cardIssuers)).toBeTruthy();
            expect(cardIssuers.length).toBeGreaterThan(0);

            // Vytvoření pole všech issuerName
            const issuerNames = cardIssuers.map((issuer: any) => issuer.issuerName);
            logger.trace('Vydavatelé karet (issuerName): ' + JSON.stringify(issuerNames));

            logger.trace('Seznam vydavatelů karet byl úspěšně získán.');
        } catch (error) {
            logger.error(`Chyba při získávání vydavatelů karet: ${error}`);
            throw error;
        }
    });

    test('GET /reports-api/listOfReceipts - Plná data, očekáváme výsledek', async () => {
        
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s plnými filtry `);
        try {
            // Plná validní data
            const filters = {
                            year: 2025,
                            stockId: 101,
                            totalReceiptPriceFrom: 1, // Předpokládám název tohoto parametru
                            receiptItemPriceFrom: 0,
                            offset: 0,
                            limit: 10,
                            sort: '-receipt', 
                            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect(receipts).toBeDefined();
            expect(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (plná data): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek (plná data): ${error}`);
            throw error;
        }
    });

    test('GET /reports-api/listOfReceipts - Negativní test, na response očekáváme []', async () => {
        
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s plnými filtry `);
        try {
            const filters = {
                            year: 1984, //Záměrně chybné datum
                            stockId: 101,
                            totalReceiptPriceFrom: 1, 
                            receiptItemPriceFrom: 0,
                            offset: 0,
                            limit: 10,
                            sort: '-receipt', 
                            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect(receipts).toBeDefined();
            expect(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length !== 0) {
                test.fail(true, 'Očekáváme prázdný response, ale server vrací data.');
            } logger.trace('Response GET /reports-api/listOfReceipts (plná data): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek (plná data): ${error}`);
            throw error;
        }
    });
});