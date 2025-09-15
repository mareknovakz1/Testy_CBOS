import { expect, test } from '../../../../support/fixtures/auth.fixture';
import { ApiClient } from '../../../../support/ApiClient.legacy';
import { logger } from '../../../../support/logger';

/*
 + Parameters
    + stockId (number, required) - identifikace daného skladu (obchodního místa). Example: `1`
    + accOwner: `00174939` (string, optional) - identifikace sítě
    + year (number, required) - rok. Example: `2023`
    + month (number, required) - měsíc. Example: `9
    + day: `8` (number, optional) - den
    + termId: `true` (boolean, optional) - číslo pokladního terminálu
    + operator: `OCTOPOS` (string, optional) - operátor
    + recType: `N` (string, optional) - typ účtenky
    + paidBy: `M` (string, optional) - způsob uhrazení
    + dateFrom (string, optional) - datum od v ISO formátu (`YYYY-MM-DDTHH:mm:ss.sssZ`)
    + dateTo (string, optional) - datum do v ISO formátu (`YYYY-MM-DDTHH:mm:ss.sssZ`)
    + ean (string, optional) - EAN kód
    + cardIssuerId: `5` (number, optional) - identifikace vydavatele karty
    + totalReceiptPriceFrom: `500` (number, optional) - celková částka účtenky, dolní hranice
    + totalReceiptPriceTo: `3000` (number, optional) - celková částka účtenky, horní hranice
    + receiptItemPriceFrom: `500` (number, optional) - částka alespoň jedné položky, dolní hranice
    + receiptItemPriceTo: `2000` (number, optional) - částka alespoň jedné položky, horní hranice
    + receiptNrFrom: `5` (string, optional) - číslo účtenky od
    + receiptNrTo: `10` (string, optional) - číslo účtenky do
    + cgroupId: `1,52` (string, optional) - ID centrální skupiny zboží (nebo seznam oddělený čárkou)
    + lgroupId: `1` (string, optional) - ID lokální skupiny zboží (nebo seznam oddělený čárkou)
    + categoryId: `8` (string, optional) - ID centrální kategorie (nebo seznam oddělený čárkou)
    + search: `8594` (string, optional) - co se má vyhledat
    + searchType: `fullSearch` (string, optional) - jak se mají sestavit podmínky vyhledání (EAN, PLU, card, receiptText, fullSearch)
 */

let apiClient: ApiClient;
let issuerIds: number[] = [];
let cGroupIds: number[] = []; //Centrální skupina zboží
let categoryIds: string[] = []; //Centrální kategorie zboží
let OperatorName: string[] = [];
const accOwner = '60193531'; 

interface StockCardCategory {
    id: number;
    name: string;
    category: string;
    useOnStockCards: boolean;
    valid: boolean;
}

interface ApiUser {
    value: string;
}

