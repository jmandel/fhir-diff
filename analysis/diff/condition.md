# FHIR Condition Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Condition resource between R4 and R6, focusing on aspects critical for implementers. It aims to guide migration efforts and help systems support both versions effectively.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Condition resource from R4 to R6 involves several substantial changes:

1.  **Mandatory `clinicalStatus`:** The `Condition.clinicalStatus` element has changed cardinality from `0..1` (optional) in R4 to `1..1` (required) in R6. This is a **Breaking Change** requiring systems to always provide a clinical status.
2.  **Restructured `Condition.evidence`:** The `evidence` element, previously a BackboneElement with `code` and `detail` sub-elements, is now a `CodeableReference(Any)` in R6. This is a **Major Breaking Change** requiring significant data model adaptation and migration of existing evidence data.
3.  **Official `Condition.bodyStructure` Element:** R6 formalizes the `bodyStructure` element `Reference(BodyStructure)` for specifying anatomical location using a resource reference, mutually exclusive with `bodySite`.
4.  **`asserter` Can Now Be a `Device`:** The `Condition.asserter` element can now reference a `Device` in R6, in addition to Practitioners, Patients, and RelatedPersons.
5.  **`stage.assessment` Type Change:** The `Condition.stage.assessment` element now references `ClinicalAssessment` instead of `ClinicalImpression`, reflecting the replacement of the `ClinicalImpression` resource.
6.  **Constraint Modifications:**
    *   The R4 constraint `con-5` (stating `clinicalStatus` SHALL NOT be present if `verificationStatus` is 'entered-in-error') has been removed. Given `clinicalStatus` is now mandatory in R6, this implies a change in how 'entered-in-error' conditions are handled.
    *   A new constraint (`con-4` in R6) enforces mutual exclusivity between `bodySite` and `bodyStructure`.
    *   The R4 constraint regarding `evidence` structure (`con-2`) has been removed due to the `evidence` element's redesign.
7.  **Search Parameter Expression Updates:** Search parameters targeting `evidence` (`evidence` and `evidence-detail`) have updated expressions to align with the new `CodeableReference` structure. Several other search parameters have minor FHIRPath syntax updates (e.g., `.as()` to `.ofType()`).
8.  **Resource Maturity Increase:** The Condition resource's maturity level has increased from 3 in R4 to 5 in R6, although its standard status remains "Trial Use". This indicates greater stability.

Implementers should prioritize addressing the mandatory `clinicalStatus` and the restructuring of `Condition.evidence`, as these will require code and potentially data migration efforts.

## 2. Overall Resource Scope and Purpose Evolution

The fundamental purpose of the Condition resource—to record conditions, problems, diagnoses, and other health concerns—remains consistent between R4 and R6. However, the R6 documentation provides more detailed guidance and clarifications:

*   **Negation and Absence:** R6 offers more explicit guidance on representing "no known problems" (via `List.emptyReason` or specific codes), refuted conditions (via `verificationStatus`), and how to handle absence identified through checklists (preferring `QuestionnaireResponse` or `Observation`).
*   **Instance vs. State:** R6 more clearly emphasizes that a Condition resource represents a specific *instance* of a condition (e.g., *this* episode of a disease) rather than a general predisposition.
*   **Code Specificity:** R6 notes that `Condition.code` might pre-coordinate details (like stage or location), and dedicated elements like `stage` or `bodySite` should not contradict such pre-coordination.
*   **Evidence Usage:** R6 explicitly states that `Condition.evidence` is for linking supporting manifestations or assessments, *not* for indicating causality (for which extensions or `AdverseEvent` should be used).
*   **Encounter Diagnosis Context:** R6 clarifies that the role (e.g., admission, discharge) and rank of a diagnosis within an encounter are handled by properties on the `Encounter` resource itself, not directly on the Condition.

These clarifications aim to improve consistency in how the Condition resource is used.

## 3. Element-Level Changes

### 3.1. New Elements in R6

