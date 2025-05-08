# FHIR MedicationDispense Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR MedicationDispense resource between R4 and R6. It focuses on modifications critical for implementers migrating systems or supporting both versions, aiming for clarity, actionability, and precision.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the MedicationDispense resource from R4 to R6 involves several significant changes, including data model adjustments and new functionalities:

1.  **Medication Representation (Breaking Change):** The R4 choice type `medication[x]` (either `medicationCodeableConcept` or `medicationReference`) has been consolidated into a single `medication` element of type `CodeableReference(Medication)` in R6. This requires data model updates and migration.
2.  **Reason for Non-Performance (Breaking Change):** The R4 choice type `statusReason[x]` (either `statusReasonCodeableConcept` or `statusReasonReference(DetectedIssue)`) has been replaced by a single R6 element `notPerformedReason` of type `CodeableReference(DetectedIssue)`. This element is used if the dispense was not performed. Data migration and logic changes are necessary.
3.  **Subject Mandatory (Breaking Change):** The `subject` element (referencing Patient or Group) has changed its cardinality from `0..1` (optional) in R4 to `1..1` (mandatory) in R6. Systems must now ensure a subject is always provided.
4.  **Context Renamed and Narrowed (Breaking Change):** The R4 `context` element `Reference(Encounter | EpisodeOfCare)` has been renamed to `encounter` in R6 and its type restricted to `Reference(Encounter)`. Support for `EpisodeOfCare` in this context has been removed.
5.  **New Elements:** R6 introduces several new elements:
    *   `basedOn`: `Reference(CarePlan)` to link the dispense to a care plan.
    *   `statusChanged`: `dateTime` to record when the dispense status last changed.
    *   `fillNumber`: `positiveInt` to track the fill number of the prescription.
    *   `recorded`: `dateTime` for when the dispense was first captured in the system.
    *   `renderedDosageInstruction`: `markdown` for a full textual representation of complex dosage instructions.
6.  **Type Expansions for References:**
    *   `partOf`: Now allows `Reference(Procedure | MedicationAdministration)` (R4 was `Procedure` only).
    *   `performer.actor`: Expanded to include `CareTeam` and `Group` as reference targets.
    *   `receiver`: Expanded to include `RelatedPerson`, `Location`, `PractitionerRole`, and `Group`.
    *   `substitution.responsibleParty`: Now `0..1` (was `0..*` in R4) and includes `Organization` as a reference target. This cardinality change is a **Breaking Change** if multiple parties were previously recorded.
7.  **Category Element Changes:** `category` is now `0..*` (was `0..1`), and its binding has changed, potentially broadening its usage.
8.  **Search Parameter Updates:**
    *   New search parameters: `encounter`, `location`, `recorded`.
    *   Removed: `context`.
    *   Modified expressions for `code` and `medication` search parameters due to the `CodeableReference` change.
    *   Expanded target types for `performer`, `receiver`, and `responsibleparty` search parameters.

Implementers should anticipate data migration efforts, updates to data validation logic, and revisions to API queries.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of MedicationDispense – to record the provision of a medication product to a patient – remains consistent between R4 and R6. It continues to represent the dispensing event, often in response to a `MedicationRequest`.

*   **R4 Compartments:** Patient, Practitioner
*   **R6 Compartments:** Encounter, Group, Patient, Practitioner
    *   **Impact:** The addition of `Encounter` and `Group` to resource compartments in R6 suggests refined or expanded ways the resource might be associated with these contexts for access control or discovery.

The R6 definition provides slightly more explicit examples in its scope description (e.g., "outpatient/community pharmacy dispensing and pickup", "inpatient pharmacy dispensing to wards"), but this largely clarifies existing understanding rather than changing the core scope.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6, offering enhanced data capture capabilities:

