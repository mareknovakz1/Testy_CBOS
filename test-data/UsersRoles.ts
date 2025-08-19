/**
* Seznam uživatelů pro jednotlivé role a jejich práva.
* Číslo v komentu, označuje pozici.
*/

//Práva    
export class RolePermissions {
    // Dashboard
    dashboardList = false; // Zobrazení položky v menu
    dashboardCreate = false; // Možnost vytvoření / přidání
    dashboardTableMarginReport = false; // Přirážky a marže PHM
    dashboardTableSalesReport = false; // Průběžná denní tržba

    // Stocks
    stocksList = false; // 0
    stocksDetail = false; // 0
    stocksModify = false; // 0
    stocksCreate = false; // 0
    stocksCreateAuxiliaryStorage = false; // 0
    stocksErp = false; // 0
    stocksChangeProduct = false; // 0
    stocksStockFeatures = false; // 0
    stocksDownloadStockParameters = false; // 0
    stockCardsList = false; // 1
    stockCardsDetail = false; // 1
    stockCardsModify = false; // 1
    stockCardsCreate = false; // 1
    stockCardsExport = false; // 1
    stockCardsApprovalRequiredLocal = false; // 1
    stockCardsDeleteFromAllStockCards = false; // 1
    stockCardsChangeDryGoods = false; // 1
    stockCardsChangeOwner = false; // 1
    stockCardsChangePrice = false; // 1
    stockCardsStockCardDistribute = false; // 1
    stockCardsChangePriceWet = false; // 1
    stockCardsTransferLocalToCentral = false; // 1
    stockCardsChangeWetGoods = false; // 1
    stockCardsForAllStocks = false; // 1
    stockCardsMassList = false; // 2
    stockCardsMassModify = false; // 2
    stockCardsMassChangeOwner = false; // 2
    stockCardsMassChangePrice = false; // 2
    stockCardsMassStockCardDistribute = false; // 2
    stockCardsMassChangeCategories = false; // 2
    stockCardsMassChangeGoodsGroup = false; // 2
    stockCardsMassChangeLocalGroups = false; // 2
    stockCardsMassChangeMinimalSupply = false; // 2
    stockCardsMassChangeVatClass = false; // 2
    stockCardsMassChangeCtClass = false; // 2
    stockCardsGroupsLocalList = false; // 3
    stockCardsGroupsLocalModify = false; // 3
    stockCardsGroupsLocalCreate = false; // 3
    hotKeysDefinitionsList = false; // 4
    hotKeysDefinitionsModify = false; // 4
    hotKeysDefinitionsCreate = false; // 4

    // Store
    partnersList = false; // 0
    partnersDetail = false; // 0
    partnersModify = false; // 0
    partnersCreate = false; // 0
    partnersExport = false; // 0
    partnersTransactions = false; // 0
    localCardsList = false; // 1
    localCardsDetail = false; // 1
    localCardsModify = false; // 1
    localCardsCreate = false; // 1
    localCardsExport = false; // 1
    priceCategoriesList = false; // 2
    priceCategoriesDetail = false; // 2
    priceCategoriesModify = false; // 2
    priceCategoriesCreate = false; // 2
    euroOilCardList = false; // 3
    euroOilCardCreate = false; // 3
    bonusSystemList = false; // 4
    bonusSystemDetail = false; // 4
    bonusSystemModify = false; // 4
    bonusSystemCreate = false; // 4
    bonusSystemStatus = false; // 4

    // Reports
    reportsList = false; // 0
    reportsDetail = false; // 0
    reportsModify = false; // 0
    reportsCreate = false; // 0
    reportsExport = false; // 0
    supplyBalanceOverviewList = false; // 1
    supplyBalanceOverviewCreate = false; // 1
    supplyBalanceOverviewExport = false; // 1
    wetPriceListOverviewList = false; // 2
    wetPriceListOverviewExport = false; // 2

