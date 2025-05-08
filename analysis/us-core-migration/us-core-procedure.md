## Impact of R6 Changes on `us-core-procedure`

This section details the R6 base `Procedure` resource changes that directly affect `us-core-procedure`'s core elements, constraints, and usage patterns.

*   **`Procedure.status` (Must Support)**
    *   **Relevant R6 Base Change:** The value set binding for `Procedure.status` (`http://hl7.org/fhir/ValueSet/event-status`) will be updated to its R6 version.
    *   **Direct Impact on `us-core-procedure`:** Minor. The profile must be updated to reference the R6 version of the `event-status` value set for its `required` binding. This is generally a non-breaking change for implementers unless codes are removed (unlikely for this set).

*   **`Procedure.performed[x]` (Must Support, part of `us-core-7` constraint)**
    *   **Relevant R6 Base Change:** `Procedure.performed[x]` is renamed to `Procedure.occurrence[x]`. The R6 base resource also adds `Timing` as a new data type choice for `occurrence[x]`.
    *   **Direct Impact on `us-core-procedure`:** Significant.
        *   The profile definition must be updated to use `Procedure.occurrence[x]` instead of `Procedure.performed[x]`.
        *   The Must Support flag on `Procedure.performed[x]` (specifically for the `dateTime` slice) must be moved to `Procedure.occurrence[x]` (for the `dateTime` slice).
        *   The `us-core-7` constraint (`(status='completed' or status='in-progress') implies performed.exists()`) must be updated to reference `occurrence` (e.g., `(status='completed' or status='in-progress') implies occurrence.exists()`).
        *   The US Core team will need to decide whether to allow or profile the new `Timing` data type for `occurrence[x]`. Current US Core allows `dateTime`, `Period`, `string`, `Age`, and `Range`.

*   **`Procedure.reasonCode` and `Procedure.reasonReference` (Profiled as USCDI requirements)**
    *   **Relevant R6 Base Change:** `Procedure.reasonCode` (CodeableConcept) and `Procedure.reasonReference` (Reference) are removed from the base `Procedure` resource. They are replaced by a single element: `Procedure.reason` of type `CodeableReference(Condition | Observation | Procedure | DiagnosticReport | DocumentReference)`.
    *   **Direct Impact on `us-core-procedure`:** Significant.
        *   `us-core-procedure` must be updated to remove constraints/guidance specific to `Procedure.reasonCode` and `Procedure.reasonReference`.
        *   The profile must incorporate and constrain the new `Procedure.reason` element. This includes:
            *   Migrating the current `extensible` binding for `Procedure.reasonCode` (using `http://hl7.org/fhir/us/core/ValueSet/us-core-condition-code`) to `Procedure.reason.concept`.
            *   Updating guidance on how to meet the USCDI requirement for "reason or indication," as current guidance points to the now-removed elements.
            *   Deciding on cardinality and any further constraints for `Procedure.reason` within the US Core context.

*   **`Procedure.asserter` (Mentioned in US Core HTML for provenance)**
    *   **Relevant R6 Base Change:** The `Procedure.asserter` element is removed from the base `Procedure` resource.
    *   **Direct Impact on `us-core-procedure`:** Moderate. Although not a Must Support element in the profile's differential, US Core documentation states: *"The profile elements Procedure.asserter and Procedure.performer.actor communicate the individual level provenance author data..."*. The removal of `asserter` means this guidance is no longer fully valid. US Core will need to update its provenance guidance, potentially relying more on `Procedure.performer.actor` and/or considering new R6 elements like `Procedure.recorded` or the `Provenance` resource.

*   **`Procedure.subject` (Must Support)**
    *   **Relevant R6 Base Change:** The R6 `Procedure.subject` element's target reference types are expanded to include `Device`, `Practitioner`, `Organization`, and `Location`, in addition to `Patient` and `Group`.
    *   **Direct Impact on `us-core-procedure`:** No *forced* change. `us-core-procedure` currently constrains `subject` to `Reference(us-core-patient | Group)`. This is more restrictive than the R6 base, which is permissible. The US Core team can choose to maintain this restriction or optionally align with the broader R6 base definition if desired for new use cases.

