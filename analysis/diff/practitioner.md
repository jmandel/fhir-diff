# FHIR Practitioner Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Practitioner resource between R4 and R6, focusing on aspects critical for implementers. It aims to aid in migration efforts and ensure systems can support both versions or transition smoothly to R6.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Practitioner resource from R4 to R6 involves several notable changes that enhance data representation and search capabilities:

1.  **New `deceased[x]` Element:** R6 introduces `Practitioner.deceased[x]` (boolean or dateTime) to explicitly track if a practitioner is deceased. This is a significant addition for managing practitioner lifecycle. It is marked as an `isModifier` element.
2.  **`Practitioner.communication` Restructured:** In R6, `Practitioner.communication` changes from a `CodeableConcept` (0..*) to a `BackboneElement` (0..*). Each backbone element now contains a required `language` (`CodeableConcept`) and an optional `preferred` (`boolean`) flag. This is a **Breaking Change** requiring data model updates, data migration, and query adjustments. The binding for language has also changed and strengthened.
3.  **New `Practitioner.qualification.status` Element:** R6 adds `status` (`CodeableConcept`, 0..1) to the `qualification` backbone element, allowing for tracking the progress or validity of a qualification (e.g., "in-progress", "active", "lapsed").
4.  **`Practitioner.active` Clarifications:** While the element itself remains, R6 adds `isModifier: true` and explicitly defines its meaning when missing (assumed active). This impacts how systems interpret the active status.
5.  **Search Parameter Enhancements:**
    *   New search parameters `death-date` and `deceased` are added for the new `deceased[x]` element.
    *   New search parameters `qualification-code`, `qualification-period`, and a composite `qual-code-period` are added for more granular searching on qualifications.
    *   The `identifier` search parameter expression is expanded to include `Practitioner.qualification.identifier`.
    *   The `communication` search parameter expression is updated to reflect the new structure (`Practitioner.communication.language`).
6.  **Maturity Level Increase:** The Practitioner resource's maturity level has increased from 3 (Trial Use) in R4 to 5 (Normative Candidate / Normative) in R6, indicating greater stability and a higher degree of review. *Correction based on R6 text: Maturity Level 5, Standard Status: Trial Use. Still significant progress.*
7.  **Scope Clarification:** R6 provides clearer distinctions from `RelatedPerson` and explicitly states that autonomous systems or AI/ML should be represented by the `Device` resource, not Practitioner.

## 2. Overall Resource Scope and Purpose

*   **R4 Focus:** Defined as "A person who is directly or indirectly involved in the provisioning of healthcare." The scope covered a wide range of professionals and service animals.
*   **R6 Enhancements & Clarifications:**
    *   The core definition remains similar: "A person who is directly or indirectly involved in the provisioning of healthcare or related services."
    *   **Maturity:** The resource maturity has advanced to Level 5 in R6, although still "Trial Use" status, suggesting increased stability and community consensus.
    *   **Boundary with `Device`:** R6 explicitly clarifies that "Autonomous systems or machines (including AI/ML) are represented by the `Device` resource." This is an important distinction for modern healthcare systems.
    *   **Boundary with `RelatedPerson`:** R6 offers slightly more detailed differentiation, emphasizing formal responsibilities within a healthcare organization for `Practitioner` versus personal or non-healthcare specific professional relationships for `RelatedPerson`.
    *   **Comments on `Practitioner.telecom`:** R6 adds a security note: "DO NOT use .telecom properties to represent user identities."

*   **Impact:** Implementers should note the increased maturity. The clarification regarding AI/ML as `Device` may influence how certain actors are modeled. The guidance on `telecom` usage is important for security and identity management.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6:

*   **`Practitioner.deceased[x]` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `boolean` | `dateTime` (Choice of two types)
    *   **Short Description/Purpose:** Indicates if the practitioner is deceased or not. Can store a boolean flag or the actual date/time of death.
    *   **`isModifier`:** `true` (Reason: "once a practitioner is marked as deceased, the record should only be used/retained for historical purposes.")
    *   **Comments:** "If there's no value in the instance, it means there is no statement on whether or not the practitioner is deceased. Most systems will interpret the absence of a value as a sign of the person being alive."
    *   **Key Impact/Action for Implementers:**
        *   Systems must now be able to store and process this new element, supporting its choice of data types (`boolean` or `dateTime`).
        *   The `isModifier` status means this element significantly impacts the interpretation of the resource.
        *   Consider data migration strategies if deceased status was previously tracked out-of-band or via extensions.
        *   New search parameters `death-date` and `deceased` are available.

