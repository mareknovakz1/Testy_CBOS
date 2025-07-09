import { test, expect } from '../../support/fixtures/auth.fixture';
import { ApiClient } from '../../support/ApiClient';
import { ReportBuilder } from '../../support/ReportBuilder';
import { logger } from '../../support/logger';

// --- KONFIGURACE TESTOVACÍHO SCÉNÁŘE ---
/**
 * ID systémové šablony, ze které sestava vychází.
 */
const REPORT_DEFINITION_ID = 'D001';
const REPORT_NAME = 'D001: Přehled prodejů';

test.describe('End-to-End test životního cyklu sestavy', () => {

  test('Vytvoření, přečtení a smazání sestavy', async ({ page }) => {
    // Deklarujeme ID zde, aby bylo dostupné i v bloku 'finally'
   let newReportDbId: number | string | undefined;

    try {
      // Příprava
      await page.goto('/');
      const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
      expect(token).toBeTruthy();
      const apiClient = new ApiClient(page.request, token!);

      // --- VYTVOŘENÍ SESTAVY ---
      logger.trace(`Vytvářím/ukládám sestavu s názvem '${REPORT_NAME}'...`);

      // Sestavíme payload pomocí Builderu a našich konstant
      const reportPayload = new ReportBuilder(REPORT_DEFINITION_ID, REPORT_NAME)
        .withStockFilter([101]) // Příklad filtru
        .build();
      
      await apiClient.createUserReport('60193531', reportPayload);
      logger.trace(`Požadavek na uložení sestavy byl úspěšně odeslán.`);

      // --- PŘEČTENÍ SEZNAMU A ZÍSKÁNÍ ID ---
      logger.trace("Načítám seznam sestav pro ověření a získání skutečného ID...");
      const allReports = await apiClient.getUserReportsList();

      // Najdeme naši sestavu podle konstantního názvu
      const createdReport = allReports.find(report => report.name === REPORT_NAME);
      
      // Pokud sestavu nenajdeme, test spadne s jasnou chybou
      test.fail(!createdReport, `Uložená sestava '${REPORT_NAME}' nebyla nalezena v seznamu.`);

      // Z nalezeného objektu si vezmeme skutečné ID z databáze a přiřadíme ho proměnné
      newReportDbId = createdReport.id; 
      const totalObjects = createdReport.items;
      
      logger.info(`Vytvořena Sestava: ${newReportDbId}, Počet objektů: ${totalObjects}`);
      expect(newReportDbId).toBeDefined();

    } catch (error) {
      // Pokud jakákoliv část v 'try' bloku selže, zalogujeme fatální chybu
      logger.fatal('Došlo k fatální chybě během vytváření nebo ověřování sestavy.', error);
      // A znovu vyhodíme výjimku, aby byl test označen jako neúspěšný
      throw error;

    } finally {
      // Tento blok se provede VŽDY - ať už test prošel, nebo selhal v 'try' bloku.
      // Je to ideální místo pro úklid.
      if (newReportDbId) {
        logger.trace(`KROK 3 (FINALLY): Pokouším se smazat sestavu s ID: ${newReportDbId}...`);
        try {
          // Re-inicializace klienta pro 'finally' blok
          const token = await page.evaluate(() => window.localStorage.getItem('auth_token'));
          const apiClient = new ApiClient(page.request, token!);

          await apiClient.deleteUserReport(newReportDbId);

          // Ověření smazání
          const finalList = await apiClient.getUserReportsList();
          const deletedReportExists = finalList.some(report => report.id === newReportDbId);
          expect(deletedReportExists).toBe(false);
          logger.debug(`Ověření úspěšné. Sestava s ID ${newReportDbId} byla smazána.`);

        } catch (cleanupError) {
          // Pokud selže i úklid, zalogujeme to jako error, ale už neukončujeme test
          logger.error(`Chyba při mazání sestavy (ID: ${newReportDbId}) v 'finally' bloku.`, cleanupError);
        }
      } else {
        logger.warn("Nebylo vytvořeno žádné ID sestavy, úklid (mazání) se neprovádí.");
      }
    }
  });

});