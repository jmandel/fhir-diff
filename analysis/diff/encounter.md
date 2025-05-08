# FHIR Encounter Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Encounter resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Encounter resource from R4 to R6 involves substantial changes, primarily focused on enhancing granularity, clarifying status management, and restructuring key clinical information. Implementers should be aware of the following:

1.  **History Tracking Overhaul (Breaking Change):** R4's `statusHistory` and `classHistory` backbone elements have been **removed**. R6 introduces the separate `EncounterHistory` resource for detailed historical tracking, a significant architectural shift.
2.  **Patient Status within Encounter (New Concept):** R6 adds `Encounter.subjectStatus` to track the patient's state (e.g., `arrived`, `triaged`, `departed`) *within* the encounter, distinct from the overall `Encounter.status`.
3.  **`Encounter.class` Modification (Breaking Change):**
    *   **Cardinality:** Changed from `1..1` (mandatory) in R4 to `0..*` (optional) in R6.
    *   **Type:** Changed from `Coding` in R4 to `CodeableConcept` in R6.
    *   **Binding:** Updated to a new value set.
4.  **Reason for Encounter Restructure (Breaking Change):** R4's `reasonCode` (CodeableConcept) and `reasonReference` (Reference) are **removed**. R6 introduces a new `Encounter.reason` backbone element with `reason.use` (CodeableConcept) and `reason.value` (CodeableReference), offering more structured representation.
5.  **`Encounter.hospitalization` Renamed and Restructured:**
    *   The `Encounter.hospitalization` backbone element is renamed to `Encounter.admission` in R6.
    *   Elements `dietPreference`, `specialArrangement`, and `specialCourtesy` have been **moved out** of this backbone element to become direct children of `Encounter` in R6.
6.  **Timing Element Renaming & Additions:**
    *   R4 `Encounter.period` is renamed to `Encounter.actualPeriod` in R6.
    *   R6 introduces `Encounter.plannedStartDate` and `Encounter.plannedEndDate` for prospective timing.
7.  **`Encounter.participant.individual` Renamed & Expanded:**
    *   R4 `Encounter.participant.individual` is renamed to `Encounter.participant.actor` in R6.
    *   The allowable reference types for `actor` have been significantly expanded (e.g., to include `Patient`, `Group`, `Device`, `HealthcareService`).
8.  **`Encounter.serviceType` Type Change:** Changed from `CodeableConcept` (R4) to `CodeableReference(HealthcareService)` (R6), allowing direct linking to a service definition.
9.  **New Elements:** Beyond `subjectStatus` and new timing elements, R6 adds `Encounter.careTeam` and `Encounter.virtualService`.
10. **Search Parameter Adjustments:** Several search parameters have been added (e.g., `subject-status`, `careteam`, `date-start`, `end-date`, `diagnosis-code`, `diagnosis-reference`), some removed (e.g., R4 `diagnosis`), and others have had their expressions or target types updated to reflect element changes.

Implementers must plan for significant data model changes, data migration (especially for `class`, `reason`, and status/class history), and updates to API queries and validation logic.

## 2. Overall Resource Scope and Purpose Evolution

*   **R4 Focus:** Encounter primarily tracked the lifecycle of a healthcare interaction. History of status and class changes was embedded within the resource itself using `statusHistory` and `classHistory`.
*   **R6 Enhancements:**
    *   **Decoupled History:** R6 delegates detailed, auditable history of status and class transitions to the new, separate `EncounterHistory` resource. This simplifies the core `Encounter` resource while providing a more robust history mechanism.
    *   **Patient-Centric Status:** The introduction of `Encounter.subjectStatus` provides a dedicated element to track the patient's journey *within* the encounter (e.g., arrival, triage, departure), separate from the overall encounter's administrative status.
    *   **Virtual Care Emphasis:** The addition of `Encounter.virtualService` and comments about virtual encounters in `Encounter.location` reflect the growing importance of telehealth.
    *   **Planning Granularity:** New elements `plannedStartDate` and `plannedEndDate` improve the ability to represent planned aspects of an encounter alongside actuals.

The core purpose remains to document healthcare interactions, but R6 refines how state, history, and specific details like reasons and patient status are captured, aiming for clearer separation of concerns and richer data representation.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following significant elements have been added in R6:

*   **`Encounter.subjectStatus`**
    *   **Cardinality:** `0..1`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/encounter-subject-status` (example strength)
    *   **Purpose:** Tracks the patient's status within the encounter (e.g., `arrived`, `triaged`, `departed`).
    *   **Impact:** Provides a dedicated field for patient workflow distinct from the overall encounter status. Systems can now model this explicitly. Consider how this interacts with or replaces local extensions used for similar purposes.

*   **`Encounter.careTeam`**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(CareTeam)`
    *   **Purpose:** Links to `CareTeam` resources allocated to participate in this encounter.
    *   **Impact:** Allows formal association with care teams involved in the encounter, distinct from individual participants.

*   **`Encounter.virtualService`**
    *   **Cardinality:** `0..*`
    *   **Type:** `VirtualServiceDetail` (DataType)
    *   **Purpose:** Provides connection details for virtual services (e.g., conference call links, platform information).
    *   **Impact:** Standardizes representation of virtual encounter details, supporting telehealth workflows.

*   **`Encounter.plannedStartDate`**
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Purpose:** The planned start date/time of the encounter.
    *   **Impact:** Allows for recording planned timing, complementing `actualPeriod`.

*   **`Encounter.plannedEndDate`**
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Purpose:** The planned end date/time of the encounter.
    *   **Impact:** Allows for recording planned timing, complementing `actualPeriod`.

*   **`Encounter.reason` (Backbone Element)**
    *   **Cardinality:** `0..*`
    *   **Type:** BackboneElement, containing:
        *   `use`: `0..* CodeableConcept` (Purpose of the reason, e.g., Chief Complaint)
        *   `value`: `0..* CodeableReference(Condition | DiagnosticReport | Observation | ImmunizationRecommendation | Procedure)` (The actual reason)
    *   **Purpose:** Replaces R4's `reasonCode` and `reasonReference` with a more structured approach to capture multiple reasons and their specific uses.
    *   **Key Impact (Breaking Change):** Data from R4 `reasonCode` and `reasonReference` must be migrated into this new structure. Queries for reasons will need to target `reason.value`.

### 3.2. Modified Elements (R4 to R6)

*   **`Encounter.status` (Value Set Change)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/encounter-status|4.0.1` (Codes: `planned`, `arrived`, `triaged`, `in-progress`, `onleave`, `finished`, `cancelled`, `entered-in-error`, `unknown`)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/encounter-status` (Codes: `planned`, `in-progress`, `on-hold`, `discharged`, `completed`, `cancelled`, `discontinued`, `entered-in-error`, `unknown`)
    *   **Impact:** The set of status codes has changed (e.g., `arrived`, `triaged`, `onleave`, `finished` removed; `on-hold`, `discharged`, `discontinued` added). **Data migration/mapping of status codes is required.** Note that some R4 patient-centric statuses like `arrived`, `triaged` may now be better represented in R6 `subjectStatus`.

*   **`Encounter.class` (Cardinality, Type, Binding Change - Breaking Change)**
    *   **R4 Cardinality:** `1..1` (Mandatory)
    *   **R6 Cardinality:** `0..*` (Optional, multiple allowed)
    *   **R4 Type:** `Coding`
    *   **R6 Type:** `CodeableConcept`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/v3-ActEncounterCode` (extensible)
    *   **R6 Binding:** `http://terminology.hl7.org/ValueSet/encounter-class` (preferred)
    *   **Impact (Breaking Change):**
        *   No longer mandatory; systems must handle its absence.
        *   Change from `Coding` to `CodeableConcept` allows for `text` and multiple codings, requiring data model updates.
        *   Value set has changed; data mapping is necessary. Existing R4 `class` data will need to be transformed.

*   **`Encounter.serviceType` (Type and Cardinality Change)**
    *   **R4 Type:** `CodeableConcept`, Cardinality `0..1`
    *   **R6 Type:** `CodeableReference(HealthcareService)`, Cardinality `0..*`
    *   **Impact:** Now allows referencing a `HealthcareService` resource directly or providing a code. Multiple service types can be specified. Data migration may be needed if `HealthcareService` resources are to be linked.

*   **`Encounter.basedOn` (Expanded Reference Types)**
    *   **R4 Type:** `Reference(ServiceRequest)`
    *   **R6 Type:** `Reference(CarePlan | DeviceRequest | MedicationRequest | ServiceRequest | RequestOrchestration | NutritionOrder | VisionPrescription | ImmunizationRecommendation)`
    *   **Impact:** Greatly expands the types of requests an encounter can be based on. Systems may need to handle a wider array of referenced resources.

