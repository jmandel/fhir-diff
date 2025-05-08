## Impact of R6 Changes on `us-core-observation-screening-assessment`

This section details how R6 `Observation` base resource changes affect core aspects of the `us-core-observation-screening-assessment` profile.

*   **`Observation.status`**
    *   **Relevant R6 Base Change:** The value set for `Observation.status` is significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `unknown`, `specimen-in-process`). This is a breaking change from R4.
    *   **Direct Impact on `us-core-observation-screening-assessment`:** The profile currently relies on the R4 status codes. Migration to R6 requires a decision on which R6 statuses (the expanded set or a US Core-defined subset) will be permissible for this profile. Implementations will need to be updated to produce and consume observations with the eventually permitted status codes.

*   **`Observation.value[x]`**
    *   **Relevant R6 Base Change:** `Observation.value[x]` (and `Observation.component.value[x]`) now supports `Attachment` and `Reference(MolecularSequence)` as new data types. This is a breaking change.
    *   **Direct Impact on `us-core-observation-screening-assessment`:** The profile currently constrains `value[x]` to a specific list of R4 data types (Quantity, CodeableConcept, string are Must Support). The US Core team must decide whether to allow `Attachment` and/or `Reference(MolecularSequence)` as valid answer types for screening and assessment observations. If allowed, the profile definition must be updated, and implementers will need to support these new types. If not allowed, the profile will be more restrictive than the R6 base.

*   **`Observation.derivedFrom`**
    *   **Relevant R6 Base Change:** `Media` has been removed as a valid target resource type for `Observation.derivedFrom`. New targets like `ImagingSelection` and `GenomicStudy` have been added.
    *   **Direct Impact on `us-core-observation-screening-assessment`:** The profile currently permits `Reference(Media)` in `Observation.derivedFrom`. This is incompatible with R6 and **must be removed** from the profile's allowed target types for `derivedFrom`. The US Core team should also evaluate if the new R6 targets (`ImagingSelection`, `GenomicStudy`) are relevant for this profile and should be added.

*   **`Observation.subject` and `Observation.performer`**
    *   **Relevant R6 Base Change:** The list of allowed target resource types for `Observation.subject` (adds `Organization`, `Procedure`, `Practitioner`, `Medication`, etc.) and `Observation.performer` (adds `HealthcareService`) has been expanded in R6.
    *   **Direct Impact on `us-core-observation-screening-assessment`:** The profile currently constrains these elements to a narrower set of US Core specific profiles and other R4 resources. These R6 expansions do not force an immediate change, as US Core can choose to maintain its more restrictive constraints. However, they present an opportunity to broaden the applicability of the profile if desired. No change is mandated by this R6 update if current constraints are deemed sufficient.

## Migration Summary & Actionable Takeaways for `us-core-observation-screening-assessment`

*   **US Core Profile Changes Required:**
    1.  **`Observation.status`**: The profile must be updated to define its allowed status codes in alignment with or as a subset of the new R6 `Observation.status` value set. This requires a policy decision.
    2.  **`Observation.derivedFrom`**: The profile **must** remove `Media` from the allowed `targetProfile` list for `Observation.derivedFrom`. Consider adding new R6 targets like `ImagingSelection` or `GenomicStudy` if relevant.
    3.  **`Observation.value[x]`**: Decide whether to allow the new R6 data types (`Attachment`, `Reference(MolecularSequence)`) for `Observation.value[x]`. Update profile constraints accordingly.

*   **Implementation Changes Required:**
    1.  **Servers and Clients:**
        *   Must adapt to the new list of allowed `Observation.status` codes defined by the updated US Core profile.
        *   Must no longer produce or expect `Media` as a target for `Observation.derivedFrom`.
        *   If the profile adopts new `value[x]` types (`Attachment`, `Reference(MolecularSequence)`), systems must be updated to produce and consume these types.
    2.  **Querying Systems:** Be aware that the `value-string` search parameter in R6 *only* searches `Observation.valueString`. R4's behavior of also searching `Observation.valueCodeableConcept.text` is removed. Queries relying on the old behavior for `valueCodeableConcept.text` must be updated (e.g., to use `value-concept:text=[text]`).

*   **New R6 Features Relevant to Profile Intent (Optional Enhancements):**
    1.  **`Observation.instantiates[x]`**: Consider using this to link screening/assessment observations to a formal `ObservationDefinition` representing the specific tool or questionnaire.
    2.  **`Observation.organizer`**: This new boolean flag (Trial Use) could be used to explicitly mark observations that act as panels (groupers), though the profile already uses `hasMember` for this purpose.
    3.  **`Observation.bodyStructure`**: If assessments involve specific anatomical locations where `BodyStructure` offers more precision than `bodySite` (CodeableConcept), this could be considered.

## Overall Migration Impact
Impact: Significant

The base `Observation` resource has breaking changes in R6 related to `status` codes and `value[x]` data types. The `us-core-observation-screening-assessment` profile must make policy decisions on how to adapt to these changes (e.g., which new statuses to permit, whether to allow new value types). Additionally, a mandatory breaking change regarding `Observation.derivedFrom` (removal of `Media` as a target) necessitates a profile update. These are not minor updates and will require deliberation and clear guidance for implementers.