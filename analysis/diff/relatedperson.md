# FHIR RelatedPerson Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR RelatedPerson resource between versions R4 and R6, focusing on aspects critical for implementers. It aims to be clear, actionable, and precise to aid in migration and system adaptation when moving from R4 or supporting both R4 and R6 versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the RelatedPerson resource from R4 to R6 involves several crucial changes:

1.  **Splitting of `relationship` Concept (Breaking Change):**
    *   In R4, the `RelatedPerson.relationship` element (type `CodeableConcept`) handled both personal relationships (e.g., mother, sibling) and functional roles (e.g., emergency contact, guardian).
    *   In R6, this has been split:
        *   `RelatedPerson.relationship` is now **strictly for personal relationships**, with its binding changed to `http://terminology.hl7.org/ValueSet/v3-PersonalRelationshipRoleType`.
        *   A **new element `RelatedPerson.role`** (type `CodeableConcept`) has been introduced to capture **functional roles**, using the value set previously associated with R4's `relationship` (`http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype`).
    *   **Impact:** This is a **Breaking Change** requiring significant data model updates and data migration. Systems must differentiate and correctly populate these two distinct elements.

2.  **`communication.language` Binding Change:**
    *   The value set binding for `RelatedPerson.communication.language` has changed from `http://hl7.org/fhir/ValueSet/languages` (Common Languages, Preferred strength) in R4 to `http://hl7.org/fhir/ValueSet/all-languages` (**Required strength**) in R6.
    *   **Impact:** Systems must now ensure that language codes conform to the broader `all-languages` value set, and this is a `Required` binding, meaning codes *must* come from this set if a code is provided.

3.  **Resource Maturity and Scope Clarification:**
    *   The RelatedPerson resource's **maturity level has advanced from 2 (Trial Use) in R4 to 5 (typically Normative) in R6**, indicating greater stability. (Note: The R6 `standard_status` is still listed as Trial Use in the provided document, which is unusual for maturity 5, but the maturity level itself is a key indicator).
    *   The R6 documentation provides more explicit guidance on its relationship with `Patient.link` (for when a RelatedPerson is also a patient) and distinguishes it from the `PersonalRelationship` resource (introduced in later FHIR versions).

4.  **New Search Parameters:**
    *   R6 introduces new search parameters:
        *   `family` (on `RelatedPerson.name.family`)
        *   `given` (on `RelatedPerson.name.given`)
        *   `role` (on the new `RelatedPerson.role` element)
    *   **Impact:** Enhanced querying capabilities, especially for names and the new functional roles.

5.  **Guidance Updates:**
    *   R6 includes more detailed comments and descriptions for elements like `identifier` and `telecom` regarding user identities and references to security/privacy considerations.

Implementers should prioritize understanding the `relationship`/`role` split and updating their data and logic accordingly. The `communication.language` binding change also requires careful review.

## 2. Overall Resource Scope and Purpose

*   **Core Purpose Unchanged:** The fundamental purpose of RelatedPerson remains to describe individuals involved in a patient's care or health who are not the primary healthcare target.
*   **R4 Scope:** Focused on personal or non-healthcare-specific professional relationships. The `relationship` element combined personal ties and functional roles.
*   **R6 Scope and Clarifications:**
    *   The distinction between personal relationships and functional roles is now explicit with dedicated elements (`relationship` and `role` respectively).
    *   The R6 documentation provides enhanced "Background and Scope" information, including:
        *   Guidance on using `Patient.link` when a RelatedPerson is also a Patient in the system.
        *   Clarification of how RelatedPerson differs from the `PersonalRelationship` resource (which describes a relationship but cannot be an actor, unlike RelatedPerson).
    *   The resource's **maturity level has increased from 2 in R4 to 5 in R6**. Maturity level 5 typically indicates a Normative resource, suggesting a high degree of stability and consensus on its definition, though the provided R6 document notes `standard_status: Trial Use`.

*   **Impact:** The clearer separation of relationship types in R6 provides a more precise data model. The increased maturity level suggests implementers can expect fewer breaking changes to the core structure in future FHIR versions.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The primary new element in R6 is:

*   **`RelatedPerson.role` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Short Description/Purpose:** "The functional role of the related person to the patient." This element is intended to capture roles like 'Emergency Contact', 'Guardian', 'Power of Attorney', etc.
    *   **Binding:** `http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype` (Preferred strength)
        *   *Note: This is the same value set that was bound to `RelatedPerson.relationship` in R4, which previously covered both personal and functional aspects.*
    *   **Comments:** "This property is for functional relationships. Personal relationships are represented in RelatedPerson.relationship."
    *   **Key Impact/Action for Implementers:** This is a **critical part of a Breaking Change** alongside the modification of `RelatedPerson.relationship`.
        *   Systems must now use this element for functional roles that might have been previously stored in `RelatedPerson.relationship` in R4.
        *   Data migration is required to identify functional roles from R4 `relationship` data and move them to this new `role` element.
        *   A new search parameter `role` targets this element.