    // Documents
    receiptsList = false; // 0
    receiptsDetail = false; // 0
    receiptsExport = false; // 0
    receiptsUddList = false; // 1
    receiptsUddDetail = false; // 1
    receiptsUddExport = false; // 1
    posTankTicketsList = false; // 2
    posTankTicketsExport = false; // 2
    posMoneyOperationsList = false; // 3
    posMoneyOperationsExport = false; // 3
    posTankVouchersList = false; // 4
    posTankVouchersExport = false; // 4
    goodsDeliveryNotesList = false; // 5
    goodsDeliveryNotesDetail = false; // 5
    goodsDeliveryNotesModify = false; // 5
    goodsDeliveryNotesCreate = false; // 5
    goodsDeliveryNotesExport = false; // 5
    goodsDeliveryNotesValid = false; // 5
    inventoryList = false; // 6
    inventoryDetail = false; // 6
    inventoryModify = false; // 6
    inventoryCreate = false; // 6
    inventoryExport = false; // 6
    inventoryFinalize = false; // 6
    goodsOrdersList = false; // 7
    goodsOrdersDetail = false; // 7
    goodsOrdersModify = false; // 7
    goodsOrdersCreate = false; // 7
    goodsOrdersExport = false; // 7
    goodsOrdersValid = false; // 7
    wetDeliveryNotesList = false; // 8
    wetDeliveryNotesDetail = false; // 8
    wetDeliveryNotesModify = false; // 8
    wetDeliveryNotesCreate = false; // 8
    wetDeliveryNotesExport = false; // 8
    wetDeliveryNotesValid = false; // 8
    wetDeliveryNotesChangePurchPrice = false; // 8
    wetDeliveryNotesRemoveAutomatRecords = false; // 8

    // Financial
    dailyBilancesList = false; // 0
    dailyBilancesModify = false; // 0
    dailyBilancesCreate = false; // 0
    dailyBilancesExport = false; // 0
    dailyRevenueList = false; // 1
    dailyRevenueModify = false; // 1
    dailyRevenueCreate = false; // 1
    turnoversList = false; // 2
    turnoversModify = false; // 2
    turnoversCreate = false; // 2
    turnoversExport = false; // 2
    posSummariesList = false; // 3
    posSummariesDetail = false; // 3
    posSummariesExport = false; // 3

    // Settings
    usersList = false; // 0
    usersDetail = false; // 0
    usersModify = false; // 0
    usersCreate = false; // 0
    usersMenu = false; // 0
    usersSetAccount = false; // 0
    usersSetRight = false; // 0
    usersSetUserCard = false; // 0
    roleTemplatesList = false; // 1
    roleTemplatesCreate = false; // 1
    vatClassesList = false; // 2
    vatClassesDetail = false; // 2
    vatClassesModify = false; // 2
    vatClassesCreate = false; // 2
    ctClassesList = false; // 3
    ctClassesDetail = false; // 3
    ctClassesModify = false; // 3
    ctClassesCreate = false; // 3
    cardIssuersList = false; // 4
    cardIssuersDetail = false; // 4
    cardIssuersModify = false; // 4
    cardIssuersCreate = false; // 4
    cardDefitionsList = false; // 5
    foreignStocksList = false; // 6
    foreignStocksModify = false; // 6
    foreignStocksCreate = false; // 6
    foreignStocksCCSList = false; // 7
    foreignStocksCCSModify = false; // 7
    foreignStocksCCSCreate = false; // 7
    currencyRateList = false; // 8
    currencyRateModify = false; // 8
    currencyRateCreate = false; // 8
    currencyRateExport = false; // 8
    stockCardsCategoriesList = false; // 9
    stockCardsCategoriesModify = false; // 9
    stockCardsCategoriesCreate = false; // 9
    stockCardsGroupsCentralList = false; // 10
    stockCardsGroupsCentralModify = false; // 10
    stockCardsGroupsCentralCreate = false; // 10
    stockCentralFeaturesList = false; // 11
    stockCentralFeaturesDetail = false; // 11
    stockCentralFeaturesModify = false; // 11
    stockCentralFeaturesCreate = false; // 11
}

export interface TestUser {
    id: number;
    name: string;
    scale: number; // Předpokládám, že toto je nějaké měřítko nebo typ
    permissions: RolePermissions;
    password?: string; // Heslo je volitelné
}

// Vytvořte funkce pro generování uživatelů 
function createTestUser(overrides: {
    id?: number;
    name?: string;
    permissions?: Partial<RolePermissions>; // Partial<T> znamená, že můžeme přepsat jen některá práva
    password?: string;
}): TestUser {
    // Vytvoříme novou sadu práv, kde je vše 'false'
    const defaultPermissions = new RolePermissions();

    // Spojíme výchozí práva s těmi, které chcete přepsat
    const finalPermissions = { ...defaultPermissions, ...overrides.permissions };

    return {
        id: overrides.id ?? 1,
        name: overrides.name ?? 'Test User',
        scale: 1,
        permissions: finalPermissions,
        password: overrides.password
    };
}

// 1. Uživatel se všemi právy
const adminAtm = createTestUser({
    name: 'ADMIN_ATM',
    password: '1',
    permissions: {
        dashboardList: true,
        dashboardCreate: true,
        dashboardTableMarginReport: true,
        dashboardTableSalesReport: true
    }
});

