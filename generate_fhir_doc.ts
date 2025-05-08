#!/usr/bin/env bun
import { parse } from 'node-html-parser';
import fs from 'fs';
import path from 'path';

const R4_BASE_URL_SPEC = "https://hl7.org/fhir/";
const BUILD_BASE_URL = "https://build.fhir.org/"; // R5/R6 typically

async function fetchAndExtractSegment(url: string): Promise<string> {
    console.log(`Fetching: ${url}`);
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching ${url}: ${response.status} ${response.statusText}`);
            return `<p>Error fetching ${url}: ${response.status} ${response.statusText}</p>`;
        }
        const html = await response.text();
        const root = parse(html);
        const segmentContent = root.querySelector('#segment-content');

        if (segmentContent) {
            return segmentContent.innerHTML;
        } else {
            console.warn(`Could not find #segment-content in ${url}`);
            return `<p>Could not find #segment-content in ${url}</p>`;
        }
    } catch (error) {
        console.error(`Error processing ${url}:`, error);
        return `<p>Error processing ${url}: ${(error as Error).message}</p>`;
    }
}

function createHtmlPage(title: string, ...contents: string[]): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        h1, h2, h3 { color: #333; }
        .content-block { border: 1px solid #eee; margin-bottom: 20px; padding: 15px; background-color: #f9f9f9; }
        .content-block h2 { margin-top: 0; font-size: 1.2em; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 5px;}
    </style>
</head>
<body>
    <h1>${title}</h1>
    ${contents.map(content => `<div class="content-block">${content}</div>`).join('\n')}
</body>
</html>`;
}

export async function ensureFhirDocHtml(
    resourceName: string,
    projectRootDir: string
): Promise<{ r4HtmlPath: string; r6HtmlPath: string } | null> {
    const r4Dir = path.join(projectRootDir, 'r4');
    const r6Dir = path.join(projectRootDir, 'r6');
    const r4OutputPath = path.join(r4Dir, `${resourceName.toLowerCase()}.html`);
    const r6OutputPath = path.join(r6Dir, `${resourceName.toLowerCase()}.html`);

    try {
        const r4Exists = await Bun.file(r4OutputPath).exists();
        const r6Exists = await Bun.file(r6OutputPath).exists();

        if (r4Exists && r6Exists) {
            console.log(`[${resourceName}] HTML output files ${r4OutputPath} and ${r6OutputPath} already exist. Skipping generation.`);
            return { r4HtmlPath: r4OutputPath, r6HtmlPath: r6OutputPath };
        }

        console.log(`[${resourceName}] Generating HTML documentation...`);

        // Ensure output directories exist using Bun's fs for consistency if Bun.mkdir is available, else keep node:fs
        // For now, keeping node:fs as Bun.mkdir is not as prominent in docs for sync recursive.
        if (!fs.existsSync(r4Dir)) fs.mkdirSync(r4Dir, { recursive: true });
        if (!fs.existsSync(r6Dir)) fs.mkdirSync(r6Dir, { recursive: true });

        // --- R4 Generation ---
        console.log(`[${resourceName}] --- Generating R4 Document ---`);
        const r4_url1 = `${R4_BASE_URL_SPEC}${resourceName.toLowerCase()}.html`;
        const r4_url2 = `${BUILD_BASE_URL}${resourceName.toLowerCase()}-definitions.html`;

        const r4_content1 = await fetchAndExtractSegment(r4_url1);
        const r4_content2 = await fetchAndExtractSegment(r4_url2);

        const r4_pageTitle = `FHIR R4: ${resourceName}`;
        const r4_fullHtml = createHtmlPage(
            r4_pageTitle,
            `<h2>Content from ${r4_url1}</h2>\n${r4_content1}`,
            `<h2>Content from ${r4_url2}</h2>\n${r4_content2}`
        );
        await Bun.write(r4OutputPath, r4_fullHtml);
        console.log(`[${resourceName}] R4 document saved to: ${r4OutputPath}`);

        // --- R6 (or current build) Generation ---
        console.log(`[${resourceName}] --- Generating R6 (Build) Document ---`);
        const r6_url1 = `${BUILD_BASE_URL}${resourceName.toLowerCase()}.html`;
        const r6_url2 = `${BUILD_BASE_URL}${resourceName.toLowerCase()}-definitions.html`;

        const r6_content1 = await fetchAndExtractSegment(r6_url1);
        const r6_content2 = await fetchAndExtractSegment(r6_url2);

        const r6_pageTitle = `FHIR R6/Build: ${resourceName}`;
        const r6_fullHtml = createHtmlPage(
            r6_pageTitle,
            `<h2>Content from ${r6_url1}</h2>\n${r6_content1}`,
            `<h2>Content from ${r6_url2}</h2>\n${r6_content2}`
        );
        await Bun.write(r6OutputPath, r6_fullHtml);
        console.log(`[${resourceName}] R6 (Build) document saved to: ${r6OutputPath}`);
        
        return { r4HtmlPath: r4OutputPath, r6HtmlPath: r6OutputPath };

    } catch (error) {
        console.error(`[${resourceName}] Error in ensureFhirDocHtml:`, error);
        return null;
    }
}

async function main() {
    const resourceNameArg = Bun.argv[2];

    if (!resourceNameArg) {
        console.error("Usage: bun run comparison/generate_fhir_doc.ts <ResourceName>");
        console.error("Example: bun run comparison/generate_fhir_doc.ts Patient");
        process.exit(1);
    }
    const resourceName = resourceNameArg.trim(); // Keep original casing for URLs, convert toLower inside ensure func if needed for paths
    
    const result = await ensureFhirDocHtml(resourceName, process.cwd());

    if (result) {
        console.log(`[${resourceName}] HTML document generation process completed.`);
    } else {
        console.error(`[${resourceName}] HTML document generation process failed.`);
        process.exit(1); // Exit with error if the core function failed when run from CLI
    }
}

// Only run main if the script is executed directly
if (import.meta.main) {
    main().catch(err => {
        console.error("Script failed:", err);
        process.exit(1);
    });
}
