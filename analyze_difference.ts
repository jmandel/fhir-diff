#!/usr/bin/env bun
import { GoogleGenAI } from "@google/genai";
import { mkdir } from "node:fs/promises";
import path from "path";
import { ensureResourceSummaries } from "./generate_resource_summaries"; // Import the new function

export async function ensureDifferenceAnalysis(
  resourceName: string,
  projectRootDir: string,
  ai: GoogleGenAI
): Promise<string | null> {
  const outputDir = path.join(projectRootDir, 'analyzed', 'diff');
  const outputFilePath = path.join(outputDir, `${resourceName.toLowerCase()}.md`);

  try {
    if (await Bun.file(outputFilePath).exists()) {
      console.log(`[${resourceName}] Difference analysis file ${outputFilePath} already exists. Skipping generation.`);
      return outputFilePath;
    }

    console.log(`[${resourceName}] Ensuring resource summary dependencies for difference analysis...`);
    const summaryPaths = await ensureResourceSummaries(resourceName, projectRootDir, ai);
    if (!summaryPaths) {
      console.error(`[${resourceName}] Failed to ensure resource summaries. Cannot generate difference analysis.`);
      return null;
    }

    console.log(`[${resourceName}] Generating difference analysis...`);

    await mkdir(outputDir, { recursive: true });

    console.log(`[${resourceName}] Reading R4 summary: ${summaryPaths.r4SummaryPath}`);
    const r4MdContent = await Bun.file(summaryPaths.r4SummaryPath).text();

    console.log(`[${resourceName}] Reading R6 summary: ${summaryPaths.r6SummaryPath}`);
    const r6MdContent = await Bun.file(summaryPaths.r6SummaryPath).text();

    const exampleDiffPath = path.join(import.meta.dir, 'examples', 'patient_diff_example.md');
    console.log(`[${resourceName}] Reading example analysis for diff: ${exampleDiffPath}`);
    const exampleDiffAnalysisContent = await Bun.file(exampleDiffPath).text();

    const prompt = `You are an expert in FHIR (Fast Healthcare Interoperability Resources).
Your task is to analyze two markdown documents describing the R4 and R6 versions of a specific FHIR resource.
Produce a **human-readable diff report** that highlights the **meaningful changes** an implementer would need to understand when migrating from R4 to R6, or when supporting both versions.
Refer to the example analysis provided below (between <EXAMPLE_ANALYSIS_START> and <EXAMPLE_ANALYSIS_END>) for the style, level of detail, and focus expected.

**Focus your analysis on:**
1.  **Core Definition Changes:** Modifications to resource elements, including:
    *   Addition or removal of elements.
    *   Changes in data types.
    *   Adjustments to cardinality (e.g., 0..1 to 1..1, or 0..* to 1..*).
    *   Renaming of elements if it signifies a conceptual shift.
2.  **Scope and Usage Evolution:** How has the intended scope or common usage patterns of this resource changed between R4 and R6? Are there new use cases supported or old ones deprecated/altered?
3.  **Data Modeling Impacts:** What are the key differences in the underlying data model? How do these changes affect how data is structured, represented, or constrained?
4.  **Significant Constraint Changes:** Modifications to invariants, profiles, or other constraints that materially affect validation or interpretation.
5.  **Search Parameter Differences:** Notable additions, removals, or modifications to search parameters that impact querying capabilities.

**What to AVOID:**
*   **Minor Narrative Tweaks:** Do not focus on small, line-level edits to descriptive text in the markdown unless these reflect a substantive change in meaning, scope, or technical definition.
*   **Large YAML/JSON Dumps:** Your output should be a well-organized narrative. While you can use brief excerpts or citations from the provided markdown to illustrate a point, avoid embedding large, undigested chunks of YAML or JSON from the input documents. Emulate the style of the provided example.

**Output Format:**
*   Present your findings as a clear, well-structured markdown document, similar to the provided example.
*   Use headings, bullet points, and concise language.
*   Start with a high-level summary of the most impactful changes for an implementer.
*   For each significant change, explain what changed, why it likely changed (inferred design rationale if possible), and what the implications are for implementers.

Here is an example of the desired output format and content:
<EXAMPLE_ANALYSIS_START>
${exampleDiffAnalysisContent}
</EXAMPLE_ANALYSIS_END>

Now, analyze the following R4 and R6 documents for the resource: ${resourceName}.

Here is the R4 documentation:
<R4_MARKDOWN>
${r4MdContent}
</R4_MARKDOWN>

Here is the R6 documentation:
<R6_MARKDOWN>
${r6MdContent}
</R6_MARKDOWN>

Please provide your detailed, human-readable diff report for ${resourceName} below, following the style and focus of the example provided:`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ];

    const modelName = 'gemini-2.5-pro-preview-05-06';
    const config = {
      responseMimeType: 'text/plain',
    };

    console.log(`[${resourceName}] Generating difference analysis using Gemini model ${modelName}...`);
    const response = await ai.models.generateContentStream({
      model: modelName,
      config,
      contents,
    });

    const outputFile = Bun.file(outputFilePath);
    const writer = outputFile.writer();
    let firstChunk = true;

    for await (const chunk of response) {
      if (chunk.text) {
        if (firstChunk && process.stdout.isTTY) { // Only add newline to console if it's a TTY and first chunk
            process.stdout.write("\n");
            firstChunk = false;
        }
        writer.write(chunk.text);
        if (process.stdout.isTTY) process.stdout.write(chunk.text);
      }
    }
    await writer.end();
    if (process.stdout.isTTY) process.stdout.write("\n");

    console.log(`[${resourceName}] Successfully streamed difference analysis to ${outputFilePath}`);
    return outputFilePath;

  } catch (error) {
    console.error(`[${resourceName}] Error in ensureDifferenceAnalysis:`, error);
    return null;
  }
}

async function main() {
  const resourceNameArg = Bun.argv[2];
  if (!resourceNameArg) {
    console.error("Usage: bun run comparison/analyze_difference.ts <ResourceName>");
    console.error("Example: bun run comparison/analyze_difference.ts Patient");
    process.exit(1);
  }
  const resourceName = resourceNameArg.trim();

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const result = await ensureDifferenceAnalysis(resourceName, process.cwd(), ai);

  if (result) {
    console.log(`[${resourceName}] Difference analysis generation process completed.`);
  } else {
    console.error(`[${resourceName}] Difference analysis generation process failed.`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(err => {
    console.error("Script failed:", err);
    process.exit(1);
  });
} 