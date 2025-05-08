## Impact of R6 Changes on `us-core-immunization`

The `us-core-immunization` profile defines Must Support (MS) elements and specific constraints on the base FHIR Immunization resource. An analysis of R6 changes to the base `Immunization` resource reveals the following impacts on these core aspects of `us-core-immunization`:

*   **`Immunization.status` (MS, 1..1, required binding):**
    *   **Relevant R6 Base Change(s):** The `status` element remains a `code` with cardinality `1..1`, and the value set binding (`http://hl7.org/fhir/ValueSet/immunization-status`) is unchanged.
    *   **Direct Impact on `us-core-immunization`:** No significant impact. The profile's constraints remain valid.

*   **`Immunization.statusReason` (MS, 0..1, example binding):**
    *   **Relevant R6 Base Change(s):** The `statusReason` element remains a `CodeableConcept` with cardinality `0..1`, and its example value set binding (`http://hl7.org/fhir/ValueSet/immunization-status-reason`) is unchanged.
    *   **Direct Impact on `us-core-immunization`:** No significant impact. The profile's constraints remain valid.

*   **`Immunization.vaccineCode` (MS, 1..1, extensible binding):**
    *   **Relevant R6 Base Change(s):** The `vaccineCode` element remains a `CodeableConcept` with cardinality `1..1`. The binding strength concept (extensible) is consistent.
    *   **Direct Impact on `us-core-immunization`:** No significant impact. The profile's constraints, including the CVX value set binding and the `us-core-5` constraint (SHOULD have NDC translation), remain valid and applicable.

*   **`Immunization.patient` (MS, 1..1, Reference to `us-core-patient`):**
    *   **Relevant R6 Base Change(s):** The `patient` element remains a `Reference(Patient)` with cardinality `1..1`.
    *   **Direct Impact on `us-core-immunization`:** No significant impact. The profile's constraints remain valid.

*   **`Immunization.occurrence[x]` (MS, 1..1, `dateTime` MS=true):**
    *   **Relevant R6 Base Change(s):** The `occurrence[x]` element remains a choice of `dateTime` or `string` with cardinality `1..1`.
    *   **Direct Impact on `us-core-immunization`:** No significant impact. The profile's constraint making `dateTime` Must Support for the choice remains valid.

*   **`Immunization.primarySource` (MS, 0..1, boolean):**
    *   **Relevant R6 Base Change(s):** The `primarySource` element remains a `boolean` with cardinality `0..1` in the R6 base `Immunization` resource. Its definition is consistent. The R4 element `reportOrigin` (`CodeableConcept`) has been renamed and retyped to `informationSource` (`CodeableReference`) in R6.
    *   **Direct Impact on `us-core-immunization`:** No significant impact on `us-core-immunization`'s `primarySource` element. The profile's use of `primarySource` (boolean) is unaffected by the changes to the separate `reportOrigin`/`informationSource` field, which `us-core-immunization` does not currently profile as Must Support.

*   **`Immunization.performer.actor` (MS, 1..1, constrained References):**
    *   **Relevant R6 Base Change(s):** The target resource types for `Immunization.performer.actor` in the R6 base resource have been expanded to include `Patient` and `RelatedPerson`, in addition to `Practitioner`, `PractitionerRole`, and `Organization`.
    *   **Direct Impact on `us-core-immunization`:** No direct negative impact. `us-core-immunization` constrains `performer.actor` to reference US Core profiles for `Practitioner`, `PractitionerRole`, and `Organization`. This more restrictive constraint remains valid. The US Core team *could* choose to expand its allowed types to align with R6 if desired, but it's not a required change for R6 compatibility of the current profile.

**Elements Where Base R6 Changes Do *Not* Significantly Impact the `us-core-immunization` Profile Definition:**

