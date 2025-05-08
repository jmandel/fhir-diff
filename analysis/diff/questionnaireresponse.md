# FHIR QuestionnaireResponse Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR `QuestionnaireResponse` resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the `QuestionnaireResponse` resource from R4 to R6 introduces several impactful changes, primarily enhancing its robustness, referential integrity, and queryability. Key changes include:

1.  **Mandatory Questionnaire Link (`questionnaire`):** The `questionnaire` element, which links to the defining `Questionnaire`, has changed cardinality from `0..1` in R4 to **`1..1` in R6**. This is a **Breaking Change** requiring all R6 `QuestionnaireResponse` instances to reference a `Questionnaire`.
2.  **Mandatory Answer Value (`item.answer.value[x]`):** If an `item.answer` backbone element is present, its `value[x]` element (the actual answer) has changed cardinality from `0..1` in R4 to **`1..1` in R6**. This is a **Breaking Change** ensuring that every provided answer structure contains an actual value.
3.  **Answer Value Type Change (`Quantity` to `SimpleQuantity`):** Within `item.answer.value[x]`, the `Quantity` data type has been replaced with `SimpleQuantity` in R6. This is a **Breaking Change** as `SimpleQuantity` is a more constrained version of `Quantity`. Data migration and type handling adjustments are necessary.
4.  **Expanded Cardinality for Identifiers and Definitions:**
    *   `QuestionnaireResponse.identifier` changed from `0..1` to `0..*`, allowing multiple business identifiers.
    *   `QuestionnaireResponse.item.definition` changed from `0..1` to `0..*`, allowing an item to reference multiple definitions.
5.  **Enhanced Reference Types for `author` and `source`:**
    *   `author`: Can now also reference `Group`.
    *   `source`: Can now also reference `Device` and `Organization`.
6.  **New Constraints:** Two new validation rules (`qrs-2`, `qrs-3`) have been added in R6, affecting how repeating answers are structured and the format of `linkId`.
7.  **Vastly Improved Search Capabilities:** R6 introduces a comprehensive suite of new search parameters (e.g., `answer-concept`, `answer-string`, `item-concept`, `linkid`) allowing for detailed querying of response content by `linkId` and answer values, a significant enhancement over R4.
8.  **Maturity Increase:** The resource's maturity level has increased from 3 (Trial Use) in R4 to 5 (considered Normative, though still marked "Trial Use" for status) in R6, indicating greater stability and adoption.

Implementers should anticipate data model adjustments, updates to data creation and validation logic, and significant opportunities to refine querying strategies.

## 2. Overall Resource Scope and Purpose

The core purpose of `QuestionnaireResponse`—to record a structured set of answers to questions—remains consistent between R4 and R6. However, the R6 documentation provides significantly more detailed background, scope, and guidance on aspects like:

*   The distinction and interplay between `subject`, `source`, and `author`.
*   Lifecycle management via the `status` element.
*   Contextual linking (e.g., `encounter`, `basedOn`, `partOf`).
*   Nesting logic for items and answers.
*   Validation expectations against the linked `Questionnaire`.
*   Considerations for searching response content.

While not structural changes themselves, this enriched documentation in R6 offers implementers clearer, more comprehensive guidance on using the resource effectively.

## 3. Element-Level Changes

This section details modifications to individual elements within the `QuestionnaireResponse` resource.

### 3.1. New or Significantly Modified Elements Affecting Structure/Cardinality

*   **`QuestionnaireResponse.identifier` (Modified Cardinality)**
    *   **R4:** `0..1` (A single business identifier)
    *   **R6:** `0..*` (Multiple business identifiers allowed)
    *   **Impact:** Systems can now store a list of identifiers. R4 systems storing a single identifier remain compliant. New implementations or those needing multiple identifiers must handle an array.
    *   **Action:** Update data models and processing logic if multiple identifiers per response are required.

*   **`QuestionnaireResponse.questionnaire` (Modified Cardinality - BREAKING CHANGE)**
    *   **R4:** `0..1` `canonical(Questionnaire)` (Link to the `Questionnaire` was optional)
    *   **R6:** `1..1` `canonical(Questionnaire)` (Link to the `Questionnaire` is now mandatory)
    *   **Impact:** **Breaking Change.** Every R6 `QuestionnaireResponse` instance *must* include a canonical reference to the `Questionnaire` it is a response to.
    *   **Action:**
        *   Ensure all new R6 `QuestionnaireResponse` instances populate the `questionnaire` element.
        *   For migration, R4 instances lacking a `questionnaire` reference will need to be updated, potentially by identifying the appropriate `Questionnaire` or using a placeholder/extension strategy if the original `Questionnaire` is unknown (though R6 comments discuss scenarios of non-resolvable links or extension-only `questionnaire` elements for legacy data).

