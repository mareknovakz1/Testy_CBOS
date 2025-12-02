/**
 * @file Prijemky_life_cycle_regrese.spec.ts
 * @description Regresní E2E testy pro životní cyklus příjemky (Goods Delivery Note).
 */

import { test, expect } from '../../../../support/fixtures/auth.fixture';
import { logger } from '../../../../support/logger';
import { ACC_OWNER_ID } from '../../../../support/constants';
import allDeliveryData from '../../../../test-data/Prijemky_life_cycle_regrese.json';
import * as t from '../../../../api/types/documents';

// -------------------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------------------

// Univerzální typ pro data kroku (rozšířený o specifika příjemek)
type StepData = {
    action: string;
    name?: string;
    description?: string;
    tags?: string[];
    stockId?: number;
    ownerId?: number;
    supplierId?: number;
    supplierName?: string;
    year?: number;
    params?: any; // Pro search params
    amount?: number;
    supplyPrice?: number; // Specifické pro příjemku
    expectationState?: string;
};

// Kontext pro sdílení stavu mezi kroky
interface TestContext {
    apiClient: any;
    uniqueDescription: string;
    createdDeliveryNoteId?: number;
    foundStockCardId?: number;
    createdItemId?: number;
}

// -------------------------------------------------------------------------
// REGISTR KROKŮ (MAPPING)
// -------------------------------------------------------------------------

const STEP_REGISTRY: Record<string, (ctx: TestContext, data: StepData) => Promise<void>> = {
    "CreateDeliveryNote": createDeliveryNote,
    "GetDeliveryNotesList": verifyDeliveryNoteList,
    "GetStockCard": getStockCard,
    "AddDeliveryNoteItem": addDeliveryNoteItem,
    "GetDeliveryNoteItems": getDeliveryNoteItems,
    "ChangeSupply": changeSupply,
    "ApproveDeliveryNote": approveDeliveryNote,
    "DeleteDeliveryNote": deleteDeliveryNote
};

// -------------------------------------------------------------------------
// STEP FUNCTIONS
// -------------------------------------------------------------------------

/** Krok: Vytvoření příjemky (POST /goodsDeliveryNotes) */
async function createDeliveryNote(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        const payload = {
            deliveryDate: new Date().toISOString(),
            description: ctx.uniqueDescription,
            stockId: stepData.stockId!,
            supplierId: stepData.supplierId!,
            supplierName: stepData.supplierName!,
            // Další povinná pole pro příjemku, pokud jsou potřeba
            documentType: 1
        };

        logger.debug(`Vytvářím příjemku: ${JSON.stringify(payload)}`);
        
        // Volání metody z DocumentsApiService
        const response = await ctx.apiClient.documents.postGoodsDeliveryNote(stepData.stockId!, payload);
        
        // API obvykle vrací objekt s ID, nebo musíme ID zjistit z listu (záleží na implementaci postGoodsDeliveryNote)
        if (response && response.id) {
            ctx.createdDeliveryNoteId = response.id;
            logger.info(`Krok OK: Příjemka vytvořena. ID: ${ctx.createdDeliveryNoteId}`);
        } else {
            // Fallback, pokud API nevrací ID přímo (některé verze API vrací jen 201)
            logger.warn("API nevrátilo ID příjemky přímo. Bude nutné ho dohledat v seznamu.");
        }
    });
}

/** Krok: Ověření v seznamu a získání ID (GET /reports-api/listOfGoodsDeliveryNotes) */
async function verifyDeliveryNoteList(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        // Parametry dle tvého URL requestu
        const params = {
            stockId: stepData.stockId,
            year: stepData.year || 2025,
            accOwner: ACC_OWNER_ID || "60193531",
            documentType: 1,
            limit: 100,
            sort: '-documentLabel'
        };

        // Předpokládám existenci metody v reports službě. 
        // Pokud neexistuje, použijte: await ctx.apiClient.get('/reports-api/listOfGoodsDeliveryNotes', params);
        const response = await ctx.apiClient.reports.getListOfGoodsDeliveryNotes(params);
        
        // Hledáme podle našeho unikátního popisu
        const foundDoc = response.find((doc: any) => doc.description === ctx.uniqueDescription || doc.erpExtNumber === ctx.uniqueDescription);

        if (foundDoc) {
            ctx.createdDeliveryNoteId = foundDoc.id;
            logger.info(`Krok OK: Příjemka nalezena v seznamu. ID: ${ctx.createdDeliveryNoteId}`);
        } else {
            // Pokud jsme ID získali už při vytvoření, jen ověříme existenci
            if (ctx.createdDeliveryNoteId) {
                 const exists = response.some((doc: any) => doc.id === ctx.createdDeliveryNoteId);
                 expect(exists, "Příjemka s ID z vytvoření nebyla nalezena v seznamu.").toBeTruthy();
            } else {
                throw new Error(`Příjemka s popisem ${ctx.uniqueDescription} nebyla nalezena.`);
            }
        }
    });
}

