# FHIR Procedure Resource: R4 to R6 Migration Guide

This document outlines the significant changes to the FHIR Procedure resource between R4 and R6. It is intended for implementers to understand the modifications necessary when migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Procedure resource from R4 to R6 introduces substantial changes, primarily focused on broadening its scope, enhancing data representation flexibility, and refining existing concepts. Key impacts include:

1.  **Expanded Scope for `Procedure.subject`**: The `subject` of a procedure can now be a `Device`, `Practitioner`, `Organization`, or `Location`, in addition to `Patient` and `Group`. This significantly widens the resource's applicability beyond direct patient care to areas like device maintenance, practitioner accreditation, or location inspections.
2.  **Introduction of `Procedure.focus`**: A new `isModifier` element `focus` allows specifying the actual target of the procedure if it differs from the `subject` (e.g., caregiver education where the patient is the `subject` but the caregiver is the `focus`).
3.  **Consolidation with `CodeableReference`**: Several element pairs (like `reasonCode`/`reasonReference` and `usedCode`/`usedReference`) have been consolidated into single `CodeableReference` elements (`Procedure.reason`, `Procedure.used`). This is a **Breaking Change** requiring data model updates and migration.
4.  **Element Renaming and Type Changes**:
    *   `Procedure.performed[x]` is renamed to `Procedure.occurrence[x]` and adds `Timing` as a choice type. **Breaking Change**.
    *   `Procedure.outcome` changes from `CodeableConcept` (`0..1`) to `CodeableReference(Observation)` (`0..*`). **Breaking Change**.
    *   `Procedure.complication` changes from `CodeableConcept` to `CodeableReference(Condition)`. `Procedure.complicationDetail` is removed (its functionality merged). **Breaking Change**.
    *   `Procedure.followUp` changes from `CodeableConcept` to `CodeableReference(ServiceRequest | PlanDefinition)`. **Breaking Change**.
5.  **New Elements for Enhanced Context**: Several new elements like `Procedure.recorded` (when the procedure was captured), `Procedure.reported[x]` (if the record is secondary), `Procedure.performer.period`, `Procedure.bodyStructure`, and `Procedure.supportingInfo` have been added to provide richer contextual information.
6.  **Removal of Elements**: `Procedure.instantiatesCanonical`, `Procedure.instantiatesUri`, and `Procedure.asserter` have been removed. **Breaking Changes**.
7.  **Search Parameter Adjustments**: Search parameters have been updated to reflect element additions, removals, and modifications (e.g., `instantiates-canonical`/`uri` removed, `reason-code`/`reason-reference` expressions changed, new `report` parameter).
8.  **Maturity Level Increase**: The resource maturity has advanced from 3 (R4) to 4 (R6), indicating increased stability.

Implementers must prepare for significant data model changes, data migration tasks, and updates to API queries and business logic.

## 2. Overall Resource Scope and Purpose Evolution

*   **R4 Primary Focus:** While R4 acknowledged potential non-patient subjects ("groups, devices, locations" in background text), the primary definition and examples leaned heavily towards procedures "performed on or for a patient."
*   **R6 Explicit Expansion:** R6 explicitly broadens the scope. The definition starts with "An action that is or was performed on or for a patient, practitioner, device, organization, or location."
    *   New use cases are clearly articulated, such as "quality or safety inspection for a location, organization, or device" and "accreditation procedure on a practitioner for licensing."
*   **Impact:** Systems built strictly around patient-centric procedures in R4 will need to adapt their data models, UI, and business logic to accommodate these new subject types and use cases if they intend to leverage the full R6 scope. The introduction of `Procedure.focus` further refines how the target of a procedure is represented.

## 3. Element-Level Changes

This section details additions, removals, and modifications to elements.

### 3.1. New Elements in R6

The following elements have been introduced in R6:

