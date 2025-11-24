import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../support/logger';

const REPO_PATH = path.join(__dirname, '..', 'locators-repo');

interface LocatorData {
    selector: string;
    description: string;
    lastUpdated: string;
}

export class LocatorStore {
    private fileName: string;
    private filePath: string;
    private cache: Record<string, LocatorData> = {};

    constructor(testFileName: string) {
        // Generování názvu JSON souboru na základě jména testu
        const baseName = path.basename(testFileName, path.extname(testFileName));
        this.fileName = `${baseName}.locators.json`;
        this.filePath = path.join(REPO_PATH, this.fileName);
        
        logger.debug(`[LocatorStore] Inicializace pro soubor: ${this.fileName}`);
        this.load();
    }

    private load() {
        // Zajištění existence adresáře
        if (!fs.existsSync(REPO_PATH)) {
            logger.trace(`[LocatorStore] Vytvářím chybějící adresář: ${REPO_PATH}`);
            fs.mkdirSync(REPO_PATH, { recursive: true });
        }

        // Načtení existující cache nebo inicializace prázdné
        if (fs.existsSync(this.filePath)) {
            try {
                const data = fs.readFileSync(this.filePath, 'utf-8');
                this.cache = JSON.parse(data);
                logger.debug(`[LocatorStore] Načteno ${Object.keys(this.cache).length} záznamů.`);
            } catch (e) {
                logger.error(`[LocatorStore] Chyba při parsování JSON: ${this.filePath}`, e);
                this.cache = {};
            }
        } else {
            logger.debug(`[LocatorStore] Soubor neexistuje, začínám s čistou pamětí.`);
            this.cache = {};
        }
    }

    get(key: string): string | null {
        const val = this.cache[key]?.selector || null;
        if (!val) logger.silly(`[LocatorStore] Klíč "${key}" v cache nenalezen.`);
        return val;
    }

    save(key: string, selector: string, description: string) {
        this.cache[key] = {
            selector,
            description,
            lastUpdated: new Date().toISOString()
        };

        // Synchronní zápis je zde nutný - pokud test spadne v dalším kroku,
        // chceme mít jistotu, že selektor je fyzicky na disku.
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2));
            logger.info(`[LocatorStore] 💾 Uloženo do ${this.fileName}: [${key}] -> ${selector}`);
        } catch (e) {
            logger.error(`[LocatorStore] Selhal zápis na disk!`, e);
        }
    }
}