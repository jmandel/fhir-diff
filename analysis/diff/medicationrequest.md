# FHIR MedicationRequest Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR MedicationRequest resource between R4 and R6 versions, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the MedicationRequest resource from R4 to R6 involves several substantial changes, enhancing clarity, data structure, and introducing new functionalities. The resource maturity has also increased from Level 3 to Level 4.

Key impacts include:

1.  **Consolidation with `CodeableReference`:**
    *   `medication[x]` (choice of `CodeableConcept` or `Reference`) in R4 is now a single `medication` element of type `CodeableReference(Medication)` in R6.
    *   `reasonCode` / `reasonReference` in R4 are consolidated into a single `reason` element of type `CodeableReference(Condition | Observation | DiagnosticReport | Procedure)` in R6, with expanded target types.
    *   These are **Breaking Changes** requiring data model updates and migration to the `CodeableReference` structure.

2.  **Restructuring of "Reported" Information:**
    *   R4's `reported[x]` (choice of `reportedBoolean` or `reportedReference`) is split.
    *   R6 has a simple `reported` (boolean) element.
    *   A new `informationSource` element (`0..* Reference`) in R6 now explicitly captures the source of the reported information, previously part of `reportedReference`.
    *   This is a **Breaking Change** requiring data migration for `reportedReference`.

3.  **Element Renaming:**
    *   `MedicationRequest.dispenseRequest.performer` (R4) is renamed to `MedicationRequest.dispenseRequest.dispenser` (R6). This is a minor **Breaking Change**.

4.  **New Elements Adding Functionality:**
    *   `statusChanged` (dateTime): Tracks when the status was last updated.
    *   `device` (CodeableReference(DeviceDefinition)): Specifies the intended device for administration.
    *   `renderedDosageInstruction` (markdown): Provides a human-readable summary of complex dosage instructions.
    *   `effectiveDosePeriod` (Period): Defines the overall period for medication intake.
    *   `dispenseRequest.dispenserInstruction` (Annotation): For additional instructions to the dispenser.
    *   `dispenseRequest.doseAdministrationAid` (CodeableConcept): Specifies adherence packaging.

5.  **Element Removals (Based on Provided R6 Documentation):**
    *   `instantiatesCanonical` and `instantiatesUri` are not present in the R6 element list provided. If this reflects the official R6 specification, it's a **Breaking Change** for systems that used these elements. Implementers should verify this against the canonical R6 specification.

6.  **Modified Element Properties:**
    *   `status`: Adds a new code `ended`.
    *   `performer`: Cardinality changed from `0..1` to `0..*`, and target types updated (e.g., `Device` to `DeviceDefinition`, `HealthcareService` and `Group` added).
    *   Value set bindings and strengths have been updated for several elements (e.g., `category`, `performerType`, `courseOfTherapyType`, `substitution.allowed[x]`).

7.  **Search Parameter Changes:**
    *   R4 `date` search parameter is renamed to `combo-date` in R6 with an expanded FHIRPath expression. This is a **Breaking Change** for queries.
    *   Expressions for `code` and `medication` search parameters are updated due to the `CodeableReference` change.
    *   New search parameters `group-identifier` and `group-or-identifier` added in R6.

Implementers must carefully review these changes, plan for data migration, update system logic to handle new and modified elements, and revise API queries.

## 2. Overall Resource Scope and Purpose Evolution

The fundamental purpose of MedicationRequest—to order or request medication supply and administration instructions—remains consistent between R4 and R6. Both versions aim to generalize use across inpatient and outpatient settings.

*   **R4:** Focused on the order lifecycle, mentioning external reporting.
*   **R6:** Provides more explicit guidance on relationships with other resources like `Task` (for fulfillment) and `RequestOrchestration` (for complex grouping). It also clarifies what *not* to use for workflow grouping (e.g., `List`, `Composition`). The descriptions for some elements (e.g., `groupIdentifier`, `doNotPerform`) are more detailed, offering better clarity on their intended use and implications.
*   **Maturity:** The resource's maturity level has advanced from 3 in R4 to 4 in R6 (still "Trial Use"), indicating increased community review and implementation experience.