Several breaking changes occurred in the R6 base `Immunization` resource. These include:
*   The merging of R4 `reasonCode` (CodeableConcept) and `reasonReference` (Reference) into a single R6 `reason` (CodeableReference).
*   The removal of the R4 `education` backbone element (previously used for documenting educational materials, with R6 guidance to use the `Communication` resource instead).
*   The restructuring of R4 `programEligibility` (CodeableConcept) into an R6 backbone element `Immunization.programEligibility` with `program` and `programStatus` child elements.
*   The change of `Immunization.manufacturer` from `Reference(Organization)` in R4 to `CodeableReference(Organization)` in R6.
*   The change of `Immunization.protocolApplied.doseNumber[x]` (from `positiveInt` or `string`) to `CodeableConcept` in R6.
*   The change of `Immunization.protocolApplied.seriesDoses[x]` (from `positiveInt` or `string`) to `CodeableConcept` in R6.

These R6 base changes do **not** have a direct, breaking impact on the *current definition* of `us-core-immunization` because the profile does not mandate (make Must Support) or apply specific constraints to these particular R4 elements (e.g., `reasonCode`, `education`, `programEligibility`, `manufacturer`, `protocolApplied`). Therefore, their modification or removal in R6 does not invalidate the existing `us-core-immunization` profile structure for its currently defined Must Support elements.

---

## Migration Summary & Actionable Takeaways for `us-core-immunization`

*   **US Core Profile Changes Required:**
    *   The `us-core-immunization` profile itself **does not require mandatory changes** to its current set of Must Support elements, cardinalities, or core bindings to be R6 compatible. The existing constraints are generally compatible with the R6 base `Immunization` resource.
    *   The `fhirVersion` in the `StructureDefinition` will need to be updated from `4.0.1` to an R6-compatible version (e.g., `6.0.0`).
    *   **Optional consideration:** The US Core team may evaluate whether to expand the allowed target profiles for `Immunization.performer.actor` to include Patient or RelatedPerson, aligning with the expanded R6 base types, if appropriate for US Core use cases. This is not a requirement for R6 migration.

*   **Implementation Changes Required:**
    *   **For systems consuming/producing `us-core-immunization` instances that *only* populate the Must Support elements as defined by the profile:** Minimal changes directly related to the profile's core elements are expected for R6 compatibility.
    *   **For systems that populate *optional* R4 `Immunization` elements (not mandated by `us-core-immunization` but allowed by the base R4 resource):** If implementations were using R4 elements like `reasonCode`, `reasonReference`, `education`, `programEligibility`, or `manufacturer`, they will need to adapt their systems to the R6 structure for these elements when creating or processing R6-native Immunization resources. For example:
        *   Data for R4 `reasonCode`/`reasonReference` should map to the R6 `reason` (CodeableReference).
        *   Information previously in R4 `education` should be represented using the R6 `Communication` resource.
        *   Data for R4 `programEligibility` should map to the new R6 `Immunization.programEligibility` backbone structure.
        *   If R4 `manufacturer` (Reference) was used, it would map to R6 `manufacturer` (CodeableReference).
    *   Implementers should review their search query logic, as expressions for some search parameters (e.g., `manufacturer`, `reason-code`, `reason-reference`) have changed in R6 to reflect underlying element changes.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`Immunization.administeredProduct` (CodeableReference(Medication)):** This new R6 element offers a more specific way to detail the administered vaccine, potentially linking to a `Medication` resource. This could be an enhancement if more granular product information is desired beyond `vaccineCode`.
    *   **`Immunization.basedOn` (Reference):** Allows linking the immunization to an authorizing `CarePlan`, `MedicationRequest`, `ServiceRequest`, or `ImmunizationRecommendation`. This could improve traceability for planned immunizations.
    *   **Consolidated `Immunization.reason` (CodeableReference):** While `us-core-immunization` does not currently profile the reason, the R6 `reason` element provides a unified way to capture this, which could be profiled if future needs arise.

---

## Overall Migration Impact
Impact: Low

The `us-core-immunization` profile, as currently defined, requires minimal direct changes to be compatible with FHIR R6. The breaking changes in the base R6 `Immunization` resource primarily affect elements not currently mandated or specifically constrained by `us-core-immunization`.

The primary effort for the US Core editorial team will be updating the `fhirVersion` in the profile definition and considering optional enhancements based on new R6 features. Implementers whose systems use only the Must Support elements of `us-core-immunization` will experience little direct impact from a profile perspective. Those using optional R4 elements will need to adapt to the R6 base resource changes for those specific elements if they move to processing R6-native Immunization resources.