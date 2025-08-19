import { test, expect } from '@playwright/test';

// --- Simulace Loggeru ---
// V reálném projektu byste zde importovali váš logger (např. Winston, Pino).
// Pro účely této ukázky vytváříme jednoduchý wrapper okolo console.log.
const logger = {
  silly: (message: string, ...args: any[]) => console.log(`[SILLY] ${message}`, ...args),
  trace: (message: string, ...args: any[]) => console.log(`[TRACE] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.log(`[DEBUG] ${message}`, ...args),
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  fatal: (message: string, ...args: any[]) => console.error(`[FATAL] ${message}`, ...args),
};
// -------------------------


// Společná konfigurace pro všechny testy v tomto souboru
test.use({
  baseURL: 'http://192.168.130.240:8180',
  viewport: {
    height: 1080,
    width: 1920,
  },
});

/**
 * @description Skupina testů pro ověření funkcionality na hlavní ploše aplikace.
 */
test.describe('Dashboard - Ověření prvků a akcí', () => {

  test.beforeEach(async ({ page }) => {
    
    logger.info('Zahajuji přihlašovací sekvenci pro test...');
    
    await page.goto('/login');
    logger.trace(`Navigováno na adresu: ${page.url()}`);

    await page.getByPlaceholder('Jméno').fill('mn_withoutobchod');
    logger.debug('Vyplňuji pole "Jméno".');
    
    await page.getByPlaceholder('Heslo').fill('1');
    logger.debug('Vyplňuji pole "Heslo".');

    await page.getByRole('button', { name: 'Přihlásit' }).click();
    logger.trace('Klikám na tlačítko "Přihlásit".');
    
    await expect(page.getByRole('navigation')).toBeVisible();
    logger.info('Uživatel byl úspěšně přihlášen, navigační menu je viditelné.');
  });


  test('Test 1: Zobrazení položky "Plocha" v menu', async ({ page }) => {
 
    logger.info('--- START: Test 1: Zobrazení položky "Plocha" v menu ---');

    try {
  
      const dashboardLink = page.getByRole('link', { name: 'Plocha' });
      logger.trace('Vyhledávám odkaz s názvem "Plocha" v menu.');
  
      await expect(dashboardLink).toBeVisible();
    
      logger.info('Ověření úspěšné: Odkaz "Plocha" je viditelný.');
    } catch (e) {
      
      logger.error(`Selhání aserce v Testu 1: Odkaz "Plocha" nebyl viditelný!`, e);
      throw e; // Znovu vyhodíme chybu, aby Playwright označil test jako neúspěšný.
    }
    
    logger.info('--- KONEC: Test 1: Úspěšně dokončen ---');
  });
  
  test('Test 2: Možnost vytvoření / přidání přehledu', async ({ page }) => {
    logger.info('--- START: Test 2: Možnost vytvoření / přidání přehledu ---');

    await page.getByRole('link', { name: 'Plocha' }).click();
    logger.trace('Proveden přechod na stránku "Plocha".');
   
    await page.getByRole('button', { name: 'Přidat přehled na plochu' }).click();
    logger.trace('Kliknuto na tlačítko "Přidat přehled na plochu".');

    const dialogTitle = page.getByRole('heading', { name: 'Přidat přehled' });
    await expect(dialogTitle).toBeVisible();

    logger.info('Ověření úspěšné: Dialogové okno pro přidání přehledu se zobrazilo.');

    logger.info('--- KONEC: Test 2: Úspěšně dokončen ---');
  });

  test('Test 3: Výběr přehledu "Přirážky a marže PHM"', async ({ page }) => {
    logger.info('--- START: Test 3: Výběr přehledu "Přirážky a marže PHM" ---');
    
    await page.getByRole('link', { name: 'Plocha' }).click();
    await page.getByRole('button', { name: 'Přidat přehled na plochu' }).click();
    logger.trace('Otevřeno dialogové okno pro přidání přehledu.');
    
    const widgetRow = page.getByRole('row', { name: /Přirážky a marže/i });
    logger.trace('Hledám řádek pro "Přirážky a marže PHM".');
    await expect(widgetRow).toBeVisible();
    logger.trace('Ověřeno: Řádek je viditelný.');
    
    await widgetRow.getByRole('checkbox').check();
    logger.debug('Zaškrtávám checkbox pro "Přirážky a marže PHM".');
    
    await expect(widgetRow.getByRole('checkbox')).toBeChecked();
    logger.info('Ověření úspěšné: Checkbox je zaškrtnutý.');
    
    logger.info('--- KONEC: Test 3: Úspěšně dokončen ---');
  });

  test('Test 4: Výběr přehledu "Průběžná denní tržba"', async ({ page }) => {
    logger.info('--- START: Test 4: Výběr přehledu "Průběžná denní tržba" ---');

    await page.getByRole('link', { name: 'Plocha' }).click();
    await page.getByRole('button', { name: 'Přidat přehled na plochu' }).click();
    logger.trace('Otevřeno dialogové okno pro přidání přehledu.');
    
    const widgetRow = page.getByRole('row', { name: /Průběžné tržby/i });
    logger.trace('Hledám řádek pro "Průběžná denní tržba".');
    await expect(widgetRow).toBeVisible();
    logger.trace('Ověřeno: Řádek je viditelný.');

    await widgetRow.getByRole('checkbox').check();
    logger.debug('Zaškrtávám checkbox pro "Průběžná denní tržba".');
    
    await expect(widgetRow.getByRole('checkbox')).toBeChecked();
    logger.info('Ověření úspěšné: Checkbox je zaškrtnutý.');
    
    logger.info('--- KONEC: Test 4: Úspěšně dokončen ---');
  });
});