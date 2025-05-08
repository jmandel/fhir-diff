---

# FHIR Resource: PractitionerRole (R4)

```yaml
resource:
  name: PractitionerRole
  hl7_workgroup: Patient Administration
  maturity_level: 2
  standard_status: Trial Use
  security_category: Individual
  compartments:
    - Practitioner
```

A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization for a period of time.

## Background and Scope

The PractitionerRole resource defines the roles, specialties, locations, and services a practitioner can provide within an organization, including the period of authorization. It's distinct from `Practitioner.qualification` which lists credentials, and `CareTeam` which is often patient-specific or for finer-grained functional roles.

Key aspects include:

*   **Scope:** Covers the relationship between a practitioner and an organization concerning specific roles, services offered, locations of service, and availability.
*   **Granularity:** If details like contact information, availability, or services differ across locations or specialties for the same practitioner within an organization, separate PractitionerRole instances should be created. It's common to profile `PractitionerRole.location` to a single location to simplify this.
*   **Multiple Roles/Locations:** A practitioner may have multiple roles within the same or different organizations. Each distinct role or period of service typically warrants a separate PractitionerRole resource.
*   **Active Status:** The `active` flag indicates if the role is currently in use. The `period` element can specify when the role was active.
*   **No Address:** Address details are part of the referenced `Location` resource, not directly on PractitionerRole, to avoid duplication.

PractitionerRole is essential for directories, scheduling, and referral management, enabling systems to identify practitioners qualified for specific services at particular locations and times.

## Resource Details

The following defines the core elements of the PractitionerRole resource.

```yaml
elements:
  - name: PractitionerRole
    description: A specific set of Roles/Locations/specialties/services that a practitioner may perform at an organization for a period of time.
    short: Roles/organizations the practitioner is associated with
    type: DomainResource
    comments: The base resource definition.

  - name: PractitionerRole.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business Identifiers that are specific to a role/location.
    short: Identifiers for a role/location
    comments: |
      A specific identifier value (e.g. Minnesota Registration ID) may appear on multiple PractitionerRole instances which could be for different periods, or different Roles (or other reasons). A specific identifier may be included multiple times in the same PractitionerRole instance with different identifier validity periods.

  - name: PractitionerRole.active
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this practitioner role record is in active use. Some systems may use this property to mark non-active practitioners, such as those that are not currently employed.
    short: Whether this practitioner role record is in active use
    comments: |
      If this value is false, you may refer to the period to see when the role was in active use. If there is no period specified, no inference can be made about when it was active.
      R4: Default Value "true" removed from STU3. Meaning if Missing: This resource is generally assumed to be active if no value is provided for the active element.

  - name: PractitionerRole.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The period during which the person is authorized to act as a practitioner in these role(s) for the organization.
    short: The period during which the practitioner is authorized to perform in these role(s)
    comments: |
      If a practitioner is performing a role within an organization over multiple, non-adjacent periods, there should be a distinct PractitionerRole instance for each period. For example, if a nurse is employed at a hospital, leaves the organization for a period of time due to pandemic related stress, but returns post-pandemic to the same job role, there would be two PractitionerRole instances for the different periods of employment.

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
    comments: |
      Some relationships (represented as PractitionerRoles) that may exist between practitioners and organizations include:
      - A practitioner may act as a pediatrician when associated with an organization that runs a family clinic. PractitionerRole.organization would represent the family clinic.
      - The same practitioner may act as a physician when providing physicals for an athletics department at a school. PractitionerRole.organization would represent the school.
      - A practitioner may perform coumadin / anticoagulation services for a clinic run by a health system. PractitionerRole.organization would represent the coumadin clinic.
      - A practitioner may act as an inpatient pharmacist reviewing and dispensing medications. PractitionerRole.organization would represent the hospital pharmacy.
      - A practitioner may perform medication management and adherence services for an internal medicine clinic. PractitionerRole.organization would represent the internal medicine clinic.
      - A practitioner is part of a payer's network (such as a preferred provider organization (PPO), or health maintenance organizations (HMO)). PractitionerRole.organization would represent the payer's network.
      Each of the examples above, would be represented as different PractitionerRole instances, each with a different values for PractitionerRole.organization.

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

  - name: PractitionerRole.specialty
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The specialty of a practitioner that describes the functional role they are practicing at a given organization or location.
    short: Specific specialty of the practitioner
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-practice-codes
      strength: preferred
    comments: |
      The specialty represents the functional role a practitioner is playing within an organization/location. This role may require the individual have certain qualifications, which would be represented in the Practitioner.qualifications property. Note that qualifications may or might not relate to or be required by the practicing specialty.

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

  - name: PractitionerRole.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: Contact details that are specific to the role/location/service.
    short: Contact details that are specific to the role/location/service

  - name: PractitionerRole.availableTime
    cardinality: 0..*
    type: BackboneElement
    description: A collection of times the practitioner is available or performing this role at the location and/or healthcareservice.
    short: Times the Service Site is available
    comments: |
      More detailed availability information may be provided in associated Schedule/Slot resources.
      Systems may choose to render availability differently than it is exchanged on the interface. For example, rather than "Mon, Tue, Wed, Thur, Fri from 9am-12am; Mon, Tue, Wed, Thur, Fri from 1pm-5pm" as would be implied by two availableTime repetitions, an application could render this information as "Mon-Fri 9-12am and 1-5pm".

  - name: PractitionerRole.availableTime.daysOfWeek
    cardinality: 0..*
    type: code
    description: Indicates which days of the week are available between the start and end Times.
    short: mon | tue | wed | thu | fri | sat | sun
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/days-of-week|4.0.1
      strength: required

  - name: PractitionerRole.availableTime.allDay
    cardinality: 0..1
    type: boolean
    description: Is this always available? (hence times are irrelevant) e.g. 24 hour service.
    short: Always available? e.g. 24 hour service

  - name: PractitionerRole.availableTime.availableStartTime
    cardinality: 0..1
    type: time
    description: The opening time of day. Note If the AllDay flag is set, then this time is ignored.
    short: Opening time of day (ignored if allDay = true)

  - name: PractitionerRole.availableTime.availableEndTime
    cardinality: 0..1
    type: time
    description: The closing time of day. Note If the AllDay flag is set, then this time is ignored.
    short: Closing time of day (ignored if allDay = true)

  - name: PractitionerRole.notAvailable
    cardinality: 0..*
    type: BackboneElement
    description: The practitioner is not available or performing this role during this period of time due to the provided reason.
    short: Not available during this time due to provided reason
    comments: |
      The NotAvailableTime(s) included indicate the general days/periods where the practitioner is not available (for things such as vacation time, or public holidays).

  - name: PractitionerRole.notAvailable.description
    cardinality: 1..1
    type: string
    description: The reason that can be presented to the user as to why this time is not available.
    short: Reason presented to the user explaining why time not available

  - name: PractitionerRole.notAvailable.during
    cardinality: 0..1
    type: Period
    description: Service is not available (seasonally or for a public holiday) from this date.
    short: Service not available from this date

  - name: PractitionerRole.availabilityExceptions
    cardinality: 0..1
    type: string
    description: A description of site availability exceptions, e.g. public holiday availability. Succinctly describing all possible exceptions to normal site availability as details in the available Times and not available Times.
    short: Description of availability exceptions

  - name: PractitionerRole.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the practitioner with this role. Commonly used for locating scheduling services, or identifying where to send referrals electronically.
    short: Endpoints for interacting with the practitioner in this role
```

