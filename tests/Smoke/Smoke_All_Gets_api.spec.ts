/**
 * @file Smoke_All_Gets_api.spec.ts
 * @author Marek Novák
 * @date 29.09.2025
 * @description
 * This file contains smoke tests for key API GET endpoints.
 * It uses a data-driven approach, loading endpoints and parameters from an
 * external JSON file.
 * The goal is to confirm that each endpoint is available and returns a
 * successful 2xx status code, failing on any client (4xx) or server (5xx) errors.
 * @logic
 * 1. The test dynamically iterates through endpoints listed in an external JSON file.
 * 2. Each API call is wrapped in a try...catch block to handle both successful
 * and unsuccessful responses.
 * 3. On failure, the numeric HTTP status code is extracted from the error message.
 * 4. A custom failure message is generated to distinguish between Client Errors
 * (4xx) and Server Errors (5xx).
 * 5. A single, strict assertion (`expect(status).toBeLessThan(300)`) verifies
 * that the response was successful, failing for any non-2xx status.
 */

import { ApiClient } from '../../api/ApiClient';
import { baseURL, port } from '../../support/constants';
import { expect, test } from '../../support/fixtures/auth.fixture';
import { logger } from '../../support/logger';
import endpointsToTest from '../../test-data/Smoke_All_Gets.json'; 

// Definice typů pro lepší kontrolu a napovídání
type ApiService = 'reports' | 'documents' | 'system';
type EndpointData = {
  testId: string; 
  name: string;
  tags: string[];
  service: ApiService;
  method: string;
  params: any[];
};

let responseStatus: number;

test.describe('API Smoke Tests - GET Endpoints', () => {

 /*   
    // =============================================================
    // I. Test public endpoints (without authorization)
    // =============================================================
    test.describe('Public GETs from JSON', () => {
        for (const endpoint of endpointsStatus) {
            test(`Endpoint "${endpoint.name}" should be 2xx or 3xx`, async ({ request }) => {
                logger.info(`Running enhanced test for public endpoint: ${baseURL}${endpoint.name}`);

                const publicApiClient = new ApiClient(request, '');
                const service = (publicApiClient as any)[endpoint.service];
                if (!service) {
                    throw new Error(`Service "${endpoint.service}" not found on ApiClient.`);
                }

                const methodToCall = service[endpoint.method];
                if (typeof methodToCall !== 'function') {
                    throw new Error(`Method "${endpoint.method}" not found on service "${endpoint.service}".`);
                }

                const response = await methodToCall.apply(service);
                const status = response.status();
                logger.info(`Received response with status: ${status}`);

                // --- NEW: Verify Status Code is Not an Error ---
                // This single check handles both 4xx and 5xx errors.
                // It provides a clear, custom message if the check fails.
                expect(status, `Request failed. Status ${status} indicates a server error (5xx).`).toBeLessThan(500);
                expect(status, `Request failed. Status ${status} indicates a client error (4xx).`).toBeLessThan(400);
            
                
                logger.info(`Test for "${endpoint.name}" completed successfully.`);
            });
        }
    });

 */   
    // =============================================================
    // II. Testy pro autorizované GET endpointy 
    // =============================================================
    test.describe('Authenticated GETs from JSON', () => {
        let apiClient: ApiClient;

        test.beforeEach(async ({ request, authToken }) => {
            logger.info('Inicializuji ApiClient pro autorizované GET endpointy...');
            expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
            apiClient = new ApiClient(request, authToken);
            logger.info('ApiClient byl úspěšně inicializován.');
        });
        
 // Dynamicky generuje testy pro každý endpoint definovaný v JSON souboru
for (const endpoint of endpointsToTest as EndpointData[]) {

    const tagsString = (endpoint.tags && endpoint.tags.length > 0) 
                ? ` ${endpoint.tags.join(' ')}` 
                : '';

const testTitle = `${endpoint.testId}: Endpoint "${endpoint.name}"${tagsString}`;
    
            // KROK 3: Použijeme nový název v testu
            test(testTitle, async () => {
                
                // KROK 4: Deklarujeme 'responseStatus' uvnitř testu, ne globálně
                let responseStatus: number; 
    
                logger.info(`Running smoke test for ${endpoint.testId}: ${endpoint.name}`);
                
                logger.debug(`Attempting to call ${endpoint.service}.${endpoint.method} with params: ${JSON.stringify(endpoint.params)}`);  
        
        logger.debug(`Attempting to call ${endpoint.service}.${endpoint.method} with params: ${JSON.stringify(endpoint.params)}`);
        try {
            logger.trace('Calling API method...');
            const service = apiClient[endpoint.service] as any;
            const methodToCall = service[endpoint.method];
            if (typeof methodToCall !== 'function') {
                throw new Error(`Method "${endpoint.method}" does not exist on service "${endpoint.service}".`);
            }
            logger.trace('Invoking method...');
            await methodToCall.apply(service, endpoint.params);
            responseStatus = 200;
        } catch (error: any) {
            const statusMatch = error.message.match(/Status (\d+)/);
            if (statusMatch) {
                logger.debug(`Extracted status code from error message: ${statusMatch[1]}`);
                responseStatus = parseInt(statusMatch[1], 10);
                logger.error(`Endpoint returned a non-2xx status: ${responseStatus}.`, error.message);
            } else {
                logger.debug('No status code found in error message.');
                logger.error('Could not parse status code from error. Test is failing.', error);
                throw error;
            }
        }
        logger.trace('Determining final response status for assertion...');
        logger.debug(`Response status determined: ${responseStatus}`);

        // --- NEW AND IMPROVED ASSERTION BLOCK ---
        const isSuccess = responseStatus < 300;
        
        logger.trace('Preparing assertion for response status...');
        let failureMessage = `Test failed because the API returned a non-2xx status.`;
        if (!isSuccess) {
            let failureType = 'Unexpected Response';
            if (responseStatus >= 500) failureType = 'Server Error';
            else if (responseStatus >= 400) failureType = 'Client Error';
            else if (responseStatus >= 300) failureType = 'Redirection';
            
            // This detailed message will now be the primary output on failure
            failureMessage += `\n\n  - Received Status: ${responseStatus} (${failureType})`;
        }

        // This assertion provides a much clearer failure report
        expect(isSuccess, failureMessage).toBe(true);
        
            if (isSuccess) {
                logger.info(`Test for "${endpoint.name}" completed successfully with status ${responseStatus}.`);
                }
            });
        }
    });
});