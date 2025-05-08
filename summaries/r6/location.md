Okay, I will transform the provided HTML for the FHIR R6 Location resource into the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Location

```yaml
resource:
  name: Location
  hl7_workgroup: Patient Administration
  maturity_level: 5
  standard_status: Trial Use
  security_category: Business
  compartments: []
```

Details and position information for a place where services are provided and resources and participants may be stored, found, contained, or accommodated.

## Background and Scope

The Location resource describes physical or virtual places. This includes dedicated, formally appointed locations (e.g., hospital rooms, clinics) as well as incidental locations (e.g., a park where an accident occurred). Locations can be private, public, mobile, or fixed, and their scale can range from small containers like freezers to large structures like entire hospital buildings or even geographical jurisdictions.

Key aspects include:

*   **Versatility:** Covers a wide range of use cases:
    *   Physical structures: Buildings, wards, rooms, beds.
    *   Mobile units: Mobile clinics, ambulances (both generic types and specific vehicles).
    *   Storage: Freezers, incubators.
    *   Incidental places: A patient's home, a specific road or park.
    *   Jurisdictional areas.
    *   Virtual locations for telehealth.
*   **Instance vs. Kind (`mode`):** A Location resource can represent a specific, identifiable location (`instance`) or a class/type of location (`kind`). For example, an order might specify "an isolation room" (kind) before a specific room is assigned (instance).
*   **Hierarchy (`partOf`):** Locations can be nested to represent physical containment (e.g., a bed is `partOf` a room, which is `partOf` a ward).
*   **Distinction from Organization:** `Location` represents the physical place, while `Organization` represents the conceptual entity that manages or operates at that location. A ward, as a conceptual unit, might be an `Organization`, while the physical space it occupies is a `Location`.
*   **Operational Status:** For locations like beds or rooms, `operationalStatus` can track states like 'contaminated' or 'housekeeping', distinct from the general `status` (active, inactive).
*   **Geospatial Information:** `position` allows for precise geographic coordinates (latitude, longitude, altitude). The `location-boundary-geojson` extension can be used to define boundary shapes.
*   **Availability:** `hoursOfOperation` and `virtualService` elements provide details about when and how the location (or its services) can be accessed.

Location is not intended to describe a site on a patient's body (e.g., "left leg") but can describe the place where an event affecting the patient occurred (e.g., "playground").

## Resource Details

The following defines the core elements and constraints of the Location resource.

