## Impact of R6 Changes on `us-core-location`

This section details the R6 base `Location` resource changes that directly affect core elements and constraints defined by `us-core-location`.

*   **`Location.status` (Must Support)**
    *   **Relevant R6 Base Change:** The ValueSet binding for `Location.status` in R6 (`http://hl7.org/fhir/ValueSet/location-status`) is now unversioned, compared to the R4 versioned URI (`http://hl7.org/fhir/ValueSet/location-status|4.0.1`).
    *   **Direct Impact on `us-core-location`:** Minimal. `us-core-location` inherits this binding. Implementers should ensure systems can resolve the unversioned URI. The underlying codes are expected to remain consistent.

*   **`Location.type` (Must Support, with specific US Core bindings)**
    *   **Relevant R6 Base Change:** The base FHIR `Location.type` element has a new primary ValueSet binding in R6: `http://terminology.hl7.org/ValueSet/service-type` with a binding strength of `preferred`. This replaces the R4 base binding to `http://hl7.org/fhir/ValueSet/v3-ServiceDeliveryLocationRoleType` (extensible).
    *   **Direct Impact on `us-core-location`:** **Significant**.
        *   `us-core-location` currently binds `Location.type` to `http://terminology.hl7.org/ValueSet/v3-ServiceDeliveryLocationRoleType` and layers additional US-specific ValueSet bindings (HSLOC, SNOMED-CT, POS).
        *   The US Core team must decide whether to:
            1.  Align with the new R6 `service-type` ValueSet as the primary binding. This would likely require re-evaluating how the current US Core additional bindings (HSLOC, SNOMED-CT, POS) relate to or supplement `service-type`.
            2.  Explicitly override the R6 base binding to retain `v3-ServiceDeliveryLocationRoleType`.
        *   This change impacts data mapping and vocabulary choices for implementers if alignment with the new R6 base binding is chosen. The `MustSupport` constraint on `Location.type.coding`, `Location.type.coding.system`, and `Location.type.coding.code` (all `min: 1`) means this vocabulary decision is critical.

*   **`Location.telecom` (Must Support)**
    *   **Relevant R6 Base Change:** The `Location.telecom` element (type `ContactPoint`) in R4 has been **renamed to `Location.contact`** in R6, and its **type has changed to `ExtendedContactDetail`**. This is a breaking change in the base resource.
    *   **Direct Impact on `us-core-location`:** **Significant**.
        *   The path `Location.telecom`, which `us-core-location` currently constrains as Must Support, will no longer exist in an R6-compliant `Location` resource.
        *   The `us-core-location` profile must be updated to refer to `Location.contact`.
        *   The Must Support flag and any implicit expectations for `telecom` need to be re-evaluated and applied to `Location.contact` and its new, richer `ExtendedContactDetail` data type. Implementers will need to map data from the R4 `ContactPoint` structure to the R6 `ExtendedContactDetail` structure.

## Migration Summary & Actionable Takeaways for `us-core-location`

*   **US Core Profile Changes Required:**
    *   **Yes, significant profiling changes are necessary.**
    *   **`Location.telecom` to `Location.contact`:** The profile must be updated to remove constraints on `Location.telecom` and apply them to the new `Location.contact` element. This includes updating the path and considering the implications of the type change from `ContactPoint` to `ExtendedContactDetail` for US Core requirements.
    *   **`Location.type` Binding:** A decision is required on how to handle the R6 base resource's change of `Location.type`'s primary ValueSet binding to `service-type` (preferred). The profile will need to either align with this new binding (and potentially adjust its additional US-specific bindings) or explicitly override the base R6 binding.
    *   **`Location.status` Binding:** Minor update may be needed to reflect the unversioned ValueSet URI from R6 base.

*   **Implementation Changes Required:**
    *   **Yes, implementers will need to update their systems.**
    *   **Data and Code for `telecom`/`contact`:** Systems producing or consuming `us-core-location` instances must:
        *   Change code referencing `Location.telecom` to `Location.contact`.
        *   Implement logic to map data between R4 `Location.telecom` (ContactPoint) and R6 `Location.contact` (ExtendedContactDetail).
    *   **Data and Code for `Location.type`:** If US Core aligns `Location.type` with the R6 base `service-type` ValueSet, systems must:
        *   Update code handling `Location.type` codes.
        *   Re-map existing location type data to codes from the new `service-type` ValueSet and/or the adjusted US Core additional bindings.
    *   **`Location.status` ValueSet URI:** Ensure systems can resolve the unversioned ValueSet URI for `Location.status`.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`Location.virtualService`:** The new `virtualService` element (type `VirtualServiceDetail`) in R6 directly supports the growing need for describing virtual locations (e.g., for telehealth). The US Core team may consider profiling this element in future R6-based versions of `us-core-location` to enhance support for virtual care.
    *   **`Location.form` (formerly `physicalType`):** The R6 description for `form` explicitly includes "virtual" as a possible form, aligning with `virtualService`. This could be used in conjunction with `virtualService` if more detailed categorization of virtual locations is needed.
    *   **`Location.hoursOfOperation` (now `Availability` type):** While `us-core-location` does not currently constrain this element, the R6 base `Location` resource now uses the robust `Availability` data type. This offers a standardized and richer way to represent operating hours and exceptions, should this become a future requirement for US Core.

## Overall Migration Impact
Impact: **Significant**

The migration from R4 to R6 for `us-core-location` will require significant effort. Key `MustSupport` elements (`Location.telecom` and `Location.type`) are substantially affected by breaking changes or fundamental vocabulary shifts in the R6 base `Location` resource. The US Core editorial team will need to make important decisions regarding profiling `Location.contact` (formerly `telecom`) and the terminology binding for `Location.type`. These changes will necessitate updates to the profile definition and require implementers to adapt their systems and data.