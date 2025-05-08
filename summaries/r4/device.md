Okay, here is the FHIR R4 Device resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Device (R4)

```yaml
resource:
  name: Device
  hl7_workgroup: Orders and Observations
  maturity_level: 2
  standard_status: Trial Use
  security_category: Business
  compartments: [] # Not linked to any defined compartments in R4
```

A type of a manufactured item that is used in the provision of healthcare without being substantially changed through that activity. The device may be a medical or non-medical device.

## Background and Scope

This resource tracks individual instances of devices and their locations. It's an administrative resource primarily focused on static information like manufacturer details and identifiers.

Key aspects include:

*   **Instance Tracking:** Represents specific, physical devices.
*   **Referencing:** Used by other resources (e.g., Procedure, Observation, DeviceUseStatement) to specify which device was involved.
*   **Prescribing/Dispensing:** Referenced when ordering or providing devices for patient use or supplies.
*   **UDI Information:** Records Unique Device Identifier (UDI) details, crucial for tracking (especially implants).
*   **UDI Handling:** Contains the `udiCarrier` element to store the full UDI string (both machine-readable AIDC and human-readable HRF) and its components like the Device Identifier (DI) and Production Identifiers (PI). Best practice is to transmit both the full carrier and parsed components where applicable.

## Boundaries and Relationships

*   **Device vs. DeviceDefinition:** `Device` represents a specific instance, while `DeviceDefinition` describes the "kind" or catalog entry for a type of device.
*   **Device vs. DeviceMetric/DeviceComponent:** `Device` holds administrative data. `DeviceMetric` and `DeviceComponent` (in later FHIR versions) model more dynamic aspects like operational status and measurements.
*   **Physical Composition:** Hierarchy is represented using the `parent` element (a Device pointing to its parent Device).
*   **Device vs. Medication:** Devices are generally not "used up". The boundary can be implementation-defined, but implanted devices MUST be represented using `Device`, not `Medication`.

## Resource Details

The following defines the core elements of the Device resource based on FHIR R4.