```yaml
elements:
  - name: Location
    description: Details and position information for a place where services are provided and resources and participants may be stored, found, contained, or accommodated.
    short: Details and position information for a place
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
    description: The status property covers the general availability of the resource, not the current value which may be covered by the operationalStatus, or by a schedule/slots if they are configured for the location.
    short: active | suspended | inactive
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid

  - name: Location.operationalStatus
    flags: [Σ]
    cardinality: 0..1
    type: Coding
    description: The operational status covers operation values most relevant to beds (but can also apply to rooms/units/chairs/etc. such as an isolation unit/dialysis chair). This typically covers concepts such as contamination, housekeeping, and other activities like maintenance.
    short: The operational status of the location (typically only for a bed/room)
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0116
      strength: preferred

  - name: Location.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: Name of the location as used by humans. Does not need to be unique.
    short: Name of the location as used by humans
    comments: If the name of a location changes, consider putting the old name in the alias column so that it can still be located through searches.

  - name: Location.alias
    cardinality: 0..*
    type: string
    description: A list of alternate names that the location is known as, or was known as, in the past.
    short: A list of alternate names that the location is known as, or was known as, in the past
    comments: There are no dates associated with the alias/historic names, as this is not intended to track when names were used, but to assist in searching so that older names can still result in identifying the location.

  - name: Location.description
    flags: [Σ]
    cardinality: 0..1
    type: markdown
    description: Description of the Location, which helps in finding or referencing the place.
    short: Additional details about the location

  - name: Location.mode
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Indicates whether a resource instance represents a specific location or a class of locations.
    short: instance | kind
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-mode
      strength: required
    comments: This is labeled as a modifier because whether or not the location is a class of locations changes how it can be used and understood. (Note: The HTML description says this, but the element itself is not flagged as a modifier `?!` in the structure definition table.)

  - name: Location.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates the type of function performed at the location.
    short: Type of function performed
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/service-type
      strength: preferred

  - name: Location.contact
    cardinality: 0..*
    type: ExtendedContactDetail
    description: The contact details of communication devices available at the location. This can include addresses, phone numbers, fax numbers, mobile numbers, email addresses and web sites.
    short: Official contact details for the location
    comments: If this is empty (or the type of interest is empty), refer to the organization's contacts.

  - name: Location.address
    cardinality: 0..1
    type: Address
    description: Physical location.
    short: Physical location
    comments: Additional addresses should be recorded using another instance of the Location resource, or via the Organization.

  - name: Location.form
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Physical form of the location, e.g. building, room, vehicle, road, virtual.
    short: Physical form of the location
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-form
      strength: example

  - name: Location.position
    cardinality: 0..1
    type: BackboneElement
    description: The absolute geographic location of the Location, expressed using the WGS84 datum (This is the same co-ordinate system used in KML).
    short: The absolute geographic location
    comments: To define a boundary shape for this location use the standard extension `http://hl7.org/fhir/StructureDefinition/location-boundary-geojson`.

  - name: Location.position.longitude
    cardinality: 1..1
    type: decimal
    description: Longitude. The value domain and the interpretation are the same as for the text of the longitude element in KML (see notes on Location main page).
    short: Longitude with WGS84 datum

  - name: Location.position.latitude
    cardinality: 1..1
    type: decimal
    description: Latitude. The value domain and the interpretation are the same as for the text of the latitude element in KML (see notes on Location main page).
    short: Latitude with WGS84 datum

  - name: Location.position.altitude
    cardinality: 0..1
    type: decimal
    description: Altitude. The value domain and the interpretation are the same as for the text of the altitude element in KML (see notes on Location main page).
    short: Altitude with WGS84 datum

  - name: Location.managingOrganization
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization responsible for the provisioning and upkeep of the location.
    short: Organization responsible for provisioning and upkeep
    comments: This can also be used as the part of the organization hierarchy where this location provides services. These services can be defined through the HealthcareService resource.

  - name: Location.partOf
    cardinality: 0..1
    type: Reference(Location)
    description: Another Location of which this Location is physically a part of.
    short: Another Location this one is physically a part of

  - name: Location.characteristic
    cardinality: 0..*
    type: CodeableConcept
    description: Collection of characteristics (attributes).
    short: Collection of characteristics (attributes)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-characteristic
      strength: example
    comments: These could be such things as is wheelchair accessible.

  - name: Location.hoursOfOperation
    cardinality: 0..1
    type: Availability
    description: What days/times during a week is this location usually open, and any exceptions where the location is not available.
    short: What days/times during a week is this location usually open (including exceptions)
    comments: Specific services within the location may have their own hours which could be shorter (or longer) than the locations hours.

  - name: Location.virtualService
    cardinality: 0..*
    type: VirtualServiceDetail
    description: Connection details of a virtual service (e.g. shared conference call facility with dedicated number/details).
    short: Connection details of a virtual service (e.g. conference call)
    comments: Implementers may consider using Appointment.virtualService for virtual meeting rooms that are generated on-demand.

  - name: Location.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the location.
    short: Technical endpoints providing access to services operated for the location

constraints: []
```

## Search Parameters

Search parameters defined for the Location resource:

```yaml
searchParameters:
  - name: address
    type: string
    description: A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
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
  - name: characteristic
    type: token
    description: Physical form of the location (e.g. bed/ward/site/virtual)
    expression: Location.form # Note: HTML search param description mentions 'physical form', but HTML expression points to Location.form. HTML description for characteristic refers to Location.characteristic, but the search parameter is Location.form. The actual search param from the table is named 'characteristic' but its expression is Location.form. This seems like a mismatch in the source spec. I will use the name and expression as listed in the table for 'characteristic'.
    # Based on source HTML for search parameter 'characteristic', the expression is `Location.form`.
    # However, there's also a Location.characteristic element. If the search parameter intends to search Location.characteristic, the expression should be Location.characteristic.
    # Given the table, using Location.form for SP 'characteristic'.
  - name: contains
    type: special
    description: Select locations that contain the specified co-ordinates
    expression: Location.extension('http://hl7.org/fhir/StructureDefinition/location-boundary-geojson').value
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the location
    expression: Location.endpoint
    targets: [Endpoint]
  - name: identifier
    type: token
    description: An identifier for the location
    expression: Location.identifier
  - name: mode
    type: token
    description: The mode of the location (instance | kind)
    expression: Location.mode
  - name: name
    type: string
    description: A portion of the location's name or alias
    expression: Location.name | Location.alias
  - name: near
    type: special
    description: Search for locations where the location.position is near to, or within a specified distance of, the provided coordinates expressed as [latitude]|[longitude]|[distance]|[units] (using the WGS84 datum, see notes).
    expression: Location.position
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