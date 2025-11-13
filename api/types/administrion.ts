/**
 * @file administration.types.ts
 * @author Marek Novák
 * @date 29.09.2025
 * @description
 * Data contracts for AdministrationApiService.
 * Contains types for request payloads and response objects.
 */

// ========================
// General & Generic Types
// ========================

export type GenericApiResponse = Record<string, any>;

export interface StatusResponse {
    app_name: string;
    status: string;
    version: string;
    postgres: string;
}


// ========================
// Parameters
// ========================

// Responses are generic objects
export type ErpParametersResponse = GenericApiResponse;
export type AccountsParametersResponse = GenericApiResponse;


// ========================
// Excise Duty & VAT Classes
// ========================

export interface CreateCtClassPayload {
    specification: string;
    value: number;
    startValid: string; // ISO Date
    ckncs?: string;
}

export interface CreateCtClassRatePayload {
    specification: string;
    value: number;
    startValid: string; // ISO Date
    ckncs?: string;
}

export interface UpdateCtClassRatePayload {
    value: number;
    startValid: string; // ISO Date
    ckncs?: string;
}

export interface CreateVatClassPayload {
    specification: string;
    value: number;
    startValid: string; // ISO Date
}

export interface CreateVatRatePayload {
    value: number;
    startValid: string; // ISO Date
}

export interface UpdateVatRatePayload {
    value: number;
    startValid: string; // ISO Date
}


// ========================
// Stocks (Business Locations)
// ========================

export interface CreateStockPayload {
    id: number;
    accOwner: string;
    text: string;
    city: string;
    street: string;
    zip: string;
    country: string;
    regNrMpo?: string;
    erpStockType?: string;
    supplyToMinus: boolean;
    valid: boolean;
    erpEnabled: boolean;
    erpPrepare: boolean;
    franchiserId?: number;
    dryGoodsOwnerId?: number;
    drySupplierId?: number;
    dryTransporterId?: number;
    wetGoodsOwnerId?: number;
    wetSupplierId?: number;
    wetTransporterId?: number;
    partners?: any[];
    erpCostCenter?: string;
    erpExtId?: string;
    erpName?: string;
    patternStock?: boolean;
    restrictedMode?: boolean;
    auxiliaryStorage?: boolean;
    evigneteSalespointId?: string;
}

export interface UpdateStockPayload extends Partial<Omit<CreateStockPayload, 'id'>> {
    erpAccountantEmail?: string;
    erpBalancesOrdIn?: string;
    erpBalancesOrdOut?: string;
    erpConnectedDate?: string;
    erpDryCardAccount?: string;
    erpDryCardCost?: string;
    erpDryCardYield?: string;
    erpGoodsDeliveryNotesDelDry?: string;
    erpGoodsDeliveryNotesDelDryAcc?: string;
    erpGoodsDeliveryNotesRecDry?: string;
    erpReceiptsSalCrd?: string;
    erpReceiptsSalFk?: string;
    erpReceiptsSalMon?: string;
    erpServiceCost?: string;
    erpServiceYield?: string;
    erpWetCardAccount?: string;
    erpWetCardCost?: string;
    erpWetCardYield?: string;
    erpWetDeliveryNotesDelWet?: string;
    erpWetDeliveryNotesDelWetAcc?: string;
    erpWetDeliveryNotesRecWet?: string;
}


// ========================
// fsFeature
// ========================

export interface CreateFsFeaturePayload {
    accOwner: string;
    feature: string;
    featureValue: string;
    startValid?: string; // ISO Date
    endValid?: string;   // ISO Date
    tag: string;
}

export interface UpdateFsFeaturePayload {
    accOwner: string;
    feature: string;
    featureValue: string;
    startValid?: string; // ISO Date
    endValid?: string;   // ISO Date
}

export interface CreateCentralFsFeaturePayload {
    feature: string;
    featureValue: string;
    startValid?: string; // ISO Date
    endValid?: string;   // ISO Date
    tag: string;
}

export interface UpdateCentralFsFeaturePayload {
    featureValue?: string;
    startValid?: string; // ISO Date
    endValid?: string;   // ISO Date
}


// ========================
// Euro-Oil Card Request
// ========================

export interface CreateEuroOilCardRequestPayload {
    stockId: number;
    name: string;
    email: string;
    phone: string;
    city: string;
    consumption: number;
}


// ========================
// Partners
// ========================

