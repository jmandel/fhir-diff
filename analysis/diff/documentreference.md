# FHIR DocumentReference Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR DocumentReference resource between R4 and R6, focusing on aspects critical for implementers migrating systems or supporting both versions.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the DocumentReference resource from R4 to R6 involves substantial changes, including element additions, removals, type modifications, and structural reorganizations. Key impacts include:

1.  **Resource Maturity and Scope:** R6 DocumentReference has an increased maturity level (3 to 5) and its scope is explicitly broadened to include multimedia like photos, videos, and audio recordings. The responsible HL7 workgroup has also changed from "Structured Documents" to "Orders and Observations," reflecting this wider applicability.
2.  **Breaking Change: `docStatus` Modifier:** The `docStatus` element in R6 is now marked as `isModifier: true`. This means certain document statuses (e.g., `entered-in-error`, and potentially others from the expanded value set) can affect the interpretation of the DocumentReference resource itself, potentially invalidating it. This is a critical semantic change requiring careful handling.
3.  **Structural Reorganization of `context`:** The R4 `DocumentReference.context` backbone element has been removed. Its constituent data points (like `encounter`, `event`, `period`, `facilityType`, `practiceSetting`, `related`) are now represented as:
    *   A new top-level `context` element (`0..* Reference(Appointment | Encounter | EpisodeOfCare)`).
    *   Other individual top-level elements (e.g., `event`, `period`, `facilityType`, `practiceSetting`, `related`). This requires significant data model and mapping changes.
4.  **Identifier Handling Refactored:**
    *   R4 `masterIdentifier` is removed.
    *   R6 introduces `version` (string, `0..1`) for explicit content versioning.
    *   R6 `identifier` (`0..*`) is for business identifiers that remain constant. Data from R4 `masterIdentifier` may map to R6 `version`.
5.  **Authentication to Attestation:** R4 `authenticator` is removed and replaced by a more structured `attester` backbone element in R6, allowing multiple attestations with mode, time, and party.
6.  **Content Profiling Enhanced:** R4 `content.format` (type `Coding`) is replaced by R6 `content.profile` (a backbone element allowing `valueCoding`, `valueUri`, or `valueCanonical`), offering richer ways to specify document conformance.
7.  **New Elements:** R6 introduces several new elements like `basedOn`, `modality`, and `bodySite`, expanding the resource's descriptive capabilities, particularly for media and observation-related contexts.
8.  **Type Changes:**
    *   `subject`: Type changed from a constrained list of references in R4 to `Reference(Any)` in R6, increasing flexibility.
    *   `date`: Type changed from `instant` to `dateTime`.
    *   `description`: Type changed from `string` to `markdown`.
    *   `relatesTo.code`: Type changed from `code` to `CodeableConcept`, and binding strength from `required` to `extensible`.
9.  **Search Parameter Overhaul:** Many search parameters have been added, removed, or had their expressions changed due to the underlying element modifications. Query logic will need significant updates.
10. **New Constraints:** R6 introduces `docRef-1` and `docRef-2` relating to the use of `facilityType`/`practiceSetting` with the new `context` element.

Implementers must anticipate data migration efforts, updates to data access and validation logic, and comprehensive revisions to API queries.

## 2. Overall Resource Scope and Purpose

*   **Maturity and Governance:**
    *   **R4:** Maturity Level 3 (Trial Use), HL7 Workgroup: Structured Documents.
    *   **R6:** Maturity Level 5 (Trial Use, but higher on the scale), HL7 Workgroup: Orders and Observations.
    *   **Impact:** The increase in maturity suggests broader adoption and stability. The change in workgroup, along with explicit mentions in R6, signifies an expanded scope beyond traditional text-based or structured documents to include a wider array of clinical evidence, including multimedia and observation-related artifacts.

*   **Scope Expansion:**
    *   **R4:** Focused on "any serialized object with a mime-type," including CDA, clinical notes, scanned paper, and non-patient specific documents.
    *   **R6:** Explicitly broadens this to encompass "a photo, video, or audio recording acquired or used in healthcare," in addition to the R4 scope.
    *   **Impact:** Systems using DocumentReference should be prepared to handle metadata for a wider variety of content types. This aligns with the new `modality` element and the "Orders and Observations" workgroup.

## 3. Element-Level Changes

