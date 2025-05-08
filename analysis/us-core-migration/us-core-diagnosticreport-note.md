## Impact of R6 Changes on `us-core-diagnosticreport-note`

This section details the R6 base `DiagnosticReport` changes that directly affect how `us-core-diagnosticreport-note` is defined or used.

*   **`DiagnosticReport.status`**
    *   **Profile Aspect:** This element is Must Support in `us-core-diagnosticreport-note`. Its value set is bound (required) to the base FHIR `ValueSet/diagnostic-report-status`. The profile also defines a constraint `us-core-10` involving specific status codes: `(status='partial' or status='preliminary' or status='final' or status='amended' or status='corrected' or status='appended' ) implies effective.exists()`.
    *   **Relevant R6 Base Change:** The `diagnostic-report-status` value set adds a new code: `modified`.
    *   **Direct Impact on `us-core-diagnosticreport-note`:**
        1.  Implementations supporting `us-core-diagnosticreport-note` will need to recognize and potentially handle the new `modified` status.
        2.  The US Core editorial team should review the `us-core-10` constraint to determine if the `modified` status should also imply `effective[x].exists()`. If so, the constraint expression in the profile will need an update.

*   **`DiagnosticReport.media.link` (Guidance Impact)**
    *   **Profile Aspect:** This element is not Must Support or formally constrained in the `us-core-diagnosticreport-note` differential. However, the profile's HTML documentation provides guidance: "`DiagnosticReport.media.link` **SHOULD** be used to support links to various patient-friendly content...".
    *   **Relevant R6 Base Change:** The type of `DiagnosticReport.media.link` changes from `Reference(Media)` in R4 to `Reference(DocumentReference)` in R6.
    *   **Direct Impact on `us-core-diagnosticreport-note`:**
        1.  The textual guidance in the US Core Implementation Guide for this profile is now outdated and requires updating to reflect `Reference(DocumentReference)`.
        2.  Implementers who followed the R4-based SHOULD guidance will face a breaking change and must update their systems to use `DocumentReference` for media links.

*   **`DiagnosticReport.imagingStudy` (Guidance Impact)**
    *   **Profile Aspect:** This element is not Must Support or formally constrained in the `us-core-diagnosticreport-note` differential. However, the profile's HTML documentation provides guidance: "The `DiagnosticReport.imagingStudy` element **SHOULD** be used to support exchange with systems that can view DICOM...".
    *   **Relevant R6 Base Change:** The R4 `DiagnosticReport.imagingStudy` element is replaced by the R6 `DiagnosticReport.study` element, which has a type of `Reference(GenomicStudy | ImagingStudy)`.
    *   **Direct Impact on `us-core-diagnosticreport-note`:**
        1.  The textual guidance in the US Core Implementation Guide for this profile is outdated and requires updating to refer to the new `study` element.
        2.  Implementers who followed the R4-based SHOULD guidance will need to adapt to using the new `study` element name.

*   **Other Must Support Elements:** Other elements that are Must Support in `us-core-diagnosticreport-note` (e.g., `category`, `code`, `subject`, `effective[x]`, `issued`, `performer`, `presentedForm`) are not significantly impacted by R6 changes in a way that breaks the current profile definition. For `subject` and `performer`, R6 expands the list of potential target reference types in the base resource, but the US Core profile already constrains these to a more specific subset, which remains valid.

## Migration Summary & Actionable Takeaways for `us-core-diagnosticreport-note`

*   **US Core Profile Changes Required:**
    1.  **`fhirVersion`:** Update the profile's `fhirVersion` from `4.0.1` to the appropriate R6 version (e.g., `6.0.0`).
    2.  **Constraint `us-core-10`:** The US Core team needs to decide if the `DiagnosticReport.status` code `modified` (new in R6) should also imply `effective[x].exists()`. If yes, update the `us-core-10` constraint expression.
    3.  **Update IG Textual Guidance:**
        *   Revise guidance for `DiagnosticReport.media.link` to specify `Reference(DocumentReference)`.
        *   Revise guidance for `DiagnosticReport.imagingStudy` to refer to the new `DiagnosticReport.study` element.
    4.  No other direct structural changes to the profile's differential section are mandated by R6 base changes.

*   **Implementation Changes Required:**
    1.  **Handle `modified` status:** Implementers must be prepared to receive and process the new `modified` status for `DiagnosticReport.status`.
    2.  **Adapt `media.link`:** Systems following the US Core SHOULD guidance for `DiagnosticReport.media.link` **must** update to use `Reference(DocumentReference)` instead of `Reference(Media)`. This is a breaking change for affected implementations.
    3.  **Adapt `imagingStudy` to `study`:** Systems following the US Core SHOULD guidance for `DiagnosticReport.imagingStudy` **must** update to use the new `DiagnosticReport.study` element name.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  **`DiagnosticReport.composition`**: Could be considered for future profile enhancements if more detailed structuring of report content (e.g., via sections) is required.
    2.  **`DiagnosticReport.relatesTo`**: Useful for explicitly linking report versions (e.g., amendments, addenda), which aligns with the report lifecycle.
    3.  **`DiagnosticReport.procedure`**: Could be used to formally link the report to the `Procedure` that generated it, enhancing traceability.

## Overall Migration Impact
Impact: Low

The `us-core-diagnosticreport-note` profile itself requires minimal changes to its formal definition (differential). The primary tasks for the US Core editorial team involve updating the `fhirVersion`, reviewing one constraint (`us-core-10`) for a new status code, and, importantly, updating the textual guidance in the Implementation Guide for elements like `media.link` and `imagingStudy` that are recommended but not formally profiled. While implementers following this guidance will face significant changes for those specific elements, the work on the profile definition itself is low.