*   **`MedicationDispense.basedOn`**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(CarePlan)`
    *   **Short Description/Purpose:** A plan that is fulfilled in whole or in part by this dispense.
    *   **Key Impact/Action for Implementers:** Allows explicit linking of dispenses to care plans, improving care coordination traceability.

*   **`MedicationDispense.statusChanged`**
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Short Description/Purpose:** When the status of the dispense record changed.
    *   **Key Impact/Action for Implementers:** Useful for auditing and tracking the lifecycle of the dispense event more granularly.

*   **`MedicationDispense.fillNumber`**
    *   **Cardinality:** `0..1`
    *   **Type:** `positiveInt`
    *   **Short Description/Purpose:** A number that represents the known fill this dispense represents (e.g., 3rd fill).
    *   **Key Impact/Action for Implementers:** Standardizes the recording of fill numbers, aiding in prescription management and medication history.

*   **`MedicationDispense.recorded`**
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Short Description/Purpose:** When the recording of the dispense started (i.e., when the dispense occurrence was first captured).
    *   **Key Impact/Action for Implementers:** Provides a timestamp for system entry, distinct from `whenPrepared` or `whenHandedOver`.

*   **`MedicationDispense.renderedDosageInstruction`**
    *   **Cardinality:** `0..1`
    *   **Type:** `markdown`
    *   **Short Description/Purpose:** Full textual representation of the dosage instructions, especially useful for complex regimens.
    *   **Key Impact/Action for Implementers:** Allows for a human-readable summary of potentially complex `Dosage` structures. Systems displaying this should be markdown-aware.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`MedicationDispense.medication[x]` (R4) -> `MedicationDispense.medication` (R6) (Breaking Change)**
    *   **R4 Type:** Choice of `CodeableConcept` (`medicationCodeableConcept`) or `Reference(Medication)` (`medicationReference`). Cardinality was `1..1` for the choice.
    *   **R6 Type:** `CodeableReference(Medication)`. Cardinality `1..1`.
    *   **Binding (for concept part):** `http://hl7.org/fhir/ValueSet/medication-codes` (example strength) - remains consistent.
    *   **Rationale / Key Impact:** This change aligns with the common FHIR pattern of using `CodeableReference` to represent entities that can be identified by a code or a full resource reference.
        *   **Action:** **Breaking Change.** Data must be migrated from the R4 `medicationCodeableConcept` or `medicationReference` into the single R6 `medication` element. Systems need to handle the `CodeableReference` data type, which can contain either a `concept` (CodeableConcept) or a `reference` (Reference), but not both simultaneously. Search parameter expressions for `code` and `medication` have been updated accordingly.

*   **`MedicationDispense.statusReason[x]` (R4) -> `MedicationDispense.notPerformedReason` (R6) (Breaking Change)**
    *   **R4 Elements:** `statusReasonCodeableConcept` (`0..1`, CodeableConcept) and `statusReasonReference` (`0..1`, `Reference(DetectedIssue)`).
    *   **R6 Element:** `notPerformedReason` (`0..1`, `CodeableReference(DetectedIssue)`).
    *   **Binding (for concept part):** `http://hl7.org/fhir/ValueSet/medicationdispense-status-reason` (example strength) - remains consistent for the conceptual part.
    *   **Rationale / Key Impact:** Renamed for clarity (specifically for why a dispense was *not* performed) and consolidated into a `CodeableReference` type.
        *   **Action:** **Breaking Change.** Data from R4 `statusReasonCodeableConcept` or `statusReasonReference` needs to be migrated to the R6 `notPerformedReason` element. Logic handling these reasons must be updated.

*   **`MedicationDispense.subject` (Breaking Change due to Cardinality)**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `1..1`
    *   **Type:** `Reference(Patient | Group)` (unchanged)
    *   **Rationale / Key Impact:** Making the subject mandatory ensures that every dispense record is explicitly linked to a patient or group.
        *   **Action:** **Breaking Change.** Systems creating MedicationDispense resources must now always populate the `subject` element. Existing R4 data lacking a `subject` may need to be reviewed and updated if possible, or a policy for handling such cases during migration needs to be defined.

*   **`MedicationDispense.context` (R4) -> `MedicationDispense.encounter` (R6) (Breaking Change)**
    *   **R4 Element:** `context` (`0..1`, `Reference(Encounter | EpisodeOfCare)`).
    *   **R6 Element:** `encounter` (`0..1`, `Reference(Encounter)`).
    *   **Rationale / Key Impact:** The element was renamed for clarity and its scope narrowed to only `Encounter`. The ability to reference `EpisodeOfCare` directly in this element has been removed.
        *   **Action:** **Breaking Change.** Rename the field in internal models. If `EpisodeOfCare` was used in R4 `context`, alternative ways to link this information (e.g., via `Encounter.episodeOfCare` or `supportingInformation`) need to be considered. The `context` search parameter has been replaced by `encounter`.

*   **`MedicationDispense.partOf`**
    *   **R4 Type:** `Reference(Procedure)` (`0..*`)
    *   **R6 Type:** `Reference(Procedure | MedicationAdministration)` (`0..*`)
    *   **Rationale / Key Impact:** Expands the types of events a dispense can be part of to include `MedicationAdministration`.
        *   **Action:** Systems may now receive or need to store references to `MedicationAdministration` in `partOf`.