*   **`Condition.bodyStructure` (New, formalized)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(BodyStructure)`
    *   **Short Description/Purpose:** Indicates the anatomical body structure on the subject's body where this condition manifests itself.
    *   **Key Impact/Action for Implementers:** This element, previously noted in R4 build pages but not part of the core R4 definition, is now formally part of R6. It allows for a more structured way to specify anatomical location by referencing a `BodyStructure` resource.
    *   **Constraint:** A new constraint (`con-4` in R6) mandates that `bodyStructure` can only be present if `Condition.bodySite` is not present, ensuring mutual exclusivity. Implementers should support this element and the associated constraint.

### 3.2. Modified Elements (R4 to R6)

*   **`Condition.clinicalStatus` (Modified - BREAKING CHANGE)**
    *   **R4 Cardinality:** `0..1` (Optional)
    *   **R6 Cardinality:** `1..1` (Required)
    *   **R6 Value Set (short description):** Now explicitly includes `unknown` in the list of example codes.
    *   **Binding:** The value set URI (`http://hl7.org/fhir/ValueSet/condition-clinical`) remains the same, but R6 references a versioned instance (`|6.0.0-cibuild`). Strength remains `required`.
    *   **Key Impact/Action for Implementers:** This is a **Breaking Change**. Systems creating or updating Condition resources **must now always provide a `clinicalStatus`**. Existing R4 data lacking `clinicalStatus` will need to be updated, potentially inferring a status or setting it to `unknown` (if appropriate) during migration. Validation logic must enforce its presence.
    *   The R6 `comments` also reinforce its mandatory nature: "Required because it's a modifier."

*   **`Condition.verificationStatus` (Modified)**
    *   **R4 Flags:** `[?!, Σ, I]`
    *   **R6 Flags:** `[?!, Σ]` (The `I` flag, indicating influence by an invariant, was removed).
    *   **Binding:** Value set URI (`http://hl7.org/fhir/ValueSet/condition-ver-status`) is the same, R6 references a versioned instance. Strength remains `required`.
    *   **Key Impact/Action for Implementers:** Minor change in flags; core functionality remains.

*   **`Condition.category` (Modified)**
    *   **R4 Binding Strength:** `extensible`
    *   **R6 Binding Strength:** `preferred`
    *   **Key Impact/Action for Implementers:** The change in binding strength to `preferred` encourages greater use of the standard value set (`http://hl7.org/fhir/ValueSet/condition-category`). Systems should prioritize codes from this set where possible.
    *   R6 references a versioned instance of the value set.

*   **`Condition.asserter` (Modified)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Patient | RelatedPerson)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Patient | RelatedPerson | Device)`
    *   **Key Impact/Action for Implementers:** `Device` has been added as a valid reference target for `asserter`. Systems need to be ableto handle `Reference(Device)` for this element. This also impacts the `asserter` search parameter.

*   **`Condition.stage` (Modified)**
    *   **R6 Flags:** `[C, TU]` (Trial Use flag added).
    *   **R6 Description:** The description and short text for `stage` are more detailed in R6, providing more examples. This is a clarification rather than a functional change.

*   **`Condition.stage.summary` (Modified)**
    *   **R6 Description:** Similar to `Condition.stage`, the description and short text are more detailed.

*   **`Condition.stage.assessment` (Modified - Type Change)**
    *   **R4 Type:** `Reference(ClinicalImpression | DiagnosticReport | Observation)`
    *   **R6 Type:** `Reference(ClinicalAssessment | DiagnosticReport | Observation)`
    *   **Key Impact/Action for Implementers:** The reference target `ClinicalImpression` has been replaced with `ClinicalAssessment`. This reflects the introduction of the `ClinicalAssessment` resource in later FHIR versions, which supersedes `ClinicalImpression`. Systems referencing assessments will need to adapt to use/point to `ClinicalAssessment` resources. Data migration might be needed if `ClinicalImpression` resources were used.

*   **`Condition.evidence` (Modified - MAJOR BREAKING CHANGE)**
    *   **R4 Type:** `BackboneElement`, containing:
        *   `code`: `CodeableConcept` (`0..*`)
        *   `detail`: `Reference(Any)` (`0..*`)
    *   **R6 Type:** `CodeableReference(Any)` (`0..*`)
    *   **R6 Binding (for concept part):** `http://hl7.org/fhir/ValueSet/clinical-findings` (Example strength)
    *   **Key Impact/Action for Implementers:** This is a **Major Breaking Change**. The `evidence` element's structure has been completely refactored.
        *   Instead of a backbone element with distinct `code` and `detail` fields, R6 `evidence` is now a list of `CodeableReference` datatypes. Each `CodeableReference` can hold *either* a `concept` (a `CodeableConcept`) *or* a `reference` (a `Reference(Any)`), but not both simultaneously within the same `CodeableReference` instance.
        *   **Data Migration Required:** Data from R4 `Condition.evidence.code` instances will need to be migrated into the `concept` part of R6 `Condition.evidence` (as `CodeableReference`). Data from R4 `Condition.evidence.detail` instances will need to be migrated into the `reference` part of R6 `Condition.evidence`.
        *   Systems must update their data models, data handling logic, and any UI components related to condition evidence.
        *   The R4 constraint `con-2` (requiring evidence to have code or details) is removed as this is inherent in the `CodeableReference` structure.
        *   Search parameters `evidence` and `evidence-detail` have been updated to target the new structure (see Section 5).