*   **`Encounter.participant.individual` (R4) renamed to `Encounter.participant.actor` (R6) (Expanded Reference Types)**
    *   **R4 Name & Type:** `individual`, `Reference(Practitioner | PractitionerRole | RelatedPerson)`
    *   **R6 Name & Type:** `actor`, `Reference(Patient | Group | RelatedPerson | Practitioner | PractitionerRole | Device | HealthcareService)`
    *   **Impact:** Renaming requires code updates. The expanded reference types (notably `Patient`, `Group`, `Device`, `HealthcareService`) allow for richer participant modeling. Constraint `enc-2` is updated to reflect `Patient` or `Group` in `actor`.

*   **`Encounter.period` (R4) renamed to `Encounter.actualPeriod` (R6)**
    *   **Impact:** Simple rename; data can be directly mapped. Search parameter `date` now targets `actualPeriod`.

*   **`Encounter.diagnosis.condition` (Type and Cardinality Change)**
    *   **R4 Type:** `Reference(Condition | Procedure)`, Cardinality `1..1`
    *   **R6 Type:** `CodeableReference(Condition)`, Cardinality `0..*`
    *   **Impact:**
        *   Changed to `CodeableReference`, allowing a code or a reference.
        *   Now only directly references `Condition` (Procedures might be part of `reason.value` or linked via `Condition.evidence`).
        *   Cardinality change from `1..1` to `0..*` within the `diagnosis` backbone element means one `diagnosis` entry can have multiple conditions (though typically it's one primary condition concept per entry, with use differentiating).
        *   The R4 `diagnosis` search parameter is replaced by `diagnosis-code` and `diagnosis-reference` in R6.

*   **`Encounter.diagnosis.use` (Cardinality and Binding Change)**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `0..*`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/diagnosis-role`
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/encounter-diagnosis-use`
    *   **Impact:** Allows multiple roles for a diagnosis entry. Value set name changed.

*   **`Encounter.hospitalization` (R4) renamed to `Encounter.admission` (R6) (Restructured)**
    *   **Impact:** The backbone element itself is renamed.
    *   The following sub-elements of R4 `Encounter.hospitalization` have been **moved to be direct children of `Encounter`** in R6:
        *   `Encounter.hospitalization.dietPreference` -> `Encounter.dietPreference`
        *   `Encounter.hospitalization.specialCourtesy` -> `Encounter.specialCourtesy`
        *   `Encounter.hospitalization.specialArrangement` -> `Encounter.specialArrangement`
    *   Data for these three elements needs to be migrated to their new paths. Other sub-elements like `preAdmissionIdentifier`, `admitSource`, `destination`, `dischargeDisposition` remain within the renamed `admission` backbone.

*   **`Encounter.location.physicalType` (R4) renamed to `Encounter.location.form` (R6)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/location-physical-type`
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/location-form`
    *   **Impact:** Element rename and binding update.

### 3.3. Removed Elements from R4

*   **`Encounter.statusHistory` (Backbone Element - Breaking Change)**
    *   **Rationale/Impact:** Removed in favor of the new `EncounterHistory` resource for tracking status transitions. **Data migration is critical.** Systems must decide whether to populate `EncounterHistory` resources or use alternative audit trails. This significantly changes how encounter status history is accessed.

*   **`Encounter.classHistory` (Backbone Element - Breaking Change)**
    *   **Rationale/Impact:** Removed in favor of the new `EncounterHistory` resource for tracking class transitions. **Data migration is critical.** Similar considerations as for `statusHistory` apply.

*   **`Encounter.reasonCode` (Breaking Change)**
    *   **Rationale/Impact:** Superseded by the new `Encounter.reason` backbone element (`reason.value` as CodeableReference). Data must be migrated to the new structure. R4 `reason-code` search parameter now targets `Encounter.reason.value.concept`.

*   **`Encounter.reasonReference` (Breaking Change)**
    *   **Rationale/Impact:** Superseded by the new `Encounter.reason` backbone element (`reason.value` as CodeableReference). Data must be migrated. R4 `reason-reference` search parameter now targets `Encounter.reason.value.reference`.

*   **`Encounter.diagnosis.rank`**
    *   **Rationale/Impact:** This element for ranking diagnoses has been removed. R6 comments suggest ranking for billing might be handled within the `Account` resource. Systems relying on this for clinical ranking need to find an alternative or use extensions.

## 4. Constraint Changes

*   **`enc-1`: Unchanged Logic, Updated Path**
    *   **R4:** `Encounter.participant`: `individual.exists() or type.exists()`
    *   **R6:** `Encounter.participant`: `actor.exists() or type.exists()`
    *   **Impact:** Expression updated due to `individual` -> `actor` rename. Logic remains: a participant entry must have an actor or a type.

*   **`enc-2`: Updated Logic and Path**
    *   **R4:** `Encounter.participant`: `individual.exists(resolve() is Patient) implies type.empty()`
    *   **R6:** `Encounter.participant`: `actor.exists(resolve() is Patient or resolve() is Group) implies type.exists().not()`
    *   **Impact:** Expression updated for `individual` -> `actor` rename. Logic now also includes `Group`. If the actor is a `Patient` or `Group`, the participant `type` should not be present.

## 5. Search Parameter Changes

### 5.1. New Search Parameters in R6

*   **`careteam`**:
    *   Type: `reference`
    *   Expression: `Encounter.careTeam`
    *   Targets: `CareTeam`
*   **`date-start`**:
    *   Type: `date`
    *   Expression: `Encounter.actualPeriod.start`
*   **`diagnosis-code`**:
    *   Type: `token`
    *   Expression: `Encounter.diagnosis.condition.concept` (Replaces part of the functionality of R4 `diagnosis` search parameter)
*   **`diagnosis-reference`**:
    *   Type: `reference`
    *   Expression: `Encounter.diagnosis.condition.reference`
    *   Targets: `Condition` (Replaces part of the functionality of R4 `diagnosis` search parameter)
*   **`end-date`**:
    *   Type: `date`
    *   Expression: `Encounter.actualPeriod.end`
*   **`location-value-period`**: (Formalized Composite)
    *   Type: `composite`
    *   Components: `location`, `period` (relative to `Encounter.location`)
*   **`subject-status`**:
    *   Type: `token`
    *   Expression: `Encounter.subjectStatus`

### 5.2. Removed Search Parameters from R4

*   **`diagnosis`**:
    *   R4 Expression: `Encounter.diagnosis.condition`
    *   R4 Targets: `Condition`, `Procedure`
    *   **Impact:** This parameter is removed. Queries should use the new `diagnosis-code` and `diagnosis-reference` parameters in R6.

### 5.3. Modified Search Parameters (R4 to R6)

*   **`based-on`**:
    *   R4 Expression: `Encounter.basedOn` (Targets: `ServiceRequest`)
    *   R6 Expression: `Encounter.basedOn` (Targets: `CarePlan`, `DeviceRequest`, `ImmunizationRecommendation`, `MedicationRequest`, `NutritionOrder`, `RequestOrchestration`, `ServiceRequest`, `VisionPrescription`)
    *   **Impact:** Target resource types significantly expanded.

*   **`date`**:
    *   R4 Expression: `Encounter.period`
    *   R6 Expression: `Encounter.actualPeriod`
    *   **Impact:** Expression updated due to element rename (`period` to `actualPeriod`).

*   **`participant`**:
    *   R4 Expression: `Encounter.participant.individual` (Targets: `Practitioner`, `PractitionerRole`, `RelatedPerson`)
    *   R6 Expression: `Encounter.participant.actor` (Targets: `Device`, `Group`, `HealthcareService`, `Patient`, `Practitioner`, `PractitionerRole`, `RelatedPerson`)
    *   **Impact:** Expression updated due to element rename (`individual` to `actor`). Target resource types significantly expanded.

*   **`practitioner`**: (A more specific version of `participant`)
    *   R4 Expression: `Encounter.participant.individual.where(resolve() is Practitioner)`
    *   R6 Expression: `Encounter.participant.actor.where(resolve() is Practitioner)`
    *   **Impact:** Expression updated due to element rename (`individual` to `actor`).

*   **`reason-code`**:
    *   R4 Expression: `Encounter.reasonCode`
    *   R6 Expression: `Encounter.reason.value.concept`
    *   **Impact:** Expression updated to reflect the new `Encounter.reason` backbone structure.

*   **`reason-reference`**:
    *   R4 Expression: `Encounter.reasonReference` (Targets: `Condition`, `Observation`, `Procedure`, `ImmunizationRecommendation`)
    *   R6 Expression: `Encounter.reason.value.reference` (Targets: `Condition`, `DiagnosticReport`, `ImmunizationRecommendation`, `Observation`, `Procedure`)
    *   **Impact:** Expression updated. Target types for R6 `reason.value` (which is a CodeableReference) are `Condition | DiagnosticReport | Observation | ImmunizationRecommendation | Procedure`.

*   **`special-arrangement`**:
    *   R4 Expression: `Encounter.hospitalization.specialArrangement`
    *   R6 Expression: `Encounter.specialArrangement`
    *   **Impact:** Expression updated due to element being moved out of `hospitalization`/`admission` backbone.

## 6. Key Migration Actions & Considerations

1.  **History Tracking Strategy (Critical - Breaking Change):**
    *   Data in R4 `statusHistory` and `classHistory` needs a new home.
    *   Evaluate implementing the R6 `EncounterHistory` resource. This involves creating new resources and linking them.
    *   Alternatively, rely on server-side versioning or other audit mechanisms if `EncounterHistory` is not adopted.
    *   Update any logic that queried these R4 backbone elements.

2.  **`Encounter.class` Migration (Breaking Change):**
    *   Convert R4 `Coding` data to R6 `CodeableConcept`.
    *   Map values from `v3-ActEncounterCode` to the new `encounter-class` value set.
    *   Adapt to `class` now being optional (`0..*`) instead of mandatory (`1..1`).

3.  **Reason for Encounter Migration (Breaking Change):**
    *   Migrate data from R4 `reasonCode` and `reasonReference` into the new R6 `Encounter.reason` backbone structure. This involves mapping to `reason.value` (CodeableReference) and potentially populating `reason.use`.
    *   Update queries to use the new structure (e.g., search parameters `reason-code`, `reason-reference` now target `reason.value`).

4.  **Status Code Mapping:**
    *   Map R4 `Encounter.status` codes to the new R6 `Encounter.status` value set.
    *   Consider if R4 statuses like `arrived` or `triaged` should now be represented using the new `Encounter.subjectStatus` element in R6.

5.  **Hospitalization/Admission Renaming and Restructuring:**
    *   Rename `Encounter.hospitalization` to `Encounter.admission` in mappings and code.
    *   Migrate data for `dietPreference`, `specialArrangement`, and `specialCourtesy` from within the R4 `hospitalization` backbone to be direct children of `Encounter` in R6.

6.  **Element Renames:**
    *   Update `Encounter.period` to `Encounter.actualPeriod`.
    *   Update `Encounter.participant.individual` to `Encounter.participant.actor`.
    *   Update `Encounter.location.physicalType` to `Encounter.location.form` and update value set mappings.

7.  **Type Changes:**
    *   Adapt to `Encounter.serviceType` changing from `CodeableConcept` to `CodeableReference(HealthcareService)`.
    *   Adapt to `Encounter.diagnosis.condition` changing from `Reference(Condition | Procedure)` to `CodeableReference(Condition)`.

8.  **Adopt New R6 Elements:**
    *   Evaluate and implement `Encounter.subjectStatus` for patient-specific statuses.
    *   Consider using `Encounter.careTeam` for linking to care teams.
    *   Utilize `Encounter.virtualService` for telehealth details.
    *   Incorporate `Encounter.plannedStartDate` and `Encounter.plannedEndDate` if planned encounter times are relevant.

9.  **Update Search Queries:**
    *   Revise queries for `diagnosis` to use new `diagnosis-code` and `diagnosis-reference`.
    *   Update expressions for `date`, `participant`, `practitioner`, `reason-code`, `reason-reference`, `special-arrangement`.
    *   Incorporate new search parameters (`careteam`, `date-start`, `end-date`, `subject-status`, etc.) as needed.

10. **Handle Expanded Reference Types:** For elements like `basedOn` and `participant.actor`, ensure systems can process or store the newly added target resource types.

11. **Constraint Logic:** Update validation for `enc-2` to include `Group` when checking `participant.actor`.

This migration involves significant structural and semantic changes. Thorough testing and a clear data migration plan are essential.