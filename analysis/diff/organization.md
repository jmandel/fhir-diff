# FHIR Organization Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Organization resource between R4 and R6, focusing on aspects critical for implementers. It aims to aid in migration efforts and in supporting systems that must handle both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Organization resource from R4 to R6 introduces several substantial changes that implementers must address:

1.  **Restructuring of Contact Information (Breaking Change):**
    *   The top-level `Organization.telecom` and `Organization.address` elements from R4 have been **removed**.
    *   All contact details (telecom, address, etc.) are now consolidated within the `Organization.contact` element.
    *   The `Organization.contact` element itself has changed type from a custom R4 BackboneElement to the standard `ExtendedContactDetail` data type in R6.
    *   This requires significant data migration: R4 top-level `telecom` and `address` data, as well as data from R4's `Organization.contact` structure, must be mapped into R6 `Organization.contact` list items of type `ExtendedContactDetail`.

2.  **New `qualification` Backbone Element:**
    *   R6 introduces `Organization.qualification` (`0..*`), a backbone element for capturing certifications, accreditations, licenses, and other formal qualifications of the organization. This is a major functional addition.

3.  **New `description` Element:**
    *   A new `Organization.description` element (type `markdown`, `0..1`) has been added in R6 to provide more extensive, human-readable context about the organization.

4.  **Search Parameter Expression Updates:**
    *   Search parameters related to addresses (e.g., `address`, `address-city`, `address-postalcode`) have had their FHIRPath expressions updated to target `Organization.contact.address` due to the contact information restructure.
    *   The `identifier` search parameter now also searches `Organization.qualification.identifier`.
    *   Queries relying on the old paths for address details will need to be updated.

5.  **Constraint Modifications:**
    *   Constraints prohibiting the use of 'home' for addresses and telecom details (`org-2`, `org-3` in R4) have been updated to apply to the new `Organization.contact` structure (`org-3`, `org-4` in R6).

6.  **Increased Maturity Level:**
    *   The Organization resource's maturity level has increased from 3 (Trial Use, some normative content) in R4 to 5 (Normative) in R6, indicating greater stability and broader adoption.

Implementers should anticipate data model changes, data migration tasks, and updates to API query logic.

## 2. Overall Resource Scope and Purpose

*   **Core Purpose Unchanged:** The fundamental purpose of the Organization resource—to represent a formally or informally recognized grouping of people or organizations formed for achieving collective action—remains consistent.
*   **Enhanced Context in R6:** The R6 documentation provides more explicit guidance on the relationship between `Organization`, `HealthcareService`, `Location`, and the newer `OrganizationAffiliation` resource (for complex, non-hierarchical relationships). This offers a clearer picture of how Organization fits into the broader FHIR ecosystem for representing healthcare entities and their services.
*   **Expanded Capabilities:** The addition of the `qualification` element in R6 significantly broadens the resource's scope, allowing it to formally describe an organization's accreditations, certifications, and licenses.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6:

*   **`Organization.description` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `markdown`
    *   **Short Description/Purpose:** "Additional details about the Organization that could be displayed as further information to identify the Organization beyond its name."
    *   **Key Impact/Action for Implementers:** This new optional element allows for richer, formatted descriptive text. Systems displaying organization details can leverage this. Data migration is not strictly required unless existing systems have stored similar descriptive information in extensions.

*   **`Organization.qualification` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** BackboneElement, containing:
        *   `identifier`: `Identifier` (`0..*`) - Identifier for this qualification for the organization.
        *   `code`: `CodeableConcept` (`1..1`) - Coded representation of the qualification. (Binding: `Qualification` - example strength).
        *   `status`: `CodeableConcept` (`0..1`) - Status/progress of the qualification (e.g., active, pending, expired). (Binding: `http://hl7.org/fhir/ValueSet/qualification-status` - preferred strength).
        *   `period`: `Period` (`0..1`) - Period during which the qualification is valid.
        *   `issuer`: `Reference(Organization)` (`0..1`) - Organization that regulates and issues the qualification.
    *   **Short Description/Purpose:** "Qualifications, certifications, accreditations, licenses, training, etc. pertaining to the provision of care."
    *   **Key Impact/Action for Implementers:** This is a significant addition for systems needing to track organizational credentials. Implementers will need to support this new backbone element if this functionality is relevant. The `identifier` search parameter has been updated to include `Organization.qualification.identifier`.

### 3.2. Modified Elements (R4 to R6)

