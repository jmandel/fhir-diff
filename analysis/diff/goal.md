# FHIR Goal Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Goal resource between R4 and R6, focusing on aspects critical for implementers. It aims to provide a clear, actionable, and precise guide for migration and for supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Goal resource from R4 to R6 introduces several notable changes, including breaking changes that require data model updates and migration. Key impacts include:

1.  **Removal of Outcome Elements (Breaking Change):** The R4 elements `Goal.outcomeCode` and `Goal.outcomeReference` have been **removed** in R6. Systems must adapt to represent outcome details using `Goal.achievementStatus` and by potentially linking relevant `Observation` resources via other means (e.g., `Goal.addresses`).
2.  **`statusReason` Element Enhancement (Breaking Change):** `Goal.statusReason` has changed from a `string` (0..1) in R4 to a `CodeableConcept` (0..\*) in R6, with an associated value set binding. This requires data migration and structural changes.
3.  **`expressedBy` Renamed to `source` (Breaking Change):** The `Goal.expressedBy` element has been renamed to `Goal.source` in R6. Its list of allowed reference types has also been expanded.
4.  **New `acceptance` Backbone Element:** R6 introduces `Goal.acceptance` to formally record agreement and priority from various stakeholders (patient, practitioners), enhancing the collaborative aspect of goal setting.
5.  **New `continuous` Element:** A `boolean` element `Goal.continuous` has been added in R6 to indicate if ongoing activity is needed to sustain the goal after it's initially met.
6.  **Expanded Reference Targets:** The `Goal.addresses` element and the renamed `Goal.source` (formerly `expressedBy`) now support a broader range of target resource types.
7.  **New Search Parameters:** R6 adds search parameters: `addresses`, `description`, and `target-measure`, offering more granular querying capabilities.
8.  **`Group` Compartment Added:** The `Goal` resource in R6 is now also associated with the `Group` compartment, reflecting its applicability to groups.
9.  **Clarified `statusDate` Scope:** The description of `Goal.statusDate` is now explicitly linked to the `achievementStatus` rather than the general "status."

Implementers should prioritize addressing the breaking changes related to outcome representation, `statusReason`, and the renaming of `expressedBy`.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of the Goal resource—to describe intended objectives for patient, group, or organization care—remains consistent between R4 and R6.

However, R6 provides more detailed contextual information:

*   **Boundaries with Other Resources:** R6 offers clearer distinctions between `Goal` and resources like `Consent` (for Advance Directives) and `PlanDefinition` (for goal templates).
*   **Emphasis on Acceptance:** The new `Goal.acceptance` element in R6 underscores the collaborative nature of goal setting, allowing multiple stakeholders' perspectives on acceptance and priority to be recorded.
*   **Guidance on `Group` for `source`:** R6 clarifies that when `Goal.source` references a `Group`, it should represent a family or household, not a group of practitioners.

These clarifications refine the understanding and application of the Goal resource but do not fundamentally alter its core mission.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6:

*   **`Goal.continuous` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `boolean`
    *   **Short Description/Purpose:** Indicates if ongoing activity is needed to sustain the goal objective after it has been met (e.g., maintaining HbA1c levels vs. a one-time vaccination).
    *   **Key Impact/Action for Implementers:** This new flag allows for better characterization of goals. Systems may use this to differentiate goal management strategies (e.g., for long-term vs. short-term goals).

*   **`Goal.acceptance` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** BackboneElement, containing:
        *   `participant`: `1..1`, `Reference(Patient | Practitioner | RelatedPerson | PractitionerRole | CareTeam | Organization)` (Who is providing acceptance/priority)
        *   `status`: `0..1`, `code` (Values: `agree | disagree | pending`; Binding: `http://hl7.org/fhir/ValueSet/goal-accept-status`, strength: `required`)
        *   `priority`: `0..1`, `CodeableConcept` (Binding: `http://hl7.org/fhir/ValueSet/goal-priority`, strength: `example`)
    *   **Short Description/Purpose:** Records acceptance and priority of the goal from various stakeholders.
    *   **Key Impact/Action for Implementers:** This is a significant addition for capturing multi-stakeholder input. Systems dealing with collaborative goal setting will need to implement support for this structure.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Goal.statusReason` (Modified - Breaking Change)**
    *   **R4:** Type `string`, Cardinality `0..1`
    *   **R6:** Type `CodeableConcept`, Cardinality `0..*`
        *   **Binding (New in R6):** `http://hl7.org/fhir/ValueSet/goal-status-reason` (strength: `example`)
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The change to `CodeableConcept` allows for coded reasons and the `0..*` cardinality supports multiple reasons for the current lifecycle status.
        *   **Action:** Data migration is required. R4 string data for `statusReason` will need to be converted into the `CodeableConcept.text` field of the new structure. If the R4 string contained multiple distinct reasons, they can now be represented as separate instances of `statusReason`. Implementers should consider mapping existing string values to codes if the new example value set is adopted.