*   **`Practitioner.qualification.status` (New within `qualification` backbone)**
    *   **Cardinality:** `0..1`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/qualification-status` (strength: `preferred`)
    *   **Short Description/Purpose:** Status/progress of the qualification (e.g., active, entered-in-error, in-progress, lapsed).
    *   **Key Impact/Action for Implementers:** This allows for more detailed tracking of a qualification's lifecycle beyond just its validity period. Systems may need to map existing status concepts or support this new level of granularity.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Practitioner.active` (Modified - Metadata and Interpretation)**
    *   **R4 Type:** `boolean`
    *   **R6 Type:** `boolean`
    *   **R6 Additions:**
        *   `isModifier`: `true` (Reason: "it is a status element that can indicate that a record should not be treated as valid")
        *   `Meaning if Missing`: "This resource is generally assumed to be active if no value is provided for the active element."
    *   **Key Impact/Action for Implementers:**
        *   The `isModifier` flag emphasizes the importance of this element in determining resource validity.
        *   The "Meaning if Missing" provides a default interpretation, which can simplify logic if all systems adhere to it. Implementers should ensure their systems align with this interpretation.

*   **`Practitioner.communication` (Modified - **Breaking Change**)**
    *   **R4 Structure:**
        *   Type: `CodeableConcept`
        *   Cardinality: `0..*`
        *   Binding: `http://hl7.org/fhir/ValueSet/languages` (strength: `preferred`)
        *   Short: "A language the practitioner can use in patient communication."
    *   **R6 Structure:**
        *   Type: `BackboneElement`
        *   Cardinality: `0..*`
        *   Short: "A language which may be used to communicate with the practitioner." (Note the subtle shift from "patient communication" to general communication with the practitioner, often administrative. R6 documentation clarifies that `PractitionerRole.communication` is for patient communication languages).
        *   **Backbone Element Contains:**
            *   `Practitioner.communication.language`
                *   Cardinality: `1..1`
                *   Type: `CodeableConcept`
                *   Binding: `http://hl7.org/fhir/ValueSet/all-languages` (strength: `required`)
                *   Short: "The language code used to communicate with the practitioner."
            *   `Practitioner.communication.preferred`
                *   Cardinality: `0..1`
                *   Type: `boolean`
                *   Short: "Language preference indicator."
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The structure for representing practitioner communication languages has fundamentally changed to allow for specifying preference and uses a different, broader, and more strictly bound ValueSet (`all-languages` with `required` strength vs. `languages` with `preferred` strength).
        *   **Action:**
            *   **Data Migration:** Data from R4 `Practitioner.communication` (a `CodeableConcept`) needs to be migrated into the new R6 `Practitioner.communication.language` (`CodeableConcept`) within the new backbone structure. The `preferred` flag logic will need to be established.
            *   **System Logic:** Systems must adapt to handle the new backbone element structure.
            *   **API Queries:** The `communication` search parameter expression changes (see Search Parameter section).
            *   **Semantic Shift:** Note the clarification in R6 that `Practitioner.communication` is for communication *with* the practitioner (often administrative), while `PractitionerRole.communication` is for languages used in *patient* communication.

*   **`Practitioner.qualification` (Modified - Description)**
    *   **R4 Short:** "Certification, licenses, or training pertaining to the provision of care"
    *   **R6 Short:** "Qualifications, certifications, accreditations, licenses, training, etc. pertaining to the provision of care"
    *   **R4 Description:** Focuses on "official certifications, training, and licenses."
    *   **R6 Description:** Broadens to "official qualifications, certifications, accreditations, training, licenses (and other types of educations/skills/capabilities)."
    *   **Key Impact/Action for Implementers:** The scope of what can be included as a `qualification` is slightly broadened in R6 text to explicitly include "accreditations" and other "educations/skills/capabilities." This is a minor descriptive expansion but may allow for more types of qualifications to be represented.

*   **`Practitioner.qualification.code` (Modified - Binding ValueSet URI formatting)**
    *   **R4 Binding ValueSet:** `http://terminology.hl7.org/ValueSet/v2-0360 # Example from v2 table 0360, Version 2.7`
    *   **R6 Binding ValueSet:** `http://terminology.hl7.org/ValueSet/v2-0360`
    *   **Key Impact/Action for Implementers:** The canonical URI for the ValueSet is the same. The R4 version included a comment in the URI string itself. This is a minor formatting difference in the specification document, not a change to the ValueSet being referenced. No action is typically required unless systems were parsing this comment.

### 3.3. Removed Elements from R4

No top-level elements have been removed from the Practitioner resource in R6.

## 4. Constraint Changes

Neither the R4 nor the R6 documentation provided lists formal constraints (invariants) in a dedicated table for the Practitioner resource. Therefore, no changes to explicit constraints are noted.

## 5. Search Parameter Changes

