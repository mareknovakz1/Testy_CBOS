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
        availableFilters: ["stockId", "stkitmType", "groupId", "goodsOwnerId", "paidBy", "cardOwnerId", "cardIssuerId"],
        dateModelType: "range",
        dateFrom: new Date().toISOString(), // Výchozí datum je "teď"
        dateTo: null,
        stockId: [],
        stkitmType: [],
        groupId: [],
        goodsOwnerId: [],
        paidBy: [],
        cardOwnerId: [],
        cardIssuerId: [],
        sort: ""
      },
      name: name,
      public: false,
      reportDefinitionId: reportDefinitionId
    };
  }

  /**
   * Nastaví časový rozsah pro sestavu.
   * @param from - Datum "od".
   * @param to - Datum "do" (nepovinné).
   */
  public withDateRange(from: Date, to: Date | null = null): this {
    this.payload.settings.dateFrom = from.toISOString();
    this.payload.settings.dateTo = to ? to.toISOString() : null;
    return this; // Vrací 'this' pro řetězení metod
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
   * Finální metoda, která vrátí kompletní objekt payloadu.
   */
  public build(): any {
    return this.payload;
  }
}
