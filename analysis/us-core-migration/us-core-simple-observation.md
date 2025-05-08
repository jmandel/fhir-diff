## Impact of R6 Changes on `us-core-simple-observation`

This section details the R6 base `Observation` changes that directly affect `us-core-simple-observation`.

*   **`Observation.status`**
    *   **Relevant R6 Base Change:** The value set for `Observation.status` is significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `unknown`, `specimen-in-process`). The R6 ValueSet URI `http://hl7.org/fhir/ValueSet/observation-status` is now unversioned.
    *   **Direct Impact on `us-core-simple-observation`:**
        *   The profile mandates `status` (1..1, Must Support) and does not further restrict the base FHIR value set.
        *   Implementations producing or consuming `us-core-simple-observation` instances **must** be prepared to handle these new R6 status codes. Systems validating against only the R4 status codes will require updates.

*   **`Observation.value[x]` and `Observation.component.value[x]`**
    *   **Relevant R6 Base Change:** Allowed data types for `Observation.value[x]` and `Observation.component.value[x]` are expanded in R6 to include `Attachment` and `Reference(MolecularSequence)`. This is a breaking change for the base `Observation` resource.
    *   **Direct Impact on `us-core-simple-observation`:**
        *   **For `Observation.value[x]`**: The profile constrains `value[x]` to specific types (`Quantity`, `CodeableConcept`, `string`, `boolean`, `integer`, `Range`, `Ratio`, `SampledData`, `time`, `dateTime`, `Period`) and does *not* currently permit `Attachment` or `Reference(MolecularSequence)`.
            *   If `us-core-simple-observation` maintains its current type restrictions for `value[x]` in R6, then R6 `Observation` instances using `valueAttachment` or `valueReference(MolecularSequence)` would *not* conform to this profile. This requires an editorial decision: either maintain the current tight restrictions (no profile change to types needed, but clear guidance) or update the profile to allow these new types if deemed suitable for "simple" observations.
        *   **For `Observation.component.value[x]`**: The profile does not currently constrain `Observation.component` or its sub-elements. Therefore, if components are used within a `us-core-simple-observation` instance, their `value[x]` would implicitly allow the new R6 base types (`Attachment`, `Reference(MolecularSequence)`). Consumers must be prepared for these if components are present.

*   **`Observation.derivedFrom`**
    *   **Relevant R6 Base Change:** Target resource types for `Observation.derivedFrom` are modified in R6: `Media` is removed; `ImagingSelection` and `GenomicStudy` are added.
    *   **Direct Impact on `us-core-simple-observation`:**
        *   The profile currently lists `Media` as a possible `targetProfile` for `derivedFrom`.
        *   To be R6-compliant, `us-core-simple-observation` **must** be updated to remove `Media` from its allowed `targetProfile` list for `derivedFrom`.
        *   The US Core team should also consider whether to add `ImagingSelection` and `GenomicStudy` as allowed target profiles for this element, if relevant.

*   **`Observation.referenceRange.text`**
    *   **Relevant R6 Base Change:** The data type of `Observation.referenceRange.text` changes from `string` in R4 to `markdown` in R6.
    *   **Direct Impact on `us-core-simple-observation`:**
        *   The profile does not directly constrain `referenceRange` or its sub-elements.
        *   If `referenceRange.text` is used in an instance of `us-core-simple-observation`, R6-compliant instances will use `markdown`.
        *   Implementers creating or consuming this element within a `us-core-simple-observation` context need to support `markdown`.

*   **Search Parameter `value-string` Behavior**
    *   **Relevant R6 Base Change:** The `value-string` search parameter in R6 *only* searches `Observation.valueString`. In R4, it also searched `Observation.valueCodeableConcept.text`. This is a breaking change for search behavior.
    *   **Direct Impact on `us-core-simple-observation`:**
        *   While the profile does not define this search parameter, it's a standard parameter for `Observation`. Systems querying for `us-core-simple-observation` instances using `value-string` will be affected.
        *   Client applications relying on the R4 behavior (e.g., to find text within `valueCodeableConcept` using `value-string`) **must** update their queries (e.g., to use `value-concept:text=[text]` for R6). Servers **must** implement the R6 search behavior.

## Migration Summary & Actionable Takeaways for `us-core-simple-observation`

*   **US Core Profile Changes Required:**
    1.  **`Observation.derivedFrom`**: **Mandatory change.** Remove `Media` from the list of allowed `targetProfile`s. Evaluate and decide whether to add the new R6 targets (`ImagingSelection`, `GenomicStudy`) if appropriate for "simple" observations.
    2.  **`Observation.value[x]`**: **Decision required.** Determine if the profile should allow the new R6 base types (`Attachment`, `Reference(MolecularSequence)`) for `value[x]`.
        *   If yes: Update the profile's type constraints for `value[x]`.
        *   If no (to maintain "simple" nature): No change to the profile's `value[x]` type constraint is needed, but add clear guidance that these R6 types are not permitted by `us-core-simple-observation`.
    3.  **Guidance Updates**:
        *   Clarify that implementations must support the expanded R6 `Observation.status` codes.
        *   Note that if `Observation.component.value[x]` is used, it can now include `Attachment` or `Reference(MolecularSequence)` types from R6 base. The profile could be updated to restrict these if desired.
        *   Inform implementers that `Observation.referenceRange.text`, if used, is now `markdown`.

*   **Implementation Changes Required:**
    1.  **Status Codes**: Systems producing or consuming data must handle the expanded R6 `Observation.status` codes.
    2.  **Value Types**:
        *   Consumers: Prepare to handle `Attachment` and `Reference(MolecularSequence)` in `Observation.value[x]` (if the profile is updated to allow them, or if interacting with less constrained R6 Observations) and in `Observation.component.value[x]` (if components are used).
        *   Producers: Adhere to the profile's `value[x]` type constraints. Do not use `Media` in `Observation.derivedFrom`.
    3.  **`referenceRange.text`**: Support `markdown` data type if this element is used.
    4.  **Search**:
        *   Client applications: Revise queries using `value-string` if they previously relied on its R4 behavior of searching `valueCodeableConcept.text`. Use alternatives like `value-concept:text=` for R6.
        *   Server systems: Ensure `value-string` search parameter implementation aligns with the R6 definition (searches `Observation.valueString` only).

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `Observation.instantiatesCanonical` or `Observation.instantiatesReference`: Could be considered if US Core develops or references standard `ObservationDefinition` resources for common simple observations, enhancing consistency.

## Overall Migration Impact

Impact: **Low**

The `us-core-simple-observation` profile requires a few specific, easy-to-implement definition changes, primarily updating `Observation.derivedFrom`'s target profiles. An important editorial decision is needed regarding whether to expand allowed types for `Observation.value[x]` to include new R6 options (`Attachment`, `Reference(MolecularSequence)`); maintaining current restrictions aligns with the "simple" intent and minimizes profile changes. The primary effort for the US Core team will be updating guidance to reflect R6 base changes (like expanded `status` codes, `markdown` for `referenceRange.text`, and altered `value-string` search behavior) that impact implementers even if the profile structure itself changes little. Community consensus for these changes is unlikely to be extensive if the profile's "simple" scope is maintained.