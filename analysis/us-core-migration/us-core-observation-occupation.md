## Impact of R6 Changes on `us-core-observation-occupation`

This section analyzes R6 `Observation` base resource changes that directly affect `us-core-observation-occupation`.

*   **`Observation.status` (Must Support Element)**
    *   **Relevant R6 Base Change:** The value set for `Observation.status` is expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `unknown`, `specimen-in-process`). This is a breaking change for the base `Observation` resource. The R6 ValueSet URI `http://hl7.org/fhir/ValueSet/observation-status` is now unversioned.
    *   **Direct Impact on `us-core-observation-occupation`:**
        *   The profile mandates support for `status` and binds to the standard `ObservationStatus` value set. With the R6 migration, instances of `us-core-observation-occupation` can now use these new R6 status codes.
        *   Implementers (both producers and consumers) of `us-core-observation-occupation` data must be prepared to handle this expanded set of status codes.
        *   The US Core editorial team should review if specific guidance on the use of these new statuses is warranted for occupation observations (e.g., are some new statuses particularly relevant or irrelevant?).

*   **`Observation.valueCodeableConcept` and `Observation.component.valueCodeableConcept` (Must Support Elements)**
    *   **Profile Aspect:** `us-core-observation-occupation` mandates `Observation.valueCodeableConcept` (for occupation) and `Observation.component:industry.valueCodeableConcept` (for industry), both with a cardinality of `1..1`.
    *   **Relevant R6 Base Change (for `value[x]` in general):**
        1.  The base `Observation.value[x]` and `Observation.component.value[x]` elements in R6 now permit `Attachment` and `Reference(MolecularSequence)` as new data types.
        2.  The `value-string` search parameter in R6 for `Observation` now *only* searches `Observation.valueString`. In R4, it also searched `Observation.valueCodeableConcept.text`. This is a breaking change in search behavior.
    *   **Direct Impact on `us-core-observation-occupation`:**
        *   **New `value[x]` types:** No direct breaking impact on the *profile definition itself*. The profile's constraint to use `valueCodeableConcept` remains valid and is more restrictive than the R6 base. Implementations adhering strictly to `us-core-observation-occupation` will continue to use `CodeableConcept`.
        *   **`value-string` Search Behavior:** This is a significant change for implementers. Any system that previously relied on `value-string` to search the textual content of `Observation.valueCodeableConcept.text` or `Observation.component.valueCodeableConcept.text` for occupation or industry information will find their queries no longer work as expected against an R6 FHIR server. They must adapt queries to use alternatives like `value-concept:text=[TEXT_HERE]`.

## Migration Summary & Actionable Takeaways for `us-core-observation-occupation`

*   **US Core Profile Changes Required:**
    1.  **`fhirVersion` Update:** The `StructureDefinition.fhirVersion` must be updated from `4.0.1` to the appropriate R6 version string (e.g., `6.0.0`).
    2.  **Documentation for `Observation.status`:** Consider if guidance or examples need updates to reflect the newly available R6 status codes in the context of occupation. The profile will automatically inherit the expanded R6 value set for `Observation.status`.
    3.  **Search Guidance:** Update any US Core IG documentation or examples related to searching `Observation` resources if they mention or imply the R4 behavior of `value-string`. Specifically, advise implementers about the change in `value-string` behavior and recommend using `value-concept:text=` for searching within `valueCodeableConcept.text`.

*   **Implementation Changes Required:**
    1.  **Handle Expanded `Observation.status` Codes:** Consumers of `us-core-observation-occupation` resources must be prepared to receive and process the new status codes available in R6. Producers may use these new R6 status codes.
    2.  **Adapt Search Queries for `valueCodeableConcept.text`:** Systems searching for `us-core-observation-occupation` instances by querying the `.text` field of `Observation.valueCodeableConcept` (for occupation) or `Observation.component