# FHIR ServiceRequest Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR ServiceRequest resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating ServiceRequest from R4 to R6 involves substantial changes, many of which are **Breaking Changes** requiring data model updates, data migration, and query adjustments.

1.  **Major Element Restructuring (Breaking Changes):**
    *   **`ServiceRequest.code`:** Changed from `CodeableConcept` to `CodeableReference(ActivityDefinition | PlanDefinition)`, allowing direct linkage to definitions.
    *   **`ServiceRequest.orderDetail`:** Changed from `CodeableConcept` to a new BackboneElement structure with `parameterFocus` and `parameter` (containing `code` and `value[x]`), enabling more complex and structured order specifics.
    *   **`ServiceRequest.asNeeded[x]`:** Split into `asNeeded` (boolean) and `asNeededFor` (CodeableConcept) for clearer semantics.
    *   **`ServiceRequest.patientInstruction`:** Changed from a simple `string` to a BackboneElement allowing multiple instructions, each of which can be `markdown` or a `Reference(DocumentReference)`.
2.  **Element Consolidation (Breaking Changes):**
    *   R4 `locationCode` and `locationReference` are consolidated into a single R6 `location` element of type `CodeableReference(Location)`.
    *   R4 `reasonCode` and `reasonReference` are consolidated into a single R6 `reason` element of type `CodeableReference(...)`, with expanded target reference types.
3.  **New Core Elements:**
    *   R6 introduces `ServiceRequest.focus` (`Reference(Any)`) to specify the true subject of the request if not the primary `subject`.
    *   R6 adds `ServiceRequest.bodyStructure` (`Reference(BodyStructure)`) as an alternative to `bodySite`.
4.  **Deprecation:**
    *   `ServiceRequest.specimen` is **deprecated** in R6. Guidance shifts towards `Specimen` resources referencing `ServiceRequest` or using the `specimenSuggestion` extension.
5.  **Data Type and Binding Changes:**
    *   `ServiceRequest.supportingInfo` changes from `Reference(Any)` to `CodeableReference(Any)`.
    *   The `status` value set adds `ended`.
    *   Reference targets for `basedOn`, `requester`, and `performer` have been expanded.
6.  **Search Parameter Refactoring:**
    *   The `code` search parameter is split into `code-concept` and `code-reference`.
    *   New search parameters `body-structure`, `location-code`, and `location-reference` are introduced.
    *   **Critically, the R6 standard search parameter list (as provided) does not include specific parameters for the new consolidated `reason` element.**
7.  **Maturity and Scope:**
    *   The resource maturity level increased from 2 to 4 (still Trial Use).
    *   R6 documentation clarifies integration with `RequestOrchestration` and includes `NutritionOrder` as a potential `basedOn` type.

Implementers must carefully review these changes, plan for data migration for restructured elements, update their application logic to handle new types and structures, and revise API queries.

## 2. Overall Resource Scope and Purpose Evolution

*   **Maturity:** The ServiceRequest resource's maturity level has increased from 2 in R4 to 4 in R6, though its standard status remains "Trial Use." This indicates increased stability and broader review.
*   **Coordination:** R6 documentation explicitly mentions `RequestOrchestration` as a mechanism for coordinating multiple related requests, supplementing the existing `requisition` element.
*   **`specimen` Handling:** The guidance around `ServiceRequest.specimen` has significantly changed. In R6, this element is deprecated. The preferred patterns are for the `Specimen` resource to reference the `ServiceRequest` (via `Specimen.request`) or to use the `specimenSuggestion` extension on `ServiceRequest` for new requests where a specific specimen type is needed.
*   **Expanded `basedOn`:** The `basedOn` element in R6 can now also reference `RequestOrchestration` and `NutritionOrder`, broadening its applicability.
*   **`Group` Compartment:** `Group` has been added to the list of compartments for ServiceRequest in R6.

## 3. Element-Level Changes

This section details modifications to elements, categorized by additions, modifications, and deprecations.

### 3.1. New Elements in R6

The following significant elements have been added in R6:

*   **`ServiceRequest.focus`**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(Any)`
    *   **Short Description/Purpose:** Specifies the actual focus of the service request when it is not the primary `subject` of the record (e.g., a fetus, donor, related condition).
    *   **Key Impact/Action for Implementers:** Allows for more precise representation of the request's target. Systems may need to support this to capture requests not directly about the patient/group/device/location listed in `subject`.

*   **`ServiceRequest.bodyStructure`**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(BodyStructure)`
    *   **Short Description/Purpose:** Anatomic location where the procedure should be performed, referencing a `BodyStructure` resource.
    *   **Key Impact/Action for Implementers:** Provides a more structured way to specify anatomical location than `bodySite` (CodeableConcept). A new constraint `bdystr-1` enforces that `bodySite` and `bodyStructure` are mutually exclusive. A new search parameter `body-structure` is available.

