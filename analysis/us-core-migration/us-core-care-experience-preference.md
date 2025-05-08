## Impact of R6 Changes on `us-core-care-experience-preference`

This section outlines how R6 changes to the base `Observation` resource affect the `us-core-care-experience-preference` profile.

*   **`Observation.status`**
    *   **Profile Definition:** `Observation.status` is Must Support. The profile does not constrain the value set.
    *   **Relevant R6 Base Change:** The value set for `Observation.status` (bound to `http://hl7.org/fhir/ValueSet/observation-status`) is significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `unknown`). The R6 ValueSet URI is no longer version-pinned.
    *   **Direct Impact on `us-core-care-experience-preference`:**
        *   The profile definition remains valid as it inherits the value set from the base Observation.
        *   Implementers producing or consuming instances of this profile will need to be prepared to handle the new R6 status codes.
        *   The US Core team may wish to update guidance to reflect the availability of these new R6 status codes.

*   **`Observation.value[x]`**
    *   **Profile Definition:** `Observation.value[x]` is Must Support. The profile specifically marks `valueString` and `valueCodeableConcept` as Must Support types. Other R4 base types are permitted but not Must Support.
    *   **Relevant R6 Base Change:** `Observation.value[x]` in R6 now also allows `Attachment` and `Reference(MolecularSequence)` as data types.
    *   **Direct Impact on `us-core-care-experience-preference`:**
        *   By default, these new R6 types (`Attachment`, `Reference(MolecularSequence)`) would become permissible in `us-core-care-experience-preference` instances, though not Must Support.
        *   The US Core editorial team needs to decide if these new types are appropriate for care experience preferences. Options:
            1.  Allow them implicitly (no profile change).
            2.  Explicitly disallow them by constraining `value[x]`'s type choices in the profile.
        *   If allowed, consuming systems may encounter these new types in R6-conformant `us-core-care-experience-preference` resources.

*   **`Observation.performer`**
    *   **Profile Definition:** `Observation.performer` is marked with a USCDI requirement and allows references to US Core Practitioner, Organization, Patient, PractitionerRole, CareTeam, and RelatedPerson profiles.
    *   **Relevant R6 Base Change:** The R6 `Observation.performer` element expands its allowed reference targets to include `HealthcareService`.
    *   **Direct Impact on `us-core-care-experience-preference`:**
        *   The current profile definition remains valid.
        *   The US Core team could choose to update the profile to explicitly allow `Reference(HealthcareService)` if this is deemed relevant for documenting the performer of a care experience preference. This would be an optional enhancement.

## Migration Summary & Actionable Takeaways for `us-core-care-experience-preference`

*   **US Core Profile Changes Required:**
    1.  **`Observation.value[x]` Types:** Decide whether the new R6 data types (`Attachment`, `Reference(MolecularSequence)`) for `Observation.value[x]` should be allowed or explicitly disallowed for this profile. If allowed (by making no change), they will not be Must Support unless profiled as such.
    2.  **Documentation:** Consider updating profile guidance to acknowledge the expanded set of `Observation.status` codes available in R6.
    3.  **Optional Enhancement for `Observation.performer`:** Evaluate if `HealthcareService` should be added as an allowed target profile for `Observation.performer`.

*   **Implementation Changes Required:**
    1.  **Handle Expanded `Observation.status` Codes:** Systems creating or processing `us-core-care-experience-preference` resources must be able to handle the new R6 status codes (e.g., `cancelled`, `corrected`).
    2.  **Support New `Observation.value[x]` Types (Conditional):** If the US Core profile allows the new R6 data types (`Attachment`, `Reference(MolecularSequence)`) for `Observation.value[x]`, consuming applications should be prepared to handle them.
    3.  **`value-string` Search Parameter Behavior:** Be aware that the base R6 `Observation` `value-string` search parameter now *only* searches `Observation.valueString`. It no longer searches `Observation.valueCodeableConcept.text` (as it did in R4). Since `us-core-care-experience-preference` supports `valueCodeableConcept`, any queries relying on the old `value-string` behavior for finding text within `valueCodeableConcept.text` for instances of this profile will need to be updated (e.g., to use `value-concept:text=[text]`).

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`Observation.instantiates[x]`:** The ability to link an Observation to an `ObservationDefinition` (`instantiatesCanonical` or `instantiatesReference`) could be useful if standardized definitions for specific care experience preferences are developed in the future.

## Overall Migration Impact
Impact: Low

The core constraints of the `us-core-care-experience-preference` profile (fixed category, fixed code, subject restricted to Patient) are not broken by the R6 changes to the base `Observation` resource. Migration primarily involves awareness of expanded terminologies (`Observation.status`), a decision regarding newly available data types for `Observation.value[x]`, and an optional enhancement for `Observation.performer`. The change to `value-string` search behavior is a general R6 `Observation` change that implementers querying these resources need to consider. No significant re-profiling is mandated.