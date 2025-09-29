/**
 * @file documents.types.ts
 * @author AI Assistant
 * @date 12.09.2025
 * @description
 * Data contracts for DocumentsApiService.
 * Contains types for request payloads and response objects.
 */

//================ Orders ================
export interface CreateOrderPayload {
    orderDate: string; // "2024-12-01"
    deliveryDate: string; // "2024-12-10"
    ownerId: number;
    ownerName: string;
    supplierId: number;
    supplierName: string;
    transporterId?: number;
    transporterName?: string;
    description?: string;
}

export interface UpdateOrderPayload {
    orderDate: string;
    deliveryDate?: string;
    ownerId: number;
    ownerName: string;
    supplierId: number;
    supplierName: string;
    transporterId?: number;
    transporterName?: string;
    description?: string;
    commentary?: string;
}

export interface SendOrderPayload {
    orderId: number;
    email?: string;
    setCommentary?: boolean;
    saveEmail: boolean;
    sendOrder: boolean;
}

export interface AddOrderItemPayload {
    orderId: number;
    stockCardId: number;
    amount: number;
    supplierGoodsNr?: number;
}

export interface UpdateOrderItemPayload {
    orderId: number;
    stockCardId: number;
    amount: number;
    supplierGoodsNr: number;
}


//================ Goods Delivery Notes ================
export interface CreateGoodsDeliveryNotePayload {
    accOwner: string;
    deliveryDate: string; // "2024-12-31T12:00:00.000Z"
    deliveryNoteNr?: string;
    documentType: number;
    documentSubType: number;
    stockId: number;
    sign: '+' | '-';
    ownerId: number;
    targetStock?: number;
    ownerName?: string;
    supplierId?: number;
    supplierName?: string;
    transporterId?: number;
    transporterName?: string;
}

export interface UpdateGoodsDeliveryNotePayload {
    deliveryDate?: string;
    deliveryNoteNr?: string;
    documentType?: number;
    documentSubType?: number;
    targetStock?: number;
    supplierId?: number;
    supplierName?: string | null;
    transporterId?: number;
    transporterName?: string;
}

export interface TandemStockCard {
    stockCardId: number;
    stockCardName: string;
    stockCardExtId?: number;
    amount: number;
    purchPrice: number;
    newSalePriceWithoutVat?: number;
    newSalePriceWithVat?: number;
    vatValue: number;
    vatClsId: number;
    itemVat: number;
    itemPrice: number;
    itemPriceWithVat: number;
    plu: string;
}

export interface AddGoodsDeliveryNoteItemPayload {
    goodsDeliveryNoteId: number;
    stockCardId: number;
    stockCardName: string;
    newEan?: string;
    stockCardExtId?: number;
    amount: number;
    purchPrice: number;
    newSalePriceWithoutVat?: number;
    newSalePriceWithVat?: number;
    vatValue: number;
    vatClsId: number;
    itemVat: number;
    itemPrice: number;
    itemPriceWithVat: number;
    plu: string;
    tandemStockCard?: TandemStockCard;
}

export interface UpdateGoodsDeliveryNoteItemPayload {
    goodsDeliveryNoteId: number;
    stockCardId: number;
    amount: number;
    purchPrice: number;
    newSalePriceWithoutVat?: number;
    newSalePriceWithVat?: number;
    itemVat: number;
    itemPrice: number;
    itemPriceWithVat: number;
    tandemStockCard?: {
        stockCardId: number;
        id: number;
        amount: number;
        purchPrice: number;
        itemVat: number;
        itemPrice: number;
        itemPriceWithVat: number;
    };
}


//================ Goods Inventories ================
export interface CreateInventoryPayload {
    description?: string;
    stockId: number;
    stockCardId: number;
}

export interface AddInventoryItemSupplyPayload {
    goodsInventoryItemId: number;
    amount: number;
    description?: string;
}

/**
 * Payload pro editaci existující inventury.
 */
export interface UpdateInventoryPayload {
    description?: string;
    stockId: number;
    stockCardId: number;
}

/**
 * Payload pro editaci existující položky v inventuře.
 */
export interface UpdateInventoryItemSupplyPayload {
    goodsInventoryItemId: number;
    amount: number;
    description?: string;
}



//================ Receipts & Summaries ================
export interface GetReceiptsParams {
    receiptId?: number;
    recId?: number;
    recYear?: number;
    format?: Format;
}

export interface GetPosSummaryParams {
    format?: Format;
}

export interface GetReceiptUddParams {
    format?: Format;
}

export interface UpdateReceiptUddPayload {
    city?: string;
    company?: string;
    dic?: string;
    ico?: string;
    street?: string;
    zip?: string;
}


