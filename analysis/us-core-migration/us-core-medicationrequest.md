## Impact of R6 Changes on `us-core-medicationrequest`

The migration from FHIR R4 to R6 MedicationRequest introduces several structural changes in the base resource that directly impact `us-core-medicationrequest`.

*   **`MedicationRequest.medication[x]` (Must Support)**
    *   **Relevant R6 Base Change:** In R4, `medication[x]` is a choice of `CodeableConcept` or `Reference(Medication)`. R6 consolidates this into a single element: `medication` of type `CodeableReference(Medication)`.
    *   **Direct Impact on `us-core-medicationrequest`:** This is a significant structural breaking change. `us-core-medicationrequest` mandates `medication[x]` and requires systems to support both choices. The profile must be updated to use the R6 `medication` (CodeableReference) element. The existing US Core binding to RXNorm (extensible) for `medicationCodeableConcept` will apply to the `medication.concept` part of the `CodeableReference`. Guidance will be needed for implementers on how to populate and consume this new structure while preserving the intent of supporting both coded and referenced medications.

*   **`MedicationRequest.reported[x]` (Must Support)**
    *   **Relevant R6 Base Change:** R4's `reported[x]` allows a choice of `reportedBoolean` (boolean) or `reportedReference` (Reference). R6 restructures this into two distinct elements: `reported` (boolean) and `informationSource` (`0..*` Reference).
    *   **Direct Impact on `us-core-medicationrequest`:** This is a significant structural breaking change. `us-core-medicationrequest` mandates `reported[x]` (with Must Support on both `boolean` and `Reference` types). The profile must be updated. Data previously in `reportedBoolean` will map to the R6 `reported` element. Data previously in `reportedReference` will map to the new R6 `informationSource` element. US Core will need to define constraints (e.g., Must Support, target profiles) for the new `informationSource` element.

*   **`MedicationRequest.reasonCode` and `MedicationRequest.reasonReference` (Profiled as Additional USCDI Requirements)**
    *   **Relevant R6 Base Change:** R4 has separate `reasonCode` (CodeableConcept) and `reasonReference` (Reference) elements. R6 consolidates these into a single element: `reason` (`0..*` of type `CodeableReference(Condition | Observation | DiagnosticReport | Procedure)`). The target types for the reference part are also expanded in R6.
    *   **Direct Impact on `us-core-medicationrequest`:** This is a structural breaking change affecting USCDI-required elements. `us-core-medicationrequest` profiles both `reasonCode` (with an extensible binding to `us-core-condition-code`) and `reasonReference` (targeting US Core Condition or Observation). The profile must be updated to use the R6 `reason` (CodeableReference) element. The binding for `reasonCode` will apply to `reason.concept`. US Core must decide whether to constrain the `reason.reference` target types to `Condition` and `Observation` as in R4, or to allow/profile the newly added R6 target types (`DiagnosticReport`, `Procedure`).

*   **`MedicationRequest.status` (Must Support)**
    *   **Relevant R6 Base Change:** The ValueSet for `MedicationRequest.status` (`http://hl7.org/fhir/ValueSet/medicationrequest-status`) adds a new code `ended` in R6.
    *   **Direct Impact on `us-core-medicationrequest`:** Low impact. The `us-core-medicationrequest` profile's required binding to this ValueSet will need to be updated to reference the R6 version. Implementers must be prepared to receive and understand this new `ended` status code. No structural change to the profile itself is mandated by this, beyond the ValueSet version update.

*   **`MedicationRequest.category:us-core` (Must Support slice)**
    *   **Relevant R6 Base Change:** The base `MedicationRequest.category` element's *example* binding changes from `http://hl7.org/fhir/ValueSet/medicationrequest-category` (R4) to `http://hl7.org/fhir/ValueSet/medicationrequest-admin-location` (R6).
    *   **Direct Impact on `us-core-medicationrequest`:** `us-core-medicationrequest` defines a slice `category:us-core` with a *required* binding to `http://hl7.org/fhir/ValueSet/medicationrequest-category`. While the US Core profile can maintain its specific binding, the R6 base resource's semantic shift for `category` (towards administration location) warrants review. The US Core team should decide whether to align with the new base R6 intent for `category` or explicitly state its rationale for continuing with the broader `medicationrequest-category` ValueSet. This is a policy/alignment consideration rather than an immediate technical break if the current US Core binding is maintained.

Other Must Support elements in `us-core-medicationrequest` (e.g., `intent`, `subject`, `encounter`, `authoredOn`, `requester`, `dosageInstruction` and its sub-elements, `dispenseRequest` and its sub-elements) are not directly broken by R6 base changes, or the R6 changes are additive and do not invalidate US Core's current constraints on these elements.

---
## Migration Summary & Actionable Takeaways for `us-core-medicationrequest`

*   **US Core Profile Changes Required:** Yes, significant re-profiling of `us-core-medicationrequest` will be necessary.
    1.  **`medication[x]`**: Replace with the R6 `medication` element (type `CodeableReference`). Update constraints and guidance accordingly.
    2.  **`reported[x]`**: Replace with R6 `reported` (boolean) and `informationSource` (Reference). New constraints and Must Support decisions for `informationSource` will be needed (e.g., target US Core profiles).
    3.  **`reasonCode`/`reasonReference`**: Replace with R6 `reason` element (type `CodeableReference`). Update bindings for `reason.concept`. Decide on allowed target profiles for `reason.reference` (whether to expand beyond Condition/Observation).
    4.  **`status`**: Update the ValueSet binding to the R6 version of `http://hl7.org/fhir/ValueSet/medicationrequest-status`.
    5.  **`category`**: Review the `category:us-core` slice's binding to `http://hl7.org/fhir/ValueSet/medicationrequest-category` in light of the R6 base `category` element's semantic shift towards `medicationrequest-admin-location`. Decide whether to align or maintain the current binding with justification.

*   **Implementation Changes Required:** Yes, implementers will need to make substantial updates.
    1.  **Data Model & Logic:** Adapt to the `CodeableReference` structure for `medication` and `reason`.
    2.  **Data Mapping:** Handle the split of `reported[x]` into `reported` (boolean) and `informationSource` (Reference).
    3.  **Status Handling:** Recognize and correctly interpret the new `ended` status for `MedicationRequest.status`.
    4.  **API Interactions:** Update systems to produce and consume MedicationRequest resources according to the revised US Core profile based on R6 structures.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `MedicationRequest.renderedDosageInstruction` (markdown): Could be considered to provide a standardized, human-readable summary of complex dosage regimens, complementing the existing Must Support `dosageInstruction.text`.
    *   `MedicationRequest.effectiveDosePeriod` (Period): May offer clearer representation of the overall duration of a medication therapy.
    *   `MedicationRequest.dispenseRequest.doseAdministrationAid` (CodeableConcept): Potentially useful for requesting specific adherence packaging, aligning with medication adherence goals.

---
## Overall Migration Impact
Impact: Significant

The base R6 `MedicationRequest` resource introduces several structural breaking changes (e.g., use of `CodeableReference` for `medication` and `reason`; restructuring of `reported[x]`) that directly affect elements currently profiled and mandated as Must Support or required for USCDI by `us-core-medicationrequest`. This will necessitate non-trivial re-profiling efforts by the US Core editorial team, including new decisions on constraints and Must Support for elements like `informationSource` and `reason.reference` targets. Implementers will face considerable work to update their systems.