*   **`Procedure.focus` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(Patient | Group | RelatedPerson | Practitioner | Organization | CareTeam | PractitionerRole | Specimen)`
    *   **isModifier:** `true`
    *   **Purpose:** Specifies who or what is the target of the procedure when it's not solely the `subject` of record. For example, if a caregiver receives education related to a patient, the patient is the `subject`, and the caregiver is the `focus`.
    *   **Impact:** This is a significant addition for accurately representing procedures where the primary beneficiary or target is distinct from the administrative subject. As an `isModifier` element, its presence fundamentally changes the interpretation of the resource.

*   **`Procedure.recorded` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Purpose:** Records the date/time when the procedure occurrence was first captured in the system, distinct from when the procedure itself occurred (`occurrence[x]`).
    *   **Impact:** Useful for audit trails and understanding data entry timeliness.

*   **`Procedure.reported[x]` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `boolean` | `Reference(Patient | RelatedPerson | Practitioner | PractitionerRole | Organization)`
    *   **Purpose:** Indicates if this procedure record is a secondary, 'reported' account rather than an original, primary source. Can also reference the source of the report.
    *   **Impact:** Helps distinguish between directly authored records and those derived from other sources.

*   **`Procedure.performer.period` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Period`
    *   **Purpose:** Specifies the time period during which a specific performer was involved in the procedure.
    *   **Impact:** Allows more granular tracking of performer involvement over time, especially for long procedures or those with multiple performers acting at different times.

*   **`Procedure.reason` (New - Replaces `reasonCode` and `reasonReference`)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference(Condition | Observation | Procedure | DiagnosticReport | DocumentReference)`
    *   **Binding (for concept):** `http://hl7.org/fhir/ValueSet/procedure-reason` (example strength)
    *   **Purpose:** Consolidates the R4 `reasonCode` (CodeableConcept) and `reasonReference` (Reference) into a single, more flexible element.
    *   **Impact:** **Breaking Change.** Data from R4 `reasonCode` and `reasonReference` must be migrated to this new structure. Systems need to handle `CodeableReference`.

*   **`Procedure.bodyStructure` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(BodyStructure)`
    *   **Purpose:** Allows linking to a `BodyStructure` resource for detailed anatomical location, as an alternative to `Procedure.bodySite`.
    *   **Impact:** Provides a more structured way to define anatomical locations. A new constraint (`con-4`) ensures `bodySite` and `bodyStructure` are not used simultaneously.

*   **`Procedure.used` (New - Replaces `usedCode` and `usedReference`)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference(Device | Medication | Substance | BiologicallyDerivedProduct)`
    *   **Binding (for concept):** `http://hl7.org/fhir/ValueSet/device-type` (example strength, previously `device-kind` on `usedCode`)
    *   **Purpose:** Consolidates R4 `usedCode` (CodeableConcept) and `usedReference` (Reference) for items used during the procedure. Adds `BiologicallyDerivedProduct` as a target type.
    *   **Impact:** **Breaking Change.** Data migration is required. The binding for coded concepts has also changed.

*   **`Procedure.supportingInfo` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(Any)`
    *   **Purpose:** A general-purpose element to link to other relevant resources that provide context or were used in creating the Procedure instance.
    *   **Impact:** Offers a standard way to include additional supporting information not covered by more specific elements.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Procedure.basedOn` (Modified Target Types)**
    *   **R4 Type:** `Reference(CarePlan | ServiceRequest)`
    *   **R6 Type:** `Reference(CarePlan | ServiceRequest | MedicationRequest)`
    *   **Impact:** Adds `MedicationRequest` as a valid resource that can request a procedure. Systems may need to update their logic for linking procedures to upstream requests.

*   **`Procedure.status` (Modified Binding Version)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/event-status|4.0.1`
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/event-status|6.0.0-cibuild`
    *   **Impact:** The value set version for `event-status` has been updated. While the core codes are likely stable, implementers should verify compatibility and update to the R6 version.

*   **`Procedure.category` (Modified Cardinality)**
    *   **R4 Cardinality:** `0..1` (Note: R4 spec indicated `0..1`, but some build tools anticipated `0..*`)
    *   **R6 Cardinality:** `0..*`
    *   **Impact:** Formally allows multiple categories for a procedure, offering more flexible classification. Systems previously enforcing a single category may need to adapt.

*   **`Procedure.subject` (Modified Target Types - Significant Scope Change)**
    *   **R4 Type:** `Reference(Patient | Group)`
    *   **R6 Type:** `Reference(Patient | Group | Device | Practitioner | Organization | Location)`
    *   **Impact:** **Breaking Change / Major Scope Expansion.** This is one of the most significant changes, allowing procedures to be recorded for non-patient entities. Data models, business logic, and UI will need substantial updates to support these new subject types.