*   **`Goal.expressedBy` (Renamed to `Goal.source` - Breaking Change for Name, Modified for Type)**
    *   **R4 Name:** `Goal.expressedBy`
        *   **R4 Type:** `Reference(Patient | Practitioner | PractitionerRole | RelatedPerson)`
    *   **R6 Name:** `Goal.source`
        *   **R6 Type:** `Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | CareTeam | Group)`
    *   **Rationale / Key Impact:** The element has been **renamed**, which is a **Breaking Change** for code accessing this field. The list of allowable reference types has been expanded to include `CareTeam` and `Group`, providing more flexibility in identifying the source of the goal.
        *   **Action:** Update code to use the new element name `source`. Systems must be prepared to handle references to `CareTeam` and `Group` in addition to the R4 types. Note R6 guidance: `Group` should represent a family/household.

*   **`Goal.addresses` (Modified - Expanded Reference Types)**
    *   **R4 Type:** `Reference(Condition | Observation | MedicationStatement | NutritionOrder | ServiceRequest | RiskAssessment)`
    *   **R6 Type:** `Reference(Condition | Observation | MedicationStatement | MedicationRequest | NutritionOrder | ServiceRequest | RiskAssessment | Procedure | NutritionIntake)`
    *   **Rationale / Key Impact:** The set of resources that can be referenced by `addresses` (i.e., health record elements providing context for the goal) has been expanded to include `MedicationRequest`, `Procedure`, and `NutritionIntake`.
        *   **Action:** Systems processing `Goal.addresses` should be updated to recognize and potentially handle these new reference types. This increases the richness of context that can be linked to a goal.

*   **`Goal.description` (Modified - Binding Change)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/clinical-findings` (Example strength)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/goal-description` (Example strength)
    *   **Rationale / Key Impact:** The example value set binding for `Goal.description` has changed. The new `goal-description` ValueSet is generally more aligned with describing goals, whereas `clinical-findings` is typically for SNOMED CT. Since the strength remains `example`, this is a minor change, but implementers may want to review the new example ValueSet.
        *   **Action:** Review the new example value set. No data migration is strictly required due to binding strength, but alignment with the new example is advisable.

*   **`Goal.statusDate` (Modified - Clarified Description)**
    *   **R4 Description:** "Identifies when the current status. I.e. When initially created, when achieved, when cancelled, etc." (Ambiguous regarding which status).
    *   **R6 Description:** "Identifies when the current **achievement status** took effect. I.e. When achieved, when improving, etc."
    *   **Key Impact/Action for Implementers:** The R6 description clarifies that `statusDate` refers to the date the `Goal.achievementStatus` (e.g., `in-progress`, `achieved`) was last updated, not necessarily the `Goal.lifecycleStatus`. This helps in accurate interpretation. Systems should ensure their logic aligns with this clarified meaning.

### 3.3. Removed Elements from R4

The following elements present in R4 have been removed in R6:

*   **`Goal.outcomeCode` (Removed - Breaking Change)**
    *   **R4 Type:** `CodeableConcept`, `0..*`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/clinical-findings` (Example strength)
    *   **Rationale / Key Impact:** This is a **Breaking Change**. This element, used to directly specify coded outcomes of the goal, is no longer present.
        *   **Action:** Outcome indication is now primarily through `Goal.achievementStatus`. Any coded outcome concepts previously stored in `Goal.outcomeCode` may need to be:
            *   Mapped to appropriate `achievementStatus` values.
            *   Captured in linked `Observation` resources (which might be referenced in `Goal.addresses`).
            *   Described in `Goal.note` if no other structured place is suitable.
            Data migration strategies are essential.

*   **`Goal.outcomeReference` (Removed - Breaking Change)**
    *   **R4 Type:** `Reference(Observation)`, `0..*`
    *   **Rationale / Key Impact:** This is a **Breaking Change**. This element, used to link directly to `Observation` resources detailing the outcome, has been removed.
        *   **Action:** Observations that detail goal outcomes should still be created, but they would now likely be linked via `Goal.addresses` (if they provide context for the goal's existence or progression) or other standard FHIR linking mechanisms (e.g., `Observation.hasMember` if the Goal is part of a larger assessment, or `Provenance`).
            Data migration for existing references needs to be planned. Consider whether these `Observation` references can be moved to `Goal.addresses` or if the information is sufficiently captured by `achievementStatus`.

## 4. Constraint Changes

*   **`gol-1` (Unchanged):** "Goal.target.measure is required if Goal.target.detail is populated."
    *   **R4 Expression:** `(detail.exists() and measure.exists()) or detail.exists().not()`
    *   **R6 Expression:** `(detail.exists() and measure.exists()) or detail.exists().not()`
    *   **Impact:** This constraint remains the same in R6. No changes are needed for validation logic related to `gol-1`.

No new significant constraints appear to have been added, and no R4 constraints other than those implicitly removed by element removal were identified.

## 5. Search Parameter Changes

*   **New Search Parameters in R6:**
    *   **`addresses`**
        *   Type: `reference`
        *   Expression: `Goal.addresses`
        *   Targets: `[Condition, Observation, MedicationStatement, MedicationRequest, NutritionOrder, ServiceRequest, RiskAssessment, Procedure, NutritionIntake]`
        *   **Impact:** Allows searching for Goals based on the resources they address.
    *   **`description`**
        *   Type: `token`
        *   Expression: `Goal.description`
        *   **Impact:** Allows searching for Goals by the codes or text in their description.
    *   **`target-measure`**
        *   Type: `token`
        *   Expression: `Goal.target.measure`
        *   **Impact:** Allows searching for Goals based on the code for the parameter being tracked in the target.

*   **Unchanged Search Parameters:**
    The following search parameters appear to be functionally unchanged between R4 and R6:
    *   `achievement-status`
    *   `category`
    *   `identifier`
    *   `lifecycle-status`
    *   `patient` (expression `Goal.subject.where(resolve() is Patient)`)
    *   `start-date` (expression `(Goal.start as date)`)
    *   `subject` (expression `Goal.subject`)
    *   `target-date` (expression `(Goal.target.due as date)`)

*   **Removed Search Parameters:**
    No search parameters appear to have been explicitly removed, other than those that would implicitly become non-functional due to the removal of their target elements (e.g., if there were search parameters based on `outcomeCode` or `outcomeReference` in specific profiles, those would no longer apply to the core R6 resource). The provided R4 list did not include such parameters for the core spec.

## 6. Compartment Changes

*   **R4 Compartments:** `Patient`
*   **R6 Compartments:** `Patient`, `Group`
*   **Impact:** The addition of the `Group` compartment means that Goals where `Goal.subject` is a `Group` can now be searched or accessed via group-based compartment queries. This aligns with the resource's ability to define goals for groups.

## 7. Key Migration Actions & Considerations

1.  **Address `outcomeCode` and `outcomeReference` Removal (Critical - Breaking Change):**
    *   Develop a strategy for migrating data from R4 `Goal.outcomeCode` and `Goal.outcomeReference`.
    *   Utilize `Goal.achievementStatus` as the primary indicator of outcome status.
    *   For detailed outcome evidence, link `Observation` resources via `Goal.addresses` or other appropriate mechanisms.
    *   Update systems to no longer expect or populate these removed elements.

2.  **Adapt to `statusReason` Changes (Critical - Breaking Change):**
    *   Modify data models to store `Goal.statusReason` as a `CodeableConcept` (0..\*) instead of a `string` (0..1).
    *   Migrate existing R4 `statusReason` string data into `CodeableConcept.text`.
    *   Consider mapping text to codes from `http://hl7.org/fhir/ValueSet/goal-status-reason` if applicable.

3.  **Handle `expressedBy` Renaming to `source` (Critical - Breaking Change):**
    *   Update all code and queries that reference `Goal.expressedBy` to use `Goal.source`.
    *   Ensure systems can handle the expanded reference types for `Goal.source` (`CareTeam`, `Group`).

4.  **Implement New Elements:**
    *   Evaluate and implement `Goal.continuous` if differentiating between ongoing and one-time goals is relevant.
    *   Implement the `Goal.acceptance` backbone element if capturing stakeholder agreement and priority is required.

5.  **Update `addresses` and `source` Reference Handling:**
    *   Ensure your system can process and store the newly added reference target types for `Goal.addresses` (`MedicationRequest`, `Procedure`, `NutritionIntake`) and `Goal.source` (`CareTeam`, `Group`).

6.  **Review `description` Binding:**
    *   Note the change in the example value set for `Goal.description` and align if desired, though not strictly breaking.

7.  **Clarify `statusDate` Usage:**
    *   Ensure interpretation of `Goal.statusDate` aligns with its R6 definition (related to `achievementStatus`).

8.  **Utilize New Search Parameters:**
    *   Leverage the new search parameters (`addresses`, `description`, `target-measure`) for enhanced query capabilities.

9.  **Consider `Group` Compartment:**
    *   If working with group-level goals, utilize the new `Group` compartment for relevant queries.

By addressing these changes, implementers can successfully migrate their systems from R4 to R6 Goal resources or support both versions effectively. The breaking changes related to outcome elements, `statusReason`, and `expressedBy`/`source` will require the most attention.