**Impact:** The core use cases are stable. R6 provides better definitional clarity and guidance on integration within broader FHIR workflows.

## 3. Element-Level Changes

The order of some elements has been adjusted in R6 (e.g., `basedOn`, `priorPrescription`, `groupIdentifier` moved higher). While not breaking for serialization, this can affect document readability and reflects logical grouping.

### 3.1. New Elements in R6

*   **`MedicationRequest.statusChanged`**
    *   **Type:** `dateTime`, Cardinality: `0..1`
    *   **Purpose:** Records the date and time when the `status` of the MedicationRequest was last changed.
    *   **Impact:** Useful for auditing and tracking the progression of the request. Systems can now store and query this information directly.

*   **`MedicationRequest.informationSource`**
    *   **Type:** `Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization | Group)`, Cardinality: `0..*`
    *   **Purpose:** Identifies the person or organization that provided the information for the request, especially if different from the `requester` (e.g., for reported prescriptions).
    *   **Impact:** Replaces and clarifies the functionality of R4's `reportedReference`. Allows for multiple sources. Data from R4 `reportedReference` should be migrated here.

*   **`MedicationRequest.device`**
    *   **Type:** `CodeableReference(DeviceDefinition)`, Cardinality: `0..*`
    *   **Purpose:** Specifies the intended type of device to be used for administering the medication (e.g., PCA Pump).
    *   **Impact:** Provides a dedicated element for this information, distinct from `performer` which might also reference a `DeviceDefinition` as the actor.

*   **`MedicationRequest.renderedDosageInstruction`**
    *   **Type:** `markdown`, Cardinality: `0..1`
    *   **Purpose:** A full, human-readable textual representation of all dosage instructions, especially useful for complex regimens (e.g., tapering doses).
    *   **Impact:** Systems displaying dosage information should be prepared to render markdown. This standardizes a way to present complex dosing that was previously only hinted at.

*   **`MedicationRequest.effectiveDosePeriod`**
    *   **Type:** `Period`, Cardinality: `0..1`
    *   **Purpose:** Defines the overall period during which the medication is intended to be taken, encompassing all dosage instructions.
    *   **Impact:** Useful for understanding the total duration of therapy, especially with multiple or complex `dosageInstruction` entries.

*   **`MedicationRequest.dispenseRequest.dispenserInstruction`**
    *   **Type:** `Annotation`, Cardinality: `0..*`
    *   **Purpose:** Provides additional instructions specifically for the dispenser (e.g., patient counseling points).
    *   **Impact:** Allows for richer communication with the pharmacy.

*   **`MedicationRequest.dispenseRequest.doseAdministrationAid`**
    *   **Type:** `CodeableConcept`, Cardinality: `0..1`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/medication-dose-aid` (example strength)
    *   **Purpose:** Specifies any requested adherence packaging for the dispense (e.g., blister pack).
    *   **Impact:** Standardizes requests for dose aids.

### 3.2. Modified Elements (R4 to R6)

Significant modifications often involve type changes (especially to `CodeableReference`), cardinality adjustments, or binding updates.

*   **`MedicationRequest.medication[x]` (R4) -> `MedicationRequest.medication` (R6)**
    *   **R4 Type:** Choice of `medicationCodeableConcept` (`CodeableConcept`) or `medicationReference` (`Reference(Medication)`), Cardinality: `1..1` (for the choice)
    *   **R6 Type:** `CodeableReference(Medication)`, Cardinality: `1..1`
    *   **Binding (for concept part):** `http://hl7.org/fhir/ValueSet/medication-codes` (example strength) - consistent.
    *   **Impact:** **Breaking Change.** This is a key structural change. R4's choice is replaced by the single `medication` element of type `CodeableReference`. Data must be migrated from the separate R4 elements into the appropriate part (`concept` or `reference`) of the R6 `CodeableReference` structure. Search parameter expressions are also affected (see Search Parameter section).

