# Testovací skripty CBOS

Tento projekt využívá **Playwright** a **npm** pro spouštění a správu testů.

---

## Struktura projektu

- **Playwright config**  
  Obsahuje nastavení log levelu, prohlížeče, timeoutů apod.

- **package.json**  
  Definuje příkazy pro spuštění sérií testů.  
  Testovací prompt začíná příkazem `test` a spouští se ve formátu:  
  ```bash
  npm run test:<název_série>
  ```
  Např.:  
  ```bash
  npm run test:report_sestavy_e2e
  ```
  Série jsou řazeny pomocí **tagů**.

- **tests/**  
  Obsahuje všechny testovací skripty.

- **testiny/**  
  Obsahuje scénáře k testům.

- **test-data/**  
  Obsahuje výsledky posledního běhu testů vygenerované Playwrightem, včetně videa při neúspěšném E2E testu.

- **Artifacts/logs/**  
  Obsahuje logy a poznámky ze spuštění.

- **constants.ts**
  Obsahuje údaje o síti a uživatelích

---

## Formát názvu testů

```
TC_ID popis @tagy
```

- **TC_ID** – ID shodné s casem v Testiny (jeden test = jeden case)  
- **popis** – stručný slovní popis problému  
- **tagy** – určují kategorii testu:  
  - `@smoke`  
  - `@regression`  
  - `@critical`, `@medium`, `@high`  
  - `@sestavy`, `@Doklady`, `@API`, `@E2E`

---

## Integrace s Testiny

Autorizace probíhá pomocí **API klíče** uloženého v souboru `.env`.

- Soubor `.env` je zahrnutý v `.gitignore`.  
- Pro použití je nutné vytvořit vlastní `.env` se svým klíčem:  
  ```env
  TESTINY_API_KEY="######################################"
  ```

Výsledky testů pro odeslání reportu se ukládají do souboru `result.xml`.

---

# Architektura a Konvence API Klienta

## Struktura Adresářů

Veškerý kód související s API klientem je centralizován v adresáři `api/`.

/api
├── services/
│   ├── ReportsApiService.ts
│   ├── AuthApiService.ts
│   └── BalanceApiServices.ts
|   └── DashboardApiSerivces.ts
|   └── DocumentsApiServices.ts
|   └── SoctektApiServices.ts
|   └── SystemApiServices.ts
├── types/
│   ├── reports.types.ts
│   ├── auth.types.ts
│   └── administration.types.ts
|   └── common.types.ts
|   └── system.types.ts
|   └── index.types.ts
├── BaseApiClient.ts
└── ApiClient.ts

## Popis Komponent

* **`BaseApiClient.ts` (Engine)**
    * Nízkoúrovňová třída, která obsahuje veškerou sdílenou logiku pro HTTP požadavky.
    * **Odpovědnosti:** Přidávání autorizačních hlaviček, centralizované logování, měření výkonu a jednotné zpracování chyb.
    * Tato třída neobsahuje žádnou logiku specifickou pro konkrétní endpointy.

* **`api/services/` (Specializované nástroje)**
    * Adresář obsahující servisní třídy, z nichž každá je odpovědná za jeden logický celek (doménu) API.
    * Příklady: `ReportsApiService.ts` se stará o všechny endpointy pod `/reports-api`, `AuthApiService.ts` o `/auth-api` atd.
    * Každá servisní třída dědí od `BaseApiClient`.

* **`api/types/` (Datové kontrakty)**
    * Adresář pro všechny datové struktury (`interface`, `type`).
    * Definují se zde jak **request payloady** (data posílaná na server), tak **response typy** (data přijímaná ze serveru).
    * Každý soubor odpovídá jedné API doméně (např. `reports.ts`, `auth.ts`).

* **`ApiClient.ts` (Hlavní vstupní bod / Fasáda)**
    * Hlavní třída, která sjednocuje všechny servisní třídy do jednoho objektu.
    * Slouží jako jediný a přehledný vstupní bod pro použití v testovacích skriptech.

---

## Konvence Pojmenování


### 1. Metody v Servisních Třídách
Vzor: **`[Akce][Zdroj][DleČeho]`**
* **Akce:** `get`, `put`, `post`, `delete`.
* **Zdroj:** Podstatné jméno v jednotném čísle (`User`, `Report`).
* **Příklady:** `getUsers()`, `getReportById(id)`, `postUser(payload)`.

### 2. Request Payloady
Vzor: **`[Akce][Zdroj]Payload`**
* **Akce:** `Create`, `Update`, `Set`.
* **Zdroj:** `User`, `Report`...
* **Příklady:** `CreateUserPayload`, `UpdateReportPayload`.

### 3. Response Typy
Vzor: **`[Zdroj]Response`**
* **Zdroj:** `User`, `Report`....
* **Příklady:** `UserResponse`, `ReportResponse`. Pro seznamy se používá pole: `UserResponse[]`.

---