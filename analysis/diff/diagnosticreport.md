# FHIR DiagnosticReport Resource: R4 to R6 Migration Guide

This document outlines significant changes to the FHIR DiagnosticReport resource between versions R4 and R6. It is intended for implementers migrating systems or supporting both versions, focusing on actionable insights and key differences.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the DiagnosticReport resource from R4 to R6 introduces several substantial changes, requiring careful attention from implementers:

1.  **Expanded Scope:** R6 broadens the `DiagnosticReport` to include **products, substances, and non-clinical contexts** (e.g., batch analysis). This is reflected in expanded target types for `DiagnosticReport.subject` and `DiagnosticReport.performer`.
2.  **New Structural and Linking Elements:** R6 introduces several new elements to enhance report structure and inter-resource linkage:
    *   `relatesTo` (RelatedArtifact): For linking to other related `DiagnosticReport` instances.
    *   `procedure` (Reference(Procedure)): To link to the procedure(s) that generated the report.
    *   `study` (Reference(GenomicStudy | ImagingStudy)): Replaces R4's `imagingStudy` and expands to include `GenomicStudy`.
    *   `composition` (Reference(Composition)): To link to a `Composition` resource for organizing report content.
    *   `supportingInfo` (BackboneElement): For additional supporting information.
    *   `note` (Annotation): For general comments.
    *   `recomendation` (CodeableReference(Any)): For follow-up actions (note: "recomendation" is a typo in the R6 source documentation, likely intended as "recommendation").
    *   `communication` (Reference(Communication)): For communications during report generation.
3.  **Key Element Type Changes (Breaking Changes):**
    *   **`DiagnosticReport.media.link`**: Changed from `Reference(Media)` in R4 to `Reference(DocumentReference)` in R6. This is a **Breaking Change** affecting how key images/data are referenced.
    *   **`DiagnosticReport.conclusionCode`**: Changed from `CodeableConcept` in R4 to `CodeableReference(Observation | Condition)` in R6. This is a **Breaking Change** allowing conclusions to be coded or to reference `Observation` or `Condition` resources.
4.  **`DiagnosticReport.conclusion` Type Change:** Changed from `string` to `markdown`, allowing richer text formatting.
5.  **`DiagnosticReport.status` Value Set Update:** The value set for `status` now includes the code `modified`.
6.  **New `dgr-1` Constraint:** R6 introduces a constraint related to the new `composition` element, ensuring consistency between observations referenced in the `Composition` and those in `DiagnosticReport.result`.
7.  **Search Parameter Updates:**
    *   The R4 `conclusion` search parameter (based on `conclusionCode`) is **removed**.
    *   **New search parameters** `conclusioncode-code` and `conclusioncode-reference` are added to support the new `CodeableReference` type of `conclusionCode`.
    *   **New search parameters** `procedure` and `study` correspond to the new elements.
    *   The `media` search parameter target changes from `Media` to `DocumentReference`.
    *   Targets for `subject` and `performer` search parameters are expanded.
8.  **Resource Compartment Addition:** The `Group` compartment has been added for DiagnosticReport in R6.

Implementers must review these changes carefully, as they impact data modeling, data migration, API interactions (especially queries), and validation logic.

## 2. Overall Resource Scope and Purpose

*   **R4 Scope:** Focused on findings and interpretation of diagnostic tests on "patients, groups of patients, devices, and locations, and/or specimens derived from these."
*   **R6 Scope Expansion:** The R6 definition explicitly broadens this to include "patients, groups of patients, **products, substances,** devices, and locations, and/or specimens derived from these." It further clarifies that "The report also includes **non-clinical context such as batch analysis and stability reporting of products and substances**."
*   **Impact:** This expansion allows `DiagnosticReport` to be used for a wider range of diagnostic activities, including quality control for manufacturing and other non-patient-centric reporting. Systems processing DiagnosticReports may need to accommodate these new subject types and use cases.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6, significantly enhancing the resource's capabilities:

*   **`DiagnosticReport.relatesTo`**
    *   **Type:** `RelatedArtifact`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Allows linking this `DiagnosticReport` to others (e.g., to indicate it replaces, amends, or extends another report).
    *   **Impact:** Enables better tracking of report versions and relationships.