## Search Parameters

Search parameters defined for the PractitionerRole resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Whether this practitioner role record is in active use
    expression: PractitionerRole.active
  - name: date
    type: date
    description: The period during which the practitioner is authorized to perform in these role(s)
    expression: PractitionerRole.period
  - name: email
    type: token
    description: A value in an email contact
    expression: PractitionerRole.telecom.where(system='email')
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the practitioner with this role
    expression: PractitionerRole.endpoint
    targets: [Endpoint]
  - name: identifier
    type: token
    description: A practitioner's Identifier
    expression: PractitionerRole.identifier
  - name: location
    type: reference
    description: One of the locations at which this practitioner provides care
    expression: PractitionerRole.location
    targets: [Location]
  - name: organization
    type: reference
    description: The identity of the organization the practitioner represents / acts on behalf of
    expression: PractitionerRole.organization
    targets: [Organization]
  - name: phone
    type: token
    description: A value in a phone contact
    expression: PractitionerRole.telecom.where(system='phone')
  - name: practitioner
    type: reference
    description: Practitioner that is able to provide the defined services for the organization
    expression: PractitionerRole.practitioner
    targets: [Practitioner]
  - name: role
    type: token
    description: The practitioner can perform this role at for the organization
    expression: PractitionerRole.code
  - name: service
    type: reference
    description: The list of healthcare services that this worker provides for this role's Organization/Location(s)
    expression: PractitionerRole.healthcareService
    targets: [HealthcareService]
  - name: specialty
    type: token
    description: The practitioner has this specialty at an organization
    expression: PractitionerRole.specialty
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: PractitionerRole.telecom
```