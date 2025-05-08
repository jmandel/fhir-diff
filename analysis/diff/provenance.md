# FHIR Provenance Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Provenance resource between R4 and R6, focusing on aspects critical for implementers. It aims to guide migration efforts and help systems support both versions if necessary.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Provenance resource from R4 to R6 introduces several impactful changes:

1.  **`recorded` Element Optional:** The `Provenance.recorded` element, previously mandatory (`1..1`), is now optional (`0..1`) in R6. This is a **Breaking Change** for systems expecting this element to always be present.
2.  **Restructuring of Reason/Purpose:** The R4 `Provenance.reason` (CodeableConcept) has been **removed**. It is effectively replaced in R6 by two new elements:
    *   `Provenance.authorization` (`CodeableReference`): For structured coding of authorization/purpose of use (e.g., from `v3-PurposeOfUse` value set). The type change from `CodeableConcept` to `CodeableReference` is significant.
    *   `Provenance.why` (`markdown`): For a free-text explanation of why the event occurred.
    This is a **Breaking Change** requiring data model updates and migration logic.
3.  **New Contextual Elements:** R6 introduces `Provenance.basedOn` (Reference(Any)), `Provenance.patient` (Reference(Patient)), and `Provenance.encounter` (Reference(Encounter)) to provide richer contextual links for the provenance record.
4.  **`agent.type` Value Set Change:** The value set binding for `Provenance.agent.type` has changed from `provenance-agent-type` (R4) to `participation-role-type` (R6). This is a **Breaking Change** for systems using these codes. The binding strength also changed from `extensible` to `example`.
5.  **Expanded Agent Reference Types:** `Provenance.agent.who` and `Provenance.agent.onBehalfOf` now support additional reference types in R6, including `CareTeam`, `Group`, and `HealthcareService`.
6.  **`entity.role` Code Change:** The code `derivation` in the `provenance-entity-role` value set (used by `Provenance.entity.role`) in R4 has been replaced by `instantiates` in R6. This is a **Breaking Change** for data using this code.
7.  **New Constraints:** R6 introduces four new constraints (`prov-1` to `prov-4`) related to `Provenance.agent.who` and `Provenance.agent.onBehalfOf` to prevent invalid self-delegation.
8.  **New Search Parameters:** R6 adds search parameters for `activity`, `based-on`, and `encounter`. The `patient` search parameter now targets the new `Provenance.patient` element.
9.  **Maturity Level:** The Provenance resource has advanced from Maturity Level 3 (Trial Use) in R4 to Level 4 (Trial Use) in R6, indicating increased stability and broader review.
10. **Compartment Addition:** The `Group` compartment has been added for Provenance in R6.

Implementers must primarily focus on data migration for `reason`, `recorded`, `agent.type`, and `entity.role`, and adapt to new elements, expanded reference types, and new search capabilities.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of the Provenance resource—to record who, what, and when for a set of resources—remains consistent between R4 and R6. Both versions align with the W3C PROV model.

*   **R4 Emphasis:** Highlighted use with Document Bundles and the `X-Provenance` HTTP header.
*   **R6 Clarification:**
    *   Adds guidance: "Many FHIR resources have their own provenance-related elements (e.g., author, recorder). These should be used preferentially. The Provenance resource is for additional details or when an explicit, separate record of provenance is needed." This helps clarify when to use the standalone Provenance resource versus embedded provenance information.
    *   The description of `Provenance.recorded` in R6 is slightly broader: "...whether in the FHIR Provenance resource or in some other form that is later communicated in the FHIR Provenance."

**Impact:** The R6 clarification on preferential use of embedded provenance elements might influence design decisions for new implementations, encouraging use of `Provenance` for more complex or overarching scenarios.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6:

*   **`Provenance.authorization` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference` (Target resource types for the reference part are not specified in the provided markdown but would typically be `Any` or a defined profile).
    *   **Binding:** `http://terminology.hl7.org/ValueSet/v3-PurposeOfUse` (strength: `example`)
    *   **Short Description/Purpose:** "Authorization (purposeOfUse) related to the event."
    *   **Key Impact/Action for Implementers:** This element, along with `Provenance.why`, replaces the R4 `Provenance.reason`. Data from R4 `reason` (if it contained coded PurposeOfUse) should be migrated to `authorization.concept`. The type change to `CodeableReference` allows referencing other resources as part of the authorization context, which is a significant enhancement over R4's `CodeableConcept`.