The most significant modification involves the handling of contact information:

*   **`Organization.contact` (Modified - Type Change and Consolidation Point)**
    *   **R4 Type:** `BackboneElement` (`0..*`), with sub-elements:
        *   `purpose`: `CodeableConcept`
        *   `name`: `HumanName`
        *   `telecom`: `ContactPoint` (`0..*`)
        *   `address`: `Address` (`0..1`)
    *   **R6 Type:** `ExtendedContactDetail` (Data Type) (`0..*`)
    *   **Short Description R6:** "Official contact details for the Organization."
    *   **Rationale / Key Impact:** This is a **Breaking Change** due to the type change and its role as the new single container for all organizational contact points.
        *   The R4 `Organization.contact` sub-elements (`purpose`, `name`, `telecom`, `address`) will map to corresponding fields within the `ExtendedContactDetail` data type in R6.
        *   More importantly, the data previously stored in the R4 top-level `Organization.telecom` and `Organization.address` elements **must now be migrated** into new instances of `Organization.contact` (each being an `ExtendedContactDetail`). Each R4 top-level address or telecom entry will become a distinct item in the R6 `Organization.contact` list.
        *   For example, an R4 `Organization.address` would become an R6 `Organization.contact` entry where the `ExtendedContactDetail.address` field is populated. A purpose may need to be assigned or inferred for these migrated contact details.
    *   **Action:**
        1.  Update systems to use the `ExtendedContactDetail` data type for `Organization.contact`.
        2.  Migrate data from R4 `Organization.telecom` (root), `Organization.address` (root), and existing R4 `Organization.contact` entries into the R6 `Organization.contact` list of `ExtendedContactDetail`.
        3.  Update UI and processing logic to reflect this consolidated structure.

*   **`Organization.active` (Minor Textual Change)**
    *   The `modifierReason` text was slightly updated for clarity, but the core meaning and `isModifier=true` status remain. No direct implementer action is typically required for this specific text change.

*   **`Organization.identifier` and `Organization.name` (Metadata Flag Added)**
    *   These elements gained a `C` (Conditional) flag in R6, alongside the existing `Σ` (Summary) flag. This indicates that specific profiles might impose conditional rules on these elements. For base resource migration, this has no immediate impact on cardinality or type.

### 3.3. Removed Elements from R4

These removals are part of the contact information restructuring and represent **Breaking Changes**:

*   **`Organization.telecom` (Removed from Root)**
    *   **R4 Type:** `ContactPoint`, `0..*` (Top-level element)
    *   **Rationale / Key Impact:** This element has been removed from the root of the Organization resource. Its data must be migrated into the `Organization.contact` list, where each telecom entry will populate the `telecom` field of an `ExtendedContactDetail` instance.
    *   **Action:** **Breaking Change.** Migrate data to `Organization.contact` (as `ExtendedContactDetail.telecom`). Update data access logic.

*   **`Organization.address` (Removed from Root)**
    *   **R4 Type:** `Address`, `0..*` (Top-level element)
    *   **Rationale / Key Impact:** This element has been removed from the root. Its data must be migrated into the `Organization.contact` list, where each address entry will populate the `address` field of an `ExtendedContactDetail` instance.
    *   **Action:** **Breaking Change.** Migrate data to `Organization.contact` (as `ExtendedContactDetail.address`). Update data access logic.

## 4. Constraint Changes

*   **`org-1` (No Effective Change):**
    *   **R4 & R6:** "The organization SHALL at least have a name or an identifier..."
    *   Expression: `(identifier.count() + name.count()) > 0`
    *   **Impact:** This core validation rule remains. The location specified in R6 is `Organization` vs `(base)` in R4, which is a minor representational difference.

*   **`org-2` (Removed in R6):**
    *   **R4:** "An address of an organization can never be of use 'home'" (`Organization.address.where(use = 'home').empty()`).
    *   **Impact:** This constraint is removed because `Organization.address` at the root level is removed. Its intent is now covered by `org-4` in R6.

*   **`org-3` (R4 - Removed; R6 - New Expression):**
    *   **R4 `org-3`:** "The telecom of an organization can never be of use 'home'" (`Organization.telecom.where(use = 'home').empty()`).
    *   **Impact (R4):** Removed as `Organization.telecom` at the root is removed.
    *   **R6 `org-3` (New expression for a similar concept):** "The telecom of an organization can never be of use 'home'" (`Organization.contact.telecom.where(use = 'home').empty()`).
    *   **Impact (R6):** This new constraint applies the "no home use" rule to telecom details *within* the `Organization.contact` (specifically, `ExtendedContactDetail.telecom`).