This section details additions, modifications, and removals of elements at the top level of the DocumentReference resource, or within its direct backbone elements. Major structural reorganizations are discussed in Section 4.

### 3.1. New Elements in R6 (at the top level)

*   **`DocumentReference.version`**
    *   **Cardinality:** `0..1`
    *   **Type:** `string`
    *   **Purpose:** An explicitly assigned identifier for a logical version of the DocumentReference content. Distinct from `Resource.meta.versionId`.
    *   **Impact/Action:** Replaces the concept of R4 `masterIdentifier` for version-specific identification. Data from R4 `masterIdentifier` might be migrated here. A new search parameter `version` is available.

*   **`DocumentReference.basedOn`**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(Appointment | AppointmentResponse | CarePlan | Claim | ... many request/response resources)`
    *   **Purpose:** Links the document reference to a procedure or request that it fulfills.
    *   **Impact/Action:** Supports new use cases linking documents to workflow items. Implement if relevant. New search parameter `based-on`.

*   **`DocumentReference.modality`**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** DICOM Modality Codes (extensible)
    *   **Purpose:** Specifies the imaging modality used (e.g., CT, MR, XA).
    *   **Impact/Action:** Essential for systems handling imaging or multimedia. New search parameter `modality`.

*   **`DocumentReference.bodySite`**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference(BodyStructure)`
    *   **Binding:** Body Site Value Set (example)
    *   **Purpose:** Describes the anatomic structures included in the document.
    *   **Impact/Action:** Useful for anatomical context, especially for imaging or procedural notes. New search parameters `bodysite` (token) and `bodysite-reference` (reference).

*   **`DocumentReference.attester`** (BackboneElement, replaces R4 `authenticator`)
    *   See Section 4.4 for detailed structural comparison.

*   **Promoted `context`-related elements:**
    *   `DocumentReference.event` (Type: `CodeableReference(Any)`) - R4 `context.event` was `CodeableConcept`.
    *   `DocumentReference.period` (Type: `Period`) - R4 `context.period` was `Period`.
    *   `DocumentReference.facilityType` (Type: `CodeableConcept`) - R4 `context.facilityType` was `CodeableConcept`.
    *   `DocumentReference.practiceSetting` (Type: `CodeableConcept`) - R4 `context.practiceSetting` was `CodeableConcept`.
    *   `DocumentReference.related` (Type: `Reference(Any)`) - R4 `context.related` was `Reference(Any)`.
    *   **Impact/Action:** These elements are now top-level, reflecting the dissolution of the R4 `context` backbone. Data migration and structural code changes are required. Search parameters are updated accordingly.

### 3.2. Modified Elements (R4 to R6)

*   **`DocumentReference.identifier` (R4 `masterIdentifier` + `identifier`)**
    *   **R4:** Had `masterIdentifier` (0..1, version-specific) and `identifier` (0..*, other identifiers).
    *   **R6:** Has `identifier` (0..*, business identifiers constant across updates) and `version` (0..1, string, for content variation).
    *   **Impact/Action:** **Breaking Change.** R4 `masterIdentifier` likely maps to R6 `version`. R4 `identifier` maps to R6 `identifier`. Logic for identifying and versioning documents needs review. The `identifier` search parameter expression changes.

*   **`DocumentReference.status`**
    *   **R4/R6 Type:** `code`
    *   **R4/R6 Cardinality:** `1..1`
    *   **R4/R6 Binding:** `document-reference-status` (required)
    *   **R4/R6 `isModifier`:** `true`
    *   **Change:** The ValueSet URI now implicitly points to the R6 version (`http://hl7.org/fhir/ValueSet/document-reference-status` without a version). No major change in definition or core values, but ensure use of the R6 version of the value set.

