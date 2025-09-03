import { Reporter, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';
import { xml2js, js2xml, Element } from 'xml-js';

class CustomJUnitReporter implements Reporter {
  private outputFile: string;

  constructor(options: { outputFile?: string } = {}) {
    // Definujeme cestu k výstupnímu souboru, výchozí je 'results.xml'
    this.outputFile = options.outputFile || 'results.xml';
  }

  // Tato metoda se zavolá po dokončení všech testů
  async onEnd(result: FullResult) {
    // Počkáme chvilku, abychom měli jistotu, že původní junit reportér dokončil zápis souboru
    await new Promise(resolve => setTimeout(resolve, 1000));

    const reportPath = path.resolve(this.outputFile);

    if (!fs.existsSync(reportPath)) {
      console.error(`[CustomJUnitReporter] JUnit report file not found at: ${reportPath}`);
      return;
    }

    // Načteme původní XML soubor
    const xmlContent = fs.readFileSync(reportPath, 'utf-8');
    const report = xml2js(xmlContent, { compact: false }) as Element;

    // Projdeme všechny 'testcase' elementy a přidáme jim 'id'
    report.elements?.forEach(testsuites => {
      if (testsuites.name === 'testsuites') {
        testsuites.elements?.forEach(testsuite => {
          if (testsuite.name === 'testsuite') {
            testsuite.elements?.forEach(testcase => {
              if (testcase.name === 'testcase' && testcase.attributes) {
                const testName = testcase.attributes.name as string;
                const match = testName.match(/TC-\d+/);
                if (match) {
                  // Přidáme atribut id="TC-xxxx"
                  testcase.attributes.id = match[0];
                }
              }
            });
          }
        });
      }
    });

    // Převedeme upravený objekt zpět na XML a uložíme ho
    const finalXml = js2xml(report, { spaces: 2 });
    fs.writeFileSync(reportPath, finalXml);

    console.log(`[CustomJUnitReporter] Added TC IDs to ${reportPath}`);
  }
}

export default CustomJUnitReporter;