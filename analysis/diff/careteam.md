# FHIR CareTeam Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR CareTeam resource between R4 and R6, focusing on aspects critical for implementers. It aims to aid in migration and system adaptation by providing clear, actionable information.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the CareTeam resource from R4 to R6 involves several impactful changes:

1.  **Reason for CareTeam (Breaking Change):** The R4 elements `reasonCode` (CodeableConcept) and `reasonReference` (Reference(Condition)) have been **merged** into a single R6 element `reason` of type `CodeableReference(Condition)`. This requires data model updates and migration.
2.  **Participant Role Cardinality (Breaking Change):** The `CareTeam.participant.role` element's cardinality has changed from `0..*` (multiple roles per participant entry allowed) in R4 to `0..1` (only one role per participant entry) in R6. Data with multiple roles per participant entry will need to be restructured.
3.  **Participant Period to Effective[x] (Breaking Change):** `CareTeam.participant.period` (type `Period`) in R4 has been **renamed** to `CareTeam.participant.effective[x]` in R6, and its type changed to `Period | Timing`.
4.  **Removal of `CareTeam.encounter` (Breaking Change):** The `CareTeam.encounter` element, linking the CareTeam to a specific `Encounter`, has been removed in R6. The `Encounter` compartment for CareTeam has also been removed.
5.  **Expanded Participant Member Types:** `CareTeam.participant.member` in R6 now allows `Reference(Group)` in addition to R4 types.
6.  **Expanded Participant `onBehalfOf` Types:** `CareTeam.participant.onBehalfOf` has significantly expanded its allowed reference types from just `Organization` in R4 to include `Practitioner`, `PractitionerRole`, `RelatedPerson`, `Patient`, `CareTeam`, and `Group` in R6.
7.  **Constraint Changes:** The R4 constraint `ctm-1` (related to `onBehalfOf` and `Practitioner` member) has been removed. A new R6 warning constraint `ctm-2` has been added, suggesting `participant.role` or `participant.member` should exist.
8.  **Search Parameter Changes:**
    *   The `encounter` search parameter has been removed.
    *   A new `name` search parameter has been added.
    *   Querying for "reason" will change due to the merge of `reasonCode`/`reasonReference` into `CareTeam.reason`.
    *   The `participant` search parameter now includes `Group` as a target type.

## 2. Overall Resource Scope and Purpose

*   **Core Purpose Consistency:** The fundamental purpose of CareTeam—to list individuals, organizations, and teams involved in care coordination—remains consistent.
*   **Explicit Inclusion of CareTeams as Members:** The R6 description of CareTeam more explicitly states that participants can include "other care teams," aligning with `CareTeam.participant.member` allowing `Reference(CareTeam)`.
*   **Subject Optionality Clarification:** R6 documentation more clearly articulates that a CareTeam can exist without a `subject` (e.g., for an event-specific team like a "code blue team" before a patient is identified).
*   **Encounter Association Removed:** R4 allowed a direct link to an `Encounter` via `CareTeam.encounter` and listed `Encounter` as a compartment. R6 removes this direct link and the compartment, suggesting such associations might be managed differently (e.g., through reverse lookups or other linking resources).

## 3. Element-Level Changes

### 3.1. New Elements in R6

While not strictly "new" in the sense of adding entirely new concepts, the following represents a significant structural change:

