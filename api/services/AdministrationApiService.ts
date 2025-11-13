/**
 * @file AdministrationApiService.ts
 * @author AI Assistant
 * @date 29.09.2025
 * @description
 * This file contains AdministrationApiService, a specialized service for communicating
 * with the administration and code lists API for CBOS.
 */

import { BaseApiClient } from '../BaseApiClient';
import * as t from '../types/administrion'; // Placeholder for type definitions

export class AdministrationApiService extends BaseApiClient {

    // ========================
    // Group: Status
    // ========================

    /**
     * Checks if the administration service is running.
     */
    public async getStatus(): Promise<t.StatusResponse> {
        return this.get(`/administration-api/status`);
    }

    // ========================
    // Group: Parameters
    // ========================

    /**
     * Loads a list of ERP parameters for a given account.
     * @param account - The accounting identifier (IČO).
     */
    public async getErpParameters(account: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/erpParameters/${account}`);
    }

    /**
     * Loads a list of parameters from the accounts_parameters table.
     * @param account - The network for which parameters are being loaded.
     * @param parameterName - The specific parameter name to retrieve.
     */
    public async getAccountsParameters(account: string, parameterName?: string): Promise<t.GenericApiResponse> {
        const params = parameterName ? { parameterName } : {};
        return this.get(`/administration-api/accountsParameters/${account}`, params);
    }

    // ========================
    // Group: Excise Duty Classes
    // ========================

    /**
     * Creates a new excise duty (SD) class.
     */
    public async createCtClass(payload: t.CreateCtClassPayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/ctClasses`, payload);
    }

    /**
     * Loads the details of a specific excise duty class, including its rates.
     * @param id - The ID of the excise duty class.
     */
    public async getCtClass(id: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/ctClasses/${id}`);
    }

    /**
     * Creates a new rate for a selected excise duty class.
     * @param ctClassId - The ID of the excise duty class.
     */
    public async createCtClassRate(ctClassId: number, payload: t.CreateCtClassRatePayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/ctClasses/${ctClassId}`, payload);
    }

    /**
     * Updates a selected excise duty rate.
     * @param id - The ID of the excise duty rate item.
     */
    public async updateCtClassRate(id: number, payload: t.UpdateCtClassRatePayload): Promise<void> {
        return this.put(`/administration-api/ctClassesItems/${id}`, payload);
    }

    /**
     * Deletes a selected excise duty rate.
     * @param id - The ID of the excise duty rate item.
     */
    public async deleteCtClassRate(id: number): Promise<void> {
        return this.delete(`/administration-api/ctClassesItems/${id}`);
    }

    // ========================
    // Group: VAT Classes
    // ========================

    /**
     * Creates a new VAT class.
     */
    public async createVatClass(payload: t.CreateVatClassPayload): Promise<void> {
        return this.post(`/administration-api/vatClasses`, payload);
    }

    /**
     * Deletes a VAT class.
     * @param id - The ID of the VAT class.
     */
    public async deleteVatClass(id: number): Promise<void> {
        return this.delete(`/administration-api/vatClasses/${id}`);
    }

    /**
     * Loads the details of a specific VAT class, including its rates.
     * @param id - The ID of the VAT class.
     */
    public async getVatClass(id: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/vatClasses/${id}`);
    }

    /**
     * Creates a new rate for a selected VAT class.
     * @param vatClassId - The ID of the VAT class.
     */
    public async createVatClassRate(vatClassId: number, payload: t.CreateVatRatePayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/vatClasses/${vatClassId}`, payload);
    }

    /**
     * Updates a selected VAT rate.
     * @param id - The ID of the VAT rate item.
     */
    public async updateVatClassRate(id: number, payload: t.UpdateVatRatePayload): Promise<void> {
        return this.put(`/administration-api/vatClassesItems/${id}`, payload);
    }

    /**
     * Deletes a selected VAT rate.
     * @param id - The ID of the VAT rate item.
     */
    public async deleteVatClassRate(id: number): Promise<void> {
        return this.delete(`/administration-api/vatClassesItems/${id}`);
    }
    
    // ========================
    // Group: Stocks (Business Locations)
    // ========================

    /**
     * Creates a new stock (business location).
     */
    public async createStock(payload: t.CreateStockPayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/stocks`, payload);
    }

    /**
     * Loads detailed information about a stock.
     * @param id - The ID of the stock.
     */
    public async getStock(id: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/stocks/${id}`);
    }

    /**
     * Updates information for a stock.
     * @param id - The ID of the stock.
     */
    public async updateStock(id: number, payload: t.UpdateStockPayload): Promise<t.GenericApiResponse> {
        return this.put(`/administration-api/stocks/${id}`, payload);
    }
    
    // ========================
    // Group: fsFeature
    // ========================

    /**
     * Gets the current local fsFeatures for a stock.
     * @param stockId - The ID of the stock.
     */
    public async getCurrentLocalFsFeatures(stockId: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/stocks/fsfeatures/${stockId}`);
    }

    /**
     * Gets local fsFeature definitions for editing.
     * @param stockId - The ID of the stock.
     */
    public async getLocalFsFeatureDefinitions(stockId: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/stocks/${stockId}/fsfeatureDefinitions`);
    }

    /**
     * Creates a new local fsFeature for a stock.
     * @param stockId - The ID of the stock.
     */
    public async createLocalFsFeature(stockId: number, payload: t.CreateFsFeaturePayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/stocks/${stockId}/fsfeature`, payload);
    }

    /**
     * Updates a local fsFeature.
     * @param stockId - The ID of the stock.
     * @param featureId - The ID of the feature.
     */
    public async updateLocalFsFeature(stockId: number, featureId: number, payload: t.UpdateFsFeaturePayload): Promise<void> {
        return this.put(`/administration-api/stocks/${stockId}/fsfeature/${featureId}`, payload);
    }

    /**
     * Deletes a local fsFeature.
     * @param stockId - The ID of the stock.
     * @param featureId - The ID of the feature.
     */
    public async deleteLocalFsFeature(stockId: number, featureId: number): Promise<void> {
        return this.delete(`/administration-api/stocks/${stockId}/fsfeature/${featureId}`);
    }
    
    /**
     * Gets central fsFeature definitions for an account owner.
     * @param accOwner - The account owner identifier.
     */
    public async getCentralFsFeatureDefinitions(accOwner: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/fsfeatureDefinitions/${accOwner}`);
    }
    
    /**
     * Gets central fsFeatures for an account owner.
     * @param accOwner - The account owner identifier.
     */
    public async getCentralFsFeatures(accOwner: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/fsfeature/${accOwner}`);
    }
    
    /**
     * Creates a central fsFeature.
     * @param accOwner - The account owner identifier.
     */
    public async createCentralFsFeature(accOwner: string, payload: t.CreateCentralFsFeaturePayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/fsfeature/${accOwner}`, payload);
    }

    /**
     * Updates a central fsFeature.
     * @param accOwner - The account owner identifier.
     * @param featureId - The ID of the feature.
     */
    public async updateCentralFsFeature(accOwner: string, featureId: string, payload: t.UpdateCentralFsFeaturePayload): Promise<void> {
        return this.put(`/administration-api/fsfeature/${accOwner}/${featureId}`, payload);
    }
    
    /**
     * Deletes a central fsFeature.
     * @param accOwner - The account owner identifier.
     * @param featureId - The ID of the feature.
     */
    public async deleteCentralFsFeature(accOwner: string, featureId: string): Promise<void> {
        return this.delete(`/administration-api/fsfeature/${accOwner}/${featureId}`);
    }

    // ========================
    // Group: Euro-Oil Card Request
    // ========================

    /**
     * Creates a new request for a Euro-Oil card.
     */
    public async createEuroOilCardRequest(payload: t.CreateEuroOilCardRequestPayload): Promise<void> {
        // Expects 201 response with headers
        return this.post(`/administration-api/euroOilCardRequests`, payload);
    }

    // ========================
    // Group: Partners
    // ========================

    /**
     * Gets the details of a partner.
     * @param id - The partner ID.
     */
    public async getPartner(id: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/partners/${id}`);
    }

    /**
     * Gets the current status of a partner and its relationships to stocks.
     * @param id - The partner ID.
     */
    public async getPartnerStatus(id: number): Promise<t.PartnerStatus> {
        return this.get(`/administration-api/partners/${id}/status`);
    }
    
    /**
     * Creates a new partner.
     */
    public async createPartner(payload: t.CreatePartnerPayload): Promise<void> {
        // Expects 201 response with headers
        return this.post(`/administration-api/partners`, payload);
    }
    
    /**
     * Updates an existing partner.
     * @param id - The partner ID.
     */
    public async updatePartner(id: number, payload: t.UpdatePartnerPayload): Promise<void> {
        return this.put(`/administration-api/partners/${id}`, payload);
    }
    
    /**
     * Gets a list of payments for a partner.
     * @param partnerId - The partner ID.
     */
    public async getPartnerPayments(partnerId: number): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/partners/${partnerId}/payments`);
    }

    /**
     * Adds a new payment for a partner.
     * @param partnerId - The partner ID.
     */
    public async addPartnerPayment(partnerId: number, payload: t.AddPaymentPayload): Promise<void> {
        return this.post(`/administration-api/partners/${partnerId}/payments`, payload);
    }
    
    /**
     * Cancels a partner's payment.
     * @param partnerId - The partner ID.
     * @param id - The payment ID.
     */
    public async cancelPartnerPayment(partnerId: number, id: number): Promise<void> {
        return this.delete(`/administration-api/partners/${partnerId}/payments/${id}`);
    }

    // ========================
    // Group: Hot Keys
    // ========================

    /**
     * Gets the list of hot key definitions for a POS terminal.
     * @param stockId - The ID of the stock.
     * @param posTerminalKey - The key of the POS terminal.
     */
    public async getHotKeyDefinitions(stockId: number, posTerminalKey: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/listOfHotKeysDefinitions/${stockId}/${posTerminalKey}`);
    }

    /**
     * Creates a new hot key button.
     * @param stockId - The ID of the stock.
     */
    public async createHotKey(stockId: number, payload: t.CreateHotKeyPayload): Promise<void> {
        return this.post(`/administration-api/hotKeysDefinitions/${stockId}`, payload);
    }
    
    /**
     * Changes the positions of multiple hot key buttons.
     * @param stockId - The ID of the stock.
     */
    public async updateHotKeyPositions(stockId: number, payload: t.UpdateHotKeyPositionsPayload): Promise<void> {
        return this.put(`/administration-api/hotKeysDefinitions/${stockId}`, payload);
    }
    
    /**
     * Updates a specific hot key button.
     * @param stockId - The ID of the stock.
     * @param id - The ID of the hot key.
     */
    public async updateHotKey(stockId: number, id: number, payload: t.UpdateHotKeyPayload): Promise<void> {
        return this.put(`/administration-api/hotKeysDefinitions/${stockId}/${id}`, payload);
    }
    
    /**
     * Deletes a hot key button.
     * @param stockId - The ID of the stock.
     * @param id - The ID of the hot key.
     */
    public async deleteHotKey(stockId: number, id: number): Promise<void> {
        return this.delete(`/administration-api/hotKeysDefinitions/${stockId}/${id}`);
    }
    
    // ========================
    // Group: Users
    // ========================

    /**
     * Creates a new user.
     */
    public async createUser(payload: t.CreateUserPayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/users`, payload);
    }
    
    /**
     * Gets the details of a user.
     * @param operator - The operator identifier.
     */
    public async getUser(operator: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/users/${operator}`);
    }
    
    /**
     * Updates a user's details.
     * @param operator - The operator identifier.
     */
    public async updateUser(operator: string, payload: t.UpdateUserPayload): Promise<t.GenericApiResponse> {
        return this.put(`/administration-api/users/${operator}`, payload);
    }

    /**
     * Gets the rights of a user for a specific scheme for editing.
     * @param operator - The operator identifier.
     * @param scheme - The rights scheme (e.g., 'gpos', 'cbos').
     */
    public async getUserRightsForEdit(operator: string, scheme: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/users/rights/${operator}/${scheme}`);
    }

    /**
     * Updates the rights of a user for a specific scheme.
     * @param operator - The operator identifier.
     * @param scheme - The rights scheme.
     */
    public async updateUserRights(operator: string, scheme: string, payload: t.UpdateUserRightsPayload): Promise<t.GenericApiResponse> {
        return this.put(`/administration-api/users/rights/${operator}/${scheme}`, payload);
    }

    // ========================
    // Group: Mass Actions
    // ========================

    /**
     * Gets a list of items designated for changes.
     * @param changeType - The type of change.
     */
    public async getListOfChangedItems(changeType: string): Promise<t.GenericApiResponse> {
        return this.get(`/administration-api/massOperations/listOfChangedItems/${changeType}`);
    }
    
    /**
     * Prepares the data for a mass price change preview.
     * @param stockId - The ID of the stock.
     */
    public async getChangePricePreview(stockId: number, payload: t.ChangePricePreviewPayload): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/massOperations/changePricePreview/${stockId}`, payload);
    }

    /**
     * Finalizes and processes the mass price change.
     * @param stockId - The ID of the stock.
     */
    public async finalizePriceChange(stockId: number): Promise<t.GenericApiResponse> {
        return this.post(`/administration-api/massOperations/changePriceFinalize/${stockId}`, {});
    }
    
    // ... Additional mass operation methods can be added here ...
    
    // ========================
    // Group: WebSocket
    // ========================

    /**
     * Sends a WebSocket event to clients.
     * @param params - The event parameters.
     
    public async sendWebSocketEvent(params: t.WebSocketEventParams): Promise<void> {
        return this.post(`/administration-api/sendToWebSocket`, {}, params);
    }*/
    
    // ==============================
    // Group: Lokální nadskupiny zboží
    // ===============================

    /**
     * Lokální nadskupiny zboží - načtení seznamu nadskupin pro dané OBCHODNÍ MÍSTO
     * @param stockId - ID obchodního místa (skladu)
     */
    public async getStockCardsSupergroupsLocal(stockId: number): Promise<t.GenericApiResponse> {
    return this.get(`/administration-api/stockCardsSupergroupsLocal/${stockId}`);
    }
     // ==============================
    // Group: Lokální skupiny zboží
    // ===============================

    /**
     * Lokální nadskupiny zboží - načtení seznamu nadskupin pro dané OBCHODNÍ MÍSTO
     * @param stockId - ID obchodního místa (skladu)
     */
     public async getStockCardsGroupsLocal(stockId: number): Promise<t.GenericApiResponse> {
    return this.get(`/administration-api/stockCardsGroupsLocal/${stockId}`);
    }

    /**
     * Získá seznam definic karet pro daný účet.
     * @param accOwner Identifikace sítě (např. "60193531")
     * @param params Objekt s volitelnými query parametry (offset, limit, sort)
     */
    public async getListOfCardDefinitions(
    accOwner: string,
    params?: t.GetListOfCardDefinitionsParams
    ): Promise<t.GenericApiResponse> {
    
    // BaseApiClient automaticky převede 'params' na query string
    return this.get(`/administration-api/listOfCardDefinitions/${accOwner}`, params);
    }

    /**
   * Sestaví seznam centrálních skupin zboží.
   * @param accOwner Identifikace sítě (povinný parametr cesty)
   * @param params Objekt s volitelnými query parametry (vatclsId, ctclsId, sort, atd.)
   */
  public async getStockCardsGroupsCentral(
    accOwner: string,
    params?: t.GetStockCardsGroupsCentralParams
  ): Promise<t.GenericApiResponse> {
    
    // BaseApiClient automaticky převede 'params' na query string
    return this.get(`/administration-api/stockCardsGroupsCentral/${accOwner}`, params);
  }
}