*   **`QuestionnaireResponse.author` (Modified Reference Types)**
    *   **R4 Types:** `Reference(Device | Practitioner | PractitionerRole | Patient | RelatedPerson | Organization)`
    *   **R6 Types:** `Reference(Device | Practitioner | PractitionerRole | Patient | RelatedPerson | Organization | Group)`
    *   **Impact:** `Group` has been added as a permissible reference type for the `author`. R6 comments clarify `Group` should represent units like families or households.
    *   **Action:** Systems consuming or validating `author` references must be prepared to handle `Reference(Group)`.

*   **`QuestionnaireResponse.source` (Modified Reference Types)**
    *   **R4 Types:** `Reference(Patient | Practitioner | PractitionerRole | RelatedPerson)`
    *   **R6 Types:** `Reference(Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson)`
    *   **Impact:** `Device` and `Organization` have been added as permissible reference types for the `source`.
    *   **Action:** Systems consuming or validating `source` references must be prepared to handle `Reference(Device)` and `Reference(Organization)`.

*   **`QuestionnaireResponse.item.definition` (Modified Cardinality)**
    *   **R4:** `0..1` `uri` (A single definition URI per item)
    *   **R6:** `0..*` `uri` (Multiple definition URIs per item allowed)
    *   **Impact:** An item in a response can now link to multiple external definitions.
    *   **Action:** Update data models and processing logic to handle a list of definition URIs if this feature is utilized.

*   **`QuestionnaireResponse.item.answer.value[x]` (Modified Cardinality & Type - BREAKING CHANGES)**
    *   **R4 Cardinality:** `0..1` (An answer structure could exist without a value)
    *   **R6 Cardinality:** `1..1` (If `item.answer` is present, `value[x]` *must* be present)
    *   **R4 Types:** Included `Quantity`
    *   **R6 Types:** Replaced `Quantity` with `SimpleQuantity`. Other types (`boolean`, `decimal`, `integer`, `date`, `dateTime`, `time`, `string`, `uri`, `Attachment`, `Coding`, `Reference(Any)`) remain largely consistent.
    *   **Impact:**
        1.  **Cardinality (Breaking Change):** Systems creating R6 `QuestionnaireResponse` instances must ensure that every `item.answer` element contains a `value[x]`.
        2.  **Type Change (`Quantity` to `SimpleQuantity`) (Breaking Change):** `SimpleQuantity` is a subtype of `Quantity` and lacks elements like `comparator`. Data previously stored as full `Quantity` may need conversion to `SimpleQuantity` (if compatible) or a different representation strategy if features beyond `SimpleQuantity` were used.
    *   **Action:**
        *   Update logic to ensure `value[x]` is always populated within an `item.answer`.
        *   Modify systems to handle `SimpleQuantity` instead of `Quantity` for answers. Assess data migration needs for existing `Quantity` data.

### 3.2. Clarifications and Minor Element Changes

*   **`QuestionnaireResponse.item`, `item.linkId`, `item.answer` Flags:**
    *   In R6, these elements have the `flags: [C]` (Conditional) designation. This indicates their presence or interpretation might be subject to conditions defined elsewhere (e.g., in the `Questionnaire` or profiles). While not a direct structural change for parsing, it's a key consideration for validation logic and understanding resource constraints.

*   **`QuestionnaireResponse.item.answer.item` & `QuestionnaireResponse.item.item` (Short Description Clarified):**
    *   The `short` descriptions for these recursive elements have been refined in R6 to better clarify their specific nesting contexts:
        *   `item.answer.item`: R4 "Nested groups and questions" -> R6 "Child items of question" (i.e., for items nested *under an answer to a question*).
        *   `item.item`: R4 "Nested questionnaire response items" -> R6 "Child items of group item" (i.e., for items nested *directly under a group item*).
    *   This provides better semantic clarity but does not change the recursive structure itself.

## 4. Constraint Changes

The following constraint changes are notable:

*   **`qrs-1` (No substantial change):**
    *   **Description:** "Item cannot contain both item and answer" (R6) / "Nested item can't be beneath both item and answer" (R4).
    *   **Expression:** `(answer.exists() and item.exists()).not()` (Same in R4 and R6).
    *   **Impact:** This fundamental rule about item structure remains.

*   **`qrs-2` (New in R6):**
    *   **Location:** `QuestionnaireResponse.item`
    *   **Description:** "Repeated answers are combined in the answers array of a single item."
    *   **Expression:** `repeat(answer|item).select(item.where(answer.value.exists()).linkId.isDistinct()).allTrue()`
    *   **Impact:** Introduces a new validation rule regarding the structure of repeating answers for the same question (identified by `linkId`). Implementers creating responses should ensure they adhere to this to produce valid R6 resources.

*   **`qrs-3` (New in R6):**
    *   **Location:** `QuestionnaireResponse.item.linkId`
    *   **Description:** "LinkId cannot have leading or trailing spaces or intevening whitespace other than single space characters."
    *   **Expression:** `$this.matches('[^\\s]+( [^\\s]+)*')`
    *   **Impact:** Adds a specific format validation for `linkId` values. Systems generating or processing `linkId`s must ensure they conform.

## 5. Search Parameter Changes

R6 introduces a significant expansion of search capabilities for `QuestionnaireResponse`, particularly for querying its internal content.

