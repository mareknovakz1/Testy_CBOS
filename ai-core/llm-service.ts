import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from '../support/logger';

// 1. Interface 
export interface AIService {
    findSelector(htmlSnippet: string, elementDescription: string): Promise<string | null>;
}

// 2. Implementace pro Google Gemini
export class GeminiService implements AIService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        logger.debug(`[GeminiService] Inicializuji model "gemini-flash-latest.`);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    }

    async findSelector(htmlSnippet: string, elementDescription: string): Promise<string | null> {
        // Level 2: Debug - Začátek requestu
        logger.debug(`[GeminiService] Odesílám dotaz pro element: "${elementDescription}"`);
        
        // Level 0: Silly - Kontrola velikosti payloadu (HTML může být velké)
        logger.silly(`[GeminiService] Input HTML length: ${htmlSnippet.length} znaků.`);

        try {
            const prompt = `
                Jsi expert na Test Automation a CSS selektory.
                Tvým úkolem je najít unikátní CSS selektor pro popsaný element v HTML snippetu.

                Element hledám: "${elementDescription}"
                
                Zde je HTML:
                ${htmlSnippet}

                Pravidla:
                1. Vrať POUZE samotný selektor (např. "#login-btn" nebo ".user-menu > li:first-child").
                2. Žádné omáčky, žádný markdown (žádné \`\`\`), jen čistý text selektoru.
                3. Pokud element v HTML není, vrať text "NOT_FOUND".
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let selector = response.text().trim();

            logger.trace(`[GeminiService] Raw response: "${selector}"`);

            // Očištění
            selector = selector.replace(/`/g, '').replace('css', '').trim();

            if (selector === "NOT_FOUND" || !selector) {
                // Model fungoval, ale nenašel shodu. Není to chyba API, ale logická chyba.
                logger.warn(`[GeminiService] Model vrátil NOT_FOUND pro: "${elementDescription}"`);
                return null;
            }

            return selector;

        } catch (error) {
            // Selhání sítě, API limit nebo pád modelu
            logger.error(`[GeminiService] Chyba komunikace s API:`, error);
            return null;
        }
    }
}

// 3. Factory funkce
export function getAIService(): AIService {
    const apiKey = process.env.GEMINI_API_KEY;
    
    //Nenalezen API key
    if (!apiKey) {
        logger.fatal(`[GeminiService] Chybí GEMINI_API_KEY v .env souboru!`);
        throw new Error("Chybí GEMINI_API_KEY v .env souboru!");
    }

    return new GeminiService(apiKey);
}