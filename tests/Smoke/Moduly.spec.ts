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
        expect(typeof response[tableToQuery], `Hodnota pro "${tableToQuery}" musí být číslo`).toBe('number');
        expect(response[tableToQuery], `Počet záznamů pro "${tableToQuery}" musí být 0 nebo více`).toBeGreaterThanOrEqual(0);

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
});