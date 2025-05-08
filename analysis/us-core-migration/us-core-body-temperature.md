## Impact of R6 Changes on `us-core-body-temperature`

This section analyzes R6 `Observation` changes that directly affect core elements, constraints, and patterns defined or relied upon by `us-core-body-temperature`.

*   **`Observation.status` (Must Support, cardinality 1..1, inherited from `us-core-vital-signs`)**
    *   **Relevant R6 Base Change:** The value set for `Observation.status` is significantly expanded in R6 (e.g., adding `corrected`, `cancelled`, `specimen-in-process`). The R6 ValueSet URI `http://hl7.org/fhir/ValueSet/observation-status` is now unversioned. This is a breaking change for the base `Observation` resource.
    *   **Direct Impact on `us-core-body-temperature`:** `us-core-body-temperature` instances must now potentially handle or be represented with these new statuses. Systems producing or consuming this profile, and validating against the R4-era `Observation.status` value set, will require updates. The profile itself (via its parent `us-core-vital-signs`) mandates `status` but does not further constrain its value set beyond the base FHIR definition, so it directly inherits this R6 change.

*   **`Observation.component.value[x]` (Components are Must Support, inherited from `us-core-vital-signs`)**
    *   **Relevant R6 Base Change:** `Observation.component.value[x]` can now also be of type `Attachment` or `Reference(MolecularSequence)`. Additionally, R6 introduces constraint `obs-10`: `Observation.component.dataAbsentReason SHALL only be present if Observation.component.value[x] is not present.`
    *   **Direct Impact on `us-core-body-temperature`:** While body temperature components (e.g., measurement site, often a `CodeableConcept`) are common, the R6 type expansion means components of a `us-core-body-temperature` observation *could* technically use these new types if a relevant use case emerges. Implementers supporting components must be aware of this. The new `obs-10` constraint formalizes expected behavior for `component.dataAbsentReason`, which is Must Support in `us-core-vital-signs`.

*   **`Observation.referenceRange.text` (Available from base `Observation`, not specifically profiled but potentially used)**
    *   **Relevant R6 Base Change:** The data type of `Observation.referenceRange.text` changed from `string` to `markdown`.
    *   **Direct Impact on `us-core-body-temperature`:** If implementers populate `Observation.referenceRange.text` for body temperature instances, they must now use and expect `markdown` instead of a plain `string`. This affects data producers and consumers who display this information.

*   **`Observation.bodySite` (Available from base `Observation`) and new `Observation.bodyStructure`**
    *   **Relevant R6 Base Change:** R6 introduces `Observation.bodyStructure` (a `Reference` to the `BodyStructure` resource) as a more structured alternative to `Observation.bodySite` (a `CodeableConcept`). A new constraint, `obs-8`, mandates that `bodyStructure` SHALL only be present if `Observation.bodySite` is not present (and vice-versa).
    *   **Direct Impact on `us-core-body-temperature`:** The `us-core-body-temperature` profile does not explicitly constrain `bodySite` or `bodyStructure`. However, `bodySite` is available from the base `Observation` resource and might be used. Implementers now have the option of using the more specific `bodyStructure`. If either is used, constraint `obs-8` must be followed. This offers a new, more precise way to record the measurement location.

*   **`Observation.valueQuantity.code` Terminology Binding**
    *   **Relevant R6 Base Change:** R6 generally moves towards unversioned ValueSet canonical URLs in bindings or specific R6-versioned URLs. The R4 `us-core-body-temperature` profile binds `Observation.valueQuantity.code` to the versioned ValueSet `http://hl7.org/fhir/ValueSet/ucum-bodytemp|4.0.1`.
    *   **Direct Impact on `us-core-body-temperature`:** The content of the `ucum-bodytemp` ValueSet appears unchanged between R4 and R6. However, for R6 alignment, the profile's binding should be updated to use the R6-appropriate canonical (e.g., `http://hl7.org/fhir/ValueSet/ucum-bodytemp` without the version). This is a minor editorial change for consistency.

## Migration Summary & Actionable Takeaways for `us-core-body-temperature`

*   **US Core Profile Changes Required:**
    1.  **`Observation.status`:** The US Core IG must decide how to address the expanded R6 `Observation.status` value set. It can either:
        *   Allow all new R6 status codes by updating the inherited binding to the unversioned R6 ValueSet.
        *   Or, define a US Core-specific subset of these R6 codes for vital signs.
    2.  **`Observation.valueQuantity.code` Binding:** Update the ValueSet binding from `http://hl7.org/fhir/ValueSet/ucum-bodytemp|4.0.1` to the R6-appropriate canonical URL (likely `http://hl7.org/fhir/ValueSet/ucum-bodytemp`).
    3.  **Guidance (Recommended):** Provide guidance on the use of `Observation.bodySite` versus the new R6 `Observation.bodyStructure`, and adherence to constraint `obs-8`.
    4.  The `us-core-body-temperature` profile (and its parent `us-core-vital-signs`) will need to be re-profiled and republished for R6, incorporating these decisions.

*   **Implementation Changes Required:**
    1.  **Producers & Consumers:**
        *   Update systems to handle the expanded R6 `Observation.status` codes, per US Core's final decision.
        *   If using `Observation.component` with `us-core-body-temperature` instances, be aware that `component.value[x]` can now include `Attachment` or `Reference(MolecularSequence)`.
        *   If using `Observation.referenceRange.text`, systems must now produce and consume `markdown` data.
        *   If using `Observation.bodySite` or the new `Observation.bodyStructure`, ensure compliance with constraint `obs-8`.
    2.  **Servers:**
        *   Update validation logic for the R6 `Observation.status` codes.
        *   Implement R6 constraint `obs-10` (`component.dataAbsentReason` vs `component.value[x]`).
        *   Implement R6 constraint `obs-8` if `bodySite` or `bodyStructure` are supported.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  `Observation.instantiates[x]`: Offers a standard way to link `us-core-body-temperature` instances to a formal `ObservationDefinition`, potentially improving consistency, especially for device-originated data.
    2.  `Observation.bodyStructure`: Provides a more semantically precise method for recording the temperature measurement site if US Core promotes its use.

## Overall Migration Impact
Impact: Low

The primary driver for migration work is the breaking change to the `Observation.status` value set, which is mandated by the parent `us-core-vital-signs` profile. The US Core team will need to decide whether to adopt the full expanded R6 value set or constrain it. Other impacts involve adapting to minor data type changes (e.g., `referenceRange.text` to markdown), awareness of new type options for `component.value[x]`, and an editorial update to a ValueSet binding. These changes are manageable and do not require fundamental rethinking of the profile's core structure.