## Impact of R6 Changes on `us-core-provenance`

This section details how R6 changes to the base `Provenance` resource directly affect core elements and constraints defined in `us-core-provenance`.

*   **`Provenance.recorded` (Timestamp of activity)**
    *   **`us-core-provenance` Constraint:** `Provenance.recorded` is Must Support and mandatory (1..1).
    *   **Relevant R6 Base Change:** `Provenance.recorded` is now optional (0..1) in the R6 base resource.
    *   **Direct Impact on `us-core-provenance`:** This is a direct conflict. `us-core-provenance` currently mandates an element that is optional in R6. The US Core team must decide:
        1.  Maintain the 1..1 cardinality for `recorded` in `us-core-provenance`. This is a valid, stricter constraint than R6 base.
        2.  Align with R6 by changing `us-core-provenance` to make `recorded` 0..1. This would be a breaking change for existing US Core implementers who expect `recorded` to always be present.

*   **`Provenance.agent.type` (How agent participated)**
    *   **`us-core-provenance` Constraint:**
        *   `Provenance.agent.type` is Must Support and bound to the ValueSet `us-core-provenance-participant-type`.
        *   The `ProvenanceAuthor` slice patterns `agent.type` to `system: "http://terminology.hl7.org/CodeSystem/provenance-participant-type", code: "author"`.
        *   The `ProvenanceTransmitter` slice patterns `agent.type` to `system: "http://hl7.org/fhir/us/core/CodeSystem/us-core-provenance-participant-type", code: "transmitter"`.
    *   **Relevant R6 Base Change:** The value set binding for base `Provenance.agent.type` has changed from `provenance-agent-type` (R4, based on `provenance-participant-type` CodeSystem) to `participation-role-type` (R6, based on `participation-role-type` CodeSystem). The R6 binding strength is `example`.
    *   **Direct Impact on `us-core-provenance`:** This is a significant change requiring careful review.
        *   The US Core team needs to evaluate its `us-core-provenance-participant-type` ValueSet and the specific codes used (especially `author` from `provenance-participant-type`) against the new R6 base `participation-role-type` CodeSystem/ValueSet.
        *   The R6 diff notes that `participation-role-type` provides more specific "Functional Role" semantics, referencing ISO standards. The team must determine if `provenance-participant-type#author` is still the appropriate code for the `ProvenanceAuthor` slice or if a code from `participation-role-type` should be used in R6.
        *   This may require updates to the `us-core-provenance-participant-type` ValueSet and/or the pattern in the `ProvenanceAuthor` slice. The `transmitter` code, being US Core-specific, is less directly affected by the base CodeSystem change but its relationship to the overall agent typing scheme should be consistent.

*   **`Provenance.agent.who` (Who participated)**
    *   **`us-core-provenance` Constraint:** `Provenance.agent.who` is Must Support and its `targetProfile` is restricted to US Core Organization, Practitioner, Patient, PractitionerRole, RelatedPerson, and base Device.
    *   **Relevant R6 Base Change:** Base `Provenance.agent.who` now supports additional reference types: `CareTeam`, `Group`, and `HealthcareService`.
    *   **Direct Impact on `us-core-provenance`:** `us-core-provenance`'s current restriction is valid. The US Core team can choose to:
        1.  Maintain the current, more restrictive list of `targetProfile`s.
        2.  Expand the `targetProfile` list in `us-core-provenance` to include some or all of the new R6 options (`CareTeam`, `Group`, `HealthcareService`) if deemed appropriate for US Core use cases.

*   **New Constraints on `Provenance.agent` in R6 Base**
    *   **Relevant R6 Base Change:** R6 introduces four new constraints (`prov-1` to `prov-4`) on `Provenance.agent.who` and `Provenance.agent.onBehalfOf` to prevent invalid self-delegation or illogical circular references (e.g., `who` and `onBehalfOf` cannot be the same).
    *   **Direct Impact on `us-core-provenance`:** These R6 constraints are generally compatible with and additive to US Core's existing `provenance-1` constraint (`onBehalfOf` SHALL be present when `Provenance.agent.who` is a Practitioner or Device). Implementers of `us-core-provenance` in R6 will need to be aware of and adhere to these additional base R6 constraints.

