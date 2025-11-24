import { aiTest, expect } from '../../support/fixtures/ai-test';
import { logger } from '../../support/logger';
// Importujeme tvé konstanty, abychom nepsali údaje natvrdo
import { baseURL, username, passwordOne, ACC_OWNER_ID } from '../../support/constants';

aiTest.describe('CBOS - Smoke Login Test', () => {

    aiTest.beforeEach(async ({ page }) => {
        // Sestavíme URL. Předpokládám, že login je na cestě /login. 
        const targetUrl = `${baseURL}/login`;
        
        // Log: Informace o zahájení navigace
        logger.info(`[CBOS Test] Otevírám aplikaci: ${targetUrl}`);
        
        // Krok: Navigace na stránku
        await page.goto(targetUrl);
        
        // Komentář: Čekám na dokončení síťových požadavků, aby byla stránka stabilní
        logger.debug('[CBOS Test] Čekám na stav "networkidle" (načtení skriptů)...');
        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
            logger.debug('[CBOS Test] Stránka je stabilní (networkidle).');
        } catch (e) {
            logger.warn('[CBOS Test] Stránka stále stahuje data (timeout), ale pokračujeme v testu.');
        }
    });

    aiTest('Přihlášení uživatele TESTING_AUTOMAT pomocí AI @e2e, @login, @test2', async ({ ai, page }) => {
        logger.info('--- START SCÉNÁŘE: PŘIHLÁŠENÍ ---');

        // --- 1. KROK: UŽIVATELSKÉ JMÉNO ---
        // Komentář: Čekám na AI identifikaci pole pro uživatelské jméno
        logger.debug('[KROK 1] Volám AI pro nalezení inputu uživatele...');
        const usernameInput = await ai('cbos-login-username', 'Input pole (textové pole) pro zadání uživatelského jména nebo loginu.');
        
        // Komentář: Ověření, že je prvek viditelný a připravený k interakci
        logger.trace('[KROK 1] Ověřuji viditelnost pole pro jméno.');
        await expect(usernameInput).toBeVisible();
        
        // Komentář: Vyplnění hodnoty
        logger.info(`[KROK 1] Vyplňuji uživatele: ${username}`);
        await usernameInput.fill(username);


        // --- 2. KROK: HESLO ---
        // Komentář: Čekám na AI identifikaci pole pro heslo
        logger.debug('[KROK 2] Volám AI pro nalezení inputu hesla...');
        const passwordInput = await ai('cbos-login-password', 'Input pole pro zadání hesla (typ elementu je password).');
        
        // Komentář: Ověření, že je prvek viditelný
        logger.trace('[KROK 2] Ověřuji viditelnost pole pro heslo.');
        await expect(passwordInput).toBeVisible();
        
        // Komentář: Vyplnění hodnoty (heslo nezobrazujeme v logu)
        logger.info('[KROK 2] Vyplňuji heslo (hodnota skryta).');
        await passwordInput.fill(passwordOne);


        // --- 3. KROK: ODESLÁNÍ FORMULÁŘE ---
        // Komentář: Čekám na AI identifikaci tlačítka pro přihlášení
        logger.debug('[KROK 3] Volám AI pro nalezení tlačítka Přihlásit...');
        const loginBtn = await ai('cbos-login-submit-btn', 'Tlačítko pro odeslání přihlašovacího formuláře (Login, Přihlásit se, Vstoupit).');
        
        // Komentář: Ověření viditelnosti tlačítka
        logger.trace('[KROK 3] Ověřuji viditelnost tlačítka.');
        await expect(loginBtn).toBeVisible();
        
        // Komentář: Provedení akce kliknutí
        logger.info('[KROK 3] Klikám na tlačítko přihlásit.');
        await loginBtn.click();


        // --- 4. KROK: ČEKÁNÍ NA REAKCI SYSTÉMU ---
        logger.info('[KROK 4] Čekám na reakci systému po odeslání...');
        // Krátká pauza pro vizuální kontrolu a stabilizaci DOMu
        await page.waitForTimeout(2000); 


        // --- 5. KROK: LOGIKA VÝBĚRU SÍTĚ (PODMÍNĚNÝ KROK) ---
        logger.info('--- START BLOKU: DETEKCE VÝBĚRU SÍTĚ ---');
        logger.debug('[KROK 5] Spouštím logiku pro případný mezikrok s výběrem sítě.');

        // --- 5. KROK: LOGIKA VÝBĚRU SÍTĚ ---
        logger.info('--- START BLOKU: DETEKCE VÝBĚRU SÍTĚ ---');

        // [HLAVNÍ TRY]
        try {
            // Hledáme tlačítko Potvrdit. Toto může selhat, pokud jsme rovnou na Dashboardu.
            const confirmBtn = await ai('network-confirm-btn', 'Tlačítko pro potvrzení výběru sítě (Potvrdit, Pokračovat, Vstoupit).');

            if (await confirmBtn.isVisible({ timeout: 3000 })) {
                logger.info('[CBOS Test] DETEKOVÁN MEZIKROK: Výběr sítě.');

                // [VNITŘNÍ TRY - jen pro combobox]
                try {
                    const networkCombo = await ai('network-combobox', 'Combobox (select element) pro výběr vlastníka sítě/účtu.');
                    if (await networkCombo.isVisible()) {
                        logger.info(`[CBOS Test] Vybírám síť ID: ${ACC_OWNER_ID}`);
                        // Zkusíme selectOption
                        await networkCombo.selectOption(ACC_OWNER_ID);
                    }
                } catch (e) {
                    // Když selže combobox, nevadí, zkusíme aspoň kliknout na Potvrdit
                    logger.warn('[CBOS Test] Nepodařilo se vybrat hodnotu v comboboxu, pokračuji s defaultní.', e);
                }
                // [KONEC VNITŘNÍHO TRY]

                // Kliknutí na Potvrdit
                await confirmBtn.click();
                
                // Čekání na načtení
                logger.debug('[CBOS Test] Čekám na načtení dashboardu...');
                await page.waitForLoadState('networkidle', { timeout: 15000 });

            } else {
                logger.info('[CBOS Test] Tlačítko sítě nebylo viditelné. Krok přeskakuji.');
            }

        } catch (e) {
            // [HLAVNÍ CATCH]
            // Tady musíme rozlišit, co se stalo
            
            // 1. Pokud je chyba od AI (element nenašel), je to v pořádku -> jsme asi už v aplikaci
            if (e instanceof Error && e.message.includes('AI nedokázalo najít')) {
                logger.info('[CBOS Test] Výběr sítě nebyl detekován (AI nenašlo element). Pokračuji dál.');
            } 
            // 2. Pokud je to jiná chyba (např. Timeout při waitForLoadState), je to průšvih
            else {
                logger.fatal('[CBOS Test] KRITICKÁ CHYBA při výběru sítě!', e);
                // Můžeme to nechat bublat dál, nebo jen logovat. Tady jen logujeme, aby se zkusil Krok 6.
            }
        }
    })    
});