/**
 * @file logger.ts
 * @author Marek Novák
 * @date 29.09.2025
 * @description
 * Centralized logging setup using the `tslog` library.
 * Logs go both to the console (pretty, colored) and to a
 * timestamped log file in the `artefacts/logs` directory.
 *
 * Log level can be controlled via the LOG_LEVEL environment variable.
 * Levels:
 *   0 = silly
 *   1 = trace
 *   2 = debug
 *   3 = info  (default)
 *   4 = warn
 *   5 = error
 *   6 = fatal
 */

import { Logger, ILogObj, ISettings } from "tslog";
import fs from "fs";
import path from "path";

// --- Determine log level ---
const parsedLevel = Number(process.env.LOG_LEVEL);
const minLevel: number = Number.isNaN(parsedLevel) ? 3 : parsedLevel; // default to info(3)

// Get the shared log file path from the environment variable
const logFilePath = process.env.LOG_FILE_PATH || path.join("artefacts", "logs", "fallback.log");

// --- Base settings shared by all loggers ---
const baseSettings: Partial<ISettings<ILogObj>> = {
  minLevel: minLevel,
};

// --- Console logger (pretty, colored output) ---
export const logger: Logger<ILogObj> = new Logger({
  ...baseSettings,
  name: "ConsoleLogger",
  prettyLogTemplate:
    "{{yyyy}}-{{mm}}-{{dd}} {{hh}}:{{MM}}:{{ss}}.{{ms}} {{logLevelName}} [{{fileNameWithLine}}]",
  prettyErrorTemplate:
    "{{errorName}} {{errorMessage}} error stack: {{errorStack}}",
  prettyErrorStackTemplate:
    "  • {{fileName}}:{{lineNumber}}:{{columnNumber}} {{method}}",
  prettyErrorParentNamesSeparator: ":",
  prettyErrorLoggerNameDelimiter: ":",
  prettyInspectOptions: {
    colors: true,
    compact: false,
    depth: 5,
  },
});

// --- Helper: convert absolute path to project-relative ---
const getRelativePath = (fullPath: string) =>
  path.relative(process.cwd(), fullPath).replace(/\\/g, "/");

// --- Transport: append all logs into file ---
const fileTransport = (logObject: any) => {
  const pathObj = logObject._meta.path;
  const relPath = pathObj?.fullFilePath
    ? getRelativePath(pathObj.fullFilePath)
    : "unknown_path";

  const logMessage = `${logObject._meta.date.toISOString()} ${logObject._meta.logLevelName.toUpperCase()} ${relPath}\n\t${logObject[0]}\n`;
  fs.appendFileSync(logFilePath, logMessage, "utf-8");
};

// --- Attach transport so console logs are mirrored to file ---
logger.attachTransport(fileTransport);