*   **Elements Not Currently Profiled by `us-core-provenance` but Changed in R6 Base:**
    *   **`Provenance.reason` (R4) replaced by `Provenance.authorization` and `Provenance.why` (R6):** Since `us-core-provenance` does not currently mandate or constrain `Provenance.reason`, its removal and replacement has no direct impact on the *current profile definition*. These new elements become available for potential profiling in an R6 version of `us-core-provenance`.
    *   **`Provenance.entity.role` Value Set Change:** The code `derivation` is replaced by `instantiates`. This has no direct impact as `us-core-provenance` does not profile `Provenance.entity`.
    *   **New Elements `Provenance.basedOn`, `Provenance.patient`, `Provenance.encounter`:** These are new in R6 and not currently in `us-core-provenance`. No direct impact on the current profile, but they offer new capabilities for consideration.

## Migration Summary & Actionable Takeaways for `us-core-provenance`

*   **US Core Profile Changes Required:**
    1.  **`Provenance.recorded` Cardinality:** The editorial team must decide whether to maintain the current mandatory (1..1) status (stricter than R6 base) or align with R6's optional (0..1) status. The latter would be a breaking change for current US Core implementers.
    2.  **`Provenance.agent.type` Terminology:** Review and potentially update the `us-core-provenance-participant-type` ValueSet and the `agent.type` pattern in the `ProvenanceAuthor` slice. This is to ensure alignment with the R6 base `Provenance.agent.type` binding to `participation-role-type` and its revised semantics.
    3.  **`Provenance.agent.who` Target Profiles:** Decide whether to expand the allowed `targetProfile`s for `Provenance.agent.who` to include new R6 options like `CareTeam`, `Group`, or `HealthcareService`.

*   **Implementation Changes Required:**
    1.  **Handle `Provenance.recorded` Optionality:** If US Core changes `recorded` to 0..1, consuming applications must be updated to handle its potential absence.
    2.  **Adhere to New R6 Agent Constraints:** Implementers must ensure compliance with the new R6 base constraints (`prov-1` to `prov-4`) on `Provenance.agent`.
    3.  **Terminology Updates for `agent.type`:** If US Core updates its `agent.type` related terminology, data producers and consumers will need to adapt to the new codes/systems.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  **`Provenance.patient` (Reference(Patient)):** This new element offers a direct link to the patient subject of the data. This is highly relevant to US Core's patient-centric focus and could simplify patient-specific provenance queries.
    2.  **`Provenance.authorization` (CodeableReference) and `Provenance.why` (markdown):** These replace R4's `reason` and provide structured and narrative ways to capture the purpose or justification for the event. US Core could leverage these to convey purpose of use if desired.
    3.  **`Provenance.basedOn` (Reference(Any)) and `Provenance.encounter` (Reference(Encounter)):** Offer enhanced contextual linking for provenance records.

## Overall Migration Impact
Impact: Significant

The migration from R4 to R6 for `us-core-provenance` is assessed as **Significant**. This is primarily due to:
1.  The R6 base change making `Provenance.recorded` optional (0..1), which conflicts with `us-core-provenance`'s current mandatory (1..1) constraint. A decision by the US Core team to align with R6 would be a breaking change for implementers.
2.  The change in the R6 base value set for `Provenance.agent.type` to `participation-role-type`. This requires the US Core team to re-evaluate its `us-core-provenance-participant-type` ValueSet and the coding for the `ProvenanceAuthor` slice, potentially leading to terminology mapping and updates.

These issues require careful consideration and new decisions by the US Core editorial team, potentially involving community consensus and non-trivial updates to the profile and implementation guidance.