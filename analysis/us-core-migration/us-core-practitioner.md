## Impact of R6 Changes on `us-core-practitioner`

This section analyzes R6 base `Practitioner` changes that directly affect core elements, constraints, and usage patterns defined or relied on by `us-core-practitioner`.

*   **`Practitioner.identifier` (and associated search)**
    *   **`us-core-practitioner` Constraint:** Mandates `Practitioner.identifier` (1..*), slices for NPI (`Practitioner.identifier:NPI`), and marks these as Must Support. Searching by identifier (especially NPI) is a primary use case.
    *   **Relevant R6 Base Change:** The standard `identifier` search parameter expression in R6 (`Practitioner.identifier | Practitioner.qualification.identifier`) is broadened to include `Practitioner.qualification.identifier`. The R4 expression was `Practitioner.identifier`.
    *   **Direct Impact on `us-core-practitioner`:**
        *   The US Core profile's structural constraints on `Practitioner.identifier` (e.g., NPI slice, `identifier.system`, `identifier.value` cardinalities) are not broken by R6 changes to the `Identifier` datatype itself.
        *   However, the standard search behavior for `identifier` changes. If US Core relies on the base FHIR `identifier` search parameter, queries against an R6 server might return Practitioners based on matches in `Practitioner.qualification.identifier`, in addition to `Practitioner.identifier`. This could lead to unexpected or broader search results than in R4 if systems populate `qualification.identifier`.
        *   The US Core IG defines search parameters like `SearchParameter-us-core-practitioner-identifier.html`. The team needs to review if this search parameter's definition will implicitly inherit the broader R6 scope or if it needs to be re-scoped for US Core purposes to target only `Practitioner.identifier`.

*   **`Practitioner.communication`**
    *   **`us-core-practitioner` Constraint:** This profile currently does *not* apply specific constraints (e.g., Must Support, cardinality changes) to the `Practitioner.communication` element. It remains an optional element from the base Practitioner resource.
    *   **Relevant R6 Base Change:** `Practitioner.communication` undergoes a **breaking structural change**.
        *   In R4, it is `0..*` `CodeableConcept`.
        *   In R6, it is `0..*` BackboneElement, where each element contains a required `language` (`CodeableConcept`) and an optional `preferred` (`boolean`). The binding for `language` is also strengthened to 'required' and uses a different ValueSet (`all-languages` vs. R4's `languages`).
    *   **Direct Impact on `us-core-practitioner`:**
        *   Since `us-core-practitioner` does not currently profile `Practitioner.communication`, the R6 base changes do not require alterations to the *existing differential* of `us-core-practitioner` for this element.
        *   However, if R4 `us-core-practitioner` instances *did* include data in the optional `Practitioner.communication` element, migrating these instances to R6 will require transforming this data to the new R6 backbone structure. This is an impact on implementers who used this optional field, rather than a direct impact compelling a change in the US Core profile's current (lack of) constraints on `communication`.
        *   The R6 documentation also clarifies that `Practitioner.communication` is for communication *with* the practitioner (often administrative), while `PractitionerRole.communication` is for languages used in *patient* communication. This clarification might influence future US Core profiling decisions.

*   **`Practitioner.active`**
    *   **`us-core-practitioner` Constraint:** This profile does not constrain `Practitioner.active`.
    *   **Relevant R6 Base Change:** `Practitioner.active` is now marked `isModifier: true` in R6, and its "Meaning if Missing" (assumed active) is defined.
    *   **Direct Impact on `us-core-practitioner`:** No direct impact on the current `us-core-practitioner` definition, as the profile does not impose constraints on `active`. Implementers should be aware of the R6 base interpretation if `active` is omitted from an instance.

*   **New Elements in R6 Base Practitioner (e.g., `Practitioner.deceased[x]`, `Practitioner.qualification.status`)**
    *   **`us-core-practitioner` Constraint:** These elements are not part of the R4 Practitioner resource and are therefore not currently constrained or mentioned in `us-core-practitioner`.
    *   **Direct Impact on `us-core-practitioner`:** The addition of these new optional elements in R6 does not break the current `us-core-practitioner` definition. They represent potential new data points US Core could choose to profile in an R6 version.

## Migration Summary & Actionable Takeaways for `us-core-practitioner`

1.  **US Core Profile Changes Required:**
    *   **`Practitioner.identifier` Search:** The US Core team must decide how the `us-core-practitioner-identifier` search parameter should behave in R6. Options include:
        *   Aligning with the broader R6 base `identifier` search (includes `Practitioner.qualification.identifier`).
        *   Explicitly constraining the US Core search parameter to only target `Practitioner.identifier` fields if the R4 scope is to be maintained. This might require a specific XPath expression in the US Core SearchParameter definition.
    *   **`Practitioner.communication`:** No changes are strictly *required* for the `us-core-practitioner` profile definition itself regarding `communication` if the intent is to continue not profiling it. However, the IG should acknowledge the R6 breaking change for implementers who may have used this optional element in R4 instances. The team might *consider* profiling `Practitioner.communication` in R6 given its refined purpose and structure.
    *   The `StructureDefinition.fhirVersion` will need to be updated to R6.

2.  **Implementation Changes Required:**
    *   **Identifier Search:**
        *   Clients querying R6 servers using the standard `Practitioner?identifier=` syntax may receive a broader set of results than from R4 servers.
        *   Servers conforming to US Core will need to implement the `identifier` search according to US Core's decision (either align with R6 base or implement a US Core-specific scope).
    *   **`Practitioner.communication` Data:** Systems that created R4 `us-core-practitioner` instances containing `Practitioner.communication` data must implement logic to transform this data to the new R6 backbone structure when migrating to or interacting with R6 systems.
    *   Systems should be aware of the R6 interpretation of a missing `Practitioner.active` element (assumed active).

3.  **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`Practitioner.deceased[x]`:** Provides a standard way to indicate if a practitioner is deceased. US Core may consider profiling this for better data consistency.
    *   **Restructured `Practitioner.communication`:** The clearer definition (administrative communication) and ability to flag a `preferred` language might be valuable if US Core wishes to support this aspect of practitioner information.
    *   **`Practitioner.qualification.status`:** Offers more granularity if US Core decides to profile practitioner qualifications in the future.

## Overall Migration Impact
Impact: **Low**

The `us-core-practitioner` profile can largely function on an R6 base Practitioner with minimal changes to its own definition. The primary decision point for the US Core editorial team is how to handle the expanded scope of the base `identifier` search parameter within the US Core context. The breaking change to `Practitioner.communication` in R6 impacts instance data for those who used this optional field in R4, but doesn't force a change in the US Core profile's *current* lack of constraints on it unless the team decides to start profiling it. Adopting new R6 elements like `deceased[x]` would be new work, not a direct migration impact on existing constraints.