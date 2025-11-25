/**
 * @file DocumentsApiService.ts
 * @author Marek Novák
 * @date 11.09.2025
 * @description
 * This file contains DocumentsApiService, a specialized service for communicating
 * with the document-related API endpoints.
 * * @classdesc
 * DocumentsApiService extends BaseApiClient and adds methods specific to
 * document operations, such as fetching a list of documents or creating a new one.
 * */

import { BaseApiClient } from '../BaseApiClient';
import * as t from '../types/documents';

export class DocumentsApiService extends BaseApiClient {

    // ========================
    // Group: Info
    // ========================

    /**
     * Loads information about the latest document dates for a stock.
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
     * Creates a template from a delivery note.
     */
    public async copyOrderFromDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<t.OrderResponse> {
        return this.post(`/documents-api/orders/copyFromDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * Creates a template from an order.
     */
    public async copyOrderFromOrder(stockId: number, orderId: number): Promise<t.OrderResponse> {
        return this.post(`/documents-api/orders/copyFromDeliveryNotes/${stockId}/${orderId}`, {});
    }


    // Loads a list of stock cards approaching their minimum stock level.
    public async getStockCardsWithMinimalSupply(stockId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/listOfStockCardsWithMinimalSupply/${stockId}`);
    }

    /**
     * Loads the details of an order.
     */
    public async getOrderDetail(stockId: number, orderId: number): Promise<t.OrderResponse> {
        return this.get(`/documents-api/orders/${stockId}/${orderId}`);
    }

    /**
     * Edits an order.
     */
    public async updateOrder(stockId: number, orderId: number, payload: t.UpdateOrderPayload): Promise<void> {
        return this.put(`/documents-api/orders/${stockId}/${orderId}`, payload);
    }

    /**
     * Deletes an order.
     */
    public async deleteOrder(stockId: number, orderId: number): Promise<void> {
        return this.delete(`/documents-api/orders/${stockId}/${orderId}`);
    }

    /**
     * Sends an order.
     */
    public async sendOrder(stockId: number, payload: t.SendOrderPayload): Promise<void> {
        return this.put(`/documents-api/orders/ordersSend/${stockId}`, payload);
    }

    /**
     * List of order items.
     */
    public async getOrderItems(stockId: number, orderId: number): Promise<t.OrderItemListResponse> {
        return this.get(`/documents-api/orders/items/${stockId}/${orderId}`);
    }

    /**
     * Approves an order.
     */
    public async approveOrder(stockId: number, orderId: number): Promise<void> {
        return this.post(`/documents-api/orders/valid/${stockId}/${orderId}`, {});
    }

    public async postOrderItems(stockId: number, payload: t.AddOrderItemPayload, orderId?: number): Promise<any> {
    const url = orderId 
        ? `/documents-api/ordersitems/${stockId}/${orderId}` 
        : `/documents-api/ordersitems/${stockId}`;

    return this.post(url, payload);
}
    /**
     * Updates an item in an order.
     */
    public async updateOrderItem(stockId: number, ordersItemId: number, payload: t.UpdateOrderItemPayload): Promise<void> {
        return this.put(`/documents-api/ordersItems/${stockId}/${ordersItemId}`, payload);
    }

    /**
     * Deletes an item from an order.
     * [MISSING ENDPOINT ADDED]
     */
    public async deleteOrderItem(stockId: number, ordersItemId: number): Promise<void> {
        return this.delete(`/documents-api/ordersItems/${stockId}/${ordersItemId}`);
    }


    // ========================
    // Group: GoodsDeliveryNotes
    // ========================

    /**
     * Creates a goods delivery note.
     */
    public async postGoodsDeliveryNote(stockId: number, payload: t.CreateGoodsDeliveryNotePayload): Promise<t.GoodsDeliveryNoteResponse> {
        return this.post(`/documents-api/goodsDeliveryNotes/${stockId}`, payload);
    }

    /**
     * Loads the details of a goods delivery note.
     * [MISSING ENDPOINT ADDED]
     */
    public async getGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<t.GoodsDeliveryNoteResponse> {
        return this.get(`/documents-api/goodsDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`);
    }

