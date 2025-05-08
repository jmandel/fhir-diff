# FHIR Location Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Location resource between versions R4 and R6, focusing on aspects critical for implementers. It aims to be clear, actionable, dense, and precise to aid in migration and system adaptation.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Location resource from R4 to R6 introduces several substantial changes and enhancements:

1.  **Enhanced Availability Model (Breaking Change):** The R4 `Location.hoursOfOperation` backbone element (with `daysOfWeek`, `allDay`, `openingTime`, `closingTime`) and the separate `Location.availabilityExceptions` string element have been **replaced** in R6 by a single `Location.hoursOfOperation` element of type `Availability`. This standard datatype provides a richer, more structured way to define schedules and exceptions. This is a **Breaking Change** requiring significant data model updates and migration.
2.  **Expanded Scope for Virtual Locations:** R6 formally extends the Location resource to support "virtual places" (e.g., for telehealth). This is primarily enabled by the new `Location.virtualService` element.
3.  **Contact Information Update (Breaking Change):** The R4 `Location.telecom` element (type `ContactPoint`) has been **renamed** to `Location.contact` in R6 and its type changed to `ExtendedContactDetail`, offering a more comprehensive way to capture contact information.
4.  **Element Renaming and Value Set Changes:**
    *   `Location.physicalType` (R4) is renamed to `Location.form` (R6) with an updated value set.
    *   `Location.type` has a **new ValueSet binding** (`http://terminology.hl7.org/ValueSet/service-type` in R6, replacing `v3-ServiceDeliveryLocationRoleType` from R4) and its binding strength increased to `preferred`.
5.  **New Elements for Granularity:**
    *   `Location.characteristic` (`CodeableConcept`) allows for specifying various attributes of the location.
    *   `Location.virtualService` (`VirtualServiceDetail`) for detailing virtual service connection information.
6.  **Data Type Change:** `Location.description` changes from `string` in R4 to `markdown` in R6.
7.  **Increased Maturity:** The resource's maturity level has advanced from 3 (Trial Use, some Grahame review) in R4 to 5 (Normative Candidate / Informative with wide review) in R6, indicating greater stability and wider adoption. *(Correction: The R6 YAML still says maturity_level: 5, standard_status: Trial Use. The example `IceCream` showed maturity directly impacting `standard_status`. The R6 Location source actually states `maturity_level: 5` and `standard_status: Trial Use` - I will report this as written in the R6 source).* The maturity level has advanced from 3 in R4 to 5 in R6, indicating increased stability and review.
8.  **Search Parameter Additions:** New search parameters `mode`, `contains` (for GeoJSON boundaries), and a `characteristic` search parameter (which, importantly, searches `Location.form`) have been added in R6.
9.  **Terminology Server Alignment:** Some ValueSet URIs now point to `terminology.hl7.org`, reflecting a common FHIR practice.

## 2. Overall Resource Scope and Purpose

*   **R4 Focus:** Primarily described "a physical place."
*   **R6 Expansion:** The scope has been explicitly broadened to include "physical or virtual places." The R6 documentation highlights support for "virtual locations for telehealth." This reflects the evolving healthcare landscape.
*   **Maturity:** The `Location` resource has advanced from maturity level 3 in R4 to level 5 in R6, signifying it has undergone substantial review and is considered more stable for implementation. (Note: R6 `standard_status` remains "Trial Use").
*   **Impact:** Systems must now consider support for virtual locations if relevant. The increased maturity level provides greater confidence in the resource's stability.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6:

*   **`Location.characteristic` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/location-characteristic` (example strength)
    *   **Short Description/Purpose:** Allows for specifying a collection of characteristics or attributes of the location (e.g., "wheelchair accessible").
    *   **Key Impact/Action for Implementers:** Provides a structured way to add various attributes. Systems can use this for enhanced filtering or display. Note that the R6 search parameter named `characteristic` searches `Location.form`, not this new element (see Search Parameter section).

*   **`Location.virtualService` (New)**
    *   **Cardinality:** `0..*`
    *   **Type:** `VirtualServiceDetail`
    *   **Short Description/Purpose:** Captures connection details for virtual services associated with the location, such as shared conference call facilities.
    *   **Key Impact/Action for Implementers:** Essential for supporting telehealth use cases. Systems dealing with virtual appointments or services should implement this element.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Location.status` (Binding URI Change)**
    *   **R4 ValueSet:** `http://hl7.org/fhir/ValueSet/location-status|4.0.1`
    *   **R6 ValueSet:** `http://hl7.org/fhir/ValueSet/location-status` (version tag removed)
    *   **Key Impact/Action for Implementers:** Minor change; ensure systems can resolve the unversioned URI. The meaning of the codes likely remains consistent.

