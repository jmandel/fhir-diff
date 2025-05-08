#!/usr/bin/env bun
import { GoogleGenAI } from "@google/genai";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { Glob } from "bun";

// --- Configuration ---
const PROFILE_JSON_DIR = path.join(import.meta.dir, 'us-core-profiles', 'json'); // Relative to script location
const PROFILE_HTML_DIR = path.join(import.meta.dir, 'us-core-profiles', 'html'); // Relative to script location
const BASE_DIFF_DIR = path.join(import.meta.dir, 'analysis', 'diff');           // Relative to script location
const OUTPUT_DIR = path.join(import.meta.dir, 'analysis', 'us-core-migration'); // Relative to script location

// Map special baseDefinition URLs to base resource types
const BASE_DEF_MAP: { [key: string]: string } = {
    'http://hl7.org/fhir/StructureDefinition/vitalsigns': 'Observation'
};

// --- Helper Functions ---

/**
 * Loads all US Core profile JSON definitions from the specified directory.
 * @returns A Map where keys are canonical URLs and values are profile JSON objects.
 */
async function loadProfileDefinitions(profileJsonDir: string): Promise<Map<string, any>> {
    console.log(`Loading profile definitions from ${profileJsonDir}...`);
    const profileMap = new Map<string, any>();
    const glob = new Glob("*.json");

    try {
        for await (const file of glob.scan(profileJsonDir)) {
            const filePath = path.join(profileJsonDir, file);
            try {
                const fileContent = await Bun.file(filePath).text();
                const profileJson = JSON.parse(fileContent);
                if (profileJson.resourceType === 'StructureDefinition' && profileJson.url) {
                    profileMap.set(profileJson.url, profileJson);
                } else {
                    console.warn(`Skipping file ${file} as it does not seem to be a valid StructureDefinition with a URL.`);
                }
            } catch (readError) {
                console.error(`Error reading or parsing ${filePath}:`, readError);
            }
        }
    } catch (scanError) {
        console.error(`Error scanning directory ${profileJsonDir}:`, scanError);
        // Depending on severity, you might want to throw or exit here
    }
    
    console.log(`Loaded ${profileMap.size} profile definitions.`);
    return profileMap;
}

/**
 * Resolves the inheritance tree for a given profile URL.
 * @param profileUrl The canonical URL of the starting profile.
 * @param profileMap The map of all loaded profiles (URL -> JSON).
 * @returns An array of profile JSON objects, starting with the requested profile,
 *          followed by its parents up the chain as found in the map.
 */
function resolveProfileTree(profileUrl: string, profileMap: Map<string, any>): any[] {
    const tree: any[] = [];
    let currentUrl: string | undefined = profileUrl;

    while (currentUrl && profileMap.has(currentUrl)) {
        const profile = profileMap.get(currentUrl);
        if (!profile) break; // Should not happen if map.has is true, but safety check
        tree.push(profile);
        
        // Prevent infinite loops (though unlikely with baseDefinition)
        if (tree.length > 20) { 
            console.warn(`Warning: Profile tree depth exceeded 20 for ${profileUrl}. Stopping resolution.`);
            break;
        } 
        
        currentUrl = profile.baseDefinition;
    }
    return tree;
}

/**
 * Extracts the base FHIR resource type from the last profile in a tree.
 * Handles special mappings like vitalsigns -> Observation.
 * @param profileTree The resolved profile tree array.
 * @returns The lowercase base resource type name (e.g., "observation") or null if not determinable.
 */
function getBaseResourceType(profileTree: any[]): string | null {
    if (!profileTree || profileTree.length === 0) {
        return null;
    }
    const topProfile = profileTree[profileTree.length - 1];
    const baseDefinitionUrl = topProfile.baseDefinition;

    if (!baseDefinitionUrl) {
        console.warn(`Profile ${topProfile.url} has no baseDefinition.`);
        return null;
    }

    // Check special mappings first
    if (BASE_DEF_MAP[baseDefinitionUrl]) {
        return BASE_DEF_MAP[baseDefinitionUrl].toLowerCase();
    }

    // Attempt to derive from URL standard pattern
    try {
        const url = new URL(baseDefinitionUrl);
        const parts = url.pathname.split('/');
        const potentialType = parts.pop(); // Get the last part
        if (potentialType && potentialType === potentialType.charAt(0).toUpperCase() + potentialType.slice(1)) {
             // Basic check: Does it look like a FHIR Resource Name (starts with uppercase)?
            return potentialType.toLowerCase();
        }
    } catch (e) {
        console.warn(`Could not parse baseDefinition URL ${baseDefinitionUrl} to determine base resource type for ${topProfile.url}`);
    }
    
    console.warn(`Could not determine base resource type for profile ${topProfile.url} from baseDefinition: ${baseDefinitionUrl}`);
    return null;
}

