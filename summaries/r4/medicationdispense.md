Okay, here is the FHIR R4 MedicationDispense resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: MedicationDispense (R4)

```yaml
resource:
  name: MedicationDispense
  hl7_workgroup: Pharmacy
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
```

Indicates that a medication product is to be or has been dispensed for a named person/patient. This includes a description of the medication product (supply) provided and the instructions for administering the medication. The medication dispense is the result of a pharmacy system responding to a medication order.

## Background and Scope

*   **Purpose:** Covers the supply of medications to a patient, such as dispensing from pharmacies (outpatient/community/inpatient) or issuing ward stock. It represents the *event* of dispensing in response to a medication order.
*   **Workflow:** MedicationDispense is an event resource in the FHIR workflow model.
*   **Context:** The supply and administration instructions might differ slightly from the original order (e.g., due to dispenser judgment or details finalized during dispensing).
*   **Relationship to Other Resources:**
    *   `MedicationRequest`: The order for supply and administration instructions.
    *   `MedicationDispense`: Records the *provision* of the medication supply (often fulfilling a MedicationRequest).
    *   `MedicationAdministration`: Records the *actual consumption* or administration of the medication to the patient.
    *   `MedicationStatement`: A record of medication *belief* (taken/given), often reported by patient or clinician, not directly part of the order->dispense->administer flow.
*   **Scope Limitation:** Does not cover the supply of non-medication items.

## Resource Details

The following defines the core elements and constraints of the R4 MedicationDispense resource.

```yaml
elements:
  - name: MedicationDispense
    description: Indicates that a medication product is to be or has been dispensed for a named person/patient. This includes a description of the medication product (supply) provided and the instructions for administering the medication. The medication dispense is the result of a pharmacy system responding to a medication order.
    short: Dispensing a medication to a named patient
    type: DomainResource
    comments: The base resource definition.

  - name: MedicationDispense.identifier
    cardinality: 0..*
    type: Identifier
    description: Identifiers associated with this Medication Dispense that are defined by business processes and/or used to refer to it when a direct URL reference to the resource itself is not appropriate. They are business identifiers assigned to this resource by the performer or other systems and remain constant as the resource is updated and propagates from server to server.
    short: External identifier

  - name: MedicationDispense.partOf
    cardinality: 0..*
    type: Reference(Procedure)
    description: The procedure that trigger the dispense.
    short: Event that dispense is part of

  - name: MedicationDispense.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the state of the set of dispense events.
    short: preparation | in-progress | cancelled | on-hold | completed | entered-in-error | stopped | declined | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: MedicationDispense.statusReasonCodeableConcept
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the reason why a dispense was not performed.
    short: Why a dispense was not performed (code)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-status-reason
      strength: example
    comments: Choice of CodeableConcept or Reference for statusReason.

  - name: MedicationDispense.statusReasonReference
    cardinality: 0..1
    type: Reference(DetectedIssue)
    description: Indicates the reason why a dispense was not performed.
    short: Why a dispense was not performed (reference)
    comments: Choice of CodeableConcept or Reference for statusReason.

  - name: MedicationDispense.category
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the type of medication dispense (for example, where the medication is expected to be consumed or administered (i.e. inpatient or outpatient)).
    short: Type of medication dispense
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-category
      strength: preferred

  - name: MedicationDispense.medicationCodeableConcept
    flags: [Σ]
    cardinality: 1..1 # Cardinality is 1..1 for the choice medication[x]
    type: CodeableConcept
    description: Identifies the medication being administered. This is a simple attribute carrying a code that identifies the medication from a known list of medications.
    short: What medication was supplied (code)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: If only a code is specified, then it needs to be a code for a specific product. If more information is required, then the use of the medication Reference is recommended. Choice of CodeableConcept or Reference for medication.

  - name: MedicationDispense.medicationReference
    flags: [Σ]
    cardinality: 1..1 # Cardinality is 1..1 for the choice medication[x]
    type: Reference(Medication)
    description: Identifies the medication being administered. This is a link to a resource representing the details of the medication.
    short: What medication was supplied (reference)
    comments: For example, if you require form or lot number, then you must reference the Medication resource. Choice of CodeableConcept or Reference for medication.

  - name: MedicationDispense.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group)
    description: A link to a resource representing the person or the group to whom the medication will be given.
    short: Who the dispense is for

  - name: MedicationDispense.context
    cardinality: 0..1
    type: Reference(Encounter | EpisodeOfCare)
    description: The encounter or episode of care that establishes the context for this event.
    short: Encounter / Episode associated with event

  - name: MedicationDispense.supportingInformation
    cardinality: 0..*
    type: Reference(Any)
    description: Additional information that supports the medication being dispensed.
    short: Information that supports the dispensing of the medication

  - name: MedicationDispense.performer
    cardinality: 0..*
    type: BackboneElement
    description: Indicates who or what performed the event.
    short: Who performed event

  - name: MedicationDispense.performer.function
    cardinality: 0..1
    type: CodeableConcept
    description: Distinguishes the type of performer in the dispense. For example, date enterer, packager, final checker.
    short: Who performed the dispense and what they did
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationdispense-performer-function
      strength: example

  - name: MedicationDispense.performer.actor
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson)
    description: The device, practitioner, etc. who performed the action. It should be assumed that the actor is the dispenser of the medication.
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

  - name: MedicationDispense.type
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the type of dispensing event that is performed. For example, Trial Fill, Completion of Trial, Partial Fill, Emergency Fill, Samples, etc.
    short: Trial fill, partial fill, emergency fill, etc.
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

  - name: MedicationDispense.whenPrepared
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The time when the dispensed product was packaged and reviewed.
    short: When product was packaged and reviewed

  - name: MedicationDispense.whenHandedOver
    cardinality: 0..1
    type: dateTime
    description: The time the dispensed product was provided to the patient or their representative.
    short: When product was given out

  - name: MedicationDispense.destination
    cardinality: 0..1
    type: Reference(Location)
    description: Identification of the facility/location where the medication was shipped to, as part of the dispense event.
    short: Where the medication was sent

  - name: MedicationDispense.receiver
    cardinality: 0..*
    type: Reference(Patient | Practitioner)
    description: Identifies the person who picked up the medication. This will usually be a patient or their caregiver, but some cases exist where it can be a healthcare professional.
    short: Who collected the medication

  - name: MedicationDispense.note
    cardinality: 0..*
    type: Annotation
    description: Extra information about the dispense that could not be conveyed in the other attributes.
    short: Information about the dispense

  - name: MedicationDispense.dosageInstruction
    cardinality: 0..*
    type: Dosage
    description: Indicates how the medication is to be used by the patient.
    short: How the medication is to be used by the patient or administered by the caregiver

  - name: MedicationDispense.substitution
    cardinality: 0..1
    type: BackboneElement
    description: Indicates whether or not substitution was made as part of the dispense. In some cases, substitution will be expected but does not happen, in other cases substitution is not expected but does happen. This block explains what substitution did or did not happen and why. If nothing is specified, substitution was not done.
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
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole)
    description: The person or organization that has primary responsibility for the substitution.
    short: Who is responsible for the substitution

  - name: MedicationDispense.detectedIssue
    cardinality: 0..*
    type: Reference(DetectedIssue)
    description: Indicates an actual or potential clinical issue with or between one or more active or proposed clinical actions for a patient; e.g. drug-drug interaction, duplicate therapy, dosage alert etc.
    short: Clinical issue with action

  - name: MedicationDispense.eventHistory
    cardinality: 0..*
    type: Reference(Provenance)
    description: A summary of the events of interest that have occurred, such as when the dispense was verified.
    short: A list of relevant lifecycle events

constraints:
  - key: mdd-1
    severity: Rule
    location: (base)
    description: whenHandedOver cannot be before whenPrepared
    expression: whenHandedOver.empty() or whenPrepared.empty() or whenHandedOver >= whenPrepared
```