*   **`MedicationDispense.category`**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `0..*`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/medicationdispense-category` (strength: `preferred`)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/medicationdispense-admin-location` (strength: `example`)
    *   **R4 Description Snippet:** "...where the medication is expected to be consumed or administered (i.e. inpatient or outpatient)."
    *   **R6 Description Snippet:** "...drug classification like ATC, where meds would be administered, legal category of the medication."
    *   **Rationale / Key Impact:** The cardinality change allows for multiple categories. The binding and description changes suggest a potential broadening or shift in the intended use of `category`, moving from primarily administration location to include other classifications like ATC or legal status. The R6 comments note that invariants can be used for profiling to bind to different value sets.
        *   **Action:** Review current usage of `category`. Implementers may need to support multiple categories and adapt to the new value set or use profiling for more specific value sets if needed.

*   **`MedicationDispense.performer.actor`**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam | Group)`
    *   **Rationale / Key Impact:** Adds `CareTeam` and `Group` as valid performer actor types.
        *   **Action:** Update systems to handle these additional reference types if performing validation or specific processing based on actor type.

*   **`MedicationDispense.receiver`**
    *   **R4 Type:** `Reference(Patient | Practitioner)` (`0..*`)
    *   **R6 Type:** `Reference(Patient | Practitioner | RelatedPerson | Location | PractitionerRole | Group)` (`0..*`)
    *   **Rationale / Key Impact:** Significantly expands the types of entities that can be recorded as receivers of the medication, including `RelatedPerson`, `Location` (e.g., delivery to a ward stock), `PractitionerRole`, and `Group`.
        *   **Action:** Adapt systems to support these new reference types for `receiver`.

*   **`MedicationDispense.substitution.responsibleParty` (Breaking Change due to Cardinality)**
    *   **R4 Cardinality & Type:** `0..*`, `Reference(Practitioner | PractitionerRole)`
    *   **R6 Cardinality & Type:** `0..1`, `Reference(Practitioner | PractitionerRole | Organization)`
    *   **Rationale / Key Impact:** The cardinality is reduced from allowing multiple responsible parties to only one. `Organization` is added as a possible type.
        *   **Action:** **Breaking Change.** If systems stored multiple responsible parties, a data migration strategy is needed to select a single primary responsible party or store additional information elsewhere. Support `Organization` as a reference type.

### 3.3. Removed Elements from R4 (Effectively Replaced)

*   **`MedicationDispense.statusReasonCodeableConcept`**: Replaced by `MedicationDispense.notPerformedReason` (CodeableReference).
*   **`MedicationDispense.statusReasonReference`**: Replaced by `MedicationDispense.notPerformedReason` (CodeableReference).
*   **`MedicationDispense.medicationCodeableConcept`**: Functionality incorporated into `MedicationDispense.medication` (CodeableReference).
*   **`MedicationDispense.medicationReference`**: Functionality incorporated into `MedicationDispense.medication` (CodeableReference).
*   **(Effectively Renamed)** `MedicationDispense.context`: Replaced by `MedicationDispense.encounter` with a narrowed type.

## 4. Constraint Changes

*   **`mdd-1`**: "whenHandedOver cannot be before whenPrepared"
    *   **R4 Expression:** `whenHandedOver.empty() or whenPrepared.empty() or whenHandedOver >= whenPrepared`
    *   **R6 Expression:** `(whenHandedOver.hasValue() and whenPrepared.hasValue()) implies whenHandedOver >= whenPrepared`
    *   **Impact:** The logical intent of the constraint remains the same. The R6 expression is a more formally structured way of stating that *if* both dates are present, `whenHandedOver` must be on or after `whenPrepared`. This change is unlikely to require implementer action if the previous logic was correctly implemented.

## 5. Search Parameter Changes

### 5.1. New Search Parameters in R6

*   **`encounter`**
    *   Type: `reference`
    *   Expression: `MedicationDispense.encounter`
    *   Targets: `Encounter`
    *   Impact: Replaces the R4 `context` search parameter. Allows searching for dispenses linked to a specific encounter.
*   **`location`**
    *   Type: `reference`
    *   Expression: `MedicationDispense.location`
    *   Targets: `Location`
    *   Impact: Allows searching for dispenses performed at a specific location.
*   **`recorded`**
    *   Type: `date`
    *   Expression: `MedicationDispense.recorded`
    *   Impact: Allows searching for dispenses based on when they were recorded in the system.

### 5.2. Removed Search Parameters from R4

*   **`context`**: Removed and replaced by the `encounter` search parameter due to the element rename and type change. Queries using `context` will fail.

### 5.3. Modified Search Parameters

*   **`code`**
    *   R4 Expression: `(MedicationDispense.medication as CodeableConcept)`
    *   R6 Expression: `MedicationDispense.medication.concept`
    *   Impact: Expression updated to reflect the change of `medication[x]` to `MedicationDispense.medication` (type `CodeableReference`). Searches for the coded concept within the `CodeableReference`.
*   **`medication`**
    *   R4 Expression: `(MedicationDispense.medication as Reference)`
    *   R6 Expression: `MedicationDispense.medication.reference`
    *   Impact: Expression updated to reflect the change of `medication[x]` to `MedicationDispense.medication` (type `CodeableReference`). Searches for the reference part within the `CodeableReference`.
*   **`performer`**
    *   R4 Targets: `Device, Organization, Patient, Practitioner, PractitionerRole, RelatedPerson`
    *   R6 Targets: `Practitioner, PractitionerRole, Organization, Patient, Device, RelatedPerson, CareTeam, Group`
    *   Impact: Target types expanded to include `CareTeam` and `Group`, aligning with `performer.actor` element changes.
*   **`receiver`**
    *   R4 Targets: `Patient, Practitioner`
    *   R6 Targets: `Patient, Practitioner, RelatedPerson, Location, PractitionerRole, Group`
    *   Impact: Target types significantly expanded, aligning with `receiver` element changes.
*   **`responsibleparty`**
    *   R4 Targets: `Practitioner, PractitionerRole`
    *   R6 Targets: `Practitioner, PractitionerRole, Organization`
    *   Impact: Target types expanded to include `Organization`, aligning with `substitution.responsibleParty` element changes.

## 6. Key Migration Actions & Considerations

1.  **Data Migration for `medication` (Critical):**
    *   Transform R4 `medicationCodeableConcept` and `medicationReference` data into the R6 `MedicationDispense.medication` (`CodeableReference`) structure.
2.  **Data Migration for `notPerformedReason` (Critical):**
    *   Migrate data from R4 `statusReasonCodeableConcept` and `statusReasonReference` to the R6 `MedicationDispense.notPerformedReason` (`CodeableReference`) element.
3.  **Address Mandatory `subject` (Critical):**
    *   Ensure all new R6 `MedicationDispense` resources include the `subject` element.
    *   For existing R4 data, develop a strategy to populate `subject` if missing, or determine how to handle records without it post-migration.
4.  **Handle `context` to `encounter` Renaming and Type Change (Critical):**
    *   Update data models and application logic from `context` to `encounter`.
    *   If `EpisodeOfCare` references were used in R4 `context`, devise a new method for storing/linking this information.
5.  **Adapt to `substitution.responsibleParty` Cardinality Change (Critical):**
    *   If R4 data contains multiple `responsibleParty` entries for a single substitution, determine how to map this to the R6 `0..1` cardinality (e.g., select one, or store additional info elsewhere).
6.  **Adopt New R6 Elements:**
    *   Evaluate and implement support for `basedOn`, `statusChanged`, `fillNumber`, `recorded`, and `renderedDosageInstruction` as appropriate for your system's requirements.
7.  **Update Type Handling for Expanded References:**
    *   Modify systems to correctly process the expanded list of reference targets for `partOf`, `performer.actor`, `receiver`, and `substitution.responsibleParty`.
8.  **Manage `category` Changes:**
    *   Update systems to handle `0..*` cardinality for `category`.
    *   Review and adapt to the new binding for `category` (`http://hl7.org/fhir/ValueSet/medicationdispense-admin-location`) or define profiling for other specific value sets if needed.
9.  **Revise API Queries:**
    *   Replace queries using the `context` search parameter with the new `encounter` search parameter.
    *   Update queries using `code` and `medication` search parameters to align with their new expressions.
    *   Utilize new search parameters (`location`, `recorded`) as needed.
    *   Be aware of expanded target types when querying via `performer`, `receiver`, and `responsibleparty`.
10. **Review and Update Validation Logic:**
    *   Ensure validation rules align with R6 element cardinalities (especially `subject`) and data types.
    *   The `mdd-1` constraint logic should remain largely the same, but verify its implementation.
11. **Consider Compartment Changes:**
    *   Evaluate if the addition of `Encounter` and `Group` to compartments impacts access control or data retrieval strategies.