*   **`DiagnosticReport.procedure`**
    *   **Type:** `Reference(Procedure)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Links the report to the `Procedure` resource(s) that generated its content.
    *   **Impact:** Provides explicit linkage to the procedural context of the report. A new search parameter `procedure` is available.

*   **`DiagnosticReport.note`**
    *   **Type:** `Annotation`
    *   **Cardinality:** `0..*`
    *   **Purpose:** For general comments or annotations about the diagnostic report.
    *   **Impact:** Offers a standardized way to include additional narrative remarks.

*   **`DiagnosticReport.study`**
    *   **Type:** `Reference(GenomicStudy | ImagingStudy)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Replaces the R4 `imagingStudy` element and broadens its scope to include `GenomicStudy`. Links to detailed metadata about complex studies.
    *   **Impact:** Consolidates references to imaging and genomic studies. Data from R4 `imagingStudy` should be migrated to this element. A new search parameter `study` is available.

*   **`DiagnosticReport.supportingInfo`** (BackboneElement)
    *   **Cardinality:** `0..*`
    *   **Structure:**
        *   `type`: `CodeableConcept` (Role of the supporting info)
        *   `reference`: `Reference(ImagingStudy | Procedure | Observation | DiagnosticReport | Citation | FamilyMemberHistory | AllergyIntolerance | DeviceUsage | Condition | GenomicStudy)`
    *   **Purpose:** Provides a structured way to include references to other resources that support the diagnostic report but are not part of the primary results.
    *   **Impact:** Enhances traceability and context by formally linking supporting evidence.

*   **`DiagnosticReport.composition`**
    *   **Type:** `Reference(Composition)`
    *   **Cardinality:** `0..1`
    *   **Purpose:** Links to a `Composition` resource that provides a structured organization for the content of the `DiagnosticReport` (e.g., sections of a pathology report).
    *   **Impact:** Enables more sophisticated structuring of report content. Subject to the new `dgr-1` constraint.

*   **`DiagnosticReport.recomendation`** (Note: Typo in R6 source for "recommendation")
    *   **Type:** `CodeableReference(Any)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** To specify proposed follow-up actions based on the report's findings.
    *   **Impact:** Facilitates workflow by allowing structured recommendations (e.g., references to `ServiceRequest` or `CarePlan`).

*   **`DiagnosticReport.communication`**
    *   **Type:** `Reference(Communication)`
    *   **Cardinality:** `0..*`
    *   **Purpose:** Records communications initiated during the generation of the report (e.g., critical result notifications).
    *   **Impact:** Provides a mechanism to track important communications related to the reporting process.

### 3.2. Modified Elements (R4 to R6)

Several existing elements have undergone significant modifications:

*   **`DiagnosticReport.status`**
    *   **R4 Value Set Codes (subset):** `registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | unknown`
    *   **R6 Value Set Codes (subset):** `registered | partial | preliminary | **modified** | final | amended | corrected | appended | cancelled | entered-in-error | unknown`
    *   **Change:** The value set `http://hl7.org/fhir/ValueSet/diagnostic-report-status` has a new code: `modified`.
    *   **Impact:** Systems need to recognize and handle the new `modified` status.

*   **`DiagnosticReport.subject`**
    *   **R4 Type:** `Reference(Patient | Group | Device | Location)`
    *   **R6 Type:** `Reference(Patient | Group | Device | Location | **Organization | Practitioner | Medication | Substance | BiologicallyDerivedProduct**)`
    *   **Change:** The list of allowable target resource types for `subject` has been significantly expanded.
    *   **Impact:** Reflects the broadened scope of `DiagnosticReport` (e.g., for product/substance testing). Systems must be able to handle references to these new subject types. The `subject` search parameter target types are also expanded.

