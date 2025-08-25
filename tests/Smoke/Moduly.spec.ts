

import { expect, test } from '../../support/fixtures/auth.fixture';
import { ApiClient } from '../../support/ApiClient';
import { logger } from '../../support/logger';

/**
 * Smoke Test Suite
 * Cíl: Ověřit základní dostupnost a funkčnost klíčových API endpointů.
 * Scénář:
 * 1. Fixtura 'auth.fixture' zajistí platný autorizační token.
 * 2. Pro každý endpoint se spustí samostatný test.
 * 3. Využije se sdílená, autorizovaná instance ApiClient.
 * 4. Ověří se, že volání proběhlo bez chyby a odpověď má správnou datovou strukturu.
 */

test.describe('API Smoke Tests', () => {
    // Sdílená instance ApiClient pro všechny testy v této sadě
    let apiClient: ApiClient;

    // Konstanty pro testování
    const ACC_OWNER_ID = '60193531';
    const STOCK_ID = '230';

    /**
     * Hook, který se spustí jednou před všemi testy.
     * Díky použití 'auth.fixture' máme k dispozici 'authToken'.
     * Zde pouze inicializujeme ApiClient s tímto tokenem.
     */
    test.beforeEach(async ({ request, authToken }) => {
        logger.info('Zahajuji API smoke test suite...');
        // Očekáváme, že fixtura nám dodala platný token
        expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
        // Vytvoříme instanci klienta pro použití v testech
        apiClient = new ApiClient(request, authToken);
        logger.info('ApiClient byl úspěšně inicializován s autorizačním tokenem.');
    });

    test('TC-1194: TCGET /dashboard - Dashboard @Smoke @API @Critical', async () => {
        logger.trace('Spouštím test pro endpoint: GET /dashboard');
        // Používáme instanci 'apiClient', nikoliv statickou třídu 'ApiClient'
        const responseHtml = await apiClient.getDashboard();

        expect(responseHtml, 'Odpověď z /dashboard nesmí být prázdná').toBeDefined();
        expect(typeof responseHtml, 'Odpověď z /dashboard musí být textový řetězec').toBe('string');
        expect(responseHtml.length, 'HTML obsah z /dashboard musí mít obsah').toBeGreaterThan(0);
        logger.info('Endpoint GET /dashboard vrátil validní HTML obsah.');
    });

    test('TC-1195: GET /reports-api/listOfStocks - Obchodní místa @Smoke @API @Critical', async () => {
        logger.trace('Spouštím test pro endpoint: GET /reports-api/listOfStocks');
        const response = await apiClient.getListOfStocks({ accOwner: ACC_OWNER_ID, limit: 5 });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfStocks nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined } 
            : response;                                  

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 obchodních míst pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} obchodních míst.`);
        }
    });

        test('TC-1196: GET /reports-api/listOfStockCards - Skladové karty @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfStockCards`);
        const response = await apiClient.getListOfStockCards(ACC_OWNER_ID, STOCK_ID, { limit: 10 });
        
        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfStockCards nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response) ? { data: response } : response;
        
        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        
        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 skladových karet pro accOwnerId: ${ACC_OWNER_ID} a stockId: ${STOCK_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} skladových karet.`);
        }
    });

    test('TC-1197: GET /administration-api/stockCardsGroupsLocal - Lokální skupiny @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/stockCardsGroupsLocal`);
        const response = await apiClient.getStockCardsGroupsLocal(STOCK_ID, { limit: 10 });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/stockCardsGroupsLocal nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response) ? { data: response } : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 lokálních skupin pro stockId: ${STOCK_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} lokálních skupin.`);
        }
    });

    test('TC-1198: GET /administration-api/stockCardsSupergroupsLocal - Lokální nadskupiny @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/stockCardsSupergroupsLocal`);
        const response = await apiClient.getStockCardsSupergroupsLocal(STOCK_ID, { limit: 10 });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/stockCardsSupergroupsLocal nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response) ? { data: response } : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 lokálních nadskupin pro stockId: ${STOCK_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} lokálních nadskupin.`);
        }
    });

        test('TC-1199: GET /administration-api/listOfPosTerminals - Rychlé volby 1/2 - POS Terminály @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/listOfPosTerminals`);
        const response = await apiClient.getListOfPosTerminals(STOCK_ID);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/listOfPosTerminals nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response) ? { data: response } : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 POS terminálů pro stockId: ${STOCK_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} POS terminálů.`);
        }
    });

    test('TC-1200: GET /administration-api/listOfHotKeysDefinitions - Rychlé volby @Smoke @API @Critical POS Terminál 2/2', async () => {
        const POS_TERMINAL_ID = '23001';
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/listOfHotKeysDefinitions`);
        const response = await apiClient.getListOfHotKeysDefinitions(STOCK_ID, POS_TERMINAL_ID);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/listOfHotKeysDefinitions nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response) ? { data: response } : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 rychlých voleb pro stockId: ${STOCK_ID} a posTerminalId: ${POS_TERMINAL_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} rychlých voleb.`);
        }
    });

     test('TC-1201: GET /reports-api/listOfPartners - Obchod/Partneři 1/2 @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPartners`);
        const response = await apiClient.getListOfPartners({ accOwner: ACC_OWNER_ID });
    
        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPartners nesmí být prázdná').toBeDefined();
    
        // Normalizace odpovědi pro konzistentní zpracování (očekáváme pole 'data')
        const normalizedResponse = Array.isArray(response) ? { data: response } : response;
    
        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
    
        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 partnerů pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} partnerů.`);
        }
    });

        test('TC-1202: GET /dashboard-api/tablesCountInfo - Obchod/Partneři 2/2 @Smoke @API @Critical', async () => {
        const tableToQuery = 'localCards';
        logger.trace(`Spouštím test pro endpoint: GET /dashboard-api/tablesCountInfo`);

        // Zavoláme metodu klienta s potřebnými parametry
        const response = await apiClient.getTablesCountInfo({
            accOwner: ACC_OWNER_ID,
            tables: tableToQuery
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

        // Základní aserce: odpověď musí být definovaný objekt
        expect(response, 'Odpověď z /dashboard-api/tablesCountInfo nesmí být prázdná').toBeDefined();
        expect(typeof response, 'Odpověď musí být datový typ objekt').toBe('object');
        expect(response).not.toBeNull();

        // Specifická aserce: ověříme, že odpověď obsahuje klíč pro dotazovanou tabulku a že hodnota je číslo
        expect(response[tableToQuery], `Odpověď musí obsahovat klíč pro tabulku "${tableToQuery}"`).toBeDefined();
        expect(typeof response[tableToQuery].count, `Hodnota pro "${tableToQuery}.count" musí být číslo`).toBe('number');
        expect(response[tableToQuery].count, `Počet záznamů pro "${tableToQuery}" musí být 0 nebo více`).toBeGreaterThanOrEqual(0);

        logger.info(`Endpoint úspěšně vrátil počet záznamů pro tabulku "${tableToQuery}": ${response[tableToQuery]}.`);
    });

    test('TC-1203: GET /reports-api/listOfLocalCards - Obchod/Fleet karty @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfLocalCards`);

        // Zavoláme metodu klienta s parametry pro omezení výsledků
        const response = await apiClient.getListOfLocalCards({
            accOwner: ACC_OWNER_ID,
            limit: 5
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfLocalCards').toBeDefined();

        // Normalizujeme odpověď, abychom mohli jednotně testovat strukturu (data a pagination)
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Pokud odpověď není přímo pole, měla by obsahovat i informace o stránkování
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 lokálních karet pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} lokálních karet.`);
        }
    });

    test('TC-1204: GET /reports-api/listOfPricesCategories - Obchod/ Cenové kategorie @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPricesCategories`);

        // Zavoláme metodu API klienta
        const response = await apiClient.getListOfPricesCategories({
            accOwner: ACC_OWNER_ID
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPricesCategories nesmí být prázdná').toBeDefined();

        // Normalizace odpovědi pro konzistentní ověření datové struktury
        const normalizedResponse = Array.isArray(response) ? { data: response } : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 cenových kategorií pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} cenových kategorií.`);
        }
    });
    
    test('TC-1205: GET /reports-api/listOfEuroOilCardRequests - Obchod/Přehled žádostí o Euroil kartu @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfEuroOilCardRequests`);

        // Zavoláme metodu API klienta s potřebnými parametry
        const response = await apiClient.getListOfEuroOilCardRequests({
            stockId: STOCK_ID,
            limit: 5
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfEuroOilCardRequests nesmí být prázdná').toBeDefined();

        // Normalizujeme odpověď pro jednotné ověření struktury
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Pokud odpověď není přímo pole, ověříme i existenci stránkování
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 žádostí o EuroOil karty pro stockId: ${STOCK_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} žádostí o EuroOil karty.`);
        }
    });

    test('TC-1206: GET /reports-api/listOfBonusClasses - Obchod/Přehled slev a poplatků @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfBonusClasses`);

        // Zavoláme metodu API klienta s parametry
        const response = await apiClient.getListOfBonusClasses({
            accOwner: ACC_OWNER_ID,
            limit: 10
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfBonusClasses nesmí být prázdná').toBeDefined();

        // Normalizujeme odpověď pro jednotné ověření struktury
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Pokud odpověď není přímo pole, ověříme i existenci stránkování
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 bonusových tříd pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} bonusových tříd.`);
        }
    });

    test('TC-1207: GET /reports-api/listOfUsersReports - Sestavy/ Uživatelské sestavy @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfUsersReports`);

        // Zavoláme metodu API klienta s path a query parametry
        const response = await apiClient.getListOfUsersReports(ACC_OWNER_ID, {
            limit: 10
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfUsersReports nesmí být prázdná').toBeDefined();

        // Normalizujeme odpověď pro jednotné ověření struktury
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Pokud odpověď není přímo pole, ověříme i existenci stránkování
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length === 0) {
            logger.warn(`Endpoint vrátil 0 uživatelských sestav pro accOwnerId: ${ACC_OWNER_ID}.`);
        } else {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} uživatelských sestav.`);
        }
    });
    test('TC-1208: GET /balances-api/supplyPeriodsEnums - Sestavy/ Přehled skladových zásob @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /balances-api/supplyPeriodsEnums`);

        const response = await apiClient.getSupplyPeriodsEnums(STOCK_ID);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

        // Ověříme, že odpověď je definovaná a je to pole
        expect(response, 'Odpověď z /balances-api/supplyPeriodsEnums nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);

        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.length} položek v číselníku.`);
            const firstItem = response[0];

            // Ověříme strukturu první položky v poli
            expect.soft(firstItem, 'První položka nesmí být null').not.toBeNull();

            expect.soft(firstItem).toHaveProperty('value');
            expect.soft(typeof firstItem.value, 'Vlastnost "value" musí být číslo').toBe('number');

            expect.soft(firstItem).toHaveProperty('label');
            expect.soft(typeof firstItem.label, 'Vlastnost "label" musí být textový řetězec').toBe('string');

            expect.soft(firstItem).toHaveProperty('year');
            expect.soft(typeof firstItem.year, 'Vlastnost "year" musí být textový řetězec').toBe('string');

            expect.soft(firstItem).toHaveProperty('balanceItems');
            expect.soft(typeof firstItem.balanceItems, 'Vlastnost "balanceItems" musí být číslo').toBe('number');
        } else {
            logger.warn(`Endpoint vrátil prázdný číselník období pro stockId: ${STOCK_ID}.`);
        }
    });
    test('TC-1209: GET /dashboard-api/stocksTanks - Stavy/ Ceník kapalin @Smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /dashboard-api/stocksTanks`);

        const response = await apiClient.getStocksTanks(STOCK_ID);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

        // Ověříme, že odpověď je definovaná a je to pole
        expect(response, 'Odpověď z /dashboard-api/stocksTanks nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);

        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil data pro ${response.length} nádrží.`);
            const firstTank = response[0];

            // Ověříme strukturu prvního objektu v poli
            expect.soft(firstTank, 'První objekt nádrže nesmí být null').not.toBeNull();
            expect.soft(firstTank).toHaveProperty('tankId');
            expect.soft(firstTank).toHaveProperty('stockCardName');
            expect.soft(firstTank).toHaveProperty('volume');
            expect.soft(firstTank).toHaveProperty('capacity');
            expect.soft(firstTank).toHaveProperty('fillPercent');
            
            // Ověříme datové typy klíčových vlastností
            expect.soft(typeof firstTank.tankId, 'Vlastnost "tankId" musí být číslo').toBe('number');
            expect.soft(typeof firstTank.stockCardName, 'Vlastnost "stockCardName" musí být textový řetězec').toBe('string');
            expect.soft(typeof firstTank.volume, 'Vlastnost "volume" musí být číslo').toBe('number');
            expect.soft(typeof firstTank.fillPercent, 'Vlastnost "fillPercent" musí být číslo').toBe('number');
        } else {
            logger.warn(`Endpoint nevrátil žádná data o nádržích pro stockId: ${STOCK_ID}.`);
        }
    });

    test('TC-1210: GET /reports-api/listOfOperators - Doklady/ Účtenky @Smoke @API @Critical', async () => {
       const testParams = {
                stockId: STOCK_ID,
                year: 2025,
                documentType: 'R'
            };
            logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfOperators s parametry: ${JSON.stringify(testParams)}`);

            const response = await apiClient.getListOfOperators(testParams);

            logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

            // Ověříme, že odpověď je definovaná a je to pole
            expect(response, 'Odpověď z /reports-api/listOfOperators nesmí být prázdná').toBeDefined();
            expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);

            if (response.length > 0) {
                logger.info(`Endpoint úspěšně vrátil ${response.length} operátorů.`);
                const firstOperator = response[0];

                // Ověříme strukturu prvního objektu v poli
                expect.soft(firstOperator, 'První objekt operátora nesmí být null').not.toBeNull();
                expect.soft(firstOperator).toHaveProperty('operator');
                expect.soft(firstOperator).toHaveProperty('name');
                
                // Ověříme datové typy
                expect.soft(typeof firstOperator.operator, 'Vlastnost "operator" musí být textový řetězec').toBe('string');
                expect.soft(typeof firstOperator.name, 'Vlastnost "name" musí být textový řetězec').toBe('string');
            } else {
                logger.warn(`Endpoint nevrátil žádné operátory pro parametry: ${JSON.stringify(testParams)}.`);
            }
        });
    test('TC-1211: GET /reports-api/listOfReceiptsUdd - Doklady/ Úplné daňové doklady @Smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            year: 2025,
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfReceiptsUdd s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfReceiptsUdd(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfReceiptsUdd nesmí být prázdná').toBeDefined();

        // Pro tento typ endpointu očekáváme vždy objekt s 'data' a 'pagination'
        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} UDD příjemek.`);
            // Rychlá kontrola, že první záznam má základní identifikátory
            const firstReceipt = response.data[0];
            expect(firstReceipt).toHaveProperty('id');
            expect(firstReceipt).toHaveProperty('receiptId');
        } else {
            logger.warn(`Endpoint nevrátil žádné UDD příjemky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });
    test('TC-1212: GET /reports-api/listOfPosTankTickets - Doklady/ stvrzenky o složení hotovosti @Smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosTankTickets s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosTankTickets(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosTankTickets nesmí být prázdná').toBeDefined();

        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} stvrzenek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné stvrzenky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1213: GET /reports-api/listOfPosMoneyOperations - Doklady/Vklady a výběry v hotovosti @Smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosMoneyOperations s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosMoneyOperations(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosMoneyOperations nesmí být prázdná').toBeDefined();

        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} peněžních operací.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné peněžní operace pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1214: GET /reports-api/listOfPosTankVouchers - Doklady/ přeplatkové poukázky @Smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosTankVouchers s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosTankVouchers(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosTankVouchers nesmí být prázdná').toBeDefined();

        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} přeplatkových poukázek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné přeplatkové poukázky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });
    test('TC-1215: GET /reports-api/listOfGoodsInventories - Doklady/ Inventury zboží @Smoke @API @Critical', async () => {
        const testParams = {
            accOwner: ACC_OWNER_ID,
            stockId: STOCK_ID,
            year: 2025
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfGoodsInventories s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfGoodsInventories(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfGoodsInventories nesmí být prázdná').toBeDefined();

        // Tento endpoint pravděpodobně vrací přímo pole
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);
        
        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.length} inventur zboží.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné inventury zboží pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1216: GET /reports-api/listOfOrders - Doklady/ Objednávky zboží @Smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            year: 2025,
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfOrders s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfOrders(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfOrders nesmí být prázdná').toBeDefined();

        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} objednávek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné objednávky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1217: GET /reports-api/listOfWetDeliveryNotes - Doklady/ Čerpadlové dodací listy @Smoke @API @Critical', async () => {
        const testParams = {
            accOwner: ACC_OWNER_ID,
            stockId: STOCK_ID,
            year: 2025,
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfWetDeliveryNotes s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfWetDeliveryNotes(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfWetDeliveryNotes nesmí být prázdná').toBeDefined();

        expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
        expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
        
        if (response.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.data.length} čerpadlových dodacích listů.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné čerpadlové dodací listy pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1218: GET /reports-api/listOfDailyBalances - Uzávěrky/ Denní uzávěrky @Smoke @API @Critical', async () => {
    const testParams = {
        accOwner: ACC_OWNER_ID,
        stockId: STOCK_ID,
        limit: 10,
        dateFrom: '2025-08-01T00:00:00.000Z',
        dateTo: '2025-08-25T23:59:59.000Z'
    };
    logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfDailyBalances s parametry: ${JSON.stringify(testParams)}`);

    const response = await apiClient.getListOfDailyBalances(testParams);

    logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
    expect(response, 'Odpověď z /reports-api/listOfDailyBalances nesmí být prázdná').toBeDefined();

    expect(response.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);
    expect(response.pagination, 'Odpověď musí obsahovat objekt "pagination"').toBeDefined();
    
    if (response.data.length > 0) {
        logger.info(`Endpoint úspěšně vrátil ${response.data.length} denních uzávěrek.`);
    } else {
        logger.warn(`Endpoint nevrátil žádné denní uzávěrky pro parametry: ${JSON.stringify(testParams)}.`);
    }
    });
});     