/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL

// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 1; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);


export default defineConfig({
    fullyParallel: false, //Paralelní spuštění testů
    maxFailures: 1000,
    
    timeout: 60000, //ms
    projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], 
      viewport: { width: 1920, height: 1080 },
      },
    },

     ],
    reporter: 'html',
    use:{
        baseURL: baseURL,
        //trace: 'on-firts-retry',
    },
    testDir: './tests',
    //Skripty 
      testMatch: [
    //Test scripts, které se spouští samostatně, bez přihlášení   
     //"tests/TestScripts/TestLogin.spec.ts", //Testovací skript pro přihlášení
     
     /*
     Beckend testy
     */

    //Sestavy 
     //"tests/Sestavy/Add.spec.ts", // Vytvoření uživatelské sestavy 
     //"tests/Sestavy/E2E_AllReports_Lifecycle.spec.ts" //Životní cyklus sestavy - vytvoří sestavu D001 a následně ji smaže. Očekávaný stav: vytvořena sestava D001, smazána, počet itemů != 0, items = 0 -> WARN
     //"tests/Sestavy/E2E_D001_TimePeriods.spec.ts",// Testuje všechny typy období pro sestavu D001  
     //"tests/Sestavy/E2E_AllReports_Lifecycle._FE.spec.ts" //Testuje životní cyklus sestavy D001 na FE - NEDOKONČENO
     //"tests/Sestavy/E2E_Grouping.spec.ts", //Testuje životní cyklus sestavy D001 a P001 pro všechna možná seskupení  
     //"tests/Sestavy/E2E_AllReports_Lifecycle_public.spec.ts" //Životní cyklus sestavy - vytvoří všechny sestay jako SDÍLENÉ a následně je smaže. Očekávaný stav: public = true WARN: D003 vrací items jako null
     //"tests/Sestavy/Smoke_test_filtry.spec.ts", //Testuje všechny filtry pro sestavu D001

     //Doklady
     //Dokladdy/Ůčtenky
     //"tests/Doklady/Uctenky/FiltryUctenekSmokeTest.spec.ts"


     /*
     Frontend testy
     */
    
     //Sestavy 
    //"tests/Sestavy/FE_Sestavy_Filtry.spec.ts"
    //"tests/Sestavy/E2E_FE_D001_.alltimes.spec.ts", //Testuje životní cyklus sestavy D001 na FE - NEDOKONČENO
    ]
})     