*   **`DocumentReference.docStatus`**
    *   **R4 Type:** `code`
    *   **R6 Type:** `code`
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `0..1`
    *   **R4 `isModifier`:** `false`
    *   **R6 `isModifier`:** `true`
        *   **ModifierReason (R6):** "This element is labelled as a modifier because it is a status element that contains status `entered-in-error` which means that the resource should not be treated as valid."
    *   **Binding (Value Set `composition-status`):**
        *   **R4:** `http://hl7.org/fhir/ValueSet/composition-status|4.0.1` (Values: `preliminary | final | amended | entered-in-error`)
        *   **R6:** `http://hl7.org/fhir/ValueSet/composition-status` (Values: `registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | deprecated | unknown`)
    *   **Impact/Action:** **Critical Breaking Change.**
        1.  The change to `isModifier: true` means that the status of the *underlying document* can now render the *DocumentReference resource itself* as not current or invalid (if `entered-in-error` or potentially other statuses are used). This requires significant review of how `docStatus` is handled and interpreted.
        2.  The value set for `docStatus` has been significantly expanded in R6. Systems must support these new codes and understand their implications, especially those that might be considered equivalent to `entered-in-error`.
        3.  Data migration may be needed if R4 used local extensions for statuses now covered in R6.
        4.  A new search parameter `doc-status` is available.

*   **`DocumentReference.type`**
    *   **R4/R6 Type:** `CodeableConcept`
    *   **R4/R6 Cardinality:** `0..1`
    *   **Binding:**
        *   **R4:** `http://hl7.org/fhir/ValueSet/c80-doc-typecodes` (preferred)
        *   **R6:** `http://hl7.org/fhir/ValueSet/doc-typecodes` (preferred)
    *   **Impact/Action:** The value set URI changed slightly (removal of `c80-` prefix, typically meaning broader HL7 standard). Review code mappings to ensure compatibility with the R6 value set.

*   **`DocumentReference.category`**
    *   **R4/R6 Type:** `CodeableConcept`
    *   **R4/R6 Cardinality:** `0..*`
    *   **Binding:**
        *   **R4:** `http://hl7.org/fhir/ValueSet/document-classcodes` (example)
        *   **R6:** `http://hl7.org/fhir/ValueSet/referenced-item-category` (example)
    *   **Impact/Action:** The bound value set has changed. Review current codes and map to the new value set if necessary.

*   **`DocumentReference.subject`**
    *   **R4 Type:** `Reference(Patient | Practitioner | Group | Device)`
    *   **R6 Type:** `Reference(Any)`
    *   **Impact/Action:** Significant broadening of allowed subject types. Systems can now reference any resource as the subject. This offers more flexibility but may require downstream systems to handle a wider variety of reference types.

*   **`DocumentReference.context`** (Element name retained but radically changed)
    *   **R4:** `0..1` BackboneElement (containing `encounter`, `event`, `period`, etc.)
    *   **R6:** `0..* Reference(Appointment | Encounter | EpisodeOfCare)`
    *   **Impact/Action:** **Major Structural Change.** This is not a simple modification but a complete redesign. See Section 4.2 for details.

*   **`DocumentReference.date`** (Timestamp of DocumentReference creation)
    *   **R4 Type:** `instant`
    *   **R6 Type:** `dateTime`
    *   **Impact/Action:** Change from `instant` (requires timezone offset Z or +/-HH:mm) to `dateTime` (allows date, date-time, or date-time with timezone). This offers more flexibility in precision. Ensure systems can handle the `dateTime` format. Data migration should be straightforward if R4 `instant` values are valid `dateTime` values.

*   **`DocumentReference.author`**
    *   **R4 Types:** `Reference(Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson)`
    *   **R6 Types:** `Reference(Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson | CareTeam | Group)`
    *   **Impact/Action:** Expanded to include `CareTeam` and `Group` (with specific usage notes for `Group` in R6). Adapt systems if these new author types are relevant.

*   **`DocumentReference.relatesTo.code`**
    *   **R4 Type:** `code`
    *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/document-relationship-type|4.0.1` (strength: `required`)
    *   **R6 Type:** `CodeableConcept`
    *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/document-relationship-type` (strength: `extensible`)
    *   **Impact/Action:** Change from `code` to `CodeableConcept` allows for text or multiple codings. The binding strength change to `extensible` allows using codes outside the specified value set. This increases flexibility but requires systems to potentially handle more varied data.

*   **`DocumentReference.description`**
    *   **R4 Type:** `string`
    *   **R6 Type:** `markdown`
    *   **Impact/Action:** Allows richer formatting for the description. Systems displaying this field should be capable of rendering markdown. Data migration from `string` is simple.