    // ========================
    // Group: GoodsDeliveryNotes (Missing methods)
    // ========================

    /**
     * Creates a delivery note at the selected stock (business location).
     */
    public async restockGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/restock/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * Edits a goods delivery note.
     */
    public async updateGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number, payload: t.UpdateGoodsDeliveryNotePayload): Promise<void> {
        return this.put(`/documents-api/goodsDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`, payload);
    }

    /**
     * Deletes a goods delivery note.
     */
    public async deleteGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.delete(`/documents-api/goodsDeliveryNotes/${stockId}/${goodsDeliveryNoteId}`);
    }

    /**
     * Loads the items of a specific goods delivery note.
     */
    public async getGoodsDeliveryNoteItems(stockId: number, goodsDeliveryNoteId: number): Promise<t.GoodsDeliveryNoteItemResponse> {
        return this.get(`/documents-api/goodsDeliveryNotes/items/${stockId}/${goodsDeliveryNoteId}`);
    }

    /**
     * Loads the tax summary for a specific delivery note.
     */
    public async getGoodsDeliveryNoteVatRecap(stockId: number, goodsDeliveryNoteId: number): Promise<t.VatRecapResponse> {
        return this.get(`/documents-api/goodsDeliveryNotes/vatRecap/${stockId}/${goodsDeliveryNoteId}`);
    }

    /**
     * Performs stock-in for a delivery note.
     */
    public async changeSupplyGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/changeSupply/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * Approves a delivery note.
     */
    public async approveGoodsDeliveryNote(stockId: number, goodsDeliveryNoteId: number): Promise<void> {
        return this.post(`/documents-api/goodsDeliveryNotes/valid/${stockId}/${goodsDeliveryNoteId}`, {});
    }

    /**
     * Creates a delivery note item.
     */
    public async addGoodsDeliveryNoteItem(stockId: number, payload: t.AddGoodsDeliveryNoteItemPayload): Promise<t.GoodsDeliveryNoteItemResponse> {
        return this.post(`/documents-api/goodsDeliveryNotesItems/${stockId}`, payload);
    }

    /**
     * Edits a delivery note item.
     */
    public async updateGoodsDeliveryNoteItem(stockId: number, goodsDeliveryNotesItemId: number, payload: t.UpdateGoodsDeliveryNoteItemPayload): Promise<void> {
        return this.put(`/documents-api/goodsDeliveryNotesItems/${stockId}/${goodsDeliveryNotesItemId}`, payload);
    }

    /**
     * Deletes a delivery note item.
     */
    public async deleteGoodsDeliveryNoteItem(stockId: number, goodsDeliveryNotesItemId: number): Promise<void> {
        return this.delete(`/documents-api/goodsDeliveryNotesItems/${stockId}/${goodsDeliveryNotesItemId}`);
    }

    // ========================
    // Group: GoodsInventories
    // ========================

    /**
     * Creates an inventory.
     */
    public async createInventory(payload: t.CreateInventoryPayload): Promise<t.InventoryResponse> {
        return this.post(`/documents-api/goodsInventories`, payload);
    }

    /**
     * Inventory details.
     */
    public async getInventoryDetail(stockId: number, goodsInventoryId: number): Promise<t.InventoryResponse> {
        return this.get(`/documents-api/goodsInventories/${stockId}/${goodsInventoryId}`);
    }

    /**
     * Edits inventory details.
     * [MISSING ENDPOINT ADDED]
     */
    public async updateInventory(stockId: number, goodsInventoryId: number, payload: t.CreateInventoryPayload): Promise<void> {
        return this.put(`/documents-api/goodsInventories/${stockId}/${goodsInventoryId}`, payload);
    }

    /**
     * Deletes an inventory.
     */
    public async deleteInventory(stockId: number, goodsInventoryId: number): Promise<void> {
        return this.delete(`/documents-api/goodsInventories/${stockId}/${goodsInventoryId}`);
    }

    /**
     * Loads the list of inventory items.
     */
    public async getInventoryItems(stockId: number, goodsInventoryId: number): Promise<t.InventoryItemListResponse> {
        return this.get(`/documents-api/goodsInventories/items/${stockId}/${goodsInventoryId}`);
    }

    /**
     * Adds an item to an inventory.
     */
    public async addInventoryItemSupply(stockId: number, payload: t.AddInventoryItemSupplyPayload): Promise<t.InventoryItemSupplyResponse> {
        return this.post(`/documents-api/goodsInventoriesItemsSupply/${stockId}`, payload);
    }

    /**
     * Edits an item in an inventory.
     * [MISSING ENDPOINT ADDED]
     */
    public async updateInventoryItemSupply(stockId: number, goodsInventoryItemSupplyId: number, payload: t.AddInventoryItemSupplyPayload): Promise<void> {
        return this.put(`/documents-api/goodsInventoriesItemsSupply/${stockId}/${goodsInventoryItemSupplyId}`, payload);
    }

    /**
     * Deletes an inventory item.
     */
    public async deleteInventoryItemSupply(stockId: number, goodsInventoryItemSupplyId: number): Promise<void> {
        return this.delete(`/documents-api/goodsInventoriesItemsSupply/${stockId}/${goodsInventoryItemSupplyId}`);
    }

    /**
     * Initiates an inventory check/preview.
     */
    public async getInventoryResultPreview(stockId: number, goodsInventoryId: number): Promise<t.InventoryPreviewResponse> {
        return this.get(`/documents-api/goodsInventories/resultPreview/${stockId}/${goodsInventoryId}`);
    }

    /**
     * Initiates the finalization of an inventory.
     */
    public async finalizeInventory(stockId: number, goodsInventoryId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/goodsInventories/finalize/${stockId}/${goodsInventoryId}`);
    }

    /**
     * Gets the inventory protocol/report.
     */
    public async getInventoryProtocol(stockId: number, goodsInventoryId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/goodsInventories/protocol/${stockId}/${goodsInventoryId}`);
    }

    // ========================
    // Group: Receipts & posSummaries
    // ========================

    /**
     * Loads receipt details.
     */
    public async getReceipt(stockId: number, params: t.GetReceiptsParams): Promise<t.ReceiptResponse> {
        return this.get(`/documents-api/receipts/${stockId}`, params);
    }

    /**
     * Loads POS summary details.
     */
    public async getPosSummary(stockId: number, posSummaryKey: string, params: t.GetPosSummaryParams = {}): Promise<t.PosSummaryResponse> {
        return this.get(`/documents-api/posSummaries/${stockId}/${posSummaryKey}`, params);
    }

    // ========================
    // Group: receiptUdd (Full Tax Document)
    // ========================

    /**
     * Full tax document details.
     */
    public async getReceiptUdd(stockId: number, receiptUddId: number, params: t.GetReceiptUddParams = {}): Promise<t.ReceiptUddResponse> {
        return this.get(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}`, params);
    }

    /**
     * Updates the full tax document.
     */
    public async putReceiptUdd(stockId: number, receiptUddId: number, payload: t.UpdateReceiptUddPayload): Promise<void> {
        return this.put(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}`, payload);
    }

    /**
     * Downloads the PDF of the full tax document.
     */
    public async getReceiptUddPdf(stockId: number, receiptUddId: number): Promise<t.GenericApiResponse> {
        return this.get(`/documents-api/receiptsUdd/${stockId}/${receiptUddId}/print`, { format: 'pdf' });
    }

    // ========================
    // Group: WetDeliveryNotes Accessories
    // ========================

    /**
     * Loads CaData details.
     */
    public async getWetDeliveryNoteCaDataDetail(stockId: number, wetDeliveryNoteId: number, caDataId: number): Promise<t.WetDeliveryNoteCaDataResponse> {
        return this.get(`/documents-api/wetDeliveryNotesCaData/${stockId}/${wetDeliveryNoteId}/${caDataId}`);
    }

    /**
     * Loads measurement details.
     */
    public async getWetDeliveryNoteMeasureDetail(stockId: number, wetDeliveryNoteId: number, measureId: number): Promise<t.WetDeliveryNoteMeasureResponse> {
        return this.get(`/documents-api/wetDeliveryNotesMeasures/${stockId}/${wetDeliveryNoteId}/${measureId}`);
    }

    /**
     * Loads register details.
     */
    public async getWetDeliveryNoteRegisterDetail(stockId: number, wetDeliveryNoteId: number, registerId: number): Promise<t.WetDeliveryNoteRegisterResponse> {
        return this.get(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}/${registerId}`);
    }

    /**
     * Deletes a register.
     * NOTE: The documentation is missing an explicit DELETE for this endpoint, but typically a DELETE exists
     * alongside PUT/GET/POST. Adding it based on convention. If the API doesn't support this method, it will return an error.
     */
    public async deleteWetDeliveryNoteRegister(stockId: number, wetDeliveryNoteId: number, registerId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotesRegisters/${stockId}/${wetDeliveryNoteId}/${registerId}`);
    }

    /**
     * Loads accessories.
     */
    public async getWetDeliveryNotesAccessories(stockId: number): Promise<t.WetDeliveryNoteAccessoryResponse[]> {
        return this.get(`/documents-api/wetDeliveryNotesAccessories/${stockId}`);
    }

    /**
     * Creates an accessory.
     */
    public async postWetDeliveryNotesAccessory(stockId: number, payload: t.CreateWetDeliveryNoteAccessoryPayload): Promise<t.WetDeliveryNoteAccessoryResponse> {
        return this.post(`/documents-api/wetDeliveryNotesAccessories/${stockId}`, payload);
    }

    /**
     * Updates an accessory.
     * Note: The API uses POST for updates.
     */
    public async postWetDeliveryNotesAccessoryUpdate(stockId: number, accessoryId: number, payload: t.UpdateWetDeliveryNoteAccessoryPayload): Promise<void> {
        return this.post(`/documents-api/wetDeliveryNotesAccessories/${stockId}/${accessoryId}`, payload);
    }

    /**
     * Deletes an accessory.
     * [MISSING ENDPOINT ADDED]
     */
    public async deleteWetDeliveryNotesAccessory(stockId: number, accessoryId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotesAccessories/${stockId}/${accessoryId}`);
    }


    // ========================
    // Group: WetDeliveryNotes
    // ========================

    /**
     * Creates a "wet" delivery note (for liquids/fuel).
     */
    public async postWetDeliveryNote(stockId: number, payload: t.CreateWetDeliveryNotePayload): Promise<t.WetDeliveryNoteResponse> {
        return this.post(`/documents-api/wetDeliveryNotes/${stockId}`, payload);
    }

    /**
     * Details of a "wet" delivery note.
     */
    public async getWetDeliveryNote(stockId: number, wetDeliveryNoteId: number): Promise<t.WetDeliveryNoteResponse> {
        return this.get(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`);
    }

    /**
     * Edits a "wet" delivery note.
     */
    public async putWetDeliveryNote(stockId: number, wetDeliveryNoteId: number, payload: t.UpdateWetDeliveryNotePayload): Promise<void> {
        return this.put(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`, payload);
    }

    /**
     * Discards (deletes) a "wet" delivery note.
     */
    public async deleteWetDeliveryNote(stockId: number, wetDeliveryNoteId: number): Promise<void> {
        return this.delete(`/documents-api/wetDeliveryNotes/${stockId}/${wetDeliveryNoteId}`);
    }

    /**
     * Creates an inventory for a "wet" delivery note.
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
     * Stock-in.
     */
    public async postWetDeliveryNoteChangeSupply(stockId: number, wetDeliveryNoteId: number): Promise<t.GenericApiResponse> {
        return this.post(`/documents-api/wetDeliveryNotes/changeSupply/${stockId}/${wetDeliveryNoteId}`, {});
    }

    /**
     * Approval.
     */
    public async postWetDeliveryNoteValid(stockId: number, wetDeliveryNoteId: number, params?: { procesOfConversion: string }): Promise<t.GenericApiResponse> {
        // Playwright automatically sends 'params' as a query string for GET methods. For POST, they need to be added to the URL manually.
        const endpoint = `/documents-api/wetDeliveryNotes/valid/${stockId}/${wetDeliveryNoteId}`;
        const urlWithParams = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
        return this.post(urlWithParams, {});
    }
}