*   **`MedicationRequest.reported[x]` (R4) -> `MedicationRequest.reported` (R6) & new `informationSource`**
    *   **R4 Type:** Choice of `reportedBoolean` (`boolean`) or `reportedReference` (`Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization)`), Cardinality: `0..1` for each.
    *   **R6 Type:** `reported` (`boolean`), Cardinality: `0..1`. The reference aspect is handled by the new `informationSource` element (see New Elements).
    *   **Impact:** **Breaking Change.** R4 `reportedBoolean` maps directly to R6 `reported`. Data from R4 `reportedReference` must be migrated to the new `MedicationRequest.informationSource` element.

*   **`MedicationRequest.reason[x]` (R4) -> `MedicationRequest.reason` (R6)**
    *   **R4 Type:** Choice of `reasonCode` (`0..* CodeableConcept`) or `reasonReference` (`0..* Reference(Condition | Observation)`).
    *   **R6 Type:** `reason` (`0..* CodeableReference(Condition | Observation | DiagnosticReport | Procedure)`).
    *   **Binding (for concept part):** `http://hl7.org/fhir/ValueSet/condition-code` (example strength) - consistent.
    *   **Impact:** **Breaking Change.** R4's separate code and reference elements are consolidated into a single `reason` element of type `CodeableReference`. Target resource types for the reference part are expanded in R6 to include `DiagnosticReport` and `Procedure`. Data migration is required.

*   **`MedicationRequest.status`**
    *   **R4 Values:** `active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown`
    *   **R6 Values:** `active | on-hold | ended | stopped | completed | cancelled | entered-in-error | draft | unknown`
    *   **Change:** Value `ended` added to the value set. ValueSet URI version updated.
    *   **Impact:** Systems need to recognize and handle the new `ended` status. This status provides a more definitive terminal state.

*   **`MedicationRequest.category`**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/medicationrequest-category` (example strength)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/medicationrequest-admin-location` (example strength)
    *   **Change:** The value set binding has changed to be more specific to administration location (e.g., inpatient, community).
    *   **Impact:** While the R6 element description remains somewhat general ("arbitrary categorization"), the binding change suggests a primary focus. Systems using `category` for other purposes in R4 should review if `medicationrequest-admin-location` is appropriate or if extensions are needed.

*   **`MedicationRequest.performerType`**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/performer-role` (example strength)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/medication-intended-performer-role` (extensible strength)
    *   **Change:** Value set changed to be more specific, and binding strength increased to `extensible`.
    *   **Impact:** Update mappings to the new value set. The `extensible` strength encourages use of the provided codes but allows others if necessary.

*   **`MedicationRequest.performer`**
    *   **R4 Cardinality & Type:** `0..1`, `Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam)`
    *   **R6 Cardinality & Type:** `0..*`, `Reference(Practitioner | PractitionerRole | Organization | Patient | DeviceDefinition | RelatedPerson | CareTeam | HealthcareService | Group)`
    *   **Change:**
        *   Cardinality changed from `0..1` to `0..*`, allowing multiple performers.
        *   Target type `Device` (R4) changed to `DeviceDefinition` (R6).
        *   New target types `HealthcareService` and `Group` added in R6.
    *   **Impact:** Significant change. Systems must now be able_to handle an array of performers. Logic for referencing performers needs to accommodate the change from `Device` to `DeviceDefinition` and support the new target types.

*   **`MedicationRequest.courseOfTherapyType`**
    *   **R4 Binding Strength:** `example`
    *   **R6 Binding Strength:** `extensible`
    *   **Change:** Binding strength increased.
    *   **Impact:** Encourages more consistent use of the standard codes from the value set.

*   **`MedicationRequest.dispenseRequest.performer` (R4) -> `MedicationRequest.dispenseRequest.dispenser` (R6)**
    *   **R4 Name & Type:** `performer`, `0..1 Reference(Organization)`
    *   **R6 Name & Type:** `dispenser`, `0..1 Reference(Organization)`
    *   **Change:** Element renamed for clarity.
    *   **Impact:** Minor **Breaking Change** due to element name. Update code and mappings to use `dispenser`. Search parameter `intended-dispenser` expression is updated accordingly.

