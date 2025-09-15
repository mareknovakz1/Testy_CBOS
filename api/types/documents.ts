/**
 * @file documents.types.ts
 * @author AI Assistant
 * @date 12.09.2025
 * @description
 * Datové kontrakty pro DocumentsApiService.
 * Obsahuje typy pro request payloady a response objekty.
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

export interface CreateOrderItemPayload {
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


export type OrderListResponse = OrderResponse[];
export type OrderItemResponse = GenericApiResponse;



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

export interface CreateGoodsDeliveryNoteItemPayload {
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
export interface CreateGoodsInventoryPayload {
    description?: string;
    stockId: number;
    stockCardId: number;
}

export interface CreateGoodsInventoryItemSupplyPayload {
    goodsInventoryItemId: number;
    amount: number;
    description?: string;
}

export type GoodsInventoryResponse = GenericApiResponse;
export type GoodsInventoryItemResponse = GenericApiResponse;


//================ Receipts ================
export interface GetReceiptsParams {
    receiptId?: number;
    recId?: number;
    recYear?: number;
    format?: 'json' | 'pdf';
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

//================ Orders ================
// ... (předchozí typy zůstávají beze změny)
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

// ... (další typy pro Orders)


//================ Goods Delivery Notes ================
// ... (předchozí typy zůstávají beze změny)
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

// ... (další typy pro Goods Delivery Notes)


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

export type ReceiptResponse = GenericApiResponse;
export type PosSummaryResponse = GenericApiResponse;
export type ReceiptUddResponse = GenericApiResponse;


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


//================ General Types ================
export type GenericApiResponse = Record<string, any>;

export type Format = 'json' | 'pdf';


//================ Orders ================
/**
 * [cite_start]Payload pro vytvoření nové objednávky[cite: 3, 4].
 */
export interface CreateOrderPayload {
    orderDate: string;
    deliveryDate: string;
    ownerId: number;
    ownerName: string;
    supplierId: number;
    supplierName: string;
    transporterId?: number;
    transporterName?: string;
    description?: string;
}

/**
 * [cite_start]Payload pro editaci existující objednávky[cite: 8, 9].
 */
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

/**
 * [cite_start]Payload pro odeslání objednávky[cite: 10, 11].
 */
export interface SendOrderPayload {
    orderId: number;
    email?: string;
    setCommentary?: boolean;
    saveEmail: boolean;
    sendOrder: boolean;
}

/**
 * [cite_start]Payload pro přidání položky do objednávky[cite: 12].
 */
export interface AddOrderItemPayload {
    orderId: number;
    stockCardId: number;
    amount: number;
    supplierGoodsNr?: number;
}

/**
 * [cite_start]Payload pro úpravu položky v objednávce[cite: 13, 14].
 */
export interface UpdateOrderItemPayload {
    orderId: number;
    stockCardId: number;
    amount: number;
    supplierGoodsNr: number;
}

export type OrderResponse = GenericApiResponse;
export type OrderItemListResponse = GenericApiResponse;


//================ Goods Delivery Notes ================
/**
 * [cite_start]Payload pro založení příjemky / výdejky[cite: 15, 16, 17].
 */