### 3.3. Removed Elements from R4 (due to `evidence` refactoring)

*   **`Condition.evidence.code` (Removed)**
    *   **Rationale / Key Impact:** Subsumed into the `concept` part of the new `Condition.evidence` (type `CodeableReference`) in R6.
*   **`Condition.evidence.detail` (Removed)**
    *   **Rationale / Key Impact:** Subsumed into the `reference` part of the new `Condition.evidence` (type `CodeableReference`) in R6.

## 4. Constraint Changes

Several constraints have been added, removed, or modified between R4 and R6:

*   **`con-1` (Stage structure):** `Condition.stage.summary.exists() or Condition.stage.assessment.exists()`
    *   **R4 and R6:** Remains the same (Rule).

*   **R4 `con-2` (Evidence structure):** `Condition.evidence.code.exists() or Condition.evidence.detail.exists()`
    *   **Removed in R6.** This constraint is no longer necessary due to the change of `Condition.evidence` to `CodeableReference`, which inherently supports either a concept or a reference.

*   **R4 `con-3` (ClinicalStatus presence for problem-list-item):**
    *   **Replaced in R6 by `con-2` (ClinicalStatus not unknown for problem-list-item):**
        *   **R6 `con-2` (Warning):** `category.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-category' and code='problem-list-item').exists() implies clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and code='unknown').exists().not()`
        *   **Impact:** The focus shifts from ensuring `clinicalStatus` presence (now covered by its `1..1` cardinality) to discouraging the use of 'unknown' for `clinicalStatus` in problem list items. The severity is `Warning`.

*   **Abatement and Clinical Status (`con-4` in R4, `con-3` in R6):** `abatement.exists() implies (clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and (code='inactive' or code='resolved' or code='remission')).exists())`
    *   **R4 (Rule) and R6 (Rule):** The expression has been slightly rephrased in R6 but remains semantically equivalent: if a condition is abated, its clinical status must be inactive, resolved, or remission.

*   **R4 `con-5` (ClinicalStatus and 'entered-in-error'):** `verificationStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-ver-status' and code='entered-in-error').empty() or clinicalStatus.empty()`
    *   **Removed in R6.**
    *   **Impact:** This is a significant removal, especially since `Condition.clinicalStatus` is now mandatory (`1..1`) in R6.
        *   In R4, if `verificationStatus` was 'entered-in-error', `clinicalStatus` was expected to be absent.
        *   In R6, `clinicalStatus` *must* be present. Therefore, if `verificationStatus` is 'entered-in-error', a `clinicalStatus` (e.g., 'unknown' or another appropriate code reflecting the error state) must still be provided. Implementers need to adjust logic for handling 'entered-in-error' conditions accordingly.

*   **New R6 `con-4` (BodySite/BodyStructure Mutual Exclusivity):** `bodySite.exists() implies bodyStructure.empty()`
    *   **Severity:** Rule
    *   **Impact:** This new rule enforces that `Condition.bodySite` (CodeableConcept) and `Condition.bodyStructure` (Reference) cannot both be present on a Condition instance. This aligns with the formalization of the `bodyStructure` element.

## 5. Search Parameter Differences

*   **FHIRPath Syntax Update:** For several search parameters involving choice types (`onset[x]`, `abatement[x]`), the FHIRPath expression syntax has changed from using `.as(Type)` to `.ofType(Type)`. This is a general FHIRPath refinement and affects:
    *   `abatement-age`
    *   `abatement-date`
    *   `abatement-string`
    *   `onset-age`
    *   `onset-date`
    *   `onset-info` (name `onset-info` is consistent from R4 to R6; the R6 source document contained an internal query about this)
    *   **Impact:** Query engines and client applications constructing FHIR searches may need to update their FHIRPath expressions if they were highly specific to the older syntax.

