#!/usr/bin/env bun
import { spawnSync } from 'bun';
import path from 'path';

// Hardcoded list of US Core base FHIR resource names
export const usCoreResourceNames: string[] = [
    "AllergyIntolerance",
    "CarePlan",
    "CareTeam",
    "Condition",
    "Coverage",
    "Device",
    "DiagnosticReport",
    "DocumentReference",
    "Encounter",
    "Goal",
    "Immunization",
    "Location",
    "Medication",
    "MedicationDispense",
    "MedicationRequest",
    "Observation",
    "Organization",
    "Patient",
    "Practitioner",
    "PractitionerRole",
    "Procedure",
    "Provenance",
    "QuestionnaireResponse",
    "RelatedPerson",
    "ServiceRequest",
    "Specimen"
];

async function main() {
    if (usCoreResourceNames.length === 0) {
        console.error("Resource list is empty. This shouldn't happen with a hardcoded list.");
        process.exit(1);
    }

    console.log("US Core base FHIR resources to process (hardcoded list):");
    usCoreResourceNames.forEach(name => console.log(`- ${name}`));
    console.log("\nStarting generation...\n");

    // Assuming generate_fhir_doc.ts is in the same directory
    const generatorScriptPath = path.resolve(import.meta.dir, 'generate_fhir_doc.ts');

    for (const resourceName of usCoreResourceNames) {
        console.log(`--- Processing: ${resourceName} ---`);
        try {
            const proc = spawnSync(
                ['bun', 'run', generatorScriptPath, resourceName],
                {
                    stdio: ['inherit', 'inherit', 'inherit'], // Pass through stdin, stdout, stderr
                }
            );

            if (proc.exitCode !== 0) {
                console.error(`Error generating documentation for ${resourceName}. Script exited with code ${proc.exitCode}.`);
                // Optionally, you might want to stop on first error:
                // process.exit(1);
            } else {
                console.log(`Successfully processed ${resourceName}.\n`);
            }
        } catch (error) {
            console.error(`Failed to spawn generator script for ${resourceName}:`, error);
        }
    }

    console.log("\n--- All US Core resources processed. ---");
}

if (require.main === module) {
    main().catch(err => {
        console.error("Script failed:", err);
        process.exit(1);
    });
}