*   **`DocumentReference.securityLabel`**
    *   **R4/R6 Type:** `CodeableConcept`
    *   **R4/R6 Cardinality:** `0..*`
    *   **Binding:**
        *   **R4:** `http://hl7.org/fhir/ValueSet/security-labels` (extensible)
        *   **R6:** `http://hl7.org/fhir/ValueSet/security-label-examples` (example)
    *   **Impact/Action:** The value set has changed (from general security labels to examples), and the R6 description emphasizes HCS. Review current security label usage and align with R6 guidance and value sets if necessary. The strength change to `example` implies more flexibility.

*   **`DocumentReference.content.attachment`**
    *   No direct changes to `Attachment` type noted here, but it's worth noting R6 `Attachment` may have its own R4->R6 changes. The `content.attachment.creation` field is now searchable via the `creation` search parameter in R6.

### 3.3. Removed Elements from R4

*   **`DocumentReference.masterIdentifier`**
    *   **Rationale/Impact:** Functionality absorbed by R6 `DocumentReference.identifier` and the new `DocumentReference.version`. Data migration needed.

*   **`DocumentReference.authenticator`**
    *   **Rationale/Impact:** Replaced by the more structured `DocumentReference.attester` backbone element in R6. Data migration to the new `attester` structure is required.

*   **`DocumentReference.context` (as a BackboneElement and its R4 sub-elements)**
    *   **Rationale/Impact:** The entire R4 `context` backbone structure (`context.encounter`, `context.event`, `context.period`, `context.facilityType`, `context.practiceSetting`, `context.sourcePatientInfo`, `context.related`) is removed. Its functionalities are now handled by a new top-level `context` reference list and other promoted top-level elements in R6. See Section 4.2.
    *   `context.sourcePatientInfo` (R4) does not have a direct one-to-one top-level field in R6. This information might be inferred from `DocumentReference.subject` or other contextual elements, or require extensions if specific R4 semantics must be preserved.

*   **`DocumentReference.content.format`**
    *   **Rationale/Impact:** Replaced by the more flexible `DocumentReference.content.profile` backbone element in R6. See Section 4.3.

## 4. Key Structural Reorganizations

Several areas of the DocumentReference resource have undergone significant structural changes:

### 4.1. Identifier and Versioning (`masterIdentifier` vs. `identifier`/`version`)

*   **R4:**
    *   `masterIdentifier` (`0..1 Identifier`): "Master Version Specific Identifier."
    *   `identifier` (`0..* Identifier`): "Other identifiers for the document."
*   **R6:**
    *   `identifier` (`0..* Identifier`): "Business identifiers for the document." (Remain constant as resource propagates)
    *   `version` (`0..1 string`): "An explicitly assigned identifier of a variation of the content."
*   **Impact & Action:** This is a conceptual refactoring.
    *   Data previously in R4 `masterIdentifier` likely maps to R6 `version`.
    *   Data previously in R4 `identifier` maps to R6 `identifier`.
    *   Implementers need to adjust logic for how document versions and persistent business identifiers are stored and queried. The `identifier` search parameter changes its expression, and a new `version` search parameter is added.

### 4.2. Context Representation (`DocumentReference.context` backbone removal and element promotion)

*   **R4:** `DocumentReference.context` was a `0..1` BackboneElement containing:
    *   `encounter`: `0..* Reference(Encounter | EpisodeOfCare)`
    *   `event`: `0..* CodeableConcept`
    *   `period`: `0..1 Period`
    *   `facilityType`: `0..1 CodeableConcept`
    *   `practiceSetting`: `0..1 CodeableConcept`
    *   `sourcePatientInfo`: `0..1 Reference(Patient)`
    *   `related`: `0..* Reference(Any)`
*   **R6:** The R4 `context` backbone element is removed. Its information is now represented by:
    *   **`DocumentReference.context` (new interpretation):** `0..* Reference(Appointment | Encounter | EpisodeOfCare)`. This is a direct list of references establishing the primary clinical context(s).
    *   **`DocumentReference.event`:** `0..* CodeableReference(Any)` (promoted to top-level, type changed from `CodeableConcept`).
    *   **`DocumentReference.period`:** `0..1 Period` (promoted to top-level).
    *   **`DocumentReference.facilityType`:** `0..1 CodeableConcept` (promoted to top-level).
    *   **`DocumentReference.practiceSetting`:** `0..1 CodeableConcept` (promoted to top-level).
    *   **`DocumentReference.related`:** `0..* Reference(Any)` (promoted to top-level).
    *   R4 `context.sourcePatientInfo` does not have a direct named equivalent at the top level in R6. This information is typically covered by `DocumentReference.subject`. If more specific "source" patient demographics were captured, this might need to be handled via `subject` or extensions.
