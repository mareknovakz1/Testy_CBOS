// Autentifikace
import { test as base, expect } from '@playwright/test';
import { loginhash, baseURL } from '../constants';
// KROK 1: Importujeme náš nový globální logger
import { logger } from '../logger';

// Rozšíření základního 'test' objektu o naši vlastní přihlašovací logiku
export const test = base.extend({
  page: async ({ page }, use) => {
    logger.silly("Spouštím automatickou přihlašovací fixture...");

    try {
      logger.info(`Připojuji na: ${baseURL}`);
      logger.silly("Připraven payload pro autentizaci:", loginhash);

      logger.silly("Odesílám požadavek na autentizaci na endpoint:", `${baseURL}/auth-api/user/authorization`);
      const response = await page.request.post(`${baseURL}/auth-api/user/authorization`, {
        data: loginhash,
        headers: {
          'Content-Type': 'text/plain'
        }
      });

      if (!response.ok()) {
        logger.error(`Chyba při přihlašování přes API. Status: ${response.status()}`, await response.text());
        throw new Error(`Chyba při přihlašování přes API: Status ${response.status()}`);
      }
      logger.trace("Autentizace přes API proběhla úspěšně (Status: 200 OK).");

      const responseJson = await response.json();
      const token = responseJson.accessToken;

      if (!token) {
        logger.error("Nepodařilo se získat 'accessToken' z API odpovědi.", responseJson);
        throw new Error("Nepodařilo se získat token z API odpovědi.");
      }
      logger.silly("Přístupový token (accessToken) byl úspěšně získán.");

      await page.addInitScript(token => {
        window.localStorage.setItem('auth_token', token);
      }, token);
      logger.silly("Token byl vložen do localStorage pro budoucí použití.");
      
      await use(page);
      
      logger.trace("Fixture dokončila svou práci po skončení testu.");

    } catch (error) {
      logger.fatal("Došlo k fatální chybě uvnitř přihlašovací fixture. Test nemůže pokračovat.", error);
      throw error;
    }
  },
});

export { expect };