*   **`ServiceRequest.asNeededFor`** (Result of refactoring `asNeeded[x]`)
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/medication-as-needed-reason` (example strength)
    *   **Short Description/Purpose:** Specifies the pre-conditions or criteria for performing the service when `asNeeded` is true or not specified (e.g., "pain", "on flare-up"). This was part of the `asNeeded[x]` choice in R4.
    *   **Key Impact/Action for Implementers:** Data from R4 `asNeededCodeableConcept` should be mapped to this element.

### 3.2. Modified Elements (R4 to R6)

Many existing elements have undergone significant modifications, often involving type changes, structural reorganization, or consolidation. These are often **Breaking Changes**.

*   **`ServiceRequest.code` (Breaking Change)**
    *   **R4 Type:** `CodeableConcept`
    *   **R6 Type:** `CodeableReference(ActivityDefinition | PlanDefinition)`
    *   **Rationale/Impact:** This change allows `ServiceRequest.code` to either be a `CodeableConcept` (as before) or a direct `Reference` to an `ActivityDefinition` or `PlanDefinition`. This enhances the ability to link requests to formal definitions, protocols, or order sets.
        *   **Action:** Data migration is required. Systems must be updated to handle the `CodeableReference` type. Queries on `code` will need to be adapted (see Search Parameter Changes).

*   **`ServiceRequest.orderDetail` (Breaking Change)**
    *   **R4 Type:** `CodeableConcept`, `0..*`
    *   **R6 Type:** BackboneElement, `0..*`, containing:
        *   `parameterFocus`: `0..1`, `CodeableReference(Device | ... | Substance)` - Context of the order details.
        *   `parameter`: `1..*`, BackboneElement, with:
            *   `code`: `1..1`, `CodeableConcept` (Detail/instruction code)
            *   `value[x]`: `1..1`, `Quantity | Ratio | Range | boolean | CodeableConcept | string | Period` (Value for the detail)
    *   **Rationale/Impact:** R4's simple `CodeableConcept` for order details was limited. R6 introduces a rich backbone structure to specify detailed parameters, their values, and optional focus context. This allows for much more granular and structured information about how services are to be delivered.
        *   **Action:** **Significant data migration and application logic changes are required.** R4 `orderDetail` concepts need to be mapped into this new complex structure.

*   **`ServiceRequest.asNeeded[x]` (Refactored into `asNeeded` and `asNeededFor` - Breaking Change)**
    *   **R4 Type:** `asNeeded[x]` (choice of `boolean` or `CodeableConcept`), `0..1`
    *   **R6 Elements:**
        *   `asNeeded`: `boolean`, `0..1` (Indicates service is "as needed")
        *   `asNeededFor`: `CodeableConcept`, `0..*` (Indicates pre-conditions for service)
    *   **Rationale/Impact:** The R4 choice type was split for clarity and to allow multiple pre-conditions.
        *   **Action:** Data from R4 `asNeededBoolean` maps to R6 `asNeeded`. Data from R4 `asNeededCodeableConcept` maps to R6 `asNeededFor`. A new constraint `asn-1` governs the use of `asNeededFor`.

*   **`ServiceRequest.locationCode` & `ServiceRequest.locationReference` (Consolidated - Breaking Change)**
    *   **R4 Elements:**
        *   `locationCode`: `CodeableConcept`, `0..*`
        *   `locationReference`: `Reference(Location)`, `0..*`
    *   **R6 Element:** `location`: `CodeableReference(Location)`, `0..*`
    *   **Rationale/Impact:** These two R4 elements providing location as a code or a reference have been consolidated into a single `CodeableReference` element in R6.
        *   **Action:** Data from `locationCode` and `locationReference` needs to be migrated to the new `location` element. Queries need to be updated (see Search Parameter Changes).

*   **`ServiceRequest.reasonCode` & `ServiceRequest.reasonReference` (Consolidated - Breaking Change)**
    *   **R4 Elements:**
        *   `reasonCode`: `CodeableConcept`, `0..*`
        *   `reasonReference`: `Reference(Condition | Observation | DiagnosticReport | DocumentReference)`, `0..*`
    *   **R6 Element:** `reason`: `CodeableReference(Condition | Observation | DiagnosticReport | DocumentReference | DetectedIssue | Procedure)`, `0..*`
    *   **Rationale/Impact:** Similar to location, these two R4 elements are consolidated. The R6 `reason` element also expands the list of allowed target resource types for the reference part to include `DetectedIssue` and `Procedure`.
        *   **Action:** Data migration is required. Application logic must handle the new `CodeableReference` structure and potentially new target types. **Note:** The standard R6 search parameter list (as provided in the input) does not appear to have specific search parameters for this new consolidated `reason` element.

*   **`ServiceRequest.patientInstruction` (Structure/Type Change - Breaking Change)**
    *   **R4 Type:** `string`, `0..1`
    *   **R6 Type:** BackboneElement (`ServiceRequest.patientInstruction`), `0..*`. This backbone element contains:
        *   `instruction[x]`: `markdown | Reference(DocumentReference)`, `0..1`
    *   **Rationale/Impact:** R6 significantly enhances patient instructions by allowing multiple instruction blocks (via `0..*` on the backbone) and richer content formats (markdown or a reference to a `DocumentReference`) within each block.
        *   **Action:** R4 string-based `patientInstruction` data will need to be migrated, likely into the `instructionMarkdown` choice of the new structure. Systems must support the new backbone structure and markdown/reference types.

*   **`ServiceRequest.status` (Value Set Change)**
    *   **R4 Values (subset):** `draft | active | on-hold | revoked | completed | entered-in-error | unknown`
    *   **R6 Values (subset):** `draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown`
    *   **Key Impact:** The value `ended` has been added to the `request-status` value set in R6.
        *   **Action:** Systems need to be able to process and potentially store this new status code.

*   **`ServiceRequest.intent` (Value Set Change - Minor)**
    *   **R4 Values (subset):** `proposal | plan | directive | order | original-order | reflex-order | filler-order | instance-order | option`
    *   **R6 Values (subset):** `proposal | plan | directive | order +` (The "+" suggests the value set includes more specific types of orders not explicitly listed in the short definition).
    *   **Key Impact:** The specific list of codes in the value set may have minor variations. Implementers should refer to the full R6 value set for `request-intent`.
        *   **Action:** Review any hardcoded logic against the R6 value set.

*   **`ServiceRequest.basedOn` (Reference Targets Expanded)**
    *   **R4 Targets:** `CarePlan | ServiceRequest | MedicationRequest`
    *   **R6 Targets:** `CarePlan | ServiceRequest | MedicationRequest | RequestOrchestration | NutritionOrder`
    *   **Key Impact:** R6 allows `ServiceRequest` to be based on `RequestOrchestration` and `NutritionOrder` resources.
        *   **Action:** Systems may need to update logic to resolve or process these new reference types if they are used.

*   **`ServiceRequest.requester` (Reference Targets Expanded)**
    *   **R4 Targets:** `Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device`
    *   **R6 Targets:** `Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device | Group`
    *   **Key Impact:** R6 adds `Group` as a possible type for the requester.
        *   **Action:** Update reference handling if `Group` requesters are relevant.

*   **`ServiceRequest.performer` (Reference Targets Expanded)**
    *   **R4 Targets:** `Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson`
    *   **R6 Targets:** `Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson | Group`
    *   **Key Impact:** R6 adds `Group` as a possible type for a performer.
        *   **Action:** Update reference handling if `Group` performers are relevant.

*   **`ServiceRequest.supportingInfo` (Type Change)**
    *   **R4 Type:** `Reference(Any)`
    *   **R6 Type:** `CodeableReference(Any)`
    *   **Rationale/Impact:** This change allows `supportingInfo` in R6 to be either a `CodeableConcept` directly or a `Reference` to any resource. R4 only allowed a `Reference`.
        *   **Action:** Systems need to handle the new `CodeableReference` structure for `supportingInfo`, allowing for coded concepts in addition to references.

### 3.3. Deprecated Elements in R6

*   **`ServiceRequest.specimen` (Deprecated)**
    *   **R4 Type:** `Reference(Specimen)`, `0..*`
    *   **R6 Status:** Marked as deprecated (`XD` flag).
    *   **Rationale/Guidance:** The R6 documentation discourages its use. Preferred patterns are for `Specimen.request` to point to the `ServiceRequest`, or to use the `specimenSuggestion` extension on `ServiceRequest` for defining specimen requirements for new collections.
    *   **Key Impact/Action for Implementers:** Plan to migrate away from using `ServiceRequest.specimen`. Evaluate and adopt the recommended alternative patterns for linking specimens to service requests.

### 3.4. Effectively Removed Elements (Due to Refactoring/Consolidation)

While not explicitly "removed" in the sense of disappearing without a trace, the following R4 elements no longer exist in their R4 form and have been replaced by new structures in R6:

*   `ServiceRequest.asNeeded[x]` (choice type): Replaced by `ServiceRequest.asNeeded` (boolean) and `ServiceRequest.asNeededFor` (CodeableConcept).
*   `ServiceRequest.locationCode`: Replaced by the `concept` choice within `ServiceRequest.location` (`CodeableReference`).
*   `ServiceRequest.locationReference`: Replaced by the `reference` choice within `ServiceRequest.location` (`CodeableReference`).
*   `ServiceRequest.reasonCode`: Replaced by the `concept` choice within `ServiceRequest.reason` (`CodeableReference`).
*   `ServiceRequest.reasonReference`: Replaced by the `reference` choice within `ServiceRequest.reason` (`CodeableReference`).

## 4. Constraint Changes

*   **New Constraints in R6:**
    *   **`bdystr-1`:** "bodyStructure SHALL only be present if bodySite is not present."
        *   **Impact:** Enforces mutual exclusivity between `bodySite` (CodeableConcept) and `bodyStructure` (Reference).
    *   **`asn-1`:** "asNeededFor SHALL only be present if asNeeded is empty or true."
        *   **Impact:** `asNeededFor` (reasons/criteria) can only be provided if the service is marked as "as needed" or if the `asNeeded` boolean is not populated (implying it might be as needed based on criteria).

*   **Unchanged Constraints:**
    *   **`prr-1`:** "orderDetail SHALL only be present if code is present."
        *   **Impact:** This constraint remains in R6 and is still relevant.

## 5. Search Parameter Changes

Significant changes have occurred in search parameters due to element restructuring.

*   **`code` (Refactored)**
    *   **R4:** `code` (Type: `token`, Expression: `ServiceRequest.code`)
    *   **R6:** Split into:
        *   `code-concept` (Type: `token`, Expression: `ServiceRequest.code.concept`)
        *   `code-reference` (Type: `reference`, Expression: `ServiceRequest.code.reference`, Targets: `ActivityDefinition`, `PlanDefinition`)
    *   **Impact (Breaking):** Queries using the `code` parameter must be updated. If searching for a coded concept, use `code-concept`. If searching for a reference to a definition, use `code-reference`.

*   **`body-structure` (New in R6)**
    *   **R6 Parameter:** `body-structure` (Type: `reference`, Expression: `ServiceRequest.bodyStructure`, Targets: `BodyStructure`)
    *   **Impact:** New search capability corresponding to the new `bodyStructure` element.

*   **`location-code` & `location-reference` (New in R6, replacing R4's implicit search on separate elements)**
    *   **R6 Parameters:**
        *   `location-code` (Type: `token`, Expression: `ServiceRequest.location.concept`)
        *   `location-reference` (Type: `reference`, Expression: `ServiceRequest.location.reference`, Targets: `Location`)
    *   **Impact (Breaking):** R4 systems might have searched on `locationCode` or `locationReference` elements (if servers supported derived search parameters not explicitly listed). R6 provides explicit search parameters for the consolidated `location` element's `concept` and `reference` parts. Queries need to be adapted.

*   **Search for `reason` (Critical Gap in R6 Standard List)**
    *   **R4:** The R4 input document *assumed* `reason-code` (token) and `reason-reference` (reference) search parameters based on the element structure.
    *   **R6:** The consolidated `ServiceRequest.reason` (`CodeableReference`) element **does not have corresponding specific search parameters (`reason-concept`, `reason-reference`) listed in the provided R6 search parameter definition.**
    *   **Impact:** This is a significant finding. Standardized searching on the `reason` element in R6 may be limited. Implementers will need to check server-specific capabilities (e.g., support for generic `CodeableReference` searching or custom search parameters). This could affect query capabilities for filtering ServiceRequests by reason.

*   **Reference Target Expansions in Search Parameters:**
    *   **`based-on`:** R6 targets now include `RequestOrchestration` and `NutritionOrder`.
        *   Expression: `ServiceRequest.basedOn`
    *   **`performer`:** R6 targets now include `Group`.
        *   Expression: `ServiceRequest.performer`
    *   **`requester`:** R6 targets now include `Group`.
        *   Expression: `ServiceRequest.requester`
    *   **Impact:** Queries using these parameters might return or need to filter for these new target types.

*   **`status` (Value Set Impact)**
    *   The `status` search parameter (Type: `token`, Expression: `ServiceRequest.status`) remains, but queries using it should account for the new `ended` status code from the R6 value set.

*   **`group-or-identifier` (Noted in R6 documentation)**
    *   The R6 documentation mentions a `group-or-identifier` search parameter with expression `ServiceRequest.requisition | ServiceRequest.identifier`.
    *   However, standard `identifier` and `requisition` search parameters are still listed individually.
    *   **Impact:** This may represent a server-specific composite search capability rather than a replacement for the individual `identifier` and `requisition` parameters. Implementers should primarily rely on the standard `identifier` and `requisition` search parameters.

*   **Unchanged Search Parameters (Name and Type):**
    Many search parameters remain largely unchanged in name and type, though their underlying element expressions might have subtle internal path adjustments (e.g., `occurrence`). These include: `authored`, `body-site`, `category`, `encounter`, `identifier`, `instantiates-canonical`, `instantiates-uri`, `intent`, `occurrence`, `patient`, `performer-type`, `priority`, `replaces`, `requester`, `requisition`, `specimen` (though the element is deprecated), `subject`.

## 6. Key Migration Actions & Considerations

1.  **Address Breaking Element Changes (Critical):**
    *   **`code`:** Migrate `CodeableConcept` data to `CodeableReference`. Update logic to handle both concept and reference.
    *   **`orderDetail`:** This requires significant effort. Migrate R4 `CodeableConcept` data into the new R6 backbone structure (`parameterFocus`, `parameter.code`, `parameter.value[x]`). Application logic needs complete rework for this element.
    *   **`asNeeded[x]`:** Split R4 data into R6 `asNeeded` (boolean) and `asNeededFor` (CodeableConcept).
    *   **`locationCode`/`locationReference`:** Consolidate data into the R6 `location` (`CodeableReference(Location)`) element.
    *   **`reasonCode`/`reasonReference`:** Consolidate data into the R6 `reason` (`CodeableReference(...)`) element.
    *   **`patientInstruction`:** Migrate R4 `string` data to the new R6 backbone structure, likely using `instructionMarkdown`. Support multiple instructions and `Reference(DocumentReference)` type.

2.  **Handle `specimen` Deprecation:**
    *   Review usage of `ServiceRequest.specimen`.
    *   Plan to adopt R6-recommended patterns: `Specimen.request` referencing `ServiceRequest`, or the `specimenSuggestion` extension.

3.  **Implement Support for New Elements:**
    *   Evaluate and integrate `ServiceRequest.focus` if applicable to your use cases.
    *   Support `ServiceRequest.bodyStructure` and its interplay with `bodySite` (and the `bdystr-1` constraint).

4.  **Adapt to Type and Value Set Changes:**
    *   Update logic for `ServiceRequest.supportingInfo` to handle `CodeableReference(Any)`.
    *   Ensure the new `ended` status in `ServiceRequest.status` is recognized.
    *   Review `intent` value set if specific codes are critical.
    *   Expand handling for reference targets in `basedOn`, `requester`, and `performer` to include new R6 types (`RequestOrchestration`, `NutritionOrder`, `Group`).

5.  **Update Validation Logic:**
    *   Implement new R6 constraints: `bdystr-1` and `asn-1`.
    *   Ensure `prr-1` is still enforced.

6.  **Revise API Queries (Critical):**
    *   Modify queries for `code`: use `code-concept` or `code-reference` as appropriate.
    *   Utilize new search parameters: `body-structure`, `location-code`, `location-reference`.
    *   **Investigate server capabilities for searching the consolidated `reason` element, as standard R6 parameters are not explicitly defined for it.** This is a potential gap.
    *   Adapt queries for `based-on`, `performer`, `requester` if new target types are relevant.
    *   Adjust queries using the `status` parameter to account for the `ended` value.

7.  **Test Thoroughly:** Given the extent of these changes, comprehensive testing of data migration, application logic, and API interactions is crucial.
8.  **Review R6 Resource Scope:** Consider if the clarified role with `RequestOrchestration` or expanded `basedOn` types impacts your system's integration points or workflows.