*   **Impact & Action:** **Breaking Change requiring significant data model refactoring and data migration.**
    *   Data from R4 `context.encounter` maps to the new R6 `DocumentReference.context`.
    *   Data from other R4 `context.*` sub-elements maps to their new top-level R6 counterparts.
    *   Logic for accessing and validating contextual information must be rewritten.
    *   Search parameters related to these fields have changed their expressions (e.g., `encounter` SP becomes `context` SP in R6, `event` SP becomes `event-code`/`event-reference`).

### 4.3. Content Profiling (`content.format` to `content.profile`)

*   **R4:** `DocumentReference.content.format`
    *   **Type:** `Coding`
    *   **Cardinality:** `0..1`
    *   **Purpose:** "Format/content rules for the document."
    *   **Binding:** `formatcodes` (preferred)
*   **R6:** `DocumentReference.content.profile`
    *   **Type:** BackboneElement
    *   **Cardinality:** `0..*`
    *   **Structure:** Contains `profile.value[x]` which can be `Coding`, `uri`, or `canonical` (`1..1`).
    *   **Purpose:** "An identifier of the document constraints, encoding, structure, and template that the document conforms to beyond the base format indicated in the mimeType."
    *   **Binding (on `valueCoding`):** `v3-HL7FormatCodes` (preferred)
*   **Impact & Action:** **Breaking Change.** The mechanism for specifying document format or profile conformance is significantly enhanced and more structured.
    *   Data from R4 `content.format` (a single `Coding`) needs to be migrated into the new `content.profile.valueCoding` structure.
    *   R6 allows multiple profiles and supports URIs/canonicals directly for profiles (e.g., FHIR StructureDefinition canonicals).
    *   The R4 `format` search parameter is replaced by R6 `format-code`, `format-uri`, and `format-canonical` search parameters.

### 4.4. Authentication (`authenticator` to `attester`)

*   **R4:** `DocumentReference.authenticator`
    *   **Type:** `Reference(Practitioner | PractitionerRole | Organization)`
    *   **Cardinality:** `0..1`
    *   **Purpose:** "Who/what authenticated the document."
*   **R6:** `DocumentReference.attester`
    *   **Type:** BackboneElement
    *   **Cardinality:** `0..*`
    *   **Structure:** Contains:
        *   `mode`: `1..1 CodeableConcept` (e.g., personal, professional)
        *   `time`: `0..1 dateTime`
        *   `party`: `0..1 Reference(Patient | RelatedPerson | Practitioner | PractitionerRole | Organization | Group)`
    *   **Purpose:** "A participant who has authenticated the accuracy of the document."
*   **Impact & Action:** **Breaking Change.** R6 provides a more detailed and flexible way to record attestations.
    *   Data from R4 `authenticator` (a single reference) needs to be migrated to the `attester.party` field in R6.
    *   The `attester.mode` will need to be determined (e.g., defaulted if not previously captured). `attester.time` can be populated if known.
    *   R6 allows multiple attesters.
    *   The R4 `authenticator` search parameter is replaced by the R6 `attester` search parameter (targeting `attester.party`).

## 5. Constraint Changes