/** Krok: Hledání skladové karty (GET /reports-api/listOfStockCards) */
async function getStockCard(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        if (!stepData.params) throw new Error("Chybí params pro vyhledání karty.");
        
        // Doplnění dynamic dates pokud jsou v JSONu potřeba, jinak bere z JSON
        const response = await ctx.apiClient.reports.getListOfStockCards(
            String(ACC_OWNER_ID || "60193531"), 
            stepData.stockId!, 
            stepData.params
        );

        // Zjednodušené hledání prvního výsledku, nebo podle přesné shody
        const searchStr = String(stepData.params.search).toLowerCase();
        const foundCard = response.find((card: any) => 
            String(card.name).toLowerCase().includes(searchStr) || 
            String(card.plu) === searchStr
        );

        if (!foundCard) throw new Error(`Karta '${stepData.params.search}' nenalezena.`);
        
        ctx.foundStockCardId = foundCard.id;
        logger.info(`Krok OK: StockCard ID: ${ctx.foundStockCardId} (${foundCard.name})`);
    });
}

/** Krok: Přidání položky (POST /goodsDeliveryNotesItems) */
async function addDeliveryNoteItem(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        if (!ctx.createdDeliveryNoteId) throw new Error("Chybí ID příjemky.");
        if (!ctx.foundStockCardId) throw new Error("Chybí ID skladové karty.");

        const payload = {
            goodsDeliveryNoteId: ctx.createdDeliveryNoteId,
            stockCardId: ctx.foundStockCardId,
            amount: stepData.amount ?? 1,
            supplyPrice: stepData.supplyPrice ?? 10 // Cena je u příjemky důležitá
        };

        await ctx.apiClient.documents.addGoodsDeliveryNoteItem(stepData.stockId!, payload);
        logger.info(`Krok OK: Položka přidána.`);
    });
}

/** Krok: Získání položek pro ověření (GET items) */
async function getDeliveryNoteItems(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        const response = await ctx.apiClient.documents.getGoodsDeliveryNoteItems(stepData.stockId!, ctx.createdDeliveryNoteId!);
        
        // Normalizace response (pole vs objekt .data)
        const items = Array.isArray(response) ? response : (response as any).data || [];
        
        // Najdeme poslední přidanou
        const foundItem = items.find((item: any) => item.stockCardId === ctx.foundStockCardId);
        if (foundItem) {
            ctx.createdItemId = foundItem.id;
            logger.info(`Krok OK: Položka nalezena, ID: ${ctx.createdItemId}`);
        } else {
            throw new Error("Položka nebyla nalezena v seznamu položek příjemky.");
        }
    });
}

/** Krok: Naskladnění - Change Supply (POST /changeSupply) */
async function changeSupply(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        if (!ctx.createdDeliveryNoteId) throw new Error("Chybí ID příjemky.");

        logger.debug(`Provádím naskladnění (Change Supply) pro příjemku ${ctx.createdDeliveryNoteId}`);
        
        // Volání metody z DocumentsApiService
        await ctx.apiClient.documents.changeSupplyGoodsDeliveryNote(stepData.stockId!, ctx.createdDeliveryNoteId);
        
        logger.info(`Krok OK: Příjemka naskladněna.`);
    });
}

/** Krok: Validace - Approve (POST /valid) */
async function approveDeliveryNote(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        if (!ctx.createdDeliveryNoteId) throw new Error("Chybí ID příjemky.");
        
        logger.debug(`Validuji příjemku ${ctx.createdDeliveryNoteId}`);

        // Volání metody z DocumentsApiService
        await ctx.apiClient.documents.approveGoodsDeliveryNote(stepData.stockId!, ctx.createdDeliveryNoteId);
        
        logger.info(`Krok OK: Příjemka schválena (Valid).`);
    });
}

/** Krok: Smazání příjemky (DELETE) */
async function deleteDeliveryNote(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        if (!ctx.createdDeliveryNoteId) throw new Error("Chybí ID příjemky.");
        
        logger.debug(`Mažu příjemku ${ctx.createdDeliveryNoteId}`);
        
        await ctx.apiClient.documents.deleteGoodsDeliveryNote(stepData.stockId!, ctx.createdDeliveryNoteId);
        
        logger.info(`Krok OK: Příjemka smazána.`);
    });
}

// -------------------------------------------------------------------------
// MAIN TEST LOOP
// -------------------------------------------------------------------------

logger.info('Spouštím regresní testy pro životní cyklus příjemek (Delivery Notes).');

for (const testCaseKey of Object.keys(allDeliveryData)) {
    const rawData = allDeliveryData[testCaseKey as keyof typeof allDeliveryData] as any;
    const tags = rawData.tags || [];
    const tagsString = (tags.length > 0) ? ` ${tags.join(' ')}` : '';
    const testTitle = `${testCaseKey}: ${rawData.caseName || 'Unnamed'} ... ${tagsString}`;

    test(testTitle, async ({ apiClient }) => {
        logger.info(`Spouštím test: ${testCaseKey}`);

        const context: TestContext = {
            apiClient,
            uniqueDescription: `AutoTest_GDN_${Date.now()}`
        };

        if (!rawData.steps) {
            logger.warn(`Test case ${testCaseKey} nemá kroky.`);
            return;
        }

        const stepKeys = Object.keys(rawData.steps).sort();

        for (const stepKey of stepKeys) {
            const stepData = rawData.steps[stepKey];
            const actionName = stepData.action;

            if (!actionName) throw new Error(`Krok '${stepKey}' nemá 'action'.`);

            const actionFunction = STEP_REGISTRY[actionName];

            if (actionFunction) {
                await actionFunction(context, stepData);
            } else {
                logger.warn(`Akce '${actionName}' nenalezena v registru.`);
            }
        }
    });
}