# FHIR CarePlan Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR CarePlan resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the CarePlan resource from R4 to R6 introduces several substantial changes, primarily aimed at simplifying the activity structure and enhancing interoperability:

1.  **Restructured Activity Definition (Breaking Change):**
    *   R6 **removes** the `CarePlan.activity.detail` backbone element and its sub-elements, which allowed for inline definition of activities.
    *   All planned activities in R6 must now be defined by referencing other request resources (e.g., `ServiceRequest`, `MedicationRequest`) via the `CarePlan.activity.plannedActivityReference` element (renamed from R4's `CarePlan.activity.reference`).
    *   This requires significant data model and logic changes for systems that used inline activity definitions.
2.  **New `CarePlan.activity.performedActivity` Element:**
    *   R6 introduces `activity.performedActivity` (type `CodeableReference(Any)`) to link to or describe activities that have already been performed.
3.  **`CarePlan.addresses` Type Change (Breaking Change):**
    *   The `addresses` element, which links a CarePlan to health issues, changes from `Reference(Condition)` in R4 to `CodeableReference(Condition | Procedure | MedicationAdministration)` in R6.
    *   This allows a CarePlan to address a broader range of clinical items beyond just conditions.
4.  **`CarePlan.author` Renamed to `CarePlan.custodian`:**
    *   The `author` element is renamed to `custodian` in R6, with the same data type and purpose of identifying the responsible party.
5.  **Removal of Plan-Level `instantiatesCanonical` and `instantiatesUri`:**
    *   The R4 elements `CarePlan.instantiatesCanonical` and `CarePlan.instantiatesUri`, used to link the entire plan to external definitions, have been removed in R6. Similar instantiation elements within `activity.detail` are also gone due to the removal of `activity.detail`.
6.  **Expanded `CarePlan.basedOn` Targets:**
    *   The `basedOn` element in R6 can now reference `ServiceRequest`, `RequestOrchestration`, and `NutritionOrder` in addition to `CarePlan`, allowing more flexible workflow integration.
7.  **Value Set Updates:**
    *   `CarePlan.status` adds the code `ended`.
    *   `CarePlan.intent` adds the code `directive`.
8.  **Search Parameter Overhaul:**
    *   Several R4 search parameters related to `activity.detail` (e.g., `activity-code`, `activity-date`, `performer`) are removed.
    *   Plan-level `instantiates-canonical` and `instantiates-uri` search parameters are removed.
    *   A new `custodian` search parameter is added.
    *   The `condition` search parameter now targets `CarePlan.addresses.reference` and supports more target types.
9.  **Compartment Definition Changes:**
    *   The `Practitioner` and `RelatedPerson` compartments for CarePlan are removed in R6, while `Group` is added.

Implementers should anticipate significant effort in adapting to the new activity structure, migrating data for `addresses`, and updating search queries.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of CarePlan—to describe the intended plan of care—remains consistent between R4 and R6. Both versions support plans for individuals, groups, and communities, across various healthcare settings.

However, R6 offers more explicit guidance on:

*   **Activity Definition:** R6 strongly emphasizes defining activities by referencing dedicated request resources (e.g., `ServiceRequest`, `MedicationRequest`) rather than inline definitions. The resource description states, "CarePlan activities are defined using references to various 'request' resources."
*   **Relationship with `Task`:** R6 clarifies that while `CarePlan` represents authorization and overview, the `Task` resource can handle finer details of fulfillment.
*   **Relationship with `ImmunizationRecommendation`:** R6 reiterates that `ImmunizationRecommendation` is preferred for immunization-specific events where overlap exists.
*   **`partOf` Element Consideration:** R6 includes a comment for `CarePlan.partOf` highlighting potential issues with cascading statuses when nesting care plans, noting the element is "still being discussed."

These refinements guide implementers towards a more modular and reference-based approach for defining care plan components.

## 3. Element-Level Changes

### 3.1. Removed Elements from R4

The most significant removals in R6 streamline the `CarePlan.activity` structure and plan-level instantiation:

*   **`CarePlan.instantiatesCanonical` and `CarePlan.instantiatesUri` (Removed at Root Level)**
    *   **R4 Definition:** These elements (`0..*`, types `canonical` and `uri` respectively) allowed the CarePlan to link to FHIR-defined or external protocols/guidelines.
    *   **Impact (Breaking Change):** The direct mechanism to link an entire CarePlan instance to a defining protocol at the root level is removed in R6. Implementers needing this linkage may need to explore extensions or other patterns.

*   **`CarePlan.activity.detail` and all its sub-elements (Removed)**
    *   **R4 Definition:** This backbone element (`0..1`) allowed for in-line definition of activities within the CarePlan, including:
        *   `kind`, `instantiatesCanonical`, `instantiatesUri`, `code`, `reasonCode`, `reasonReference`, `goal`, `status`, `statusReason`, `doNotPerform`, `scheduled[x] (Timing, Period, string)`, `location`, `performer`, `product[x] (CodeableConcept, Reference)`, `dailyAmount`, `quantity`, `description`.
    *   **Impact (Major Breaking Change):** This entire structure for defining activities directly within the CarePlan is removed. All planned activities must now be defined as separate resources and referenced via `CarePlan.activity.plannedActivityReference`.
        *   **Action:** Data migration is required. Inline activity details from R4 need to be transformed into appropriate FHIR request resources (e.g., `ServiceRequest`, `MedicationRequest`) and then referenced. Logic for creating, reading, and updating activities needs a complete overhaul. The R4 constraint `cpl-3` (reference or detail, not both) is no longer applicable.

*   **`CarePlan.activity.outcomeCodeableConcept` and `CarePlan.activity.outcomeReference` (Removed)**
    *   **R4 Definition:** These elements (`0..*`) allowed specifying activity outcomes directly.
    *   **Impact:** Outcomes are now expected to be recorded on the resources representing the performed activities (e.g., `Observation`, `Procedure`) or the referenced request resources.

*   **`CarePlan.activity.reference` (Superseded)**
    *   **R4 Definition:** `0..1`, `Reference(various request types)`.
    *   **Impact:** This element is conceptually replaced and renamed to `CarePlan.activity.plannedActivityReference` in R6, with an updated list of target types.

### 3.2. New Elements in R6

*   **`CarePlan.activity.performedActivity` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference(Any)`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/care-plan-activity-performed` (example strength)
    *   **Short Description/Purpose:** Identifies activities that have been completed or are in progress. Can be a concept or a reference to an event resource like `Procedure`, `Encounter`, or `Observation`.
    *   **Key Impact/Action for Implementers:** Provides a standard way to record performed actions as part of the CarePlan's activity tracking. This complements `plannedActivityReference`. Systems can use this to link to evidence of activity completion.

### 3.3. Modified Elements (R4 to R6)

*   **`CarePlan.author` (R4) renamed to `CarePlan.custodian` (R6)**
    *   **R4 Element:** `CarePlan.author`
    *   **R6 Element:** `CarePlan.custodian`
    *   **Type & Cardinality:** `0..1`, `Reference(Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam)` (unchanged).
    *   **Short Description:** "Who is the designated responsible party" (conceptually similar).
    *   **Key Impact/Action for Implementers:** This is primarily a renaming. Data from R4 `author` should be mapped to R6 `custodian`. The R6 definition adds a comment: "The custodian might or might not be a contributor."

*   **`CarePlan.addresses` (Modified Type)**
    *   **R4 Type:** `Reference(Condition)`, `0..*`
    *   **R6 Type:** `CodeableReference(Condition | Procedure | MedicationAdministration)`, `0..*`
    *   **Binding (for concept part in R6):** `http://hl7.org/fhir/ValueSet/clinical-findings` (example strength).
    *   **Rationale / Key Impact (Breaking Change):** The type change to `CodeableReference` significantly expands what a CarePlan can address. It can now link to `Condition`, `Procedure`, or `MedicationAdministration` resources, or provide a `CodeableConcept` for the concern.
        *   **Action:** Data migration is required. R4 `addresses` referencing a `Condition` can be mapped to `CarePlan.addresses.reference` in R6. Systems must be updated to handle the `CodeableReference` structure (both its `concept` and `reference` parts). The R6 definition provides guidance on using the `concept` vs. `reference` parts.

*   **`CarePlan.basedOn` (Modified Type)**
    *   **R4 Type:** `Reference(CarePlan)`, `0..*`
    *   **R6 Type:** `Reference(CarePlan | ServiceRequest | RequestOrchestration | NutritionOrder)`, `0..*`
    *   **Rationale / Key Impact:** The target types for `basedOn` are expanded. A CarePlan in R6 can now be based on a wider variety of upstream requests, not just other CarePlans.
        *   **Action:** Systems can leverage this for more complex workflow integrations. Existing R4 data referencing `CarePlan` remains valid.

*   **`CarePlan.status` (Modified Value Set)**
    *   **R4 Codes:** `draft | active | on-hold | revoked | completed | entered-in-error | unknown`
    *   **R6 Codes:** `draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown`
    *   **Key Impact:** The code `ended` is added in R6.
        *   **Action:** Systems must support the new `ended` status code. Review the semantics of `ended` in relation to `completed` and `revoked`.

*   **`CarePlan.intent` (Modified Value Set)**
    *   **R4 Codes:** `proposal | plan | order | option`
    *   **R6 Codes:** `proposal | plan | order | option | directive`
    *   **Key Impact:** The code `directive` is added in R6. R6 also includes an important comment: "This element is expected to be immutable...Instead, a new instance 'basedOn' the prior instance should be created with the new 'intent' value."
        *   **Action:** Support the new `directive` intent. Implementers should heed the immutability guidance for `intent`.

*   **`CarePlan.activity` (Modified Structure and Semantics)**
    *   **R4 Short:** "Action to occur as part of plan"
    *   **R6 Short:** "Action to occur or has occurred as part of plan"
    *   **Key Impact:** The internal structure is significantly changed (as detailed in 3.1 and 3.2). The short description change reflects the addition of `performedActivity`.

*   **`CarePlan.activity.plannedActivityReference` (R6) (Replaces and expands R4 `CarePlan.activity.reference`)**
    *   **R4 Element:** `CarePlan.activity.reference` (`0..1`, targeting `Appointment`, `CommunicationRequest`, `DeviceRequest`, `MedicationRequest`, `NutritionOrder`, `Task`, `ServiceRequest`, `VisionPrescription`, `RequestGroup`)
    *   **R6 Element:** `CarePlan.activity.plannedActivityReference` (`0..1`, targeting `Appointment`, `CommunicationRequest`, `DeviceRequest`, `MedicationRequest`, `NutritionOrder`, `Task`, `ServiceRequest`, `VisionPrescription`, `RequestOrchestration`, `ImmunizationRecommendation`, `SupplyRequest`)
    *   **Key Impact:** Renamed for clarity. The list of target resource types is updated: `RequestOrchestration`, `ImmunizationRecommendation`, `SupplyRequest` are new. `RequestGroup` is no longer a direct target (activities from a `RequestGroup` would likely be referenced individually or via `RequestOrchestration`). R6 adds a comment: "Requests that are pointed to by a CarePlan using this element should *not* point to this CarePlan using the "basedOn" element."
        *   **Action:** Map data from R4 `activity.reference` to R6 `activity.plannedActivityReference`. Update logic to handle the new set of target types and the guidance on `basedOn` linkage.

## 4. Constraint Changes

*   **R4 Constraint `cpl-3` (Removed):**
    *   **R4 Definition:** `CarePlan.activity: "Provide a reference or detail, not both" (detail.empty() or reference.empty())`.
    *   **Impact:** This constraint is no longer applicable in R6 due to the removal of `CarePlan.activity.detail` and the restructuring of how activities are referenced. R6 simplifies the choice by mandating referenced activities.
*   **R6:** The provided R6 documentation states, "No formal constraints are defined for CarePlan..." This implies no new element-level constraints comparable to R4's `cpl-3` were added within the core resource definition in R6.

## 5. Search Parameter Changes

Several search parameters have been removed, added, or modified due to changes in the resource structure and element definitions.

### 5.1. Removed Search Parameters (from R4)

*   **`activity-code`:** (Was `CarePlan.activity.detail.code`) - Removed as `activity.detail` is removed.
*   **`activity-date`:** (Was `CarePlan.activity.detail.scheduled`) - Removed as `activity.detail` is removed.
*   **`instantiates-canonical`:** (Was `CarePlan.instantiatesCanonical`) - Removed as the root element is removed.
*   **`instantiates-uri`:** (Was `CarePlan.instantiatesUri`) - Removed as the root element is removed.
*   **`performer`:** (Was `CarePlan.activity.detail.performer`) - Removed as `activity.detail` is removed.

### 5.2. New Search Parameters in R6

*   **`custodian`**
    *   **Type:** `reference`
    *   **Expression:** `CarePlan.custodian`
    *   **Targets:** `Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam`
    *   **Impact:** New search parameter corresponding to the renamed `CarePlan.custodian` element (formerly `author`, for which R4 had no standard search parameter).

### 5.3. Modified Search Parameters

*   **`activity-reference`**
    *   **R4 Expression:** `CarePlan.activity.reference`
    *   **R4 Targets:** `Appointment, CommunicationRequest, DeviceRequest, MedicationRequest, NutritionOrder, Task, ServiceRequest, VisionPrescription, RequestGroup`
    *   **R6 Expression:** `CarePlan.activity.plannedActivityReference`
    *   **R6 Targets:** `Appointment, CommunicationRequest, DeviceRequest, ImmunizationRecommendation, MedicationRequest, NutritionOrder, RequestOrchestration, ServiceRequest, SupplyRequest, Task, VisionPrescription`
    *   **Impact:** Expression updated to the renamed element. Target resource types list is changed: `RequestGroup` removed; `ImmunizationRecommendation`, `RequestOrchestration`, `SupplyRequest` added. Queries using this parameter must be updated.

*   **`based-on`**
    *   **R4 Targets:** `CarePlan`
    *   **R6 Targets:** `CarePlan, NutritionOrder, RequestOrchestration, ServiceRequest`
    *   **Impact:** Target types expanded to reflect the change in `CarePlan.basedOn` element's allowed reference types.

*   **`condition`**
    *   **R4 Expression:** `CarePlan.addresses` (targeting `Reference(Condition)`)
    *   **R4 Targets:** `Condition`
    *   **R6 Expression:** `CarePlan.addresses.reference` (targeting the `reference` part of `CodeableReference(Condition | Procedure | MedicationAdministration)`)
    *   **R6 Targets:** `Condition, Procedure, MedicationAdministration`
    *   **Impact:** Expression changed to align with the new `CodeableReference` type of `CarePlan.addresses`, specifically targeting its `reference` component. Target types are expanded.
        *   **Note:** The R6 search parameter definition provided only covers searching the `reference` part of `CarePlan.addresses`. There is no standard search parameter explicitly defined in the R6 documentation for querying the `concept` (CodeableConcept) part of `CarePlan.addresses`.

*   **`status`**
    *   **R4 Value Set (example):** `draft | active | on-hold | revoked | completed | entered-in-error | unknown`
    *   **R6 Value Set (example from element, search param doc may vary):** Includes `ended` in addition to R4 codes.
    *   **Impact:** Queries for `status` should consider the new `ended` code if supported by the server, reflecting the updated value set for the `CarePlan.status` element.

*   **`intent`**
    *   **R4 Value Set (example):** `proposal | plan | order | option`
    *   **R6 Value Set (example):** Includes `directive` in addition to R4 codes.
    *   **Impact:** Queries for `intent` can now include `directive`.

## 6. Compartment Changes

The patient-centric compartments associated with CarePlan have changed:

*   **R4 Compartments:** `Encounter`, `Patient`, `Practitioner`, `RelatedPerson`
*   **R6 Compartments:** `Encounter`, `Group`, `Patient`
*   **Impact:**
    *   The `Practitioner` and `RelatedPerson` compartments are no longer standard for CarePlan in R6. Systems relying on these for access control or specific queries will need to adapt.
    *   The `Group` compartment is new for CarePlan in R6, aligning with `CarePlan.subject` being able to reference a `Group`.

## 7. Key Migration Actions & Considerations

1.  **Restructure Activity Definitions (Critical & Breaking):**
    *   Migrate all data from R4 `CarePlan.activity.detail` into new, separate FHIR request resources (e.g., `ServiceRequest`, `MedicationRequest`, `NutritionOrder`).
    *   Update application logic to create, read, and manage these referenced request resources instead of inline details.
    *   Replace R4 `CarePlan.activity.reference` with R6 `CarePlan.activity.plannedActivityReference`, ensuring target types are compatible.
2.  **Adapt to `CarePlan.addresses` Change (Critical & Breaking):**
    *   Modify data storage and processing logic for `CarePlan.addresses` to handle the R6 `CodeableReference` type.
    *   Migrate R4 `Reference(Condition)` data to the `reference` part of the R6 `CodeableReference` structure.
    *   Determine how to utilize the new capability to address `Procedure` and `MedicationAdministration`, or use the `concept` part.
3.  **Implement `CarePlan.activity.performedActivity`:**
    *   Evaluate use cases for the new `activity.performedActivity` element to track completed or in-progress activities.
4.  **Rename `author` to `custodian`:**
    *   Map R4 `CarePlan.author` data to R6 `CarePlan.custodian`.
5.  **Address Removal of Plan-Level Instantiation:**
    *   If R4 `CarePlan.instantiatesCanonical` or `CarePlan.instantiatesUri` were used, identify alternative methods (e.g., extensions, `derivedFrom` on `PlanDefinition` if applicable, or linking at activity level if activities represent defined protocol steps).
6.  **Update Status and Intent Logic:**
    *   Incorporate the new `ended` status code for `CarePlan.status`.
    *   Incorporate the new `directive` intent code for `CarePlan.intent` and respect its immutability guidance.
7.  **Revise Search Queries:**
    *   Remove queries using the R4 search parameters: `activity-code`, `activity-date`, `instantiates-canonical`, `instantiates-uri`, `performer`.
    *   Update queries for `activity-reference` to use the new expression and target types.
    *   Update queries for `based-on` to account for expanded target types.
    *   Update queries for `condition` to use the new expression (`CarePlan.addresses.reference`) and target types. Note the lack of a standard R6 search parameter for `CarePlan.addresses.concept`.
    *   Utilize the new `custodian` search parameter.
8.  **Adjust Compartment-Based Logic:**
    *   Modify access control or queries based on the removal of `Practitioner` and `RelatedPerson` compartments and the addition of the `Group` compartment.
9.  **Review `CarePlan.partOf` Usage:**
    *   Be mindful of the R6 comment regarding potential complexities with `CarePlan.partOf` and cascading statuses if this element is used.
10. **Test Thoroughly:** Given the significant structural changes, comprehensive testing of all CRUD operations, data migrations, and search functionalities is crucial.