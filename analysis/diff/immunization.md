# FHIR Immunization Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Immunization resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions. It aims to provide clear, actionable guidance.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Immunization resource from R4 to R6 introduces several substantial changes, including breaking changes that require data model updates and migration:

1.  **Reason for Immunization (Breaking Change):** The R4 elements `reasonCode` (type `CodeableConcept`) and `reasonReference` (type `Reference`) have been **merged** into a single R6 element `reason` of type `CodeableReference`. This consolidates how reasons are captured, requiring data migration and logic updates.
2.  **Educational Material (Breaking Change):** The R4 `Immunization.education` backbone element and its sub-elements have been **removed**. R6 guidance directs implementers to use the separate `Communication` resource to document educational materials provided. This necessitates migrating existing education data to `Communication` resources and updating system workflows.
3.  **Program Eligibility Structure (Breaking Change):** The R4 `programEligibility` element (type `CodeableConcept`) has been **restructured** in R6 into a backbone element `Immunization.programEligibility` containing two mandatory `CodeableConcept` child elements: `program` and `programStatus`. Data migration is required to map R4 data to this new structure.
4.  **Product and Manufacturer Representation:**
    *   A new element `administeredProduct` (type `CodeableReference(Medication)`) is introduced in R6, allowing for more detailed specification of the administered vaccine, potentially linking to a `Medication` resource.
    *   `Immunization.manufacturer` has changed type from `Reference(Organization)` in R4 to `CodeableReference(Organization)` in R6, offering more flexibility.
5.  **Information Source Element:** The R4 `reportOrigin` (type `CodeableConcept`) has been renamed to `informationSource` in R6 and its type changed to `CodeableReference`, allowing for a broader range of referenced resource types.
6.  **Protocol Dose/Series Numbering:**
    *   `Immunization.protocolApplied.doseNumber` changed from a choice of `positiveInt` or `string` (R4, cardinality `1..1` for the choice) to a single `CodeableConcept` (R6, cardinality `0..1`).
    *   `Immunization.protocolApplied.seriesDoses` changed from a choice of `positiveInt` or `string` (R4) to `CodeableConcept` (R6). These changes offer more semantic richness but require data mapping.
7.  **New Traceability and Support Elements:** R6 introduces `basedOn` (to link to care plans, requests, or recommendations) and `supportingInformation` (for other relevant data).
8.  **Search Parameter Adjustments:** Several search parameter expressions have been updated to reflect underlying element changes (e.g., for `manufacturer`, `reaction`, `reason-code`, `reason-reference`). A new search parameter `encounter` has been added.
9.  **Maturity Level:** The resource maturity level has increased from 3 in R4 to 5 in R6, indicating greater stability and broader adoption.

Implementers should anticipate significant effort in data migration, model updates, and API query adjustments, particularly for the breaking changes listed above.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of the Immunization resource—to record vaccine administration events or history—remains consistent between R4 and R6. However, there are notable refinements:

*   **Maturity:** The resource's maturity level has advanced from 3 (Trial Use, R4 page) to **5 (Normative)** in R6, signaling increased stability and implementation consensus.
*   **Educational Materials:** R6 explicitly clarifies that educational materials provided to the patient should be documented using the separate `Communication` resource. This was previously handled within `Immunization.education` in R4. This change promotes better separation of concerns.
*   **Product Detail:** R6 enhances the ability to detail the administered product via the new `administeredProduct` element and the change of `manufacturer` to `CodeableReference`.

## 3. Element-Level Changes

This section details additions, modifications, and removals of elements.

### 3.1. New Elements in R6

The following elements have been introduced in R6, enhancing the resource's capabilities:

*   **`Immunization.basedOn`**
    *   **Type:** `Reference(CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Allows linking the immunization event to an authorizing plan, order, or recommendation (e.g., a `MedicationRequest` for the vaccine).
    *   **Impact:** Provides enhanced traceability. Systems can now formally link immunizations to their originating requests.

*   **`Immunization.administeredProduct`**
    *   **Type:** `CodeableReference(Medication)`
    *   **Cardinality:** `0..1`
    *   **Purpose:** Provides a more detailed representation of the specific vaccine product administered, potentially referencing a `Medication` resource (which could be contained or external). This complements `vaccineCode`.
    *   **Impact:** Enables richer product information. If used, systems may need to handle references to `Medication` resources.

*   **`Immunization.supportingInformation`**
    *   **Type:** `Reference(Any)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Captures additional information relevant to the immunization that doesn't fit into other specific elements (e.g., gestational age for a pregnant recipient).
    *   **Impact:** Offers a flexible way to include contextual data. Implementers should ensure this is not used for data that belongs in more specific elements like `reason` or `statusReason`.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have undergone significant modifications:

*   **`Immunization.manufacturer` (Type Change)**
    *   **R4 Type:** `Reference(Organization)`
    *   **R6 Type:** `CodeableReference(Organization)`
    *   **Impact:** This change allows the manufacturer to be specified either as a coded concept or as a direct reference to an `Organization` resource. Data models must be updated to handle `CodeableReference`. Search parameter `manufacturer` expression changes.

*   **`Immunization.reportOrigin` (R4) to `Immunization.informationSource` (R6) (Rename & Type Change)**
    *   **R4 Element Name & Type:** `reportOrigin`, `CodeableConcept`
    *   **R6 Element Name & Type:** `informationSource`, `CodeableReference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization)`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/immunization-origin` (example)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/immunization-origin` (example)
    *   **Impact:** The element is renamed, and its type changes from `CodeableConcept` to `CodeableReference`, significantly broadening the types of resources that can be referenced as the information source. Data migration is required from `reportOrigin` to `informationSource`, mapping existing codes to the new structure.

*   **`Immunization.performer.actor` (Expanded Reference Targets)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Organization)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson)`
    *   **Impact:** R6 allows `Patient` and `RelatedPerson` to be specified as performers, offering more flexibility for scenarios like self-administration or administration by a caregiver. Search parameter `performer` target list is updated.

*   **`Immunization.reasonCode` & `Immunization.reasonReference` (R4) merged into `Immunization.reason` (R6) (Breaking Change)**
    *   **R4 Elements:**
        *   `reasonCode`: `CodeableConcept`, `0..*`, Binding: `http://hl7.org/fhir/ValueSet/immunization-reason` (example)
        *   `reasonReference`: `Reference(Condition | Observation | DiagnosticReport)`, `0..*`
    *   **R6 Element:**
        *   `reason`: `CodeableReference(Condition | Observation | DiagnosticReport)`, `0..*`, Binding: `http://hl7.org/fhir/ValueSet/immunization-reason` (example)
    *   **Impact:** This is a **Breaking Change**. The two R4 elements are consolidated into a single `reason` element of type `CodeableReference` in R6. This simplifies the model by providing one place to specify the reason either as a code or as a reference.
        *   **Action:** Data must be migrated. R4 `reasonCode` values will typically map to the `concept` part of the R6 `reason`, and R4 `reasonReference` values to the `reference` part. Search parameters `reason-code` and `reason-reference` are updated to query `reason.concept` and `reason.reference` respectively.

*   **`Immunization.programEligibility` (Restructured - Breaking Change)**
    *   **R4 Type:** `CodeableConcept`, `0..*`. Binding: `http://hl7.org/fhir/ValueSet/immunization-program-eligibility` (example).
    *   **R6 Structure:** BackboneElement, `0..*`, containing:
        *   `program`: `CodeableConcept`, `1..1`. Binding: `http://hl7.org/fhir/ValueSet/immunization-vaccine-funding-program` (example).
        *   `programStatus`: `CodeableConcept`, `1..1`. Binding: `http://hl7.org/fhir/ValueSet/immunization-program-eligibility` (example).
    *   **Impact:** This is a **Breaking Change**. The simple `CodeableConcept` in R4 is replaced by a structured backbone element in R6, requiring both a `program` and a `programStatus`.
        *   **Action:** Data migration is required. Information from the R4 `programEligibility` `CodeableConcept` needs to be mapped into the new `program` and `programStatus` fields. The R6 `programStatus` uses the same value set as the R4 `programEligibility` element.

*   **`Immunization.reaction.detail` (R4) to `Immunization.reaction.manifestation` (R6) (Rename & Type Change)**
    *   **R4 Element Name & Type:** `reaction.detail`, `Reference(Observation)`
    *   **R6 Element Name & Type:** `reaction.manifestation`, `CodeableReference(Observation)`
    *   **Impact:** The element detailing the reaction is renamed, and its type changes from `Reference` to `CodeableReference`. This allows the reaction manifestation to be described as a code or a reference. Data models and search query for `reaction` parameter need updates.

