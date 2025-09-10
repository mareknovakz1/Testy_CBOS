/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL


// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 1; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);

// Veškerá konfigurace je nyní v rámci jednoho exportu.
export default defineConfig({
  // Adresář s testovacími soubory
  testDir: './tests',

  // Globální časový limit pro každý jednotlivý test
  timeout: 50 * 1000, // 50 sekund
  retries: 1, // Počet opakování po neúspěšném testu
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
  },

  // Konfigurace projektů pro hlavní prohlížeče
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        video: 'retain-on-failure',
        viewport: { width: 1920, height: 1080 }
      },
      testIgnore: '**/*_API.spec.ts',
      testMatch: '**/*_E2E.spec.ts',
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        video: 'retain-on-failure',
        viewport: { width: 1920, height: 1080 }
      },
      testIgnore: '**/*_API.spec.ts',
      testMatch: '**/*_E2E.spec.ts',
    },
    {
      name: 'edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
        video: 'retain-on-failure',
        viewport: { width: 1920, height: 1080 }
      },
      testIgnore: '**/*_API.spec.ts',
      testMatch: '**/*_E2E.spec.ts',
    },
    {
      name: 'API',
      testMatch: '**/*_API.spec.ts',
      testIgnore: '**/*_E2E.spec.ts',
      // API testy nepotřebují specifická nastavení prohlížeče v sekci 'use'
    },
  ],
});