#!/usr/bin/env bun
import path from 'path';
import { GoogleGenAI } from '@google/genai'; // For initializing AI client
import { usCoreResourceNames } from './fetch_us_core';
import { ensureDifferenceAnalysis } from './analyze_difference';
import { main as fetchProfilesMain } from './get_us_core_profiles_2'; // Import main and alias
import { main as analyzeMigrationsMain } from './analyze_us_core_migration'; // Import main and alias

async function main() {
    console.log("Starting comprehensive FHIR R4 vs R6 comparison and US Core migration analysis...");

    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY environment variable is not set.");
        console.error("This key is required by underlying analysis scripts.");
        console.error("Please set it before running this script.");
        process.exit(1);
    }
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const projectRootDir = process.cwd(); // Assuming scripts are run from project root

    let overallSuccess = true;

    // --- Step 1: Fetch and preprocess US Core Profile files ---
    console.log("\n--- Stage 1: Fetching and Preprocessing US Core Profiles ---");
    try {
        await fetchProfilesMain(); // This function in get_us_core_profiles_2 handles its own logging
        console.log("--- Stage 1: US Core Profile fetching and preprocessing completed. ---");
    } catch (error) {
        console.error("--- Stage 1: Failed to fetch/preprocess US Core profiles: ---", error);
        overallSuccess = false;
        // Decide if we should exit or try to continue. For now, let's continue if possible.
    }

    // --- Step 2: Analyze Base Resource Differences (R4 vs R6) ---
    console.log(`\n--- Stage 2: Analyzing Base FHIR Resource Differences (R4 vs R6) for ${usCoreResourceNames.length} US Core resources ---`);
    let diffSuccessCount = 0;
    let diffFailureCount = 0;

    for (const resourceName of usCoreResourceNames) { // Changed to for...of loop
        console.log(`\n--- Processing Base Resource: ${resourceName} ---`);
        try {
            // ensureDifferenceAnalysis expects projectRootDir to be where 'analysis' and 'sources' will be created.
            // If get_us_core_profiles_2.ts creates 'us-core-profiles' at projectRootDir,
            // and analyze_us_core_migration.ts expects it there (relative to its own path with import.meta.dir),
            // then projectRootDir should be the actual root of the 'comparison' checkout.
            const resultPath = await ensureDifferenceAnalysis(resourceName, projectRootDir, ai);
            if (resultPath) {
                console.log(`[${resourceName}] Successfully completed base resource difference analysis. Output: ${resultPath}`);
                diffSuccessCount++;
            } else {
                console.error(`[${resourceName}] Base resource difference analysis failed for ${resourceName}.`);
                diffFailureCount++;
            }
        } catch (error) {
            console.error(`[${resourceName}] An unexpected error occurred during base resource difference analysis for ${resourceName}:`, error);
            diffFailureCount++;
        }
        console.log(`--- Finished processing Base Resource: ${resourceName} ---`);
    }
    console.log("\n--- Stage 2: Base FHIR Resource Difference Analysis Summary ---");
    console.log(`Successfully analyzed base resources: ${diffSuccessCount}`);
    console.log(`Failed to analyze base resources:   ${diffFailureCount}`);
    if (diffFailureCount > 0) {
        overallSuccess = false;
        console.log("Check logs above for details on base resource analysis failures.");
    }

    // --- Step 3: Analyze US Core Profile Migrations ---
    if (overallSuccess || diffSuccessCount > 0) { // Only run if previous steps had some success, or weren't fatal
        console.log("\n--- Stage 3: Analyzing US Core Profile Migrations (R4 to R6) ---");
        try {
            // analyzeMigrationsMain runs for all profiles it finds and handles its own GEMINI_API_KEY
            await analyzeMigrationsMain();
            console.log("--- Stage 3: US Core Profile migration analysis attempt completed. Check its logs for details. ---");
            // analyze_us_core_migration.ts has its own success/failure logging.
            // To integrate its success/failure more deeply, its main() would need to return status.
        } catch (error) {
            console.error("--- Stage 3: Failed to run US Core profile migration analysis script: ---", error);
            overallSuccess = false;
        }
    } else {
        console.log("\n--- Stage 3: Skipping US Core Profile Migrations due to earlier failures. ---");
    }


    console.log("\n--- Overall Script Execution Complete ---");
    if (overallSuccess && diffFailureCount === 0) {
        console.log("All stages reported success or completed without critical script errors.");
    } else {
        console.error("One or more stages reported failures or critical errors. Please review the logs.");
        process.exitCode = 1; // Indicate failure
    }
}

main().catch(err => {
    console.error("Critical error in run_fhir_comparison.ts:", err);
    process.exit(1);
}); 