*   **`Procedure.basedOn` and `Procedure.performer.actor` (Profiled as USCDI requirements)**
    *   **Relevant R6 Base Change:**
        *   `Procedure.basedOn` target types expanded to include `MedicationRequest`.
        *   `Procedure.performer.actor` target types expanded to include `CareTeam` and `HealthcareService`.
    *   **Direct Impact on `us-core-procedure`:** No *forced* change. `us-core-procedure` constrains these elements to specific US Core profiles and other types (e.g., `Device` for `performer.actor`). These constraints are more restrictive than or different from the full R6 base set, which is permissible. Similar to `Procedure.subject`, US Core can maintain its current constraints or optionally expand them.

---
## Migration Summary & Actionable Takeaways for `us-core-procedure`

*   **US Core Profile Changes Required:** Yes, significant changes are required.
    1.  **Rename `performed[x]` to `occurrence[x]`:** Update the element name in the differential, Must Support flags, and the `us-core-7` constraint expression.
    2.  **Address `occurrence[x]` Data Types:** Decide whether to support the new `Timing` type for `occurrence[x]` in addition to the currently allowed types.
    3.  **Replace `reasonCode`/`reasonReference` with `reason`:**
        *   Remove `Procedure.reasonCode` and `Procedure.reasonReference` from profile-specific constraints and guidance.
        *   Add and define constraints for the new `Procedure.reason` (CodeableReference) element.
        *   Migrate the `extensible` terminology binding from `Procedure.reasonCode` (ValueSet: `us-core-condition-code`) to `Procedure.reason.concept`.
        *   Update USCDI guidance for capturing procedure reasons.
    4.  **Update `Procedure.status` Binding:** Change the referenced ValueSet `http://hl7.org/fhir/ValueSet/event-status` to its R6 version.
    5.  **Revise Provenance Guidance:** Update documentation regarding `Procedure.asserter` due to its removal from the base resource.

*   **Implementation Changes Required:** Yes, significant changes are required for implementers.
    1.  **Data Producers:**
        *   Must populate `Procedure.occurrence[x]` instead of `Procedure.performed[x]`.
        *   Must populate the new `Procedure.reason` (CodeableReference) structure instead of `Procedure.reasonCode` and `Procedure.reasonReference`.
        *   Must stop sending `Procedure.asserter`.
    2.  **Data Consumers:**
        *   Must expect `Procedure.occurrence[x]` instead of `Procedure.performed[x]`.
        *   Must expect `Procedure.reason` instead of `Procedure.reasonCode` and `Procedure.reasonReference`.
        *   Must no longer expect `Procedure.asserter`.
        *   Must be prepared for the R6 version of the `event-status` ValueSet.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    1.  **`Procedure.recorded` (dateTime):** May offer a standardized way to capture when the procedure was recorded, potentially aiding provenance.
    2.  **`Procedure.reported[x]` (boolean | Reference):** Could be used to indicate if the procedure data is from a secondary source.
    3.  **`Procedure.outcome` (now `0..* CodeableReference(Observation)`):** The R6 base `Procedure.outcome` is now more flexible. If US Core decides to profile `outcome` in the future, this R6 structure would be the basis.
    4.  **`Procedure.focus` (Reference):** Potentially useful for scenarios where the procedure's target is not the patient `subject` (e.g., caregiver education).

---
## Overall Migration Impact
Impact: Significant

The `us-core-procedure` profile will require significant updates. Key Must Support elements (`performed[x]`) are renamed, and elements central to USCDI requirements (`reasonCode`, `reasonReference`) are replaced by a new structure (`reason`). An element previously cited in US Core provenance guidance (`asserter`) is removed. These changes necessitate re-profiling decisions, updates to constraints and narrative, and will impose notable data mapping and code logic changes on implementers.