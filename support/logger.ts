import { Logger, ILogObj, ISettings } from "tslog";
import fs from "fs";
import path from "path";

// Čteme úroveň logu z proměnné prostředí. Pokud není nastavena, použije se 'info'.
// Možné hodnoty: 0:"silly", 1:"trace", 2:"debug", 3:"info", 4:"warn", 5:"error", 6:"fatal"
// Úroveň logování se dá řidit pomocí command prompt
// $env:LOG_LEVEL="2"; npx playwright test  (POZNÁMKA: Nově se používají čísla)
// Pro `minLevel` se ve verzi 4+ používají čísla, nikoli text.
//Logy se ukláadají do test-result/logs

const minLevel: number = Number(process.env.LOG_LEVEL) || 1; 

// --- Vytvoření složky a souboru pro logy ---
const logDir = path.join('artefacts', 'logs');
fs.mkdirSync(logDir, { recursive: true });
// Use a timestamped log file name for each run
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const logFilePath = path.join(logDir, `${timestamp}.log`);

const baseSettings: Partial<ISettings<ILogObj>> = {
    minLevel: minLevel
};

// --- Logger POUZE pro hezký barevný výstup v konzoli ---
export const logger: Logger<ILogObj> = new Logger({
    ...baseSettings,
    name: "ConsoleLogger",
    prettyLogTemplate: "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}} {{logLevelName}} [{{filePathWithLine}}]",
    prettyErrorTemplate: "{{errorName}} {{errorMessage}}\nerror stack:\n{{errorStack}}",
    prettyErrorStackTemplate: "  • {{fileName}}:{{lineNumber}}:{{columnNumber}}\n    {{method}}",
    prettyErrorParentNamesSeparator: ":",
    prettyErrorLoggerNameDelimiter: ":",
    // prettyErrorPropertyDelimiter removed (not a valid property)
    // prettyErrorValueDelimiter removed (not a valid property)
    prettyInspectOptions: {
        colors: true,
        compact: false,
        depth: 5,
    },
});

// --- Oddělený logger POUZE pro zápis do souboru ---
const fileLogger: Logger<ILogObj> = new Logger({
    ...baseSettings,
    name: "FileLogger",
    type: "hidden",
});

// Transport zapisující do souboru, bez env a s relativní cestou
const getRelativePath = (fullPath: string) => {
    const projectRoot = process.cwd();
    return fullPath.startsWith(projectRoot)
        ? fullPath.slice(projectRoot.length + 1).replace(/\\/g, '/')
        : fullPath;
};

fileLogger.attachTransport((logObject) => {
    const pathObj = logObject._meta.path;
    let relPath = "unknown_path";
    let pathInfo = "";
    if (pathObj && pathObj.fullFilePath) {
        relPath = getRelativePath(pathObj.fullFilePath);
        pathInfo = ` ${JSON.stringify(pathObj)}`;
    }
    const logMessage = `${logObject._meta.date.toISOString()} ${logObject._meta.logLevelName.toUpperCase()} ${relPath}${pathInfo}\n\t${logObject[0]}\n`;
    fs.appendFileSync(logFilePath, logMessage, 'utf-8');
});

// --- Přeposílání logů do fileLogger i ze všech loggerů ---
const allLoggers = [logger, fileLogger];
allLoggers.forEach((logInstance) => {
    logInstance.attachTransport((logObject) => {
        const pathObj = logObject._meta.path;
        let relPath = "unknown_path";
        let pathInfo = "";
        if (pathObj && pathObj.fullFilePath) {
            relPath = getRelativePath(pathObj.fullFilePath);
            pathInfo = ` ${JSON.stringify(pathObj)}`;
        }
        const logMessage = `${logObject._meta.date.toISOString()} ${logObject._meta.logLevelName.toUpperCase()} ${relPath}${pathInfo}\n\t${logObject[0]}\n`;
        fs.appendFileSync(logFilePath, logMessage, 'utf-8');
    });
});