```yaml
elements:
  - name: Device
    description: A type of a manufactured item that is used in the provision of healthcare without being substantially changed through that activity. The device may be a medical or non-medical device.
    short: Item used in healthcare
    type: DomainResource
    comments: The base resource definition.

  - name: Device.identifier
    cardinality: 0..*
    type: Identifier
    description: Unique instance identifiers assigned to a device by manufacturers other organizations or owners.
    short: Instance identifier
    comments: Certain attributes, like serial number and UDI Carrier are not device instance identifiers as they are not consistently able to uniquely identify the instance of a device, thus are not appropriate to be used to value Device.identifier. The identifier is typically valued if the serialNumber or lotNumber is not valued and represents a different type of identifier.

  - name: Device.definition
    cardinality: 0..1
    type: Reference(DeviceDefinition)
    description: The reference to the definition for the device.
    short: The reference to the definition for the device

  - name: Device.udiCarrier
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Unique device identifier (UDI) assigned to device label or package. Note that the Device may include multiple udiCarriers as it either may include just the udiCarrier for the jurisdiction it is sold, or for multiple jurisdictions it could have been sold.
    short: Unique Device Identifier (UDI) Barcode string
    comments: UDI may identify an unique instance of a device, or it may only identify the type of the device. See UDI mappings for a complete mapping of UDI parts to Device.

  - name: Device.udiCarrier.deviceIdentifier
    flags: [Σ]
    cardinality: 0..1 # R4 Definition page has 0..1, R5 has 1..1
    type: string
    description: The device identifier (DI) is a mandatory, fixed portion of a UDI that identifies the labeler and the specific version or model of a device.
    short: Mandatory fixed portion of UDI

  - name: Device.udiCarrier.issuer
    cardinality: 0..1 # R4 Definition page has 0..1, R5 has 1..1
    type: uri
    description: Organization that is charged with issuing UDIs for devices. For example, the US FDA issuers include GS1, HIBCC, ICCBBA.
    short: UDI Issuing Organization

  - name: Device.udiCarrier.jurisdiction
    cardinality: 0..1
    type: uri
    description: The identity of the authoritative source for UDI generation within a jurisdiction. All UDIs are globally unique within a single namespace with the appropriate repository uri as the system. For example, UDIs of devices managed in the U.S. by the FDA, the value is http://hl7.org/fhir/NamingSystem/fda-udi.
    short: Regional UDI authority

  - name: Device.udiCarrier.carrierAIDC
    flags: [Σ]
    cardinality: 0..1
    type: base64Binary
    description: The full UDI carrier of the Automatic Identification and Data Capture (AIDC) technology representation of the barcode string as printed on the packaging of the device - e.g., a barcode or RFID. Because of limitations on character sets in XML and the need to round-trip JSON data through XML, AIDC Formats *SHALL* be base64 encoded.
    short: UDI Machine Readable Barcode String
    comments: The AIDC form of UDIs should be scanned or otherwise used for the identification of the device whenever possible to minimize errors in records resulting from manual transcriptions.

  - name: Device.udiCarrier.carrierHRF
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: The full UDI carrier as the human readable form (HRF) representation of the barcode string as printed on the packaging of the device.
    short: UDI Human Readable Barcode String
    comments: If separate barcodes for DI and PI are present, concatenate the string with DI first and in order of human readable expression on label.

  - name: Device.udiCarrier.entryType
    cardinality: 0..1
    type: code
    description: A coded entry to indicate how the data was entered.
    short: barcode | rfid | manual | card | self-reported | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/udi-entry-type
      strength: required
    comments: R4 definition uses 'manual +', suggesting extensibility despite required strength, R5 clarifies the value set.

  - name: Device.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: Status of the Device availability. Note: This is the R4 definition focusing on availability. R5 separates this into status (record status) and availabilityStatus.
    short: active | inactive | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: Device.statusReason
    cardinality: 0..*
    type: CodeableConcept
    description: Reason for the status of the Device availability.
    short: online | paused | standby | offline | not-ready | transduc-discon | hw-discon | off
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-status-reason
      strength: extensible

  - name: Device.distinctIdentifier
    cardinality: 0..1
    type: string
    description: The distinct identification string as required by regulation for a human cell, tissue, or cellular and tissue-based product.
    short: The distinct identification string

  - name: Device.manufacturer
    cardinality: 0..1
    type: string
    description: A name of the manufacturer.
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

  - name: Device.deviceName
    cardinality: 0..*
    type: BackboneElement
    description: This represents the manufacturer's name of the device as provided by the device, from a UDI label, or by a person describing the Device. This typically would be used when a person provides the name(s) or when the device represents one of the names available from DeviceDefinition.
    short: The name of the device as given by the manufacturer

  - name: Device.deviceName.name
    cardinality: 1..1
    type: string
    description: The name of the device.
    short: The name of the device

  - name: Device.deviceName.type
    cardinality: 1..1
    type: code
    description: The type of deviceName. UDILabelName | UserFriendlyName | PatientReportedName | ManufactureDeviceName | ModelName.
    short: udi-label-name | user-friendly-name | patient-reported-name | manufacturer-name | model-name | other
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-nametype
      strength: required

  - name: Device.modelNumber
    cardinality: 0..1
    type: string
    description: The model number for the device.
    short: The model number for the device

  - name: Device.partNumber
    cardinality: 0..1
    type: string
    description: The part number of the device.
    short: The part number of the device

  - name: Device.type
    cardinality: 0..1 # Note: R5 changes this to 0..*
    type: CodeableConcept
    description: The kind or type of device.
    short: The kind or type of device
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-type
      strength: example

  - name: Device.specialization
    cardinality: 0..*
    type: BackboneElement
    description: The capabilities supported on a device, the standards to which the device conforms for a particular purpose, and used for the communication.
    short: The capabilities supported on a device, the standards to which the device conforms for a particular purpose, and used for the communication

  - name: Device.specialization.systemType
    cardinality: 1..1
    type: CodeableConcept
    description: The standard that is used to operate and communicate.
    short: The standard that is used to operate and communicate

  - name: Device.specialization.version
    cardinality: 0..1
    type: string
    description: The version of the standard that is used to operate and communicate.
    short: The version of the standard that is used to operate and communicate

  - name: Device.version # R4 name, R5 renames to deviceVersion
    cardinality: 0..*
    type: BackboneElement
    description: The actual design of the device or software version running on the device.
    short: The actual design of the device or software version running on the device

  - name: Device.version.type # R4 path
    cardinality: 0..1
    type: CodeableConcept
    description: The type of the device version.
    short: The type of the device version

  - name: Device.version.component # R4 path
    cardinality: 0..1
    type: Identifier
    description: A single component of the device version.
    short: A single component of the device version

  - name: Device.version.value # R4 path
    cardinality: 1..1
    type: string
    description: The version text.
    short: The version text

  - name: Device.property
    cardinality: 0..*
    type: BackboneElement
    description: The actual configuration settings of a device as it actually operates, e.g., regulation status, time properties. Static or essentially fixed characteristics or features of the device (e.g., time or timing attributes, resolution, accuracy, intended use or instructions for use, and physical attributes) that are not otherwise captured in more specific attributes.
    short: Inherent, essentially fixed, characteristics of the device. e.g., time properties, size, material, etc.
    comments: Dynamic or current properties are described using DeviceMetric and recorded using Observation. Static characteristics could also be documented in DeviceDefinition.

  - name: Device.property.type
    cardinality: 1..1
    type: CodeableConcept
    description: Code that specifies the property being represented.
    short: Code that specifies the property being represented

  - name: Device.property.valueQuantity # Becomes value[x] in R5
    cardinality: 0..*
    type: Quantity # R4 only allows Quantity or CodeableConcept
    description: Property value as a quantity.
    short: Property value as a quantity

  - name: Device.property.valueCode # Becomes value[x] in R5
    cardinality: 0..*
    type: CodeableConcept # R4 only allows Quantity or CodeableConcept
    description: Property value as a code, e.g., NTP4 (synced to NTP).
    short: Property value as a code, e.g., NTP4 (synced to NTP)

  - name: Device.patient
    cardinality: 0..1
    type: Reference(Patient)
    description: Patient information, If the device is affixed to a person.
    short: Patient to whom Device is affixed

  - name: Device.owner
    cardinality: 0..1
    type: Reference(Organization)
    description: An organization that is responsible for the provision and ongoing maintenance of the device.
    short: Organization responsible for device

  - name: Device.contact
    cardinality: 0..*
    type: ContactPoint
    description: Contact details for an organization or a particular human that is responsible for the device.
    short: Details for human/organization for support
    comments: Used for troubleshooting etc.

  - name: Device.location
    cardinality: 0..1
    type: Reference(Location)
    description: The place where the device can be found.
    short: Where the device is found

  - name: Device.url
    cardinality: 0..1
    type: uri
    description: A network address on which the device may be contacted directly.
    short: Network address to contact device

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

  - name: Device.parent
    cardinality: 0..1
    type: Reference(Device)
    description: The parent device. The higher level or encompassing device that this device is a logical part of.
    short: The parent device
    comments: For example a vital signs monitor (parent) where three separate modules can be plugged into such as interchangeable blood pressure, oximeter, temperature modules. These modules are represented as devices with the .parent valued to the vital signs monitor when plugged in.

```

