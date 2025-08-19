// soubor: support/fixtures.ts

import { test as baseTest, expect, request as playwrightRequest } from '@playwright/test';
import { ApiClient } from '../ApiClient'; // Upravte cestu
import { logger } from '../logger';     // Upravte cestu
import { loginhash, baseURL } from '../constants'; // Upravte cestu

// 1. Definujeme si typy pro naše nové fixtures
type MyFixtures = {
  authToken: string;    // Fixture, která vrací jen string s tokenem
  authPage: void;       // Fixture, která jen přihlásí stránku (nic nevrací)
  apiClient: ApiClient; // Fixture, která vrací připravený a autorizovaný ApiClient
};

// 2. Rozšíříme základní 'test' objekt o naše nové, typované fixtures
export const test = baseTest.extend<MyFixtures>({
  
  // --- ZÁKLADNÍ FIXTURE PRO ZÍSKÁNÍ TOKENU ---
  // Tato fixture nemá žádné závislosti a jejím jediným úkolem je získat token.
  // Je znovupoužitelná pro ostatní fixtures.
  authToken: async ({}, use) => {
    logger.trace("Spouštím 'authToken' fixture pro získání tokenu...");
    const requestContext = await playwrightRequest.newContext();
    const response = await requestContext.post(`${baseURL}/auth-api/user/authorization`, {
      data: loginhash,
      headers: { 'Content-Type': 'text/plain' }
    });

    if (!response.ok()) {
      logger.fatal(`Chyba při získávání tokenu v 'authToken' fixture. Status: ${response.status()}`);
      throw new Error("Nepodařilo se získat token.");
    }

    const responseJson = await response.json();
    const token = responseJson.accessToken;
    expect(token, "Token nebyl nalezen v odpovědi z API!").toBeTruthy();
    
    logger.trace("Token úspěšně získán.");
    await use(token); // Poskytneme string s tokenem dalším fixtures
  },

  // --- FIXTURE PRO AUTOMATICKÉ PŘIHLÁŠENÍ STRÁNKY (vaše původní logika) ---
  // Tato fixture závisí na 'authToken'. Vezme si token a vloží ho do stránky.
  // Nahrazuje vaši původní úpravu 'page' fixture.
  page: async ({ page, authToken }, use) => {
    logger.trace("Spouštím 'page' fixture pro přihlášení UI...");
    await page.addInitScript(token => {
      window.localStorage.setItem('auth_token', token);
    }, authToken);
    logger.silly("Token byl vložen do localStorage pro UI testy.");
    await page.goto('/'); // Po vložení tokenu můžeme bezpečně navigovat
    await use(page);
  },

  // --- FIXTURE PRO PŘIPRAVENÝ A AUTORIZOVANÝ API KLIENT ---
  // Tato fixture závisí na 'authToken' a 'request'.
  apiClient: async ({ request, authToken }, use) => {
    logger.trace("Spouštím 'apiClient' fixture...");
    const client = new ApiClient(request, authToken);
    await use(client); // Poskytneme hotovou instanci ApiClienta testu
  }
});

export { expect };