### 3.2. Modified Elements (R4 to R6)

Several existing elements have undergone significant modification:

*   **`RelatedPerson.relationship` (Modified - Conceptual Break)**
    *   **R4 Definition:**
        *   Short: "The nature of the relationship"
        *   Description: "The nature of the relationship between a patient and the related person."
        *   Binding: `http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype` (Preferred)
        *   R4 Comments: Indicated it covered both personal relationships (e.g., 'father') and roles (e.g., 'Emergency Contact').
    *   **R6 Definition:**
        *   Short: "The personal relationship of the related person to the patient"
        *   Description: "The nature of the **personal relationship** between the related person and the patient. The directionality of the relationship is from the RelatedPerson to the Patient. For example, if the Patient is a child, and the RelatedPerson is the mother, the relationship would be PRN (parent) or MTH (mother)."
        *   Binding: `http://terminology.hl7.org/ValueSet/v3-PersonalRelationshipRoleType` (Preferred strength)
        *   R6 Comments: "This property is for personal relationships. Functional relationships are represented in RelatedPerson.role."
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The scope of `relationship` has been narrowed exclusively to personal ties. The binding has changed to a value set more specific to personal relationships.
        *   **Action:** Data previously stored in R4 `relationship` that represented functional roles MUST be migrated to the new `RelatedPerson.role` element in R6. Data representing personal relationships will remain in `RelatedPerson.relationship` but may need re-coding if the new value set (`v3-PersonalRelationshipRoleType`) is enforced or preferred. Implementers must update their logic to distinguish between these two elements. The `relationship` search parameter now only targets these personal relationships.

*   **`RelatedPerson.communication.language` (Modified - Binding)**
    *   **R4 Binding:**
        *   `valueSet`: `http://hl7.org/fhir/ValueSet/languages` (Common Languages)
        *   `strength`: `Preferred` (with a comment "but limited to AllLanguages")
    *   **R6 Binding:**
        *   `valueSet`: `http://hl7.org/fhir/ValueSet/all-languages`
        *   `strength`: `Required`
        *   R6 description also includes more diverse examples (e.g., sign languages).
    *   **Rationale / Key Impact:** The binding has been changed to the more comprehensive `all-languages` value set, and critically, its strength has been upgraded to `Required`.
        *   **Action:** Systems must ensure that any coded language in `RelatedPerson.communication.language` is a valid code from the `http://hl7.org/fhir/ValueSet/all-languages` value set. This is a stricter requirement than R4. Existing data should be validated and potentially re-mapped.

*   **`RelatedPerson.identifier` (Modified - Guidance)**
    *   **R4 Description:** "Identifier for a person within a particular scope."
    *   **R6 Description:** Adds: "...Systems MAY use identifier for user identities (using the type='USER'). Refer to the Security and Privacy section for additional guidance on representing user identities."
    *   **Key Impact/Action for Implementers:** While not a structural change, this added guidance is important for systems handling user authentication or linking RelatedPerson to user accounts. Implementers should review the referenced Security and Privacy guidance if applicable.

*   **`RelatedPerson.telecom` (Modified - Guidance)**
    *   **R4 Description:** Standard description.
    *   **R6 Description:** Adds: "...RelatedPerson may have multiple ways to be contacted with different uses or applicable periods. May need to have options for contacting the person urgently and also to help with identification."
    *   **R6 Comments:** Adds: "DO NOT use .telecom properties to represent user identities. Refer to the Security and Privacy section for additional guidance on representing user identities."
    *   **Key Impact/Action for Implementers:** Enhanced descriptive text and explicit guidance against using telecom for user identities.

*   **`RelatedPerson.active` (Modified - Minor Clarification)**
    *   **R6 Description:** Adds a clarification that `active` "may be used to mark that the resource was created in error."
    *   **Key Impact/Action for Implementers:** Minor clarification, no structural or major behavioral change.

*   **`RelatedPerson.period` (Modified - Comment)**
    *   **R6 Comments:** Adds a concrete example: "...For example, if a person is a roommate for a period of time, moves out, and is later a roommate with the same person again, you would have two RelatedPerson instances."
    *   **Key Impact/Action for Implementers:** Enhanced clarity in comments, no structural change.

*   **`RelatedPerson.communication` (Backbone Element - Comment)**
    *   **R6 Comments:** Adds guidance: "If you need to convey proficiency for multiple modes, then you need multiple RelatedPerson.Communication associations. If the RelatedPerson does not speak the default local language, then the Interpreter Required Standard can be used to explicitly declare that an interpreter is required."
    *   **Key Impact/Action for Implementers:** Useful guidance for representing complex communication needs, no structural change to the element itself.