*   **R4:** No specific constraints (e.g., `docRef-X`) were listed in the provided R4 documentation.
*   **R6:** Introduces the following constraints:
    *   **`docRef-1` (Warning):** `facilityType SHALL only be present if context is not an encounter` (Expression: `facilityType.empty() or context.where(resolve() is Encounter).empty()`)
        *   **Impact:** If `DocumentReference.context` (the R6 list of references) includes an `Encounter`, then `facilityType` should not be populated.
    *   **`docRef-2` (Warning):** `practiceSetting SHALL only be present if context is not present` (Expression: `practiceSetting.empty() or context.where(resolve() is Encounter).empty()`)
        *   **Impact:** A slight difference in the R6 provided expression `context.where(resolve() is Encounter).empty()` versus the description "context is not present". Assuming the expression is canonical, if `DocumentReference.context` includes an `Encounter`, then `practiceSetting` should not be populated. If the intent is "if context is empty", the expression might be `context.empty()`. The provided R6 markdown has the same expression for both, which seems like an error in transcription from the source HTML. Assuming the description is more accurate for `docRef-2` ("if context is not present"), the expression should be `practiceSetting.empty() or context.empty()`. However, based strictly on the provided markdown, both have the same expression targeting encounters.
        *   **Correction based on typical FHIR patterns & provided R6 HTML constraint description:** The expression for `docRef-2` likely intends to check if the *entire* `context` element is empty, not just if it lacks an Encounter. If the provided R6 expression (`practiceSetting.empty() or context.where(resolve() is Encounter).empty()`) is strictly followed, it means `practiceSetting` can only be present if there's no Encounter in `context`, or if `context` is empty. Implementers should verify this against the canonical R6 specification.
*   **Action:** Implement validation for these new constraints. Review existing data to see if it violates these new rules and plan remediation.

## 6. Search Parameter Changes

Numerous search parameters have been added, removed, or modified due to the underlying element changes.

### 6.1. New Search Parameters in R6

*   **`attester`**: Replaces R4 `authenticator`. Targets `DocumentReference.attester.party`.
*   **`based-on`**: Targets `DocumentReference.basedOn`.
*   **`bodysite`**: Targets `DocumentReference.bodySite.concept`.
*   **`bodysite-reference`**: Targets `DocumentReference.bodySite.reference`.
*   **`context`**: Targets the new R6 `DocumentReference.context` (list of References). Replaces R4 `encounter` in function.
*   **`creation`**: Targets `DocumentReference.content.attachment.creation`.
*   **`doc-status`**: Targets `DocumentReference.docStatus`.
*   **`event-code`**: Targets `DocumentReference.event.concept` (for the CodeableReference).
*   **`event-reference`**: Targets `DocumentReference.event.reference` (for the CodeableReference).
*   **`format-canonical`**: Targets `DocumentReference.content.profile.value.ofType(canonical)`. Part of replacing R4 `format`.
*   **`format-code`**: Targets `DocumentReference.content.profile.value.ofType(Coding)`. Part of replacing R4 `format`.
*   **`format-uri`**: Targets `DocumentReference.content.profile.value.ofType(uri)`. Part of replacing R4 `format`.
*   **`modality`**: Targets `DocumentReference.modality`.
*   **`version`**: Targets `DocumentReference.version`.

### 6.2. Removed Search Parameters from R4

*   **`authenticator`**: Replaced by `attester`.
*   **`encounter`**: Functionality covered by R6 `context` search parameter.
*   **`event`** (token search on R4 `context.event`): Replaced by `event-code` and `event-reference`.
*   **`format`**: Replaced by `format-code`, `format-uri`, `format-canonical`.

### 6.3. Modified Search Parameters (R4 to R6)

*   **`author`**:
    *   R4 Expression: `DocumentReference.author`
    *   R6 Expression: `DocumentReference.author`
    *   R4 Targets: `[Practitioner, PractitionerRole, Organization, Device, Patient, RelatedPerson]`
    *   R6 Targets: `[Practitioner, Group, Organization, CareTeam, Device, Patient, PractitionerRole, RelatedPerson]`
    *   **Impact:** Target resource types expanded.

*   **`identifier`**:
    *   R4 Expression: `DocumentReference.masterIdentifier | DocumentReference.identifier`
    *   R6 Expression: `DocumentReference.identifier`
    *   **Impact:** Simpler expression due to removal of `masterIdentifier`. Queries targeting R4 `masterIdentifier` via this SP need to use the new `version` SP in R6.

*   **`patient`**: (and implicitly `subject`)
    *   `subject` R4 Targets: `[Patient, Practitioner, Group, Device]`
    *   `subject` R6 Targets: `[Any]` (as `DocumentReference.subject` is now `Reference(Any)`)
    *   `patient` SP expression `DocumentReference.subject.where(resolve() is Patient)` remains conceptually similar.
    *   **Impact:** While `patient` SP is specific, the underlying `subject` element it queries is now much broader. If generic `subject` queries were used, they can now return more types.

