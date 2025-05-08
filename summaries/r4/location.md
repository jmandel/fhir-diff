Okay, here is the FHIR R4 Location resource definition in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Location (R4)

```yaml
resource:
  name: Location
  hl7_workgroup: Patient Administration
  maturity_level: 3
  standard_status: Trial Use
  security_category: Business
  compartments: []
```

Details and position information for a physical place where services are provided and resources and participants may be stored, found, contained, or accommodated.

## Background and Scope

The Location resource is used to represent a variety of physical places. This includes both incidental locations (e.g., a place used for healthcare without prior designation) and dedicated, formally appointed locations. Locations can be private, public, mobile, or fixed, and their scale can range from small items like freezers or incubators to entire hospital buildings or geographical areas like jurisdictions.

Examples include:
*   Buildings, wards, corridors, rooms, or beds.
*   Mobile clinics or specific vehicles like ambulances.
*   Specialized equipment storage like freezers.
*   Patient's homes or other non-institutional settings like parks or roads where healthcare events might occur.
*   Jurisdictional boundaries.

Location resources are not intended to describe anatomical locations on a patient (e.g., "left leg") but rather the physical place where an event, such as an injury, occurred (e.g., "playground").

**Key Distinctions and Relationships:**
*   **Location vs. Organization:** `Location` describes physical structures, whereas `Organization` represents conceptual hierarchies (e.g., a hospital department).
*   **Address:** A Location can be valid without a physical address, especially if it's described by geo-coordinates or if it's a "kind" of location (see below).
*   **Nesting:** Locations can be nested using the `partOf` element to represent containment (e.g., a room within a wing, a wing within a building).
*   **Geo-position:** The `Location.position` element uses WGS84 datum, similar to KML, for precise geographic coordinates. For boundary shapes, the `location-boundary-geojson` extension can be used.

**Location Mode (`Location.mode`):**
*   **`instance`:** Represents a specific, potentially identifiable location (e.g., "Room 2B-101"). This should be used for actual locations involved in an event, even if specific identifiers are missing.
*   **`kind`:** Represents a class or type of location (e.g., "an isolation room," "an ambulance"). This is useful for planning, scheduling, or orders where a specific instance isn't yet determined.
*   Certain elements like `identifier`, `telecom`, `address`, `position`, `status`, and `managingOrganization` are typically relevant only for `instance` mode locations.

**Operational Status (`Location.operationalStatus`):**
This element is particularly relevant for locations like beds or rooms and covers their operational state (e.g., "contaminated", "housekeeping", "maintenance"). It's distinct from the general `status` of the Location resource (active, suspended, inactive).

## Resource Details

The following defines the core elements of the Location resource based on FHIR R4.

