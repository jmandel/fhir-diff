## Impact of R6 Changes on `us-core-blood-pressure`

This section analyzes R6 changes to the base `Observation` resource that directly affect core elements, constraints, and patterns defined or relied on by `us-core-blood-pressure`.

*   **`Observation.status`**:
    *   **Relevant R6 Base Change:** The value set for `Observation.status` (bound to `http://hl7.org/fhir/ValueSet/observation-status`) has been significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `unknown`, `specimen-in-process`). The R6 ValueSet URI is also unversioned.
    *   **Direct Impact on `us-core-blood-pressure`:** `us-core-blood-pressure` inherits `Observation.status` as a Must Support element from `us-core-vital-signs`. Implementers producing or consuming R6 `us-core-blood-pressure` instances will need to be prepared for these new status codes. The US Core IG will need to decide whether to allow all R6 statuses or constrain them further for US Core profiles.

*   **`Observation.value[x]` and `Observation.component.value[x]` (New Data Types)**:
    *   **Relevant R6 Base Change:** R6 adds `Attachment` and `Reference(MolecularSequence)` as permissible types for both `Observation.value[x]` and `Observation.component.value[x]`.
    *   **Direct Impact on `us-core-blood-pressure`:**
        *   For `Observation.value[x]`: The `us-core-blood-pressure` profile guidance states this element **SHOULD** be omitted because blood pressure values are in the components. Therefore, the addition of new types to the base `Observation.value[x]` has minimal direct impact on how `us-core-blood-pressure` is typically defined and used.
        *   For `Observation.component.value[x]`: `us-core-blood-pressure` constrains `component.value[x]` to `valueQuantity` for both its systolic and diastolic components. While the base `Observation.component.value[x]` is expanded in R6, this profile's more specific constraint to `valueQuantity` means the R6 change doesn't alter the profile's current definition for these components. Implementers dealing with generic R6 Observations would need to handle these new types, but not for conforming `us-core-blood-pressure` components.

*   **`Observation.component.dataAbsentReason` (New Constraint)**:
    *   **Relevant R6 Base Change:** R6 introduces constraint `obs-10`: `Observation.component.dataAbsentReason SHALL only be present if Observation.component.value[x] is not present.`
    *   **Direct Impact on `us-core-blood-pressure`:** This R6 constraint aligns with and formalizes existing US Core guidance for `us-core-blood-pressure` (i.e., if a component value is absent, `dataAbsentReason` SHALL be used). `us-core-blood-pressure` already makes `Observation.component.dataAbsentReason` Must Support for its components. This is a non-breaking, clarifying change.

*   **`Observation.subject`, `Observation.performer`, `Observation.derivedFrom`, `Observation.specimen`, `Observation.partOf` (Expanded Reference Targets)**:
    *   **Relevant R6 Base Change:** These elements in the base `Observation` now support additional reference target types.
    *   **Direct Impact on `us-core-blood-pressure`:** `us-core-blood-pressure` (often via `us-core-vital-signs`) typically constrains these references to specific US Core profiles (e.g., `Observation.subject` to `us-core-patient`). The R6 base expansions do not break these more specific US Core constraints. The US Core team *could* choose to widen its allowed targets to include some new R6 options if relevant, but it's not a mandatory change driven by R6 for this profile.

No other R6 base changes to `Observation` appear to have a material impact on how `us-core-blood-pressure` is currently defined or used regarding its specific Must Support elements, cardinality constraints on components, fixed LOINC codes, or required UCUM units.

## Migration Summary & Actionable Takeaways for `us-core-blood-pressure`

*   **US Core Profile Changes Required:**
    1.  **`Observation.status` Handling:** The US Core team (likely at the `us-core-vital-signs` level or IG-wide) needs to determine its policy for the expanded R6 `Observation.status` codes. This may involve updating ValueSet bindings or guidance.
    2.  **No other direct structural changes** to the `us-core-blood-pressure` differential are mandated by R6 breaking changes, as its core pattern (panel code, systolic/diastolic components as `Quantity`) remains compatible.

*   **Implementation Changes Required:**
    1.  **Support Expanded `Observation.status` Codes:** Implementers of systems producing or consuming R6 `us-core-blood-pressure` data must be prepared to handle the new R6 status codes (e.g., `cancelled`, `corrected`).
    2.  **`value-string` Search Parameter (Server-Side):** Servers implementing US Core search capabilities need to be aware that the `value-string` search parameter in R6 *only* searches `Observation.valueString`. In R4, it also searched `Observation.valueCodeableConcept.text`. Queries relying on the R4 behavior for `valueCodeableConcept.text` will need adjustment (e.g., to use `value-concept:text`). This affects searchability, not the profile definition itself.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  **`Observation.organizer`:** Setting `Observation.organizer = true` on the main blood pressure panel Observation (LOINC `85354-9`) would align well with R6 modeling for panels. The associated R6 constraint `obs-11` (if `organizer=true`, then `value[x]`, `dataAbsentReason`, and `component` SHALL NOT be present on the organizer) reinforces existing `us-core-blood-pressure` guidance that the top-level `Observation.value[x]` should be omitted. This could be adopted as a best practice.
    2.  **`Observation.instantiates[x]`:** Could be used to link `us-core-blood-pressure` instances to a canonical `ObservationDefinition` for blood pressure, improving semantic precision.

## Overall Migration Impact
Impact: Low

The core structure of `us-core-blood-pressure` (LOINC panel code `85354-9`, and component LOINC codes for systolic `8480-6` and diastolic `8462-4` with `valueQuantity` and fixed UCUM units) is not broken by the R4 to R6 changes in the base `Observation` resource.

The primary impact is the expansion of the `Observation.status` value set, which is an IG-wide consideration for all Observation-based profiles. The US Core team will need to decide on its approach to these new status codes. Other R6 changes, such as new data types for `value[x]`, are mitigated by existing constraints within `us-core-blood-pressure` (e.g., components fixed to `valueQuantity`, advice to omit top-level `value[x]`). New R6 features like `organizer` are optional enhancements that align with existing profile guidance. No significant re-profiling decisions are forced upon `us-core-blood-pressure` specifically.