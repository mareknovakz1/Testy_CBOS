// support/global-setup.ts
import fs from "fs";
import path from "path";

async function globalSetup() {
    // --- Prepare log file path ---
    const logDir = path.join("artefacts", "logs");
    fs.mkdirSync(logDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const logFilePath = path.join(logDir, `${timestamp}.log`);

    // --- Save the path to an environment variable ---
    process.env.LOG_FILE_PATH = logFilePath;

    // --- Write session header into the log file ---
    const header = `==============================
    LOG SESSION START
    Timestamp: ${new Date().toISOString()}
    MinLevel: ${process.env.LOG_LEVEL || 'N/A'}
    File: ${logFilePath}
==============================\n\n`;
    fs.writeFileSync(logFilePath, header, "utf-8");
}

export default globalSetup;