*   **`CareTeam.reason` (Replaces `reasonCode` and `reasonReference`)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableReference(Condition)`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/clinical-findings` (Example strength)
    *   **Short Description/Purpose:** Describes why the care team exists, accommodating either a coded concept or a reference to a `Condition`.
    *   **Key Impact/Action for Implementers:** This is a **Breaking Change**.
        *   Data from R4 `CareTeam.reasonCode` (CodeableConcept) should be migrated to `CareTeam.reason.concept`.
        *   Data from R4 `CareTeam.reasonReference` (Reference(Condition)) should be migrated to `CareTeam.reason.reference`.
        *   Systems must adapt to handle the `CodeableReference` data type for this element.
        *   Search queries based on reason will need to be updated (see Section 5).

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`CareTeam.participant.role` (Cardinality Change)**
    *   **R4 Cardinality:** `0..*` (Multiple `CodeableConcept` entries allowed)
    *   **R6 Cardinality:** `0..1` (Only one `CodeableConcept` allowed)
    *   **Type:** `CodeableConcept` (remains the same)
    *   **Binding:** `http://hl7.org/fhir/ValueSet/participant-role` (Example strength). R4 specified `|4.0.1` version, R6 uses the canonical URL.
    *   **Rationale / Key Impact:** This is a **Breaking Change**. In R4, a single participant entry could theoretically list multiple roles. In R6, each participant entry can have at most one role.
        *   **Action:** If R4 data contains participant entries with multiple roles, these must be transformed into multiple `CareTeam.participant` entries in R6, each with a single role. The R6 comments (and R4's) state: "If a participant has multiple roles within the team, then there should be multiple participants." This is now structurally enforced by the cardinality.

*   **`CareTeam.participant.member` (Expanded Reference Types)**
    *   **R4 Type:** `Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam)`
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam | Group)`
    *   **Rationale / Key Impact:** R6 adds `Group` as a permissible reference type for a team member.
        *   **Action:** Systems may now encounter or store `Reference(Group)` in `participant.member`. The R6 comments specify: "Using Group is only allowed when the group represents a family or a household and should not represent groups of Practitioners."

*   **`CareTeam.participant.onBehalfOf` (Expanded Reference Types & Semantic Shift)**
    *   **R4 Type:** `Reference(Organization)`
    *   **R4 Short Description:** "Organization of the practitioner."
    *   **R6 Type:** `Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam | Group)`
    *   **R6 Short Description:** "Entity that the participant is acting as a proxy of, or an agent of, or in the interest of, or as a representative of."
    *   **Rationale / Key Impact:** This is a significant enhancement. The scope of `onBehalfOf` is broadened from representing only the practitioner's organization to representing a wider range of proxy or agency relationships.
        *   **Action:** Systems can now represent more complex "on behalf of" scenarios. Data migration may be needed if existing organizational links were meant to imply broader agency. The R4 constraint `ctm-1` (limiting `onBehalfOf` usage) is removed, aligning with this expansion. The R6 comments specify: "Using Group is only allowed when the group represents a family or a household and should not represent groups of Practitioners."

*   **`CareTeam.participant.period` (R4) -> `CareTeam.participant.effective[x]` (R6) (Renamed & Type Change)**
    *   **R4 Element:** `CareTeam.participant.period`
        *   Type: `Period`
        *   Short Description: "Time period of participant" / "Indicates when the specific member or organization did (or is intended to) come into effect and end."
    *   **R6 Element:** `CareTeam.participant.effective[x]`
        *   Type: `Period | Timing`
        *   Short Description: "When the member is generally available within this care team"
    *   **Rationale / Key Impact:** This is a **Breaking Change**. The element has been renamed, and its type changed to a choice type (`[x]`) allowing either a `Period` or a `Timing` resource. The description also shifts focus slightly from the participant's active period within the team to their general availability.
        *   **Action:** Data migration is required. R4 `period` data will map to `effectivePeriod`. Systems must now support `effectiveTiming` as well. Update any logic that relied on the old element name or strictly on the `Period` type.

*   **Value Set URL Versioning:**
    *   Many value set bindings in R4 used version-specific URLs (e.g., `...|4.0.1`). R6 generally uses canonical, unversioned URLs.
    *   **Impact:** Implementers should ensure they are referencing the appropriate (typically latest for R6) versions of these value sets. This is particularly important for `required` bindings like `CareTeam.status`.

### 3.3. Removed Elements from R4

*   **`CareTeam.encounter` (Removed)**
    *   **R4 Type:** `Reference(Encounter)`
    *   **R4 Cardinality:** `0..1`
    *   **Rationale / Key Impact:** This is a **Breaking Change**. This element, which linked the CareTeam to a specific encounter context, has been removed in R6. The `Encounter` compartment for CareTeam has also been removed.
        *   **Action:** Systems that relied on this direct link must find alternative ways to associate CareTeams with Encounters (e.g., referencing CareTeam from Encounter, using `Provenance`, or establishing indirect links). Existing data in `CareTeam.encounter` will need a new representation strategy if this association is critical.

*   **`CareTeam.reasonCode` (Removed)**
    *   **Rationale / Key Impact:** Superseded by the new `CareTeam.reason` (`CodeableReference`) element in R6. Data must be migrated.

*   **`CareTeam.reasonReference` (Removed)**
    *   **Rationale / Key Impact:** Superseded by the new `CareTeam.reason` (`CodeableReference`) element in R6. Data must be migrated.

## 4. Constraint Changes

*   **`ctm-1` (Removed in R6)**
    *   **R4 Constraint:** `CareTeam.participant.onBehalfOf can only be populated when CareTeam.participant.member is a Practitioner`
    *   **Expression:** `onBehalfOf.exists() implies (member.resolve().iif(empty(), true, ofType(Practitioner).exists()))`
    *   **Impact:** This constraint is removed in R6, consistent with the significant expansion of allowed types for `CareTeam.participant.onBehalfOf`, which is no longer limited to scenarios involving a `Practitioner` member and an `Organization` `onBehalfOf`.

*   **`ctm-2` (New in R6)**
    *   **R6 Constraint:** `CareTeam.participant.role or CareTeam.participant.member exists`
    *   **Severity:** `Warning`
    *   **Location:** `CareTeam.participant`
    *   **Expression:** `role.exists() or member.exists()`
    *   **Impact:** This new warning-level constraint suggests that each `participant` entry should define either the participant's `role` or who the `member` is (or both). Implementers should be aware of this validation rule; participant entries lacking both may be flagged.

## 5. Search Parameter Changes

*   **`encounter` (Removed)**
    *   **R4 Parameter:** `encounter` (Type: `reference`, Expression: `CareTeam.encounter`)
    *   **Key Change/Impact:** This search parameter is removed in R6 due to the removal of the `CareTeam.encounter` element. Queries using this parameter will no longer be valid.

*   **`name` (New in R6)**
    *   **R6 Parameter:** `name`
        *   Type: `string`
        *   Expression: `CareTeam.name | CareTeam.extension('http://hl7.org/fhir/StructureDefinition/careteam-alias').value`
    *   **Key Change/Impact:** A new search parameter to query CareTeams by their `name`. The expression also shows a common pattern for searching by an alias extension.

*   **`participant` (Target Types Expanded)**
    *   **R4 Targets:** `[Practitioner, Organization, CareTeam, Patient, PractitionerRole, RelatedPerson]`
    *   **R6 Targets:** `[Practitioner, Group, Organization, CareTeam, Patient, PractitionerRole, RelatedPerson]`
    *   **Key Change/Impact:** The target types for the `participant` search parameter (which searches `CareTeam.participant.member`) have been updated to include `Group`, reflecting the change in allowed types for `CareTeam.participant.member`.

*   **`reason-code` / `reason-reference` (Implicitly Changed)**
    *   **R4:** Separate `reasonCode` and `reasonReference` elements implied distinct search parameters (e.g., `reason-code` of type `token`, `reason-reference` of type `reference`).
    *   **R6:** These are merged into `CareTeam.reason` (type `CodeableReference(Condition)`). The R6 documentation snippet notes the absence of explicit `reason-code` or `reason-reference` search parameters but suggests how they *would* be defined if standard:
        *   `reason-code` (token) targeting `CareTeam.reason.concept`
        *   `reason-reference` (reference) targeting `CareTeam.reason.reference`
    *   **Key Change/Impact:** Implementers must adapt queries for "reason." Systems will likely need to support searching on the sub-components of `CareTeam.reason`. For example, to search by a coded reason, the query would target the `concept` part, and for a referenced condition, it would target the `reference` part. The exact parameter names (e.g., `reason`, `reason-concept`) may vary by server implementation if not strictly defined in the base specification for `CodeableReference` paths.

## 6. Key Migration Actions & Considerations

1.  **Reason Data Migration (Critical):**
    *   Migrate data from R4 `CareTeam.reasonCode` to R6 `CareTeam.reason.concept`.
    *   Migrate data from R4 `CareTeam.reasonReference` to R6 `CareTeam.reason.reference`.
    *   Update application logic to use the single `CareTeam.reason` element.

2.  **Restructure Participant Roles (Critical):**
    *   Identify R4 CareTeam resources where a single `CareTeam.participant` entry has multiple `role` values.
    *   Transform these into multiple `CareTeam.participant` entries in R6, each with a single `role`.

3.  **Participant Period/Effective[x] Migration (Critical):**
    *   Rename `CareTeam.participant.period` to `CareTeam.participant.effectivePeriod` in existing data.
    *   Update systems to handle the `effective[x]` choice type, allowing for both `effectivePeriod` and `effectiveTiming`.

4.  **Address Removal of `CareTeam.encounter` (Critical):**
    *   Evaluate the impact of removing the direct `CareTeam.encounter` link.
    *   If this association is essential, develop alternative strategies (e.g., using extensions, referencing CareTeam from Encounter, or using `Provenance`).

5.  **Update Participant `member` and `onBehalfOf` Handling:**
    *   Adapt systems to support the new `Group` reference type for `CareTeam.participant.member`.
    *   Adapt systems to support the greatly expanded reference types for `CareTeam.participant.onBehalfOf`.

6.  **Revise Validation Logic:**
    *   Remove validation for the R4 `ctm-1` constraint.
    *   Implement or be aware of the new R6 `ctm-2` warning constraint.

7.  **Update API Queries:**
    *   Remove any queries using the `encounter` search parameter.
    *   Utilize the new `name` search parameter as needed.
    *   Modify queries for "reason" to target the sub-elements of `CareTeam.reason` (e.g., `reason.concept` or `reason.reference` via appropriate search parameters).
    *   Ensure `participant` search queries correctly handle `Group` as a target.

8.  **Review Value Set Usage:**
    *   Ensure systems are aligned with the (typically unversioned) value set URIs used in R6 and are using appropriate codes.

This guide highlights the most significant changes. Implementers should always refer to the official FHIR specification for R4 and R6 for complete details.