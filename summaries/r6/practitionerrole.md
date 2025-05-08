Okay, here is the FHIR PractitionerRole R6 resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: PractitionerRole

```yaml
resource:
  name: PractitionerRole
  hl7_workgroup: Patient Administration
  maturity_level: 4
  standard_status: Trial Use
  security_category: Individual
  compartments:
    - Practitioner
```

A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization for a period of time.

## Background and Scope

The PractitionerRole resource describes the types of services that practitioners provide for an organization at specific location(s). It is used in various contexts, including provider registries (indicating what a practitioner can do for an organization) and clinical systems (indicating role, service, and location for healthcare events or as a general reference like a patient's preferred GP).

Key aspects include:
*   **Denormalized Display (`display` element):** A `display` property has been added to represent the intersection of practitioner, organization, and role for easy display in references. Feedback is sought on its utility.
*   **Granularity:** Role, specialty, location, telecom, and HealthcareService properties can be repeated. If details like availability or telecom differ across services or locations, separate PractitionerRole instances are needed. Many implementations might profile PractitionerRole to a single location/role/service.
*   **Contextual Reference:** Use PractitionerRole when the organizational context of a practitioner's participation is important (e.g., Patient.generalPractitioner, Appointment.participant). Otherwise, a direct reference to Practitioner may suffice.
*   **Unnamed Practitioners:** For roles where a specific practitioner isn't pre-allocated (e.g., an unnamed surgeon), a PractitionerRole can be used with an empty `practitioner` property, populating other relevant fields like `code` and `organization`.
*   **Qualifications vs. Role:** Qualifications (from Practitioner resource) don't imply a Role but might be considered when assigning roles.
*   **CareTeam vs. PractitionerRole:** CareTeam is typically finer-grained and often patient-specific or for functional roles (e.g., crisis planning team). PractitionerRole is more general, covering all places a practitioner works and role-specific details (contact numbers, endpoints).
*   **Multiple Periods/Locations:**
    *   If a practitioner performs a role over non-adjacent periods, use distinct PractitionerRole instances for each period.
    *   While multiple locations can be represented in one instance, all details (contact, availability, services) apply to all listed locations. If different values are needed per location, create separate instances. It's common to profile `location` to a single entry.
*   **No Address on PractitionerRole:** The address is on the referenced `Location` resource to avoid duplication.

## Resource Details

The following defines the core elements of the PractitionerRole resource.

```yaml
elements:
  - name: PractitionerRole
    type: DomainResource
    description: A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization for a period of time.
    short: Roles/organizations the practitioner is associated with
    comments: The base resource definition.
  - name: PractitionerRole.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business Identifiers that are specific to a role/location.
    short: Identifiers for a role/location
    comments: A specific identifier value (e.g. Minnesota Registration ID) may appear on multiple PractitionerRole instances which could be for different periods, or different Roles (or other reasons). A specific identifier may be included multiple times in the same PractitionerRole instance with different identifier validity periods.
  - name: PractitionerRole.active
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this practitioner role record is in active use. Some systems may use this property to mark non-active practitioners, such as those that are not currently employed.
    short: Whether this practitioner role record is in active use
    comments: If this value is false, you may refer to the period to see when the role was in active use. If there is no period specified, no inference can be made about when it was active.
  - name: PractitionerRole.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The period during which the person is authorized to act as a practitioner in these role(s) for the organization.
    short: The period during which the practitioner is authorized to perform in these role(s)
    comments: If a practitioner is performing a role within an organization over multiple, non-adjacent periods, there should be a distinct PractitionerRole instance for each period. For example, if a nurse is employed at a hospital, leaves the organization for a period of time due to pandemic related stress, but returns post-pandemic to the same job role, there would be two PractitionerRole instances for the different periods of employment.
  - name: PractitionerRole.practitioner
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner)
    description: Practitioner that is able to provide the defined services for the organization.
    short: Practitioner that provides services for the organization
  - name: PractitionerRole.organization
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization where this role is available.
    short: Organization where the role is available
    comments: "Some relationships (represented as PractitionerRoles) that may exist between practitioners and organizations include:\n\n*   A practitioner may act as a pediatrician when associated with an organization that runs a family clinic. PractitionerRole.organization would represent the family clinic.\n*   The same practitioner may act as a physician when providing physicals for an athletics department at a school. PractitionerRole.organization would represent the school.\n*   A practitioner may perform coumadin / anticoagulation services for a clinic run by a health system. PractitionerRole.organization would represent the coumadin clinic.\n*   A practitioner may act as an inpatient pharmacist reviewing and dispensing medications. PractitionerRole.organization would represent the hospital pharmacy.\n*   A practitioner may perform medication management and adherence services for an internal medicine clinic. PractitionerRole.organization would represent the internal medicine clinic.\n*   A practitioner is part of a payer's network (such as a preferred provider organization (PPO), or health maintenance organizations (HMO)). PractitionerRole.organization would represent the payer's network.\n\nEach of the examples above above, would be represented as different PractitionerRole instances, each with a different values for PractitionerRole.organization."
  - name: PractitionerRole.network
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Organization)
    description: The network in which the PractitionerRole provides the role's services (if defined) at the indicated locations (if defined).
    short: The network in which the PractitionerRole provides the role's services (if defined) at the indicated locations (if defined)
    comments: e.g. Commonly used for Health Insurance provider networks.
  - name: PractitionerRole.code
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Roles which this practitioner is authorized to perform for the organization.
    short: Roles which this practitioner may perform
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/practitioner-role
      strength: example
    comments: A person may have more than one role.
  - name: PractitionerRole.display
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A value that describes the intersection of the practitioner, organization, and the role of the practitioner within the organization. This is not the human name of the practitioner, though the textual representation of that human name may be a part of this property.
    short: Denormalized practitioner name, role, organization and location
    comments: The PractitionerRole display value may be considered a de-normalized value from Practitioner and/or Organization for the purposes of convenient display in both the PractitionerRole resources and reference to it. When a system is consuming a PractitionerRole resource and displaying a name to a user, they may choose to use PractitionerRole.display, or they could use one or both of the names from the referenced Practitioner and/or Organization resources along with the role or other relevant properties in PractitionerRole.
  - name: PractitionerRole.specialty
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The specialty of a practitioner that describes the functional role they are practicing at a given organization or location.
    short: Specific specialty of the practitioner
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-practice-codes
      strength: preferred
    comments: The specialty represents the functional role a practitioner is playing within an organization/location. This role may require the individual have certain qualifications, which would be represented in the Practitioner.qualifications property. Note that qualifications may or might not relate to or be required by the practicing specialty.
  - name: PractitionerRole.location
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Location)
    description: The location(s) at which this practitioner provides care.
    short: Location(s) where the practitioner provides care
  - name: PractitionerRole.healthcareService
    cardinality: 0..*
    type: Reference(HealthcareService)
    description: The list of healthcare services that this worker provides for this role's Organization/Location(s).
    short: Healthcare services provided for this role's Organization/Location(s)
  - name: PractitionerRole.contact
    cardinality: 0..*
    type: ExtendedContactDetail
    description: The contact details of communication devices available relevant to the specific PractitionerRole. This can include addresses, phone numbers, fax numbers, mobile numbers, email addresses and web sites.
    short: Official contact details relating to this PractitionerRole
  - name: PractitionerRole.characteristic
    cardinality: 0..*
    type: CodeableConcept
    description: Collection of characteristics (attributes).
    short: Collection of characteristics (attributes)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/service-mode
      strength: example
    comments: These could be such things as is the service mode used by this role.
  - name: PractitionerRole.communication
    cardinality: 0..*
    type: CodeableConcept
    description: A language the practitioner can use in patient communication. The practitioner may know several languages (listed in practitioner.communication), however these are the languages that could be advertised in a directory for a patient to search.
    short: A language the practitioner (in this role) can use in patient communication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/all-languages
      strength: required
    comments: "The structure aa-BB with this exact casing is one the most widely used notations for locale. However not all systems code this but instead have it as free text. Hence CodeableConcept instead of code as the data type.\n\nNote that for non-patient oriented communication, see Practitioner.communication. Note that all 'person' type resources (Person, RelatedPerson, Patient, Practitioner) have a communication structure that includes preferences. Role or service oriented resources such as HealthcareService and PractitionerRole only include languages that are available for interacting with patients."
  - name: PractitionerRole.availability
    cardinality: 0..1
    type: Availability
    description: A collection of times the practitioner is available or performing this role at the location and/or healthcareservice.
    short: Times the Practitioner is available at this location and/or healthcare service (including exceptions)
    comments: "More detailed availability information may be provided in associated Schedule/Slot resources.\n\nSystems may choose to render availability differently than it is exchanged on the interface. For example, rather than \"Mon, Tue, Wed, Thur, Fri from 9am-12am; Mon, Tue, Wed, Thur, Fri from 1pm-5pm\" as would be implied by two availableTime repetitions, an application could render this information as \"Mon-Fri 9-12am and 1-5pm\".\n\nThe NotAvailableTime(s) included indicate the general days/periods where the practitioner is not available (for things such as vacation time, or public holidays)."
  - name: PractitionerRole.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the practitioner with this role. Commonly used for locating scheduling services, or identifying where to send referrals electronically.
    short: Endpoints for interacting with the practitioner in this role
```

```yaml
constraints: []
```

## Search Parameters

Search parameters defined for the PractitionerRole resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Whether this practitioner role record is in active use
    expression: PractitionerRole.active
  - name: characteristic
    type: token
    description: One of the PractitionerRole's characteristics
    expression: PractitionerRole.characteristic
  - name: communication
    type: token
    description: One of the languages that the practitioner can communicate with
    expression: PractitionerRole.communication
  - name: date
    type: date
    description: The period during which the practitioner is authorized to perform in these role(s)
    expression: PractitionerRole.period
  - name: email
    type: token
    description: A value in an email contact
    expression: PractitionerRole.contact.telecom.where(system='email')
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the practitioner with this role
    expression: PractitionerRole.endpoint
    targets:
      - Endpoint
  - name: identifier
    type: token
    description: A practitioner's Identifier
    expression: PractitionerRole.identifier
  - name: location
    type: reference
    description: One of the locations at which this practitioner provides care
    expression: PractitionerRole.location
    targets:
      - Location
  - name: network
    type: reference
    description: Health insurance provider network in which the PractitionerRole provides the role's services (if defined) at the indicated locations (if defined)
    expression: PractitionerRole.network
    targets:
      - Organization
  - name: organization
    type: reference
    description: The identity of the organization the practitioner represents / acts on behalf of
    expression: PractitionerRole.organization
    targets:
      - Organization
  - name: phone
    type: token
    description: A value in a phone contact
    expression: PractitionerRole.contact.telecom.where(system='phone')
  - name: practitioner
    type: reference
    description: Practitioner that is able to provide the defined services for the organization
    expression: PractitionerRole.practitioner
    targets:
      - Practitioner
  - name: role
    type: token
    description: The practitioner can perform this role at for the organization
    expression: PractitionerRole.code
  - name: service
    type: reference
    description: The list of healthcare services that this worker provides for this role's Organization/Location(s)
    expression: PractitionerRole.healthcareService
    targets:
      - HealthcareService
  - name: specialty
    type: token
    description: The practitioner has this specialty at an organization
    expression: PractitionerRole.specialty
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: PractitionerRole.contact.telecom
```