interface CardIssuer {
    id: number;
    issuerName: string;
    issuerType: string;
}

    
test.describe('API Testy pro získání filtrů účtenek', () => {

    // Tento blok se spustí jednou před každým testem v této sadě.
    test.beforeEach(async ({ request, authToken }) => {
        expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
        apiClient = new ApiClient(request, authToken); 
    });

  // Zde testujeme stažení dat - centrální kategorie zboží a centrálních kategorií zboží
    test('TC-1309: GET /administration-api/stockCardsCategories - Získání a roztřídění dat @API @regression, @search, @high @receipts', async () => {
        const endpoint = `/administration-api/stockCardsCategories/${accOwner}`;
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);
        
        // UPRAVENO: Říkáme, že očekáváme pole objektů typu StockCardCategory
        const categories: StockCardCategory[] = await apiClient.getPriceCategory();
        logger.silly('Response data:\n' + JSON.stringify(categories, null, 2));

        // Základní kontroly, že jsme dostali platná data
        expect.soft(categories).toBeDefined();
        expect.soft(Array.isArray(categories)).toBeTruthy();
        expect.soft(categories.length).toBeGreaterThan(0);

        
        // Díky definici typu výše již TypeScript ví, co je 'category', a chyby zmizí.
        const ids = categories.map(category => category.id);
        cGroupIds = ids; 
        const names = categories.map(category => category.name);
        const categoryCodes = categories.map(category => category.category);
        categoryIds = categoryCodes;
        const useOnStockCardsFlags = categories.map(category => category.useOnStockCards);
        const validFlags = categories.map(category => category.valid); 


        // --- Logování pro ověření ---
        logger.trace('Pole všech ID:', cGroupIds);
        logger.trace('Pole všech názvů:', names);
        logger.trace('Pole všech kódů kategorií:', categoryIds);
        logger.trace('Pole příznaků "useOnStockCards":', useOnStockCardsFlags);
        logger.trace('Pole příznaků "valid":', validFlags);

        // Můžete přidat i další kontroly, např. že všechna pole mají stejnou délku
        expect.soft(ids.length).toEqual(categories.length);
        expect.soft(names.length).toEqual(categories.length);
    });

    // Zde testujeme stažení dat - Získání seznamu uživatelů
    test('TC-1310: GET /reports-api/listOfOperators - Získání seznamu uživatelů @API @regression, @search, @high @receipts', async () => {
        const endpoint = '/reports-api/listOfOperators';
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);

        try {
            const users = await apiClient.getUsers(230, 2025, 'R');
            logger.silly('Response data:\n' + JSON.stringify(users, null, 2));

            expect.soft(users).toBeDefined();
            expect.soft(Array.isArray(users)).toBeTruthy();
            expect.soft(users.length).toBeGreaterThan(0);

            const userValues = users.map((user: any) => user.value);
            OperatorName = userValues;

            // Log pro ověření, že se proměnná naplnila
            logger.info(`Bylo získáno a uloženo ${OperatorName.length} operátorů.`);
            expect.soft(OperatorName.length).toBeGreaterThan(0);

        } catch (error) {
            logger.error(`Chyba při získávání seznamu uživatelů: ${error}`);
            throw error;
        }
    });

    //Získání seznamu vydvatele karet
    test('TC-1311: GET /reports-api/listOfCardIssuers - Získání seznamu vydavatelů karet @API @regression, @search, @high @receipts', async () => {
        const endpoint = '/reports-api/listOfCardIssuers?columns=id,issuerName,issuerType';
        logger.info(`Spouštím test endpointu: GET ${endpoint}`);

        try {
            const cardIssuers = await apiClient.getCardIssuers(['id', 'issuerName', 'issuerType']);
            logger.silly('Response data:\n' + JSON.stringify(cardIssuers, null, 2));

            expect.soft(cardIssuers).toBeDefined();
            expect.soft(Array.isArray(cardIssuers)).toBeTruthy();
            expect.soft(cardIssuers.length).toBeGreaterThan(0);

            // Vytvoření pole všech issuerName
            const issuerNames = cardIssuers.map((issuer: any) => issuer.issuerName);
            logger.debug('Vydavatelé karet (issuerName): ' + JSON.stringify(issuerNames));

            issuerIds = cardIssuers.map((issuer: any) => issuer.id);
            logger.debug('ID vydavatelů karet: ' + JSON.stringify(issuerIds));
        } catch (error) {
            logger.error(`Chyba při získávání vydavatelů karet: ${error}`);
            throw error;
        }
    });

