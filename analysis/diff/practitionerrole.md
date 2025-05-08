# FHIR PractitionerRole Resource: R4 to R6 Migration Guide

This document outlines the significant changes to the FHIR PractitionerRole resource between R4 and R6. It is intended for implementers who are migrating systems from R4 to R6 or need to support both versions. The guide focuses on actionable information and key differences that impact implementation.

## 1. Executive Summary: Key Impacts for Implementers

Migrating PractitionerRole from R4 to R6 introduces several substantial changes, primarily impacting how contact information and availability are handled. Implementers should be aware of the following:

1.  **Contact Information Redesign (Breaking Change):** The R4 `telecom` element (type `ContactPoint`) has been replaced in R6 by the `contact` element (type `ExtendedContactDetail`). This requires data model updates and migration to accommodate the richer, more structured `ExtendedContactDetail` type. Search parameters related to contact information have also been updated.
2.  **Availability Model Overhaul (Breaking Change):** The R4 elements `availableTime` (BackboneElement), `notAvailable` (BackboneElement), and `availabilityExceptions` (string) have been consolidated into a single R6 element: `availability` (type `Availability`). This is a significant structural change requiring substantial data migration and logic updates.
3.  **New Elements for Enhanced Functionality:** R6 introduces several new elements:
    *   `display`: A string for a denormalized representation of the practitioner, role, and organization.
    *   `network`: To reference `Organization` resources representing provider networks.
    *   `characteristic`: A `CodeableConcept` for role-specific attributes (e.g., service mode).
    *   `communication`: A `CodeableConcept` to specify languages the practitioner uses in this role for patient communication.
4.  **`active` Element Interpretation:** R6 guidance clarifies that if `active` is missing, no assumption about the role's active status should be made without consulting the `period` element. This differs from R4's suggestion that a missing `active` generally implies an active state.
5.  **Search Parameter Updates:** New search parameters (`characteristic`, `communication`, `network`) have been added. Expressions for existing search parameters (`email`, `phone`, `telecom`) have been modified due to the `telecom` to `contact` element change.
6.  **Increased Maturity Level:** The resource's maturity level has increased from 2 in R4 to 4 in R6, indicating greater stability and community consensus, though both versions are listed as "Trial Use" in the provided documentation.

Implementers must carefully plan for data migration, especially for contact and availability information, and update their systems to support the new and modified elements and search parameters.

## 2. Overall Resource Scope and Purpose Evolution

The core purpose of PractitionerRole remains consistent between R4 and R6: "A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization for a period of time."

However, R6 introduces some refinements and additional guidance in its "Background and Scope" section:

*   **`display` Element:** R6 highlights the new `PractitionerRole.display` element, intended to provide a denormalized string representing the practitioner, organization, and role for convenient display in references.
*   **Unnamed Practitioners:** R6 explicitly mentions that PractitionerRole can be used for roles where a specific practitioner isn't pre-allocated (e.g., an "on-call surgeon" role) by leaving the `practitioner` reference empty and populating other relevant fields like `code` and `organization`.
*   **Granularity Clarification:** R6 reiterates that if details like availability or telecom differ across services or locations for the same practitioner/organization, separate PractitionerRole instances are generally needed. It also notes that the new `contact` details apply to all listed locations/services if multiple are present in a single PractitionerRole instance.

While the fundamental use cases are unchanged, R6 offers more detailed guidance and introduces the `display` element to simplify common integration patterns.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following elements have been added in R6, offering new capabilities:

*   **`PractitionerRole.display`**
    *   **Cardinality:** `0..1`
    *   **Type:** `string`
    *   **Short Description:** Denormalized practitioner name, role, organization, and location.
    *   **Purpose/Impact:** Provides a convenient, pre-formatted string for displaying the essence of the PractitionerRole, potentially simplifying UI development when referencing these roles. Systems can populate and/or consume this for display purposes.

*   **`PractitionerRole.network`**
    *   **Cardinality:** `0..*`
    *   **Type:** `Reference(Organization)`
    *   **Short Description:** The network in which the PractitionerRole provides services.
    *   **Purpose/Impact:** Allows explicit linking to provider networks (e.g., health insurance networks). This is a significant addition for use cases involving payer contracts and network directories. A new search parameter `network` supports querying on this element.

*   **`PractitionerRole.characteristic`**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/service-mode` (Example strength)
    *   **Short Description:** Collection of characteristics (attributes).
    *   **Purpose/Impact:** Enables the specification of various attributes of the role, such as the service mode. Implementers can use this to capture additional non-core properties of the role. A new search parameter `characteristic` is available.

*   **`PractitionerRole.communication`**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/all-languages` (Required strength)
    *   **Short Description:** A language the practitioner (in this role) can use in patient communication.
    *   **Purpose/Impact:** Distinct from `Practitioner.communication`, this element specifies languages relevant to this particular role, useful for patient-facing directories and scheduling. The 'required' binding strength for languages indicates a strong recommendation to use codes from the specified value set. A new search parameter `communication` supports querying.