*   **`asserter` (Modified Targets)**
    *   **R4 Targets:** `Practitioner`, `Patient`, `PractitionerRole`, `RelatedPerson`
    *   **R6 Targets:** `Practitioner`, `Device`, `Patient`, `PractitionerRole`, `RelatedPerson`
    *   **Impact:** The `asserter` search parameter now also supports searching for conditions asserted by a `Device`, aligning with the element's type change.

*   **`evidence` (Modified Expression)**
    *   **R4 Expression:** `Condition.evidence.code` (Type: `token`)
    *   **R6 Expression:** `Condition.evidence.concept` (Type: `token`)
    *   **Impact:** Reflects the change of `Condition.evidence` to `CodeableReference`. The search parameter `evidence` now targets the `concept` (CodeableConcept) part of the `evidence` element. Queries will need to be updated.

*   **`evidence-detail` (Modified Expression)**
    *   **R4 Expression:** `Condition.evidence.detail` (Type: `reference`, Targets: `Any`)
    *   **R6 Expression:** `Condition.evidence.reference` (Type: `reference`, Targets: `Any`)
    *   **Impact:** Reflects the change of `Condition.evidence` to `CodeableReference`. The search parameter `evidence-detail` now targets the `reference` part of the `evidence` element. Queries will need to be updated.

Other search parameters (`body-site`, `category`, `clinical-status`, `code`, `encounter`, `identifier`, `patient`, `recorded-date`, `severity`, `stage`, `subject`, `verification-status`) remain largely unchanged in name, type, and primary intent, apart from the minor FHIRPath syntax updates noted above for some.

## 6. Key Migration Actions & Considerations

1.  **Address Mandatory `Condition.clinicalStatus` (Critical):**
    *   Update systems to ensure `clinicalStatus` is always populated when creating/updating Condition resources.
    *   Plan for migrating existing R4 Condition data: determine how to populate `clinicalStatus` for records where it's missing (e.g., infer from other data, set to 'unknown' if appropriate, or consult clinical SMEs).
    *   Update validation logic to enforce the `1..1` cardinality.

2.  **Migrate `Condition.evidence` Structure (Critical):**
    *   Adapt data models to store `Condition.evidence` as a list of `CodeableReference(Any)`.
    *   Develop data migration scripts to convert R4 `evidence.code` into `evidence.concept` and R4 `evidence.detail` into `evidence.reference` within the new R6 structure.
    *   Update UI and business logic that processes or displays condition evidence.

3.  **Support `Condition.bodyStructure`:**
    *   Implement support for the new `Condition.bodyStructure` element `Reference(BodyStructure)`.
    *   Implement validation for the new R6 constraint `con-4` ensuring mutual exclusivity between `bodySite` and `bodyStructure`.

4.  **Update `Condition.asserter` Handling:**
    *   Modify systems to recognize and process `Device` as a valid reference target for `Condition.asserter`.
    *   Update queries using the `asserter` search parameter if filtering by `Device` is required.

5.  **Adapt to `Condition.stage.assessment` Type Change:**
    *   Change references from `ClinicalImpression` to `ClinicalAssessment` for `Condition.stage.assessment`.
    *   If `ClinicalImpression` resources were used, consider migrating them or adapting linkage to the new `ClinicalAssessment` resource.

6.  **Revise Constraint Logic:**
    *   Remove logic related to R4 `con-2` (evidence structure) and R4 `con-5` (clinicalStatus presence with 'entered-in-error').
    *   Adapt to the changed logic of R6 `con-2` (clinicalStatus not 'unknown' for problem list items - Warning).
    *   Ensure handling for 'entered-in-error' `verificationStatus` correctly populates the now-mandatory `clinicalStatus`.

7.  **Update API Queries:**
    *   Adjust FHIRPath expressions for search parameters like `abatement-[age|date|string]` and `onset-[age|date|info]` if using specific `.as()` syntax.
    *   Modify queries for `evidence` and `evidence-detail` to use the new expressions (`Condition.evidence.concept` and `Condition.evidence.reference`).

8.  **Review Scope Clarifications:** Consider if the more detailed R6 guidance on negation, instance vs. state, code specificity, and evidence usage impacts current system interpretations or workflows.

9.  **Test Thoroughly:** After implementing changes, conduct comprehensive testing covering data migration, API interactions (creation, update, search), and validation logic.