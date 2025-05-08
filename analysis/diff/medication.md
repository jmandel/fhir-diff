# FHIR Medication Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Medication resource between versions R4 and R6, focusing on aspects critical for implementers. It aims to be clear, actionable, dense, and precise to aid in migration and support for both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Medication resource from R4 to R6 involves several significant changes, primarily focused on refining element names for clarity, enhancing data type flexibility, and introducing a standardized way to link to more detailed medication knowledge.

1.  **Element Renaming and Conceptual Shifts:**
    *   `Medication.manufacturer` is now **`Medication.marketingAuthorizationHolder`**, reflecting a shift from who physically makes the product to who holds the marketing rights. **Breaking Change.**
    *   `Medication.form` is now **`Medication.doseForm`**. **Breaking Change.**
    *   `Medication.amount` (type `Ratio`) is now **`Medication.totalVolume`** (type `Quantity`). **Breaking Change.**

2.  **Ingredient Representation:**
    *   `Medication.ingredient.item[x]` (which was a choice of `CodeableConcept` or `Reference` in R4) is now **`Medication.ingredient.item`** of type **`CodeableReference(Substance | Medication)`**. This is a structural simplification and a **Breaking Change** requiring data migration.
    *   `Medication.ingredient.strength` (type `Ratio` in R4) is now **`Medication.ingredient.strength[x]`**, a choice of `Ratio`, `CodeableConcept`, or `Quantity`. This offers more flexibility but is a **Breaking Change** due to the type change and choice.

3.  **New `Medication.definition` Element:** R6 introduces `Medication.definition` (type `Reference(MedicationKnowledge)`), allowing a link to a more comprehensive definition of the medication.

4.  **Search Parameter Adjustments:**
    *   The `manufacturer` search parameter is replaced by `marketingauthorizationholder`.
    *   Expressions for `form`, `ingredient`, and `ingredient-code` search parameters are updated to reflect element renames and type changes.
    *   A new `serial-number` search parameter is added, though its documentation has a potential discrepancy.

5.  **Data Migration Required:** Systems will need to migrate data for renamed elements and adapt to new data types and structures, particularly for ingredients and their strengths.

## 2. Overall Resource Scope and Purpose

The fundamental purpose of the Medication resource—to define and identify medications, including their ingredients, for various healthcare processes—remains consistent between R4 and R6. Both versions support describing packaged products, manufactured items, and compounded products.

R6 provides more detailed comments in `Medication.ingredient.comments` clarifying that while ingredients can be listed (and should be for compounded products), the resource is not a full "recipe," and listing ingredients might be duplicative if `Medication.code` already represents a fully specified product. This guidance can help implementers in deciding the level of detail for ingredient specification.

## 3. Element-Level Changes

### 3.1. New Elements in R6

*   **`Medication.definition` (New)**
    *   **Cardinality:** `0..1`
    *   **Type:** `Reference(MedicationKnowledge)`
    *   **Short Description/Purpose:** "Knowledge about this medication." This element provides a formal link to a `MedicationKnowledge` resource, which can offer more detailed clinical or regulatory information. This is particularly useful for complex medications or cross-border data exchange scenarios.
    *   **Key Impact/Action for Implementers:** Implementers can use this new optional element to integrate with richer sources of medication information. No data migration from R4 is required as this element is new.

### 3.2. Modified Elements (R4 to R6)

Several elements have been renamed, had their types changed, or bindings updated. These are often **Breaking Changes**.

*   **`Medication.manufacturer` (R4) -> `Medication.marketingAuthorizationHolder` (R6)**
    *   **Change:** Renamed.
    *   **R4 Name:** `manufacturer`
    *   **R6 Name:** `marketingAuthorizationHolder`
    *   **Type:** `Reference(Organization)` (Unchanged)
    *   **Cardinality:** `0..1` (Unchanged)
    *   **Rationale / Key Impact:** This is a **Breaking Change** due to the name change. The semantic meaning has also shifted:
        *   R4 `manufacturer`: Focused on the entity that *produces* the medication.
        *   R6 `marketingAuthorizationHolder`: Refers to the entity legally authorized to *market* the medication. While often the same, they can be different.
    *   **Action:** Update systems to use the new element name `marketingAuthorizationHolder`. Review data sources to ensure correct mapping to the new semantic meaning. The `manufacturer` search parameter is also replaced (see Search Parameter Changes).

