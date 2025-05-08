# FHIR Specimen Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Specimen resource between R4 and R6, focusing on aspects critical for implementers. It aims to provide a clear, actionable guide for migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Specimen resource from R4 to R6 involves several important changes, primarily focused on enhancing search capabilities, standardizing element definitions, and introducing new features for describing specimen characteristics and context.

1.  **New Descriptive Elements:** R6 formally introduces `Specimen.combined`, `Specimen.role`, and the `Specimen.feature` backbone element (with `type` and `description`). These elements, previously noted as R5 candidates in some R4 documentation builds, are now standard, allowing for richer descriptions of specimen grouping, purpose, and physical characteristics.
2.  **Search Parameter Overhaul (Breaking Changes):**
    *   **`bodysite` Search Parameter:** Changed from type `token` in R4 to `reference` in R6, now targeting `BodyStructure` resources. This requires query updates.
    *   **Container Search:** R4's `container` (token) and `container-id` (token) search parameters are **removed**. They are replaced by the new R6 `container-device` (reference) search parameter, targeting the `Device` resource representing the container.
3.  **New Search Parameters:** R6 adds several new reference-based search parameters, significantly expanding query capabilities:
    *   `container-location` (targets `Location` via `Device.location`)
    *   `organization` (targets `Organization` via `Device.owner`)
    *   `procedure` (targets `Procedure` via `Specimen.collection.procedure`)
    *   `request` (targets `ServiceRequest` via `Specimen.request`)
4.  **Maturity Level Increased:** The Specimen resource's maturity level has increased from 2 to 3, though it remains in "Trial Use" status. This generally indicates increased stability and implementation experience.
5.  **Minor Binding and Expression Clarifications:**
    *   The binding strength for `Specimen.collection.device` has changed from `unbound` (R4) to `example` (R6).
    *   The FHIRPath expression for the `collected` search parameter has been clarified for choice types.
    *   Value set URIs for some elements (e.g., `Specimen.status`) no longer include explicit version suffixes (e.g., `|4.0.1`).

Implementers should anticipate data model updates to support new elements and a significant effort to revise queries due to the search parameter changes, especially for `bodysite` and container-related searches.

## 2. Overall Resource Scope and Purpose

*   **Maturity and Stability:** The Specimen resource's maturity level increased from 2 (R4) to 3 (R6), both under "Trial Use" status. This progression suggests a more stable and refined definition based on implementation feedback.
*   **Core Purpose Unchanged:** The fundamental purpose of Specimen—to represent a material sample for testing, analysis, or investigation, detailing its collection, processing, and origin—remains consistent.
*   **Enhanced Grouping and Context:** R6 provides more explicit support for describing specimen grouping (via `Specimen.combined` or `Specimen.subject` referencing `Group`) and richer contextual information (e.g., `Specimen.role`, `Specimen.feature`).
*   **Container Detail Limitation:** Both R4 and R6 acknowledge that the model does not fully address complex recursive container hierarchies (e.g., tube in tray in rack) or detailed intra-container location tracking, which might require extensions for specific use cases like bio-banking.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements are formally introduced in R6. While some R4 documentation builds may have noted these as future (R5) additions, they were not part of the standard R4 Specimen resource.

*   **`Specimen.combined` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `code`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/specimen-combined` (strength: `required`)
    *   **Short Description/Purpose:** Signifies if the specimen is part of a group or is pooled (values: `grouped` | `pooled`).
    *   **Key Impact/Action for Implementers:** Support this new element if specimen pooling or grouping status needs to be captured directly on the specimen.

*   **`Specimen.role` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/specimen-role` (strength: `preferred`)
    *   **Short Description/Purpose:** Describes the role or reason for the specimen in the testing workflow.
    *   **Key Impact/Action for Implementers:** Allows for more detailed classification of a specimen's purpose within a workflow.

*   **`Specimen.feature` (New BackboneElement)**
    *   **Cardinality:** `0..*`
    *   **Short Description/Purpose:** Describes a physical feature or landmark on a specimen.
    *   **Contains:**
        *   `Specimen.feature.type` (`1..1`, `CodeableConcept`): The landmark or feature being highlighted (e.g., resection margin). Bound to `http://hl7.org/fhir/ValueSet/body-site` (example).
        *   `Specimen.feature.description` (`1..1`, `string`): Textual description of the feature.
    *   **Key Impact/Action for Implementers:** Implement this structure if detailed physical features of specimens need to be recorded, particularly relevant in pathology or surgical contexts.