```yaml
elements:
  - name: Location
    description: Details and position information for a physical place where services are provided and resources and participants may be stored, found, contained, or accommodated.
    short: Details and position information for a physical place
    type: DomainResource

  - name: Location.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Unique code or number identifying the location to its users.
    short: Unique code or number identifying the location to its users

  - name: Location.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: The status property covers the general availability of the resource, not the current value which may be covered by the operationStatus, or by a schedule/slots if they are configured for the location.
    short: active | suspended | inactive
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid.

  - name: Location.operationalStatus
    flags: [Σ]
    cardinality: 0..1
    type: Coding
    description: The operational status covers operation values most relevant to beds (but can also apply to rooms/units/chairs/etc. such as an isolation unit/dialysis chair). This typically covers concepts such as contamination, housekeeping, and other activities like maintenance.
    short: The operational status of the location (typically only for a bed/room)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v2-0116
      strength: preferred

  - name: Location.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: Name of the location as used by humans. Does not need to be unique.
    short: Name of the location as used by humans

  - name: Location.alias
    cardinality: 0..*
    type: string
    description: A list of alternate names that the location is known as, or was known as, in the past.
    short: A list of alternate names that the location is known as, or was known as, in the past

  - name: Location.description
    flags: [Σ]
    cardinality: 0..1
    type: string # R4 type is string, R5 is markdown
    description: Description of the Location, which helps in finding or referencing the place.
    short: Additional details about the location

  - name: Location.mode
    flags: [Σ] # Note: R4 page does not mark mode as ?! IsModifier, unlike STU3
    cardinality: 0..1
    type: code
    description: Indicates whether a resource instance represents a specific location or a class of locations.
    short: instance | kind
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-mode|4.0.1
      strength: required

  - name: Location.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates the type of function performed at the location.
    short: Type of function performed
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v3-ServiceDeliveryLocationRoleType
      strength: extensible

  - name: Location.telecom
    cardinality: 0..*
    type: ContactPoint
    description: The contact details of communication devices available at the location. This can include phone numbers, fax numbers, mobile numbers, email addresses and web sites.
    short: Contact details of the location

  - name: Location.address
    cardinality: 0..1
    type: Address
    description: Physical location.
    short: Physical location

  - name: Location.physicalType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Physical form of the location, e.g. building, room, vehicle, road.
    short: Physical form of the location
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-physical-type
      strength: example

  - name: Location.position
    cardinality: 0..1
    type: BackboneElement
    description: The absolute geographic location of the Location, expressed using the WGS84 datum (This is the same co-ordinate system used in KML).
    short: The absolute geographic location

  - name: Location.position.longitude
    cardinality: 1..1
    type: decimal
    description: Longitude. The value domain and the interpretation are the same as for the text of the longitude element in KML (see notes below).
    short: Longitude with WGS84 datum

  - name: Location.position.latitude
    cardinality: 1..1
    type: decimal
    description: Latitude. The value domain and the interpretation are the same as for the text of the latitude element in KML (see notes below).
    short: Latitude with WGS84 datum

  - name: Location.position.altitude
    cardinality: 0..1
    type: decimal
    description: Altitude. The value domain and the interpretation are the same as for the text of the altitude element in KML (see notes below).
    short: Altitude with WGS84 datum

  - name: Location.managingOrganization
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization responsible for the provisioning and upkeep of the location.
    short: Organization responsible for provisioning and upkeep

  - name: Location.partOf
    cardinality: 0..1
    type: Reference(Location)
    description: Another Location of which this Location is physically a part of.
    short: Another Location this one is physically a part of

  - name: Location.hoursOfOperation
    cardinality: 0..*
    type: BackboneElement # R4 type is custom BackboneElement, R5 uses Availability
    description: What days/times during a week is this location usually open.
    short: What days/times during a week is this location usually open

  - name: Location.hoursOfOperation.daysOfWeek
    cardinality: 0..*
    type: code
    description: Indicates which days of the week are available between the start and end Times.
    short: mon | tue | wed | thu | fri | sat | sun
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/days-of-week|4.0.1
      strength: required

  - name: Location.hoursOfOperation.allDay
    cardinality: 0..1
    type: boolean
    description: The Location is open all day.
    short: The Location is open all day

  - name: Location.hoursOfOperation.openingTime
    cardinality: 0..1
    type: time
    description: Time that the Location opens.
    short: Time that the Location opens

  - name: Location.hoursOfOperation.closingTime
    cardinality: 0..1
    type: time
    description: Time that the Location closes.
    short: Time that the Location closes

  - name: Location.availabilityExceptions
    cardinality: 0..1
    type: string
    description: A description of when the locations opening ours are different to normal, e.g. public holiday availability. Succinctly describing all possible exceptions to normal site availability as detailed in the opening hours Times.
    short: Description of availability exceptions

  - name: Location.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the location.
    short: Technical endpoints providing access to services operated for the location
```

## Search Parameters

Search parameters defined for the Location resource in FHIR R4:

```yaml
searchParameters:
  - name: address
    type: string
    description: A (part of the) address of the location
    expression: Location.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: Location.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: Location.address.country
  - name: address-postalcode
    type: string
    description: A postal code specified in an address
    expression: Location.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: Location.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: Location.address.use
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the location
    expression: Location.endpoint
    targets: [Endpoint]
  - name: identifier
    type: token
    description: An identifier for the location
    expression: Location.identifier
  - name: name
    type: string
    description: A portion of the location's name or alias
    expression: Location.name | Location.alias
  - name: near
    type: special
    description: >-
      Search for locations where the location.position is near to, or within a specified distance of,
      the provided coordinates expressed as [latitude]|[longitude]|[distance]|[units] (using WGS84 datum).
      If units are omitted, kms are assumed. If distance is omitted, server discretion applies.
    expression: Location.position
    # Note: The R4 spec page for Location mentions "Requires the near-distance parameter to be provided also",
    # which is a carryover from STU3. In R4, distance is part of the 'near' parameter itself.
    # Search results can include the distance using the 'http://hl7.org/fhir/StructureDefinition/location-distance' extension.
  - name: operational-status
    type: token
    description: Searches for locations (typically bed/room) that have an operational status (e.g. contaminated, housekeeping)
    expression: Location.operationalStatus
  - name: organization
    type: reference
    description: Searches for locations that are managed by the provided organization
    expression: Location.managingOrganization
    targets: [Organization]
  - name: partof
    type: reference
    description: A location of which this location is a part
    expression: Location.partOf
    targets: [Location]
  - name: status
    type: token
    description: Searches for locations with a specific kind of status
    expression: Location.status
  - name: type
    type: token
    description: A code for the type of location
    expression: Location.type
```