//================ Wet Delivery Notes ================
export interface CreateWetDeliveryNoteAccessoryPayload {
    itemLabel: string;
    itemType: string;
}

export interface UpdateWetDeliveryNoteAccessoryPayload {
    itemLabel: string;
}

export interface CreateWetDeliveryNotePayload {
    accOwner: string;
    deliveryDate: string;
    deliveryNoteNr?: string;
    documentType: string;
    recordType: string;
    stockCardId: number;
    stockCardName: string;
    loadingPlaceId?: number;
    loadingPlace?: string;
    supplierId?: number;
    supplierName?: string;
    supplierDic?: string;
    tankId: number;
    tandemCode?: string;
    driverId?: number;
    driverName?: string;
    trailerNr?: string;
    carNr?: string;
    transporterId?: number;
    transporterName?: string;
    transporterDic?: string;
}

export interface UpdateWetDeliveryNotePayload {
    deliveryDate?: string;
    deliveryNoteNr?: string;
    loadingPlaceId?: number;
    loadingPlace?: string;
    supplierId?: number;
    supplierName?: string;
    supplierDic?: string;
    driverId?: number;
    driverName?: string;
    trailerNr?: string;
    carNr?: string;
    transporterId?: number;
    transporterName?: string;
    transporterDic?: string;
    finalSupplyLt?: number;
    purchPrice?: number;
    supplyLtLoad?: number;
    supplyLtLoadRef?: number;
}

export interface CreateWetDeliveryNoteInventoryPayload {
    accOwner: string;
    deliveryDate: string;
    documentType: string;
    recordType: string;
    stockCardId: number;
    stockCardName: string;
    supplierId?: number;
    supplierName?: string;
    supplierDic?: string;
    tandemCode?: string;
    tank: {
        tankId: number;
        tandem?: number;
    };
}

export interface CreateWetDeliveryNoteCaDataPayload {
    caNr?: string;
    fillingStart?: string;
    fillingEnd?: string;
    supplyLt: number;
    supplyLtRef: number;
    temperature?: number;
}

export interface UpdateWetDeliveryNoteCaDataPayload extends Partial<CreateWetDeliveryNoteCaDataPayload> {}

export interface CreateWetDeliveryNoteMeasurePayload {
    finish?: boolean;
    measureTimestamp?: string;
    measureType?: string;
    recordType: string;
    stockCardId: number;
    stockCardErpExtId?: number;
    stockCardName: string;
    tankId: number;
    temperature?: number;
    topLevel?: number;
    volume?: number;
    volumeRef?: number;
    volumeRefSrc?: number;
    water?: number;
}

export interface UpdateWetDeliveryNoteMeasurePayload {
    finish?: boolean;
    measureTimestamp?: string;
    measureType?: string;
    recordType?: string;
    temperature?: number;
    topLeveld?: number;
    volume?: number;
    volumeRef?: number;
    volumeRefSrc?: number;
    water?: number;
}

export interface CreateWetDeliveryNoteRegisterPayload {
    dispenserId?: number;
    dispenserRegister?: string;
    dispenserRegisterDate?: string;
    dispenserRegisterSrc?: string;
    noozleId?: number;
    systemRegister?: string;
    systemRegisterDate?: string;
}

export interface UpdateWetDeliveryNoteRegisterPayload {
    dispenserRegister?: string;
    dispenserRegisterDate?: string;
}


//================ General & Response Types ================
export type GenericApiResponse = Record<string, any>;
export type Format = 'json' | 'pdf';

// --- Response Type Aliases ---
export type OrderResponse = GenericApiResponse;
export type OrderItemListResponse = GenericApiResponse;
export type GoodsDeliveryNoteResponse = GenericApiResponse;
export type GoodsDeliveryNoteItemResponse = GenericApiResponse;
export type VatRecapResponse = GenericApiResponse;
export type InventoryResponse = GenericApiResponse;
export type InventoryItemListResponse = GenericApiResponse;
export type InventoryItemSupplyResponse = GenericApiResponse;
export type InventoryPreviewResponse = GenericApiResponse;
export type ReceiptResponse = GenericApiResponse;
export type PosSummaryResponse = GenericApiResponse;
export type ReceiptUddResponse = GenericApiResponse;
export type WetDeliveryNoteResponse = GenericApiResponse;
export type WetDeliveryNoteAccessoryResponse = GenericApiResponse;
export type WetDeliveryNoteCaDataResponse = GenericApiResponse;
export type WetDeliveryNoteMeasureResponse = GenericApiResponse;
export type WetDeliveryNoteRegisterResponse = GenericApiResponse;