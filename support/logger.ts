import { Logger, ILogObj, ILogLevel } from "tslog";

// Čteme úroveň logu z proměnné prostředí. Pokud není nastavena, použije se 'info'.
// Možné hodnoty: 0:"silly", 1:"trace", 2:"debug", 3:"info", 4:"warn", 5:"error", 6:"fatal"
// Úroveň logování se dá řidit pomocí command prompt
// $env:LOG_LEVEL="2"; npx playwright test  (POZNÁMKA: Nově se používají čísla)
// Pro `minLevel` se ve verzi 4+ používají čísla, nikoli text.

const minLevel: ILogLevel = Number(process.env.LOG_LEVEL) || 3; // 2 = debug

export const logger: Logger<ILogObj> = new Logger({
    name: "CBOS_Tests",     
    minLevel: minLevel,      // Nastavení minimální úrovně logování
    styleOptions: {           // Nastavení zobrazení je nyní zde
        filePath: "displayAll",
        functionName: false
    }
});

logger.trace(`Logger byl inicializován. Úroveň logování je nastavena na: "${logger.settings.minLevel}"`);