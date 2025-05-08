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
  const outputDir = path.join(projectRootDir, 'analysis', 'diff');
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

    const prompt = `You are an expert in FHIR (Fast Healthcare Interoperability Resources) and a skilled technical writer.
Your task is to analyze two markdown documents describing the R4 and R6 versions of a specific FHIR resource.
Produce a **human-readable migration guide** that highlights the **meaningful changes** an implementer would need to understand when migrating from R4 to R6, or when supporting both versions.
Refer to the example analysis provided below (between <EXAMPLE_ANALYSIS_START> and <EXAMPLE_ANALYSIS_END>) for the style, level of detail, and focus expected.

**Key Objectives for the Migration Guide:**

1.  **Clarity & Readability:**
    *   Use clear, unambiguous language, assuming an audience of FHIR implementers.
    *   Employ a well-structured narrative with logical flow (e.g., executive summary first, then detailed sections).
    *   Utilize headings, subheadings, lists, and formatting (like **bolding** for emphasis or \`code\` for element names) effectively to enhance readability.
    *   Avoid excessive jargon; if FHIR-specific terminology is used, it should be standard and contextually clear.

2.  **Actionability & Implementer Focus:**
    *   Clearly state *what* changed for each significant item.
    *   Explain the *impact* of the change on implementers (e.g., "systems must now support...", "data migration required for...", "queries need updating...").
    *   Provide specific *actions* or *considerations* for implementers.
    *   Explicitly identify "Breaking Changes" or changes requiring significant effort with clear markers or phrasing.

3.  **Density & Conciseness (Narrative Style Preferred):**
    *   Convey information efficiently without unnecessary verbosity.
    *   While side-by-side comparisons can be useful internally, **present the findings in a primarily narrative or descriptive list format rather than relying heavily on tables for element-by-element comparisons.** Tables can be used sparingly for very specific, compact data (e.g., a small list of value set additions) but should not be the primary method for detailing element changes.
    *   Summarize common patterns of change effectively.

4.  **Precision & Accuracy:**
    *   Correctly identify all significant changes in elements, types, cardinality, bindings, constraints, and search parameters.
    *   Use exact FHIR element names, data types, and value set URIs where relevant.
    *   Accurately describe the "before" (R4) and "after" (R6) states.
    *   Include the rationale for changes (inferred design rationale) if it aids understanding and is evident or commonly known.

5.  **Comprehensiveness (within scope):**
    *   Cover all major aspects of the resource definition relevant to implementers:
        *   Overall scope/purpose evolution.
        *   Element additions, removals, and modifications (name, type, cardinality, description shifts, binding changes).
        *   Constraint changes (additions, removals, modifications).
        *   Search parameter changes.
    *   Address potential data migration implications.

**Specific Areas of Analysis (Focus on these points):**

1.  **Executive Summary:** Start with a high-level overview of the most impactful changes and key actions for implementers.
2.  **Core Definition Changes:** Detail modifications to resource elements:
    *   Addition or removal of elements.
    *   Changes in data types (e.g., \`string\` to \`markdown\`, \`CodeableConcept\` to \`CodeableReference\`).
    *   Adjustments to cardinality that change requirements (e.g., \`0..1\` to \`1..1\`).
    *   Renaming of elements if it signifies a conceptual shift (e.g., \`imagingStudy\` to \`study\`).
    *   Significant changes to element descriptions that alter meaning or scope.
    *   Changes to value set bindings (new values, different strength, different value set).
3.  **Scope and Usage Evolution:** Explain how the intended scope or common usage patterns of this resource have changed between R4 and R6. Are there new use cases supported or old ones deprecated/altered?
4.  **Data Modeling Impacts:** Discuss key differences in the underlying data model. How do these changes affect data structuring, representation, or constraints? (e.g., increased polymorphism, new relationships).
5.  **Significant Constraint Changes:** Highlight modifications to invariants or other constraints that materially affect validation or interpretation. Clearly state if constraints were added or removed.
6.  **Search Parameter Differences:** Detail notable additions, removals, or modifications to search parameters, including changes to their names, types, expressions, or target resource types. Explain the impact on querying capabilities.
7.  **Key Migration Actions & Considerations:** Conclude with a consolidated list of actionable steps for implementers.

**What to AVOID:**

*   **Minor Narrative Tweaks:** Do not focus on small, line-level edits to descriptive text in the markdown unless these reflect a substantive change in meaning, scope, or technical definition.
*   **Overuse of Tables for Element Comparison:** Prefer narrative descriptions or bulleted lists for detailing element changes. Use tables only when they offer superior clarity for highly specific, compact data sets without disrupting readability.
*   **Large YAML/JSON Dumps:** Your output should be a well-organized narrative. Brief excerpts or citations are acceptable, but avoid embedding large, undigested chunks of YAML or JSON.

**Output Format:**
*   Present your findings as a clear, well-structured markdown document, emulating the style, tone, and narrative preference of the provided example analysis.
*   Use headings, bullet points, and concise language.

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

`;

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