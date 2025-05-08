## Impact of R6 Changes on `us-core-adi-documentreference`

This section analyzes R6 base `DocumentReference` changes that directly affect `us-core-adi-documentreference`.

*   **`DocumentReference.authenticator` (Must Support in profile)**
    *   **Relevant R6 Base Change:** The `authenticator` element is **removed** in R6. It is replaced by a new backbone element `attester` which has sub-elements: `mode` (CodeableConcept), `time` (dateTime), and `party` (Reference).
    *   **Direct Impact on `us-core-adi-documentreference`:** Critical. The profile currently mandates support for `authenticator`. Since this element no longer exists, the profile **must be updated**. It will need to define constraints on the new `attester` element (e.g., which sub-elements are Must Support, target profiles for `attester.party`).

*   **`DocumentReference.extension:authenticationTime` (Must Support in profile)**
    *   **Relevant R6 Base Change:** The R4 `authenticator` (to which this extension conceptually relates for "verification date") is removed. The new R6 `attester` element includes an optional `attester.time` (dateTime) sub-element.
    *   **Direct Impact on `us-core-adi-documentreference`:** Significant. The US Core team must decide whether to continue using the `us-core-authentication-time` extension or to profile and mandate `attester.time` instead. Using the native R6 `attester.time` would be preferable for R6 alignment.

*   **`DocumentReference.content.format` (Must Support in profile)**
    *   **Relevant R6 Base Change:** The `content.format` element (type `Coding`) is **removed** in R6. It is replaced by a new backbone element `content.profile` which allows specifying document conformance via `valueCoding`, `valueUri`, or `valueCanonical`.
    *   **Direct Impact on `us-core-adi-documentreference`:** Critical. The profile currently mandates support for `content.format`. Since this element no longer exists, the profile **must be updated**. It will need to define constraints on the new `content.profile` element, likely constraining `content.profile.valueCoding` to achieve similar functionality to the R4 `content.format`.

*   **`DocumentReference.date` (Must Support in profile)**
    *   **Relevant R6 Base Change:** The data type of `DocumentReference.date` (when the DocumentReference was created) changes from `instant` (R4) to `dateTime` (R6).
    *   **Direct Impact on `us-core-adi-documentreference`:** Significant. The profile definition must be updated to reflect `dateTime`. Implementers must change their systems to produce and consume `dateTime` for this element. Data previously stored as `instant` is generally compatible as `dateTime` allows for less precision.

*   **`DocumentReference.docStatus` (Not directly constrained by profile, but relevant due to base changes)**
    *   **Relevant R6 Base Change:** In R6, `docStatus` (status of the underlying document) is now marked as `isModifier: true`. Its value set (`composition-status`) is also significantly expanded.
    *   **Direct Impact on `us-core-adi-documentreference`:** Significant for implementers. Because the profile doesn't constrain `docStatus`, it inherits the R6 base definition. Implementers must be aware that `docStatus` can now affect the interpretation of the DocumentReference resource itself (e.g., `entered-in-error` invalidates it). The US Core team may consider adding specific guidance or constraints on `docStatus` for ADI use cases.

*   **`DocumentReference.subject` (Must Support in profile)**
    *   **Relevant R6 Base Change:** The allowed type for `subject` changes from a constrained list of references in R4 (Patient, Practitioner, Group, Device) to `Reference(Any)` in R6.
    *   **Direct Impact on `us-core-adi-documentreference`:** Low. The profile already constrains `subject` to `Reference(us-core-patient)` as Must Support, which is compatible with (more restrictive than) `Reference(Any)`. No change is *forced* on the profile's current constraint, but it could be broadened if desired.

The removal of R4 `DocumentReference.context` backbone element and promotion/restructuring of its sub-elements does not directly break constraints in `us-core-adi-documentreference` as this profile did not mandate `context` or its sub-elements. However, the editorial team might consider if new R6 elements like top-level `period` or `event` are relevant.

---

## Migration Summary & Actionable Takeaways for `us-core-adi-documentreference`

*   **US Core Profile Changes Required:** Yes, significant re-profiling is needed.
    1.  **Replace `authenticator`:** Remove constraints on `DocumentReference.authenticator`. Add new Must Support constraints on the R6 `DocumentReference.attester` backbone element, specifying which sub-elements (`mode`, `time`, `party`) are required and their target profiles/value sets.
    2.  **Address `us-core-authentication-time` extension:** Decide if this extension is still necessary. Consider deprecating it and instead profiling `DocumentReference.attester.time` to meet the "verification date" requirement.
    3.  **Replace `content.format`:** Remove constraints on `DocumentReference.content.format`. Add new Must Support constraints on the R6 `DocumentReference.content.profile` backbone element, likely focusing on `content.profile.valueCoding` and its binding.
    4.  **Update `date` type:** Change the data type of `DocumentReference.date` in the profile from `instant` to `dateTime`.
    5.  **Review `docStatus`:** Consider adding profile-specific guidance or constraints for `DocumentReference.docStatus` due to its new `isModifier: true` status and expanded value set in R6.
    6.  **Review other R6 elements:** Evaluate if other new R6 `DocumentReference` elements (e.g., `version`, `modality`, `bodySite`, or promoted context elements like `period` or `event`) are relevant for ADI documentation and should be included in the profile.

*   **Implementation Changes Required:** Yes, significant changes for implementers.
    1.  **Adapt to `attester`:** Systems must stop using `authenticator` and instead populate/parse the new `attester` structure according to the updated profile.
    2.  **Adapt to `content.profile`:** Systems must stop using `content.format` and instead populate/parse the new `content.profile` structure.
    3.  **Handle `date` as `dateTime`:** Update data models and processing logic for `DocumentReference.date` to use `dateTime`.
    4.  **Understand `docStatus` modifier:** Implementers must handle `docStatus` as a modifier element, recognizing that certain statuses can invalidate the DocumentReference. Support for the expanded value set will be necessary.
    5.  **Update for `us-core-authentication-time`:** If this extension is replaced by `attester.time`, update systems accordingly.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`attester` element:** Provides a more structured and granular way to record attestations about the document, including `attester.time` which could natively represent the "verification date".
    *   **`content.profile` element:** Offers a richer way to specify document conformance to various standards or templates using URIs or canonicals, beyond just a format code.
    *   **`docStatus` (modifier and expanded ValueSet):** Allows more precise representation of the ADI document's lifecycle status and its impact on the DocumentReference's validity.
    *   **`version` element:** Could be used if explicit versioning of ADI documents becomes a requirement.

---

## Overall Migration Impact
Impact: **Significant**

The profile requires substantial updates due to the removal of `DocumentReference.authenticator` and `DocumentReference.content.format`, both of which are Must Support in `us-core-adi-documentreference`. Decisions must be made on how to profile their R6 replacements (`attester` and `content.profile`). The change in `DocumentReference.date`'s data type also necessitates profile and implementation updates. Furthermore, the role of the `us-core-authentication-time` extension needs re-evaluation in light of `attester.time`. These changes will require new profiling decisions and likely community consensus.