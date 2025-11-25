/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL
//Načtení údajů z .env
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '.env') }); 


// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 1; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);

// Veškerá konfigurace je nyní v rámci jednoho exportu.
export default defineConfig({
  // Adresář s testovacími soubory
  globalSetup: './support/global-setup.ts',
  testDir: './tests',

  // Globální časový limit pro každý jednotlivý test
  timeout: 50 * 1000, // 50 sekund
  retries: 0, // Počet opakování po neúspěšném testu
  workers: 1, // Použití jednoho workera pro sériové spouštění testů (jeden po druhém)
  fullyParallel: false,

  // Reportéry, které se mají použít. Více na https://playwright.dev/docs/test-reporters
 reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],  // 1. Tento reportér vygeneruje základní results.xml
    ['./custom-junit-reporter.ts', { outputFile: 'results.xml' }]     // 2. Tento reportér se spustí poté a soubor upraví
  ],

  // Globální nastavení platná pro všechny projekty
  use: {
    baseURL: baseURL,
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true, //Ošetření vůči pádům během AI testů
  },

  // Konfigurace projektů pro hlavní prohlížeče
  projects: [
    {
      name: 'chromium',
      grepInvert: /@api/,
      grep: /@e2e/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        video: 'retain-on-failure',
        viewport: { width: 1920, height: 1080 },
        
      }
    },
    {
      name: 'edge',
      grepInvert: /@api/,
      grep: /@e2e/,
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        video: 'retain-on-failure',
        viewport: { width: 1920, height: 1080 }
      }
    },
    {
      name: 'API',
      grep: /@api/,
      grepInvert: /@e2e/,
      // API testy nepotřebují specifická nastavení prohlížeče v sekci 'use'
    },
  ],
});