*   **`Immunization.protocolApplied.doseNumber[x]` (R4) to `Immunization.protocolApplied.doseNumber` (R6) (Type & Cardinality Change)**
    *   **R4 Choice:** `doseNumberPositiveInt` (`positiveInt`) | `doseNumberString` (`string`). The choice itself was `1..1`.
    *   **R6 Element:** `doseNumber`, `CodeableConcept`, `0..1`.
    *   **Impact:** The type changes from a choice of primitives to `CodeableConcept`, allowing for richer semantic representation of the dose number (e.g., "Booster", "Dose 1 of 3"). The cardinality also changes from effectively mandatory (`1..1` for the choice) to optional (`0..1`).
        *   **Action:** Data migration is needed. R4 `positiveInt` or `string` values should be mapped into the `text` or `coding` fields of the R6 `CodeableConcept`. Systems must adapt to the new optionality.

*   **`Immunization.protocolApplied.seriesDoses[x]` (R4) to `Immunization.protocolApplied.seriesDoses` (R6) (Type Change)**
    *   **R4 Choice:** `seriesDosesPositiveInt` (`positiveInt`) | `seriesDosesString` (`string`). The choice itself was `0..1`.
    *   **R6 Element:** `seriesDoses`, `CodeableConcept`, `0..1`.
    *   **Impact:** Similar to `doseNumber`, the type changes to `CodeableConcept`.
        *   **Action:** Data migration is needed, mapping R4 `positiveInt` or `string` values into the R6 `CodeableConcept`.

### 3.3. Removed Elements from R4

*   **`Immunization.education` (BackboneElement)**
    *   **Sub-elements in R4:** `documentType`, `reference`, `publicationDate`, `presentationDate`.
    *   **Rationale/Impact:** This is a **Breaking Change**. The entire `education` backbone element has been removed in R6. The R6 specification advises using the separate `Communication` resource for documenting educational materials provided to the patient or guardian.
        *   **Action:** Data previously stored in `Immunization.education` must be migrated to new `Communication` resources. System logic for recording and retrieving educational material information needs to be significantly updated to interact with the `Communication` resource. The R4 constraint `imm-1` related to this element is also removed.

## 4. Constraint Changes

*   **`imm-1` (Removed in R6):**
    *   **R4 Constraint:** "One of `documentType` or `reference` SHALL be present" (located on `Immunization.education`).
    *   **Impact:** This constraint is removed because the `Immunization.education` element itself has been removed in R6. Implementations should remove any validation logic based on `imm-1`.
*   No new constraints are explicitly listed in the provided R6 markdown for the Immunization resource.

## 5. Search Parameter Changes

Several search parameters have been added or modified to align with the R6 element changes.

*   **New Search Parameters in R6:**
    *   **`encounter`**
        *   **Type:** `reference`
        *   **Expression:** `Immunization.encounter`
        *   **Targets:** `Encounter`
        *   **Impact:** Enables searching for immunizations based on the encounter during which they occurred.

*   **Modified Search Parameters (R4 to R6):**
    *   **`date`**:
        *   **R4 Expression:** `Immunization.occurrence`
        *   **R6 Expression:** `(Immunization.occurrence.ofType(dateTime))`
        *   **Impact:** The R6 expression is more specific, targeting only the `dateTime` choice of the `occurrence[x]` element. Queries relying on string-based occurrence dates for this parameter might not behave as expected unless `occurrenceDateTime` is consistently populated.

    *   **`manufacturer`**:
        *   **R4 Expression:** `Immunization.manufacturer` (on `Reference(Organization)`)
        *   **R6 Expression:** `Immunization.manufacturer.reference` (on `CodeableReference(Organization)`)
        *   **Impact:** The expression is updated to navigate the `CodeableReference` structure. Queries using this parameter must be adjusted.

    *   **`performer`**:
        *   **R4 Targets:** `Practitioner`, `PractitionerRole`, `Organization`
        *   **R6 Targets:** `Practitioner`, `Organization`, `Patient`, `PractitionerRole`, `RelatedPerson`
        *   **Impact:** The list of target resource types for the performer has been expanded, reflecting the change in `Immunization.performer.actor`.

    *   **`reaction`**:
        *   **R4 Expression:** `Immunization.reaction.detail` (on `Reference(Observation)`)
        *   **R6 Expression:** `Immunization.reaction.manifestation.reference` (on `CodeableReference(Observation)`)
        *   **Impact:** The expression is updated due to the renaming of `reaction.detail` to `reaction.manifestation` and its type change to `CodeableReference`. Queries need modification.

    *   **`reason-code`**:
        *   **R4 Expression:** `Immunization.reasonCode`
        *   **R6 Expression:** `Immunization.reason.concept`
        *   **Impact:** The expression now targets the `concept` part of the new `Immunization.reason` (`CodeableReference`) element. Queries need updating.

    *   **`reason-reference`**:
        *   **R4 Expression:** `Immunization.reasonReference`
        *   **R6 Expression:** `Immunization.reason.reference`
        *   **R6 Targets:** `Condition`, `Observation`, `DiagnosticReport`
        *   **Impact:** The expression now targets the `reference` part of the new `Immunization.reason` element. Queries need updating.

