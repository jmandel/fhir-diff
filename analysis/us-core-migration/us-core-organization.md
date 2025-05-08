## Impact of R6 Changes on `us-core-organization`

The primary R6 changes to the base `Organization` resource that materially affect `us-core-organization` revolve around the handling of contact information. Other Must Support elements in `us-core-organization` like `identifier`, `active`, and `name` are not significantly impacted by R6 base changes in terms of their core definition or constraints within this profile.

*   **`Organization.telecom` (and its Must Support children: `telecom.system`, `telecom.value`)**
    *   **Relevant R6 Base Change(s):** The top-level `Organization.telecom` element is **removed** in R6. All contact information, including telecommunication details, is consolidated under the `Organization.contact` element. This `contact` element is a list of `ExtendedContactDetail` data types, each of which can contain `telecom` (a list of `ContactPoint`).
    *   **Direct Impact on `us-core-organization`:** `us-core-organization` mandates Must Support for `Organization.telecom` and its children `system` and `value` at the root level. Since `Organization.telecom` no longer exists at the root, these constraints are broken. The profile will need to be updated to apply Must Support to `Organization.contact.telecom` (and its children) within the new structure. This means that if an organization has telecommunication information, it must be provided via `Organization.contact.telecom`. `Organization.contact` itself will likely need to be Must Support.

*   **`Organization.address` (and its Must Support children: `address.line`, `address.city`, `address.state`, `address.postalCode`, `address.country`)**
    *   **Relevant R6 Base Change(s):** The top-level `Organization.address` element is **removed** in R6. Address information is now part of the `Organization.contact` element, specifically within an `ExtendedContactDetail`'s `address` field (type `Address`).
    *   **Direct Impact on `us-core-organization`:** `us-core-organization` mandates Must Support for `Organization.address` and its children at the root level. The binding for `address.state` to `us-core-usps-state` is also defined on this root-level element. Since `Organization.address` no longer exists at the root, these constraints are broken. The profile will need to be updated to apply Must Support to `Organization.contact.address` (and its children). The binding for `state` will need to be re-applied to `Organization.contact.address.state`. This means that if an organization has an address, it must be provided via `Organization.contact.address`. `Organization.contact` itself will likely need to be Must Support.
    *   The R4 base constraints `org-2` and `org-3` (prohibiting 'home' use for root-level address and telecom) are removed. They are replaced by R6 constraints `org-4` and `org-3` which apply the same logic to `Organization.contact.address.use` and `Organization.contact.telecom.use` respectively. US Core does not specify a `use` code, so this change in inherited constraint location has no direct impact on US Core profile definitions but will affect instance validity.

## Migration Summary & Actionable Takeaways for `us-core-organization`

*   **US Core Profile Changes Required:**
    *   Yes, significant re-profiling is necessary.
    *   The `Organization.contact` element (0..* `ExtendedContactDetail`) must be introduced into the profile's differential, likely as Must Support.
    *   All constraints currently on `Organization.telecom` (Must Support on element, `system`, `value`) must be moved to `Organization.contact.telecom`.
    *   All constraints currently on `Organization.address` (Must Support on element, `line`, `city`, `state`, `postalCode`, `country`, and the `us-core-usps-state` binding on `state`) must be moved to `Organization.contact.address`.
    *   Narrative guidance in the US Core IG will need to be updated to reflect the new structure for providing contact information.

*   **Implementation Changes Required:**
    *   **Data Producers:** Instances of `us-core-organization` must be restructured. Data previously in `Organization.telecom` and `Organization.address` must now be placed within items of the `Organization.contact` list. Each R4 telecom or address entry will typically become a separate `ExtendedContactDetail` entry in the `contact` list, populating the `telecom` or `address` field within that `ExtendedContactDetail`.
    *   **Data Consumers:** Systems consuming `us-core-organization` resources must update their parsing logic to find telecom and address information within `Organization.contact.telecom` and `Organization.contact.address` respectively.
    *   **Servers:** FHIR server implementations must update their search logic for address-related parameters (e.g., `address`, `address-city`, `address-postalcode`, `address-state`) as their FHIRPath expressions change from `Organization.address...` to `Organization.contact.address...`.

*   **New R6 Features Relevant to Profile Intent (Optional & Brief):**
    *   `Organization.qualification`: This new backbone element allows for specifying certifications, accreditations, and licenses. This could be a valuable addition for future versions of `us-core-organization` to represent formal qualifications of healthcare organizations.
    *   `Organization.description`: A new `markdown` element for a more detailed description of the organization could enhance human-readable information.

## Overall Migration Impact
Impact: Significant

The base `Organization` resource has undergone a breaking change by removing top-level `telecom` and `address` elements and consolidating them into `Organization.contact` (a list of `ExtendedContactDetail`). Since `us-core-organization` mandates Must Support for `telecom` and `address` and their sub-elements, the profile will require substantial re-profiling to move these constraints to the new paths under `Organization.contact`. This is not a simple renaming or addition but a structural reorganization that will necessitate careful review and updates by the US Core editorial team. Implementers will also face significant data migration and code update tasks.