export interface PartnerStatus {
    franchiser: boolean;
    drySupplier: boolean;
    wetSupplier: boolean;
    goodsOwner: boolean;
    transporter: boolean;
    partnerStocks: number[];
    stocks: number[];
}

export interface CreatePartnerPayload {
    accOwner: string;
    company: string;
    isImported?: boolean;
    ico?: string;
    dic?: string;
    street?: string;
    city: string;
    zip: string;
    email?: string;
    phone?: string;
    country?: string;
    bankAccount: string;
    bankCode?: string;
    iban?: string;
    sapNr?: number;
    ownerFs?: boolean;
    franchiser?: boolean;
    ownerGoods?: boolean;
    supplierDry?: boolean;
    supplierWet?: boolean;
    transporter?: boolean;
    valid?: boolean;
    regOr?: string;
    priceCategoryId?: number;
    allStocks?: boolean;
    stocks?: number[];
    ceproId?: string;
    sapId?: string;
    selfUsage?: boolean;
    groupInterval?: any[];
    groupIntervalUnlimited?: boolean;
}

export interface UpdatePartnerPayload extends CreatePartnerPayload {
    creditUnlimited?: boolean;
    creditAmount?: number;
    balanceAutomatic?: boolean;
    balanceEmail?: string;
    balanceInterval?: string;
    balanceFixDay?: number;
}

export interface AddPaymentPayload {
    amount: number;
    description?: string;
    paymentDate?: string; // ISO Date
}


// ========================
// Hot Keys & Terminals
// ========================

interface HotKeyLanguage {
    language: string;
    text: string;
}

export interface CreateHotKeyPayload {
    posTerminalKey: string;
    keyNumber: number;
    stockCardId: string;
    guiColor?: string;
    guiText?: string;
    guiTextSubtitle?: string;
    modal: boolean;
    dashboard: boolean;
    backgroundColor: boolean;
    showPrice: boolean;
    iconFile?: string;
    languages?: HotKeyLanguage[];
}

export interface UpdateHotKeyPositionsPayload {
    definitions: {
        id: number;
        keyNumber: number;
    }[];
}

export interface UpdateHotKeyPayload extends Omit<CreateHotKeyPayload, 'posTerminalKey' | 'keyNumber'> {}


// ========================
// Users & Roles
// ========================

export interface CreateUserPayload {
    accounts: any[];
    accountsUnlimited: boolean;
    cardNumber: string;
    cbosRoleId: number;
    cbosScale: number;
    email: string;
    gposRoleId: number;
    lang: string;
    name: string;
    operator: string;
    password?: string;
    passwordReset: boolean;
    perPage: number;
    pin: string;
    reloadInit: boolean;
    stocks: any[];
    stocksUnlimited: boolean;
    valid: boolean;
    validPos: boolean;
    cbosRights?: GenericApiResponse;
    gposRights?: GenericApiResponse;
}

export interface UpdateUserPayload extends Omit<CreateUserPayload, 'operator' | 'password' | 'cbosRights' | 'gposRights'> {}

export interface UpdateUserRightsPayload {
    roleId: number;
    scale: number;
    rights: GenericApiResponse;
}


// ========================
// Mass Actions
// ========================

export interface ChangePricePreviewPayload {
    changeType: 'P' | 'M' | 'C';
    value: number;
    salePriceStartDate: string; // ISO Date
    stockCardsId: number[];
    rounding: 'H' | 'F' | 'N';
}


// ========================
// WebSocket
// ========================

export interface WebSocketEventParams {
    type: 'RELOAD' | 'LOGOUT';
    module?: string;
    operator?: string;
    accOwner?: string;
    all?: boolean;
    logoutReason?: string;
}

// ========================
// Lokální nadskupiny zboží
// ========================

export interface stockCardsSupergroupsLocal {
    offset: number;
    limit: number;
    sort?: string;
}

// ========================
// Lokální nadskupiny zboží
// ========================

export interface stockCardgroupsLocal {
    offset: number;
    limit: number;
    sort?: string;
}


// Interface for one item in the list
export interface CardDefinition {
  id: number;
  name: string;
  iso: string;
  // ... add other properties returned in the list
}

// Interface for the query parameters
export interface GetListOfCardDefinitionsParams {
  offset?: number;
  limit?: number;
  sort?: string;
  // ... add any other optional query params
}

export interface CardDefinition {
    id: number;
    iso: string;
    cardName: string;
    issuerCardType: string;
    startValid: string; // ISO datum
    endValid: string | null; // ISO datum
    updated: string; // ISO datum
    // ... a další pole
}