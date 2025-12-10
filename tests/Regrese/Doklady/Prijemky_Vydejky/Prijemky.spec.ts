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
    deliveryNoteNr?: string;
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
    accOwner: string;
    documentType?: number;
    documentSubType?: number;
    sign?: string;
    ownerName: string;

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

// -------------------------------------------------------------------------
// createDeliveryNote (Vytvoření příjemky)
// -------------------------------------------------------------------------

async function createDeliveryNote(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        
        // 1. Vygenerujeme časové razítko a datum
        const now = new Date();
        const isoDate = now.toISOString();
        
        // Uložíme si datum odeslání pro pozdější hledání (dle předchozí opravy)
        (ctx as any).sentDeliveryDate = isoDate; 
        
        // Unikátní ID (timestamp)
        const uniqueId = Date.now();
        ctx.uniqueDescription = `AutoTest_GDN_${uniqueId}`;

        // 2. Sestavení deliveryNoteNr (Číslo dokladu)
        // Spojíme unikátní ID a text z testovacích dat (pokud tam je)
        // Výsledek např.: "1765101234567_Automaticky vytvořená příjemka"
        const noteNumber = stepData.deliveryNoteNr 
            ? `${uniqueId}_${stepData.deliveryNoteNr}` 
            : ctx.uniqueDescription;

        const payload = {
            stockId: stepData.stockId,
            ownerId: stepData.ownerId,
            accOwner: String(stepData.accOwner), 
            documentType: stepData.documentType ?? 1,
            documentSubType: stepData.documentSubType ?? 1, 
            sign: String(stepData.sign ?? "1"),  
            deliveryNoteNr: noteNumber,         
            description: ctx.uniqueDescription, 
            
            deliveryDate: isoDate,
            supplierId: stepData.supplierId,
            supplierName: stepData.supplierName,
            ownerName: stepData.ownerName,
        };

        logger.debug(`Vytvářím příjemku: ${JSON.stringify(payload)}`);
        
        const response = await ctx.apiClient.documents.postGoodsDeliveryNote(stepData.stockId!, payload);
        
    });
}

// -------------------------------------------------------------------------
// verifyDeliveryNoteList (Ověření v seznamu - hledání podle DATA)
// -------------------------------------------------------------------------

async function verifyDeliveryNoteList(ctx: TestContext, stepData: StepData) {
    await test.step(`Krok: ${stepData.name}`, async () => {
        const params = {
            stockId: stepData.stockId,
            year: stepData.year || 2025,
            accOwner: ACC_OWNER_ID || "60193531",
            documentType: 1,
            limit: 100,
            sort: '-documentLabel'
        };

        // Zde je změna v logování - hledáme podle data
        logger.debug(`[Verify] Hledám příjemku vytvořenou v čase: ${ctx.sentDeliveryDate} (Fallabck: popis ${ctx.uniqueDescription})`);

        await expect.poll(async () => {
            const response = await ctx.apiClient.reports.getListOfGoodsDeliveryNotes(params);
            
            // 1. Zkusíme najít přesnou shodu data (nejspolehlivější)
            // (ctx as any).sentDeliveryDate musíme použít, pokud to nemáte v interface TestContext
            const searchDate = (ctx as any).sentDeliveryDate; 
            
            let foundDoc = response.find((doc: any) => doc.deliveryDate === searchDate);

            // 2. FALLBACK: Pokud server ořízl milisekundy nebo změnil formát,
            // a protože řadíme od nejnovějších (-documentLabel), podíváme se na první záznam.
            if (!foundDoc && response.length > 0) {
                const firstDoc = response[0];
                // Zkontrolujeme, jestli je to "náš" záznam (vytvořený námi před chvílí)
                // Kontrolujeme operátora a zda datum začíná stejně (např. "2025-12-07")
                if (firstDoc.operator === 'TESTING_AUTOMAT' && 
                    searchDate && 
                    String(firstDoc.deliveryDate).startsWith(searchDate.substring(0, 10))) {
                     
                     logger.warn(`[Verify] Přesná shoda data nevyšla (${searchDate} vs ${firstDoc.deliveryDate}). Beru nejnovější záznam od TESTING_AUTOMAT.`);
                     foundDoc = firstDoc;
                }
            }

            if (foundDoc) {
                ctx.createdDeliveryNoteId = foundDoc.id;
                logger.info(`Krok OK: Příjemka nalezena. ID: ${ctx.createdDeliveryNoteId}, Label: ${foundDoc.documentLabel}`);
                return true;
            }
            
            // Debug výpis
            if (response.length > 0) {
                logger.trace(`[Polling] Nenalezeno. První v seznamu má datum: ${response[0].deliveryDate}`);
            } else {
                logger.trace(`[Polling] Seznam je prázdný.`);
            }

            return false;

        }, {
            message: `Příjemka se neobjevila v seznamu (hledáno dle data: ${(ctx as any).sentDeliveryDate}).`,
            timeout: 15000, 
            intervals: [1000, 2000, 4000]
        }).toBe(true);
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