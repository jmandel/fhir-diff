## Impact of R6 Changes on `us-core-specimen`

The primary impact of migrating `Specimen` from R4 to R6 on the `us-core-specimen` profile centers on the `Specimen.collection.bodySite` element and its associated search parameter.

*   **`Specimen.collection.bodySite` Type Change:**
    *   **`us-core-specimen` (R4-based):** This element is defined as a `CodeableConcept`, with US Core binding it to the `http://hl7.org/fhir/ValueSet/body-site` value set (extensible).
    *   **Relevant R6 Base Change:** In the R6 `Specimen` resource, `Specimen.collection.bodySite` has changed from a `CodeableConcept` to a `CodeableReference(BodyStructure)`.
    *   **Direct Impact on `us-core-specimen`:**
        *   The `us-core-specimen` profile **must** be updated. `Specimen.collection.bodySite` will now be a `CodeableReference(BodyStructure)`.
        *   The existing US Core value set binding can be applied to the `.concept` part of this `CodeableReference`.
        *   Implementers will need to adapt to send and receive this element as `CodeableReference`. This means instances could carry a `concept` (the `CodeableConcept`), a `reference` (to a `BodyStructure` resource), or both. US Core will need to provide guidance on how this should be populated (e.g., require `concept`, allow `reference`, make `concept` Must Support).

*   **`bodysite` Search Parameter Change:**
    *   **`us-core-specimen` (R4-based):** While not explicitly defined as a search parameter in the US Core profile differential, systems searching for specimens by body site would rely on the R4 base `bodysite` search parameter (type `token`).
    *   **Relevant R6 Base Change:** The `bodysite` search parameter on the base `Specimen` resource has changed from type `token` to `reference`, now targeting `BodyStructure` resources. This aligns with the element's type change.
    *   **Direct Impact on `us-core-specimen`:**
        *   Server implementations supporting searches on `Specimen.collection.bodySite` (via the `bodysite` search parameter) must update to the R6 definition.
        *   Client applications must adjust their search queries for `bodysite` from token-based to reference-based.

*   **`Specimen.status` Value Set URI:**
    *   **`us-core-specimen` (R4-based):** This element is not directly constrained in the `us-core-specimen` differential but relies on the R4 base `Specimen` definition where `status` has a `required` binding to `http://hl7.org/fhir/ValueSet/specimen-status|4.0.1`.
    *   **Relevant R6 Base Change:** The R6 base resource updates this value set URI to `http://hl7.org/fhir/ValueSet/specimen-status` (version suffix removed).
    *   **Direct Impact on `us-core-specimen`:** This is a minor technical update. Implementers populating `Specimen.status` should use the unversioned canonical URL for the value set. The profile itself does not require changes for this, but implementers need to be aware.

Other elements in `us-core-specimen` such as `identifier`, `accessionIdentifier`, `type`, `subject`, and `condition` are not significantly affected by R6 base changes in ways that would alter their current US Core definitions or constraints. The introduction of new optional elements (`combined`, `role`, `feature`) or other search parameters in the R6 base `Specimen` does not directly impact the current `us-core-specimen` definition but offers potential for future enhancements.

## Migration Summary & Actionable Takeaways for `us-core-specimen`

*   **US Core Profile Changes Required:**
    *   Yes. The `us-core-specimen` profile must be updated.
    *   `Specimen.collection.bodySite` must be changed from `CodeableConcept` to `CodeableReference(BodyStructure)`.
    *   The US Core team needs to provide guidance on populating this `CodeableReference` (e.g., which parts are Must Support: `.concept`, `.reference`, or both; preference for populating `concept` vs. `reference`).
    *   The existing value set binding for `Specimen.collection.bodySite` should be applied to the `.concept` attribute of the `CodeableReference`.

*   **Implementation Changes Required:**
    *   Yes.
    *   **Data Structure:** Systems producing or consuming `us-core-specimen` resources must adapt to the `CodeableReference` type for `Specimen.collection.bodySite`.
    *   **Search:**
        *   Servers must update the `bodysite` search parameter to be a `reference` type targeting `BodyStructure`.
        *   Clients must update `bodysite` search queries from token-based to reference-based.
    *   **Terminology:** Implementers should use the unversioned canonical URL for the `Specimen.status` value set if populating this element.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   The R6 base `Specimen` resource introduces `Specimen.combined` (for pooled/grouped status), `Specimen.role` (purpose of specimen), and `Specimen.feature` (physical features). These could be considered for future `us-core-specimen` enhancements if corresponding use cases are prioritized.

## Overall Migration Impact
Impact: **Significant**

The change of `Specimen.collection.bodySite` from `CodeableConcept` to `Code