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
     * @param public - true pro sdílenou, false pro soukromou.
     */
    constructor(reportDefinitionId: string, name: string) {
        this.payload = {
            settings: {
                availableFilters: ["stockId", "stkitmType", "groupId", "goodsOwnerId", "paidBy", "cardOwnerId", "cardIssuerId"],
                dateModelType: undefined,
                dateFrom: undefined,
                dateTo: undefined,
                floatType: undefined,
                year: undefined,
                month: undefined,
                day: undefined,
                stockId: [],
                stkitmType: [],
                groupId: [],
                goodsOwnerId: [],
                paidBy: [],
                cardOwnerId: [],
                cardIssuerId: [],
                sort: "",
                partnerId: [], // Přidáme jako výchozí
                termId: [],    // Přidáme jako výchozí
            },
            name: name,
            public: false,
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

        // Vyčistíme ostatní datové typy
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

        // Vyčistíme ostatní datové typy
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

        // Vyčistíme ostatní datové typy
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
        return this;
    }

    /**
     * Nastaví seskupení (grouping).
     * @param groupIds - Pole ID pro seskupení.
     */
    public withGrouping(groupIds: string[]): this {
        this.payload.settings.groupId = groupIds;
        return this;
    }
     /**
     * Přidá filtr na partnery (držitele fleet karet).
     * @param partnerIds - Pole ID partnerů.
     */
    public withPartnerFilter(partnerIds: number[]): this {
        this.payload.settings.partnerId = partnerIds;
        return this;
    }

     /**
     * Finální metoda, která vrátí kompletní objekt payloadu.
     */
    public build(): any {
        return this.payload;
    }
}