### 3.2. Modified Elements (R4 to R6)

*   **`Specimen.status` (Value Set URI)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/specimen-status|4.0.1` (strength: `required`)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/specimen-status` (strength: `required`)
    *   **Key Impact/Action:** The explicit version `|4.0.1` has been removed from the value set URI. This is a common refinement in FHIR versions. Systems should ensure they can resolve the unversioned canonical URL. Functionally, this is unlikely to cause issues unless systems were hardcoded to the specific versioned URL and cannot handle the base canonical.

*   **`Specimen.collection.device` (Binding Strength)**
    *   **R4 Type:** `CodeableReference(Device)`
    *   **R4 Binding:** Strength `unbound` (R4 documentation also mentioned a placeholder ValueSet name).
    *   **R6 Type:** `CodeableReference(Device)`
    *   **R6 Binding:** Strength `example` (no specific ValueSet defined).
    *   **Key Impact/Action:** The binding strength has changed from `unbound` to `example`. While still not a strong requirement to use a specific value set, `example` suggests a greater expectation that a relevant value set *could* be used if available. Implementers should be aware of this subtle shift in expectation.

*   **Other Elements:** Most other core elements like `identifier`, `accessionIdentifier`, `type`, `subject`, `receivedTime`, `parent`, `request`, `collection.collector`, `collection.collected[x]`, `collection.bodySite`, `processing` substructures, `container` substructure, `condition`, and `note` remain largely unchanged in terms of their type, cardinality, and core meaning between R4 and R6 as presented in the provided documents. Minor textual clarifications in descriptions may exist but do not alter their fundamental use.

### 3.3. Removed Elements from R4

*   No top-level elements have been removed from the R4 Specimen definition when comparing to R6. The elements `combined`, `role`, and `feature` were not standard R4 elements and are thus treated as new in R6.

## 4. Constraint Changes

*   **`spm-1` (Expression Path Adjusted)**
    *   **R4 Definition:**
        *   Severity: Rule
        *   Location: `Specimen.collection`
        *   Description: `Specimen.collection.collector SHALL only be present if Specimen.collection.procedure is not present`
        *   Expression: `collector.empty() or procedure.empty()`
    *   **R6 Definition:**
        *   Severity: rule
        *   Location: `Specimen` (applies to `collection` backbone)
        *   Description: `Specimen.collection.collector SHALL only be present if Specimen.collection.procedure is not present`
        *   Expression: `collection.collector.empty() or collection.procedure.empty()`
    *   **Key Impact/Action:** The constraint's logic and intent remain identical. The FHIRPath expression in R6 is slightly different (`collection.collector` vs. `collector`) because the constraint in R6 is formally defined at the resource root level, requiring navigation into the `collection` backbone element within the expression. Implementers' validation logic should reflect the R6 expression path if validating R6 resources.

## 5. Search Parameter Changes

Search parameters have undergone significant revisions, including breaking changes.

### 5.1. Modified Search Parameters

*   **`bodysite` (Type and Expression Change - Breaking Change)**
    *   **R4:**
        *   Type: `token`
        *   Expression: `Specimen.collection.bodySite` (intended to search the coded concept)
    *   **R6:**
        *   Type: `reference`
        *   Expression: `Specimen.collection.bodySite.reference`
        *   Targets: `BodyStructure`
    *   **Key Impact/Action:** **Breaking Change.** Queries for `bodysite` must be updated. In R4, this searched for a token (code) from the `CodeableConcept` part of `Specimen.collection.bodySite` (which is a `CodeableReference`). In R6, it explicitly searches the `reference` part, targeting `BodyStructure` instances. This aligns the search with the `CodeableReference` structure, allowing searches for specific `BodyStructure` resource instances.

*   **`collected` (Expression Clarification)**
    *   **R4:**
        *   Type: `date`
        *   Expression: `Specimen.collection.collected`
    *   **R6:**
        *   Type: `date`
        *   Expression: `Specimen.collection.collected.ofType(dateTime) | Specimen.collection.collected.ofType(Period)`
    *   **Key Impact/Action:** The R6 expression is more explicit in handling the choice type (`dateTime` or `Period`). This is generally a non-breaking clarification for implementers, as conformant servers should have already handled the choice type correctly. It provides better guidance for implementing the search parameter.

### 5.2. Removed Search Parameters from R4

