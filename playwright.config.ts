/*
playwright.config.ts
*/
import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL

export default defineConfig({
    fullyParallel: false, //Paralelní spuštění testů
    projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
     ],
    reporter: 'html',
    use:{
        baseURL: baseURL,
        //trace: 'on-firts-retry',
    },
    testDir: './tests',
    timeout: 60000, //ms
    //Skripty 
      testMatch: [
    //Test scripts, které se spouští samostatně, bez přihlášení   
     //"tests/TestScripts/TestLogin.spec.ts", //Testovací skript pro přihlášení
     
     //Unit testy
     "tests/Unit_testy/api.spec.ts", //Provolá všechny endpointy z ApiClientu
     
    //Testy sestavv 
     //"tests/Sestavy/Add.spec.ts", // Vytvoření uživatelské sestavy 
     //"tests/Sestavy/E2E_AllReports_Lifecycle.spec.ts", //Životní cyklus sestavy - vytvoří sestavu D001 a následně ji smaže 
     //"tests/Sestavy/E2E_D001_TimePeriods.spec.ts",// Testuje všechny typy období pro sestavu D001  
     //"tests/Sestavy/E2E_AllReports_Lifecycle._FE.spec.ts",
     //"tests/Sestavy/E2E_Grouping.spec.ts", //Testuje životní cyklus sestavy D001 a P001 pro všechna možná seskupení  
     //"tests/Sestavy/FE_Sestavy_Filtry.spec.ts",
     //"tests/Sestavy/E2E_AllReports_Lifecycle_public.spec.ts" //Životní cyklus sestavy - vytvoří všechny sestay jako SDÍLENÉ a následně je smaže WARN: D003 vrací items jako null
  ],
})