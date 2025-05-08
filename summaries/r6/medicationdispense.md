Okay, here is the MedicationDispense resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided HTML content for FHIR R6/Build.

---

# FHIR Resource: MedicationDispense

```yaml
resource:
  name: MedicationDispense
  hl7_workgroup: Pharmacy
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Group
    - Patient
    - Practitioner
```

Indicates that a medication product is to be or has been dispensed for a named person/patient. This includes a description of the medication product (supply) provided and the instructions for administering the medication. The medication dispense is the result of a pharmacy system responding to a medication order.

## Background and Scope

This resource covers the supply of medications to a patient across various settings, including outpatient/community pharmacy dispensing and pickup, inpatient pharmacy dispensing to wards, and single-dose issues from ward stock. It represents an *event* in the FHIR workflow, often resulting from a `MedicationRequest`.

Key aspects include:

*   **Relationship to Other Resources:**
    *   `MedicationRequest`: An order for supply and administration instructions. `MedicationDispense` often fulfills this.
    *   `MedicationAdministration`: Records the actual consumption or administration of the medication.
    *   `MedicationStatement`: A record of medication usage based on patient or clinician reports, distinct from the direct prescribe -> dispense -> administer workflow.
*   **Dispense vs. Order:** The dispensed medication and instructions might differ from the original `MedicationRequest` due to details finalized during dispensing or clinical modifications made by the dispenser.
*   **Not for Non-Medication Items:** This resource specifically handles medication supply, not other items.
*   **Workflow:** It's considered an <a href="https://build.fhir.org/workflow.html#event">Event Resource</a>.

## Resource Details

The following defines the core elements and constraints of the MedicationDispense resource.

