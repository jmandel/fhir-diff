## Impact of R6 Changes on `us-core-average-blood-pressure`

This section analyzes R6 `Observation` changes directly affecting core aspects of the `us-core-average-blood-pressure` profile.

*   **`Observation.status`**
    *   **Profile Constraint:** `Observation.status` is Must Support. The profile implicitly uses the R4 value set `http://hl7.org/fhir/ValueSet/observation-status|4.0.1`.
    *   **Relevant R6 Base Change:** The value set for `Observation.status` is significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `specimen-in-process`). This is a breaking change from R4's more limited set. The R6 ValueSet URI `http://hl7.org/fhir/ValueSet/observation-status` is also now unversioned.
    *   **Direct Impact on `us-core-average-blood-pressure`:** The profile definition will need to update its binding to the R6 `ObservationStatus` value set. Implementers (both servers and clients) will need to support the new, broader set of status codes. Systems performing strict validation against the R4 value set will require updates.

*   **`Observation.component` (specifically its structure as a panel)**
    *   **Profile Pattern:** `us-core-average-blood-pressure` defines a panel structure using `Observation.component` for systolic and diastolic readings, and mandates `Observation.value[x]` to be absent (max 0).
    *   **Relevant R6 Base Change:** R6 introduces a new boolean element `Observation.organizer` (Trial Use) and a related constraint `obs-11`. `obs-11` states: "if organizer exists and organizer = true, then value[x], dataAbsentReason and component SHALL NOT be present." *Correction: `obs-11` actually means that if `organizer` is true, the organizer observation itself shouldn't have `value[x]` or `component`; the members (linked via `hasMember`) would. The `us-core-average-blood-pressure` profile uses `component` elements directly for its values, not `hasMember` for separate Observation resources.*
        However, the *intent* of `Observation.organizer` is to flag observations that group other observations or components. While `us-core-average-blood-pressure` uses components directly, the R6 `ObservationDefinition` resource which `Observation.instantiates[x]` can point to, has an attribute `ObservationDefinition.qualifiedValue.context.code` which could indicate if an observation is a panel. More directly relevant to the existing panel structure of `us-core-average-blood-pressure` (which uses components not `hasMember`), is that its current design (components for values, no top-level `value[x]`) is a well-established pattern for panels. The new R6 elements like `organizer` or `instantiates` don't break this pattern but offer alternative or supplementary ways to indicate panel structures for R6-native designs. For this profile, which uses components, the existing structure is fine. No direct breaking change, but R6 offers new ways to flag panels that US Core might consider.
        The key for `us-core-average-blood-pressure` is its existing constraint `Observation.value[x]` (max 0), which is compatible with panel-like structures.
    *   **Direct Impact on `us-core-average-blood-pressure`:** No direct breaking impact. The profile's established panel structure using components remains valid. The R6 `organizer` flag is not directly applicable in its current R6 definition (`obs-11` implies no components on the organizer itself) to how this profile structures panels.

*   **`Observation.component.dataAbsentReason`**
    *   **Profile Constraint:** `Observation.component.dataAbsentReason` is Must Support. The profile includes constraint `us-core-26`: "If there is no value a data absent reason must be present" (`value.exists() or dataAbsentReason.exists()`).
    *   **Relevant R6 Base Change:** R6 introduces constraint `obs-10`: `Observation.component.dataAbsentReason SHALL only be present if Observation.component.value[x] is not present.` This means `(value.exists() implies dataAbsentReason.exists().not())`.
    *   **Direct Impact on `us-core-average-blood-pressure`:** The new R6 constraint `obs-10` is compatible with and complements the existing US Core constraint `us-core-26`. Together, they ensure that for a component, exactly one of `value[x]` or `dataAbsentReason` is present. This enhances validation logic but does not break the profile's existing use.

---

## Migration Summary & Actionable Takeaways for `us-core-average-blood-pressure`

*   **US Core Profile Changes Required:**
    1.  **`Observation.status` Binding:** Update the terminology binding for `Observation.status` from the R4-versioned `http://hl7.org/fhir/ValueSet/observation-status|4.0.1` to the R6 unversioned `http://hl7.org/fhir/ValueSet/observation-status`. Documentation should clarify that the expanded R6 codes are now applicable.
    2.  **Review `Observation.component.value[x]` Types:** The R6 base `Observation` now allows `Attachment` and `Reference(MolecularSequence)` for `component.value[x]`. `us-core-average-blood-pressure` currently restricts these types. No change is strictly *required* as the profile's constraint insulates it, but the editorial team should be aware of this base R6 expansion. It is unlikely these new types are relevant for average blood pressure values.

*   **Implementation Changes Required:**
    1.  **Support Expanded `Observation.status` Codes:** Servers must be able to produce, and clients must be able to consume, the full range of R6 `Observation.status` codes.
    2.  **Adhere to `obs-10`:** Implementers should ensure their handling of `Observation.component.value[x]` and `Observation.component.dataAbsentReason` aligns with both `us-core-26` and the new R6 constraint `obs-10` (i.e., exactly one of the two should be present).

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  **`Observation.instantiates[x]`:** This new element could allow instances of `us-core-average-blood-pressure` to formally link to a US Core `ObservationDefinition` for average blood pressure if such a definition is created. This could improve semantic precision and enable more automated validation in R6-native systems.

---

## Overall Migration Impact
Impact: **Low**

The migration primarily involves updating the `Observation.status` value set, which is a necessary but generally manageable change for implementers. The profile's core structure for representing average blood pressure (using components for systolic and diastolic, fixed LOINC codes, UCUM units) remains intact and compatible with R6. The new R6 constraint `obs-10` reinforces existing US Core constraints. No significant re-profiling decisions are mandated by R6 changes for this profile to continue its intended function.