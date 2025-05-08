Okay, here is the Specimen resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided FHIR R4 HTML content.

---

# FHIR Resource: Specimen

```yaml
resource:
  name: Specimen
  hl7_workgroup: Orders and Observations
  maturity_level: 2 # Note: Detailed Description page shows 3, Content page shows 2. Using Content page value.
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Device
    - Group # Added based on Detailed Description page
    - Patient
    - Practitioner
```

A sample to be used for analysis.

## Background and Scope

The Specimen resource represents any material sample taken for testing, analysis, or investigation. This includes:

*   Samples taken from a biological entity (living or dead), such as cells, tissues, organs, body fluids, embryos, or excretory products.
*   Samples taken from a physical object or the environment.

**Scope:**

*   Covers substances used for diagnostic and environmental testing.
*   Focuses on the process of gathering, maintaining, and processing the specimen, as well as its origin.
*   Distinct from the `Substance` resource, which is used when collection, processing, and origin details are not relevant.

**Context & Limitations (from R4 page):**

*   The R4 definition includes basic information about specimen containers.
*   It does *not* fully address the recursive nature of containers (e.g., tube in tray in rack) or the tracking of container location within parent containers. The level of detail needed for tracking may vary (e.g., general lab vs. bio-banking).

This resource is referenced by `DiagnosticReport`, `ImagingStudy`, `Media`, `MolecularSequence`, `Observation`, `ServiceRequest`, and `Specimen` itself.

## Resource Details

The following defines the core elements and constraints of the Specimen resource based on FHIR R4.

