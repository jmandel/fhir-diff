## Impact of R6 Changes on `us-core-encounter`

This section analyzes R6 base `Encounter` changes that directly affect `us-core-encounter`.

*   **`Encounter.status`**
    *   **`us-core-encounter` Aspect:** Must Support.
    *   **Relevant R6 Base Change(s):** The value set for `Encounter.status` has been significantly altered. Codes like `arrived`, `triaged`, `onleave`, `finished` are removed, while `on-hold`, `discharged`, `completed`, `discontinued` are added.
    *   **Direct Impact on `us-core-encounter`:** Implementations will need to map existing R4 status codes to the new R6 value set. Semantics previously covered by removed codes (e.g., `arrived`, `triaged`) might now be better represented by the new R6 `Encounter.subjectStatus` element. The profile's value set binding will need to be updated.

*   **`Encounter.class`**
    *   **`us-core-encounter` Aspect:** Must Support. The profile implicitly expects this to be `1..1` (as per R4 base and US Core guidance "Each Encounter Must Have...A classification") and of type `Coding` (R4 base type).
    *   **Relevant R6 Base Change(s):**
        1.  Cardinality changed from `1..1` in R4 to `0..*` in R6.
        2.  Type changed from `Coding` in R4 to `CodeableConcept` in R6.
        3.  The value set binding has changed from `v3-ActEncounterCode` to `encounter-class`.
    *   **Direct Impact on `us-core-encounter`:**
        1.  `us-core-encounter` can continue to mandate `class` as `1..1` by constraining the R6 base.
        2.  The change from `Coding` to `CodeableConcept` means the profile will now be based on `CodeableConcept`. This is generally a compatible change as `CodeableConcept` is richer.
        3.  The value set binding must be updated in the profile, and implementers will need to map existing data.

*   **`Encounter.participant.individual`**
    *   **`us-core-encounter` Aspect:** `Encounter.participant` is Must Support, and within it, `participant.individual` is Must Support, referencing `us-core-practitioner`, `us-core-practitionerrole`, or `us-core-relatedperson`.
    *   **Relevant R6 Base Change(s):** `Encounter.participant.individual` is renamed to `Encounter.participant.actor`. The R6 `actor` element also supports a wider range of reference types (e.g., `Patient`, `Group`, `Device`, `HealthcareService`) than R4 `individual`.
    *   **Direct Impact on `us-core-encounter`:** The profile definition must be updated to use the new path `Encounter.participant.actor`. US Core will need to re-assert its target profile constraints (e.g., to `us-core-practitioner`) on this renamed element.

*   **`Encounter.period`**
    *   **`us-core-encounter` Aspect:** Must Support.
    *   **Relevant R6 Base Change(s):** Renamed to `Encounter.actualPeriod`.
    *   **Direct Impact on `us-core-encounter`:** The profile definition and all implementations must update to the new element name `Encounter.actualPeriod`.