*   **`Procedure.performed[x]` renamed to `Procedure.occurrence[x]` (Renamed, Modified Type Choice)**
    *   **R4 Name & Type:** `Procedure.performed[x]` (`dateTime` | `Period` | `string` | `Age` | `Range`)
    *   **R6 Name & Type:** `Procedure.occurrence[x]` (`dateTime` | `Period` | `string` | `Age` | `Range` | `Timing`)
    *   **Impact:** **Breaking Change.** The element has been renamed. Additionally, `Timing` has been added as a data type choice, offering more complex recurrence patterns for when the procedure occurred. Data migration for the name change is required, and systems may need to support the `Timing` type.

*   **`Procedure.performer.function` (Modified Binding)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/performer-role` (example)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/participant-role` (example)
    *   **Impact:** The value set for describing the performer's role has changed. Mappings to `participant-role` will be necessary.

*   **`Procedure.performer.actor` (Modified Target Types)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device | CareTeam | HealthcareService)`
    *   **Impact:** Expands the types of actors who can perform a procedure by adding `CareTeam` and `HealthcareService`.

*   **`Procedure.outcome` (Modified Type and Cardinality)**
    *   **R4 Type & Cardinality:** `CodeableConcept`, `0..1`
    *   **R6 Type & Cardinality:** `CodeableReference(Observation)`, `0..*`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/procedure-outcome` (example)
    *   **Impact:** **Breaking Change.** The outcome can now be represented as a reference to an `Observation` resource or as a `CodeableConcept` (via `CodeableReference`), and multiple outcomes can be recorded. This allows for richer, structured outcome data. Data migration is required.

*   **`Procedure.complication` (Modified Type)**
    *   **R4 Type:** `CodeableConcept`
    *   **R6 Type:** `CodeableReference(Condition)`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/condition-code` (example)
    *   **Impact:** **Breaking Change.** Complications are now represented using `CodeableReference`, allowing a link to a `Condition` resource or a `CodeableConcept`. This change effectively merges the functionality of the R4 `Procedure.complicationDetail` element. Data migration required.

*   **`Procedure.followUp` (Modified Type)**
    *   **R4 Type:** `CodeableConcept`
    *   **R6 Type:** `CodeableReference(ServiceRequest | PlanDefinition)`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/procedure-followup` (example)
    *   **Impact:** **Breaking Change.** Follow-up instructions can now be a `CodeableConcept` or a reference to a `ServiceRequest` or `PlanDefinition`, enabling more structured and actionable follow-up plans. Data migration required.

### 3.3. Removed Elements from R4

The following elements present in R4 have been removed in R6:

*   **`Procedure.instantiatesCanonical`**
    *   **Impact:** **Breaking Change.** This element, used for referencing FHIR-defined protocols, is removed. Implementers will need to find alternative ways to link to definitions if this was used, possibly through extensions or other related resources.
*   **`Procedure.instantiatesUri`**
    *   **Impact:** **Breaking Change.** Similar to `instantiatesCanonical`, this element for external URIs is removed.
*   **`Procedure.asserter`**
    *   **Impact:** **Breaking Change.** The `asserter` element (who made the statement) is removed. Provenance resources might be a more general way to capture this information.
*   **`Procedure.reasonCode`**
    *   **Impact:** **Breaking Change.** Replaced by the consolidated `Procedure.reason` (`CodeableReference`). Data must be migrated.
*   **`Procedure.reasonReference`**
    *   **Impact:** **Breaking Change.** Replaced by the consolidated `Procedure.reason` (`CodeableReference`). Data must be migrated.
*   **`Procedure.complicationDetail`**
    *   **Impact:** **Breaking Change.** This `Reference(Condition)` element is removed. Its functionality is now part of the enhanced `Procedure.complication` which is a `CodeableReference(Condition)`. Data should be migrated into `Procedure.complication.reference`.
*   **`Procedure.usedReference`**
    *   **Impact:** **Breaking Change.** Replaced by the consolidated `Procedure.used` (`CodeableReference`). Data must be migrated.
*   **`Procedure.usedCode`**
    *   **Impact:** **Breaking Change.** Replaced by the consolidated `Procedure.used` (`CodeableReference`). Data must be migrated. The value set binding has also changed from `device-kind` to `device-type` within the new `Procedure.used` element.

