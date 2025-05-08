## Impact of R6 Changes on `us-core-goal`

The primary R6 change to the base `Goal` resource that directly impacts the `us-core-goal` profile definition is the modification of the `Goal.expressedBy` element.

*   **`Goal.expressedBy` (Must Support element in `us-core-goal`)**
    *   **Relevant R6 Base Change(s):** In R6, the base `Goal` element `Goal.expressedBy` is **renamed** to `Goal.source`. Additionally, the allowed FHIR resource types that `Goal.source` can reference have been expanded to include `CareTeam` and `Group`, in addition to the R4 types (`Patient`, `Practitioner`, `PractitionerRole`, `RelatedPerson`).
    *   **Direct Impact on `us-core-goal` Definition:**
        1.  The path `Goal.expressedBy`, which `us-core-goal` currently constrains and marks as Must Support, will be invalid in an R6 context. The profile **must** be updated to refer to `Goal.source`.
        2.  The Must Support flag and existing US Core constraints on the target profiles for this element (currently `US Core Practitioner` (MS), `US Core Patient`, `PractitionerRole`, `US Core RelatedPerson`) will need to be re-applied to `Goal.source`. These specific target resource types remain valid reference targets for `Goal.source` in R6.
        3.  A decision will be required by the US Core team on whether to permit, and potentially profile, the newly available `CareTeam` and `Group` reference types for `Goal.source` within `us-core-goal`.

Other changes in the R6 `Goal` resource (e.g., removal of `Goal.outcomeCode` and `Goal.outcomeReference`, type change of `Goal.statusReason`, addition of `Goal.continuous` and `Goal.acceptance`) do not directly affect the existing Must Support elements, cardinality constraints, or critical terminology bindings currently defined in `us-core-goal`. This is because `us-core-goal` does not presently mandate or constrain these particular elements. While implementers of the base `Goal` resource will need to adapt to these R6 changes, they do not require modifications to `us-core-goal`'s current constraints beyond the `Goal.expressedBy` to `Goal.source` update.

## Migration Summary & Actionable Takeaways for `us-core-goal`

**1. US Core Profile Changes Required:**
*   Yes, `us-core-goal` will need to be updated for R6.
*   **Primary Change:** The element `Goal.expressedBy` must be changed to `Goal.source` in the profile's differential. All associated constraints, including Must Support status and target profile restrictions (e.g., to `US Core Practitioner`), must be applied to this new path.
*   **Decision Point:** The US Core team needs to evaluate whether to allow (and potentially profile) `CareTeam` and `Group` as valid reference targets for `Goal.source` in the R6 version of `us-core-goal`.

**2. Implementation Changes Required:**
*   Yes, implementers producing or consuming `us-core-goal` instances will need to update their systems.
*   **Code Update:** Systems must be modified to use the element name `Goal.source` instead of `Goal.expressedBy`.
*   **Handle New Types (Conditional):** If US Core decides to allow `CareTeam` or `Group` as reference targets for `Goal.source`, consuming systems must be prepared to handle these new types.
*   **Awareness of Other Base Changes:** While not directly mandated by `us-core-goal`, implementers should be aware of other R6 `Goal` base resource changes (e.g., removal of `outcomeCode`/`outcomeReference`, changes to `statusReason`) as these could affect how optional data is handled or how data is exchanged with systems not strictly adhering to only the US Core profiled elements.

**3. New R6 Features Relevant to Profile Intent (Optional & Brief):**
*   **`Goal.acceptance`:** This new R6 backbone element allows for formally recording acceptance and priority of the goal from various stakeholders (e.g., patient, practitioner). Incorporating this could enhance `us-core-goal` by providing a structured way to capture collaborative agreement on goals.
*   **`Goal.continuous`:** This new R6 boolean element indicates if a goal requires ongoing activity to sustain its objective. This could be a useful addition for `us-core-goal` to better categorize and manage different types of health goals (e.g., lifestyle maintenance vs. acute recovery).

## Overall Migration Impact
Impact: Low

The `us-core-goal` profile requires a straightforward update to reflect the renaming of `Goal.expressedBy` to `Goal.source`. This is a breaking change for the path, necessitating a profile update and corresponding implementation changes. A decision on whether to incorporate newly allowed reference types for `Goal.source` (`CareTeam`, `Group`) is also needed. Other R6 base `Goal` changes do not directly affect elements currently constrained by `us-core-goal`, thus minimizing complex re-profiling efforts. The core purpose and structure of what `us-core-goal` mandates remain largely intact.