*   **`org-4` (New in R6):**
    *   **R6:** "The address of an organization can never be of use 'home'" (`Organization.contact.address.where(use = 'home').empty()`).
    *   **Impact:** This new constraint applies the "no home use" rule to address details *within* the `Organization.contact` (specifically, `ExtendedContactDetail.address`). This, along with R6 `org-3`, replaces the functionality of R4 `org-2` and R4 `org-3`.

## 5. Search Parameter Changes

*   **Address-related Search Parameters (Modified Expressions):**
    *   Due to the removal of `Organization.address` and consolidation into `Organization.contact`, the expressions for all address-specific search parameters have changed:
        *   **`address`**: R4: `Organization.address` -> R6: `Organization.contact.address`
        *   **`address-city`**: R4: `Organization.address.city` -> R6: `Organization.contact.address.city`
        *   **`address-country`**: R4: `Organization.address.country` -> R6: `Organization.contact.address.country`
        *   **`address-postalcode`**: R4: `Organization.address.postalCode` -> R6: `Organization.contact.address.postalCode`
        *   **`address-state`**: R4: `Organization.address.state` -> R6: `Organization.contact.address.state`
        *   **`address-use`**: R4: `Organization.address.use` -> R6: `Organization.contact.address.use`
    *   **Key Impact/Action for Implementers:** API queries using these search parameters must be updated to work with the new structure. Servers will need to implement these search parameters against the new FHIRPath expressions.

*   **`identifier` (Modified Expression):**
    *   **R4 Expression:** `Organization.identifier`
    *   **R6 Expression:** `Organization.identifier | Organization.qualification.identifier`
    *   **Key Impact/Action for Implementers:** The `identifier` search parameter in R6 now also searches identifiers within the new `qualification` backbone element. This expands the scope of this search.

*   **Unchanged Search Parameters:**
    *   `active` (Expression: `Organization.active`)
    *   `endpoint` (Expression: `Organization.endpoint`)
    *   `name` (Expression: `Organization.name | Organization.alias`)
    *   `partof` (Expression: `Organization.partOf`)
    *   `phonetic` (Expression: `Organization.name`)
    *   `type` (Expression: `Organization.type`)
    *   These parameters remain functionally the same.

## 6. Key Migration Actions & Considerations

1.  **Contact Information Data Migration (Critical - Breaking Change):**
    *   Develop a strategy to migrate data from R4 `Organization.telecom` (root) and `Organization.address` (root) into the R6 `Organization.contact` list as `ExtendedContactDetail` instances.
    *   Migrate existing R4 `Organization.contact` backbone elements to R6 `Organization.contact` elements of type `ExtendedContactDetail`.
    *   Ensure appropriate `purpose` values are assigned or inferred for migrated contact details within `ExtendedContactDetail`.

2.  **Adopt `ExtendedContactDetail` Type:**
    *   Update system logic, data models, and UI components to handle `Organization.contact` as a list of `ExtendedContactDetail` data types.

3.  **Implement New Elements:**
    *   Evaluate and implement support for the new `Organization.description` (markdown) element if richer descriptions are desired.
    *   Evaluate and implement support for the new `Organization.qualification` backbone element if tracking organizational certifications and licenses is required.

4.  **Update API Queries:**
    *   Modify all API queries that use address-related search parameters (`address`, `address-city`, etc.) to align with their new R6 expressions targeting `Organization.contact.address`.
    *   Be aware that `identifier` searches in R6 will also check `qualification.identifier`.

5.  **Revise Validation Logic:**
    *   Remove validation logic for R4 constraints `org-2` and `org-3` (related to 'home' use on root `address`/`telecom`).
    *   Implement validation for new R6 constraints `org-3` and `org-4` (related to 'home' use on `contact.telecom` and `contact.address`).

6.  **Review Scope Clarifications:**
    *   Consider the R6 clarifications regarding `OrganizationAffiliation` and the roles of `Organization`, `HealthcareService`, and `Location` if these distinctions are relevant to your system's domain model.

7.  **Acknowledge Maturity Increase:**
    *   The change in maturity level to 5 (Normative) signals increased stability and encourages adoption, potentially impacting decisions for new implementations or upgrades.