*   **`Medication.form` (R4) -> `Medication.doseForm` (R6)**
    *   **Change:** Renamed.
    *   **R4 Name:** `form`
    *   **R6 Name:** `doseForm`
    *   **Type:** `CodeableConcept` (Unchanged)
    *   **Cardinality:** `0..1` (Unchanged)
    *   **Binding:** `http://hl7.org/fhir/ValueSet/medication-form-codes` (strength: `example`) - Appears unchanged.
    *   **Rationale / Key Impact:** This is a **Breaking Change** due to the name change. The term `doseForm` is more clinically precise.
    *   **Action:** Update systems to use the new element name `doseForm`. The `form` search parameter expression is updated.

*   **`Medication.amount` (R4) -> `Medication.totalVolume` (R6)**
    *   **Change:** Renamed and Type Change.
    *   **R4 Name & Type:** `amount` (`Ratio`)
    *   **R6 Name & Type:** `totalVolume` (`Quantity`)
    *   **Cardinality:** `0..1` (Unchanged)
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The name change to `totalVolume` clarifies its purpose (e.g., total amount in a package like 3mL, 10mL). The type change from `Ratio` to `Quantity` simplifies representation for this common use case.
    *   **Action:** Update systems to use `totalVolume` with type `Quantity`. Data migration from R4 `Ratio` to R6 `Quantity` is required. For R4 `amount` values where the denominator of the `Ratio` was effectively "1 package unit," the numerator can likely map directly to the `Quantity.value` and `Quantity.unit`.

*   **`Medication.status` (Modified Binding & Modifier Reason)**
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/medication-status|4.0.1` (version-specific URI)
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/medication-status` (non-version-specific URI)
    *   **R4 ModifierReason:** "...status 'entered-in-error' which means that the resource should not be treated as valid."
    *   **R6 ModifierReason:** "This element changes the interpretation of all descriptive attributes."
    *   **Key Impact/Action for Implementers:**
        *   Use the R6 non-version-specific value set URI.
        *   The updated `modifierReason` provides a clearer and broader understanding of why `status` is a modifier element. This generally doesn't require code changes unless logic was tightly coupled to the previous, more specific reason.

*   **`Medication.ingredient.item[x]` (R4) -> `Medication.ingredient.item` (R6)**
    *   **Change:** Type changed from a choice of `CodeableConcept` or `Reference` to a single `CodeableReference` type.
    *   **R4 Type:** Choice: `itemCodeableConcept: CodeableConcept` OR `itemReference: Reference(Substance | Medication)`
    *   **R6 Type:** `item: CodeableReference(Substance | Medication)`
    *   **Cardinality:** `1..1` (Unchanged for the item itself)
    *   **Binding (for concept part):** `http://hl7.org/fhir/ValueSet/medication-codes` (strength: `example`) - Remains for the concept aspect of `CodeableReference`.
    *   **Rationale / Key Impact:** This is a **Breaking Change** and a significant structural improvement. `CodeableReference` provides a standard way to represent an element that can be either a code or a reference, or both.
    *   **Action:**
        *   Migrate data from R4's separate `itemCodeableConcept` or `itemReference` into the R6 `Medication.ingredient.item` (type `CodeableReference`).
        *   If R4 had `itemCodeableConcept`, map it to `ingredient.item.concept`.
        *   If R4 had `itemReference`, map it to `ingredient.item.reference`.
        *   Update search logic (see `ingredient` and `ingredient-code` search parameters).

