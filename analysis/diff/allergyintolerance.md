# FHIR AllergyIntolerance Resource: R4 to R6 Migration Guide

This document outlines significant changes to the FHIR AllergyIntolerance resource between R4 and R6. It is intended for implementers to understand the modifications required when migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the AllergyIntolerance resource from R4 to R6 introduces several impactful changes, including breaking changes that require careful attention:

1.  **`reaction.manifestation` Type Change (Breaking Change):** The `AllergyIntolerance.reaction.manifestation` element has changed from `CodeableConcept` in R4 to `CodeableReference(Observation)` in R6. This allows manifestations to be either a code or a reference to a detailed `Observation` resource, requiring data model updates and migration.
2.  **Element Renaming (Breaking Change):** `AllergyIntolerance.lastOccurrence` (R4) has been renamed to `AllergyIntolerance.lastReactionOccurrence` (R6).
3.  **Search Parameter Modifications (Breaking Changes):**
    *   The `last-date` search parameter (R4) is renamed to `last-reaction-date` (R6).
    *   The `manifestation` search parameter (R4) is replaced by two new parameters in R6: `manifestation-code` and `manifestation-reference`.
    *   The `onset` (for `reaction.onset`) and `recorder` search parameters, present in R4, are **not listed** in the provided R6 documentation. If truly removed, this is a breaking change. Implementers should verify this against the final R6 specification.
4.  **`verificationStatus` Expansion:** The value set for `AllergyIntolerance.verificationStatus` now includes the code `presumed`.
5.  **`type` Element Enhanced:** `AllergyIntolerance.type` has changed from `code` to `CodeableConcept`, and its binding strength has been relaxed from `required` to `preferred`.
6.  **`recorder` Reference Expansion:** The `AllergyIntolerance.recorder` element can now reference `Organization` in addition to previous types.
7.  **Constraint Adjustments:** Formal R4 constraints (`ait-1`, `ait-2`) are removed. New guidance is provided, including a rule that `AllergyIntolerance.code` SHALL be omitted if the `substanceExposureRisk` extension is present.
8.  **Trial Use Elements:** The `AllergyIntolerance.type` and `AllergyIntolerance.reaction` elements are now marked as Trial Use (`TU`) in R6, indicating they may be subject to further changes.

Implementers should anticipate data migration efforts, updates to data handling logic, and revision of API queries.

## 2. Overall Resource Scope and Purpose

The fundamental scope and purpose of the AllergyIntolerance resource remain consistent between R4 and R6: to record a clinical assessment of an individual's propensity for an adverse reaction to a substance.

*   **R4 and R6:** Both versions emphasize documenting allergy and intolerance risks for patient care, information exchange, and decision support. They cover various substances and differentiate between allergy and intolerance.
*   **R6 Clarifications:**
    *   The R6 documentation adds a note that if an allergy is added, any conflicting "no known..." records (e.g., NKA) must be updated (e.g., to `refuted` or `entered-in-error`).
    *   It also explicitly states a new rule: "If the 'substanceExposureRisk' extension is present, the AllergyIntolerance.code element SHALL be omitted."

These are primarily clarifications or refined guidance rather than a fundamental shift in the resource's intended use.

## 3. Element-Level Changes

### 3.1. New Functionality / Significant Modifications to Existing Elements

*   **`AllergyIntolerance.verificationStatus` (Modified)**
    *   **R4 Values:** `unconfirmed | confirmed | refuted | entered-in-error`
    *   **R6 Values:** `unconfirmed | presumed | confirmed | refuted | entered-in-error`
    *   **Key Impact/Action:** R6 introduces the `presumed` status. Systems must be updated to recognize and handle this new value. The R6 comments also note that `verificationStatus` is a `CodeableConcept` to allow for more specificity if needed (e.g., using SNOMED CT).

*   **`AllergyIntolerance.type` (Modified)**
    *   **R4 Type:** `code`
    *   **R4 Binding Strength:** `required`
    *   **R6 Type:** `CodeableConcept`
    *   **R6 Binding Strength:** `preferred`
    *   **R6 Flag:** `TU` (Trial Use)
    *   **Key Impact/Action:**
        *   The change from `code` to `CodeableConcept` allows for more expressive recording of the allergy/intolerance type, including text or multiple codings. Data migration from R4's `code` to R6's `CodeableConcept` (by wrapping the code in a `coding` object) is generally straightforward.
        *   The binding strength relaxation to `preferred` means systems should still prioritize codes from the value set but are not strictly mandated to use only those codes if `type` is provided.
        *   The `TU` flag indicates this element may be subject to future revisions.