*   **`Provenance.why` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `markdown`
    *   **Short Description/Purpose:** "Why was the event performed?"
    *   **Key Impact/Action for Implementers:** This element complements `Provenance.authorization` by providing a field for narrative explanations. Textual parts of R4 `reason` can be migrated here.

*   **`Provenance.basedOn` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(Any)`
    *   **Short Description/Purpose:** "Workflow authorization within which this event occurred." Allows linking the provenance record to plans, proposals, or orders that it fulfills.
    *   **Key Impact/Action for Implementers:** Provides a new way to trace provenance back to originating requests or plans.

*   **`Provenance.patient` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(Patient)`
    *   **Short Description/Purpose:** "The patient is the subject of the data created/updated (.target) by the activity."
    *   **Key Impact/Action for Implementers:** Offers a direct, explicit link to the patient involved, simplifying queries and improving data organization for patient-centric provenance. This also supports a new `patient` search parameter expression.

*   **`Provenance.encounter` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(Encounter)`
    *   **Short Description/Purpose:** "Encounter within which this event occurred or which the event is tightly associated."
    *   **Key Impact/Action for Implementers:** Allows direct linking of provenance to a specific encounter context.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Provenance.recorded` (Modified Cardinality & Description)**
    *   **R4 Cardinality:** `1..1` (instant)
    *   **R6 Cardinality:** `0..1` (instant)
    *   **R6 Description Change:** "The date and time at which the provenance information was recorded / updated, *whether in the FHIR Provenance resource or in some other form that is later communicated in the FHIR Provenance*."
    *   **Key Impact/Action for Implementers:** **Breaking Change.** Systems can no longer assume `recorded` will always be present. Validation logic and data access patterns must be updated. The description change acknowledges that the recording might have happened externally before being captured in FHIR.

*   **`Provenance.activity` (Modified Binding Strength)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/provenance-activity-type` (strength: `extensible`)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/provenance-activity-type` (strength: `example`)
    *   **Key Impact/Action for Implementers:** The binding strength has weakened. While the value set remains the same, this change might influence how strictly systems adhere to it.

*   **`Provenance.agent.type` (Modified Binding & Semantics)**
    *   **R4 Type:** `CodeableConcept`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/provenance-agent-type` (strength: `extensible`)
    *   **R4 Description:** "The participation the agent had with respect to the activity."
    *   **R6 Type:** `CodeableConcept`
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/participation-role-type` (strength: `example`) **Value Set Changed!**
    *   **R6 Description:** "The Functional Role of the agent with respect to the activity." (More specific, references ISO standards).
    *   **Key Impact/Action for Implementers:** **Breaking Change.** Data migration is required for codes used in this element to map from the R4 `provenance-agent-type` value set to the R6 `participation-role-type` value set. The semantic focus shifts to "Functional Role." The binding strength also weakened. This change also applies to `Provenance.entity.agent.type`.

*   **`Provenance.agent.who` (Modified Reference Types)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson | Group | HealthcareService)`
    *   **Key Impact/Action for Implementers:** Systems must be prepared to handle or store references to the new types: `CareTeam`, `Group`, and `HealthcareService`. This change also applies to `Provenance.entity.agent.who`.

*   **`Provenance.agent.onBehalfOf` (Modified Reference Types)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | Group | HealthcareService)`
    *   **Key Impact/Action for Implementers:** Similar to `agent.who`, systems must support the new reference types. This change also applies to `Provenance.entity.agent.onBehalfOf`.

*   **`Provenance.entity.role` (Modified Value Set Content)**
    *   **R4 Binding (for `code` type):** `http://hl7.org/fhir/ValueSet/provenance-entity-role` (required). Includes the code `derivation`.
    *   **R6 Binding (for `code` type):** `http://hl7.org/fhir/ValueSet/provenance-entity-role` (required). The code `derivation` is **removed** and `instantiates` is present (R6 list: `revision | quotation | source | instantiates | removal`).
    *   **Key Impact/Action for Implementers:** **Breaking Change.** Data using the `derivation` code in R4 needs to be migrated, likely to `instantiates` or another appropriate R6 code based on specific semantics.

