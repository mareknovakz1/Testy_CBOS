/*
playwright.config.ts
*/

import { defineConfig, devices } from '@playwright/test';
import { baseURL } from './support/constants'; // Importujeme si naši základní URL

// Nastavte zde úroveň logování (0=silly, 1=trace, 2=debug, 3=info, 4=warn, 5=error, 6=fatal)
const logLevel = 3; // změňte dle potřeby
process.env.LOG_LEVEL = String(logLevel);

export default defineConfig({
  workers: 1,
  fullyParallel: false,
  retries: 1, //Počet opakování po neúspěšném testu
  timeout: 50 * 1000, // s*1000 ms
  
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
      use: {
      },
    },
  ],

  reporter: [
    ['list'],
    ['junit', { outputFile: 'results.xml' }],
    ['html', { open: 'never' }]
  ],
  
  use: {
    baseURL: baseURL,
    //trace: 'on-firts-retry',
  },
  
  testDir: './tests',
});