// --- Main Analysis Logic (Placeholder for now) ---

async function analyzeSingleProfile(
    profileUrl: string,
    profileMap: Map<string, any>,
    ai: GoogleGenAI
) {
    const profileJson = profileMap.get(profileUrl);
    if (!profileJson || !profileJson.id) {
        console.error(`[${profileUrl}] Profile not found in map or missing ID.`);
        return false;
    }
    const profileId = profileJson.id;
    const outputFilePath = path.join(OUTPUT_DIR, `${profileId}.md`);

    // 1. Skip if output already exists
    if (await Bun.file(outputFilePath).exists()) {
        console.log(`[${profileId}] Analysis file ${outputFilePath} already exists. Skipping.`);
        return true; // Indicate success (already done)
    }

    console.log(`[${profileId}] Starting analysis...`);

    // 2. Resolve hierarchy
    const profileTree = resolveProfileTree(profileUrl, profileMap);
    if (profileTree.length === 0) {
        console.error(`[${profileId}] Could not resolve profile tree.`);
        return false;
    }
    console.log(`[${profileId}] Resolved profile tree with depth: ${profileTree.length}`);

    // 3. Get base resource type
    const baseResourceType = getBaseResourceType(profileTree);
    if (!baseResourceType) {
        console.error(`[${profileId}] Could not determine base FHIR resource type.`);
        return false;
    }
    console.log(`[${profileId}] Determined base resource type: ${baseResourceType}`);

    // 4. Read base resource diff analysis
    const baseDiffPath = path.join(BASE_DIFF_DIR, `${baseResourceType}.md`);
    let baseDiffContent = '';
    try {
        if (await Bun.file(baseDiffPath).exists()) {
            console.log(`[${profileId}] Reading base diff: ${baseDiffPath}`);
            baseDiffContent = await Bun.file(baseDiffPath).text();
        } else {
            console.warn(`[${profileId}] Base diff file not found: ${baseDiffPath}. Proceeding without it.`);
            baseDiffContent = `<!-- Base diff file ${baseDiffPath} not found -->`;
        }
    } catch (e) {
        console.error(`[${profileId}] Error reading base diff file ${baseDiffPath}:`, e);
        baseDiffContent = `<!-- Error reading base diff file ${baseDiffPath} -->`;
    }

    // 5. Read profile HTML
    const profileHtmlPath = path.join(PROFILE_HTML_DIR, `StructureDefinition-${profileId}.html`);
    let profileHtmlContent = '';
    try {
        if (await Bun.file(profileHtmlPath).exists()) {
            console.log(`[${profileId}] Reading profile HTML: ${profileHtmlPath}`);
            profileHtmlContent = await Bun.file(profileHtmlPath).text();
        } else {
            console.warn(`[${profileId}] Profile HTML file not found: ${profileHtmlPath}.`);
            profileHtmlContent = `<!-- Profile HTML file ${profileHtmlPath} not found -->`;
        }
    } catch (e) {
        console.error(`[${profileId}] Error reading profile HTML file ${profileHtmlPath}:`, e);
        profileHtmlContent = `<!-- Error reading profile HTML file ${profileHtmlPath} -->`;
    }

    // 6. Construct Prompt
    const profileTreeJsonString = JSON.stringify(profileTree, null, 2);
    const prompt = `You are an expert in FHIR and US Core profiles tasked with producing a concise and actionable R4 to R6 migration impact report for the US Core profile \`${profileId}\`.
    
You are plain-spoken and direct, and never prolix.

**Your Goal:** Create a focused report that helps the FHIR US Core editorial team (working on \`${profileId}\`) understand the *specific, practical implications* of migrating US Core spec from FHIR R4 -> FHIR R6. The report must be focused and avoid discussing R6 changes that have no material impact on how \`${profileId}\` is defined or used.

**Input Provided:**
1.  **Target Profile JSON:** The JSON definition of \`${profileId}\`.
2.  **Profile Hierarchy JSON:** JSON definitions for \`${profileId}\` and its ancestors.
3.  **Target Profile HTML:** HTML documentation for \`${profileId}\`.
4.  **Base Resource R4->R6 Diff:** A markdown summary of changes to \`${baseResourceType}\` from R4 to R6.


**Report Structure and Content - Please Adhere Strictly:**

---

** Your report must have these three sections:**

## Impact of R6 Changes on \`${profileId}\`**

*   **Purpose:** To analyze any R6 changes to \`${baseResourceType}\` that directly affect the *core elements, constraints, and patterns defined, mandated, or relied on by \`${profileId}\`*.
*   **Method:**
    1.  Identify the required structural elements, recommended elements, Must Support elements, cardinality constraints, critical terminology bindings, and any unique patterns relied on in the \`${profileId}\` definition.
    2.  For *each* of these identified aspects of \`${profileId}\`, SILENTLY consider:
        * **Relevant R6 Base Change(s):** Briefly determine the specific change(s) in the R6 base \`${baseResourceType}\` that directly pertain to this aspect of \`${profileId}\`.
        * **Direct Impact on \`${profileId}\`:** Consider the consequence for the profile and implementers. No need to dwell on trivial changes like a few extra elments in a value set, but structural changes or mandated elements are important to cover.
        * **No Significant Impact:** If an identified aspect of \`${profileId}\` is *not significantly impacted* by any R6 base changes (e.g., a constraint in \`${profileId}\` makes a base change irrelevant), you don't need to mention this profile aspect.
        * ONLY if there is a significant impact, output a discussion of the issue.
*   **Avoid:**
    *   Listing every element of \`${profileId}\`. Focus on those that are central to its definition or where R6 changes have a notable interaction.
    *   Discussing R6 base changes that have no clear relevance or interaction with the specific ways \`${profileId}\` constrains or uses \`${baseResourceType}\`.
---

## Migration Summary & Actionable Takeaways for \`${profileId}\`**

*   **Purpose:** To provide a concise, actionable summary for US Core editorial team and implementers migrating applications that use \`${profileId}\`.
*   **Content:**
    1. **US Core Profile Changes Required:** Based on section 1, will \`${profileId}\` need to be re-profiled? If so, what changes are required?
    2. **Implementation Changes Required:** Based on Section 1, will implementers need to update their code to produce or consume \`${profileId}\` data? If so, what changes are required?
    4. **New R6 Features Relevant to Profile Intent (Optional & Brief):** If any new R6 features (even if not directly impacting current profile constraints) strongly align with the *intent or common usage patterns* of \`${profileId}\` , mention them as potential enhancements for R6-native implementations of the profile.
*   **Focus:** Actionable advice and a clear sense of the migration effort specifically for \`${profileId}\`.
---

## Overall Migration Impact

Your analysis *must* conclude with \`## Overall Migration Impact\` section

Below the section header, write "Impact: None / Low / Significant" so signify how much work the US Core editorial team will need to do to migrate the profile.

Use the following criteria for the overall impact assessment:
*   **None:** The profile will be fully compatible with R6 without any changes.
*   **Low:** No changes, or just a few changes that are easy to implement (e.g. new codes, a renamed element, a remapped datatype, a new valueset, etc)
*   **Significant:** Significant new decisions will need to be made about how to implement the profile in R6. Community consensus will need to be reached about the best way to define the profile.

Explain briefly.

---

**Output Format Notes:**
* Use clear, concise markdown.
* Speak in plain language.
* Synthesize information; do not simply copy from inputs.

**Input Data:**

<targetProfileJson profileId="${profileId}">
${JSON.stringify(profileJson, null, 2)}
</targetProfileJson>

<profileHierarchyJson>
${profileTreeJsonString}
</profileHierarchyJson>

<targetProfileHtml profileId="${profileId}">
${profileHtmlContent}
</targetProfileHtml>

<baseResourceDiff baseResourceType="${baseResourceType}">
${baseDiffContent}
</baseResourceDiff>

--- End of Input Data ---

Please provide the migration analysis report for the \`${profileId}\` profile.`;

    // 7. Call Gemini
    console.log(`[${profileId}] Calling Gemini for analysis...`);
    console.log(prompt);
    const contents = [{ role: 'user', parts: [{ text: prompt }] }];
    const modelName = 'gemini-2.5-pro-preview-05-06';
    const config = { responseMimeType: 'text/plain' };

    try {
        const response = await ai.models.generateContentStream({ model: modelName, config, contents });
        const outputFile = Bun.file(outputFilePath);
        const writer = outputFile.writer();

        for await (const chunk of response) {
            if (chunk.text) {
                writer.write(chunk.text);
            }
        }
        await writer.end();
        console.log(`[${profileId}] Successfully wrote analysis to ${outputFilePath}`);
        return true;
    } catch (geminiError) {
        console.error(`[${profileId}] Gemini API call failed:`, geminiError);
        // Optionally write error details to the output file path?
        // await Bun.write(outputFilePath, `Error during Gemini analysis: ${geminiError}`);
        return false;
    }
}