## 4. Constraint Changes

R6 introduces new constraints:

*   **`prc-1` (New in R6):**
    *   **Location:** `Procedure.performer`
    *   **Description:** `Procedure.performer.onBehalfOf` can only be populated when `performer.actor` isn't `Practitioner` or `PractitionerRole`.
    *   **Expression:** `onBehalfOf.exists() and actor.resolve().exists() implies actor.resolve().where($this is Practitioner or $this is PractitionerRole).empty()`
    *   **Impact:** Enforces a rule about when `onBehalfOf` is appropriate within the `performer` backbone element, typically used when the actor is an organization or device acting for another organization.

*   **`con-4` (New in R6):**
    *   **Location:** `Procedure` (base)
    *   **Description:** `bodyStructure` SHALL only be present if `Procedure.bodySite` is not present.
    *   **Expression:** `bodySite.exists() implies bodyStructure.empty()`
    *   **Impact:** Ensures that `bodySite` (CodeableConcept) and the new `bodyStructure` (Reference to BodyStructure resource) are used exclusively for specifying anatomical location.

Implementers must ensure their systems adhere to these new validation rules.

## 5. Search Parameter Changes

Search capabilities have been affected by the element changes:

### 5.1. New Search Parameters in R6

*   **`report`**
    *   **Type:** `reference`
    *   **Expression:** `Procedure.report`
    *   **Targets:** `Composition`, `DiagnosticReport`, `DocumentReference`
    *   **Impact:** Allows searching for procedures based on linked reports. This formalizes a search capability for an existing R4 element that did not have a standard search parameter defined in the provided R4 document.

### 5.2. Removed Search Parameters from R4

*   **`instantiates-canonical`**
    *   **Impact:** **Breaking Change.** Removed due to the corresponding element removal. Queries using this parameter will fail.
*   **`instantiates-uri`**
    *   **Impact:** **Breaking Change.** Removed due to the corresponding element removal. Queries using this parameter will fail.

### 5.3. Modified Search Parameters (R4 to R6)

*   **`based-on`**
    *   **R4 Targets:** `CarePlan`, `ServiceRequest`
    *   **R6 Targets:** `CarePlan`, `MedicationRequest`, `ServiceRequest`
    *   **Impact:** Aligns with the expanded target types of the `Procedure.basedOn` element.

*   **`date`**
    *   **R4 Expression:** `Procedure.performed`
    *   **R6 Expression:** `Procedure.occurrence.ofType(dateTime) | Procedure.occurrence.ofType(Period) | Procedure.occurrence.ofType(Timing)`
    *   **Impact:** Reflects the renaming of `performed[x]` to `occurrence[x]` and the addition of the `Timing` data type. Queries on date/time need to be updated.

*   **`performer`**
    *   **R4 Targets:** `Practitioner`, `PractitionerRole`, `Organization`, `Patient`, `RelatedPerson`, `Device`
    *   **R6 Targets:** `Practitioner`, `PractitionerRole`, `Organization`, `Patient`, `RelatedPerson`, `Device`, `CareTeam`, `HealthcareService`
    *   **Impact:** Aligns with the expanded target types of `Procedure.performer.actor`.

*   **`reason-code`**
    *   **R4 Expression:** `Procedure.reasonCode` (searched on `CodeableConcept`)
    *   **R6 Expression:** `Procedure.reason.concept` (searches on the `concept` part of the `CodeableReference`)
    *   **Impact:** **Breaking Change.** Queries for coded reasons must now target `Procedure.reason.concept`.