## Search Parameters

Search parameters defined for the R4 MedicationDispense resource:

```yaml
searchParameters:
  - name: code
    type: token
    description: Returns dispenses of this medicine code
    expression: (MedicationDispense.medication as CodeableConcept)
  - name: context
    type: reference
    description: Returns dispenses with a specific context (episode or episode of care)
    expression: MedicationDispense.context
    targets: [Encounter, EpisodeOfCare]
  - name: destination
    type: reference
    description: Returns dispenses that should be sent to a specific destination
    expression: MedicationDispense.destination
    targets: [Location]
  - name: identifier
    type: token
    description: Returns dispenses with this external identifier
    expression: MedicationDispense.identifier
  - name: medication
    type: reference
    description: Returns dispenses of this medicine resource
    expression: (MedicationDispense.medication as Reference)
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
    targets: [Device, Organization, Patient, Practitioner, PractitionerRole, RelatedPerson]
  - name: prescription
    type: reference
    description: The identity of a prescription to list dispenses from
    expression: MedicationDispense.authorizingPrescription
    targets: [MedicationRequest]
  - name: receiver
    type: reference
    description: The identity of a receiver to list dispenses for
    expression: MedicationDispense.receiver
    targets: [Patient, Practitioner]
  - name: responsibleparty
    type: reference
    description: Returns dispenses with the specified responsible party
    expression: MedicationDispense.substitution.responsibleParty
    targets: [Practitioner, PractitionerRole]
  - name: status
    type: token
    description: Returns dispenses with a specified dispense status
    expression: MedicationDispense.status
  - name: subject
    type: reference
    description: The identity of a patient for whom to list dispenses
    expression: MedicationDispense.subject
    targets: [Group, Patient]
  - name: type
    type: token
    description: Returns dispenses of a specific type
    expression: MedicationDispense.type
  - name: whenhandedover
    type: date
    description: Returns dispenses handed over on this date
    expression: MedicationDispense.whenHandedOver
  - name: whenprepared
    type: date
    description: Returns dispenses prepared on this date
    expression: MedicationDispense.whenPrepared
```