*   **New Search Parameters in R6:**
    *   **`death-date`**
        *   Type: `date`
        *   Expression: `(Practitioner.deceased.ofType(dateTime))`
        *   Purpose: Allows searching for practitioners by their date of death.
    *   **`deceased`**
        *   Type: `token`
        *   Expression: `Practitioner.deceased.exists() and Practitioner.deceased != false`
        *   Purpose: Allows searching for practitioners who are marked as deceased (either boolean `true` or `deceasedDateTime` is present).
    *   **`qualification-code`**
        *   Type: `token`
        *   Expression: `Practitioner.qualification.code`
        *   Purpose: Search by the code of a qualification.
    *   **`qualification-period`**
        *   Type: `date`
        *   Expression: `Practitioner.qualification.period`
        *   Purpose: Search by the validity period of a qualification.
    *   **`qual-code-period` (Composite)**
        *   Type: `composite`
        *   Components: `qualification-code` (expression: `code`), `qualification-period` (expression: `period`)
        *   Context for component expressions: `Practitioner.qualification`
        *   Purpose: Allows searching for practitioners who have a specific qualification code valid during a specific period.

*   **Modified Search Parameters (R4 to R6):**
    *   **`communication`**
        *   R4 Expression: `Practitioner.communication` (searched the `CodeableConcept` directly)
        *   R6 Expression: `Practitioner.communication.language` (searches the `language` element within the new backbone structure)
        *   **Impact:** Queries using the `communication` parameter must be updated to reflect the change in expression and the underlying data structure. The search still targets a `CodeableConcept` for the language, but its path has changed.
    *   **`identifier`**
        *   R4 Expression: `Practitioner.identifier`
        *   R6 Expression: `Practitioner.identifier | Practitioner.qualification.identifier`
        *   **Impact:** The search scope for `identifier` is broadened in R6 to include identifiers found within `Practitioner.qualification.identifier`. Systems using this search parameter may receive more results than in R4 if qualification identifiers match. This could be a **Breaking Change** for applications expecting only practitioner-level identifiers.

*   **Unchanged Search Parameters:**
    The following search parameters remain largely the same in definition and expression between R4 and R6:
    `active`, `address`, `address-city`, `address-country`, `address-postalcode`, `address-state`, `address-use`, `email`, `family`, `gender`, `given`, `name`, `phone`, `phonetic`, `telecom`.

## 6. Key Migration Actions & Considerations

1.  **Handle `Practitioner.communication` Restructuring (Critical - Breaking Change):**
    *   Update data models to reflect `Practitioner.communication` as a backbone element containing `language` (CodeableConcept) and `preferred` (boolean).
    *   Migrate existing R4 `Practitioner.communication` (CodeableConcept) data to the new R6 `Practitioner.communication.language` field. Determine logic for setting the new `preferred` flag.
    *   Update ValueSet mapping from R4's `http://hl7.org/fhir/ValueSet/languages` (preferred) to R6's `http://hl7.org/fhir/ValueSet/all-languages` (required) for `communication.language`.
    *   Modify API queries for the `communication` search parameter.
    *   Be aware of the semantic clarification: `Practitioner.communication` for administrative contact, `PractitionerRole.communication` for patient-facing languages.

2.  **Implement `Practitioner.deceased[x]`:**
    *   Add support for storing and retrieving `deceasedBoolean` or `deceasedDateTime`.
    *   Understand its `isModifier` status and the interpretation when the element is absent.
    *   Utilize new search parameters `death-date` and `deceased` as needed.

3.  **Support `Practitioner.qualification.status`:**
    *   Add this new field to your `qualification` data structure.
    *   Map existing qualification statuses if applicable or integrate with the `http://hl7.org/fhir/ValueSet/qualification-status` ValueSet.

4.  **Adapt to `Practitioner.active` Metadata:**
    *   Recognize `active` as an `isModifier` element.
    *   Align system logic with the R6 "Meaning if Missing" (assumed active if not present).

5.  **Update Search Logic:**
    *   Adapt queries for the modified `communication` search parameter.
    *   Be aware that the `identifier` search parameter now also searches `Practitioner.qualification.identifier`. Assess if this impacts existing queries.
    *   Implement new search parameters (`death-date`, `deceased`, `qualification-code`, `qualification-period`, `qual-code-period`) to leverage enhanced querying capabilities.

6.  **Review Scope Clarifications:**
    *   Ensure AI/ML systems are modeled as `Device`, not `Practitioner`, if this distinction is relevant to your system.
    *   Adhere to the R6 guidance on not using `Practitioner.telecom` for user identities.

7.  **Acknowledge Maturity Change:** The increased maturity level (to 5, "Trial Use") signals greater stability for the resource definition.

By addressing these changes, implementers can ensure a smoother transition from R4 to R6 for the Practitioner resource and leverage its improved data modeling and querying capabilities.