```yaml
elements:
  - name: Specimen
    description: A sample to be used for analysis.
    short: Sample for analysis
    type: DomainResource

  - name: Specimen.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Id for specimen.
    short: External Identifier

  - name: Specimen.accessionIdentifier
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: The identifier assigned by the lab when accessioning specimen(s). This is not necessarily the same as the specimen identifier, depending on local lab procedures.
    short: Identifier assigned by the lab

  - name: Specimen.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: The availability of the specimen.
    short: available | unavailable | unsatisfactory | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-status|4.0.1 # Version added for R4 specificity
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid.

  - name: Specimen.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of material that forms the specimen.
    short: Kind of material that forms the specimen
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0487 # Changed from relative path
      strength: example
    comments: The type can change the way that a specimen is handled and drives what kind of analyses can properly be performed on the specimen. It is frequently used in diagnostic work flow decision making systems.

  - name: Specimen.subject
    flags: [Σ]
    cardinality: 0..1 # R4 changed from 1..1 in R3
    type: Reference(Patient | Group | Device | Substance | Location | BiologicallyDerivedProduct | NutritionProduct) # Added types based on detailed page
    description: Where the specimen came from. This may be from patient(s), from a location (e.g., the source of an environmental sample), or a sampling of a substance, a biologically-derived product, or a device.
    short: Where the specimen came from (patient, location, substance, device, etc.)
    requirements: Must know the subject context.

  - name: Specimen.receivedTime
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: Time when specimen is received by the testing laboratory for processing or testing.
    short: The time when specimen is received by the testing laboratory

  - name: Specimen.parent
    cardinality: 0..*
    type: Reference(Specimen)
    description: Reference to the parent (source) specimen which is used when the specimen was either derived from or a component of another specimen.
    short: Specimen from which this specimen originated
    comments: The parent specimen could be the source from which the current specimen is derived by some processing step (e.g. an aliquot or isolate or extracted nucleic acids from clinical samples) or one of many specimens that were combined to create a pooled sample.

  - name: Specimen.request
    cardinality: 0..*
    type: Reference(ServiceRequest) # R4 changed from ProcedureRequest
    description: Details concerning a service request that required a specimen to be collected.
    short: Why the specimen was collected
    comments: The request may be explicit or implied such with a ServiceRequest that requires a blood draw.

  # R5 Elements added for completeness based on detailed descriptions, adjust if strictly R4 desired
  - name: Specimen.combined
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: This element signifies if the specimen is part of a group or pooled.
    short: grouped | pooled
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-combined
      strength: required

  - name: Specimen.role
    cardinality: 0..*
    type: CodeableConcept
    description: The role or reason for the specimen in the testing workflow.
    short: The role the specimen serves
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-role
      strength: preferred

  - name: Specimen.feature
    cardinality: 0..*
    type: BackboneElement
    description: A physical feature or landmark on a specimen, highlighted for context by the collector of the specimen (e.g. surgeon), that identifies the type of feature as well as its meaning (e.g. the red ink indicating the resection margin of the right lobe of the excised prostate tissue or wire loop at radiologically suspected tumor location).
    short: The physical feature of a specimen

  - name: Specimen.feature.type
    cardinality: 1..1
    type: CodeableConcept
    description: The landmark or feature being highlighted.
    short: Highlighted feature
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example

  - name: Specimen.feature.description
    cardinality: 1..1
    type: string
    description: Description of the feature of the specimen.
    short: Information about the feature
  # End of R5-specific elements that might be present in the build version

  - name: Specimen.collection
    cardinality: 0..1
    type: BackboneElement
    description: Details concerning the specimen collection.
    short: Collection details

  - name: Specimen.collection.collector
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson) # Added Org, Patient, RelatedPerson based on detailed page
    description: Person or entity who collected the specimen.
    short: Who collected the specimen

  - name: Specimen.collection.collected[x]
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period
    description: Time when specimen was collected from subject - the physiologically relevant time.
    short: Collection time

  - name: Specimen.collection.duration
    flags: [Σ]
    cardinality: 0..1
    type: Duration
    description: The span of time over which the collection of a specimen occurred.
    short: How long it took to collect specimen

  - name: Specimen.collection.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The quantity of specimen collected; for instance the volume of a blood sample, or the physical measurement of an anatomic pathology sample.
    short: The quantity of specimen collected

  - name: Specimen.collection.method
    cardinality: 0..1
    type: CodeableConcept
    description: A coded value specifying the technique that is used to perform the procedure.
    short: Technique used to perform collection
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-collection-method
      strength: example

  - name: Specimen.collection.device # Added based on detailed page
    cardinality: 0..1
    type: CodeableReference(Device)
    description: A coded value specifying the device that is used to perform the procedure.
    short: Device used to perform collection
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-collection-device # Placeholder ValueSet name
      strength: unbound # Assuming unbound based on text

  - name: Specimen.collection.procedure # Added based on detailed page
    cardinality: 0..1
    type: Reference(Procedure)
    description: The procedure event during which the specimen was collected (e.g. the surgery leading to the collection of a pathology sample).
    short: The procedure that collects the specimen

  - name: Specimen.collection.bodySite
    cardinality: 0..1
    type: CodeableReference(BodyStructure) # Changed type based on detailed page
    description: Anatomical location from which the specimen was collected (if subject is a patient). This is the target site. This element is not used for environmental specimens.
    short: Anatomical collection site
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example
    comments: Reasons for using BodyStructure reference include: 1.) Need to identify a specific site instance (e.g. a specific mole), 2.) a single pre-coordinated coded concept for the body site does not exist, 3.) a desire to represent bodySite using multiple attributes (e.g. modifiers).

  - name: Specimen.collection.fastingStatus[x]
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept | Duration
    description: Abstinence or reduction from some or all food, drink, or both, for a period of time prior to sample collection.
    short: Whether or how long patient abstained from food and/or drink
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0916 # Changed from relative path
      strength: extensible
    requirements: Many diagnostic tests require fasting to facilitate accurate interpretation.
    comments: Representing fasting status using this element is preferred to representing it with an observation using a 'pre-coordinated code' or using a component observation.

  - name: Specimen.processing
    cardinality: 0..*
    type: BackboneElement
    description: Details concerning processing and processing steps for the specimen.
    short: Processing and processing step details

  - name: Specimen.processing.description
    cardinality: 0..1
    type: string
    description: Textual description of procedure.
    short: Textual description of procedure

  - name: Specimen.processing.method # Changed from .procedure in R4 HTML structure view, aligning with detailed description page
    cardinality: 0..1
    type: CodeableConcept
    description: A coded value specifying the method used to process the specimen.
    short: Indicates the treatment step applied to the specimen
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/specimen-processing-method # Adjusted name based on detailed page
      strength: example

  - name: Specimen.processing.performer # Added based on detailed page
    flags: [Σ] # Assuming summary based on similar elements
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson)
    description: The performer of the processing of the specimen.
    short: Entity processing specimen

  - name: Specimen.processing.device # Added based on detailed page
    cardinality: 0..1
    type: Reference(Device)
    description: The device used in the processing of the specimen.
    short: Device used to process the specimen

  - name: Specimen.processing.additive
    cardinality: 0..*
    type: Reference(Substance)
    description: Material used in the processing step.
    short: Material used in the processing step

  - name: Specimen.processing.time[x]
    cardinality: 0..1
    type: dateTime | Period | Duration # Added Duration based on detailed page
    description: A record of the time or period when the specimen processing occurred. For example the time of sample fixation or the period of time the sample was in formalin.
    short: Date and time of specimen processing

  - name: Specimen.container
    cardinality: 0..*
    type: BackboneElement
    description: The container holding the specimen. The recursive nature of containers; i.e. blood in tube in tray in rack is not addressed here.
    short: Direct container of specimen (tube/slide, etc.)

  - name: Specimen.container.device # Changed from identifier+description+type+capacity based on detailed description page
    cardinality: 1..1
    type: Reference(Device)
    description: The device resource for the the container holding the specimen. If the container is in a holder then the referenced device will point to a parent device.
    short: Device resource for the container

  - name: Specimen.container.specimenQuantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The quantity of specimen in the container; may be volume, dimensions, or other appropriate measurements, depending on the specimen type.
    short: Quantity of specimen within container

  - name: Specimen.condition
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A mode or state of being that describes the nature of the specimen.
    short: State of the specimen
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0493 # Changed from relative path
      strength: extensible
    requirements: The specimen condition can be used to assess its quality or appropriateness for a specific test.
    comments: Specimen condition is an observation made about the specimen. It's a point-in-time assessment.

  - name: Specimen.note
    cardinality: 0..*
    type: Annotation
    description: To communicate any details or issues about the specimen or during the specimen collection. (for example: broken vial, sent with patient, frozen).
    short: Comments
```