```yaml
elements:
  - name: MedicationDispense
    description: Indicates that a medication product is to be or has been dispensed for a named person/patient.  This includes a description of the medication product (supply) provided and the instructions for administering the medication.  The medication dispense is the result of a pharmacy system responding to a medication order.
    short: Dispensing a medication to a named patient
    type: DomainResource
    comments: The base resource definition.

  - name: MedicationDispense.identifier
    cardinality: 0..*
    type: Identifier
    description: Identifiers associated with this Medication Dispense that are defined by business processes and/or used to refer to it when a direct URL reference to the resource itself is not appropriate. They are business identifiers assigned to this resource by the performer or other systems and remain constant as the resource is updated and propagates from server to server.
    short: External identifier
    comments: This is a business identifier, not a resource identifier.

  - name: MedicationDispense.basedOn
    cardinality: 0..*
    type: Reference(CarePlan)
    description: A plan that is fulfilled in whole or in part by this MedicationDispense.
    short: Plan that is fulfilled by this dispense

  - name: MedicationDispense.partOf
    cardinality: 0..*
    type: Reference(Procedure | MedicationAdministration)
    description: The procedure or medication administration that triggered the dispense.
    short: Event that dispense is part of
    comments: While both a procedure and a medication administration may have triggered the dispense, but it is not expected that multiple procedures and/or multiple medication administrations would be triggers.

  - name: MedicationDispense.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the state of the set of dispense events.
    short: preparation | in-progress | cancelled | on-hold | completed | entered-in-error | stopped | declined | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid.

  - name: MedicationDispense.notPerformedReason
    cardinality: 0..1
    type: CodeableReference(DetectedIssue)
    description: Indicates the reason why a dispense was not performed.
    short: Why a dispense was not performed
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-status-reason
      strength: example

  - name: MedicationDispense.statusChanged
    cardinality: 0..1
    type: dateTime
    description: The date (and maybe time) when the status of the dispense record changed.
    short: When the status changed

  - name: MedicationDispense.category
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates the type of medication dispense (for example, drug classification like ATC, where meds would be administered, legal category of the medication.).
    short: Type of medication dispense
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-admin-location
      strength: example
    comments: The category can be used to include where the medication is expected to be consumed or other types of dispenses.  Invariants can be used to bind to different value sets when profiling to bind.

  - name: MedicationDispense.medication
    flags: [Σ]
    cardinality: 1..1
    type: CodeableReference(Medication)
    description: Identifies the medication supplied. This is either a link to a resource representing the details of the medication or a simple attribute carrying a code that identifies the medication from a known list of medications.
    short: What medication was supplied
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: If only a code is specified, then it needs to be a code for a specific product. If more information is required, then the use of the medication resource is recommended.  For example, if you require form or lot number, then you must reference the Medication resource.

  - name: MedicationDispense.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: A link to a resource representing the person or the group to whom the medication will be given.
    short: Who the dispense is for
    comments: SubstanceAdministration->subject->Patient.

  - name: MedicationDispense.encounter
    cardinality: 0..1
    type: Reference(Encounter)
    description: The encounter that establishes the context for this event.
    short: Encounter associated with event

  - name: MedicationDispense.supportingInformation
    cardinality: 0..*
    type: Reference(Any)
    description: Additional information that supports the medication being dispensed.  For example, there may be requirements that a specific lab test has been completed prior to dispensing or the patient's weight at the time of dispensing is documented.
    short: Information that supports the dispensing of the medication

  - name: MedicationDispense.performer
    cardinality: 0..*
    type: BackboneElement
    description: Indicates who or what performed the event.
    short: Who performed event

  - name: MedicationDispense.performer.function
    cardinality: 0..1
    type: CodeableConcept
    description: Distinguishes the type of performer in the dispense.  For example, date enterer, packager, final checker.
    short: Who performed the dispense and what they did
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-performer-function
      strength: example
    requirements: Allows disambiguation of the types of involvement of different performers.

  - name: MedicationDispense.performer.actor
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam | Group)
    description: The device, practitioner, etc. who performed the action.  It should be assumed that the actor is the dispenser of the medication.
    short: Individual who was performing

  - name: MedicationDispense.location
    cardinality: 0..1
    type: Reference(Location)
    description: The principal physical location where the dispense was performed.
    short: Where the dispense occurred

  - name: MedicationDispense.authorizingPrescription
    cardinality: 0..*
    type: Reference(MedicationRequest)
    description: Indicates the medication order that is being dispensed against.
    short: Medication order that authorizes the dispense
    comments: Maps to basedOn in Event logical model.

  - name: MedicationDispense.type
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the type of dispensing event that is performed. For example, Trial Fill, Completion of Trial, Partial Fill, Emergency Fill, Samples, etc.
    short: Trial fill, partial fill, emergency fill, etc
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ActPharmacySupplyType
      strength: example

  - name: MedicationDispense.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The amount of medication that has been dispensed. Includes unit of measure.
    short: Amount dispensed

  - name: MedicationDispense.daysSupply
    cardinality: 0..1
    type: SimpleQuantity
    description: The amount of medication expressed as a timing amount.
    short: Amount of medication expressed as a timing amount

  - name: MedicationDispense.fillNumber
    cardinality: 0..1
    type: positiveInt
    description: Represents the known number of the fill over the entire lifetime of the prescription, i.e. if this is the first dispense by this pharmacy but the third fill overall, then the fillNumber will be 3.  Each fill number represents one dispensation, even if that dispensation is not for the full quantity.  Partial fills are not represented by decimal quantities, i.e., a partial fill of 40 tablets (full quantity is 100 tablets) adds 1 to the prior fill number, not 0.4.
    short: A number that represents the known fill this dispense represents
    comments: This element may be inaccurate as it relies on the dispensing pharmacy to be aware of all fills that have occurred for the request.

  - name: MedicationDispense.recorded
    cardinality: 0..1
    type: dateTime
    description: The date the occurrence of the MedicationDispense was first captured in the system.
    short: When the recording of the dispense started

  - name: MedicationDispense.whenPrepared
    flags: [Σ, C]
    cardinality: 0..1
    type: dateTime
    description: The time when the dispensed product was packaged and reviewed.
    short: When product was packaged and reviewed

  - name: MedicationDispense.whenHandedOver
    flags: [C]
    cardinality: 0..1
    type: dateTime
    description: The time the dispensed product was provided to the patient or their representative.
    short: When product was given out

  - name: MedicationDispense.destination
    cardinality: 0..1
    type: Reference(Location)
    description: Identification of the facility/location where the medication was/will be shipped to, as part of the dispense event.
    short: Where the medication was/will be sent

  - name: MedicationDispense.receiver
    cardinality: 0..*
    type: Reference(Patient | Practitioner | RelatedPerson | Location | PractitionerRole | Group)
    description: Identifies the person who picked up the medication or the location of where the medication was delivered.  This will usually be a patient or their caregiver, but some cases exist where it can be a healthcare professional or a location.
    short: Who collected the medication or where the medication was delivered

  - name: MedicationDispense.note
    cardinality: 0..*
    type: Annotation
    description: Extra information about the dispense that could not be conveyed in the other attributes.
    short: Information about the dispense

  - name: MedicationDispense.renderedDosageInstruction
    cardinality: 0..1
    type: markdown
    description: The full representation of the dose of the medication included in all dosage instructions.  To be used when multiple dosage instructions are included to represent complex dosing such as increasing or tapering doses.
    short: Full representation of the dosage instructions
    comments: The content of the renderedDosageInstructions must not be different than the dose represented in the dosageInstruction content.

  - name: MedicationDispense.dosageInstruction
    cardinality: 0..*
    type: Dosage
    description: Indicates how the medication is to be used by the patient.
    short: How the medication is to be used by the patient or administered by the caregiver
    comments: When the dose or rate is intended to change over the entire administration period (e.g. Tapering dose prescriptions), multiple instances of dosage instructions will need to be supplied to convey the different doses/rates. The pharmacist reviews the medication order prior to dispense and updates the dosageInstruction based on the actual product being dispensed.

  - name: MedicationDispense.substitution
    cardinality: 0..1
    type: BackboneElement
    description: Indicates whether or not substitution was made as part of the dispense.  In some cases, substitution will be expected but does not happen, in other cases substitution is not expected but does happen.  This block explains what substitution did or did not happen and why.  If nothing is specified, substitution was not done.
    short: Whether a substitution was performed on the dispense

  - name: MedicationDispense.substitution.wasSubstituted
    cardinality: 1..1
    type: boolean
    description: True if the dispenser dispensed a different drug or product from what was prescribed.
    short: Whether a substitution was or was not performed on the dispense

  - name: MedicationDispense.substitution.type
    cardinality: 0..1
    type: CodeableConcept
    description: A code signifying whether a different drug was dispensed from what was prescribed.
    short: Code signifying whether a different drug was dispensed from what was prescribed
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ActSubstanceAdminSubstitutionCode
      strength: example

  - name: MedicationDispense.substitution.reason
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates the reason for the substitution (or lack of substitution) from what was prescribed.
    short: Why was substitution made
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-SubstanceAdminSubstitutionReason
      strength: example

  - name: MedicationDispense.substitution.responsibleParty
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization)
    description: The person or organization that has primary responsibility for the substitution.
    short: Who is responsible for the substitution

  - name: MedicationDispense.eventHistory
    cardinality: 0..*
    type: Reference(Provenance)
    description: A summary of the events of interest that have occurred, such as when the dispense was verified.
    short: A list of relevant lifecycle events
    comments: This might not include provenances for all versions of the request – only those deemed “relevant” or important. This SHALL NOT include the Provenance associated with this current version of the resource. (If that provenance is deemed to be a “relevant” change, it will need to be added as part of a later update. Until then, it can be queried directly as the Provenance that points to this version using _revinclude All Provenances should have some historical version of this Request as their subject.).

constraints:
  - key: mdd-1
    severity: Rule
    location: MedicationDispense # (base) in HTML implies the root
    description: whenHandedOver cannot be before whenPrepared
    expression: (whenHandedOver.hasValue() and whenPrepared.hasValue()) implies whenHandedOver >= whenPrepared

```