## Search Parameters

Search parameters defined for the R4 Device resource:

```yaml
searchParameters:
  - name: device-name
    type: string
    description: A server defined search that may match any of the string fields in Device.deviceName or Device.type.
    expression: Device.deviceName.name | Device.type.coding.display | Device.type.text
  - name: identifier
    type: token
    description: Instance id from manufacturer, owner, and others
    expression: Device.identifier
  - name: location
    type: reference
    description: A location, where the resource is found
    expression: Device.location
    targets: [Location]
  - name: manufacturer
    type: string
    description: The manufacturer of the device
    expression: Device.manufacturer
  - name: model # Based on R4 definition page
    type: string
    description: The model of the device
    expression: Device.modelNumber # Mapped to modelNumber in R4 elements
  - name: organization
    type: reference
    description: The organization responsible for the device
    expression: Device.owner
    targets: [Organization]
  - name: patient
    type: reference
    description: Patient information, if the resource is affixed to a person
    expression: Device.patient
    targets: [Patient]
  - name: status
    type: token
    description: active | inactive | entered-in-error | unknown
    expression: Device.status
  - name: type
    type: token
    description: The type of the device
    expression: Device.type
  - name: udi-carrier
    type: string
    description: UDI Barcode (RFID or other technology) string in *HRF* format.
    expression: Device.udiCarrier.carrierHRF
  - name: udi-di
    type: string
    description: The udi Device Identifier (DI)
    expression: Device.udiCarrier.deviceIdentifier
  - name: url
    type: uri
    description: Network address to contact device
    expression: Device.url
```

---