*   **`Medication.ingredient.strength` (R4) -> `Medication.ingredient.strength[x]` (R6)**
    *   **Change:** Name suffixed with `[x]` to indicate choice, and type expanded to a choice.
    *   **R4 Name & Type:** `strength` (`Ratio`)
    *   **R6 Name & Type:** `strength[x]` (Choice: `Ratio` | `CodeableConcept` | `Quantity`)
    *   **Cardinality:** `0..1` (Unchanged)
    *   **Binding (New for `CodeableConcept` choice):** R6 adds a `preferred` binding to `http://hl7.org/fhir/ValueSet/medication-ingredientstrength` if `strengthCodeableConcept` is used.
    *   **Rationale / Key Impact:** This is a **Breaking Change**. R6 offers increased flexibility:
        *   `Ratio`: For strengths like "250 mg per 1 tablet."
        *   `CodeableConcept`: For qualitative strengths (e.g., "trace," "as required") using the new value set.
        *   `Quantity`: For simple strengths where the denominator is implicit (e.g., "250 mg," assuming per dose unit).
    *   **Action:**
        *   Data from R4 `strength` (Ratio) can be mapped to R6 `strengthRatio`.
        *   Systems must be updated to handle the choice of three types for `strength[x]`.
        *   Consider using `strengthCodeableConcept` or `strengthQuantity` where appropriate for new data.

### 3.3. Removed Elements from R4 (Effectively Refactored)

The following R4 elements are not present by the same name in R6 because their functionality has been incorporated into changed structures:

*   **`Medication.ingredient.itemCodeableConcept` (Refactored)**
    *   **Rationale:** In R4, this was one part of the `item[x]` choice. In R6, this concept is handled by the `.concept` part of `Medication.ingredient.item` (type `CodeableReference`).
*   **`Medication.ingredient.itemReference` (Refactored)**
    *   **Rationale:** In R4, this was the other part of the `item[x]` choice. In R6, this concept is handled by the `.reference` part of `Medication.ingredient.item` (type `CodeableReference`).

## 4. Constraint Changes

No specific, formally defined constraints (e.g., `med-1`) were listed in the provided R4 or R6 documentation beyond standard FHIR validation rules (cardinality, type).

However, as noted above, the `modifierReason` for `Medication.status` has been updated in R6 to be more general: "This element changes the interpretation of all descriptive attributes," compared to R4's more specific reason related to 'entered-in-error'.

## 5. Search Parameter Changes

*   **`code` (Unchanged)**
    *   Expression: `Medication.code`

*   **`expiration-date` (Unchanged)**
    *   Expression: `Medication.batch.expirationDate`

*   **`form` (Modified Expression)**
    *   **R4 Name & Expression:** `form`, `Medication.form`
    *   **R6 Name & Expression:** `form`, `Medication.doseForm`
    *   **Key Change/Impact:** Expression updated to reflect element rename from `form` to `doseForm`. Queries using this parameter must be updated.

*   **`identifier` (Unchanged)**
    *   Expression: `Medication.identifier`

*   **`ingredient` (Modified Expression)**
    *   **R4 Expression:** `(Medication.ingredient.item as Reference)`
    *   **R6 Expression:** `Medication.ingredient.item.reference`
    *   **Targets:** `[Medication, Substance]` (Unchanged)
    *   **Key Change/Impact:** Expression updated to align with the `CodeableReference` structure for `Medication.ingredient.item`. Queries must be updated.

*   **`ingredient-code` (Modified Expression)**
    *   **R4 Expression:** `(Medication.ingredient.item as CodeableConcept)`
    *   **R6 Expression:** `Medication.ingredient.item.concept`
    *   **Key Change/Impact:** Expression updated to align with the `CodeableReference` structure for `Medication.ingredient.item`. Queries must be updated.

*   **`lot-number` (Unchanged)**
    *   Expression: `Medication.batch.lotNumber`