### 3.2. Modified Elements (R4 to R6)

Several key elements have undergone significant modifications, including breaking changes.

#### 3.2.1. Contact Information: `telecom` to `contact` (Breaking Change)

*   **R4 Element:** `PractitionerRole.telecom`
    *   **Type:** `ContactPoint`
    *   **Cardinality:** `0..*`
    *   **Short Description:** Contact details that are specific to the role/location/service.
*   **R6 Element:** `PractitionerRole.contact`
    *   **Type:** `ExtendedContactDetail`
    *   **Cardinality:** `0..*`
    *   **Short Description:** Official contact details relating to this PractitionerRole.
*   **Rationale / Key Impact:** This is a **Breaking Change**. The `ContactPoint` type used in R4 has been replaced by the more comprehensive `ExtendedContactDetail` data type in R6. `ExtendedContactDetail` offers richer structured fields for addresses, human names associated with the contact, multiple telecom details within one contact, periods of use, and more.
    *   **Action:** Data migration is required. Systems must transform data from `ContactPoint` to `ExtendedContactDetail`. Logic for processing and displaying contact information will need to be updated. Search parameter expressions for `email`, `phone`, and `telecom` have changed to reflect this (e.g., `PractitionerRole.telecom` becomes `PractitionerRole.contact.telecom`).

#### 3.2.2. Availability Model: Consolidation into `availability` (Breaking Change)

*   **R4 Elements:**
    *   `PractitionerRole.availableTime`: `0..*`, BackboneElement (with `daysOfWeek`, `allDay`, `availableStartTime`, `availableEndTime`)
    *   `PractitionerRole.notAvailable`: `0..*`, BackboneElement (with `description`, `during`)
    *   `PractitionerRole.availabilityExceptions`: `0..1`, `string`
*   **R6 Element:** `PractitionerRole.availability`
    *   **Type:** `Availability`
    *   **Cardinality:** `0..1`
    *   **Short Description:** Times the Practitioner is available at this location and/or healthcare service (including exceptions).
*   **Rationale / Key Impact:** This is a **Breaking Change** and a major structural redesign. The R4 approach of using separate, custom backbone elements (`availableTime`, `notAvailable`) and a simple string for exceptions (`availabilityExceptions`) has been replaced by a single element `availability` of the standardized `Availability` data type. The `Availability` data type provides a structured way to express both usual availability (via `availableTime` slots) and exceptions/unavailability (via `notAvailableTime` slots) within a unified model.
    *   **Action:** Significant data migration is required. Data from the three R4 availability-related elements must be mapped into the new `Availability` structure. System logic for managing, querying, and displaying availability will need a complete overhaul to work with the `Availability` data type. This change aims for better standardization and interoperability of availability information.

#### 3.2.3. `active` Element: Clarification on Interpretation

*   **Element:** `PractitionerRole.active` (Type: `boolean`, Cardinality: `0..1`)
*   **R4 Comment:** "R4: Default Value "true" removed from STU3. Meaning if Missing: This resource is generally assumed to be active if no value is provided for the active element."
*   **R6 Comment:** "If this value is false, you may refer to the period to see when the role was in active use. If there is no period specified, no inference can be made about when it was active."
*   **Key Impact/Action:** The guidance for interpreting a missing `active` value has shifted. R4 suggested an assumption of "active." R6 explicitly states that if `active` is missing, no inference about current activity can be made solely from its absence; the `period` element should be consulted.
    *   **Action:** Implementers should review their logic for handling PractitionerRole resources where `active` is not present. Systems previously assuming "active by default" based on R4 guidance may need to adjust to align with the R6 interpretation, potentially looking at `PractitionerRole.period` to determine active status. This could be a subtle but impactful change in behavior.

### 3.3. Removed Elements from R4 (Superseded)

The following R4 elements have been effectively removed, as their functionality is now incorporated into the new `PractitionerRole.availability` element in R6:

*   **`PractitionerRole.availableTime`** (and its sub-elements: `daysOfWeek`, `allDay`, `availableStartTime`, `availableEndTime`)
    *   **Rationale:** Superseded by the `PractitionerRole.availability` element (type `Availability`).
    *   **Action:** Data must be migrated to the `Availability.availableTime` structure within the R6 `availability` element.

*   **`PractitionerRole.notAvailable`** (and its sub-elements: `description`, `during`)
    *   **Rationale:** Superseded by the `PractitionerRole.availability` element (type `Availability`).
    *   **Action:** Data must be migrated to the `Availability.notAvailableTime` structure within the R6 `availability` element.

