## Impact of R6 Changes on `us-core-pulse-oximetry`

The `us-core-pulse-oximetry` profile inherits from `us-core-vital-signs`. We analyze R6 `Observation` changes impacting core elements and constraints defined or relied upon by this profile.

*   **`Observation.status`**
    *   **Profile Constraint:** This element is Must Support and has a cardinality of 1..1 in the parent `us-core-vital-signs` profile. `us-core-pulse-oximetry` inherits this. The profile does not further restrict the value set for `status`.
    *   **Relevant R6 Base Change:** The value set for `Observation.status` (`http://hl7.org/fhir/ValueSet/observation-status`) has been significantly expanded in R6. New codes include `corrected`, `appended`, `cancelled`, `unknown`, `specimen-in-process`, `cannot-be-obtained`. The R6 ValueSet URI is also unversioned. This is a breaking change for systems expecting only R4 status codes.
    *   **Direct Impact on `us-core-pulse-oximetry`:**
        *   Instances of `us-core-pulse-oximetry` conforming to an R6 version of US Core could legitimately use these new R6 status codes.
        *   Consuming systems will need to be updated to recognize and appropriately handle these new status codes. Failure to do so may lead to misinterpretation or processing errors.
        *   The profile definition itself doesn't require a change to accommodate this, but implementers must be aware of the expanded vocabulary.

*   **Other Must Support Elements (e.g., `category`, `code`, `subject`, `effective[x]`, `valueQuantity`, `component` slices)**
    *   **Profile Constraints:** `us-core-pulse-oximetry` (and its parent `us-core-vital-signs`) tightly constrains many Must Support elements. For example:
        *   `Observation.category` is fixed to `vital-signs`.
        *   `Observation.subject` is constrained to `Reference(USCorePatientProfile)`.
        *   `Observation.code` requires specific LOINC codes (59408-5, 2708-6).
        *   `Observation.value[x]` is fixed to `Observation.valueQuantity` with specific unit constraints.
        *   `Observation.component.value[x]` within the `FlowRate` and `Concentration` slices is fixed to `Observation.component.valueQuantity` with specific unit constraints.
    *   **Relevant R6 Base Change(s) Considered:**
        *   `Observation.subject`, `Observation.performer`, `Observation.specimen`, `Observation.partOf`, `Observation.derivedFrom` have expanded reference targets in R6.
        *   `Observation.value[x]` and `Observation.component.value[x]` now support `Attachment` and `Reference(MolecularSequence)` types in R6.
        *   New elements like `instantiates[x]`, `triggeredBy`, `organizer`, `bodyStructure` are available in R6.
        *   New constraint `obs-10` for `Observation.component.dataAbsentReason` is added.
    *   **Direct Impact on `us-core-pulse-oximetry`:**