## Impact of R6 Changes on `us-core-careplan`

This section analyzes R6 `CarePlan` changes that directly affect core elements, constraints, and patterns defined, mandated, or relied on by `us-core-careplan`.

*   **`CarePlan.status` (Must Support, Required Binding)**
    *   **Relevant R6 Base Change:** The ValueSet `http://hl7.org/fhir/ValueSet/request-status` (bound to `CarePlan.status`) adds the code `ended`.
    *   **Direct Impact on `us-core-careplan`:** The profile's required binding will now include `ended`. This is an expansion. Implementers consuming R6 `us-core-careplan` instances may encounter this new status. The US Core team may wish to provide guidance on its use. This is a low impact change.

*   **`CarePlan.intent` (Must Support, Required Binding)**
    *   **Relevant R6 Base Change:** The ValueSet `http://hl7.org/fhir/ValueSet/care-plan-intent` (bound to `CarePlan.intent`) adds the code `directive`. R6 also adds guidance that `intent` should be treated as immutable.
    *   **Direct Impact on `us-core-careplan`:** The profile's required binding will now include `directive`. This is an expansion. Implementers consuming R6 `us-core-careplan` instances may encounter this new intent. The US Core team may wish to provide guidance on its use and the immutability aspect. This is a low impact change.

*   **`CarePlan.addresses` (Key to "Assessment and Plan" purpose)**
    *   **`us-core-careplan` context:** While not in the profile's differential, `CarePlan.addresses` is inherited from the base R4 resource as `0..* Reference(Condition)`. The US Core HTML documentation states, "US Core Condition **SHOULD** be present in `CarePlan.addresses`."
    *   **Relevant R6 Base Change (Breaking):** `CarePlan.addresses` changes type from `Reference(Condition)` in R4 to `CodeableReference(Condition | Procedure | MedicationAdministration)` in R6.
    *   **Direct Impact on `us-core-careplan`:** This is a **significant impact**. If `us-core-careplan` is migrated to R6 without new constraints on `addresses`, it will inherit this new `CodeableReference` type.
        *   Implementers who previously expected only `Reference(Condition)` will need to handle a `CodeableReference`, which can contain a `concept` (CodeableConcept) or a `reference` to `Condition`, `Procedure`, or `MedicationAdministration`.
        *   The US Core team must decide whether to:
            1.  Constrain `addresses` back to `Reference(Condition)` (or `Reference(us-core-condition)`) within the R6 profile.
            2.  Adopt the `CodeableReference` type and update guidance accordingly, possibly specifying how to use `us-core-condition` within it.

