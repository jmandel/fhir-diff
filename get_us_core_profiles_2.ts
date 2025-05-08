import { parse } from 'node-html-parser';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = 'https://build.fhir.org/ig/HL7/US-Core/';
const MAIN_PAGE_URL = new URL('profiles-and-extensions.html', BASE_URL).href;
const OUTPUT_DIR_BASE = 'us-core-profiles';
const OUTPUT_DIR_HTML = path.join(OUTPUT_DIR_BASE, 'html');
const OUTPUT_DIR_JSON = path.join(OUTPUT_DIR_BASE, 'json');

function stripAllStyleAttributes(element: import('node-html-parser').HTMLElement) {
  // Remove style from the element itself
  if (element.hasAttribute('style')) {
    element.removeAttribute('style');
  }
  // Remove style from all descendant elements
  const allChildren = element.querySelectorAll('*');
  allChildren.forEach(child => {
    if (child.hasAttribute('style')) {
      child.removeAttribute('style');
    }
  });
}

async function fetchContent(url: string): Promise<string | null> {
  console.log(`  Fetching: ${url}`);
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`    Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`    Error fetching ${url}:`, error);
    return null;
  }
}

export async function main() {
  console.log(`Fetching main page: ${MAIN_PAGE_URL}`);
  const mainHtmlContent = await fetchContent(MAIN_PAGE_URL);

  if (!mainHtmlContent) {
    console.error('Could not fetch the main page. Exiting.');
    return;
  }

  // 1. Isolate the "Profiles" section
  const profilesSectionStartMarker = '<h3 id="profiles">';
  const extensionsSectionStartMarker = '<h3 id="extensions">';

  const profilesStartIndex = mainHtmlContent.indexOf(profilesSectionStartMarker);
  const extensionsStartIndex = mainHtmlContent.indexOf(extensionsSectionStartMarker);

  if (profilesStartIndex === -1 || extensionsStartIndex === -1) {
    console.error('Could not find profile or extensions section markers in the main page. Exiting.');
    return;
  }

  const profilesHtmlSection = mainHtmlContent.substring(
    profilesStartIndex + profilesSectionStartMarker.length,
    extensionsStartIndex
  );
  
  // 2. Parse the isolated "Profiles" section
  const root = parse(profilesHtmlSection);

  // 3. Extract profile links
  const profileHtmlRelativeUrls = new Set<string>();
  const anchorElements = root.querySelectorAll('a');

  for (const a of anchorElements) {
    const href = a.getAttribute('href');
    if (href && href.startsWith('StructureDefinition-us-core-') && href.endsWith('.html')) {
      profileHtmlRelativeUrls.add(href);
    }
  }

  if (profileHtmlRelativeUrls.size === 0) {
    console.log('No profile links found in the "Profiles" section.');
    return;
  }

  console.log(`\nFound ${profileHtmlRelativeUrls.size} unique profile links to process.`);

  // 4. Create output directories
  try {
    await mkdir(OUTPUT_DIR_HTML, { recursive: true });
    await mkdir(OUTPUT_DIR_JSON, { recursive: true });
    console.log(`Output directories "${OUTPUT_DIR_HTML}" and "${OUTPUT_DIR_JSON}" ensured.\n`);
  } catch (error) {
    console.error('Failed to create output directories:', error);
    return;
  }

  // 5. Fetch and save each profile's HTML and JSON
  const tasks: Promise<void>[] = [];

  for (const htmlRelativeUrl of profileHtmlRelativeUrls) {
    tasks.push(
      (async () => {
        const htmlFilename = path.basename(htmlRelativeUrl);
        const jsonFilename = htmlFilename.replace('.html', '.json');
        const jsonRelativeUrl = htmlRelativeUrl.replace('.html', '.json');

        const fullHtmlUrl = new URL(htmlRelativeUrl, BASE_URL).href;
        const fullJsonUrl = new URL(jsonRelativeUrl, BASE_URL).href;

        const htmlOutputPath = path.join(OUTPUT_DIR_HTML, htmlFilename);
        const jsonOutputPath = path.join(OUTPUT_DIR_JSON, jsonFilename);

        console.log(`Processing profile: ${htmlFilename.replace('.html', '')}`);

        // Fetch and save HTML
        const profileHtmlContent = await fetchContent(fullHtmlUrl);
        if (profileHtmlContent) {
          try {
            const root = parse(profileHtmlContent);
            const tabsDiv = root.querySelector('div#tabs');

            if (tabsDiv) {
              const tabsKeyDiv = tabsDiv.querySelector('div#tabs-key');
              if (tabsKeyDiv) {
                // Replace tabsDiv with tabsKeyDiv in the main document structure
                tabsDiv.replaceWith(tabsKeyDiv);
                console.log(`    Replaced div#tabs with its child div#tabs-key.`);
              } else {
                console.warn(`    WARNING: div#tabs-key not found within div#tabs in ${fullHtmlUrl}. Full HTML structure (minus styles) will be saved.`);
              }
            } else {
              console.warn(`    WARNING: div#tabs not found in ${fullHtmlUrl}. Full HTML structure (minus styles) will be saved.`);
            }

            // Strip styles from the entire modified root document
            stripAllStyleAttributes(root);
            let htmlToSave = root.toString(); // Start with the current full HTML string

            const startMarker = '<h2 id="root"'; // As per user: no closing >
            const endMarker = '<script type="text/javascript" src="assets/js/jquery.js"></script>';

            const startIndex = htmlToSave.indexOf(startMarker);
            if (startIndex !== -1) {
                htmlToSave = htmlToSave.substring(startIndex);
                console.log(`    Trimmed content before '${startMarker}'`);
            } else {
                console.warn(`    WARNING: Start marker "${startMarker}" not found. No leading content trimmed.`);
            }

            // Search for end marker in the potentially already trimmed string from the start
            const endIndex = htmlToSave.indexOf(endMarker);
            if (endIndex !== -1) {
                // Include the end marker itself by taking substring up to its end
                htmlToSave = htmlToSave.substring(0, endIndex + endMarker.length);
                console.log(`    Trimmed content after '${endMarker}'`);
            } else {
                console.warn(`    WARNING: End marker "${endMarker}" not found. No trailing content trimmed.`);
            }

            await Bun.write(htmlOutputPath, htmlToSave);
            console.log(`    Saved HTML: ${htmlOutputPath}`);
          } catch (writeError) {
            console.error(`    Failed to write HTML ${htmlOutputPath}:`, writeError);
          }
        }

        // Fetch, modify, and save JSON
        const profileJsonString = await fetchContent(fullJsonUrl);
        if (profileJsonString) {
          try {
            const jsonData: any = JSON.parse(profileJsonString); // Use 'any' for simplicity here

            // Remove "snapshot" and "text" keys
            delete jsonData.snapshot;
            delete jsonData.text;

            const modifiedJsonString = JSON.stringify(jsonData, null, 2); // Pretty print
            await Bun.write(jsonOutputPath, modifiedJsonString);
            console.log(`    Saved JSON: ${jsonOutputPath}`);
          } catch (jsonError) {
            console.error(`    Error processing JSON for ${fullJsonUrl}:`, jsonError);
            console.error(`    Problematic JSON content was: ${profileJsonString.substring(0, 200)}...`);
          }
        }
        console.log(`  Finished processing: ${htmlFilename.replace('.html', '')}\n`);
      })()
    );
  }

  await Promise.all(tasks);
  console.log('\nAll profile fetching and saving attempts complete.');
}

if (import.meta.main) {
  main().catch(console.error);
}