*   **`AllergyIntolerance.recorder` (Modified)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Patient | RelatedPerson)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Patient | RelatedPerson | Organization)`
    *   **Key Impact/Action:** R6 adds `Organization` as a permissible reference type for `recorder`. Systems consuming or storing `AllergyIntolerance` resources must be able to handle references to `Organization` in this field.

*   **`AllergyIntolerance.reaction.manifestation` (Modified - Breaking Change)**
    *   **R4 Type:** `CodeableConcept` (Cardinality `1..*`)
    *   **R6 Type:** `CodeableReference(Observation)` (Cardinality `1..*`)
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The R6 model allows manifestations to be represented either as a `CodeableConcept` (within the `.concept` part of `CodeableReference`) or as a `Reference` to a separate `Observation` resource (within the `.reference` part of `CodeableReference`), enabling much richer, structured detail for observed signs/symptoms.
        *   **Action:**
            *   Data migration is required. R4 `CodeableConcept` data for `manifestation` will need to be mapped into the `.concept` field of the R6 `CodeableReference` structure. If detailed observations exist, they can now be referenced.
            *   Systems must adapt to store, process, and query this new `CodeableReference` structure, which can contain either a concept or a reference.
            *   Associated search parameters have changed (see Section 5).

### 3.2. Renamed Elements

*   **`AllergyIntolerance.lastOccurrence` (R4) renamed to `AllergyIntolerance.lastReactionOccurrence` (R6) - Breaking Change**
    *   **R4 Name:** `lastOccurrence`
    *   **R6 Name:** `lastReactionOccurrence`
    *   **Type:** `dateTime` (remains unchanged)
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The element name has been clarified.
        *   **Action:** Systems need to update their data models, mapping logic, and any code referencing `lastOccurrence` to use `lastReactionOccurrence`. The corresponding search parameter has also been renamed (see Section 5).

### 3.3. Other Notable Element Changes

*   **`AllergyIntolerance.onset[x]` (Definitional Change)**
    *   **R4:** Represented as separate elements: `onsetDateTime`, `onsetAge`, `onsetPeriod`, `onsetRange`, `onsetString`.
    *   **R6:** Represented using the choice notation `onset[x]` with types `dateTime | Age | Period | Range | string`.
    *   **Key Impact/Action:** This is primarily a change in how the resource structure is defined in FHIR, consolidating the choice into a single element name with multiple type options. For implementers, the functionality remains the same (ability to store one of these types for onset). Code generation tools might produce different structures based on this. No data migration is needed if data already conforms to one of the choices.

*   **`AllergyIntolerance.code` (New Conditional Rule)**
    *   **R6 Comment:** "If the 'substanceExposureRisk' extension is present, the AllergyIntolerance.code element SHALL be omitted."
    *   **Key Impact/Action:** Implementers must be aware of this new rule. If using the `substanceExposureRisk` extension for negation or other risk statements, the `AllergyIntolerance.code` element should not be populated. This affects data creation and validation logic.

*   **Trial Use (TU) Flags**
    *   In R6, `AllergyIntolerance.type` and the entire `AllergyIntolerance.reaction` backbone element (and its children) are marked with a `TU` (Trial Use) flag.
    *   **Key Impact/Action:** This indicates these elements are considered less stable than normative parts of the specification and may undergo more significant changes in future R6 updates or in R7. Implementers should be aware of this potential for future evolution.

*   **Value Set Versioning:**
    *   R4 element bindings often specify a version for the value set (e.g., `|4.0.1`).
    *   R6 element bindings generally omit the specific version, implying the value set version appropriate for FHIR R6.
    *   **Key Impact/Action:** This is a minor change. Implementers should ensure they are using the R6 versions of the relevant value sets.

## 4. Constraint Changes

*   **R4 Formal Constraints Removed:**
    *   `ait-1`: "AllergyIntolerance.clinicalStatus SHALL be present if verificationStatus is not entered-in-error."
    *   `ait-2`: "AllergyIntolerance.clinicalStatus SHALL NOT be present if verification Status is entered-in-error."
    *   **Key Impact/Action:** These formal constraints are not listed in the R6 definition. While the R6 `clinicalStatus` comments still provide guidance on its presence ("AllergyIntolerance.clinicalStatus should be present if verificationStatus is not entered-in-error and the AllergyIntolerance.code isn't negated..."), the removal of formal constraints might affect automated validation. Implementers should still adhere to the documented guidance.

*   **New Rule for `AllergyIntolerance.code` (via Comment):**
    *   As mentioned in section 3.3, R6 introduces a rule: "If the 'substanceExposureRisk' extension is present, the AllergyIntolerance.code element SHALL be omitted."
    *   **Key Impact/Action:** This is a new validation rule that systems creating AllergyIntolerance resources must follow.

## 5. Search Parameter Changes

### 5.1. Renamed Search Parameters

*   **`last-date` (R4) -> `last-reaction-date` (R6) - Breaking Change**
    *   **R4:** `name: last-date`, `expression: AllergyIntolerance.lastOccurrence`
    *   **R6:** `name: last-reaction-date`, `expression: AllergyIntolerance.lastReactionOccurrence`
    *   **Key Impact/Action:** Reflects the renaming of the underlying element. API queries using the `last-date` parameter must be updated to `last-reaction-date`.

### 5.2. Replaced/Split Search Parameters

*   **`manifestation` (R4) -> `manifestation-code` and `manifestation-reference` (R6) - Breaking Change**
    *   **R4:** `name: manifestation`, `type: token`, `expression: AllergyIntolerance.reaction.manifestation` (targeting `CodeableConcept`)
    *   **R6:**
        *   `manifestation-code`: `type: token`, `expression: AllergyIntolerance.reaction.manifestation.concept`
        *   `manifestation-reference`: `type: reference`, `expression: AllergyIntolerance.reaction.manifestation.reference`, `targets: [Observation]`
    *   **Key Impact/Action:** Due to the change of `reaction.manifestation` to `CodeableReference(Observation)`, the single R4 search parameter is replaced by two more specific parameters in R6.
        *   Queries for coded manifestations must now use `manifestation-code`.
        *   Queries for referenced `Observation` manifestations must use `manifestation-reference`.
        *   API queries using the R4 `manifestation` parameter will fail and need to be redesigned.

### 5.3. Potentially Removed Search Parameters (Based on Provided R6 Document)

The R6 document provided does **not** list the following search parameters that were present in R4. If these are indeed removed from the official R6 specification, it constitutes a **Breaking Change**. Implementers should verify this with the complete, official R6 FHIR specification.

*   **`onset` (Potentially Removed - Breaking Change if true)**
    *   **R4:** `name: onset`, `type: date`, `expression: AllergyIntolerance.reaction.onset`
    *   **R6 Document:** Not listed.
    *   **Key Impact/Action:** If removed, queries based on `AllergyIntolerance.reaction.onset` using this dedicated search parameter will no longer function. Alternative query mechanisms or custom search parameters might be needed.

*   **`recorder` (Potentially Removed - Breaking Change if true)**
    *   **R4:** `name: recorder`, `type: reference`, `expression: AllergyIntolerance.recorder`
    *   **R6 Document:** Not listed.
    *   **Key Impact/Action:** If removed, queries based on `AllergyIntolerance.recorder` will fail. This is particularly notable as the `recorder` element itself was expanded in R6 to include `Organization`.

### 5.4. Unchanged or Minorly Affected Search Parameters

The following search parameters appear to have no significant changes in their definition or expression, though underlying element changes (like `AllergyIntolerance.type` becoming `CodeableConcept`) are handled by standard search parameter mechanics:

*   `asserter`
*   `category`
*   `clinical-status`
*   `code` (expression: `AllergyIntolerance.code | AllergyIntolerance.reaction.substance`)
*   `criticality`
*   `date` (expression: `AllergyIntolerance.recordedDate`)
*   `identifier`
*   `patient`
*   `route` (expression: `AllergyIntolerance.reaction.exposureRoute`)
*   `severity` (expression: `AllergyIntolerance.reaction.severity`)
*   `type` (expression: `AllergyIntolerance.type`)
*   `verification-status` (expression: `AllergyIntolerance.verificationStatus`)

For parameters like `type` and `verification-status`, which changed from `code` to `CodeableConcept` or had value set additions, the `token` search type will typically search on the `system|code` components within the `CodeableConcept`.

## 6. Key Migration Actions & Considerations

1.  **Address `reaction.manifestation` Change (Critical):**
    *   Update data models to handle `CodeableReference(Observation)` for `AllergyIntolerance.reaction.manifestation`.
    *   Migrate R4 `CodeableConcept` data for manifestations into the `.concept` attribute of the new `CodeableReference` structure.
    *   Develop logic to process both coded concepts and references to `Observation` resources for manifestations.
    *   Update API queries from the R4 `manifestation` search parameter to R6 `manifestation-code` and/or `manifestation-reference`.

2.  **Handle Renamed Element `lastReactionOccurrence` (Critical):**
    *   Rename `lastOccurrence` to `lastReactionOccurrence` in data models, storage, and application logic.
    *   Update API queries from the R4 `last-date` search parameter to R6 `last-reaction-date`.

3.  **Adapt to `verificationStatus` Expansion:** Ensure systems can store and correctly interpret the new `presumed` code for `AllergyIntolerance.verificationStatus`.

4.  **Adapt to `type` Element Change:**
    *   Modify systems to handle `AllergyIntolerance.type` as `CodeableConcept` instead of `code`.
    *   Update data ingestion/creation to map R4 `code` values to the `CodeableConcept.coding` structure.
    *   Note the relaxed binding strength (`preferred`).

5.  **Support `Organization` for `recorder`:** Update systems to allow `Reference(Organization)` for `AllergyIntolerance.recorder`.

6.  **Implement New Conditional Rules:**
    *   Enforce the rule that `AllergyIntolerance.code` must be omitted if the `substanceExposureRisk` extension is present.
    *   Review and apply the updated guidance for the presence of `AllergyIntolerance.clinicalStatus`.

7.  **Verify Potentially Removed Search Parameters:**
    *   **Crucially, confirm with the official R6 specification whether the `onset` (for reaction onset) and `recorder` search parameters have been removed.**
    *   If removed, develop alternative strategies for querying this data or advocate for their re-inclusion if critical.

8.  **Review Trial Use (TU) Elements:** Be aware that `AllergyIntolerance.type` and `AllergyIntolerance.reaction` are Trial Use in R6 and may evolve. Monitor future FHIR updates for changes to these elements.

9.  **Test Thoroughly:** After migration, conduct comprehensive testing of data integrity, application logic, and API query functionality.