*   **`CarePlan.activity` Structure (Key to "Plan of Treatment" purpose)**
    *   **`us-core-careplan` context:** The profile does not currently apply constraints to `CarePlan.activity` or its sub-elements. However, representing activities is fundamental to a "plan of treatment."
    *   **Relevant R6 Base Change (Breaking):** The `CarePlan.activity.detail` backbone element (for inline activity definition) is **removed**. All planned activities in R6 *must* be defined by referencing other request resources (e.g., `ServiceRequest`) via `CarePlan.activity.plannedActivityReference` (renamed from R4's `CarePlan.activity.reference`).
    *   **Direct Impact on `us-core-careplan`:**
        *   While this doesn't break any *existing explicit constraints* in `us-core-careplan` (as `activity` is not profiled), it fundamentally changes how any activities within a CarePlan are represented.
        *   Implementers of `us-core-careplan` who were previously using `activity.detail` (as allowed by base R4) will face a **significant breaking change**. They must re-model activities as separate resources.
        *   This impacts how `us-core-careplan` instances are *constructed and used* if they include specific treatment activities.

*   **`CarePlan.text`, `CarePlan.category` (including `AssessPlan` slice), `CarePlan.subject`, `CarePlan.contributor`:**
    *   **Relevant R6 Base Change(s):** No R6 base changes to these elements significantly impact their current definition or constraints within `us-core-careplan`.
        *   `text`: Structure and MS requirements remain compatible.
        *   `category`: US Core constraints, including the `AssessPlan` slice with its pattern, remain applicable.
        *   `subject`: R6 base expands `subject` target types. US Core's current constraint to Patient and Group remains a valid subset.
        *   `contributor`: R6 base expands `contributor` target types (e.g., adding `CareTeam`). US Core `contributor` already targets `us-core-careteam`, so this R6 base change is compatible.

## Migration Summary & Actionable Takeaways for `us-core-careplan`

*   **US Core Profile Changes Required:**
    1.  **`CarePlan.addresses`:** A decision is needed.
        *   **Option A (Preserve R4 behavior):** Add constraints to `CarePlan.addresses` to restrict it to `Reference(us-core-condition)` and make the `concept` part of `CodeableReference` 0..0.
        *   **Option B (Adopt R6 change):** Allow `CarePlan.addresses` to be the R6 `CodeableReference`. Update profile guidance significantly on how to use this element, including how/if to represent Conditions, Procedures, and MedicationAdministrations, and usage of the `concept` vs `reference` parts.
    2.  **Documentation/Guidance:**
        *   Acknowledge the new `ended` code for `CarePlan.status` and `directive` code for `CarePlan.intent`.
        *   Provide clear guidance on the removal of `CarePlan.activity.detail` and the R6 requirement to use `CarePlan.activity.plannedActivityReference` for any activities. This is crucial for implementers using `us-core-careplan` for detailed treatment plans.

*   **Implementation Changes Required:**
    1.  **Data Model & Logic (Producers & Consumers):**
        *   Handle the new `ended` status in `CarePlan.status` and `directive` intent in `CarePlan.intent`.
        *   **Critically for `CarePlan.addresses`:** Adapt to `CodeableReference` if Option B above is chosen (or if no constraining action is taken by US Core). This involves processing `concept` and `reference` parts, and handling new target types (`Procedure`, `MedicationAdministration`). If Option A is chosen, adherence to the stricter profile constraint is needed.
        *   **Critically for `CarePlan.activity`:** Systems creating or processing CarePlans with activities *must* stop using/expecting `activity.detail`. All activities must be transitioned to externally referenced request resources linked via `activity.plannedActivityReference`. This is a major architectural shift for activity representation.
    2.  **Search Queries:** If searching on `CarePlan.addresses`, queries may need to change depending on the decision for `addresses`. If activities were searched via `activity-code` or `activity-date` (which relied on `activity.detail`), these search approaches are no longer valid.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `CarePlan.activity.performedActivity`: Offers a standard way to link to evidence of completed or in-progress activities, enhancing tracking.
    *   The mandatory use of `plannedActivityReference` promotes modularity and use of specialized request resources (e.g., `ServiceRequest`, `MedicationRequest`) for defining plan activities, which can improve interoperability and clarity.

## Overall Migration Impact

Impact: **Significant**

**Explanation:**

The migration from R4 to R6 for `us-core-careplan` is **Significant** due to two primary factors impacting implementers and requiring decisions from the US Core editorial team:

1.  **`CarePlan.addresses` Type Change:** The base resource changes `addresses` from `Reference(Condition)` to `CodeableReference(Condition | Procedure | MedicationAdministration)`. The US Core team must decide whether to constrain this back to maintain R4 behavior or adopt the R6 change, both requiring profile updates or significant guidance changes and impacting all implementers.
2.  **`CarePlan.activity` Restructuring:** The removal of `CarePlan.activity.detail` and mandating `plannedActivityReference` fundamentally alters how treatment activities are represented. While `us-core-careplan` doesn't currently profile `activity` elements, this change has a major impact on any practical use of the profile for detailed care planning. Guidance and implementer adaptation will be substantial.

While other changes (like new codes in value sets for `status` and `intent`) are low impact, the changes to `addresses` and the activity model necessitate careful consideration, profile updates/guidance, and significant effort from implementers.