*   **`reason-reference`**
    *   **R4 Expression:** `Procedure.reasonReference`
    *   **R6 Expression:** `Procedure.reason.reference` (searches on the `reference` part of the `CodeableReference`)
    *   **R4 Targets:** `Condition`, `Observation`, `Procedure`, `DiagnosticReport`, `DocumentReference`
    *   **R6 Targets:** (Same as R4, derived from `Procedure.reason`'s `CodeableReference` target types)
    *   **Impact:** **Breaking Change.** Queries for referenced reasons must now target `Procedure.reason.reference`.

*   **`subject`**
    *   **R4 Targets:** `Patient`, `Group`
    *   **R6 Targets:** `Patient`, `Group`, `Device`, `Practitioner`, `Organization`, `Location`
    *   **Impact:** Aligns with the significantly expanded target types of the `Procedure.subject` element. Queries for `subject` can now return a wider range of resource types.

## 6. Key Migration Actions & Considerations

Implementers migrating from R4 to R6, or supporting both, should consider the following:

1.  **Address Scope Expansion (Subject & Focus):**
    *   Update data models and internal logic to handle new `Procedure.subject` types (`Device`, `Practitioner`, `Organization`, `Location`).
    *   Implement support for the new `Procedure.focus` element, especially if your use cases involve procedures where the target is not the record's subject (e.g., caregiver training).

2.  **Data Migration for Consolidated Elements (Critical `CodeableReference` changes):**
    *   **`reasonCode` & `reasonReference` to `Procedure.reason`**: Map R4 `reasonCode` (CodeableConcept) to `Procedure.reason.concept` and R4 `reasonReference` (Reference) to `Procedure.reason.reference`.
    *   **`usedCode` & `usedReference` to `Procedure.used`**: Map R4 `usedCode` to `Procedure.used.concept` (note ValueSet change from `device-kind` to `device-type`) and R4 `usedReference` to `Procedure.used.reference`. Add logic for new target type `BiologicallyDerivedProduct`.
    *   **`complication` & `complicationDetail` to `Procedure.complication`**: Map R4 `complication` (CodeableConcept) to `Procedure.complication.concept` and R4 `complicationDetail` (Reference(Condition)) to `Procedure.complication.reference`.
    *   **`outcome` (CodeableConcept to CodeableReference(Observation))**: Migrate R4 `outcome` (CodeableConcept) to `Procedure.outcome.concept`. If outcomes were previously stored as separate Observations, establish `Procedure.outcome.reference` links. Note change from `0..1` to `0..*`.
    *   **`followUp` (CodeableConcept to CodeableReference)**: Migrate R4 `followUp` (CodeableConcept) to `Procedure.followUp.concept`. Adapt to allow `Procedure.followUp.reference` to `ServiceRequest` or `PlanDefinition`.

3.  **Handle Element Renaming and Type Changes:**
    *   Rename `Procedure.performed[x]` to `Procedure.occurrence[x]` in data mappings and application code.
    *   Add support for the `Timing` data type in `Procedure.occurrence[x]`.

4.  **Adapt to Removed Elements:**
    *   For `instantiatesCanonical`/`Uri`, evaluate alternative methods like extensions if this linkage is critical.
    *   For `asserter`, consider using `Provenance` resources for this information.

5.  **Implement New Elements:**
    *   Evaluate and implement new elements like `recorded`, `reported[x]`, `performer.period`, `bodyStructure`, and `supportingInfo` based on system requirements.

6.  **Update Value Set Bindings:**
    *   Change `Procedure.status` binding to the R6 version of `event-status`.
    *   Change `Procedure.performer.function` binding from `performer-role` to `participant-role`.
    *   Note the change in binding for coded used items (from `device-kind` to `device-type` within `Procedure.used`).

7.  **Update Validation Logic:**
    *   Implement new constraints `prc-1` and `con-4`.

8.  **Revise API Queries (Search Parameters):**
    *   Remove queries using `instantiates-canonical` and `instantiates-uri`.
    *   Update queries for `date` to use the new `occurrence[x]` expression.
    *   Update queries for `reason-code` and `reason-reference` to use the new expressions targeting `Procedure.reason.concept` and `Procedure.reason.reference`.
    *   Adapt queries for `based-on`, `performer`, and `subject` to account for new target types.
    *   Utilize the new `report` search parameter if needed.

9.  **Review Compartment Definitions:**
    *   While not detailed in this element analysis, the R6 provided markdown listed fewer compartments (Encounter, Group, Patient, Practitioner, RelatedPerson) than R4 (which also included Device). Given the expansion of `Procedure.subject` to include `Device`, `Organization`, and `Location`, confirm the authoritative compartment list for R6 and adjust system logic accordingly, as it may impact access control or data segregation.

This migration involves significant effort due to the number of breaking changes and the conceptual expansion of the resource. Thorough testing and a phased rollout are recommended.