### 5.1. Unchanged or Minorly Modified Search Parameters

The following R4 search parameters largely remain, with some reference target lists updated to reflect element type changes:

*   `author`: Targets updated to include `Group`.
*   `authored`: Unchanged.
*   `based-on`: Unchanged.
*   `encounter`: Unchanged.
*   `identifier`: Unchanged.
*   `part-of`: Unchanged.
*   `patient`: Unchanged.
*   `questionnaire`: Unchanged.
*   `source`: Targets updated to include `Device` and `Organization`.
*   `status`: Unchanged.
*   `subject`: Definition remains consistent, targets `Any`.

### 5.2. New Search Parameters in R6

R6 adds a powerful set of new search parameters to query based on `linkId` and answer values/types:

*   **Simple Answer Search Parameters:**
    *   `answer-concept`: (Type: `token`) For answers of type `boolean` or `Coding`.
    *   `answer-date`: (Type: `date`) For answers of type `date` or `dateTime`.
    *   `answer-number`: (Type: `number`) For answers of type `integer` or `decimal`.
    *   `answer-quantity`: (Type: `quantity`) For answers of type `Quantity` (note: `item.answer.value[x]` uses `SimpleQuantity`, but search parameter is typed as `Quantity`).
    *   `answer-reference`: (Type: `reference`) For answers of type `Reference(Any)`.
    *   `answer-string`: (Type: `string`) For answers of type `string`.
    *   *(Implicit `answer-uri`):* While not explicitly listed as a simple parameter in the provided R6 doc, the composite `item-uri` relies on an `answer-uri` component (expression `item.answer.value.ofType(Uri)`), suggesting querying for URI answer types is supported.

*   **Composite Item/Answer Search Parameters:** These combine a `linkid` with a specific answer type search:
    *   `item-concept` (components: `linkid`, `answer-concept`)
    *   `item-date` (components: `linkid`, `answer-date`)
    *   `item-number` (components: `linkid`, `answer-number`)
    *   `item-quantity` (components: `linkid`, `answer-quantity`)
    *   `item-reference` (components: `linkid`, `answer-reference`)
    *   `item-string` (components: `linkid`, `answer-string`)
    *   `item-uri` (components: `linkid`, `answer-uri`)

*   **Other New Search Parameters:**
    *   `item-subject`: (Type: `reference`) Allows searching for `QuestionnaireResponses` by item value where the item is marked as `isSubject` via an extension.
    *   `linkid`: (Type: `token`) Searches for the presence of a specific `linkId` anywhere within the response items.

*   **Impact of New Search Parameters:**
    *   This is a major enhancement, enabling servers and clients to perform much more granular queries on `QuestionnaireResponse` content without needing to retrieve and parse the entire resource.
    *   Implementers should update their systems to leverage these new search capabilities for improved data retrieval and analysis.
    *   Servers will need to implement indexing for these new parameters.
    *   The R6 documentation advises referring to specific searching guidance on the resource page for optimal use.

## 6. Key Migration Actions & Considerations

1.  **Address Mandatory `questionnaire` Link (Critical):**
    *   Modify systems creating `QuestionnaireResponse` to always include the `questionnaire` element.
    *   Develop a strategy for migrating R4 data, potentially identifying or assigning appropriate `Questionnaire` references.

2.  **Handle Mandatory `item.answer.value[x]` (Critical):**
    *   Ensure that if an `item.answer` element is present, its `value[x]` child is always populated.
    *   Review and update data generation logic accordingly.

3.  **Adapt to `SimpleQuantity` for Answers (Critical):**
    *   Change internal data models and processing logic from `Quantity` to `SimpleQuantity` for `item.answer.value[x]`.
    *   Plan data migration for existing `Quantity` answer values, converting them to `SimpleQuantity` or finding alternative representations if necessary.

4.  **Support Expanded Cardinalities:**
    *   Update systems to handle `0..*` for `QuestionnaireResponse.identifier` and `QuestionnaireResponse.item.definition` (i.e., expect arrays/lists).

5.  **Update Reference Type Handling:**
    *   Ensure `author` processing can handle `Reference(Group)`.
    *   Ensure `source` processing can handle `Reference(Device)` and `Reference(Organization)`.

6.  **Implement New Validation Logic:**
    *   Incorporate the new `qrs-2` constraint (structure of repeated answers) and `qrs-3` constraint (format of `linkId`) into validation processes.

7.  **Revise and Enhance API Queries:**
    *   Explore and utilize the new search parameters (e.g., `answer-*`, `item-*`, `linkid`) for more efficient and targeted data retrieval.
    *   Update server-side indexing to support these new parameters.

8.  **Review R6 Documentation and Guidance:**
    *   Familiarize teams with the more detailed guidance in the R6 specification for `QuestionnaireResponse`, especially regarding distinctions between `subject`/`source`/`author` and best practices for using new search parameters.

9.  **Consider Impact of Maturity Level Change:**
    *   The increased maturity level (R4 Level 3 to R6 Level 5) signals greater stability. This may influence decisions regarding adoption and long-term support.