*   **`Encounter.reasonCode` and `Encounter.reasonReference`**
    *   **`us-core-encounter` Aspect:** Both are Must Support. `reasonReference` targets US Core Condition and Procedure profiles. US Core provides specific guidance that servers SHALL support at least one, and clients SHALL support both.
    *   **Relevant R6 Base Change(s):** Both `Encounter.reasonCode` (CodeableConcept) and `Encounter.reasonReference` (Reference) are **removed**. They are replaced by a new backbone element `Encounter.reason`, which contains `reason.use` (CodeableConcept) and `reason.value` (CodeableReference that can point to Condition, DiagnosticReport, Observation, ImmunizationRecommendation, Procedure).
    *   **Direct Impact on `us-core-encounter`:** This is a major breaking change.
        *   The profile must be significantly altered to remove `reasonCode` and `reasonReference` and instead profile the new `Encounter.reason` structure, specifically `Encounter.reason.value`.
        *   Must Support status will need to be applied to elements within the new `Encounter.reason` structure.
        *   Target profiles for `Encounter.reason.value[x]` (if it's a reference) will need to be defined.
        *   The US Core guidance ("server supports one, client supports both") will need to be re-evaluated for `Encounter.reason.value` (which is a `CodeableReference`, inherently supporting either a code or a reference within one field).

*   **`Encounter.hospitalization` and `Encounter.hospitalization.dischargeDisposition`**
    *   **`us-core-encounter` Aspect:** `Encounter.hospitalization` is Must Support, and its sub-element `dischargeDisposition` is Must Support.
    *   **Relevant R6 Base Change(s):** `Encounter.hospitalization` is renamed to `Encounter.admission`. The `dischargeDisposition` element remains within this renamed backbone. Other elements like `dietPreference` have moved out of this backbone to be direct children of `Encounter`.
    *   **Direct Impact on `us-core-encounter`:** The profile definition must be updated to reflect the path change from `Encounter.hospitalization.dischargeDisposition` to `Encounter.admission.dischargeDisposition`. Implementations must also adapt to this rename.

## Migration Summary & Actionable Takeaways for `us-core-encounter`

*   **US Core Profile Changes Required:**
    1.  **Element Renaming:** Update paths for:
        *   `Encounter.period` to `Encounter.actualPeriod`.
        *   `Encounter.participant.individual` to `Encounter.participant.actor`.
        *   `Encounter.hospitalization` to `Encounter.admission` (affecting `Encounter.admission.dischargeDisposition`).
    2.  **Reason for Encounter Overhaul:**
        *   Remove `Encounter.reasonCode` and `Encounter.reasonReference`.
        *   Profile the new `Encounter.reason` backbone element, making `Encounter.reason.value` (CodeableReference) Must Support.
        *   Redefine target profiles for `Encounter.reason.value[x]` when it's a reference, aligning with previous `reasonReference` targets where appropriate.
        *   Update US Core guidance regarding coded vs. referenced reasons to reflect the new `CodeableReference` structure of `Encounter.reason.value`.
    3.  **`Encounter.class` Updates:**
        *   Adapt to the base type changing from `Coding` to `CodeableConcept`. US Core can maintain its `1..1` cardinality.
        *   Update the value set binding for `Encounter.class`.
    4.  **`Encounter.status` Update:** Update the value set binding for `Encounter.status`.
    5.  **Review `Encounter.participant.actor` Targets:** Confirm and re-apply target profile constraints (e.g., to `us-core-practitioner`) on the renamed `Encounter.participant.actor` element.
    6.  **Consider New R6 Elements (Optional):** Evaluate adding `Encounter.subjectStatus` as Must Support to represent patient-specific statuses previously part of R4 `Encounter.status` (e.g., `arrived`, `triaged`).

*   **Implementation Changes Required:**
    1.  **Data Model & Code Updates:** Adapt to all renamed elements.
    2.  **Reason Handling:** Implement logic to produce/consume the new `Encounter.reason` structure. Migrate existing data from `reasonCode`/`reasonReference` to `Encounter.reason.value`.
    3.  **Terminology Mapping:** Map `Encounter.status` and `Encounter.class` values to their new R6 value sets.
    4.  **Type Adaptation:** Handle `Encounter.class` as `CodeableConcept`.
    5.  **Search Query Adjustments:** Update search queries to reflect changed element paths (e.g., `date` search parameter now targets `actualPeriod`) and the new structure for `reason` (e.g., `reason-code` search parameter will target `Encounter.reason.value.concept`).

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `Encounter.subjectStatus`: Could provide a standard way to capture patient states like 'arrived' or 'triaged' now distinct from the main encounter status, aligning with common clinical workflows.
    *   `EncounterHistory` resource: Although separate, this new resource offers a standardized mechanism for tracking encounter status/class history, which may be valuable for systems needing detailed audit trails beyond the current encounter state.

## Overall Migration Impact

Impact: Significant

The `us-core-encounter` profile will require substantial updates. The complete restructuring of how "reason for encounter" is handled (removal of `reasonCode`/`reasonReference` and introduction of the `Encounter.reason` backbone) is a breaking change that necessitates re-profiling and new implementation logic. Multiple Must Support elements are renamed, requiring path updates in the profile and consuming systems. Changes to `Encounter.class` (type, base cardinality, binding) and `Encounter.status` (binding) also require profile adjustments and data mapping. New decisions will be needed on how to best profile the `Encounter.reason` element and whether to incorporate new R6 elements like `Encounter.subjectStatus`.