*   **`MedicationRequest.substitution.allowed[x]`**
    *   **R4 Syntax & Binding:** `allowedBoolean` or `allowedCodeableConcept`, strength `example`.
    *   **R6 Syntax & Binding:** `allowed[x]` (choice of `boolean` or `CodeableConcept`), strength `preferred`.
    *   **Change:** Choice syntax simplified. Binding strength increased to `preferred`.
    *   **Impact:** Minor syntax adjustment. Stronger guidance to use codes from the specified value set.

*   **`MedicationRequest.basedOn`**
    *   **R4 Targets:** `CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation`
    *   **R6 Targets:** `CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation | RequestOrchestration`
    *   **Change:** `RequestOrchestration` added as a potential target type.
    *   **Impact:** Allows linking MedicationRequest to a broader orchestration plan.

### 3.3. Removed Elements from R4 (Based on Provided R6 Documentation)

*   **`MedicationRequest.reportedBoolean`**: Superseded by `MedicationRequest.reported` (boolean) in R6.
*   **`MedicationRequest.reportedReference`**: Functionality replaced and clarified by the new `MedicationRequest.informationSource` element in R6.
*   **`MedicationRequest.medicationCodeableConcept`**: Merged into `MedicationRequest.medication` (CodeableReference) in R6.
*   **`MedicationRequest.medicationReference`**: Merged into `MedicationRequest.medication` (CodeableReference) in R6.
*   **`MedicationRequest.reasonCode`**: Merged into `MedicationRequest.reason` (CodeableReference) in R6.
*   **`MedicationRequest.reasonReference`**: Merged into `MedicationRequest.reason` (CodeableReference) in R6.
*   **`MedicationRequest.instantiatesCanonical`**: Not present in the provided R6 element list.
    *   **Impact (if confirmed by official spec):** This is a **Breaking Change**. Systems using this to link to definitions like `PlanDefinition` or `ActivityDefinition` will need to find alternative mechanisms (e.g., potentially via `basedOn` or extensions). Implementers must verify this removal against the canonical R6 specification.
*   **`MedicationRequest.instantiatesUri`**: Not present in the provided R6 element list.
    *   **Impact (if confirmed by official spec):** Similar to `instantiatesCanonical`, this would be a **Breaking Change**.

## 4. Constraint Changes

Neither the R4 nor the R6 markdown documents provided explicitly list formal constraints (invariants) for the MedicationRequest resource. Implementers should always refer to the official FHIR specification for any defined constraints.

## 5. Search Parameter Changes

*   **`code`**
    *   **R4 Expression:** `(MedicationRequest.medication as CodeableConcept)`
    *   **R6 Expression:** `MedicationRequest.medication.concept`
    *   **Impact:** FHIRPath expression updated to reflect the `medication` element's change to `CodeableReference`. Queries need to use the new path.

*   **`date` (R4) -> `combo-date` (R6)**
    *   **R4 Name & Expression:** `date`, `MedicationRequest.dosageInstruction.timing.event`
    *   **R6 Name & Expression:** `combo-date`, `MedicationRequest.dosageInstruction.timing.event | (MedicationRequest.dosageInstruction.timing.repeat.bounds.ofType(Period))`
    *   **Impact:** **Breaking Change.** Search parameter renamed. Expression expanded to also search within `timing.repeat.bounds` of type `Period`. Queries must be updated to use the new name and will benefit from enhanced search capabilities.

*   **`group-identifier` (New in R6)**
    *   **Expression:** `MedicationRequest.groupIdentifier`
    *   **Impact:** New search parameter to find requests by their group identifier.

*   **`group-or-identifier` (New in R6)**
    *   **Expression:** `MedicationRequest.groupIdentifier | MedicationRequest.identifier`
    *   **Impact:** New composite search parameter allowing search by either `groupIdentifier` or other `identifier`s.

