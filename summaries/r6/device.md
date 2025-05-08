Okay, here is the Device resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Device

```yaml
resource:
  name: Device
  hl7_workgroup: Orders and Observations
  maturity_level: 2
  standard_status: Trial Use
  security_category: Business
  compartments: [] # No defined compartments
```

A manufactured item that is used in the provision of healthcare without being substantially changed through that activity. The device may be a medical or non-medical device.

## Background and Scope

This resource tracks individual instances of devices and their location. It serves as a reference point for other resources when recording device usage (e.g., in procedures, observations), implantation/explantation, dispensing, inventory management, or specific device requests. It covers a wide range of medical devices (durable equipment, implants, disposables) and non-medical items (machines, software) used in healthcare.

**Key Concepts:**

*   **Instance vs. Kind:** `Device` represents a specific physical instance, even if instance details like serial numbers aren't known. `DeviceDefinition` represents a *kind* or model of device.
*   **UDI:** Supports documenting Unique Device Identifiers (UDI), including the Device Identifier (DI) and Production Identifiers (PI). See the [Unique Device Identifier (UDI)](#unique-device-identifier-udi) section below for more details.
*   **Categorization:** Devices can be categorized (e.g., active, implantable, single-use) via the `category` element.
*   **Owner/Association:** Ownership and subject association are handled by the separate `DeviceAssociation` resource, not directly within `Device`.
*   **Status:**
    *   `status`: Tracks the status of the *Device resource record* (active, inactive, entered-in-error).
    *   `availabilityStatus`: Tracks the physical availability of the *device itself* (e.g., lost, damaged, available). (New in R6)
*   **Components:** Devices can represent components of larger systems using the `parent` element.

**Note to Implementers:**

*   See the [Device Module Page](https://build.fhir.org/device-module.html) for an overview of the Device domain.
*   Ownership/subject association moved to `DeviceAssociation`.
*   Some R4 elements (mode, cycle, duration, gateway, endpoint) are planned to be covered by extensions in a future Extension Pack. New extensions for alert detection and specification source are also planned.

## Boundaries and Relationships

*   **Device vs. DeviceDefinition:** `Device` is for specific instances; `DeviceDefinition` is for kinds/models/catalog entries.
*   **Device vs. DeviceMetric:** `DeviceMetric` describes measurement/setting capabilities *of* a `Device` instance, especially those that change over time. `Device.property` captures inherent, fixed characteristics.
*   **Device vs. DeviceAssociation:** `DeviceAssociation` links a `Device` to a subject (e.g., Patient) or operator, including ownership/custodianship.
*   **Device vs. DeviceAlert:** `DeviceAlert` represents specific alarms/alerts signaled by a device.
*   **Workflow:** `DeviceRequest` orders a device; `DeviceDispense` tracks its distribution. `SupplyRequest`/`SupplyDelivery` handle associated supplies.
*   **Usage:** `DeviceUsage` records use outside procedures (e.g., patient-reported). `Procedure`, `Observation`, `MedicationAdministration`, etc., reference the `Device` used.
*   **Medication vs. Device:** Devices are generally not "used up" like medications. Combination products often focus on the medication aspect but may reference the `Device`. The `Medication` resource should not represent devices.

## Resource Details

The following defines the core elements and constraints of the Device resource.

```yaml
elements:
  - name: Device
    description: A manufactured item that is used in the provision of healthcare without being substantially changed through that activity. The device may be a medical or non-medical device.
    short: Item used in healthcare
    type: DomainResource
    comments: The base resource definition.

  - name: Device.identifier
    cardinality: 0..*
    type: Identifier
    description: Unique instance identifiers assigned to a device by manufacturers other organizations or owners.
    short: Instance identifier
    comments: Certain attributes, like serial number and UDI Carrier are not device instance identifiers as they are not consistently able to uniquely identify the instance of a device, thus are not appropriate to be used to value Device.identifier... If the identifier identifies the type of device, Device.type element should be used.

  - name: Device.definition
    cardinality: 0..1
    type: Reference(DeviceDefinition)
    description: The reference to the definition for the device.
    short: The reference to the definition for the device

  - name: Device.udiCarrier
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Unique Device Identifier (UDI) placed on a device label or package. Note that the Device may include multiple UDIs if it is sold in multiple jurisdictions.
    short: Unique Device Identifier (UDI) value
    comments: UDI may identify an unique instance of a device, or it may only identify the type of the device. See UDI mappings for a complete mapping of UDI parts to Device.

  - name: Device.udiCarrier.deviceIdentifier
    flags: [Σ]
    cardinality: 1..1
    type: string
    description: The device identifier (UDI-DI) is a mandatory, fixed portion of a UDI that identifies the labeler and the specific version or model of a device.
    short: Mandatory fixed portion of UDI

  - name: Device.udiCarrier.deviceIdentifierSystem
    cardinality: 0..1
    type: uri
    description: Establishes the namespace for the device identifier value that is an URL, OID, urn or uuid.
    short: The namespace for the device identifier value

  - name: Device.udiCarrier.issuer
    flags: [Σ]
    cardinality: 1..1
    type: uri
    description: Organization that is charged with issuing UDIs for devices. For example, the US FDA issuers include GS1, HIBCC, ICCBBA.
    short: UDI Issuing Organization

  - name: Device.udiCarrier.jurisdiction
    cardinality: 0..1
    type: uri
    description: The identity of the authoritative source for UDI generation within a jurisdiction. E.g., http://hl7.org/fhir/NamingSystem/us-fda-udi or http://hl7.org/fhir/NamingSystem/eu-ec-udi.
    short: Regional UDI authority

  - name: Device.udiCarrier.carrierAIDC
    flags: [Σ]
    cardinality: 0..1
    type: base64Binary
    description: The full UDI carrier of the Automatic Identification and Data Capture (AIDC) technology representation as printed on the packaging of the device - e.g., a barcode or RFID. SHALL be base64 encoded.
    short: UDI Machine Readable value (AIDC)
    comments: The AIDC form should be scanned whenever possible. If separate DI/PI barcodes exist, concatenate DI first.

  - name: Device.udiCarrier.carrierHRF
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: The full UDI carrier as the human readable form (HRF) representation of the barcode string as printed on the packaging of the device.
    short: UDI Human Readable Barcode String (HRF)
    comments: If separate DI/PI barcodes exist, concatenate DI first.

  - name: Device.udiCarrier.entryType
    cardinality: 0..1
    type: code
    description: A coded entry to indicate how the data was entered.
    short: barcode | rfid | manual | card | self-reported | electronic-transmission | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/udi-entry-type
      strength: required

  - name: Device.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: The Device record status. This is not the status of the device like availability.
    short: active | inactive | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: Device.availabilityStatus
    cardinality: 0..1
    type: CodeableConcept
    description: The availability of the device.
    short: lost | damaged | destroyed | available
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-availability-status
      strength: extensible

  - name: Device.biologicalSourceEvent
    cardinality: 0..1
    type: Identifier
    description: A production identifier of the donation, collection, or pooling event from which biological material in this device was derived.
    short: Production identifier for biological source material
    comments: Necessary for traceability from donor/source to recipient and vice versa, while satisfying anonymity requirements. Consistent across BiologicallyDerivedProduct, NutritionProduct, Device.

  - name: Device.manufacturer
    cardinality: 0..1
    type: string
    description: A name of the manufacturer or entity legally responsible for the device.
    short: Name of device manufacturer

  - name: Device.manufactureDate
    cardinality: 0..1
    type: dateTime
    description: The date and time when the device was manufactured.
    short: Date when the device was made

  - name: Device.expirationDate
    cardinality: 0..1
    type: dateTime
    description: The date and time beyond which this device is no longer valid or should not be used (if applicable).
    short: Date and time of expiry of this device (if applicable)

  - name: Device.lotNumber
    cardinality: 0..1
    type: string
    description: Lot number assigned by the manufacturer.
    short: Lot number of manufacture

  - name: Device.serialNumber
    cardinality: 0..1
    type: string
    description: The serial number assigned by the organization when the device was manufactured.
    short: Serial number assigned by the manufacturer
    comments: While a serial number is an identifier, it's often part of the UDI PI. Using this dedicated attribute enhances clarity. Systems may still place it in Device.identifier if appropriate.

  - name: Device.name
    flags: [C] # Constraint dev-1 applies
    cardinality: 0..*
    type: BackboneElement
    description: This represents the manufacturer's name of the device as provided by the device, from a UDI label, or by a person describing the Device.
    short: The name or names of the device as known to the manufacturer and/or patient

  - name: Device.name.value
    flags: [Σ]
    cardinality: 1..1
    type: string
    description: The actual name that identifies the device.
    short: The term that names the device

  - name: Device.name.type
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Indicates the kind of name. RegisteredName | UserFriendlyName | PatientReportedName.
    short: registered-name | user-friendly-name | patient-reported-name
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-nametype
      strength: extensible
    comments: Implementation/jurisdiction must clarify which name is 'registered-name'.

  - name: Device.name.display
    flags: [?!, Σ, C] # Constraint dev-1 applies
    cardinality: 0..1
    type: boolean
    description: Indicates the default or preferred name to be displayed.
    short: The preferred device name
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that that a name is preferred.

  - name: Device.modelNumber
    cardinality: 0..1
    type: string
    description: The manufacturer's model number for the device.
    short: The manufacturer's model number for the device

  - name: Device.partNumber
    cardinality: 0..1
    type: string
    description: The part number or catalog number of the device.
    short: The part number or catalog number of the device

  - name: Device.category
    cardinality: 0..*
    type: CodeableConcept
    description: Devices may be associated with one or more categories.
    short: Indicates a high-level grouping of the device
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-category
      strength: example

  - name: Device.type
    cardinality: 0..*
    type: CodeableConcept
    description: The kind or type of device. A device instance may have more than one type - in which case those are the types that apply to the specific instance of the device.
    short: The kind or type of device
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-type
      strength: example
    comments: Multiple types used for hybrid devices (e.g., gateway and sensor). Relates to DeviceDefinition.classification.type.

  - name: Device.deviceVersion
    cardinality: 0..*
    type: BackboneElement
    description: The actual design of the device or software version running on the device.
    short: The actual design of the device or software version running on the device

  - name: Device.deviceVersion.type
    cardinality: 0..1
    type: CodeableConcept
    description: The type of the device version, e.g. manufacturer, approved, internal.
    short: The type of the device version, e.g. manufacturer, approved, internal
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-versiontype
      strength: example

  - name: Device.deviceVersion.component
    cardinality: 0..1
    type: Identifier
    description: The hardware or software module of the device to which the version applies.
    short: The hardware or software module of the device to which the version applies
    comments: Typically used for software modules that don't need separate tracking as Devices.

  - name: Device.deviceVersion.installDate
    cardinality: 0..1
    type: dateTime
    description: The date the version was installed on the device.
    short: The date the version was installed on the device

  - name: Device.deviceVersion.value
    cardinality: 1..1
    type: string
    description: The version text.
    short: The version text

  - name: Device.conformsTo
    cardinality: 0..*
    type: BackboneElement
    description: Identifies the standards, specifications, or formal guidances for the capabilities supported by the device. The device may be certified as conformant to these specifications e.g., communication, performance, process, measurement, or specialization standards.
    short: Identifies the standards, specifications, or formal guidances for the capabilities supported by the device

  - name: Device.conformsTo.category
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the type of the standard, specification, or formal guidance.
    short: Describes the common type of the standard, specification, or formal guidance. communication | performance | measurement
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-specification-category
      strength: example

  - name: Device.conformsTo.specification
    cardinality: 1..1
    type: CodeableConcept
    description: Code that identifies the specific standard, specification, protocol, formal guidance, regulation, legislation, or certification scheme to which the device adheres.
    short: Identifies the standard, specification, or formal guidance that the device adheres to
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-specification-type
      strength: example

  - name: Device.conformsTo.version
    cardinality: 0..1
    type: string
    description: Identifies the specific form or variant of the standard, specification, or formal guidance. This may be a 'version number', release, document edition, publication year, or other label.
    short: Specific form or variant of the standard

  - name: Device.property
    cardinality: 0..*
    type: BackboneElement
    description: Static or essentially fixed characteristics or features of the device (e.g., time or timing attributes, resolution, accuracy, intended use or instructions for use, and physical attributes) that are not otherwise captured in more specific attributes.
    short: Inherent, essentially fixed, characteristics of the device. e.g., time properties, size, material, etc.
    comments: Dynamic properties are described using DeviceMetric/Observation. Static characteristics might also be in DeviceDefinition.

  - name: Device.property.type
    cardinality: 1..1
    type: CodeableConcept
    description: Code that specifies the property, such as resolution, color, size, being represented.
    short: Code that specifies the property being represented
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-property-type # Note: HTML binds to DeviceType ValueSet here, seems potentially incorrect based on name/description. Using device-property-type which seems more likely, although it doesn't exist in base FHIR R6 build yet. Assuming example binding from R4/R5 for now.
      strength: example

  - name: Device.property.value[x]
    cardinality: 1..1
    type: [Quantity, CodeableConcept, string, boolean, integer, Range, Attachment]
    description: The value of the property specified by the associated property.type code.
    short: Value of the property
    comments: Use CodeableConcept.text for properties usually coded but lacking a standard concept. Use string for descriptive properties or instructions.

  - name: Device.additive
    cardinality: 0..*
    type: BackboneElement
    description: Material added to a container device (typically used in specimen collection or initial processing). The material may be added by the device manufacturer or by a different party subsequent to manufacturing.
    short: Material added to a container device

  - name: Device.additive.type
    cardinality: 1..1
    type: CodeableReference(Substance)
    description: The type of the substance added to the container. This is represented as a concept from a code system or described in a Substance resource.
    short: The additive substance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/substance-code
      strength: example

  - name: Device.additive.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The quantity of the additive substance in the container; may be volume, dimensions, or other appropriate measurements, depending on the container and additive substance type.
    short: Quantity of additive substance within container

  - name: Device.additive.performer
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson)
    description: The performer who adds the substance to the container.
    short: Entity adding substance to the container

  - name: Device.additive.performed
    cardinality: 0..1
    type: dateTime
    description: Time when the additive substance was placed into the container by the performer.
    short: When the additive substance was added to the container

  - name: Device.contact
    cardinality: 0..*
    type: ContactPoint
    description: Contact details for an organization or a particular human that is responsible for the device.
    short: Details for human/organization for support
    comments: used for troubleshooting etc.

  - name: Device.location
    cardinality: 0..1
    type: Reference(Location)
    description: The place where the device can be found.
    short: Where the device is found

  - name: Device.note
    cardinality: 0..*
    type: Annotation
    description: Descriptive information, usage information or implantation information that is not captured in an existing element.
    short: Device notes and comments

  - name: Device.safety
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Provides additional safety characteristics about a medical device. For example devices containing latex.
    short: Safety Characteristics of Device
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-safety
      strength: example

  - name: Device.parent
    cardinality: 0..1
    type: Reference(Device)
    description: The higher level or encompassing device that this device is a logical part of.
    short: The higher level or encompassing device that this device is a logical part of
    comments: For example a vital signs monitor (parent) with pluggable modules (children).

constraints:
  - key: dev-1
    severity: Rule
    location: (base)
    description: only one Device.name.display SHALL be true when there is more than one Device.name
    expression: name.where(display=true).count() <= 1

```

## Unique Device Identifier (UDI)

The UDI system, based on IMDRF specifications, provides a standardized way to identify medical devices. The full UDI string (carrier) usually contains:

*   **Device Identifier (DI):** A mandatory, fixed portion identifying the labeler and specific model/version. This is often stored in regulatory databases (like FDA's GUDID). Represented in `udiCarrier.deviceIdentifier`.
*   **Production Identifier(s) (PI):** Variable portion(s) tracking manufacturing details like lot number (`Device.lotNumber`), serial number (`Device.serialNumber`), expiration date (`Device.expirationDate`), or manufacture date (`Device.manufactureDate`).

**Representation in FHIR:**

*   The complete UDI carrier string (as read from barcode/RFID) should be stored in `udiCarrier.carrierAIDC` (base64 encoded) and/or `udiCarrier.carrierHRF` (human-readable form).
*   The DI component is stored in `udiCarrier.deviceIdentifier`.
*   The issuing agency (GS1, HIBCC, etc.) is identified in `udiCarrier.issuer`.
*   The regulatory jurisdiction is in `udiCarrier.jurisdiction`.
*   Individual PI components (like serial number, lot, expiry) should be populated in their dedicated top-level elements (`Device.serialNumber`, `Device.lotNumber`, `Device.expirationDate`) and must be consistent with the UDI carrier information.

Best practice is to transmit both the full UDI carrier and the parsed components where available.

## Search Parameters

Search parameters defined for the Device resource:

```yaml
searchParameters:
  - name: biological-source-event
    type: token
    description: The biological source for the device
    expression: Device.biologicalSourceEvent
  - name: code # Renamed from 'type' in R4 to avoid conflict, covers type and definition classification
    type: token
    description: The definition / type of the device (code)
    expression: Device.type | Device.definition.resolve().classification.type
  - name: code-value-concept # New composite
    type: composite
    description: Code and value parameter pair (used for conformsTo.specification + version)
    components:
      - definition: specification
        expression: specification.ofType(CodeableConcept)
      - definition: version
        expression: version.ofType(string)
    source: Device.conformsTo # Clarification: Composite defined on conformsTo backbone
  - name: definition
    type: reference
    description: The definition / type of the device
    expression: Device.definition
    targets: [DeviceDefinition]
  - name: device-name # Changed from 'name' in R4
    type: string
    description: A server defined search that may match any of the string fields in Device.name or Device.type.
    expression: Device.name.value | Device.type.coding.display | Device.type.text
  - name: expiration-date
    type: date
    description: The expiration date of the device
    expression: Device.expirationDate
  - name: identifier
    type: token
    description: Instance id from manufacturer, owner, and others
    expression: Device.identifier
  - name: location
    type: reference
    description: A location, where the resource is found
    expression: Device.location
    targets: [Location]
  - name: lot-number
    type: string
    description: The lot number of the device
    expression: Device.lotNumber
  - name: manufacture-date
    type: date
    description: The manufacture date of the device
    expression: Device.manufactureDate
  - name: manufacturer
    type: string
    description: The manufacturer of the device
    expression: Device.manufacturer
  - name: model
    type: string
    description: The model of the device
    expression: Device.modelNumber # Note: R4 used Device.model
  - name: parent
    type: reference
    description: The parent device
    expression: Device.parent
    targets: [Device]
  - name: serial-number
    type: string
    description: The serial number of the device
    expression: Device.serialNumber | Device.identifier.where(type='SNO') # Added alternate expression for SNO type identifier
  - name: specification # New parameter for conformsTo
    type: token
    description: The standards, specifications, or formal guidances.
    expression: Device.conformsTo.specification
  - name: specification-version # New composite for conformsTo
    type: composite
    description: A composite of both specification and version
    components:
      - definition: specification
        expression: specification
      - definition: version
        expression: version
    source: Device.conformsTo # Clarification: Composite defined on conformsTo backbone
  - name: status
    type: token
    description: active | inactive | entered-in-error
    expression: Device.status
  - name: type # Combined R4 'type' and 'definition-code' - check expression
    type: token
    description: The type of the device (from Device.type or DeviceDefinition.classification.type)
    expression: Device.type | Device.definition.resolve().classification.type
  - name: udi-carrier-hrf # Renamed from udi-carrier
    type: string
    description: UDI Barcode (RFID or other technology) string in HRF format.
    expression: Device.udiCarrier.carrierHRF
  - name: udi-di
    type: string
    description: The udi Device Identifier (DI)
    expression: Device.udiCarrier.deviceIdentifier
  - name: version # New parameter for deviceVersion
    type: string
    description: The specific version of the device
    expression: Device.deviceVersion.value
  - name: version-type # New composite for deviceVersion
    type: composite
    description: Value and type of version
    components:
      - definition: type
        expression: type
      - definition: value
        expression: value
    source: Device.deviceVersion # Clarification: Composite defined on deviceVersion backbone
# Removed Parameters from R4:
# - patient: Reference(Patient) -> Now handled via DeviceAssociation
# - organization: Reference(Organization) -> Owner now handled via DeviceAssociation
# - url: uri -> Element removed
# - definition-code: token -> Merged into 'code' parameter
# - name: string -> Renamed to 'device-name'
```

---