// --- Script Entry Point ---

export async function main() {
    const singleProfileBaseName = Bun.argv[2]; // Check for CLI argument

    if (singleProfileBaseName) {
        console.log(`Attempting to analyze single profile with base name: ${singleProfileBaseName}`);
    } else {
        console.log("Starting US Core Profile Migration Analysis for all profiles...");
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY environment variable is not set.");
        process.exit(1);
    }
    const apiKey = process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey: apiKey });

    // Always load all definitions, as they are needed for resolving the tree
    const profileMap = await loadProfileDefinitions(PROFILE_JSON_DIR);
    if (profileMap.size === 0) {
        console.error("No profile definitions loaded. Exiting.");
        process.exit(1);
    }

    try {
        await mkdir(OUTPUT_DIR, { recursive: true });
        console.log(`Output directory ${OUTPUT_DIR} ensured.`);
    } catch (error) {
        console.error(`Failed to create output directory ${OUTPUT_DIR}:`, error);
        process.exit(1);
    }

    let successCount = 0;
    let failureCount = 0;

    if (singleProfileBaseName) {
        // --- Process Single Profile --- 
        const expectedJsonFilename = `${singleProfileBaseName}.json`;
        let targetProfileUrl: string | null = null;

        // Find the URL corresponding to the filename
        for (const [url, profileData] of profileMap.entries()) {
            if (profileData.resourceType === 'StructureDefinition' && profileData.id && 
                `${profileData.resourceType}-${profileData.id}.json` === expectedJsonFilename) {
                targetProfileUrl = url;
                break;
            }
        }

        if (!targetProfileUrl) {
             console.error(`Could not find a loaded profile matching the base name: ${singleProfileBaseName}`);
             console.error(`Looked for file: ${expectedJsonFilename} (derived from your input) by matching profile.id.`);
             failureCount++; 
        } else {
            const profileIdFromMap: string = profileMap.get(targetProfileUrl)?.id || targetProfileUrl; // Ensure string
            console.log(`\n--- Processing Single Profile: ${profileIdFromMap} (URL: ${targetProfileUrl}) ---`);
            try {
                const success = await analyzeSingleProfile(targetProfileUrl, profileMap, ai);
                if (success) {
                    successCount++;
                } else {
                    console.error(`[${profileIdFromMap}] Analysis failed.`);
                    failureCount++;
                }
            } catch (error) {
                console.error(`[${profileIdFromMap}] Unexpected error during analysis:`, error);
                failureCount++;
            }
        }

    } else {
        // --- Process All Profiles --- 
        const profileUrls: string[] = Array.from(profileMap.keys());
        console.log(`Total profiles to process: ${profileUrls.length}`);
        let currentIndex = 0;

        for (const profileUrl of profileUrls) { // Using for...of loop
            currentIndex++;
            // Ensure profileData is fetched and id is correctly typed as string
            const profileData: any = profileMap.get(profileUrl);
            const profileId: string = (profileData?.id as string | undefined) || profileUrl; 
            
            console.log(`\n--- [${currentIndex}/${profileUrls.length}] Processing Profile: ${profileId} (URL: ${profileUrl}) ---`);
            
            try {
                // profileUrl is guaranteed to be a string here from profileUrls: string[]
                const success = await analyzeSingleProfile(profileUrl, profileMap, ai);
                if (success) {
                    successCount++;
                } else {
                    console.error(`[${profileId}] Analysis failed.`);
                    failureCount++;
                }
            } catch (error) {
                console.error(`[${profileId}] Unexpected error during analysis:`, error);
                failureCount++;
            }
        }
    }

    console.log("\n--- US Core Profile Migration Analysis Complete ---");
    console.log(`Successfully analyzed profiles: ${successCount}`);
    console.log(`Failed to analyze profiles:   ${failureCount}`);
}

if (import.meta.main) {
    main().catch(err => {
        console.error("Critical error in analyze_us_core_migration.ts:", err);
        process.exit(1);
    });
} 