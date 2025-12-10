import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from './support/logger'; // Import vaší logovací knihovny

// Promisify exec pro použití s async/await
const execAsync = promisify(exec);

// --- KONFIGURACE ---
const CONFIG = {
    apiUrl: 'http://192.168.130.239:8180/administration-api/status',
    versionFile: path.join(__dirname, 'last_known_version.txt'),
    checkIntervalMs: 60 * 1000, // 1 hodina
    testCommand: 'npx playwright test --grep "@smoke"',
    authToken: '' // Doplňte 'Bearer ...' pokud je třeba
};

// --- TYPY ---
interface StatusApiResponse {
    version: string;
    buildNumber?: string;
    timestamp?: string;
    [key: string]: any;
}

/**
 * Získá verzi ze vzdáleného API
 */
async function getRemoteVersion(): Promise<string | null> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };
        
        if (CONFIG.authToken) {
            headers['Authorization'] = CONFIG.authToken;
            // Silly level pro authorizaci/raw info, jak jste požadoval
            logger.silly(`[Watchdog] Používám Authorization header.`);
        }

        logger.debug(`[Watchdog] Odesílám požadavek na: ${CONFIG.apiUrl}`);
        
        const response = await fetch(CONFIG.apiUrl, { headers });

        if (!response.ok) {
            throw new Error(`Status ${response.status}: ${response.statusText}`);
        }

        const data = (await response.json()) as StatusApiResponse;

        // Silly log pro kompletní surová data z API
        logger.silly(`[Watchdog] Raw API response: ${JSON.stringify(data)}`);

        if (!data.version) {
            logger.warn('[Watchdog] API vrátilo JSON, ale chybí pole "version".', { body: data });
            return null;
        }

        return data.version;

    } catch (error: any) {
        logger.error(`[Watchdog] Chyba při zjišťování verze: ${error.message}`);
        return null;
    }
}

/**
 * Spustí Playwright testy
 */
async function runTests(newVersion: string): Promise<void> {
    logger.info(`[Watchdog] 🚀 Detekována nová verze: ${newVersion}. Spouštím regresní testy...`);

    try {
        // Spuštění testů
        // stdout a stderr zachytíme a zalogujeme podle výsledku
        const { stdout, stderr } = await execAsync(CONFIG.testCommand);
        
        logger.info('[Watchdog]  Testy dokončeny úspěšně.');
        
        // Detailní výstup testů dáme do debugu, ať nezahlcuje info log
        if (stdout) logger.debug(`[Watchdog] Test STDOUT:\n${stdout}`);
        if (stderr) logger.warn(`[Watchdog] Test STDERR (varování):\n${stderr}`);

        saveVersion(newVersion);

    } catch (error: any) {
        logger.error('[Watchdog]  Testy selhaly.');
        
        // U selhání chceme vidět výstup i v error logu nebo alespoň info
        if (error.stdout) logger.info(`[Watchdog] Fail STDOUT:\n${error.stdout}`);
        if (error.stderr) logger.error(`[Watchdog] Fail STDERR:\n${error.stderr}`);
        
        // Uložíme verzi i při chybě, abychom nespouštěli testy pro tutéž verzi stále dokola?
        // Pokud chcete testovat znovu dokud to neprojde, zakomentujte tento řádek.
        saveVersion(newVersion); 
    }
}

function saveVersion(version: string) {
    try {
        fs.writeFileSync(CONFIG.versionFile, version, 'utf-8');
        logger.info(`[Watchdog] Verze ${version} byla uložena do souboru.`);
    } catch (err: any) {
        logger.error(`[Watchdog] Nepodařilo se zapsat verzi do souboru: ${err.message}`);
    }
}

/**
 * Hlavní kontrolní smyčka
 */
async function checkLoop() {
    logger.debug(`[Watchdog] 🔍 Zahajuji kontrolu verze...`);

    const remoteVersion = await getRemoteVersion();

    if (remoteVersion) {
        let localVersion = '';

        if (fs.existsSync(CONFIG.versionFile)) {
            localVersion = fs.readFileSync(CONFIG.versionFile, 'utf-8').trim();
        } else {
            logger.debug(`[Watchdog] Soubor s verzí neexistuje, bude vytvořen při prvním běhu.`);
        }

        if (remoteVersion !== localVersion) {
            logger.warn(`[Watchdog] ZMĚNA VERZE! Stará: '${localVersion}' -> Nová: '${remoteVersion}'`);
            await runTests(remoteVersion);
        } else {
            logger.info(`[Watchdog] Verze se nezměnila (${localVersion}). Další kontrola za ${CONFIG.checkIntervalMs / 60000} minut.`);
        }
    }
}

// --- START ---
logger.info(`--- 🤖 Start Watchdogu CBOS (Interval: ${CONFIG.checkIntervalMs / 60000} min) ---`);

// Okamžitá kontrola při spuštění
checkLoop().catch(err => {
    logger.fatal(`[Watchdog] Kritická chyba v hlavní smyčce: ${err.message}`);
});

// Plánování intervalu
setInterval(() => {
    checkLoop().catch(err => {
        logger.fatal(`[Watchdog] Kritická chyba v intervalu: ${err.message}`);
    });
}, CONFIG.checkIntervalMs);