// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';
import { mkdir } from 'node:fs/promises';
import path from 'path';
import { ensureFhirDocHtml } from './generate_fhir_doc'; // Import the new function

// Function to process a single version (R4 or R6)
async function generateVersionSummary(
  ai: GoogleGenAI,
  resourceName: string,
  version: 'r4' | 'r6',
  htmlFilePath: string,
  exTxtContent: string,
  outputSummaryFilePath: string,
  projectRootDir: string // Added for consistency, though outputSummaryFilePath is absolute
) {
  console.log(`[${resourceName}(${version})] Reading HTML file: ${htmlFilePath}`);
  const htmlFileContent = await Bun.file(htmlFilePath).text();

  const contents = [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: 'text/plain',
            data: Buffer.from(exTxtContent).toString('base64'),
          }
        },
        {
          text: `Please take the following definitions and output a view that'll be easy to read and work with later. Represent as markdown for narrative with embedded yaml blocks for info that's best structured. Include background / scope (can summarize), full element + constraint + search param details as yaml. Use your judgment, following the example above. The resource being processed is ${resourceName} version ${version}.`,
        },
        {
          inlineData: {
            mimeType: 'text/html',
            data: Buffer.from(htmlFileContent).toString('base64'),
          }
        }
      ],
    },
  ];

  const modelName = 'gemini-2.5-pro-preview-05-06';
  const config = {
    responseMimeType: 'text/plain',
  };

  console.log(`[${resourceName}(${version})] Generating content summary using Gemini model ${modelName}...`);
  const response = await ai.models.generateContentStream({
    model: modelName,
    config,
    contents,
  });

  const outputFile = Bun.file(outputSummaryFilePath);
  const writer = outputFile.writer();
  
  for await (const chunk of response) {
    if (chunk.text) {
      writer.write(chunk.text);
      // process.stdout.write(chunk.text); // Keep this commented out unless verbose streaming is needed
    }
  }
  await writer.end();
  console.log(`[${resourceName}(${version})] Successfully streamed summary to ${outputSummaryFilePath}`);
}

export async function ensureResourceSummaries(
  resourceName: string,
  projectRootDir: string,
  ai: GoogleGenAI
): Promise<{ r4SummaryPath: string; r6SummaryPath: string } | null> {
  const r4OutputDir = path.join(projectRootDir, 'summaries', 'r4');
  const r6OutputDir = path.join(projectRootDir, 'summaries', 'r6');
  const r4SummaryPath = path.join(r4OutputDir, `${resourceName.toLowerCase()}.md`);
  const r6SummaryPath = path.join(r6OutputDir, `${resourceName.toLowerCase()}.md`);

  try {
    const r4MdExists = await Bun.file(r4SummaryPath).exists();
    const r6MdExists = await Bun.file(r6SummaryPath).exists();

    if (r4MdExists && r6MdExists) {
      console.log(`[${resourceName}] Summary files ${r4SummaryPath} and ${r6SummaryPath} already exist. Skipping generation.`);
      return { r4SummaryPath, r6SummaryPath };
    }

    console.log(`[${resourceName}] Ensuring HTML document dependencies for summaries...`);
    const htmlDocPaths = await ensureFhirDocHtml(resourceName, projectRootDir);
    if (!htmlDocPaths) {
      console.error(`[${resourceName}] Failed to ensure HTML documents. Cannot generate summaries.`);
      return null;
    }

    console.log(`[${resourceName}] Generating resource summaries...`);

    const exTxtFilePath = path.join(import.meta.dir, 'examples', 'summarize.txt');
    console.log(`[${resourceName}] Reading example/template file for summaries: ${exTxtFilePath}`);
    const exTxtContent = await Bun.file(exTxtFilePath).text();

    // Ensure output directories exist
    await mkdir(r4OutputDir, { recursive: true });
    await mkdir(r6OutputDir, { recursive: true });

    // Process R4 summary if it doesn't exist
    if (!r4MdExists) {
        console.log(`[${resourceName}] Generating R4 summary as ${r4SummaryPath} does not exist.`);
        await generateVersionSummary(ai, resourceName, 'r4', htmlDocPaths.r4HtmlPath, exTxtContent, r4SummaryPath, projectRootDir);
    } else {
        console.log(`[${resourceName}] R4 summary ${r4SummaryPath} already exists.`);
    }

    // Process R6 summary if it doesn't exist
    if (!r6MdExists) {
        console.log(`[${resourceName}] Generating R6 summary as ${r6SummaryPath} does not exist.`);
        await generateVersionSummary(ai, resourceName, 'r6', htmlDocPaths.r6HtmlPath, exTxtContent, r6SummaryPath, projectRootDir);
    } else {
        console.log(`[${resourceName}] R6 summary ${r6SummaryPath} already exists.`);
    }
    
    return { r4SummaryPath, r6SummaryPath };

  } catch (error) {
    console.error(`[${resourceName}] Error in ensureResourceSummaries:`, error);
    return null;
  }
}

async function main() {
  const resourceNameArg = Bun.argv[2];
  if (!resourceNameArg) {
    console.error("Usage: bun run comparison/compare_resource.ts <ResourceName>");
    console.error("Example: bun run comparison/compare_resource.ts Patient");
    process.exit(1);
  }
  const resourceName = resourceNameArg.trim();

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const result = await ensureResourceSummaries(resourceName, process.cwd(), ai);

  if (result) {
    console.log(`[${resourceName}] Resource summary generation process completed.`);
  } else {
    console.error(`[${resourceName}] Resource summary generation process failed.`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
  });
}