*   **`Location.operationalStatus` (Binding URI Change)**
    *   **R4 ValueSet:** `http://hl7.org/fhir/ValueSet/v2-0116`
    *   **R6 ValueSet:** `http://terminology.hl7.org/ValueSet/v2-0116`
    *   **Key Impact/Action for Implementers:** The base domain of the ValueSet URI has changed. Systems should update to the `terminology.hl7.org` URI. Content of the V2 table 0116 is expected to be consistent.

*   **`Location.description` (Type Change)**
    *   **R4 Type:** `string`
    *   **R6 Type:** `markdown`
    *   **Key Impact/Action for Implementers:** Allows for richer formatting in the description. Systems displaying this field should be prepared to render markdown. Data migration from `string` is generally straightforward.

*   **`Location.mode` (Documentation Note on Modifier Status)**
    *   **R4/R6 Type:** `code`
    *   **R4/R6 `isModifier` flag:** Not formally set to `true` in the YAML structure definition.
    *   **R6 Comment:** "This is labeled as a modifier because whether or not the location is a class of locations changes how it can be used and understood."
    *   **Key Impact/Action for Implementers:** While not formally flagged as a modifier element in the R6 structure definition's YAML, the R6 documentation strongly implies that `mode` significantly alters the interpretation of the resource. Implementers should treat changes to `mode` with caution, as if it were a modifier, particularly when deciding if a new version of a Location resource is a simple update or a conceptual change. A new search parameter `mode` is available in R6.

*   **`Location.type` (Binding and Strength Change)**
    *   **R4 Binding:**
        *   `valueSet`: `http://hl7.org/fhir/ValueSet/v3-ServiceDeliveryLocationRoleType`
        *   `strength`: `extensible`
    *   **R6 Binding:**
        *   `valueSet`: `http://terminology.hl7.org/ValueSet/service-type`
        *   `strength`: `preferred`
    *   **Key Impact/Action for Implementers:** This is a **significant change**. The ValueSet has changed entirely, and the binding strength is now `preferred`.
        *   Data migration will require re-mapping existing `type` codes to the new `service-type` ValueSet.
        *   Systems should prioritize codes from the new ValueSet. Queries using the `type` search parameter will be affected.

*   **`Location.telecom` (R4) renamed to `Location.contact` (R6) (Name and Type Change - Breaking Change)**
    *   **R4 Name & Type:** `Location.telecom` (`ContactPoint`, `0..*`)
    *   **R6 Name & Type:** `Location.contact` (`ExtendedContactDetail`, `0..*`)
    *   **Key Impact/Action for Implementers:** This is a **Breaking Change**.
        *   The element name has changed from `telecom` to `contact`.
        *   The data type has changed from `ContactPoint` to the more comprehensive `ExtendedContactDetail`.
        *   Data migration is required. Systems must adapt to the new element name and the richer structure of `ExtendedContactDetail`.

*   **`Location.physicalType` (R4) renamed to `Location.form` (R6) (Name and ValueSet Change)**
    *   **R4 Name & Type:** `Location.physicalType` (`CodeableConcept`, `0..1`)
        *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/location-physical-type` (example strength)
    *   **R6 Name & Type:** `Location.form` (`CodeableConcept`, `0..1`)
        *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/location-form` (example strength)
    *   **Key Impact/Action for Implementers:**
        *   The element name has changed from `physicalType` to `form`.
        *   The associated ValueSet has been updated (`location-form` in R6). The R6 `form` element's description explicitly includes "virtual" as a possible physical form, aligning with the resource's expanded scope.
        *   Review and update mappings to the new ValueSet if necessary. The R6 search parameter named `characteristic` actually searches this `Location.form` element.

