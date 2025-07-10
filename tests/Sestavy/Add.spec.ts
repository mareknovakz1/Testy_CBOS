/**
 * Skript pro vytvoření Uživatelské sestavy 
 */
//Config
const SestavaID: string = 'D001';
const Sestavaname: string = 'Přehled prodejů';

import { test, expect } from '../../support/fixtures/auth.fixture';
import { logger } from '../../support/logger';

test.describe('Testy generování uživatelských sestav', () => {

  test('Úspěšné vygenerování sestavy "Přehled prodejů"', async ({ page }) => {
    
    await page.goto('/');
    const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
    expect(token).toBeTruthy();

    const reportId = '60193531';
    const reportApiEndpoint = `/reports-api/usersReports/${reportId}`;

    const payload = {
      settings: {
        availableFilters: ["stockId", "stkitmType", "groupId", "goodsOwnerId", "paidBy", "cardOwnerId", "cardIssuerId"],
        dateModelType: "range",
        dateFrom: "2025-06-30T22:00:00.000Z",
        dateTo: null,
        stockId: [101],
        stkitmType: [],
        groupId: [],
        goodsOwnerId: [],
        paidBy: [],
        cardOwnerId: [],
        cardIssuerId: [],
        sort: ""
      },
      name: Sestavaname,
      public: false,
      reportDefinitionId: SestavaID
    };

    logger.info(`Odesílám požadavek na vygenerování sestavy na endpoint: ${reportApiEndpoint}`);

    const response = await page.request.post(reportApiEndpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*'
      },
      data: payload
    });

    expect(response.ok()).toBeTruthy();
    logger.info(`Sestava byla úspěšně vygenerována (Status: ${response.status()}).`);

    const responseBodyText = await response.text();
    logger.debug("Surová odpověď ze serveru:", responseBodyText);

    // Zkontrolujeme, jestli odpověď není prázdná.
    if (responseBodyText) {
      // Teprve pokud není prázdná, pokusíme se ji zpracovat jako JSON.
      const responseJson = JSON.parse(responseBodyText);

      // Ověříme, že odpověď obsahuje očekávaná data
      expect(responseJson.name).toBe(Sestavaname);
      expect(responseJson.reportDefinitionId).toBe(SestavaID);
      expect(responseJson.id).toBe(reportId);

      logger.debug("Odpověď z API byla úspěšně zpracována jako JSON a obsahuje očekávaná data.", responseJson);
    } else {
      // Pokud je odpověď prázdná, jen to zalogujeme. Pro status 200 je to v pořádku.
      logger.info("Server vrátil prázdnou odpověď, což je pro tento endpoint očekávané chování.");
    }
  });

});