### 3.3. Removed Elements from R4

No elements have been directly removed from R4. However, the *concept* previously embodied by R4's `RelatedPerson.relationship` (covering both personal and functional ties) has been significantly refactored into two distinct elements in R6 (`relationship` for personal, `role` for functional).

## 4. Constraint Changes

*   **R4:** No formal constraints were listed in the provided R4 document.
*   **R6:** The R6 document explicitly states `constraints: []`, indicating no new formal invariants have been added to the resource definition itself.
*   **Impact:** No changes to validation based on formal resource constraints.

## 5. Search Parameter Changes

*   **New Search Parameters in R6:**
    *   **`family`**:
        *   Type: `string`
        *   Expression: `RelatedPerson.name.family`
        *   Purpose: Allows searching on the family name part of `RelatedPerson.name`.
    *   **`given`**:
        *   Type: `string`
        *   Expression: `RelatedPerson.name.given`
        *   Purpose: Allows searching on the given name part of `RelatedPerson.name`.
    *   **`role`**:
        *   Type: `token`
        *   Expression: `RelatedPerson.role`
        *   Purpose: Allows searching based on the new `RelatedPerson.role` element for functional relationships.

*   **Modified Search Parameters:**
    *   **`relationship`**:
        *   **R4 Expression:** `RelatedPerson.relationship` (searched codes representing both personal and functional relationships).
        *   **R6 Expression:** `RelatedPerson.relationship` (now searches codes representing *only personal* relationships due to the redefinition of the target element).
        *   **Impact:** Queries using the `relationship` search parameter will behave differently in R6. They will only match codes from `RelatedPerson.relationship` (now bound to `v3-PersonalRelationshipRoleType`) and will not find functional roles, which must now be searched using the new `role` parameter.

*   **Unchanged Search Parameters (Name, Type, and Core Expression):**
    The following search parameters remain largely consistent in their definition, though underlying data or scope might be subtly affected by other resource changes:
    *   `active`
    *   `address`
    *   `address-city`
    *   `address-country`
    *   `address-postalcode`
    *   `address-state`
    *   `address-use`
    *   `birthdate`
    *   `email`
    *   `gender`
    *   `identifier`
    *   `name` (Note: R6 description for `name` search parameter mentions "suffix, suffix" which is likely a typo in the source and should be "prefix, suffix". The core functionality remains searching HumanName fields.)
    *   `patient`
    *   `phone`
    *   `phonetic`
    *   `telecom`

*   **Impact of Search Parameter Changes:**
    *   Implementers gain more precise search capabilities for names (`family`, `given`) and functional roles (`role`).
    *   Existing queries using the `relationship` search parameter **must be reviewed and potentially updated** to reflect its narrowed scope or supplemented with queries using the new `role` parameter.

## 6. Key Migration Actions & Considerations

1.  **Relationship/Role Data Migration (Critical - Breaking Change):**
    *   Analyze existing R4 `RelatedPerson.relationship` data.
    *   Identify codes representing personal relationships and ensure they are mapped appropriately to R6 `RelatedPerson.relationship` (consider the new `v3-PersonalRelationshipRoleType` value set).
    *   Identify codes representing functional roles and migrate them to the new R6 `RelatedPerson.role` element (using the `relatedperson-relationshiptype` value set).
    *   Update application logic to read from and write to both `relationship` (for personal) and `role` (for functional) elements in R6.

2.  **Update `communication.language` Handling:**
    *   Adapt systems to use the `http://hl7.org/fhir/ValueSet/all-languages` value set for `RelatedPerson.communication.language`.
    *   Ensure validation against this value set, as the binding strength is now `Required`.
    *   Review and potentially re-map existing language codes.

3.  **Adapt to New Search Parameters:**
    *   Leverage new search parameters (`family`, `given`, `role`) for enhanced querying if needed.
    *   Update existing search queries that used the R4 `relationship` parameter. If these queries intended to find functional roles, they must now use the new `role` search parameter in R6.

4.  **Review Scope and Guidance:**
    *   Consider the implications of the refined scope definitions and guidance in R6 (e.g., `Patient.link`, distinction from `PersonalRelationship`, user identity notes for `identifier` and `telecom`).
    *   Update internal documentation and training materials.

5.  **Acknowledge Maturity Change:**
    *   The increased maturity level (R4 L2 to R6 L5) signals greater stability for the RelatedPerson resource. Plan accordingly for future maintenance.

6.  **System Testing:**
    *   Thoroughly test all functionalities involving RelatedPerson resources, including creation, update, retrieval, and search, after migration to ensure correctness with the R6 structure and semantics.