## Impact of R6 Changes on `us-core-documentreference`

This section analyzes R6 base `documentreference` changes that directly affect core elements, constraints, and patterns defined or relied on by `us-core-documentreference`.

*   **`DocumentReference.date` (MustSupport)**
    *   **Relevant R6 Base Change:** The data type of `DocumentReference.date` changed from `instant` (R4) to `dateTime` (R6).
    *   **Direct Impact on `us-core-documentreference`:** The profile must be updated to reflect `dateTime` for this MustSupport element. Implementers will need to adapt to produce and consume `dateTime` values, which allow for less precision than `instant` (e.g., date-only). Data migration from `instant` to `dateTime` is generally straightforward as `instant` is a valid `dateTime`.

*   **`DocumentReference.content.format` (MustSupport)**
    *   **Relevant R6 Base Change:** The R4 element `DocumentReference.content.format` (type `Coding`) has been removed and replaced by the R6 backbone element `DocumentReference.content.profile`. This new element is `0..*` and contains `profile.value[x]` which can be `Coding`, `uri`, or `canonical`.
    *   **Direct Impact on `us-core-documentreference`:** This is a significant structural change impacting a MustSupport element. `us-core-documentreference` currently mandates `content.format` and binds it to a ValueSet. The profile will need to be redesigned to:
        1.  Use `DocumentReference.content.profile` instead of `content.format`.
        2.  Make `content.profile` (or a specific choice within its `value[x]`, e.g., `valueCoding`) MustSupport.
        3.  Re-apply the terminology binding (e.g., `http://terminology.hl7.org/ValueSet/v3-HL7FormatCodes`) to the appropriate part of `content.profile` (likely `content.profile.valueCoding`).

*   **`DocumentReference.context` and its sub-elements (MustSupport: `context`, `context.encounter`, `context.period`)**
    *   **Relevant R6 Base Change:** The R4 `DocumentReference.context` backbone element has been removed. Its constituent data points are now represented as:
        *   A new top-level `DocumentReference.context` element (`0..* Reference(Appointment | Encounter | EpisodeOfCare)`).
        *   Individual top-level elements for other previous sub-elements (e.g., R4 `context.period` is now R6 `DocumentReference.period`; R4 `context.event` is now R6 `DocumentReference.event`).
    *   **Direct Impact on `us-core-documentreference`:** This is a major structural change requiring substantial re-profiling:
        *   The MustSupport status on the R4 `DocumentReference.context` (as a backbone element) needs re-evaluation. The US Core team must decide how this intent maps to the new R6 structure (e.g., make the new top-level `DocumentReference.context` list MustSupport, or specific formerly nested elements that are now top-level).
        *   `us-core-documentreference` constraints on `DocumentReference.context.encounter` (MustSupport, `0..1`, targetProfile `us-core-encounter`) must be moved. This will likely involve constraining the new top-level `DocumentReference.context` list (which is `0..*` in R6 base). Slicing may be needed to enforce the cardinality and specific type for the Encounter reference.
        *   `us-core-documentreference` constraints on `DocumentReference.context.period` (MustSupport) must be moved to the new top-level `DocumentReference.period` element.

*   **`DocumentReference.docStatus` (Not MustSupport in US Core, but relevant base change)**
    *   **Relevant R6 Base Change:** The `docStatus` element in R6 is now marked as `isModifier: true`. Its value set (`composition-status`) has also been significantly expanded.
    *   **Direct Impact on `us-core-documentreference`:** While US Core does not currently profile `docStatus`, this change in the base resource is critical. If `docStatus` is used in instances (e.g., `entered-in-error`), it now formally affects the interpretation of the DocumentReference resource itself. The US Core team should consider if guidance or new constraints related to `docStatus` are necessary for the profile.