```yaml
constraints:
  - key: spm-1
    severity: Rule
    location: Specimen.collection
    description: Specimen.collection.collector SHALL only be present if Specimen.collection.procedure is not present
    expression: collector.empty() or procedure.empty()
```

## Search Parameters

Search parameters defined for the Specimen resource in FHIR R4:

```yaml
searchParameters:
  - name: accession
    type: token
    description: The accession number associated with the specimen
    expression: Specimen.accessionIdentifier
  - name: bodysite
    type: token
    description: The code for the body site from where the specimen originated
    expression: Specimen.collection.bodySite # Note: R4 HTML expression. Might need adjustment if using CodeableReference target BodyStructure.
  - name: collected
    type: date
    description: The date the specimen was collected
    expression: Specimen.collection.collected
  - name: collector
    type: reference
    description: Who collected the specimen
    expression: Specimen.collection.collector
    targets: [Practitioner, PractitionerRole, Organization, Patient, RelatedPerson] # Updated targets based on element definition
  - name: container
    type: token
    description: The kind of specimen container (per R4 HTML, points to container.type which is removed in favour of container.device in detailed view)
    # expression: Specimen.container.type # R4 HTML expression, likely outdated by detailed view model
    expression: Specimen.container.device.type # More likely expression based on detailed view model, needs confirmation
  - name: container-id
    type: token
    description: The unique identifier associated with the specimen container (per R4 HTML, points to container.identifier which is removed in favour of container.device in detailed view)
    # expression: Specimen.container.identifier # R4 HTML expression, likely outdated by detailed view model
    expression: Specimen.container.device.identifier # More likely expression based on detailed view model, needs confirmation
  - name: identifier
    type: token
    description: The unique identifier associated with the specimen
    expression: Specimen.identifier
  - name: parent
    type: reference
    description: The parent of the specimen
    expression: Specimen.parent
    targets: [Specimen]
  - name: patient
    type: reference
    description: The patient the specimen comes from
    expression: Specimen.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: status
    type: token
    description: available | unavailable | unsatisfactory | entered-in-error
    expression: Specimen.status
  - name: subject
    type: reference
    description: The subject of the specimen
    expression: Specimen.subject
    targets: [Patient, Group, Device, Substance, Location, BiologicallyDerivedProduct, NutritionProduct] # Updated targets based on element definition
  - name: type
    type: token
    description: The specimen type
    expression: Specimen.type

```