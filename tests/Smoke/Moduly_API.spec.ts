
/**
 * Smoke Test Suite
 * Cíl: Ověřit základní dostupnost a funkčnost klíčových API endpointů.
 * Scénář:
 * 1. Fixtura 'auth.fixture' zajistí platný autorizační token.
 * 2. Pro každý endpoint se spustí samostatný test.
 * 3. Využije se sdílená, autorizovaná instance ApiClient.
 * 4. Ověří se, že volání proběhlo bez chyby a odpověď má správnou datovou strukturu.
 */

import { expect, test } from '../../support/fixtures/auth.fixture';
import { ApiClient } from '../../support/ApiClient.legacy';
import { logger } from '../../support/logger';
import { ACC_OWNER_ID } from "../../support/constants";

test.describe('API Smoke Tests', () => {
    // Sdílená instance ApiClient pro všechny testy v této sadě
    let apiClient: ApiClient;

    // Konstanty pro testování
    const STOCK_ID = '230';
    const stock_ID_num:number = 230;

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

    test('TC-1194: GET /dashboard - Dashboard @smoke @API @Critical', async () => {

        logger.trace('Spouštím test pro endpoint: GET /dashboard');
        // Používáme instanci 'apiClient', nikoliv statickou třídu 'ApiClient'
        const responseHtml = await apiClient.getDashboard();

        expect(responseHtml, 'Odpověď z /dashboard nesmí být prázdná').toBeDefined();
        expect(typeof responseHtml, 'Odpověď z /dashboard musí být textový řetězec').toBe('string');
        expect(responseHtml.length, 'HTML obsah z /dashboard musí mít obsah').toBeGreaterThan(0);
        logger.info('Endpoint GET /dashboard vrátil validní HTML obsah.');
    });

    test('TC-1195: GET /reports-api/listOfStocks - Obchodní místa @smoke @API @Critical', async () => {
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

        test('TC-1196: GET /reports-api/listOfStockCards - Skladové karty @smoke @API @Critical', async () => {
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

    test('TC-1197: GET /administration-api/stockCardsGroupsLocal - Lokální skupiny @smoke @API @Critical', async () => {
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

    test('TC-1198: GET /administration-api/stockCardsSupergroupsLocal - Lokální nadskupiny @smoke @API @Critical', async () => {
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

        test('TC-1199 GET /administration-api/listOfPosTerminals - Rychlé volby 1/2 - POS Terminály @smoke @API @Critical', async () => {
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

    test('TC-1200 GET /administration-api/listOfHotKeysDefinitions - Rychlé volby @smoke @API @Critical POS Terminál 2/2', async () => {
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

     test('TC-1201 GET /reports-api/listOfPartners - Obchod/Partneři 1/2 @smoke @API @Critical', async () => {
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

        test('TC-1202 GET /dashboard-api/tablesCountInfo - Obchod/Partneři 2/2 @smoke @API @Critical', async () => {
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

    test('TC-1203 GET /reports-api/listOfLocalCards - Obchod/Fleet karty @smoke @API @Critical', async () => {
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

    test('TC-1204 GET /reports-api/listOfPricesCategories - Obchod/ Cenové kategorie @smoke @API @Critical', async () => {
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
    
    test('TC-1205 GET /reports-api/listOfEuroOilCardRequests - Obchod/Přehled žádostí o Euroil kartu @smoke @API @Critical', async () => {
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

    test('TC-1206 GET /reports-api/listOfBonusClasses - Obchod/Přehled slev a poplatků @smoke @API @Critical', async () => {
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

    test('TC-1207 GET /reports-api/listOfUsersReports - Sestavy/ Uživatelské sestavy @smoke @API @Critical', async () => {
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
    test('TC-1208 GET /balances-api/supplyPeriodsEnums - Sestavy/ Přehled skladových zásob @smoke @API @Critical', async () => {
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
    test('TC-1209 GET /dashboard-api/stocksTanks - Stavy/ Ceník kapalin @smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /dashboard-api/stocksTanks`);

        const response = await apiClient.getStocksTanks(stock_ID_num);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil data pro ${normalizedResponse.data.length} nádrží.`);
            const firstTank = normalizedResponse.data[0];

            // Ověříme strukturu prvního objektu v poli
            expect.soft(firstTank, 'První objekt nádrže nesmí být null').not.toBeNull();
            expect.soft(firstTank).toHaveProperty('tankId');
            expect.soft(firstTank).toHaveProperty('stockCardName');
            expect.soft(firstTank).toHaveProperty('volume');
            // ---- OPRAVA: 'capacity' nahrazeno za 'maxVolume' a 'fillPercent' odstraněno ----
            expect.soft(firstTank).toHaveProperty('maxVolume'); 
            
            // Ověříme datové typy klíčových vlastností
            expect.soft(typeof firstTank.tankId, 'Vlastnost "tankId" musí být číslo').toBe('number');
            expect.soft(typeof firstTank.stockCardName, 'Vlastnost "stockCardName" musí být textový řetězec').toBe('string');
            expect.soft(typeof firstTank.volume, 'Vlastnost "volume" musí být číslo').toBe('number');
            expect.soft(typeof firstTank.maxVolume, 'Vlastnost "maxVolume" musí být číslo').toBe('number');
        } else {
            logger.warn(`Endpoint nevrátil žádná data o nádržích pro stockId: ${STOCK_ID}.`);
        }
    });

 test('TC-1210 GET /reports-api/listOfOperators - Doklady/ Účtenky @smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            year: 2025,
            documentType: 'R'
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfOperators s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfOperators(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));

        // Normalizace odpovědi (pro jistotu, kdyby API vrátilo objekt)
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} operátorů.`);
            const firstOperator = normalizedResponse.data[0];

            // Ověříme strukturu prvního objektu v poli
            expect.soft(firstOperator, 'První objekt operátora nesmí být null').not.toBeNull();
            
            // ---- OPRAVA: Kontrolujeme 'value' a 'label' místo 'operator' a 'name' ----
            expect.soft(firstOperator).toHaveProperty('value');
            expect.soft(firstOperator).toHaveProperty('label');
            
            // Ověříme datové typy
            expect.soft(typeof firstOperator.value, 'Vlastnost "value" musí být textový řetězec').toBe('string');
            expect.soft(typeof firstOperator.label, 'Vlastnost "label" musí být textový řetězec').toBe('string');
        } else {
            logger.warn(`Endpoint nevrátil žádné operátory pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

   test('TC-1211 GET /reports-api/listOfReceiptsUdd - Doklady/ Úplné daňové doklady @smoke @API @Critical', async () => {
            const testParams = {
                stockId: STOCK_ID,
                year: 2025,
                limit: 10
            };
            logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfReceiptsUdd s parametry: ${JSON.stringify(testParams)}`);

            const response = await apiClient.getListOfReceiptsUdd(testParams);

            logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
            expect(response, 'Odpověď z /reports-api/listOfReceiptsUdd nesmí být prázdná').toBeDefined();

            // ---- OPRAVA: Přidání normalizační logiky ----
            const normalizedResponse = Array.isArray(response)
                ? { data: response, pagination: undefined }
                : response;

            expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

            if (!Array.isArray(response)) {
                expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
            }
            
            if (normalizedResponse.data.length > 0) {
                logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} UDD příjemek.`);
                const firstReceipt = normalizedResponse.data[0];
                expect(firstReceipt).toHaveProperty('id');
                expect(firstReceipt).toHaveProperty('receiptId');
            } else {
                logger.warn(`Endpoint nevrátil žádné UDD příjemky pro parametry: ${JSON.stringify(testParams)}.`);
            }
        });

    test('TC-1212 GET /reports-api/listOfPosTankTickets - Doklady/ stvrzenky o složení hotovosti @smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosTankTickets s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosTankTickets(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosTankTickets nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} stvrzenek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné stvrzenky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1213 GET /reports-api/listOfPosMoneyOperations - Doklady/Vklady a výběry v hotovosti @smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosMoneyOperations s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosMoneyOperations(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosMoneyOperations nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} peněžních operací.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné peněžní operace pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1214 GET /reports-api/listOfPosTankVouchers - Doklady/ přeplatkové poukázky @smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            dateFrom: '2025-08-01T00:00:00.000Z',
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosTankVouchers s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosTankVouchers(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosTankVouchers nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} přeplatkových poukázek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné přeplatkové poukázky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1215 GET /reports-api/listOfGoodsInventories - Doklady/ Inventury zboží @smoke @API @Critical', async () => {
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
/*
    test('TC-1216 GET /reports-api/listOfOrders - Doklady/ Objednávky zboží @smoke @API @Critical', async () => {
        const testParams = {
            stockId: STOCK_ID,
            year: 2025,
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfOrders s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfOrders(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfOrders nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} objednávek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné objednávky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });


    test('TC-1217 GET /reports-api/listOfWetDeliveryNotes - Doklady/ Čerpadlové dodací listy @smoke @API @Critical', async () => {
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

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} čerpadlových dodacích listů.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné čerpadlové dodací listy pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });*/

   test('TC-1218 GET /balances-api/dailyBillances - Uzávěrky/ Denní uzávěrky @smoke @API @Critical', async () => {
        const testParams = {
            year: 2025,
            month: 8,
            limit: 10
        };
        logger.trace(`Spouštím test pro endpoint: GET /balances-api/dailyBillances s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfDailyBalances(STOCK_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /balances-api/dailyBillances nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Použití normalizační logiky pro ošetření odpovědi ve formě pole ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;
        
        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Kontrolujeme 'pagination' jen pokud původní odpověď nebyl masivní polem
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }

        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} denních uzávěrek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné denní uzávěrky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1219 GET /balances-api/dailyRevenues - Doklady/ poukázané tržby @smoke @API @Critical', async () => {
        const testParams = { 
            year: 2025, 
            month: 8, 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /balances-api/dailyRevenues s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getDailyRevenues(STOCK_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /balances-api/dailyRevenues nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} záznamů o tržbách.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné záznamy o tržbách pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1220 GET /balances-api/turnovers - Doklady/ Účetní uzávěrky @smoke @API @Critical', async () => {
        const testParams = { 
            year: 2025, 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /balances-api/turnovers s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getTurnovers(STOCK_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /balances-api/turnovers nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} účetních uzávěrek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné účetní uzávěrky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1221 GET /reports-api/listOfPosSummaries - Doklady/ Pokladní uzávěrky @smoke @API @Critical', async () => {
        const testParams = { stockId: STOCK_ID, year: 2025, month: 8 };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfPosSummaries s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfPosSummaries(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfPosSummaries nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);
        
        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.length} pokladních uzávěrek.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné pokladní uzávěrky pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1222 GET /reports-api/listOfUsers - Nastavení/ Uživatelé @smoke @API @Critical', async () => {
        const testParams = { 
            accOwner: ACC_OWNER_ID, 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfUsers s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfUsers(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfUsers nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} uživatelů.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné uživatele pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1223 GET /reports-api/listOfRoles - Nastavení/ Šablony pro nastavení práv @smoke @API @Critical', async () => {
        const testParams = { valid: true, scheme: 'cbos' as const };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfRoles s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfRoles(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfRoles nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);
        
        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.length} rolí.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné role pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1224 GET /reports-api/listOfVatClasses - Nastavení/ Správa tříd DPH @smoke @API @Critical', async () => {
        const testParams = { 
            valid: true, 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfVatClasses s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfVatClasses(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfVatClasses nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} tříd DPH.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné třídy DPH pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1225 GET /administration-api/listOfCardDefinitions - Nastavení/ Správa ISO kódů karet @smoke @API @Critical', async () => {
        const testParams = { limit: 10 };
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/listOfCardDefinitions s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfCardDefinitions(ACC_OWNER_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/listOfCardDefinitions nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} definic karet.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné definice karet pro parametry: ${JSON.stringify(testParams)}.`);
        }
    });

    test('TC-1226 GET /socket-api/registeredClients - Socket API/ Registrovaní klienti @smoke @API @Critical', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /socket-api/registeredClients`);

        const response = await apiClient.getRegisteredClients();

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /socket-api/registeredClients nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);
        
        // Zde je v pořádku i 0 klientů, takže jen logujeme počet
        logger.info(`Endpoint úspěšně vrátil ${response.length} registrovaných klientů.`);
    });

    test('TC-1227 GET /reports-api/listOfCardIssuers - Nastavení/ Správa vydavatelů karet @smoke @API @Critical', async () => {
        const testParams = { limit: 10 };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfCardIssuers s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfCardIssuers(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfCardIssuers nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} vydavatelů karet.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné vydavatele karet.`);
        }
    });

  test('TC-1228 GET /reports-api/listOfForeignStocksCCS - Nastavení/ Správa konkurenčních OM - CCS @smoke @API @Critical', async () => {
        const testParams = { limit: 10 };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfForeignStocksCCS s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfForeignStocksCCS(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfForeignStocksCCS nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} konkurenčních OM (CCS).`);
        } else {
            logger.warn(`Endpoint nevrátil žádné konkurenční OM (CCS).`);
        }
    });

    test('TC-1229 GET /administration-api/listOfForeignStocks - Nastavení/ Správa konkurenčních OM @smoke @API @Critical', async () => {
        const testParams = { valid: true, limit: 10 };
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/listOfForeignStocks s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfForeignStocks(ACC_OWNER_ID, STOCK_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/listOfForeignStocks nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} konkurenčních OM.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné konkurenční OM.`);
        }
    });

    test('TC-1230 GET /reports-api/listOfCurrencyRates - Nastavení/ Správa centrálního kurzu EUR @smoke @API @Critical', async () => {
        const testParams = { 
            accOwner: ACC_OWNER_ID, 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfCurrencyRates s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfCurrencyRates(testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfCurrencyRates nesmí být prázdná').toBeDefined();

        // ---- OPRAVA: Přidání normalizační logiky ----
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} kurzů měn.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné kurzy měn.`);
        }
    });

    test('TC-1231 GET /administration-api/stockCardsCategories - Nastavení/ Centrální kategorie zboží @smoke @API @Critical', async () => {
        const testParams = { 
            limit: 10, 
            valid: true 
        };
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/stockCardsCategories s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getStockCardsCategories(ACC_OWNER_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/stockCardsCategories nesmí být prázdná').toBeDefined();

        // Normalizační logika pro zpracování odpovědi ve formě pole i objektu
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} kategorií zboží.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné kategorie zboží.`);
        }
    });

    test('TC-1232 GET /administration-api/stockCardsGroupsCentral - Nastavení/ Centrální skupiny zboží @smoke @API @Critical', async () => {
        const testParams = { 
            limit: 10 
        };
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/stockCardsGroupsCentral s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getStockCardsGroupsCentral(ACC_OWNER_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/stockCardsGroupsCentral nesmí být prázdná').toBeDefined();

        // Normalizační logika pro zpracování odpovědi ve formě pole i objektu
        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} centrálních skupin zboží.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné centrální skupiny zboží.`);
        }
    });

    test('TC-1233 GET /administration-api/fsfeature - Nastavení/ Centrální parametry systému @smoke @API @Critical', async () => {
        const testParams = { withHistory: false };
        logger.trace(`Spouštím test pro endpoint: GET /administration-api/fsfeature s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getFsFeatures(ACC_OWNER_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /administration-api/fsfeature nesmí být prázdná').toBeDefined();
        expect(response, 'Odpověď musí být pole').toBeInstanceOf(Array);
        
        if (response.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${response.length} centrálních parametrů.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné centrální parametry.`);
        }
    });

    test('TC-1339 GET/reports-api/listOfForeignStockPrices - Nastavení/ Ceny konkurenčních cen @smoke @API @Critical', async () => {
        const testParams = { limit: 10 };
        logger.trace(`Spouštím test pro endpoint: GET /reports-api/listOfForeignStockPrices s parametry: ${JSON.stringify(testParams)}`);

        const response = await apiClient.getListOfForeignStocksPrices(STOCK_ID, testParams);

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /reports-api/listOfForeignStockPrices nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} cen konkurenčních OM.`);
        } else {
            logger.warn(`Endpoint nevrátil žádné ceny konkurenčních OM.`);
        }
    });
    
    test('TC-1340 GET /minimalSupply - Minimální zásoba @smoke @API', async () => {
        logger.trace(`Spouštím test pro endpoint: GET /minimalSupply`);

        // Zavoláme metodu API klienta s povinným accOwner a omezíme počet výsledků
        const response = await apiClient.getMinimalSupply(ACC_OWNER_ID, {
            limit: 10,
            stockId: STOCK_ID
        });

        logger.silly('Přijatá odpověď z API:\n' + JSON.stringify(response, null, 2));
        expect(response, 'Odpověď z /minimalSupply nesmí být prázdná').toBeDefined();

        const normalizedResponse = Array.isArray(response)
            ? { data: response, pagination: undefined }
            : response;

        // Klíčová aserce: ověříme, že odpověď obsahuje pole 'data'
        expect(normalizedResponse.data, 'Odpověď musí obsahovat pole "data"').toBeInstanceOf(Array);

        // Pokud odpověď není jen pole, měla by obsahovat i informace o stránkování
        if (!Array.isArray(response)) {
            expect(normalizedResponse.pagination, 'Pokud je odpověď objekt, musí obsahovat "pagination"').toBeDefined();
        }
        
        // Zalogujeme výsledek
        if (normalizedResponse.data.length > 0) {
            logger.info(`Endpoint úspěšně vrátil ${normalizedResponse.data.length} záznamů o minimální zásobě.`);
        } else {
            logger.warn(`Endpoint nevrátil žádná data o minimální zásobě pro accOwner: ${ACC_OWNER_ID} a stockId: ${STOCK_ID}.`);
        }
    });
});     