export interface CreateGoodsDeliveryNotePayload {
    accOwner: string;
    deliveryDate: string; // ISO formát
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

/**
 * [cite_start]Payload pro editaci hlavičky příjemky / výdejky[cite: 19, 20].
 */
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

/**
 * [cite_start]Tandemová skladová karta pro položku příjemky[cite: 27, 28, 29].
 */
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

/**
 * [cite_start]Payload pro založení položky příjemky[cite: 25, 26, 27].
 */
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

/**
 * [cite_start]Payload pro editaci položky příjemky[cite: 30, 31, 32, 33].
 */
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

export type GoodsDeliveryNoteResponse = GenericApiResponse;
export type GoodsDeliveryNoteItemResponse = GenericApiResponse;
export type VatRecapResponse = GenericApiResponse;


//================ Goods Inventories ================
/**
 * [cite_start]Payload pro založení inventury[cite: 36].
 */
export interface CreateInventoryPayload {
    description?: string;
    stockId: number;
    stockCardId: number;
}

/**
 * [cite_start]Payload pro přidání položky do inventury[cite: 38, 39].
 */
export interface AddInventoryItemSupplyPayload {
    goodsInventoryItemId: number;
    amount: number;
    description?: string;
}

export type InventoryResponse = GenericApiResponse;
export type InventoryItemListResponse = GenericApiResponse;
export type InventoryItemSupplyResponse = GenericApiResponse;
export type InventoryPreviewResponse = GenericApiResponse;


//================ Receipts & Summaries ================
/**
 * [cite_start]Parametry pro načtení detailu účtenky[cite: 42, 43].
 */
export interface GetReceiptsParams {
    receiptId?: number;
    recId?: number;
    recYear?: number;
    format?: Format;
}

/**
 * [cite_start]Parametry pro načtení pokladní uzávěrky[cite: 44].
 */
export interface GetPosSummaryParams {
    format?: Format;
}

/**
 * [cite_start]Parametry pro načtení úplného daňového dokladu[cite: 45].
 */
export interface GetReceiptUddParams {
    format?: Format;
}

/**
 * [cite_start]Payload pro aktualizaci úplného daňového dokladu[cite: 46].
 */
export interface UpdateReceiptUddPayload {
    city?: string;
    company?: string;
    dic?: string;
    ico?: string;
    street?: string;
    zip?: string;
}



//================ Wet Delivery Notes ================
/**
 * [cite_start]Payload pro založení příslušenství k "mokrým" dodacím listům[cite: 48].
 */
export interface CreateWetDeliveryNoteAccessoryPayload {
    itemLabel: string;
    itemType: string;
}

/**
 * [cite_start]Payload pro úpravu příslušenství[cite: 49].
 */
export interface UpdateWetDeliveryNoteAccessoryPayload {
    itemLabel: string;
}

/**
 * [cite_start]Payload pro založení "mokrého" dodacího listu (čerpadláku)[cite: 50, 51, 52].
 */
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

/**
 * [cite_start]Payload pro editaci "mokrého" dodacího listu[cite: 53, 54, 55].
 */
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

/**
 * [cite_start]Payload pro založení inventury pro "mokrý" dodací list[cite: 58, 59, 60].
 */
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

/**
 * [cite_start]Payload pro založení záznamu CaData[cite: 61, 62].
 */
export interface CreateWetDeliveryNoteCaDataPayload {
    caNr?: string;
    fillingStart?: string;
    fillingEnd?: string;
    supplyLt: number;
    supplyLtRef: number;
    temperature?: number;
}

/**
 * [cite_start]Payload pro editaci záznamu CaData[cite: 63].
 */
export interface UpdateWetDeliveryNoteCaDataPayload extends Partial<CreateWetDeliveryNoteCaDataPayload> {}

/**
 * [cite_start]Payload pro založení záznamu o měření[cite: 64, 65, 66].
 */
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

/**
 * [cite_start]Payload pro editaci záznamu o měření[cite: 68, 69].
 */
export interface UpdateWetDeliveryNoteMeasurePayload {
    finish?: boolean;
    measureTimestamp?: string;
    measureType?: string;
    recordType?: string;
    temperature?: number;
    topLeveld?: number; // V dokumentaci je překlep "topLeveld", přebírám jej
    volume?: number;
    volumeRef?: number;
    volumeRefSrc?: number;
    water?: number;
}

/**
 * [cite_start]Payload pro založení záznamu o stavu registrů[cite: 70, 71].
 */
export interface CreateWetDeliveryNoteRegisterPayload {
    dispenserId?: number;
    dispenserRegister?: string;
    dispenserRegisterDate?: string;
    dispenserRegisterSrc?: string;
    noozleId?: number;
    systemRegister?: string;
    systemRegisterDate?: string;
}

/**
 * [cite_start]Payload pro editaci záznamu o stavu registrů[cite: 73].
 */
export interface UpdateWetDeliveryNoteRegisterPayload {
    dispenserRegister?: string;
    dispenserRegisterDate?: string;
}

export type WetDeliveryNoteResponse = GenericApiResponse;
export type WetDeliveryNoteAccessoryResponse = GenericApiResponse;
export type WetDeliveryNoteCaDataResponse = GenericApiResponse;
export type WetDeliveryNoteMeasureResponse = GenericApiResponse;
export type WetDeliveryNoteRegisterResponse = GenericApiResponse;