## Search Parameters

Search parameters defined for the MedicationDispense resource:

```yaml
searchParameters:
  - name: code
    type: token
    description: Returns dispenses of this medicine code
    expression: MedicationDispense.medication.concept
    # targets implicitly based on type
  - name: destination
    type: reference
    description: Returns dispenses that should be sent to a specific destination
    expression: MedicationDispense.destination
    targets: [Location]
  - name: encounter
    type: reference
    description: Returns dispenses with a specific encounter
    expression: MedicationDispense.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: Returns dispenses with this external identifier
    expression: MedicationDispense.identifier
    # targets implicitly based on type
  - name: location
    type: reference
    description: Returns dispense for a given location
    expression: MedicationDispense.location
    targets: [Location]
  - name: medication
    type: reference
    description: Returns dispenses of this medicine resource
    expression: MedicationDispense.medication.reference
    targets: [Medication]
  - name: patient
    type: reference
    description: The identity of a patient to list dispenses for
    expression: MedicationDispense.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Returns dispenses performed by a specific individual
    expression: MedicationDispense.performer.actor
    targets: [Practitioner, PractitionerRole, Organization, Patient, Device, RelatedPerson, CareTeam, Group] # Derived from element definition
  - name: prescription
    type: reference
    description: The identity of a prescription to list dispenses from
    expression: MedicationDispense.authorizingPrescription
    targets: [MedicationRequest]
  - name: receiver
    type: reference
    description: The identity of a receiver to list dispenses for
    expression: MedicationDispense.receiver
    targets: [Patient, Practitioner, RelatedPerson, Location, PractitionerRole, Group] # Derived from element definition
  - name: recorded
    type: date
    description: Returns dispenses where dispensing activity began on this date
    expression: MedicationDispense.recorded
    # targets implicitly based on type
  - name: responsibleparty
    type: reference
    description: Returns dispenses with the specified responsible party
    expression: MedicationDispense.substitution.responsibleParty
    targets: [Practitioner, PractitionerRole, Organization] # Derived from element definition
  - name: status
    type: token
    description: Returns dispenses with a specified dispense status
    expression: MedicationDispense.status
    # targets implicitly based on type
  - name: subject
    type: reference
    description: The identity of a patient for whom to list dispenses
    expression: MedicationDispense.subject
    targets: [Patient, Group] # Derived from element definition
  - name: type
    type: token
    description: Returns dispenses of a specific type
    expression: MedicationDispense.type
    # targets implicitly based on type
  - name: whenhandedover
    type: date
    description: Returns dispenses handed over on this date
    expression: MedicationDispense.whenHandedOver
    # targets implicitly based on type
  - name: whenprepared
    type: date
    description: Returns dispenses prepared on this date
    expression: MedicationDispense.whenPrepared
    # targets implicitly based on type

```