*   **`Location.hoursOfOperation` (Type Change from BackboneElement to `Availability` - Breaking Change)**
    *   **R4 Type:** Custom BackboneElement containing `daysOfWeek` (code), `allDay` (boolean), `openingTime` (time), `closingTime` (time). Cardinality `0..*`.
    *   **R6 Type:** `Availability`. Cardinality `0..1`.
    *   **Key Impact/Action for Implementers:** This is a **major Breaking Change**.
        *   The R4 custom structure for hours of operation is replaced by the standard `Availability` data type in R6. The `Availability` type offers a more robust and standardized way to represent schedules, including exceptions, which were previously handled by `Location.availabilityExceptions` in R4.
        *   Data migration will be complex, requiring transformation from the R4 structure and `availabilityExceptions` string into the R6 `Availability` structure.
        *   Systems must implement support for the `Availability` data type.
        *   Note the cardinality change from `0..*` (for the R4 backbone repeating structure) to `0..1` (for the single `Availability` instance in R6, which internally handles recurrences and exceptions).

### 3.3. Removed Elements from R4

*   **`Location.hoursOfOperation.daysOfWeek` (Removed)**
*   **`Location.hoursOfOperation.allDay` (Removed)**
*   **`Location.hoursOfOperation.openingTime` (Removed)**
*   **`Location.hoursOfOperation.closingTime` (Removed)**
    *   **Rationale/Key Impact:** These R4 sub-elements of the custom `hoursOfOperation` backbone are removed because `Location.hoursOfOperation` in R6 is now of type `Availability`, which has its own internal structure for representing this information.
    *   **Action:** Data from these R4 fields must be migrated into the new R6 `Availability` structure for `Location.hoursOfOperation`.

*   **`Location.availabilityExceptions` (Removed)**
    *   **R4 Type:** `string`, `0..1`
    *   **Rationale/Key Impact:** This element is superseded by the capabilities within the R6 `Availability` data type used for `Location.hoursOfOperation`, which can handle exceptions to standard operating hours in a structured way.
    *   **Action:** Data from this R4 string field needs to be parsed and migrated into the `notAvailable` or other relevant fields within the R6 `Availability` structure.

## 4. Constraint Changes

*   **R4/R6 `Location.status`:** This element remains an `isModifier` element (`?!` flag). Its value directly impacts the validity and usability of the Location resource instance.
*   **R6 `Location.mode` Documentation:** As noted earlier, R6 documentation suggests `mode` has modifier-like implications on resource interpretation, even though it's not formally flagged as `isModifier` in the YAML structure. Implementers should be mindful of this.
*   **No explicit `constraints` block:** Neither R4 nor R6 provided markdown lists specific invariant constraints (e.g., `loc-1: If X then Y must be present`).

## 5. Search Parameter Changes

*   **New Search Parameters in R6:**
    *   **`characteristic`**
        *   **Type:** `token`
        *   **Expression:** `Location.form`
        *   **Key Impact/Action:** Allows searching for locations based on their physical form (e.g., building, room, virtual) using codes from the `Location.form` element's value set.
        *   **Important Note:** This search parameter is named `characteristic` but its expression points to `Location.form`. The newly added R6 element `Location.characteristic` does **not** have a dedicated search parameter listed in the provided R6 specification excerpt. This is a potential point of confusion.
    *   **`contains`**
        *   **Type:** `special`
        *   **Expression:** `Location.extension('http://hl7.org/fhir/StructureDefinition/location-boundary-geojson').value`
        *   **Key Impact/Action:** Enables geospatial searches to find locations that geographically contain a specified set of coordinates, assuming the `location-boundary-geojson` extension is used to define location boundaries. This is a powerful new search capability.
    *   **`mode`**
        *   **Type:** `token`
        *   **Expression:** `Location.mode`
        *   **Key Impact/Action:** Allows filtering locations based on whether they are an `instance` or a `kind`. R4 did not have a search parameter for `mode`.