*   **`manufacturer` (Removed)**
    *   **R4 Parameter:** `manufacturer` (Expression: `Medication.manufacturer`)
    *   **Key Change/Impact:** This search parameter is removed, corresponding to the renaming of the `manufacturer` element.

*   **`marketingauthorizationholder` (New in R6)**
    *   **R6 Parameter:** `marketingauthorizationholder`
        *   Type: `reference`
        *   Expression: `Medication.marketingAuthorizationHolder`
        *   Targets: `[Organization]`
    *   **Key Change/Impact:** New search parameter corresponding to the new `Medication.marketingAuthorizationHolder` element. Replaces the R4 `manufacturer` search parameter.

*   **`serial-number` (New in R6 - Potential Clarification Needed)**
    *   **R6 Parameter:** `serial-number`
        *   Type: `token`
        *   Expression: `Medication.identifier`
        *   R6 Description: "Returns medications in a batch with this lot number"
    *   **Key Change/Impact:** This is a new search parameter.
        *   **Discrepancy:** The provided R6 description ("Returns medications in a batch with this lot number") conflicts with its expression (`Medication.identifier`). `Medication.identifier` holds business identifiers for the medication itself, potentially including instance-specific serial numbers (as suggested by R4 `Medication.identifier` comments), not batch lot numbers (which are in `Medication.batch.lotNumber` and searched by the `lot-number` SP).
        *   Assuming the expression `Medication.identifier` is correct, this SP would search within the medication's identifiers. This may be redundant with the existing `identifier` search parameter, unless it implies searching for a specific *type* of identifier (e.g., one with `Identifier.system` for serial numbers), which is not specified.
    *   **Action:** Implementers should be aware of this new parameter. If using it, confirm its intended behavior based on the FHIR specification or profile guidance, particularly regarding the discrepancy between its documented description and its expression.

*   **`status` (Unchanged)**
    *   Expression: `Medication.status`

## 6. Key Migration Actions & Considerations

1.  **Handle Element Renames and Conceptual Shifts:**
    *   Map R4 `Medication.manufacturer` data to R6 `Medication.marketingAuthorizationHolder`, considering the semantic difference.
    *   Rename `Medication.form` to `Medication.doseForm` in system logic and data.
    *   Migrate R4 `Medication.amount` (Ratio) to R6 `Medication.totalVolume` (Quantity).

2.  **Update Ingredient Structures (Critical):**
    *   Migrate R4 `Medication.ingredient.item[x]` (choice of `CodeableConcept` or `Reference`) to R6 `Medication.ingredient.item` (type `CodeableReference`). This involves mapping data to `item.concept` or `item.reference` as appropriate.
    *   Adapt to the new `Medication.ingredient.strength[x]` choice type (`Ratio` | `CodeableConcept` | `Quantity`). Map existing R4 `Ratio` data to `strengthRatio`. Plan to support reading and potentially writing the new `strengthCodeableConcept` and `strengthQuantity` options.

3.  **Adopt New `Medication.definition` Element:** Evaluate incorporating the `Medication.definition` element to link to `MedicationKnowledge` resources for richer medication details where applicable.

4.  **Review `Medication.status` Changes:** Note the updated `modifierReason` for `Medication.status` and the non-version-specific value set URI.

5.  **Revise API Queries and Search Logic:**
    *   Replace queries using the `manufacturer` search parameter with the new `marketingauthorizationholder` parameter.
    *   Update queries using the `form` search parameter to point to `Medication.doseForm`.
    *   Modify queries for `ingredient` and `ingredient-code` to use the new expressions (`.item.reference` and `.item.concept` respectively).
    *   Investigate the new `serial-number` search parameter and its intended use if relevant.

6.  **Update System Logic and Validation:** Ensure internal data models, validation rules, and UI components are aligned with the R6 element names, types, and structures.

7.  **Consult Official R6 Specification:** For definitive details and any further clarifications, always refer to the official HL7 FHIR R6 specification for the Medication resource.