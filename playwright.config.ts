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
    timeout: 30000, //ms
    //Skripty 
      testMatch: [
     //"tests/TestScripts/TestLogin.spec.ts", //Testovací skript pro přihlášení
     //"tests/Sestavy/Add.spec.ts", // Vytvoření uživatelské sestavy 
     //"tests/Sestavy/E2E_AllReports_Lifecycle.spec.ts", //Životní cyklus sestavy - vytvoří sestavu D001 a následně ji smaže 
     //"tests/Sestavy/E2E_D001_TimePeriods.spec.ts"    
     "tests/Sestavy/E2E_Grouping.spec.ts"  
  ],
}
)