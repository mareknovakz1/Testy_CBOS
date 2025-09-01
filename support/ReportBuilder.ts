/**
 * ReportBuilder - Třída pro stavbu komplexního payloadu pro vytváření sestav.
 * Používá Builder Pattern.
 */
export class ReportBuilder {
    private payload: any;

    /**
     * Konstruktor vytvoří základní, minimální kostru pro sestavu.
     * @param reportDefinitionId - ID definice sestavy (např. 'D001').
     * @param name - Název sestavy.
     */
    constructor(reportDefinitionId: string, name: string) {
        this.payload = {
            settings: {
                // Tento seznam budeme nyní upravovat dynamicky
                availableFilters: ["stockId", "stkitmType", "grouping", "goodsOwnerId", "paidBy", "cardOwnerId", "cardIssuerId"],
                dateModelType: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                floatType: undefined,
                year: undefined,
                month: undefined,
                day: undefined,
                stockId: [],
                stkitmType: [],
                grouping: [],
                goodsOwnerId: [],
                paidBy: [],
                cardOwnerId: [],
                cardIssuerId: [],
                sort: "",
                partnerId: [],
                termId: [],
            },
            name: name,
            public: false, // Výchozí hodnota
            reportDefinitionId: reportDefinitionId
        };
    }

    /**
     * Nastaví časový rozsah OD-DO pro sestavu.
     * @param from - Datum "od".
     * @param to - Datum "do" (nepovinné).
     */
    public withDateRange(from: Date, to: Date | null = null): this {
        this.payload.settings.dateModelType = 'range';
        this.payload.settings.dateFrom = from.toISOString();
        this.payload.settings.dateTo = to ? to.toISOString() : null;
        this.payload.settings.floatType = undefined;
        this.payload.settings.year = undefined;
        this.payload.settings.month = undefined;
        this.payload.settings.day = undefined;
        return this;
    }

    /**
     * Nastaví plovoucí časové období (např. 'q1', 'lastMonth').
     * @param period - Řetězec identifikující plovoucí období.
     */
    public withFloatingPeriod(period: string): this {
        this.payload.settings.dateModelType = 'float';
        this.payload.settings.floatType = period;
        this.payload.settings.dateFrom = null;
        this.payload.settings.dateTo = null;
        this.payload.settings.year = undefined;
        this.payload.settings.month = undefined;
        this.payload.settings.day = undefined;
        return this;
    }

    /**
     * Nastaví přesné datum (den, měsíc, rok).
     * @param date - Objekt data, ze kterého se hodnoty extrahují.
     */
    public withExactDate(date: Date): this {
        this.payload.settings.dateModelType = 'ymd';
        this.payload.settings.year = date.getFullYear();
        this.payload.settings.month = date.getMonth() + 1; // Měsíce v JS jsou 0-11
        this.payload.settings.day = date.getDate();
        this.payload.settings.dateFrom = null;
        this.payload.settings.dateTo = null;
        this.payload.settings.floatType = undefined;
        return this;
    }

    /**
     * Přidá filtr na sklad.
     * @param stockIds - Pole ID skladů.
     */
    public withStockFilter(stockIds: number[]): this {
        this.payload.settings.stockId = stockIds;
        // stockId je už ve výchozím availableFilters, není třeba přidávat
        return this;
    }

    /**
     * Nastaví seskupení (grouping).
     * @param groupIds - Pole ID pro seskupení.
     */
    public withGrouping(groupIds: string[]): this {
        this.payload.settings.grouping = groupIds;
        // grouping je už ve výchozím availableFilters
        return this;
    }

    /**
     * Přidá filtr na partnery (držitele fleet karet).
     * @param partnerIds - Pole ID partnerů.
     */
    public withPartnerFilter(partnerIds: number[]): this {
        this.payload.settings.partnerId = partnerIds;

        // --- OPRAVA: ZAJISTÍME, ŽE JE FILTR DEKLAROVÁN JAKO DOSTUPNÝ ---
        if (!this.payload.settings.availableFilters.includes('partnerId')) {
            this.payload.settings.availableFilters.push('partnerId');
        }
        return this;
    }

    /**
     * Přidá filtr na terminál.
     * @param terminalIds - Pole ID terminálů.
     */
    public withTerminalFilter(terminalIds: number[]): this {
        this.payload.settings.termId = terminalIds;

        // --- OPRAVA: ZAJISTÍME, ŽE JE FILTR DEKLAROVÁN JAKO DOSTUPNÝ ---
        if (!this.payload.settings.availableFilters.includes('termId')) {
            this.payload.settings.availableFilters.push('termId');
        }
        return this;
    }
    
    /**
     * Nastaví, zda má být sestava veřejná (sdílená).
     * @param isPublic - true pro veřejnou, false pro soukromou.
     */
    public withPublicFlag(isPublic: boolean): this {
        this.payload.public = isPublic;
        return this;
    }


    /**
     * Finální metoda, která vrátí kompletní objekt payloadu.
     */
    public build(): any {
        // Před vrácením můžeme uklidit nepoužívané (undefined) klíče, ale není to nutné
        return this.payload;
    }
}
