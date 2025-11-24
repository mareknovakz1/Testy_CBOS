import { Page } from '@playwright/test';

/**
 * Tato funkce se spustí v prohlížeči, vezme DOM a vyčistí ho od balastu.
 * Vrací zjednodušený HTML string.
 */
export async function getCleanHTML(page: Page): Promise<string> {
    return await page.evaluate(() => {
        
        // 1. Vytvoříme kopii BODY, abychom nerozbili živou stránku
        const clone = document.body.cloneNode(true) as HTMLElement;

        // 2. Definujeme seznam elementů, které jsou pro AI šum
        // script/style: kód nás nezajímá
        // svg/path: ikony jsou jen dlouhé řetězce čísel
        // noscript, iframe: většinou reklamy nebo trackery
        const tagsToRemove = ['script', 'style', 'svg', 'path', 'noscript', 'iframe', 'meta', 'link'];

        tagsToRemove.forEach(tag => {
            const elements = clone.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });

        // 3. Projdeme všechny zbylé elementy a vyčistíme atributy
        const allElements = clone.querySelectorAll('*');
        
        // Seznam atributů, které pomáhají identifikovat element (ostatní smažeme)
        const allowedAttributes = [
            'id', 
            'name', 
            'class', 
            'type', 
            'placeholder', 
            'aria-label', 
            'role', 
            'data-testid', // Velmi důležité pro testy!
            'href',        // Užitečné u odkazů
            'value'        // Někdy užitečné u tlačítek
        ];

        allElements.forEach((el) => {
            const element = el as HTMLElement;
            
            // Získáme všechny atributy elementu
            const attributes = Array.from(element.attributes);

            attributes.forEach(attr => {
                // Pokud atribut není na seznamu povolených, pryč s ním
                // (Odstraní to dlouhé style="...", onclick="...", data-analytics="..." atd.)
                if (!allowedAttributes.includes(attr.name)) {
                    element.removeAttribute(attr.name);
                }
            });

            // 4. Vyčištění textu - zkrácení dlouhých odstavců
            // AI nepotřebuje číst celý článek, stačí začátek pro kontext
            /*
            // Volitelné: Pokud by bylo HTML pořád moc velké, odkomentuj toto:
            if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
                 const text = element.innerText;
                 if (text.length > 200) {
                     element.innerText = text.substring(0, 200) + '...';
                 }
            }
            */
        });

        // Vrátíme vyčištěné HTML
        return clone.outerHTML;
    });
}