*   **Unchanged Search Parameters (Name and Type):**
    The following search parameters remain largely consistent in name and type, though implementers should always verify exact expressions if their systems rely on specific search behaviors:
    `identifier`, `location`, `lot-number`, `patient`, `reaction-date`, `series`, `status`, `status-reason`, `target-disease`, `vaccine-code`.

## 6. Key Migration Actions & Considerations

Implementers migrating from R4 to R6 or supporting both versions should consider the following actions:

1.  **Reasoning Data Migration (Critical):**
    *   Map R4 `Immunization.reasonCode` (`CodeableConcept`) data to `Immunization.reason.concept` in R6.
    *   Map R4 `Immunization.reasonReference` (`Reference`) data to `Immunization.reason.reference` in R6.
    *   Update application logic to use the single `Immunization.reason` field.

2.  **Educational Material Migration (Critical):**
    *   Develop a strategy to migrate data from the R4 `Immunization.education` backbone element into new, separate `Communication` resources.
    *   Establish links between `Immunization` and these new `Communication` resources if required.
    *   Update system workflows to create, manage, and query `Communication` resources for educational information related to immunizations.

3.  **Program Eligibility Data Migration (Critical):**
    *   Transform data from the R4 `Immunization.programEligibility` (`CodeableConcept`) into the R6 `Immunization.programEligibility` backbone structure.
    *   Ensure values are correctly mapped to the new `program` (`CodeableConcept`) and `programStatus` (`CodeableConcept`) child elements.

4.  **Adapt to `CodeableReference` Types:**
    *   Update data models and handling for `Immunization.manufacturer` (now `CodeableReference(Organization)`).
    *   Update handling for `Immunization.informationSource` (R6, `CodeableReference`) from R4's `reportOrigin` (`CodeableConcept`).
    *   Adapt to `Immunization.reaction.manifestation` (R6, `CodeableReference`) from R4's `reaction.detail` (`Reference`).

5.  **Update Protocol Applied Dose/Series Fields:**
    *   Migrate `Immunization.protocolApplied.doseNumber` data from R4's `positiveInt`/`string` choice to R6's `CodeableConcept`. Address the cardinality change from required (`1..1` choice) to optional (`0..1`).
    *   Migrate `Immunization.protocolApplied.seriesDoses` data from R4's `positiveInt`/`string` choice to R6's `CodeableConcept`.

6.  **Implement New R6 Elements:**
    *   Evaluate the utility of `Immunization.basedOn` for traceability and implement if beneficial.
    *   Consider using `Immunization.administeredProduct` for richer vaccine product details, potentially integrating with `Medication` resources.
    *   Utilize `Immunization.supportingInformation` for relevant contextual data not covered by other elements.

7.  **Update `Immunization.performer.actor` Handling:** Ensure systems can correctly process and store the expanded reference targets for `performer.actor` (now including `Patient` and `RelatedPerson`).

8.  **Revise API Queries and Search Logic:**
    *   Update search parameter expressions for `date`, `manufacturer`, `reaction`, `reason-code`, and `reason-reference` as detailed above.
    *   Incorporate the new `encounter` search parameter where applicable.
    *   Test all search functionalities thoroughly.

9.  **Remove R4 Constraint Logic:** Discontinue validation based on the R4 `imm-1` constraint (related to the removed `education` element).

10. **Acknowledge Maturity Change:** The advancement to Maturity Level 5 (Normative) in R6 implies a more stable and well-vetted resource definition, which can increase confidence in implementation.

Careful planning and thorough testing will be essential for a successful migration to R6 or for robust dual-version support.