// Test pro získání účtenek s plnými filtry
    test('TC-1312: GET /reports-api/listOfReceipts - Plná data, očekáváme výsledek @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s plnými filtry`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                totalReceiptPriceFrom: 1,
                receiptItemPriceFrom: 0,
                offset: 0,
                limit: 10,
                sort: '-receipt', 
            };

            // Zde apiClient.getReceipts() vrací přímo pole, přejmenujeme proměnnou pro srozumitelnost.
            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data (pole účtenek):\n' + JSON.stringify(receipts, null, 2));

            // Kontrolujeme, že jsme dostali pole.
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            }
            logger.trace('Response GET /reports-api/listOfReceipts (plná data): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek (plná data): ${error}`);
            throw error;
        }
    });

    // Zde testujeme negativní scénář, kdy očekáváme prázdný response
    test('TC-1313: GET /reports-api/listOfReceipts - Negativní test, na response očekáváme [] @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s chybně zadanými filtry `);
        try {
            const filters = {
                            year: 1984, //Záměrně chybné datum
                            stockId: 230,
                            totalReceiptPriceFrom: 1, 
                            receiptItemPriceFrom: 0,
                            offset: 0,
                            limit: 10,
                            sort: '-receipt', 
                            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length !== 0) {
                test.fail(true, 'Očekáváme prázdný response, ale server vrací data.');
            } logger.trace('Response GET /reports-api/listOfReceipts (plná data): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek (plná data): ${error}`);
            throw error;
        }
    });

    //Filtrování podle Typu účtenky (N,S,C,R)
    test('TC-1314: GET /reports-api/listOfReceipts - Filtrování podle Typu účtenky (N,S,C,R) @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem recType`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                recType: ['N','S','C','R'], 
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr recType): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem recType: ${error}`);
            throw error;
        }
    });
    
    //Filtrování podle Vydavatele karty
    test('TC-1315: GET /reports-api/listOfReceipts - Filtrování podle Vydavatele karty @API @regression, @search, @high @receipts', async () => {   
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem cardIssuerId`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                cardIssuerId: issuerIds, 
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr cardIssuerId): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem cardIssuerId: ${error}`);
            throw error;
        }
   });
   //Filtrování podle centrální kategorie zboží
   test('TC-1316: GET /reports-api/listOfReceipts - Filtrování podle centrální kategorie zboží @API @regression, @search, @high @receipts', async () => {   
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem categoryId`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                categoryId: categoryIds, 
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };
            logger.silly('Sestavený request (filtry) pro odeslání:', filters);
            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr categoryId): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem categoryId: ${error}`);
            throw error;
        } 
    });
    
    //Filtrování podle Centrální skupiyn zboží
    test('TC-1317: GET /reports-api/listOfReceipts - Filtrování podle centrální skupiny zboží @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem groupId`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                cgroupId: cGroupIds, 
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr groupId): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem groupId: ${error}`);
            throw error;
        }
    });

    //Filtrování podle Způsobu platby
    test('TC-1318: GET /reports-api/listOfReceipts - Filtrování podle způsobu platby @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem paidBy`);
        try {
                const filters = {
                year: 2025,
                stockId: 230,
                paidBy: ['M', 'K', 'P', 'H', 'S'], //Způsob platby
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr paidBy): ' + JSON.stringify(receipts, null, 2));
            } catch (error) {
                logger.error(`Chyba při získávání účtenek s filtrem paidBy: ${error}`);
                throw error;
            }
    });

    //Filtrování podle Operátora
    test('TC-1319: GET /reports-api/listOfReceipts - Filtrování podle operátora @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem operator`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                operator: OperatorName, //Zde by mělo být ID operátora
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };
            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            }
            logger.trace('Response GET /reports-api/listOfReceipts (filtr operator): ' + JSON.stringify(receipts, null, 2));
            } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem operator: ${error}`);
            throw error;
        } 
    });
      
    //Filtrování času podle formátu YYYY-MM-DDTHH:mm:ss:000Z
    test('TC-1320: GET /reports-api/listOfReceipts - Filtrování podle data od a do s formátem YYYY-MM-DDTHH:mm:ss:000Z @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem dateFrom a dateTo ve formátu YYYY-MM-DDTHH:mm:ss:000Z`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                dateFrom: '2024-12-31T23:00:00.000Z', // Příklad data od
                dateTo: '2025-08-10T21:59:59.000Z', // Příklad data do
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr dateFrom a dateTo ve formátu YYYY-MM-DDTHH:mm:ss:000Z): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem dateFrom a dateTo ve formátu YYYY-MM-DDTHH:mm:ss:000Z: ${error}`);
            throw error;
        }
    });

    //Následující 4 testy jsou zaměřeny na filtrování účtenek podle ceny
    //1. ověří cenu účtenky "od"
    //2. ověří cenu účtenky "do"
    //3. ověří cenu účtenky "od" a "do"
    //4. porovná výsledky z předchozích testů, zda jsou v souladu s očekáváním
    //Filtrování podle "od" ceny na účtence
   logger.silly('Inicializuji globální proměnné pro počty účtenek: countFrom, countTo, countBetween');
   let countFrom, countTo, countBetween; //Globální proměnné pro uložení počtu účtenek mezi jednotlivými testy
   
   test('TC-1321: GET /reports-api/listOfReceipts - Počet účtenek nad 100 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem totalReceiptPriceFrom`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                totalReceiptPriceFrom: 100,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };
            
            logger.silly('Sestavený request (filtry) pro odeslání:', filters);
            const receipts = await apiClient.getReceipts(filters); //Zde získáváme účtenky s filtrem totalReceiptPriceFrom
            expect.soft(receipts).toBeDefined(); // Ověříme, že response není undefined
            expect.soft(Array.isArray(receipts)).toBeTruthy(); // Očekáváme, že response bude pole
            countFrom = receipts.length;
            logger.info(`Počet účtenek nad 100: ${countFrom}`); 
            expect.soft(countFrom, 'Počet účtenek je 0').toBeGreaterThan(0); // Očekáváme, že počet účtenek bude větší než 0
        }catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem totalReceiptPriceFrom: ${error}`);
            throw error;
        }       
    });

    test('TC-1322: GET /reports-api/listOfReceipts - Počet účtenek do 500 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem totalReceiptPriceTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                totalReceiptPriceTo: 500,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countTo = receipts.length;
            logger.info(`Počet účtenek do 500: ${countTo}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem totalReceiptPriceTo: ${error}`);
            throw error;
        }
    });

    test('TC-1323: GET /reports-api/listOfReceipts - Počet účtenek 100-500 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem totalReceiptPriceFrom a totalReceiptPriceTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                totalReceiptPriceFrom: 100,
                totalReceiptPriceTo: 500,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countBetween = receipts.length;
            logger.info(`Počet účtenek mezi 100 a 500: ${countBetween}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem totalReceiptPriceFrom a totalReceiptPriceTo: ${error}`);
            throw error;
        }
    });

    //Následující 3 testy jsou zaměřeny na čísla účtenek
    //1. ověří číslo účtenky "od"
    //2. ověří číslo účtenky "do"
    //3. ověří číslo účtenky "od" a "do"
    //Filtrování podle "od" čísla účtenky
    test('TC-1324: GET /reports-api/listOfReceipts - Počet účtenek s číslem od 5 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptNrFrom`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptNrFrom: '50000',
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };
            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            countFrom = receipts.length;
            logger.info(`Počet účtenek s číslem od 5: ${countFrom}`);
            expect.soft(countFrom, 'Počet účtenek je 0').toBeGreaterThan(0);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptNrFrom: ${error}`);
            throw error;
        }
    });

    //Filtrování podle "do" čísla účtenky
    test('TC-1325: GET /reports-api/listOfReceipts - Počet účtenek s číslem do 10 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptNrTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptNrTo: '60000',
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countTo = receipts.length;
            logger.info(`Počet účtenek s číslem do 10: ${countTo}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptNrTo: ${error}`);
            throw error;
        }
    });

    //Filtrování podle "od" a "do" čísla účtenky
    test('TC-1326: GET /reports-api/listOfReceipts - Počet účtenek s číslem od 5 a do 10 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptNrFrom a receiptNrTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptNrFrom: '50000',
                receiptNrTo: '60000',
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countBetween = receipts.length;
            logger.info(`Počet účtenek s číslem od 5 a do 10: ${countBetween}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptNrFrom a receiptNrTo: ${error}`);
            throw error;
        }
    });

    //Následující 3 testy jsou zaměřeny na filtrování podle ceny položky účtenky
    //1. ověří cenu položky účtenky "od"
    //2. ověří cenu položky účtenky "do"
    //3. ověří cenu položky účtenky "od" a "do"
    test('TC-1327: GET /reports-api/listOfReceipts - Počet účtenek s cenou položky od 500 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptItemPriceFrom`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptItemPriceFrom: 500,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };
            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            countFrom = receipts.length;
            logger.info(`Počet účtenek s cenou položky od 500: ${countFrom}`);
            expect.soft(countFrom, 'Počet účtenek je 0').toBeGreaterThan(0);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptItemPriceFrom: ${error}`);
            throw error;
        }
    });

    //Filtrování podle "do" ceny položky účtenky
    test('TC-1328: GET /reports-api/listOfReceipts - Počet účtenek s cenou položky do 2000 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptItemPriceTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptItemPriceTo: 2000,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countTo = receipts.length;
            logger.info(`Počet účtenek s cenou položky do 2000: ${countTo}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptItemPriceTo: ${error}`);
            throw error;
        }
    });

    //Filtrování podle "od" a "do" ceny položky účtenky
    test('TC-1329: GET /reports-api/listOfReceipts - Počet účtenek s cenou položky od 500 a do 2000 @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem receiptItemPriceFrom a receiptItemPriceTo`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                receiptItemPriceFrom: 500,
                receiptItemPriceTo: 2000,
                offset: 0,
                limit: 10000000,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            await expect.soft(receipts.length, 'Počet účtenek je 0').toBeGreaterThan(0);
            countBetween = receipts.length;
            logger.info(`Počet účtenek s cenou položky od 500 a do 2000: ${countBetween}`);
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem receiptItemPriceFrom a receiptItemPriceTo: ${error}`);
            throw error;
        }
    });

    //Filtrování podle vyhledávacího textu
    test('TC-1330: GET /reports-api/listOfReceipts - Filtrování podle vyhledávacího textu @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem search`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                search: '100', //Zde by mělo být EAN kód nebo PLU
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr search): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem search: ${error}`);
            throw error;
        }
    });

    //Filtrování podle PLU
    test('TC-1331: GET /reports-api/listOfReceipts - Filtrování podle PLU @API @regression, @search, @high @receipts', async () => {
        logger.info(`Spouštím test endpointu: GET /reports-api/listOfReceipts s filtrem searchType = PLU`);
        try {
            const filters = {
                year: 2025,
                stockId: 230,
                search: '10', //PLU kód
                searchType: 'PLU',
                offset: 0,
                limit: 10,
                sort: '-receipt',
            };

            const receipts = await apiClient.getReceipts(filters);
            logger.silly('Response data:\n' + JSON.stringify(receipts, null, 2));

            expect.soft(receipts).toBeDefined();
            expect.soft(Array.isArray(receipts)).toBeTruthy();
            // Očekáváme, že response obsahuje nějaká data
            if (receipts.length === 0) {
                test.fail(true, 'Očekáváme, že response obsahuje nějaká data, ale dostali jsme prázdné pole.');
            } logger.trace('Response GET /reports-api/listOfReceipts (filtr searchType = PLU): ' + JSON.stringify(receipts, null, 2));
        } catch (error) {
            logger.error(`Chyba při získávání účtenek s filtrem searchType = PLU: ${error}`);
            throw error;
        }
    });
});