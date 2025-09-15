/**
 * @file DocumentsApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * Tento soubor obsahuje DocumentsApiService, specializovanou službu pro komunikaci
 * s dokumentačními endpointy API.
 * * @classdesc
 * DocumentsApiService dědí od BaseApiClient a přidává metody specifické pro
 * operace s dokumenty, jako je získání seznamu dokumentů nebo vytvoření nového dokumentu.
 * */

import { BaseApiClient } from '../BaseApiClient';
import * as t from '../types/documents';

export class DocumentsApiService extends BaseApiClient {
    
    // ========================
    // Group: Info
    // ========================

    /**
     * Načtení informací o datech dokumentů pro sklad.
     */
    public async getDocumentsMaxDate(stockId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/info/documentsMaxDate/${stockId}`);
    }

    // ========================
    // Group: Orders
    // ========================

    public async postOrder(stockId: number, payload: t.CreateOrderPayload): Promise<t.OrderResponse> {
        return this.post(`/documents-api/orders/${stockId}`, payload);
    }

     /**
     *  Vytvoření šablony z příjemky[cite: 5].
     */
    public async copyOrderFromDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<t.OrderResponse> {
        return this.post(`/documents-api/orders/copyFromDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     *  Vytvoření šablony z objednávky
     */
    public async copyOrderFromOrder(stockId: number, orderId: number): Promise<t.OrderResponse> {
        return this.post(`/documents-api/orders/copyFromDeliveryNotes/${stockId}/${orderId}`, {});
    }


    //Načtení seznamu SK blížící se k minimální skladové zásobě
    public async getStockCardsWithMinimalSupply(stockId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/listOfStockCardsWithMinimalSupply/${stockId}`);
    }

    /**
     *  Načte detail objednávky
     */
    public async getOrderDetail(stockId: number, orderId: number): Promise<t.OrderResponse> {
        return this.get(`/documents-api/orders/${stockId}/${orderId}`);
    }

    /**
     *  Editace objednávky
     */
    public async updateOrder(stockId: number, orderId: number, payload: t.UpdateOrderPayload): Promise<void> {
        return this.put(`/documents-api/orders/${stockId}/${orderId}`, payload);
    }

    /**
     *  Smaže objednávku
     */
    public async deleteOrder(stockId: number, orderId: number): Promise<void> {
        return this.delete(`/documents-api/orders/${stockId}/${orderId}`);
    }

    /**
     *  Odeslání objednávky
     */
    public async sendOrder(stockId: number, payload: t.SendOrderPayload): Promise<void> {
        return this.put(`/documents-api/orders/ordersSend/${stockId}`, payload);
    }

    /**
     *  Seznam položek objednávky
     */
    public async getOrderItems(stockId: number, orderId: number): Promise<t.OrderItemListResponse> {
        return this.get(`/documents-api/orders/items/${stockId}/${orderId}`);
    }

    /**
     *  Schválení objednávky
     */
    public async approveOrder(stockId: number, orderId: number): Promise<void> {
        return this.put(`/documents-api/orders/valid/${stockId}/${orderId}`, {});
    }

    /**
     *  Přidání položky do objednávky
     */
    public async addOrderItem(stockId: number, payload: t.AddOrderItemPayload): Promise<void> {
        return this.post(`/documents-api/orders/${stockId}`, payload);
    }

    /**
     *  Úprava položky v objednávce
     */
    public async updateOrderItem(stockId: number, ordersItemId: number, payload: t.UpdateOrderItemPayload): Promise<void> {
        return this.put(`/documents-api/ordersItems/${stockId}/${ordersItemId}`, payload);
    }

    
    // ========================
    // Group: GoodsDeliveryNotes
    // ========================
   
    /**
     * 
     * Vytvoře
     */
    public async postGoodsDeliveryNote(stockId: number, payload: t.CreateGoodsDeliveryNotePayload): Promise<t.GoodsDeliveryNoteResponse> {
        return this.post(`/documents-api/goodsDeliveryNotes/${stockId}`, payload);
    }

     // ========================
    // Group: GoodsDeliveryNotes (Chybějící metody)
    // ========================

    /**
     * [cite_start]Vytvoření příjemky na zvoleném OM (Obchodním místě)[cite: 18].
     */
    public async restockGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/restock/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * [cite_start]Editace příjemky/výdejky[cite: 19].
     */
    public async updateGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number, payload: t.UpdateGoodsDeliveryNotePayload): Promise<void> {
        return this.put(`/documents-api/goodsDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`, payload);
    }

    /**
     * [cite_start]Smaže příjemku / výdejku[cite: 20].
     */
    public async deleteGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.delete(`/documents-api/goodsDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`);
    }

    /**
     * [cite_start]Načte položky konkrétní příjemky/výdejky[cite: 21].
     */
    public async getGoodsDeliveryNoteItems(stockId: number, goodsDeliveryNoteId: number): Promise<t.GoodsDeliveryNoteItemResponse> {
        return this.get(`/documents-api/goodsDeliveryNotes/items/${stockId}/${goodsDeliveryNoteId}`);
    }

    /**
     * [cite_start]Načte přehled daní konkrétní příjemky[cite: 22].
     */
    public async getGoodsDeliveryNoteVatRecap(stockId: number, goodsDeliveryNoteId: number): Promise<t.VatRecapResponse> {
        return this.get(`/documents-api/goodsDeliveryNotes/vatRecap/${stockId}/${goodsDeliveryNoteId}`);
    }
    
    /**
     * [cite_start]Naskladnění příjemky[cite: 23].
     */
    public async changeSupplyGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/changeSupply/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * [cite_start]Schválení příjemky[cite: 24].
     */
    public async approveGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/valid/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * [cite_start]Založení položky příjemky[cite: 25].
     */
    public async addGoodsDeliveryNoteItem(stockId: number, payload: t.AddGoodsDeliveryNoteItemPayload): Promise<t.GoodsDeliveryNoteItemResponse> {
        return this.post(`/documents-api/goodsDeliveryNotesItems/${stockId}`, payload);
    }

    /**
     * [cite_start]Editace položky příjemky[cite: 31].
     */
    public async updateGoodsDeliveryNoteItem(stockId: number, goodsDeliveryNotesItemId: number, payload: t.UpdateGoodsDeliveryNoteItemPayload): Promise<void> {
        return this.put(`/documents-api/goodsDeliveryNotesItems/${stockId}/${goodsDeliveryNotesItemId}`, payload);
    }

    /**
     * [cite_start]Smazání položky příjemky[cite: 34].
     */
    public async deleteGoodsDeliveryNoteItem(stockId: number, goodsDeliveryNotesItemId: number): Promise<void> {
        return this.delete(`/documents-api/goodsDeliveryNotesItems/${stockId}/${goodsDeliveryNotesItemId}`);
    }
    
    // ========================
    // Group: GoodsInventories
    // ========================

    /**
     * [cite_start]Založení inventury[cite: 36].
     */
    public async createInventory(payload: t.CreateInventoryPayload): Promise<t.InventoryResponse> {
        return this.post(`/documents-api/goodsInventories`, payload);
    }

    /**
     * [cite_start]Detail inventury[cite: 35].
     */
    public async getInventoryDetail(stockId: number, goodsInventoryId: number): Promise<t.InventoryResponse> {
        return this.get(`/documents-api/goodsInventories/${stockId}/${goodsInventoryId}`);
    }

    /**
     * [cite_start]Smazání inventury[cite: 36].
     */
    public async deleteInventory(stockId: number, goodsInventoryId: number): Promise<void> {
        return this.delete(`/documents-api/goodsInventories/${stockId}/${goodsInventoryId}`);
    }

    /**
     * [cite_start]Načtení seznamu položek inventury[cite: 37].
     */
    public async getInventoryItems(stockId: number, goodsInventoryId: number): Promise<t.InventoryItemListResponse> {
        return this.get(`/documents-api/goodsInventories/items/${stockId}/${goodsInventoryId}`);
    }
    
    /**
     * [cite_start]Přidání položky do inventury[cite: 38].
     */
    public async addInventoryItemSupply(stockId: number, payload: t.AddInventoryItemSupplyPayload): Promise<t.InventoryItemSupplyResponse> {
        return this.post(`/documents-api/goodsInventoriesItemsSupply/${stockId}`, payload);
    }

    /**
     * [cite_start]Smazání položky inventury[cite: 39].
     */
    public async deleteInventoryItemSupply(stockId: number, goodsInventoryItemSupplyId: number): Promise<void> {
        return this.delete(`/documents-api/goodsInventoriesItemsSupply/${stockId}/${goodsInventoryItemSupplyId}`);
    }

    /**
     * [cite_start]Vyvolání kontroly inventury[cite: 40].
     */
    public async getInventoryResultPreview(stockId: number, goodsInventoryId: number): Promise<t.InventoryPreviewResponse> {
        return this.get(`/documents-api/goodsInventories/resultPreview/${stockId}/${goodsInventoryId}`);
    }
    
    /**
     * [cite_start]Vyvolání dokončení inventury[cite: 41].
     */
    public async finalizeInventory(stockId: number, goodsInventoryId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/goodsInventories/finalize/${stockId}/${goodsInventoryId}`);
    }