*   **`DocumentReference.identifier` (MustSupport) and R4 `masterIdentifier`**
    *   **Relevant R6 Base Change:** R4 `masterIdentifier` is removed. R6 introduces `DocumentReference.version` (string, `0..1`) for explicit content versioning. R6 `DocumentReference.identifier` is for business identifiers that remain constant across versions.
    *   **Direct Impact on `us-core-documentreference`:** The MustSupport on `DocumentReference.identifier` remains. However, if implementers were using the R4 base element `masterIdentifier` for versioning alongside `us-core-documentreference` instances, they will need to map this to the new R6 `DocumentReference.version` element. The profile itself may not need direct changes for `identifier` but could offer guidance on this mapping.

---
## Migration Summary & Actionable Takeaways for `us-core-documentreference`

*   **US Core Profile Changes Required:** Yes, significant re-profiling is necessary.
    1.  **`DocumentReference.date`**: Update type from `instant` to `dateTime`.
    2.  **`DocumentReference.content.format`**:
        *   Replace with `DocumentReference.content.profile`.
        *   Make `content.profile` (or likely `content.profile.valueCoding`) MustSupport.
        *   Re-apply the existing terminology binding to `content.profile.valueCoding`.
    3.  **`DocumentReference.context` (R4 backbone)**:
        *   Remove constraints on the R4 `context` backbone.
        *   Map the MustSupport constraint on R4 `context.encounter` (including target profile and cardinality) to the new R6 top-level `DocumentReference.context` list of references. This will likely require slicing the list.
        *   Map the MustSupport constraint on R4 `context.period` to the new R6 top-level `DocumentReference.period`.
        *   Re-evaluate the intent of the MustSupport on the old `context` backbone and apply appropriate MustSupport flags to the new R6 elements (e.g., the R6 `context` list or other promoted elements like `event`).
    4.  **(Consideration)** Add guidance or constraints for `DocumentReference.docStatus` due to its new `isModifier: true` status in R6.
    5.  **(Consideration)** Add guidance on migrating R4 `masterIdentifier` to R6 `DocumentReference.version` for implementers.
    6.  Review new R6 base constraints (`docRef-1`, `docRef-2`) for any interaction with US Core profiling choices for context-related elements.

*   **Implementation Changes Required:** Yes, implementers will need to:
    1.  **Update Data Models and Instances:**
        *   Change `DocumentReference.date` from `instant` to `dateTime`.
        *   Restructure content from `DocumentReference.content.format` to `DocumentReference.content.profile`.
        *   Restructure context data from the R4 `DocumentReference.context` backbone to the new R6 top-level `DocumentReference.context` list and other top-level elements (e.g., `DocumentReference.period`).
        *   If previously using R4 `masterIdentifier`, migrate to R6 `DocumentReference.version`.
        *   If previously using R4 `authenticator`, migrate to R6 `DocumentReference.attester`.
    2.  **Update Code Logic:**
        *   Adapt to the new data structures and locations for the elements mentioned above.
        *   Handle `DocumentReference.docStatus` as a modifier element if it's populated in received instances.
    3.  **Update API Interactions:**
        *   Search parameter names and expressions have changed for context elements (e.g., R4 `encounter` search parameter functionality is now via R6 `context` search parameter) and for format (R4 `format` search parameter is replaced by R6 `format-code`, `format-uri`, `format-canonical`). All queries need review and potential updates.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`DocumentReference.version`**: Offers a standard field for document content versioning, aligning well with managing document updates.
    *   **`DocumentReference.attester`**: Provides a more structured way to capture attestations compared to the R4 `authenticator`.
    *   These could be considered for future enhancements to `us-core-documentreference`.

---
## Overall Migration Impact
Impact: **Significant**

The `us-core-documentreference` profile requires significant updates due to structural changes in the base `DocumentReference` resource, particularly concerning the `context` element and `content.format` (which becomes `content.profile`). These changes affect MustSupport elements and require careful re-profiling decisions. Implementers will face considerable effort in data migration, updating code logic, and revising API queries. Community consensus will be important for adapting US Core's specific constraints (e.g., for `context.encounter`) to the new R6 structures.