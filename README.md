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
