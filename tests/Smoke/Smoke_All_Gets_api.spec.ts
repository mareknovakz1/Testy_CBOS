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
import { expect, test } from '../../support/fixtures/auth.fixture';
import { logger } from '../../support/logger';
import endpointsToTest from '../../test-data/Smoke_All_Gets.json'; // 

// Definice typů pro lepší kontrolu a napovídání
type ApiService = 'reports' | 'documents' | 'system';
type EndpointData = {
  testId: string; 
  name: string;
  service: ApiService;
  method: string;
  params: any[];
};

let responseStatus: number;

test.describe('API Smoke Tests - GET Endpoints', () => {

    // =============================================================
    // I. Test pro veřejně dostupný endpoint (bez autorizace)
    // =============================================================
    test(`Endpoint GET /api/status should be available and return 200 OK - real status @smoke @API @high @GETs ${responseStatus}`, async ({ request }) => {
        logger.info('Spouštím smoke test pro veřejný GET /api/status...');
        const publicApiClient = new ApiClient(request, ''); // Klient bez tokenu

        const response = await publicApiClient.system.getStatus();
        const status = response.status();
        const contentType = response.headers()['content-type'];

        logger.info(`Přijata odpověď se statusem: ${status} a Content-Type: ${contentType}`);

        expect(status, 'Očekáváme status 200 OK').toBe(200);
        expect(contentType, 'Očekáváme Content-Type obsahující text/html').toContain('text/html');
        
        logger.silly(`Odpověď z /api/status: ${await response.text()}`);
        logger.info('Test pro GET /api/status úspěšně dokončen.');
    });

    // =============================================================
    // II. Testy pro autorizované GET endpointy (řízené JSONem)
    // =============================================================
    test.describe('Authenticated GETs from JSON', () => {
        let apiClient: ApiClient;

        test.beforeEach(async ({ request, authToken }) => {
            logger.info('Inicializuji ApiClient pro autorizované GET endpointy...');
            expect.soft(authToken, 'Autorizační token musí být k dispozici z auth fixture!').toBeTruthy();
            apiClient = new ApiClient(request, authToken);
            logger.info('ApiClient byl úspěšně inicializován.');
        });
        
        // Dynamically generate tests for each endpoint defined in the JSON file
       // Dynamically generate tests for each endpoint defined in the JSON file
for (const endpoint of endpointsToTest as EndpointData[]) {
    test(`${endpoint.testId}: Endpoint "${endpoint.name}" should be available and return a 2xx status real status: ${responseStatus}`, async () => {
        logger.info(`Running smoke test for ${endpoint.testId}: ${endpoint.name}`);
        
        
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