*   **`Provenance.entity.agent` (Structure Reuse Clarified)**
    *   **R4:** Explicitly listed sub-elements mirroring `Provenance.agent`.
    *   **R6:** Type is listed as `Provenance.agent`, indicating direct reuse of the `Provenance.agent` backbone element structure.
    *   **Key Impact/Action for Implementers:** This is a formal clarification. Any changes to `Provenance.agent`'s sub-elements (e.g., `type`, `who`, `onBehalfOf`) apply equally to `Provenance.entity.agent`.

### 3.3. Removed Elements from R4

*   **`Provenance.reason` (Removed)**
    *   **R4 Type:** `0..* CodeableConcept`
    *   **R4 Binding:** `http://terminology.hl7.org/ValueSet/v3-PurposeOfUse` (extensible)
    *   **Rationale / Key Impact:** **Breaking Change.** This element is removed in R6. Its functionality is now covered by the new `Provenance.authorization` (for coded data, primarily PurposeOfUse) and `Provenance.why` (for narrative text) elements.
        *   **Action:** Data migration is crucial. Map R4 `Provenance.reason.coding` to R6 `Provenance.authorization.concept` and `Provenance.reason.text` to R6 `Provenance.why` or `Provenance.authorization.display`.

## 4. Constraint Changes

*   **R4:** No constraints were explicitly listed in the provided summary.
*   **R6:** Introduces four new formal constraints on the `Provenance.agent` element:
    *   **`prov-1`**: `who` and `onBehalfOf` cannot be the same.
        *   `who.resolve().exists() and onBehalfOf.resolve().exists() implies who.resolve() != onBehalfOf.resolve()`
    *   **`prov-2`**: If `who` is a `PractitionerRole`, `onBehalfOf` can't reference the same `Practitioner`.
        *   `who.resolve().ofType(PractitionerRole).practitioner.resolve().exists() and onBehalfOf.resolve().ofType(Practitioner).exists() implies who.resolve().practitioner.resolve() != onBehalfOf.resolve()`
    *   **`prov-3`**: If `who` is an `Organization`, `onBehalfOf` can't be a `PractitionerRole` within that organization.
        *   `who.resolve().ofType(Organization).exists() and onBehalfOf.resolve().ofType(PractitionerRole).organization.resolve().exists() implies who.resolve() != onBehalfOf.resolve().organization.resolve()`
    *   **`prov-4`**: If `who` is an `Organization`, `onBehalfOf` can't be a `HealthcareService` provided by that organization.
        *   `who.resolve().ofType(Organization).exists() and onBehalfOf.resolve().ofType(HealthcareService).providedBy.resolve().exists() implies who.resolve() != onBehalfOf.resolve().ofType(HealthcareService).providedBy.resolve()`
*   **Impact:** Implementers of R6 systems, particularly servers, must enforce these new validation rules. These constraints improve data quality by preventing illogical delegation scenarios.

## 5. Search Parameter Changes

*   **New Search Parameters in R6:**
    *   **`activity`**:
        *   Type: `token`
        *   Expression: `Provenance.activity`
        *   Impact: Allows searching based on the `Provenance.activity` CodeableConcept.
    *   **`based-on`**:
        *   Type: `reference`
        *   Expression: `Provenance.basedOn`
        *   Targets: `Any`
        *   Impact: Enables searching for Provenance records linked to specific plans or orders.
    *   **`encounter`**:
        *   Type: `reference`
        *   Expression: `Provenance.encounter`
        *   Targets: `Encounter`
        *   Impact: Allows finding Provenance records associated with a particular encounter.

