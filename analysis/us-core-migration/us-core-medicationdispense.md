## Impact of R6 Changes on `us-core-medicationdispense`

This section analyzes R6 base `MedicationDispense` changes that directly affect core elements, constraints, and patterns defined or relied on by `us-core-medicationdispense`.

*   **`MedicationDispense.medication[x]` (Must Support)**
    *   **US Core R4 Definition:** A choice of `medicationCodeableConcept` or `medicationReference` (to `us-core-medication`). Must Support. Binding on `medicationCodeableConcept` to <http://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1010.4>.
    *   **Relevant R6 Base Change:** The R4 choice type `medication[x]` has been consolidated into a single R6 element `medication` of type `CodeableReference(Medication)`. This is a breaking change in the base resource.
    *   **Direct Impact on `us-core-medicationdispense`:** The profile must be updated to use `MedicationDispense.medication` of type `CodeableReference(Medication)`. The existing US Core constraints can be reapplied: the `concept` portion of `CodeableReference` will carry the terminology binding, and the `reference` portion will target `us-core-medication`. The Must Support status will apply to the new `medication` element. Implementers will need to adapt to sending/receiving a `CodeableReference` instead of a direct choice.

*   **`MedicationDispense.subject` (Must Support, Mandatory)**
    *   **US Core R4 Definition:** Cardinality `1..1`, type `Reference(us-core-patient | Group)`. Must Support.
    *   **Relevant R6 Base Change:** The base `MedicationDispense.subject` element's cardinality changed from `0..1` in R4 to `1..1` in R6.
    *   **Direct Impact on `us-core-medicationdispense`:** This R6 base change aligns with the existing `us-core-medicationdispense` profile, which already mandates `subject`. No change is required in the US Core profile constraint for `subject` itself due to this base change, as the profile is already stricter or equal.

*   **`MedicationDispense.context` (Must Support)**
    *   **US Core R4 Definition:** `Reference(us-core-encounter | EpisodeOfCare)`. Must Support.
    *   **Relevant R6 Base Change:** The R4 `context` element has been renamed to `encounter` in R6, and its type restricted to `Reference(Encounter)`. The ability to reference `EpisodeOfCare` directly in this element has been removed from the base resource. This is a breaking change.
    *   **Direct Impact on `us-core-medicationdispense`:** The profile must be updated to use `MedicationDispense.encounter` and can only target `us-core-encounter`. The previous option to reference `EpisodeOfCare` directly via this path is no longer supported by the base R6 resource. If linking to `EpisodeOfCare` remains a requirement for US Core, an alternative mechanism (e.g., via `Encounter.episodeOfCare` or `MedicationDispense.supportingInformation`) would need to be considered and profiled.

*   **`MedicationDispense.performer.actor` (Must Support)**
    *   **US Core R4 Definition:** References various US Core actor profiles (Practitioner, Organization, etc.).
    *   **Relevant R6 Base Change:** The `performer.actor` element in R6 base `MedicationDispense` has expanded its allowable reference types to include `CareTeam` and `Group`.
    *   **Direct Impact on `us-core-medicationdispense`:** The `us-core-medicationdispense` profile currently restricts `performer.actor` to a specific list of US Core profiles. This R6 change offers the *option* for US Core to expand its list of permissible target profiles for `performer.actor` if `CareTeam` or `Group` are deemed relevant. If US Core chooses not to include these, its current, more restrictive constraint remains valid. No breaking impact, but an opportunity for review.

*   **Constraint `us-core-20`**: (`status='completed' implies whenHandedOver.exists()`)
    *   **US Core R4 Definition:** An invariant on `MedicationDispense`.
    *   **Relevant R6 Base Change:** The elements `status` and `whenHandedOver` persist in R6 with compatible meanings for this constraint.
    *   **Direct Impact on `us-core-medicationdispense`:** The constraint remains valid and implementable in R6.

Elements like `status`, `authorizingPrescription`, `type`, `quantity`, `whenHandedOver`, and the `dosageInstruction` structure (including `text`, `timing`, `route`, `doseAndRate.dose[x]`) as profiled by US Core do not face significant direct structural or binding impacts from R6 base changes that would necessitate altering their current US Core definitions, beyond being part of an R6-compliant resource.

## Migration Summary & Actionable Takeaways for `us-core-medicationdispense`

*   **US Core Profile Changes Required:** Yes.
    1.  **`MedicationDispense.medication[x]` -> `MedicationDispense.medication`**:
        *   Update the profile to reflect the change from a choice type (`medicationCodeableConcept` | `medicationReference`) to the single element `medication` of type `CodeableReference(Medication)`.
        *   The existing Must Support flag will apply to `MedicationDispense.medication`.
        *   The `concept` part of the `CodeableReference` should be constrained by the existing binding to ValueSet `2.16.840.1.113762.1.4.1010.4` (Medication Clinical Drug).
        *   The `reference` part of the `CodeableReference` should continue to target `us-core-medication`.
    2.  **`MedicationDispense.context` -> `MedicationDispense.encounter`**:
        *   Rename the element path from `MedicationDispense.context` to `MedicationDispense.encounter`.
        *   Update the target profile to be only `us-core-encounter`. Remove `EpisodeOfCare` as a direct target type for this element.
        *   The editorial team should discuss if the linkage to `EpisodeOfCare` previously supported via `context` needs an alternative pathway in US Core (e.g., guidance on using `Encounter.episodeOfCare` or `MedicationDispense.supportingInformation`).
        *   The existing Must Support flag will apply to `MedicationDispense.encounter`.
    3.  **Review `performer.actor` target types**: Decide if US Core should expand its allowed target profiles for `MedicationDispense.performer.actor` to include `CareTeam` or `Group` as now allowed by the R6 base resource, or maintain its current, more restrictive list.

*   **Implementation Changes Required:** Yes.
    1.  **Adapt to `medication` (CodeableReference):** Implementers must update their systems to create and parse `MedicationDispense.medication` as a `CodeableReference`. Data previously in `medicationCodeableConcept` will map to `medication.concept`, and data in `medicationReference` will map to `medication.reference`.
    2.  **Adapt to `encounter` element:** Implementers must use the `MedicationDispense.encounter` path instead of `context`. If `EpisodeOfCare` was previously referenced, await US Core guidance on how this should be handled in R6-compliant `us-core-medicationdispense` instances.
    3.  Search queries targeting `medication` or `code` will need to be updated to reflect the `CodeableReference` structure (e.g., `medication.reference` or `medication.concept`). Queries for `context` must be changed to `encounter`.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   **`fillNumber` (positiveInt):** This new R6 element allows for explicitly recording the fill number of a prescription (e.g., "3rd fill"). This is highly relevant to US pharmacy practices and could be a valuable addition to `us-core-medicationdispense`.
    *   **`renderedDosageInstruction` (markdown):** Provides a way to include a full textual representation of dosage instructions, which could be beneficial for complex regimens alongside the structured `dosageInstruction`.

## Overall Migration Impact
Impact: **Low**

The R6 migration for `us-core-medicationdispense` will require specific updates to the profile due to breaking changes in the base `MedicationDispense` resource, primarily concerning `medication[x]` becoming `medication` (CodeableReference) and `context` being renamed to `encounter` with a narrowed type. However, these changes, while requiring re-profiling and implementer adaptation, are evolutions within existing FHIR patterns (`CodeableReference`) or straightforward renames with type adjustments. The path to update the profile is clear. The most significant "new decision" might be how to handle the `EpisodeOfCare` linkage if it was a critical use of the former `context` element. The core intent and majority of the profile's existing constraints remain applicable.