*   **`intended-dispenser`**
    *   **R4 Expression:** `MedicationRequest.dispenseRequest.performer`
    *   **R6 Expression:** `MedicationRequest.dispenseRequest.dispenser`
    *   **Impact:** Expression updated due to the renaming of the underlying element (`performer` to `dispenser`). The search parameter name itself remains `intended-dispenser`.

*   **`intended-performer`**
    *   **R4 Targets:** `Practitioner, Organization, Patient, Device, RelatedPerson, CareTeam, PractitionerRole`
    *   **R6 Targets:** `Practitioner, PractitionerRole, Organization, Patient, DeviceDefinition, RelatedPerson, CareTeam, HealthcareService, Group`
    *   **Impact:** Target resource types updated to align with changes in the `MedicationRequest.performer` element (e.g., `Device` changed to `DeviceDefinition`, `HealthcareService` and `Group` added). Queries may need to adjust for these new/changed target types.

*   **`medication`**
    *   **R4 Expression:** `(MedicationRequest.medication as Reference)`
    *   **R6 Expression:** `MedicationRequest.medication.reference`
    *   **Impact:** FHIRPath expression updated to reflect the `medication` element's change to `CodeableReference`. Queries need to use the new path.

*   **Unchanged Search Parameters (Name and Core Expression Logic):**
    `authoredon`, `category`, `encounter`, `identifier`, `intended-performertype`, `intent`, `patient`, `priority`, `requester`, `status`, `subject`. (Note: `category`'s underlying element binding changed, which might affect search results if different codes are now used).

## 6. Key Migration Actions & Considerations

1.  **Data Migration for `CodeableReference`:**
    *   Migrate R4 `medicationCodeableConcept` or `medicationReference` data into the R6 `MedicationRequest.medication` (CodeableReference) structure.
    *   Migrate R4 `reasonCode` or `reasonReference` data into the R6 `MedicationRequest.reason` (CodeableReference) structure.
    *   Adapt system logic to handle the `CodeableReference` pattern for these elements.

2.  **Data Migration for "Reported" Information:**
    *   Map R4 `reportedBoolean` to R6 `MedicationRequest.reported`.
    *   Migrate data from R4 `reportedReference` to the new R6 `MedicationRequest.informationSource` element.

3.  **Handle Element Renaming:**
    *   Update references from `MedicationRequest.dispenseRequest.performer` to `MedicationRequest.dispenseRequest.dispenser`.

4.  **Address Potentially Removed Elements:**
    *   **Verify `instantiatesCanonical` / `instantiatesUri` removal:** Check the official R6 specification. If removed, devise alternative strategies or use extensions if this functionality is critical.

5.  **Implement Support for New R6 Elements:**
    *   Evaluate and integrate `statusChanged`, `informationSource`, `device`, `renderedDosageInstruction`, `effectiveDosePeriod`, `dispenseRequest.dispenserInstruction`, and `dispenseRequest.doseAdministrationAid` as required by your use cases.
    *   Ensure UI can render markdown for `renderedDosageInstruction`.

6.  **Adapt to Modified Element Properties:**
    *   Support the new `ended` value for `MedicationRequest.status`.
    *   Update logic and mappings for changed value set bindings (e.g., `category` to admin-location specific, `performerType` to medication-intended role) and increased binding strengths.
    *   Modify systems to handle the `0..*` cardinality for `MedicationRequest.performer` and its updated target types (especially `Device` to `DeviceDefinition`, and new `HealthcareService`, `Group`).

7.  **Revise API Queries:**
    *   Rename queries using the R4 `date` search parameter to `combo-date` for R6.
    *   Update FHIRPath expressions in queries for `code` and `medication` search parameters.
    *   Consider using the new `group-identifier` and `group-or-identifier` search parameters.
    *   Ensure queries for `intended-performer` account for new/changed target types.

8.  **Review Scope and Workflow Guidance:**
    *   Consider R6's enhanced guidance on using `Task` and `RequestOrchestration` if relevant to your implementation.

9.  **Testing:** Thoroughly test all changes, including data migration, new element handling, and updated search functionalities.