*   **Modified Search Parameters:**
    *   **`agent`**:
        *   R4 Targets: `Practitioner, PractitionerRole, RelatedPerson, Patient, Device, Organization`
        *   R6 Targets: `Practitioner, PractitionerRole, Organization, CareTeam, Patient, Device, RelatedPerson, Group, HealthcareService`
        *   Impact: The target resource types for this search parameter have been expanded in R6 to align with the changes in `Provenance.agent.who`. Queries may need to handle these additional types.
    *   **`agent-type`**:
        *   Expression (`Provenance.agent.type`) remains the same.
        *   Impact: While the search parameter definition is unchanged, queries using `agent-type` must use codes from the R6 `participation-role-type` value set, not the R4 `provenance-agent-type` value set.
    *   **`patient`**:
        *   R4 Expression: `Provenance.target.where(resolve() is Patient)`
        *   R6 Expression: `Provenance.patient`
        *   Impact: **Expression Changed.** The R6 `patient` search parameter now targets the new direct `Provenance.patient` element. This simplifies queries for patient-specific provenance if this new element is populated. Systems migrating or supporting both versions might need to adjust their query strategies.

*   **Unchanged Search Parameters (Name and Expression):**
    *   `agent-role`
    *   `entity`
    *   `location`
    *   `recorded` (Note: the underlying `recorded` element is now optional)
    *   `signature-type`
    *   `target`
    *   `when` (Expression effectively targets `occurred[x]`)

## 6. Key Migration Actions & Considerations

1.  **Address `Provenance.recorded` Cardinality Change (Critical):** Update systems to handle `Provenance.recorded` being optional (`0..1`) in R6. It can no longer be assumed to be present.
2.  **Migrate `Provenance.reason` Data (Critical):**
    *   Develop logic to map R4 `Provenance.reason` (CodeableConcept) to R6's `Provenance.authorization` (`CodeableReference`) and `Provenance.why` (`markdown`).
    *   For coded data (e.g., PurposeOfUse codes from `reason.coding`), migrate to `authorization.concept`.
    *   For textual data (e.g., from `reason.text`), migrate to `why` or potentially `authorization.reference.display` or `authorization.concept.display`.
    *   Handle the type change from `CodeableConcept` to `CodeableReference` for `authorization`.
3.  **Adopt New R6 Elements:**
    *   Evaluate and implement support for `Provenance.basedOn`, `Provenance.patient`, and `Provenance.encounter` to leverage new contextual linking capabilities. Populate these where appropriate.
4.  **Update `Provenance.agent.type` (and `entity.agent.type`) Data:**
    *   Migrate codes from the R4 `provenance-agent-type` value set to the R6 `participation-role-type` value set.
    *   Note the change in binding strength from `extensible` to `example`.
5.  **Support Expanded Reference Types for Agents:**
    *   Modify systems to store and process the additional reference types (`CareTeam`, `Group`, `HealthcareService`) now allowed in `Provenance.agent.who`, `Provenance.agent.onBehalfOf` (and subsequently in `Provenance.entity.agent.who` and `Provenance.entity.agent.onBehalfOf`).
6.  **Update `Provenance.entity.role` Data:**
    *   Migrate instances of the `derivation` code in R4 `Provenance.entity.role` to `instantiates` or another suitable code from the R6 `provenance-entity-role` value set.
7.  **Implement New R6 Constraints:**
    *   Add server-side validation for the new constraints: `prov-1`, `prov-2`, `prov-3`, and `prov-4` related to `Provenance.agent`.
8.  **Update API Queries and Search Logic:**
    *   Utilize the new search parameters: `activity`, `based-on`, `encounter`.
    *   Adapt queries for the `agent` search parameter to account for new potential target types.
    *   Ensure `agent-type` searches use codes from the R6 `participation-role-type` value set.
    *   Revise `patient` searches to use the new `Provenance.patient` element targeted by the R6 `patient` search parameter. Consider fallback strategies for data created before this element was available.
9.  **Consider R6 Scope Clarification:** Review internal guidelines on when to use the Provenance resource versus embedded provenance data in other resources, based on R6's clarification.
10. **Acknowledge Maturity and Compartment Changes:** Note the resource's increased maturity level (4) and the addition of the `Group` compartment for R6.

By addressing these changes, implementers can successfully migrate their systems from R4 to R6 Provenance or build systems capable of supporting both versions. The restructuring of `reason` and changes to `recorded`, `agent.type`, and `entity.role` are particularly critical.