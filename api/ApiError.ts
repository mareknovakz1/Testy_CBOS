// soubor: api/ApiError.ts

/**
 * @file ApiError.ts
 * @description
 * Definuje vlastní chybovou třídu ApiError, která kromě zprávy
 * uchovává i HTTP status kód a tělo odpovědi pro lepší debugging.
 */
export class ApiError extends Error {
    constructor(
        message: string,
        // Umožňuje přímý přístup ke status kódu, např. error.status
        public readonly status: number,
        public readonly body: string | null
    ) {
        super(message);
        // Udržuje správné trasování zásobníku volání
        Error.captureStackTrace(this, this.constructor);
        this.name = 'ApiError';
    }
}