*   **Modified Search Parameters:**
    *   **`type`**
        *   **R4/R6 Expression:** `Location.type`
        *   **Key Impact/Action:** While the search parameter name and expression remain, the underlying `Location.type` element has a **completely new ValueSet binding and a strengthened binding (`preferred`) in R6**. This means the valid token codes for searching on `type` will be different in R6 compared to R4. Queries using this parameter must be updated to use codes from the R6 `http://terminology.hl7.org/ValueSet/service-type` ValueSet.
    *   **`address`**
        *   **R6 Description:** "A server defined search that may match any of the string fields in the Address..." (slightly more explicit than R4).
        *   **Key Impact/Action:** Core functionality likely remains similar.
    *   **`near`**
        *   **R4/R6 Expression:** `Location.position`
        *   **Key Impact/Action:** The `near` search parameter for proximity searches remains. The R4 documentation had a note about `near-distance` being a carryover from STU3, which is cleaner in R6. Functionality is fundamentally the same.

*   **Unchanged Search Parameters (Name and Expression):**
    The following search parameters appear to have consistent names and expressions between R4 and R6, though implementers should always verify server support:
    *   `address-city` (`Location.address.city`)
    *   `address-country` (`Location.address.country`)
    *   `address-postalcode` (`Location.address.postalCode`)
    *   `address-state` (`Location.address.state`)
    *   `address-use` (`Location.address.use`)
    *   `endpoint` (`Location.endpoint`)
    *   `identifier` (`Location.identifier`)
    *   `name` (`Location.name | Location.alias`)
    *   `operational-status` (`Location.operationalStatus`)
    *   `organization` (`Location.managingOrganization`)
    *   `partof` (`Location.partOf`)
    *   `status` (`Location.status`)

## 6. Key Migration Actions & Considerations

1.  **Address `hoursOfOperation` Change (Critical - Breaking):**
    *   This is the most complex migration task. Convert R4's custom `hoursOfOperation` structure and the `availabilityExceptions` string into R6's `Location.hoursOfOperation` (type `Availability`).
    *   Develop logic to map R4 `daysOfWeek`, `allDay`, `openingTime`, `closingTime` to the `Availability.availableTime` and `Availability.notAvailable` structures.
    *   Parse R4 `availabilityExceptions` strings and represent them within `Availability.notAvailable`.
2.  **Handle `telecom` to `contact` Renaming and Type Change (Critical - Breaking):**
    *   Update code to use the new element name `contact`.
    *   Migrate data from R4 `ContactPoint` to R6 `ExtendedContactDetail`. This may involve mapping fields and potentially enriching data if `ExtendedContactDetail` allows for more information.
3.  **Update `Location.type` Mappings (Critical):**
    *   Remap existing `Location.type` CodeableConcepts from the R4 `v3-ServiceDeliveryLocationRoleType` ValueSet to the R6 `service-type` ValueSet.
    *   Adjust systems to reflect the `preferred` binding strength for `Location.type`.
4.  **Adopt New R6 Elements:**
    *   Evaluate and implement support for `Location.characteristic` to store additional attributes.
    *   Implement `Location.virtualService` if your system handles telehealth or virtual locations.
5.  **Handle Element Renaming (`physicalType` to `form`):**
    *   Update code to use the new element name `form`.
    *   Review and potentially update ValueSet mappings from R4 `location-physical-type` to R6 `location-form`.
6.  **Adapt to Markdown for `description`:** Ensure systems can correctly render or process markdown content in `Location.description`.
7.  **Update Terminology URIs:** Change ValueSet URIs for `operationalStatus` (and `status`, `mode` if versioned URIs were used) to reflect current FHIR best practices (e.g., `terminology.hl7.org` or unversioned `hl7.org/fhir` URIs).
8.  **Revise API Queries:**
    *   Update queries using the `type` search parameter to use codes from the new R6 ValueSet.
    *   Utilize the new search parameters: `mode`, `contains` (if using GeoJSON), and `characteristic` (remembering it searches `Location.form`).
9.  **Consider Scope Expansion:** Assess how the formal inclusion of "virtual locations" impacts your system's use and interpretation of the Location resource.
10. **Be Aware of `mode`'s Implied Modifier Status:** Treat `Location.mode` with care, understanding its significant impact on resource interpretation as highlighted in R6 comments.
11. **Clarify `characteristic` Search Parameter:** Understand that the R6 search parameter named `characteristic` targets `Location.form`. If searching the new `Location.characteristic` element is needed, custom search parameters might be required or future FHIR versions might address this.