*   **`DiagnosticReport.performer`**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | Organization | CareTeam)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | Organization | CareTeam | **HealthcareService | Device**)`
    *   **Change:** `HealthcareService` and `Device` have been added as possible performer types.
    *   **Impact:** Allows more diverse entities to be designated as responsible for issuing the report. The `performer` search parameter target types are also expanded.

*   **`DiagnosticReport.media.link`**
    *   **R4 Type:** `Reference(Media)`
    *   **R6 Type:** `Reference(DocumentReference)`
    *   **Change:** The type of reference for a media item has changed from `Media` to `DocumentReference`.
    *   **Key Impact/Action for Implementers:** This is a **Breaking Change**. Data migration is required for existing `media.link` references. Systems must now create/link to `DocumentReference` resources instead of `Media` resources for report-associated images or other media. The `media` search parameter target also changes.

*   **`DiagnosticReport.conclusion`**
    *   **R4 Type:** `string`
    *   **R6 Type:** `markdown`
    *   **Change:** The data type for the textual conclusion has changed from `string` to `markdown`.
    *   **Impact:** Allows for richer formatting of the conclusion. Systems displaying this element should be capable of rendering markdown. Data migration from `string` to `markdown` is generally straightforward but rendering capabilities need to be checked.

*   **`DiagnosticReport.conclusionCode`**
    *   **R4 Type:** `CodeableConcept`
    *   **R6 Type:** `CodeableReference(Observation | Condition)`
    *   **Change:** The element for coded conclusions has changed from a simple `CodeableConcept` to a `CodeableReference` which can point to an `Observation` or `Condition` resource.
    *   **Key Impact/Action for Implementers:** This is a **Breaking Change**.
        *   Data migration is required. R4 `CodeableConcept` data will need to be mapped. If the conclusion was previously only coded, it can be mapped to the `.concept` part of `CodeableReference`. If it conceptually pointed to an existing Observation or Condition, it can now be directly referenced.
        *   Systems must support the `CodeableReference` data type.
        *   Querying changes: The R4 `conclusion` search parameter is replaced by `conclusioncode-code` and `conclusioncode-reference`.

### 3.3. Removed/Renamed Elements from R4

*   **`DiagnosticReport.imagingStudy` (Renamed/Replaced)**
    *   **R4 Type:** `Reference(ImagingStudy)`
    *   **R6 Equivalent:** This element is effectively replaced and expanded by the new `DiagnosticReport.study` element, which is `Reference(GenomicStudy | ImagingStudy)`.
    *   **Action:** Data previously in `imagingStudy` should be migrated to the new `study` element. Queries using `imagingStudy` (if any existed, though not a standard search parameter by that direct name in R4) would need to be updated to use the `study` search parameter.

## 4. Constraint Changes

*   **`dgr-1` (New in R6):**
    *   **Severity:** Rule
    *   **Description:** "When a Composition is referenced in `DiagnosticReport.composition`, all Observation resources referenced in `Composition.entry` must also be referenced in `DiagnosticReport.result` or in the `Observation.hasMember` references."
    *   **Expression:** `composition.exists() implies (composition.resolve().section.entry.reference.where(resolve() is Observation) in (result.reference|result.reference.resolve().hasMember.reference))`
    *   **Impact:** This new constraint enforces consistency when using the `composition` element to structure the report. Implementers using `DiagnosticReport.composition` must ensure their data adheres to this rule. Validation logic should be updated.

## 5. Search Parameter Changes

Significant changes have occurred in search parameters:

*   **Removed Search Parameters:**
    *   **`conclusion` (R4):**
        *   Type: `token`
        *   Expression: `DiagnosticReport.conclusionCode`
        *   **Reason/Impact:** Removed because `DiagnosticReport.conclusionCode` changed from `CodeableConcept` to `CodeableReference`. Replaced by `conclusioncode-code` and `conclusioncode-reference` in R6. Queries using `conclusion` will fail.

*   **New Search Parameters in R6:**
    *   **`conclusioncode-code`:**
        *   Type: `token`
        *   Expression: `DiagnosticReport.conclusionCode.concept`
        *   Purpose: Searches the coded part of the `conclusionCode` element.
    *   **`conclusioncode-reference`:**
        *   Type: `reference`
        *   Expression: `DiagnosticReport.conclusionCode.reference`
        *   Targets: `Condition`, `Observation`
        *   Purpose: Searches the reference part of the `conclusionCode` element.
    *   **`procedure`:**
        *   Type: `reference`
        *   Expression: `DiagnosticReport.procedure`
        *   Targets: `Procedure`
        *   Purpose: Searches based on the new `procedure` element.
    *   **`study`:**
        *   Type: `reference`
        *   Expression: `DiagnosticReport.study`
        *   Targets: `GenomicStudy`, `ImagingStudy`
        *   Purpose: Searches based on the new `study` element (which replaces R4 `imagingStudy`).

*   **Modified Search Parameters:**
    *   **`media`:**
        *   R4 Target: `Media`
        *   R6 Target: `DocumentReference`
        *   **Impact:** The target resource type for this search parameter has changed due to the modification of `DiagnosticReport.media.link`. Queries for media will need to be updated to expect `DocumentReference` results or search criteria. **This is a breaking change for queries.**
    *   **`performer`:**
        *   R4 Targets: `Practitioner`, `PractitionerRole`, `Organization`, `CareTeam`
        *   R6 Targets: `Practitioner`, `PractitionerRole`, `Organization`, `CareTeam`, `HealthcareService`, `Device`
        *   **Impact:** Target types expanded to reflect changes in the `performer` element. Existing queries may work but new targets can be utilized.
    *   **`subject`:**
        *   R4 Targets: `Patient`, `Group`, `Device`, `Location`
        *   R6 Targets: `Patient`, `Group`, `Device`, `Location`, `Organization`, `Practitioner`, `Medication`, `Substance`, `BiologicallyDerivedProduct`
        *   **Impact:** Target types significantly expanded to reflect changes in the `subject` element. Existing queries may work but new targets can be utilized.
    *   **`date` (Expression Change):**
        *   R4 Expression: `DiagnosticReport.effective`
        *   R6 Expression: `DiagnosticReport.effective.ofType(dateTime) | DiagnosticReport.effective.ofType(Period)`
        *   **Impact:** The R6 expression is more explicit but the functional behavior for searching `effective[x]` should remain largely the same.

Unchanged search parameters include: `based-on`, `category`, `code`, `encounter`, `identifier`, `issued`, `patient`, `result`, `results-interpreter`, `specimen`, `status`.

## 6. Key Migration Actions & Considerations

1.  **Address Scope Expansion:** Evaluate if your system needs to support the new subject types (products, substances) and performer types (HealthcareService, Device) now covered by `DiagnosticReport`. Update internal data models and logic if necessary.
2.  **Data Migration for `media.link` (Critical):** Convert all `DiagnosticReport.media.link` references from `Media` (R4) to `DocumentReference` (R6). This will likely involve creating new `DocumentReference` resources or mapping existing `Media` content to them.
3.  **Data Migration for `conclusionCode` (Critical):** Transform `DiagnosticReport.conclusionCode` data from `CodeableConcept` (R4) to `CodeableReference(Observation | Condition)` (R6). This may involve mapping existing codes to the `concept` part or, where appropriate, creating/linking to `Observation` or `Condition` resources for the `reference` part.
4.  **Data Migration for `imagingStudy`:** Migrate data from the R4 `DiagnosticReport.imagingStudy` element to the new R6 `DiagnosticReport.study` element.
5.  **Adopt New R6 Elements:**
    *   Review and implement support for new structural elements like `relatesTo`, `procedure`, `study`, `composition`, `supportingInfo`, `note`, `recomendation`, and `communication` as per your system's requirements.
6.  **Handle `conclusion` Type Change:** Ensure systems can render `markdown` for the `DiagnosticReport.conclusion` element.
7.  **Update `status` Value Set:** Accommodate the new `modified` status code in your system's handling of `DiagnosticReport.status`.
8.  **Implement `dgr-1` Constraint:** If using `DiagnosticReport.composition`, ensure your system creates data compliant with the `dgr-1` constraint and update validation logic.
9.  **Revise API Queries (Critical):**
    *   Replace queries using the R4 `conclusion` search parameter with the new R6 `conclusioncode-code` and/or `conclusioncode-reference` parameters.
    *   Update queries using the `media` search parameter to expect `DocumentReference` targets.
    *   Utilize new search parameters like `procedure` and `study`.
    *   Be aware of expanded target types for `subject` and `performer` search parameters.
10. **Review Resource Compartments:** Note the addition of `Group` to the list of compartments for DiagnosticReport in R6, if relevant for your access control or data segregation logic.
11. **Consider the `recomendation` Typo:** Be aware of the "recomendation" typo in the R6 element name. While official FHIR tooling might correct this in patches/future releases, current R6 implementations will use this spelling.