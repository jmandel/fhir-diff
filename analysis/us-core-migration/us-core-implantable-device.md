## Impact of R6 Changes on `us-core-implantable-device`

This section details the direct effects of FHIR R6 `Device` resource changes on the `us-core-implantable-device` profile.

*   **`Device.patient` (Mandatory, Must Support in US Core)**
    *   **Relevant R6 Base Change:** The `Device.patient` element has been **removed** from the R6 `Device` resource. Patient-device associations are now managed through the separate `DeviceAssociation` resource.
    *   **Direct Impact on `us-core-implantable-device`:** **Breaking Change.** The profile's mandatory requirement for `Device.patient` cannot be directly fulfilled in R6. The profile must be fundamentally redesigned to use `DeviceAssociation` (or a similar mechanism) to link an implantable device to a `us-core-patient`. This significantly alters data modeling and API interactions for associating devices with patients.

*   **`Device.distinctIdentifier` (Must Support in US Core)**
    *   **Relevant R6 Base Change:** The `Device.distinctIdentifier` element has been **removed** from the R6 `Device` resource. For biological source material (which aligns with US Core's description for HCT/P), R6 introduces `Device.biologicalSourceEvent` (type: `Identifier`).
    *   **Direct Impact on `us-core-implantable-device`:** **Breaking Change.** The profile's Must Support for `Device.distinctIdentifier` cannot be met as the element no longer exists. The US Core team must decide if the intent (especially for HCT/P identification) maps to the new `Device.biologicalSourceEvent`. If so, the profile needs to be updated to use this new element. Otherwise, an alternative representation (e.g., a specific slice of `Device.identifier`) must be considered.

*   **`Device.udiCarrier.issuer` (Not directly constrained by US Core, `0..1` in R4 base)**
    *   **Relevant R6 Base Change:** In R6, `Device.udiCarrier.issuer` becomes mandatory (`1..1`) if the `Device.udiCarrier` element is present.
    *   **Direct Impact on `us-core-implantable-device`:** Since `Device.udiCarrier` is Must Support in the profile, any R6-compliant `us-core-implantable-device` instance that includes `udiCarrier` **must** now also include `udiCarrier.issuer`. This introduces a new data requirement for implementers when `udiCarrier` is populated, even though US Core does not explicitly mandate `issuer`.

*   **`Device.status` (Implicit base element, search support specified in US Core HTML)**
    *   **Relevant R6 Base Change:** The semantics of `Device.status` have changed. In R6, it refers to the status of the *Device resource record* itself (e.g., `active`, `inactive`, `entered-in-error`). A new element, `Device.availabilityStatus`, has been added to represent the physical availability of the device (e.g., `lost`, `damaged`, `available`). The R4 `Device.statusReason` element is removed.
    *   **Direct Impact on `us-core-implantable-device`:** Moderate impact. While the profile doesn't set `Device.status` as mandatory, its meaning has shifted. If systems previously interpreted R4 `Device.status` as device availability (which was common), this is no longer correct in R6. The profile's guidance on searching by `status` will need to be updated to reflect this change and potentially introduce guidance for `availabilityStatus`.

*   **`Device.type` (Mandatory, Must Support in US Core)**
    *   **Relevant R6 Base Change:** The cardinality of `Device.type` changed from `0..1` in R4 to `0..*` in R6.
    *   **Direct Impact on `us-core-implantable-device`:** Low. US Core's `1..1` constraint on `Device.type` is a valid restriction of R6's `0..*`. The profile can remain as is (constraining R6 further) or be updated to `1..*` to align with the R6 base's allowance for multiple types. No breaking change, but a point of consideration for profile evolution.

*   **Search Parameter for Patient (`patient`)**
    *   **Profile Constraint:** Mandatory search parameter `patient` on `Device`.
    *   **Relevant R6 Base Change:** The `patient` search parameter on `Device` has been removed because `Device.patient` was removed.
    *   **Direct Impact on `us-core-implantable-device`:** **Breaking Change.** Servers cannot support the mandated `patient` search parameter directly on the `Device` resource in R6. Client queries for a patient's devices must be re-engineered to query the `DeviceAssociation` resource.

*   **Search Parameter for Device Type (`type`)**
    *   **Profile Constraint:** `SHOULD` support search by `type`.
    *   **Relevant R6 Base Change:** The R4 `type` search parameter (based on `Device.type`) is effectively replaced/renamed in R6. R6 has a `type` search parameter (and a similar `code` parameter) with a potentially broader expression that can include `DeviceDefinition.classification.type`.
    *   **Direct Impact on `us-core-implantable-device`:** Moderate impact. The name and/or expression of the search parameter for device type changes. Server search implementations and client queries for device type will need to be updated to align with R6 definitions.

## Migration Summary & Actionable Takeaways for `us-core-implantable-device`

1.  **US Core Profile Changes Required:** Yes, significant re-profiling.
    *   **Patient Linkage:** Remove the `Device.patient` element. Define how `DeviceAssociation` will be profiled and used to link to `us-core-patient`. This is a major architectural change.
    *   **Distinct Identifier:** Remove `Device.distinctIdentifier`. Assess if R6's `Device.biologicalSourceEvent` meets the profile's intent for HCT/P identification. If so, update the profile to use/mandate this element. If not, define an alternative (e.g., a specific slice of `Device.identifier`).
    *   **UDI Issuer:** Acknowledge in guidance that `Device.udiCarrier.issuer` becomes mandatory in R6 if `udiCarrier` is present. Consider making `issuer` Must Support.
    *   **Search Parameters:**
        *   Update search guidance to remove direct `patient` search on `Device`. Specify searching via `DeviceAssociation` (e.g., `GET DeviceAssociation?subject=[patient_ref]&_include=DeviceAssociation:device`).
        *   Update `type` search guidance to align with R6 search parameter names and expressions.
        *   Clarify `status` search in R6 context (record status) and consider adding guidance for `availabilityStatus` if relevant for implantable device availability queries.
    *   **`Device.type` Cardinality (Optional):** Decide if `Device.type` should remain `1..1` (stricter than R6 base) or be relaxed to `1..*` (aligning with R6 base's allowance for multiple types).

2.  **Implementation Changes Required:** Yes, substantial changes for implementers.
    *   **Data Model (Producers & Consumers):**
        *   Cease using `Device.patient`. Implement creation/consumption of `DeviceAssociation` resources for patient-device linkage.
        *   Cease using `Device.distinctIdentifier`. Implement `Device.biologicalSourceEvent` or the profile-defined alternative.
        *   Ensure `Device.udiCarrier.issuer` is populated if `Device.udiCarrier` is present.
        *   Adapt to the new meaning of `Device.status` (record status) and use `Device.availabilityStatus` for physical device availability.
    *   **API Interactions (Clients & Servers):**
        *   Client applications must query `DeviceAssociation` (not `Device`) to find devices for a patient.
        *   Servers must implement search capabilities on `DeviceAssociation` for patient-linked devices.
        *   Update client queries and server support for `type` search to use R6-compliant parameters/expressions.
        *   Adjust queries involving `Device.status` to reflect its R6 meaning; use `Device.availabilityStatus` for availability.

3.  **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`Device.availabilityStatus`**: Offers a standardized way to represent device availability, which is relevant for implantable devices (e.g., explanted, available for use).
    *   **New R6 Search Parameters**: R6 introduces dedicated search parameters like `expiration-date`, `lot-number`, `manufacture-date`, and `serial-number`. US Core could recommend or require server support for these, as these elements are already Must Support in the profile, enhancing query capabilities for UDI production identifiers.

## Overall Migration Impact
Impact: Significant

The removal of `Device.patient` and `Device.distinctIdentifier` from the base `Device` resource, both of which are core to `us-core-implantable-device` (one mandatory, one Must Support), necessitates fundamental re-profiling. Decisions on how to use `DeviceAssociation` for patient linkage and how to represent distinct identifiers (likely via `Device.biologicalSourceEvent`) will require careful consideration and community consensus. Changes to search parameters, especially for patient, also represent a major shift for implementations.