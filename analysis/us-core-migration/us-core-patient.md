## Impact of R6 Changes on `us-core-patient`

This section analyzes R6 `Patient` resource changes that affect core elements, constraints, and patterns defined or relied on by `us-core-patient`.

*   **`Patient.contact` (Backbone Element):**
    *   **Relevant R6 Base Change(s):**
        1.  `Patient.contact.relationship`: The value set binding changes from `http://hl7.org/fhir/ValueSet/patient-contactrelationship` (R4, extensible) to `http://terminology.hl7.org/ValueSet/v3-PersonalRelationshipRoleType` (R6, preferred). This is a **breaking change** for data.
        2.  New Trial Use (TU) elements added: `Patient.contact.role` (CodeableConcept), `Patient.contact.additionalName` (HumanName), `Patient.contact.additionalAddress` (Address).
    *   **Direct Impact on `us-core-patient`:**
        *   `us-core-patient` does not explicitly profile, mandate, or make `Patient.contact` Must Support. It is inherited from the base `Patient` resource.
        *   Implementers who *currently include `Patient.contact` data* in their `us-core-patient` R4 instances will be impacted:
            *   Data within `Patient.contact.relationship` will require mapping to the new R6 value set (`v3-PersonalRelationshipRoleType`).
            *   Validation logic for `Patient.contact.relationship` must be updated.
            *   The new R6 elements (`role`, `additionalName`, `additionalAddress`) offer more granular ways to represent contact information, which can be adopted.
        *   If `us-core-patient` itself does not guide or expect the use of `Patient.contact`, the direct impact on the profile's *definition* is minimal, but implementers using this optional part of the resource must adapt.

*   **Guidance on Gender/Sex Representation (Relevant to `us-core-sex` extension intent):**
    *   **Relevant R6 Base Change(s):** The R6 `Patient` resource documentation provides updated and more detailed guidance on representing various aspects of gender and sex, often pointing to standard FHIR extensions (e.g., `genderIdentity`, `sexParameterForClinicalUse`).
    *   **Direct Impact on `us-core-patient`:**
        *   `us-core-patient` mandates the `us-core-sex` extension (profiled from `http://hl7.org/fhir/us/core/StructureDefinition/us-core-sex`) to represent USCDI "Sex (Assigned at Birth)" or "Sex for Clinical Use". This extension is not structurally broken by R6 base changes.
        *   The US Core editorial team may wish to review R6's broader guidance to ensure `us-core-sex` aligns with evolving international patterns or to see if newer R6 standard extensions could complement or refine US Core's approach to sex/gender representation in the future. This is a strategic consideration rather than an immediate technical break.

*   **Must Support Elements and Core Structure:**
    *   **Relevant R6 Base Change(s):** Key elements that `us-core-patient` marks as Must Support or constrains (e.g., `Patient.identifier`, `Patient.name`, `Patient.telecom`, `Patient.birthDate`, `Patient.address`, `Patient.communication.language`) are stable in structure and core definition from R4 to R6, according to the provided diff.
    *   **Direct Impact on `us-core-patient`:** No significant impact. The profile's core constraints on these elements remain valid.

*   **US Core Extensions (`us-core-race`, `us-core-ethnicity`, `us-core-tribal-affiliation`, `us-core-interpreter-needed`):**
    *   **Relevant R6 Base Change(s):** The base R6 `Patient` resource diff does not indicate changes to the fundamental `Patient.extension` mechanism that would break these US Core defined extensions.
    *   **Direct Impact on `us-core-patient`:** No direct impact. These extensions remain structurally valid.

## Migration Summary & Actionable Takeaways for `us-core-patient`

*   **US Core Profile Changes Required:**
    *   No, `us-core-patient` does *not strictly need* to be re-profiled for its current specified scope to function against an R6 `Patient` resource.
    *   **Considerations for US Core Team:**
        1.  **`Patient.contact`:** Decide if US Core R6 should explicitly profile `Patient.contact` to guide its use, incorporating the new R6 elements and the `relationship` binding change. Currently, its use is unguided by `us-core-patient`.
        2.  **`us-core-sex` Extension:** Review the `us-core-sex` extension's alignment with R6's updated general guidance on gender/sex representation. This is for future harmonisation, not due to a current break.

*   **Implementation Changes Required:**
    *   **For implementations *using* `Patient.contact` in `us-core-patient` instances:**
        *   **Mandatory:** Update systems to handle the `Patient.contact.relationship` value set change. This involves data mapping from the R4 `patient-contactrelationship` VS to the R6 `v3-PersonalRelationshipRoleType` VS and updating validation logic.
        *   **Optional:** Evaluate and adopt the new `Patient.contact.role`, `Patient.contact.additionalName`, and `Patient.contact.additionalAddress` elements if they improve data representation.
    *   **For implementations *not using* `Patient.contact`:** Minimal to no code changes are anticipated for other `us-core-patient` data elements based on the R6 `Patient` diff.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   The enhanced `Patient.contact` model in R6 (with distinct `role`, `additionalName`, `additionalAddress`) offers richer capabilities if US Core or implementers decide to leverage contact information more extensively.
    *   R6's evolving guidance on gender and sex may provide opportunities for future enhancements or clarifications related to the intent of the `us-core-sex` extension.

## Overall Migration Impact
Impact: **Low**

The core demographic elements, Must Support requirements, and custom extensions defined in `us-core-patient` are largely unaffected by the R4 to R6 changes in the base `Patient` resource. The most significant R6 change is to `Patient.contact`, an element not directly constrained or mandated by `us-core-patient`. Implementers who *voluntarily* use `Patient.contact` in their `us-core-patient` instances will need to address the breaking change in `Patient.contact.relationship`'s terminology binding. The profile itself does not require substantial rework to maintain its current functionality and purpose in an R6 environment. The US Core team has optional considerations for future enhancements based on R6 features.