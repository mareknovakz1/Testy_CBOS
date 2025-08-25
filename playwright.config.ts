/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL

// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 3; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);


export default defineConfig({
    workers: 1, //Běží vždy jen jeden test
    fullyParallel: false, //Paralelní spuštění testů
    retries: 2, //Provede jedno opakování po selhaném testu
    timeout: 50*1000, //s*1000 ms
       projects: [
      {
        name: 'chromium',
        use: { 
          ...devices['Desktop Chrome'],
          channel: 'chrome',
          video: 'retain-on-failure',
          viewport: { width: 1920, height: 1080 }
        },
    },
      {
        name: 'firefox',
        use: { 
          ...devices['Desktop Firefox'],
          video: 'retain-on-failure',
          viewport: { width: 1920, height: 1080 }
        },
      },
      {
        name: 'edge',
        use: { 
          ...devices['Desktop Edge'],
          channel: 'msedge',
          video: 'retain-on-failure',
          viewport: { width: 1920, height: 1080 }
        },
      }, // <-- Tady chyběla ukončovací čárka

      {
        name: 'API'
     // Tento projekt je v pořádku
      },
    ],
    reporter: [
    ['html'], 
    ['junit', { outputFile: 'results.xml' }]
    ], //konfigurace testiny
    use:{
        baseURL: baseURL,
        //trace: 'on-firts-retry',
    },
    testDir: './tests',

});  