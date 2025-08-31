/**
 * Smoke test příjemky
 * Test provede objednání 1 kusu zboží, vytvoření příjemky, kontrolu stavu skladu.
 * POST /documents-api/goodsDeliveryNotes/{stockId}
 * GET reports-api/listOfStocks
 */

import { ApiClient } from "../../support/ApiClient";
import { logger } from "../../support/logger";
import { expect, test } from '../../support/fixtures/auth.fixture';
import { ACC_OWNER_ID } from "../../support/constants";

const OWNER_ID_NUM = parseInt(ACC_OWNER_ID, 10);

test.describe("Regrese API - Životní cyklus příjemky", () => {

    let apiClient: ApiClient;

    test.beforeEach(async ({ request, authToken }) => {
        logger.info('Zahajuji API smoke test suite...');
        expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
        apiClient = new ApiClient(request, authToken);
        logger.info('ApiClient byl úspěšně inicializován s autorizačním tokenem.');
    });

    // Konstanty pro testování
    const STOCK_ID_STR = '230'; // ID skladu pro suché zboží
    const STOCK_ID_NUM = 230;
    const ITEM_ID = '10'; // ID položky zboží pro příjemku
    const ORDERED_QUANTITY = 1;
    const UNIT_PRICE = 100.0;

    test('Životní cyklus příjemky - vytvoření a kontrola stavu skladu @smoke @API @high @delivery', async () => {
        logger.info('--- Začátek testu: Životní cyklus příjemky ---');

        // Krok 1: Získání počátečního stavu skladu
        logger.info(`Krok 1: Získání počátečního stavu skladu (ID skladu: ${STOCK_ID_STR})`);
        const initialStockState = await apiClient.getListOfStocks({ stockId: STOCK_ID_STR });
        expect(initialStockState, 'Počáteční stav skladu by měl být dostupný').toBeTruthy();

        const initialItem = initialStockState.find((item: any) => item.id === ITEM_ID);
        expect(initialItem, `Položka s ID ${ITEM_ID} by měla být nalezena ve skladu`).toBeTruthy();
        const initialQuantity = initialItem ? initialItem.quantity : 0;
        logger.info(`Počáteční množství položky ID ${ITEM_ID} ve skladu: ${initialQuantity}`);

        // Krok 2: Vytvoření příjemky
        logger.info(`Krok 2: Vytvoření příjemky pro položku ID ${ITEM_ID} s množstvím ${ORDERED_QUANTITY}`);
        
        const deliveryNotePayload = {
            accOwner: ACC_OWNER_ID,
            deliveryNoteNr: `TEST-PR-${Date.now()}`,
            documentType: 1, // Corrected type: number
            documentSubType: 1, // Corrected type: number
            deliveryDate: new Date().toISOString(), // Corrected type: full ISO string
            stockId: STOCK_ID_NUM, // Corrected type: number
            ownerId: OWNER_ID_NUM, // Corrected type: number
            ownerName: 'Test Owner Name',
            supplierId: 500, // Corrected type: number
            supplierName: 'Test Supplier Name',
            transporterId: 1, // Corrected type: number
            transporterName: 'Test Transporter',
            sign: 'Test Signature',

            // NOTE: The following fields are not in the provided interface,
            // but are logically required for the test to function.
            // They may be part of a larger, extended interface.
            note: 'Automaticky vytvořená příjemka pro testování',
            items: [
                {
                    itemId: ITEM_ID,
                    quantity: ORDERED_QUANTITY,
                    price: UNIT_PRICE
                }
            ]
        };

        const createdDeliveryNote = await apiClient.createGoodsDeliveryNote(STOCK_ID_STR, deliveryNotePayload);
        expect(createdDeliveryNote, 'Příjemka by měla být úspěšně vytvořena').toBeTruthy();
        expect(createdDeliveryNote.id, 'Vytvořená příjemka by měla mít ID').toBeTruthy();
        logger.info(`Příjemka byla vytvořena s ID: ${createdDeliveryNote.id}`);

        // Krok 3: Ověření stavu skladu po vytvoření příjemky
        logger.info(`Krok 3: Ověření stavu skladu po vytvoření příjemky`);
        const updatedStockState = await apiClient.getListOfStocks({ stockId: STOCK_ID_STR });
        expect(updatedStockState, 'Aktualizovaný stav skladu by měl být dostupný').toBeTruthy();

        const updatedItem = updatedStockState.find((item: any) => item.id === ITEM_ID);
        expect(updatedItem, `Položka s ID ${ITEM_ID} by měla být nalezena ve skladu`).toBeTruthy();
        const updatedQuantity = updatedItem ? updatedItem.quantity : 0;
        logger.info(`Aktualizované množství položky ID ${ITEM_ID} ve skladu: ${updatedQuantity}`);

        // Kontrola, že množství položky je správně aktualizováno
        expect(updatedQuantity).toBe(initialQuantity + ORDERED_QUANTITY);
        logger.info('Množství položky ve skladu bylo úspěšně aktualizováno po vytvoření příjemky.');
        logger.info('--- Konec testu: Životní cyklus příjemky ---');
    });
});