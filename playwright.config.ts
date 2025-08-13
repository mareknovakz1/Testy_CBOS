/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL

// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 0; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);


export default defineConfig({
    fullyParallel: false, //Paralelní spuštění testů
    maxFailures: 1000,
    
    timeout: 10000, //ms
    projects: [
    {
      name: 'chromium',
      use: {  channel: 'chrome',
      viewport: { width: 1920, height: 1080 }
      },
    },

     ],
    reporter: 'html',
    use:{
        baseURL: baseURL,
        //trace: 'on-firts-retry',
    },
    testDir: './tests',
});  