    /**
     * [cite_start]Získání protokolu o inventuře[cite: 42].
     */
    public async getInventoryProtocol(stockId: number, goodsInventoryId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/goodsInventories/protocol/${stockId}/${goodsInventoryId}`);
    }

    // ========================
    // Group: Receipts & posSummaries
    // ========================
    
    /**
     * Načtení detailu účtenky.
     */
    public async getReceipt(stockId: number, params: t.GetReceiptsParams): Promise<t.ReceiptResponse> {
        return this.get(`/documents-api/receipts/${stockId}`, params);
    }
    
    /**
     * Načtení detailu pokladní uzávěrky.
     */
    public async getPosSummary(stockId: number, posSummaryKey: string, params: t.GetPosSummaryParams = {}): Promise<t.PosSummaryResponse> {
        return this.get(`/documents-api/posSummaries/${stockId}/${posSummaryKey}`, params);
    }

    // ========================
    // Group: receiptUdd (Úplný daňový doklad)
    // ========================

    /**
     * Detail úplného daňového dokladu.
     */
    public async getReceiptUdd(stockId: number, receiptUddId: number, params: t.GetReceiptUddParams = {}): Promise<t.ReceiptUddResponse> {
        return this.get(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}`, params);
    }
    
    /**
     * Update úplného daňového dokladu.
     */
    public async putReceiptUdd(stockId: number, receiptUddId: number, payload: t.UpdateReceiptUddPayload): Promise<void> {
        return this.put(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}`, payload);
    }
    
    /**
     * Stažení PDF úplného daňového dokladu.
     */
    public async getReceiptUddPdf(stockId: number, receiptUddId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}/print`, { format: 'pdf' });
    }
    
    // ========================
    // Group: WetDeliveryNotes Accessories
    // ========================
    
    /**
     * [cite_start]Načtení detailu CaData[cite: 62].
     */
    public async getWetDeliveryNoteCaDataDetail(stockId: number, wetDeliveryNoteId: number, caDataId: number): Promise<t.WetDeliveryNoteCaDataResponse> {
        return this.get(`/documents-api/wetDeliveryNotesCaData/${stockId}/${wetDeliveryNoteId}/${caDataId}`);
    }

    /**
     * [cite_start]Načtení detailu měření[cite: 67].
     */
    public async getWetDeliveryNoteMeasureDetail(stockId: number, wetDeliveryNoteId: number, measureId: number): Promise<t.WetDeliveryNoteMeasureResponse> {
        return this.get(`/documents-api/wetDeliveryNotesMeasures/${stockId}/${wetDeliveryNoteId}/${measureId}`);
    }

    /**
     * [cite_start]Načtení detailu registru[cite: 72].
     */
    public async getWetDeliveryNoteRegisterDetail(stockId: number, wetDeliveryNoteId: number, registerId: number): Promise<t.WetDeliveryNoteRegisterResponse> {
        return this.get(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}/${registerId}`);
    }
    
    /**
     * Smazání registru.
     * POZNÁMKA: V dokumentaci chybí explicitní DELETE pro tento endpoint, ale typicky k PUT/GET/POST existuje i DELETE.
     * Doplňuji na základě konvence. Pokud API metodu nepodporuje, bude vracet chybu.
     */
    public async deleteWetDeliveryNoteRegister(stockId: number, wetDeliveryNoteId: number, registerId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}/${registerId}`);
    }
    
    /**
     * Načtení příslušenství.
     */
    public async getWetDeliveryNotesAccessories(stockId: number): Promise<t.WetDeliveryNoteAccessoryResponse[]> {
        return this.get(`/documents-api/wetDeliveryNotesAccessories/${stockId}`);
    }
    
    /**
     * Založení příslušenství.
     */
    public async postWetDeliveryNotesAccessory(stockId: number, payload: t.CreateWetDeliveryNoteAccessoryPayload): Promise<t.WetDeliveryNoteAccessoryResponse> {
        return this.post(`/documents-api/wetDeliveryNotesAccessories/${stockId}`, payload);
    }
    
    /**
     * Update příslušenství.
     * Poznámka: API používá POST pro update.
     */
    public async postWetDeliveryNotesAccessoryUpdate(stockId: number, accessoryId: number, payload: t.UpdateWetDeliveryNoteAccessoryPayload): Promise<void> {
        return this.post(`/documents-api/wetDeliveryNotesAccessories/${stockId}/${accessoryId}`, payload);
    }

    // ========================
    // Group: WetDeliveryNotes
    // ========================

    /**
     * Založení "mokrého" dodacího listu.
     */
    public async postWetDeliveryNote(stockId: number, payload: t.CreateWetDeliveryNotePayload): Promise<t.WetDeliveryNoteResponse> {
        return this.post(`/documents-api/wetDeliveryNotes/${stockId}`, payload);
    }
    
    /**
     * Detail "mokrého" dodacího listu.
     */
    public async getWetDeliveryNote(stockId: number, wetDeliveryNoteId: number): Promise<t.WetDeliveryNoteResponse> {
        return this.get(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`);
    }

    /**
     * Editace "mokrého" dodacího listu.
     */
    public async putWetDeliveryNote(stockId: number, wetDeliveryNoteId: number, payload: t.UpdateWetDeliveryNotePayload): Promise<void> {
        return this.put(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`, payload);
    }
    
    /**
     * Vyřazení (smazání) "mokrého" dodacího listu.
     */
    public async deleteWetDeliveryNote(stockId: number, wetDeliveryNoteId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`);
    }

    /**
     * Založení inventury "mokrého" dodacího listu.
     */
    public async postWetDeliveryNoteInventory(stockId: number, payload: t.CreateWetDeliveryNoteInventoryPayload): Promise<t.WetDeliveryNoteResponse> {
        return this.post(`/documents-api/wetDeliveryNotesInventory/${stockId}`, payload);
    }

    // --- WetDeliveryNotes Sub-resources ---

    public async getWetDeliveryNoteCaDataList(stockId: number, wetDeliveryNoteId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/wetDeliveryNotes/caData/${stockId}/${wetDeliveryNoteId}`);
    }

    public async getWetDeliveryNoteMeasuresList(stockId: number, wetDeliveryNoteId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/wetDeliveryNotes/measures/${stockId}/${wetDeliveryNoteId}`);
    }

    public async getWetDeliveryNoteRegistersList(stockId: number, wetDeliveryNoteId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/wetDeliveryNotes/registers/${stockId}/${wetDeliveryNoteId}`);
    }
    
    // --- CaData ---
    public async postWetDeliveryNoteCaData(stockId: number, wetDeliveryNoteId: number, payload: t.CreateWetDeliveryNoteCaDataPayload): Promise<t.WetDeliveryNoteCaDataResponse> {
        return this.post(`/documents-api/wetDeliveryNotesCaData/${stockId}/${wetDeliveryNoteId}`, payload);
    }

    public async putWetDeliveryNoteCaData(stockId: number, wetDeliveryNoteId: number, caDataId: number, payload: t.UpdateWetDeliveryNoteCaDataPayload): Promise<t.WetDeliveryNoteCaDataResponse> {
        return this.put(`/documents-api/wetDeliveryNotesCaData/${stockId}/${wetDeliveryNoteId}/${caDataId}`, payload);
    }
    
    public async deleteWetDeliveryNoteCaData(stockId: number, wetDeliveryNoteId: number, caDataId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotesCaData/${stockId}/${wetDeliveryNoteId}/${caDataId}`);
    }
    
    // --- Measures ---
    public async postWetDeliveryNoteMeasure(stockId: number, wetDeliveryNoteId: number, payload: t.CreateWetDeliveryNoteMeasurePayload): Promise<t.WetDeliveryNoteMeasureResponse> {
        return this.post(`/documents-api/wetDeliveryNotesMeasures/${stockId}/${wetDeliveryNoteId}`, payload);
    }

    public async putWetDeliveryNoteMeasure(stockId: number, wetDeliveryNoteId: number, measureId: number, payload: t.UpdateWetDeliveryNoteMeasurePayload): Promise<t.WetDeliveryNoteMeasureResponse> {
        return this.put(`/documents-api/wetDeliveryNotesMeasures/${stockId}/${wetDeliveryNoteId}/${measureId}`, payload);
    }

    public async deleteWetDeliveryNoteMeasure(stockId: number, wetDeliveryNoteId: number, measureId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotesMeasures/${stockId}/${wetDeliveryNoteId}/${measureId}`);
    }

    // --- Registers ---
    public async postWetDeliveryNoteRegister(stockId: number, wetDeliveryNoteId: number, payload: t.CreateWetDeliveryNoteRegisterPayload): Promise<t.WetDeliveryNoteRegisterResponse> {
        return this.post(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}`, payload);
    }
    
    public async putWetDeliveryNoteRegister(stockId: number, wetDeliveryNoteId: number, registerId: number, payload: t.UpdateWetDeliveryNoteRegisterPayload): Promise<t.WetDeliveryNoteRegisterResponse> {
        return this.put(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}/${registerId}`, payload);
    }

    // --- Actions ---

    /**
     * Naskladnění.
     */
    public async postWetDeliveryNoteChangeSupply(stockId: number, wetDeliveryNoteId: number): Promise<t.GenericApiResponse> {
        return this.post(`/documents-api/wetDeliveryNotes/changeSupply/${stockId}/${wetDeliveryNoteId}`, {});
    }

    /**
     * Schválení.
     */
    public async postWetDeliveryNoteValid(stockId: number, wetDeliveryNoteId: number, params?: { procesOfConversion: string }): Promise<t.GenericApiResponse> {
        // Playwright posílá 'params' jako query string automaticky, pokud je metoda GET. Pro POST je potřeba je přidat do URL manuálně.
        const endpoint = `/documents-api/wetDeliveryNotes/valid/${stockId}/${wetDeliveryNoteId}`;
        const urlWithParams = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
        return this.post(urlWithParams, {});
    }
}