*   **`container` (Removed - Breaking Change)**
    *   **R4 Type:** `token`
    *   **R4 Expression (likely intended):** `Specimen.container.device.type` (searching the type of the device representing the container)
    *   **Key Impact/Action:** **Breaking Change.** This search parameter is removed in R6. Queries using it will fail. Functionality is superseded by `container-device`.

*   **`container-id` (Removed - Breaking Change)**
    *   **R4 Type:** `token`
    *   **R4 Expression (likely intended):** `Specimen.container.device.identifier` (searching an identifier of the device representing the container)
    *   **Key Impact/Action:** **Breaking Change.** This search parameter is removed in R6. Queries using it will fail. Functionality is superseded by `container-device`.

### 5.3. New Search Parameters in R6

*   **`container-device` (New - Replaces R4 `container` and `container-id`)**
    *   **Type:** `reference`
    *   **Expression:** `Specimen.container.device.where(resolve() is Device)`
    *   **Targets:** `Device`
    *   **Key Impact/Action:** This new parameter allows searching for specimens based on a reference to the `Device` resource representing their container. Implementers must migrate R4 queries that used `container` or `container-id` to use this new reference-based search parameter.

*   **`container-location` (New)**
    *   **Type:** `reference`
    *   **Expression:** `Specimen.container.device.resolve().location`
    *   **Targets:** `Location`
    *   **Key Impact/Action:** Adds a new capability to search for specimens based on the location of their container device (via `Device.location`).

*   **`organization` (New)**
    *   **Type:** `reference`
    *   **Expression:** `Specimen.container.device.resolve().owner`
    *   **Targets:** `Organization`
    *   **Key Impact/Action:** Adds a new capability to search for specimens based on the owning organization of their container device (via `Device.owner`). This assumes `Device.owner` resolves to an `Organization`.

*   **`procedure` (New)**
    *   **Type:** `reference`
    *   **Expression:** `Specimen.collection.procedure`
    *   **Targets:** `Procedure`
    *   **Key Impact/Action:** Adds a new capability to search for specimens based on the `Procedure` resource linked to their collection.

*   **`request` (New)**
    *   **Type:** `reference`
    *   **Expression:** `Specimen.request`
    *   **Targets:** `ServiceRequest`
    *   **Key Impact/Action:** Adds a new capability to search for specimens based on the `ServiceRequest(s)` they are associated with.

### 5.4. Unchanged Search Parameters

Search parameters like `accession`, `collector`, `identifier`, `parent`, `patient`, `status`, `subject`, and `type` remain largely consistent in their definition and purpose between R4 and R6.

## 6. Key Migration Actions & Considerations

1.  **Adopt New Elements:**
    *   Review and implement support for `Specimen.combined`, `Specimen.role`, and `Specimen.feature` (including `feature.type` and `feature.description`) if these new descriptive capabilities are relevant to your use cases. This may require database schema changes and UI updates.

2.  **Update Search Queries (Critical - Breaking Changes):**
    *   **`bodysite`:** Modify queries from token-based to reference-based searches, targeting `BodyStructure` resources.
    *   **Container Searches:** Discontinue use of R4 `container` and `container-id` search parameters. Migrate these queries to use the new R6 `container-device` (reference) parameter, targeting `Device` resources.

3.  **Utilize New Search Capabilities:**
    *   Evaluate and leverage the new search parameters (`container-location`, `organization`, `procedure`, `request`) to enhance querying capabilities as needed.

4.  **Handle Binding Changes:**
    *   Note the change in binding strength for `Specimen.collection.device` from `unbound` to `example`.
    *   Ensure systems correctly handle canonical value set URIs without version suffixes (e.g., for `Specimen.status`).

5.  **Adjust Constraint Validation:**
    *   Verify that validation logic for constraint `spm-1` uses the R6 FHIRPath expression (`collection.collector.empty() or collection.procedure.empty()`) when processing R6 resources.

6.  **Acknowledge Maturity Level:** Be aware of the resource's increased maturity level (3, Trial Use), which suggests greater stability.

7.  **Data Migration:**
    *   If data corresponding to the new elements (`combined`, `role`, `feature`) exists in proprietary extensions or external systems, plan for migration into these new standard R6 elements.
    *   No direct data migration is mandated for existing R4 elements solely due to R6 changes, other than accommodating the new elements if desired.

By addressing these changes, implementers can successfully migrate their systems to support FHIR R6 Specimen resources or ensure compatibility when interacting with systems using either R4 or R6. The most significant effort will likely be in updating search logic due to the revised and new search parameters.