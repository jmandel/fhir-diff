## Impact of R6 Changes on `us-core-bmi`

The `us-core-bmi` profile defines specific constraints on `Observation.code` (fixed LOINC for BMI) and `Observation.valueQuantity` (fixed UCUM unit `kg/m2`). It inherits other constraints, such as `status`, `category`, `subject`, `effective[x]`, and `component` handling, from its parent, `us-core-vital-signs`.

The migration from FHIR R4 to R6 for the base `Observation` resource introduces several changes. Here are those that materially impact `us-core-bmi`:

1.  **`Observation.status` Value Set Expansion:**
    *   **Relevant R6 Base Change:** The value set for `Observation.status` (bound with `required` strength) has been significantly expanded in R6 (e.g., adding `corrected`, `appended`, `cancelled`, `specimen-in-process`, `unknown`). The R6 ValueSet URI `http://hl7.org/fhir/ValueSet/observation-status` is also no longer version-pinned.
    *   **Direct Impact on `us-core-bmi`:**
        *   `us-core-bmi` inherits a 1..1 cardinality and Must Support requirement for `Observation.status` from `us-core-vital-signs`.
        *   Implementers producing or consuming `us-core-bmi` instances must now be prepared to handle these new status codes. For example, a BMI observation previously marked `amended` might now use `corrected` or `appended` depending on the workflow.
        *   Systems validating `Observation.status` will need to use the R6 value set.

2.  **New Data Types for `Observation.component.value[x]`:**
    *   **Relevant R6 Base Change:** `Observation.component.value[x]` now supports `Attachment` and `Reference(MolecularSequence)` as new data types.
    *   **Direct Impact on `us-core-bmi`:**
        *   The `us-core-bmi` profile itself does not add specific constraints to `Observation.component`. It inherits component handling from `us-core-vital-signs`, which mandates support for `Observation.component` and its sub-elements like `component.value[x]`.
        *   The `us-core-bmi` HTML documentation notes that observations "MAY have component observations".
        *   If components *are* used with a `us-core-bmi` observation (e.g., to provide additional context), the values of these components (`component.value[x]`) could now technically be an `Attachment` or a `Reference(MolecularSequence)` in an R6 context.
        *   This is an expansion of possibilities. While `us-core-bmi`'s primary `valueQuantity` is unaffected (as it's sliced and constrained to `Quantity`), its optional components now have a wider range of potential value types.

**R6 Changes with No Significant Impact on `us-core-bmi`'s Current Definition:**

*   **New `value[x]` types for `Observation.value[x]`:** The R6 base `Observation.value[x]` adds `Attachment` and `Reference(MolecularSequence)`. However, `us-core-bmi` constrains `Observation.value[x]` to `Observation.valueQuantity`. This profile-specific constraint means the new base types are not applicable to the primary value of a `us-core-bmi` instance.
*   **Expanded Reference Targets for `subject`, `performer`:** R6 expands the list of resource types that `Observation.subject` and `Observation.performer` can reference. However, `us-core-vital-signs` (parent of `us-core-bmi`) already constrains `Observation.subject` to `US Core Patient Profile` and `Observation.performer` to a specific list of US Core profiles. These profile-specific constraints take precedence, so the R6 base expansions do not alter how `us-core-bmi` instances use these elements.
*   **New Elements (`instantiates[x]`, `triggeredBy`, `organizer`, `bodyStructure`, `referenceRange.normalValue`):** These new R6 elements are generally optional or their use is constrained by `us-core-bmi`'s existing structure. For instance, `organizer=true` would conflict with `us-core-bmi`'s requirement for `valueQuantity`. While `instantiates[x]` could be used, it's not a breaking change.
*   **`value-string` Search Parameter Behavior Change:** This R6 breaking change affects how `Observation.valueString` and `Observation.valueCodeableConcept.text` are searched. Since `us-core-bmi` mandates `Observation.valueQuantity` for its primary value and its specified search parameters do not rely on `value-string`, this change has no direct impact on searching `us-core-bmi` instances as defined.
*   **`Observation.referenceRange.text` Type Change (string to markdown):** `us-core-bmi` does not profile `referenceRange`. If used, this is a minor, non-breaking enhancement for display.

## Migration Summary & Actionable Takeaways for `us-core-bmi`

1.  **US Core Profile Changes Required:**
    *   **Status Codes:** The US Core team should review the expanded R6 `Observation.status` codes and decide if any specific guidance or preferred subset is needed for vital signs, including BMI. No change is strictly *required* for the profile to be R6 compatible, but guidance would be beneficial.
    *   **Component Values:** The US Core team should consider if `us-core-vital-signs` (and thus `us-core-bmi`) should explicitly allow or disallow the new R6 data types (`Attachment`, `Reference(MolecularSequence)`) for `Observation.component.value[x]`. Currently, they are implicitly allowed by R6 if components are used.

2.  **Implementation Changes Required:**
    *   **Producers/Consumers of `Observation.status`:** Systems creating or processing `us-core-bmi` data must be updated to recognize and correctly interpret the new R6 status codes (e.g., `corrected`, `cancelled`, `specimen-in-process`). Validation logic must use the R6 `observation-status` value set.
    *   **Producers/Consumers using `Observation.component`:** If systems use components with `us-core-bmi` observations, they should be aware that `component.value[x]` can now be an `Attachment` or `Reference(MolecularSequence)`. This may require updates to data handling and display logic for components.

3.  **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `Observation.instantiates[x]`: This new R6 element allows linking an `Observation` instance to its formal `ObservationDefinition`. The US Core team could consider leveraging this to point `us-core-bmi` instances to a canonical definition, enhancing semantic interoperability.

## Overall Migration Impact
Impact: **Low**

The core definition of `us-core-bmi` (its specific LOINC code pattern and `valueQuantity` structure with `kg/m2`) remains fully compatible with R6. The primary impact comes from the expansion of the `Observation.status` value set, which is a required element inherited from the parent profile. Implementers will need to update their systems to handle these new status codes. A secondary, conditional impact relates to new data types for `Observation.component.value[x]` if components are used.

The profile itself does not require significant re-profiling. The necessary work for the US Core team is minimal, mainly involving decisions on guidance for the new status codes and component value types. Implementer effort will focus on adapting to these terminology and data type expansions in the base resource.