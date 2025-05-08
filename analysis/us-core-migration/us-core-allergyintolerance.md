## Impact of R6 Changes on `us-core-allergyintolerance`

This section details specific R6 base `AllergyIntolerance` changes that directly affect `us-core-allergyintolerance`.

*   **`AllergyIntolerance.reaction.manifestation` (Must Support Element)**
    *   **Relevant R6 Base Change:** The data type of `AllergyIntolerance.reaction.manifestation` changes from `CodeableConcept` in R4 to `CodeableReference(Observation)` in R6. This is a **breaking change**.
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   The profile *must* be updated to reflect this new `CodeableReference(Observation)` type for `reaction.manifestation`.
        *   The current US Core binding of `reaction.manifestation` to the `SNOMEDCTClinicalFindings` value set (http://hl7.org/fhir/ValueSet/clinical-findings) will now apply to the `.concept` part of the `CodeableReference`.
        *   Implementers will need to significantly alter how they produce and consume allergy manifestation data, as it can now be either a code or a reference to a separate `Observation` resource.

*   **`AllergyIntolerance.code` (Mandatory, Must Support Element)**
    *   **Relevant R6 Base Change:** R6 introduces a rule: "If the 'substanceExposureRisk' extension is present, the AllergyIntolerance.code element SHALL be omitted."
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   `us-core-allergyintolerance` currently mandates `AllergyIntolerance.code` with a cardinality of `1..1`. This profile constraint conflicts with the new R6 allowance to omit `code` when using the `substanceExposureRisk` extension (an extension not currently profiled by US Core).
        *   The US Core team must decide whether to:
            1.  Maintain `code` as `1..1`, effectively disallowing the use of `substanceExposureRisk` *instead* of `code` in US Core.
            2.  Change `code` cardinality to `0..1` to align with this R6 pattern, and potentially profile the `substanceExposureRisk` extension.

*   **`AllergyIntolerance.clinicalStatus` (Must Support Element) and Profile Constraints `ait-1`, `ait-2`**
    *   **Relevant R6 Base Change:** The formal constraints `ait-1` ("AllergyIntolerance.clinicalStatus SHALL be present if verificationStatus is not entered-in-error") and `ait-2` ("AllergyIntolerance.clinicalStatus SHALL NOT be present if verification Status is entered-in-error") are removed from the base R6 `AllergyIntolerance` resource. Guidance is now provided as textual comments in the base specification.
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   `us-core-allergyintolerance` currently defines these as formal constraints.
        *   The US Core team must decide whether to retain these as stricter profile-specific formal constraints or align with R6 by removing them and relying on the (less formal) base R6 textual guidance.

*   **`AllergyIntolerance.verificationStatus` (Must Support Element)**
    *   **Relevant R6 Base Change:** The R6 value set for `AllergyIntolerance.verificationStatus` (http://hl7.org/fhir/ValueSet/allergyintolerance-verification), to which US Core has a required binding, now includes the code `presumed`.
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   Instances of `us-core-allergyintolerance` may now use `presumed` for `verificationStatus`.
        *   Implementers must be updated to recognize and correctly interpret this new status. The profile's binding remains valid.

*   **`AllergyIntolerance.recorder` (Profiled Element, USCDI Additional Requirement)**
    *   **Relevant R6 Base Change:** The `AllergyIntolerance.recorder` element in R6 can now reference `Organization`.
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   `us-core-allergyintolerance` currently constrains `recorder` to `Reference(us-core-practitioner | us-core-patient | PractitionerRole | us-core-relatedperson)` and does not include `Organization`.
        *   To align with the expanded R6 capability, the US Core team would need to consider adding `Reference(Organization)` (or a US Core Organization profile) to the allowed target types for `recorder`.

*   **`AllergyIntolerance.reaction` (Must Support Backbone Element)**
    *   **Relevant R6 Base Change:** The entire `AllergyIntolerance.reaction` backbone element (and its children, including `manifestation`) is marked as Trial Use (TU) in R6.
    *   **Direct Impact on `us-core-allergyintolerance`:**
        *   This TU status signals that `reaction` may undergo further changes in future R6 updates or R7.
        *   While no immediate profile change is forced by the TU status itself, the US Core team should monitor the evolution of this element in the base specification.

---
## Migration Summary & Actionable Takeaways for `us-core-allergyintolerance`

1.  **US Core Profile Changes Required:**
    *   **Yes, significant re-profiling is necessary.**
    *   **Crucial:** Update `AllergyIntolerance.reaction.manifestation` from `CodeableConcept` to `CodeableReference(Observation)`. The existing value set binding for manifestation codes will apply to the `.concept` attribute of `CodeableReference`.
    *   **Decision Point:** Determine the cardinality of `AllergyIntolerance.code` (currently `1..1`). If alignment with the R6 `substanceExposureRisk` pattern is desired, change `code` to `0..1` and consider profiling the `substanceExposureRisk` extension. Otherwise, maintain `1..1` and document that the R6 pattern of omitting `code` is not supported.
    *   **Decision Point:** Decide whether to maintain the formal constraints `ait-1` and `ait-2` related to `clinicalStatus` and `verificationStatus` or remove them to align with base R6's move to textual guidance.
    *   **Consideration:** Evaluate whether to allow `Reference(Organization)` for `AllergyIntolerance.recorder` and update its target profile list if adopted.
    *   No profile change is needed for `verificationStatus` due to the new `presumed` code, but awareness is key.

2.  **Implementation Changes Required:**
    *   **Yes, substantial updates for implementers.**
    *   Adapt data models, data exchange logic, and rendering for `AllergyIntolerance.reaction.manifestation` to support the `CodeableReference(Observation)` structure. Systems must be able to produce and consume manifestations as either a coded concept or a reference to an `Observation`.
    *   Update systems to recognize and handle the new `presumed` code for `AllergyIntolerance.verificationStatus`.
    *   Prepare for potential changes to `AllergyIntolerance.code` usage based on the US Core team's decision.
    *   If US Core allows `Organization` for `recorder`, ensure systems can process this reference type.
    *   Be aware of how US Core resolves the `clinicalStatus` constraint definitions, as this affects validation logic.

3.  **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   The `CodeableReference(Observation)` type for `reaction.manifestation` allows for significantly richer, structured detail for observed signs/symptoms by referencing a full `Observation` resource. This can enhance the clinical detail captured, aligning with the profile's intent.
    *   If adopted, the R6 `substanceExposureRisk` extension could offer a more explicit way to represent certain negated allergy statements compared to relying solely on specific codes within `AllergyIntolerance.code`.

---
## Overall Migration Impact
Impact: **Significant**

The change in data type for `AllergyIntolerance.reaction.manifestation` from `CodeableConcept` to `CodeableReference(Observation)` is a breaking change that requires substantial modification to the profile definition and implementation logic. Additionally, the US Core team must make key decisions regarding the cardinality of `AllergyIntolerance.code` in light of new R6 guidance, the handling of `clinicalStatus` constraints, and the potential expansion of `recorder`'s reference types. These decisions will require careful consideration and consensus.