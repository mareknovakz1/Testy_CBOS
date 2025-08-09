# Testovací skripty CBOS - Dokumentace

### Struktura projektu

/Testy\_CBOS/

|
|-- support/            # Pomocná složka pro znovupoužitelný kód
|   |-- api/
|   |   `-- ApiClient.ts    # Knihovna pro všechny API requesty
|   |-- builders/
|   |   `-- ReportBuilder.ts# Stavitel pro komplexní payloady
|   |-- fixtures/
|   |   `-- auth.fixture.ts # Fixture pro automatické přihlášení
|   |-- constants.ts      # Konstanty (URL, přihlašovací údaje)
|   `-- logger.ts         # Globální konfigurace logování
|
|-- test-data/          # Místo pro externí testovací data (CSV, JSON)
|
|-- tests/              # Složka pro všechny testovací skripty
|   |-- Sestavy/
|   |   `-- UzivatelskeSestavy.spec.ts
|   `-- TestScripts/
|       `-- TestLogin.spec.ts
|
|-- node\_modules/       # (Automaticky generováno)
|-- playwright-report/  # (Automaticky generováno)
|-- test-results/       # (Automaticky generováno)
|
|-- .gitignore          # Soubory ignorované Gitem
|-- package.json        # Závislosti a skripty projektu
`-- playwright.config.ts# Hlavní konfigurační soubor Playwright

### Základní příkazy
Spuštění všech aktivních testů

**npx playwright test**
Zobrazení posledního HTML reportu

**npx playwright show-report**
Nastavení úrovně logování

Pro PowerShell:
**$env:LOG\_LEVEL="debug"; npx playwright test**

Pro CMD:
**set LOG\_LEVEL=debug \&\& npx playwright test**

Pro Linux/macOS:
**LOG\_LEVEL=debug npx playwright test**
### Knihovna API requestů (ApiClient)

Metoda
Endpoint
Popis
getUserReportsList() GET /reports-api/usersReports Získá seznam všech uživatelských sestav.
createUserReport() POST /reports-api/usersReports/60193531 Vytvoří nebo upraví uživatelskou sestavu.
deleteUserReport() DELETE /reports-api/usersReports/{SestavaId} Smaže konkrétní uživatelskou sestavu.
getUserReportPreview GET /reports-api/userReportPreview/{SestavaId}  Získá data pro náhled konkrétní uživatelské sestavy.

### Testovací scénáře
#### Sestavy
#### Uživatelské sestavy


ID Scénáře: 1
Název: **E2E_TimePeriods**
Modul: Sestavy/Uživatelské sestavy 
Popis: Skript postupně vytvoří, přečte a následně smaže sestavu pro každé definované časové období, aby se ověřila funkčnost všech typů datumových filtrů.
Testované kroky (časová období):
Rozsah (výchozí období – aktuální čas)
Přesné období: (výchozí čas)
Přesné období: Aktuální den
Plovoucí období: Druhé čtvrtletí
Plovoucí období: Předchozí 2 týdny
Plovoucí období: Čtvrté čtvrtletí
Plovoucí období: Třetí čtvrtletí
Plovoucí období: První čtvrtletí
Plovoucí období: Aktuální měsíc
Plovoucí období: Minulý měsíc
Plovoucí období: Předchozí 3 měsíce
Plovoucí období: Aktuální týden
Plovoucí období: Minulý týden

ID Scénáře: 2
Název: **E2E_D001_Lifecycle**
Modul: Sestavy/Uživatelské sestavy
Popis: Živtní cyklus sestavy D001. Vytvoří sestavu.

ID Scenáře:3
Název: **AllReposrts_Lifecyle_public**
Popis: Testuje vytvoření sdílenách sestav
Testoavné kroky

ID: Scénář: 4
Název: **E2E_FE_D001_.alltimes**
Modul: Sestavy/Uživatelské sestavy
Popis: Otestuje na FE všechna možná zadání časového rozsahu

ID: Scénář 5
Název: **FiltryUcetenekSmokeTest**
Modul: Doklady/Uctenky/
Popis:
1. 'GET /administration-api/stockCardsCategories/60193531 - Získání dat z centrální kategorie zboží'
Expc.: Získání dat z centrální kategorie
2. GET /reports-api/listOfOperators - Získání seznamu uživatelů
Expc.: Získání seznamu operátorů
3. GET /reports-api/listOfCardIssuers - Získání seznamu vydavatelů karet
Expc.: 
4. GET /reports-api/listOfReceipts - Odeslání prázdného requestu
Exc.: Neprázdný response
5. 'GET /reports-api/listOfReceipts - Nevalidní data, 
Expc.: 'prázdné pole'