*   **`related`**:
    *   R4 Expression: `DocumentReference.context.related`
    *   R6 Expression: `DocumentReference.related` (now a top-level element)
    *   **Impact:** Expression changed due to element promotion.

*   **`relatesto`** and **`relation`** (and composite **`relationship`**):
    *   `relation` (token for `relatesTo.code`):
        *   R4 Expression: `DocumentReference.relatesTo.code`
        *   R6 Expression: `DocumentReference.relatesTo.code` (targets `CodeableConcept` now)
        *   **Impact:** Targets a `CodeableConcept` in R6 instead of a `code`. This might affect how token search works if text or multiple codings are used.
    *   The composite `relationship` relies on these; expressions for its components (`code`, `target`) within the `relatesTo` backbone remain structurally similar.

*   **Search parameters for promoted context fields** (e.g., `facility`, `period`, `setting`):
    *   Their expressions change from `DocumentReference.context.FIELD_NAME` in R4 to `DocumentReference.FIELD_NAME` in R6.
    *   Example: `facility`
        *   R4 Expression: `DocumentReference.context.facilityType`
        *   R6 Expression: `DocumentReference.facilityType`

*   **`status`** (for `DocumentReference.status`): No significant change in expression, but ensure value set alignment.
*   **`type`**: No significant change in expression, but ensure value set alignment.

**Impact/Action for Search Parameters:** Implementers must review and update ALL queries involving DocumentReference. This includes changing parameter names, adjusting values for token searches if underlying bindings changed, and modifying logic for parameters with new expressions or target types.

## 7. Key Migration Actions & Considerations

1.  **Address `docStatus` Semantic Change (Critical):**
    *   Update logic to recognize `docStatus` as `isModifier: true`.
    *   Support the expanded R6 `docStatus` value set.
    *   Assess how statuses like `entered-in-error`, `cancelled`, `deprecated` in `docStatus` will affect the DocumentReference's validity in your system.

2.  **Refactor Context Handling (Critical):**
    *   Migrate data from the R4 `DocumentReference.context` backbone to the new R6 top-level `context` (list of references) and other promoted top-level elements (`event`, `period`, `facilityType`, `practiceSetting`, `related`).
    *   Update all code that reads or writes these contextual elements.
    *   Identify how R4 `context.sourcePatientInfo` will be handled (likely via `subject` or extensions).

3.  **Update Identifier and Versioning Logic:**
    *   Migrate R4 `masterIdentifier` data, likely to R6 `version`.
    *   Map R4 `identifier` to R6 `identifier`.
    *   Adjust system logic for document versioning and identification accordingly.

4.  **Migrate Authentication to Attestation:**
    *   Transform R4 `authenticator` data into the new R6 `attester` backbone structure (`mode`, `time`, `party`).
    *   Determine appropriate `attester.mode` values.

5.  **Adapt to Content Profiling Changes:**
    *   Migrate R4 `content.format` (`Coding`) to R6 `content.profile.valueCoding`.
    *   Consider leveraging R6's ability to use `valueUri` or `valueCanonical` for richer profile specification.

6.  **Handle Data Type Changes:**
    *   `subject`: Prepare for `Reference(Any)`.
    *   `date`: Change from `instant` to `dateTime` handling.
    *   `description`: Enable markdown rendering.
    *   `relatesTo.code`: Adapt to `CodeableConcept` from `code`.

7.  **Incorporate New R6 Elements:** Evaluate and implement support for new elements like `basedOn`, `modality`, `bodySite` as relevant to your use cases.

8.  **Update Value Set Mappings:** Review and update mappings for `type`, `category`, `securityLabel`, and other elements with changed or updated value set bindings.

9.  **Implement New Constraints:** Add validation for `docRef-1` and `docRef-2`.

10. **Overhaul API Queries:** Revise all search queries to use new R6 search parameter names, expressions, and types. This is a widespread change.

11. **Test Thoroughly:** Given the extent of these changes, comprehensive testing of data migration, API interactions, and business logic is crucial.

12. **Consider Scope Expansion:** Evaluate if the explicit inclusion of multimedia (photos, videos, audio) in R6 affects your system's scope or handling of DocumentReference resources.

This migration involves significant effort. Plan carefully, focusing on breaking changes and areas requiring data transformation. Prioritize understanding the semantic shifts, particularly around `docStatus` and the `context` reorganization.