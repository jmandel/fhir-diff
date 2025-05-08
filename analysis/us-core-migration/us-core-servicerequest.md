## Impact of R6 Changes on `us-core-servicerequest`

This section details the R6 base `ServiceRequest` changes that directly affect core elements and constraints defined by `us-core-servicerequest`.

*   **`ServiceRequest.status` (Must Support)**
    *   **Relevant R6 Base Change:** The value set for `ServiceRequest.status` (RequestStatus) in R6 now includes the code `ended`.
    *   **Direct Impact on `us-core-servicerequest`:** Minimal impact on the profile definition itself, as US Core does not further constrain this value set. However, implementers of `us-core-servicerequest` will need to be prepared to receive and understand this new `ended` status.

*   **`ServiceRequest.code` (Must Support, Cardinality 1..1)**
    *   **Relevant R6 Base Change:** This element undergoes a **breaking change**. In R4, `ServiceRequest.code` was a `CodeableConcept`. In R6, it is now a `CodeableReference` that can reference `ActivityDefinition` or `PlanDefinition`.
    *   **Direct Impact on `us-core-servicerequest`:** **Significant impact.**
        *   The profile must be updated to reflect `code` as a `CodeableReference`.
        *   The existing US Core constraint `min = 1` and `mustSupport = true` will apply to the `ServiceRequest.code` (CodeableReference) element itself.
        *   The current US Core binding to the `us-core-procedure-code` ValueSet (extensible) will need to be redefined to apply to the `concept` component of the `ServiceRequest.code` (i.e., `ServiceRequest.code.concept`).
        *   Implementers will need to update their systems to populate `ServiceRequest.code.concept` for the coded procedure and potentially `ServiceRequest.code.reference` if linking to definitions.

*   **`ServiceRequest.code.text` (USCDI Requirement)**
    *   **Relevant R6 Base Change:** Consequential to the change in `ServiceRequest.code` (see above).
    *   **Direct Impact on `us-core-servicerequest`:** **Path change.** The USCDI requirement for "the name of the test, procedure, or service to be performed" currently maps to `ServiceRequest.code.text`. With `ServiceRequest.code` becoming a `CodeableReference`, this text will now reside in `ServiceRequest.code.concept.text`. The profile's USCDI annotation needs to be updated to reflect this new path.

*   **`ServiceRequest.reasonCode` and `ServiceRequest.reasonReference` (USCDI Requirements)**
    *   **Relevant R6 Base Change:** These two R4 elements are consolidated into a single R6 element: `ServiceRequest.reason`, which is of type `CodeableReference`. The R6 `reason.reference` can point to `Condition | Observation | DiagnosticReport | DocumentReference | DetectedIssue | Procedure`.
    *   **Direct Impact on `us-core-servicerequest`:** **Significant impact.**
        *   The profile must be updated to remove `reasonCode` and `reasonReference` and instead constrain the new `ServiceRequest.reason` element.
        *   The USCDI requirement currently met by `ServiceRequest.reasonCode` (Explanation/Justification for procedure or service) will map to `ServiceRequest.reason.concept`. The US Core binding to `us-core-condition-code` ValueSet (extensible) will apply to `ServiceRequest.reason.concept`.
        *   The USCDI requirement currently met by `ServiceRequest.reasonReference` (US Core Profile that supports the requested service) will map to `ServiceRequest.reason.reference`. The US Core team will need to define the `targetProfile` constraints for this reference, considering the expanded R6 base target types. R4 US Core targeted `Condition`, `Observation`, `DiagnosticReport`, `DocumentReference`.
        *   Implementers will need to update their systems to use the new `reason` structure.

---

## Migration Summary & Actionable Takeaways for `us-core-servicerequest`

*   **US Core Profile Changes Required:**
    *   **Yes, `us-core-servicerequest` will need to be re-profiled for R6.**
        1.  **`ServiceRequest.code`**: Change type to `CodeableReference`. Update Must Support, cardinality, and USCDI annotation for `code.concept.text`. Re-target `us-core-procedure-code` binding to `ServiceRequest.code.concept`.
        2.  **`ServiceRequest.reasonCode` / `ServiceRequest.reasonReference`**: Remove these elements. Add constraints for the new `ServiceRequest.reason` (CodeableReference) element.
            *   Map USCDI requirement for coded reason to `ServiceRequest.reason.concept` and apply `us-core-condition-code` binding.
            *   Map USCDI requirement for referenced reason to `ServiceRequest.reason.reference`. Define allowable `targetProfile`s (e.g., US Core Condition, US Core Observation, etc.), considering R6's expanded options.

*   **Implementation Changes Required:**
    *   **Yes, implementers will need to update their code.**
        1.  **For `ServiceRequest.code`**:
            *   Populate/parse data as a `CodeableReference`. Coded data goes into `code.concept`.
            *   Update path for `code.text` to `code.concept.text`.
        2.  **For reasons**:
            *   Stop using `reasonCode` and `reasonReference`.
            *   Populate/parse data using the new `ServiceRequest.reason` element. Coded reasons go into `reason.concept`; referenced reasons go into `reason.reference`.
        3.  **For `ServiceRequest.status`**: Be prepared to handle the new `ended` status code.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`ServiceRequest.focus`**: Could be considered if future US Core use cases require specifying the request target when it's not the primary `subject` (e.g., a fetus).
    *   **Consolidated `location`**: The base R6 `ServiceRequest.location` is now a `CodeableReference(Location)`. While US Core doesn't currently mandate `location` on `ServiceRequest`, if it were to be added, this new structure would be used.
    *   **Enhanced `patientInstruction` and `orderDetail`**: R6 provides more structured BackboneElements for these. If US Core extends to cover these, the R6 structures offer more expressiveness.

---

## Overall Migration Impact
Impact: **Significant**

The migration from R4 to R6 for `us-core-servicerequest` will be significant. The structural changes in the base `ServiceRequest` resource to key elements like `code` and the consolidation of `reasonCode`/`reasonReference` into `reason` directly impact Must Support elements and USCDI requirements within the US Core profile. The US Core editorial team will need to make decisions on how to re-profile these elements, update bindings, and redefine USCDI mappings. Implementers will face breaking changes requiring updates to data mapping and application logic.