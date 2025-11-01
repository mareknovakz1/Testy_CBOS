// soubor: support/fixtures.ts

import { test as baseTest, expect, request as playwrightRequest } from '@playwright/test';
import { ApiClient } from '../../api/ApiClient';
import { logger } from '../logger';
// Zde importujeme přihlašovací údaje, nikoliv starý token
import { baseURL, nameOne, passwordOne } from '../constants';
// Přidáme import Bufferu pro kódování do Base64
import { Buffer } from 'buffer';

// 1. Definujeme si typy pro naše nové fixtures
type MyFixtures = {
  authToken: string; // Fixture, která vrací jen string s tokenem
  authPage: void; // Fixture, která jen přihlásí stránku (nic nevrací)
  apiClient: ApiClient; // Fixture, která vrací připravený a autorizovaný ApiClient
};

// 2. Rozšíříme základní 'test' objekt o naše nové, typované fixtures
export const test = baseTest.extend<MyFixtures>({

  // --- ZÁKLADNÍ FIXTURE PRO ZÍSKÁNÍ TOKENU ---
  // Tato fixture nemá žádné závislosti a jejím jediným úkolem je získat token.
  // Je znovupoužitelná pro ostatní fixtures.
  authToken: async ({}, use) => {
    logger.silly("FIXTURE 'authToken': Start.");
    logger.trace("FIXTURE 'authToken': Budu vytvářet nový request kontext...");
    const requestContext = await playwrightRequest.newContext();
    logger.trace("FIXTURE 'authToken': Request kontext vytvořen.");

    // --- OPRAVENÁ ČÁST ZAČÍNÁ ZDE ---

    // Vytvoříme tělo požadavku s přihlašovacími údaji
    const loginPayload = {
      operator: nameOne,
      password: passwordOne
    };

    // Zakódujeme tělo do Base64, jak server očekává
    const base64Payload = Buffer.from(JSON.stringify(loginPayload)).toString('base64');

    const url = `${baseURL}/auth-api/user/authorization`;
    
    // Posíláme správný Base64 payload
    const response = await requestContext.post(url, {
      data: base64Payload,
      headers: { 'Content-Type': 'text/plain' }
    });

    // --- OPRAVENÁ ČÁST KONČÍ ZDE ---

    logger.trace(`FIXTURE 'authToken': Odpověď přijata se statusem ${response.status()}.`);

    if (!response.ok()) {
      const responseBody = await response.text();
      logger.fatal({
          message: `FIXTURE 'authToken': Kritická chyba při získávání tokenu.`,
          status: response.status(),
          statusText: response.statusText(),
          body: responseBody
      }, "Chybová odpověď od API");
      throw new Error(`Nepodařilo se získat token. Status: ${response.status()}`);
    }

    logger.silly("FIXTURE 'authToken': Odpověď je OK (status 2xx). Parsuji JSON...");
    const responseJson = await response.json();

    // Očekáváme, že v odpovědi bude pole 'accessToken'
    const token = responseJson.accessToken;
    logger.trace("FIXTURE 'authToken': Získávám 'accessToken' z JSON odpovědi.");
    expect(token, "Token ('accessToken') nebyl nalezen v odpovědi z API!").toBeTruthy();
    logger.silly(`FIXTURE 'authToken': Token úspěšně získán (prvních 10 znaků: '${token.substring(0, 10)}...').`);

    logger.trace("FIXTURE 'authToken': Volám 'use(token)' a předávám token dál...");
    await use(token); // Poskytneme string s tokenem dalším fixtures
    logger.silly("FIXTURE 'authToken': Fixture dokončila svou práci po 'use'.");
  },

  // --- FIXTURE PRO AUTOMATICKÉ PŘIHLÁŠENÍ STRÁNKY (vaše původní logika) ---
  // Tato fixture závisí na 'authToken'. Vezme si token a vloží ho do stránky.
  // Nahrazuje vaši původní úpravu 'page' fixture.
  page: async ({ page, authToken }, use) => {
    logger.silly("FIXTURE 'page' (rozšířená): Start.");
    logger.trace("FIXTURE 'page' (rozšířená): Budu vkládat inicializační skript pro nastavení localStorage...");
    
    await page.addInitScript(token => {
      // Tento kód se spustí v kontextu prohlížeče, proto zde nemůžeme použít 'logger'.
      // Místo toho používáme console.log, který se zobrazí v konzoli prohlížeče.
      console.log(`[InitScript] Vkládám 'auth_token' do localStorage...`);
      window.localStorage.setItem('auth_token', token);
      console.log(`[InitScript] Token byl úspěšně vložen.`);
    }, authToken);

    logger.trace("FIXTURE 'page' (rozšířená): Inicializační skript byl přidán.");
    logger.silly("FIXTURE 'page' (rozšířená): Nyní provedu navigaci na hlavní stránku ('/')...");
    
    await page.goto('/');
    logger.trace("FIXTURE 'page' (rozšířená): Navigace na '/' dokončena.");

    logger.trace("FIXTURE 'page' (rozšířená): Volám 'use(page)' a předávám připravenou stránku testu...");
    await use(page);
    logger.silly("FIXTURE 'page' (rozšířená): Fixture dokončila svou práci po 'use'.");
  },

  // --- FIXTURE PRO PŘIPRAVENÝ A AUTORIZOVANÝ API KLIENT ---
  // Tato fixture závisí na 'authToken' a 'request'.
  apiClient: async ({ request, authToken }, use) => {
    logger.silly("FIXTURE 'apiClient': Start.");
    logger.trace("FIXTURE 'apiClient': Budu vytvářet novou instanci ApiClient s poskytnutým tokenem.");
    
    const client = new ApiClient(request, authToken);
    logger.trace("FIXTURE 'apiClient': Instance ApiClient byla úspěšně vytvořena.");

    logger.trace("FIXTURE 'apiClient': Volám 'use(client)' a předávám hotového klienta testu...");
    await use(client);
    logger.silly("FIXTURE 'apiClient': Fixture dokončila svou práci po 'use'.");
  }
});

export { expect };