*   **`PractitionerRole.availabilityExceptions`**
    *   **Rationale:** Superseded by the `PractitionerRole.availability` element (type `Availability`), which can handle exceptions within its structure.
    *   **Action:** Data from this string field needs to be evaluated and potentially mapped into structured components of the R6 `availability` element if applicable, or handled as textual notes within it.

## 4. Constraint Changes

*   **R4:** No formal constraints were listed in the provided R4 documentation snippet.
*   **R6:** The R6 documentation explicitly states `constraints: []`.
*   **Impact:** Based on the provided documents, there are no new or removed formal constraints (invariants) on the PractitionerRole resource itself between R4 and R6.

## 5. Search Parameter Changes

### 5.1. New Search Parameters in R6

R6 introduces the following search parameters, corresponding to new elements:

*   **`characteristic`**
    *   **Type:** `token`
    *   **Expression:** `PractitionerRole.characteristic`
    *   **Impact:** Allows searching for PractitionerRoles based on their characteristics.

*   **`communication`**
    *   **Type:** `token`
    *   **Expression:** `PractitionerRole.communication`
    *   **Impact:** Enables querying for PractitionerRoles by the languages they support for patient communication in that role.

*   **`network`**
    *   **Type:** `reference`
    *   **Expression:** `PractitionerRole.network`
    *   **Targets:** `Organization`
    *   **Impact:** Allows searching for PractitionerRoles based on the networks they are part of.

### 5.2. Modified Search Parameters

The expressions for several existing search parameters have changed due to the `telecom` to `contact` element modification:

*   **`email`**
    *   **R4 Expression:** `PractitionerRole.telecom.where(system='email')`
    *   **R6 Expression:** `PractitionerRole.contact.telecom.where(system='email')`
    *   **Impact:** Queries using the `email` search parameter must be updated to reflect the new path via the `contact` element.

*   **`phone`**
    *   **R4 Expression:** `PractitionerRole.telecom.where(system='phone')`
    *   **R6 Expression:** `PractitionerRole.contact.telecom.where(system='phone')`
    *   **Impact:** Queries using the `phone` search parameter must be updated.

*   **`telecom`**
    *   **R4 Expression:** `PractitionerRole.telecom`
    *   **R6 Expression:** `PractitionerRole.contact.telecom`
    *   **Impact:** Queries using the general `telecom` search parameter (which searches any telecom value) must be updated.

### 5.3. Unchanged Search Parameters

The following search parameters remain largely unchanged in their definition and purpose, though R6 documentation sometimes lists targets more explicitly:
*   `active`
*   `date`
*   `endpoint`
*   `identifier`
*   `location`
*   `organization`
*   `practitioner`
*   `role`
*   `service`
*   `specialty`

## 6. Key Migration Actions & Considerations

Implementers migrating from R4 to R6 or supporting both versions of PractitionerRole should consider the following actions:

1.  **Availability Data Migration (Critical & Complex):**
    *   Map data from R4 `availableTime`, `notAvailable`, and `availabilityExceptions` into the new R6 `PractitionerRole.availability` element (type `Availability`). This is a significant structural transformation.
    *   Update all system logic related to creating, reading, updating, querying, and displaying practitioner availability.

2.  **Contact Information Migration (Critical):**
    *   Transform data from R4 `PractitionerRole.telecom` (list of `ContactPoint`) to R6 `PractitionerRole.contact` (list of `ExtendedContactDetail`).
    *   Update system logic to handle the richer `ExtendedContactDetail` structure.

3.  **Adopt New R6 Elements:**
    *   Evaluate and implement support for `PractitionerRole.display` if denormalized display strings are beneficial.
    *   Incorporate `PractitionerRole.network` if tracking provider network affiliations is relevant.
    *   Utilize `PractitionerRole.characteristic` for additional role-specific attributes.
    *   Leverage `PractitionerRole.communication` for role-specific language capabilities.

4.  **Review `active` Element Logic:**
    *   Adjust system interpretation of a missing `PractitionerRole.active` flag. Do not assume "active" by default; consult the `PractitionerRole.period` as per R6 guidance.

5.  **Update API Queries and Search Functionality:**
    *   Modify search queries for `email`, `phone`, and `telecom` to use the new `PractitionerRole.contact.telecom` path.
    *   Implement support for new search parameters: `characteristic`, `communication`, and `network`.

6.  **Acknowledge Maturity Increase:** Note the resource maturity has increased from 2 to 4, suggesting enhanced stability (though "Trial Use" status is maintained in provided docs). This might influence decisions about adopting R6.

7.  **Staff Training and Documentation:** Update internal documentation and train relevant staff on the new structure and capabilities of the PractitionerRole resource in R6.

Thorough testing is crucial after implementing these changes to ensure data integrity and correct system behavior.