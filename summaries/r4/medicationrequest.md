Okay, here is the FHIR R4 MedicationRequest resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: MedicationRequest (R4)

```yaml
resource:
  name: MedicationRequest
  hl7_workgroup: Pharmacy
  maturity_level: 3 # Note: R4 page says 3, R5 page says 4 for R5 version
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Patient
    - Practitioner
    - Group # Added based on definitions page listing
```

An order or request for both supply of the medication and the instructions for administration of the medication to a patient. The resource is called "MedicationRequest" rather than "MedicationPrescription" or "MedicationOrder" to generalize the use across inpatient and outpatient settings, including care plans, etc., and to harmonize with workflow patterns.

## Background and Scope

This resource covers various medication orders, including inpatient, community/outpatient (prescriptions), over-the-counter (OTC) recommendations, total parenteral nutrition (TPN), and diet/vitamin supplements. It can also support ordering medication-related devices but is not intended for diets or non-medication items like supplies. It may also represent orders reported from external systems for informational purposes (not authoritative or actionable).

Key aspects include:

*   **Workflow:** MedicationRequest is a "request" resource in the FHIR workflow context.
*   **Single Medication:** Each instance requests only a single medication. Multiple medications require multiple MedicationRequest instances, potentially linked via `groupIdentifier` or through a `RequestOrchestration`.
*   **Relationship to Other Resources:**
    *   Use `SupplyRequest` or `DeviceRequest` for supplies/devices focused on logistics or when administration instructions aren't the primary focus.
    *   Use `MedicationStatement` for reporting historical or current medication usage (not the order itself).
    *   The typical medication lifecycle involves `MedicationRequest` -> `MedicationDispense` -> `MedicationAdministration`.
*   **Reporting vs. Ordering:** The `reported[x]` element distinguishes records captured as secondary reports versus primary, actionable orders. The `informationSource` element (in R5, inferred context in R4) can indicate who reported the information if not the requester.
*   **Dosage Instructions:** Can be complex. The `dosageInstruction` element (using the `Dosage` datatype) provides structured details. Free text instructions (`dosageInstruction.text`) can supplement or handle complexity. The `renderedDosageInstruction` (R5) element provides a consolidated textual representation for complex dosing patterns.

## Resource Details

The following defines the core elements of the MedicationRequest resource based on FHIR R4.

```yaml
elements:
  - name: MedicationRequest
    description: An order or request for both supply of the medication and the instructions for administration of the medication to a patient. The resource is called "MedicationRequest" rather than "MedicationPrescription" or "MedicationOrder" to generalize the use across inpatient and outpatient settings, including care plans, etc., and to harmonize with workflow patterns.
    short: Ordering of medication for patient or group
    type: DomainResource
    comments: The base resource definition.

  - name: MedicationRequest.identifier
    cardinality: 0..*
    type: Identifier
    description: Identifiers associated with this medication request that are defined by business processes and/or used to refer to it when a direct URL reference to the resource itself is not appropriate. They are business identifiers assigned to this resource by the performer or other systems and remain constant as the resource is updated and propagates from server to server.
    short: External ids for this request
    comments: This is a business identifier, not a resource identifier.

  - name: MedicationRequest.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the current state of the order. Generally, this will be active or completed state.
    short: active | on-hold | cancelled | completed | entered-in-error | stopped | draft | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid. Clinical decision support systems should take the status into account.

  - name: MedicationRequest.statusReason
    cardinality: 0..1
    type: CodeableConcept
    description: Captures the reason for the current state of the MedicationRequest.
    short: Reason for current status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-status-reason
      strength: example
    comments: Generally used for "exception" statuses like 'stopped' or 'cancelled'. The reason the request was created is in 'reasonCode' or 'reasonReference'.

  - name: MedicationRequest.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Whether the request is a proposal, plan, or an original order.
    short: proposal | plan | order | original-order | reflex-order | filler-order | instance-order | option
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-intent|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of other elements (e.g., proposal vs. order affects timing, performer authorization).
    comments: Defines the kind of request, influencing expectations (e.g., only Practitioners typically create 'order' intents). An 'instance-order' might populate a MAR.

  - name: MedicationRequest.category
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates the type of medication request (for example, where the medication is expected to be consumed or administered (i.e. inpatient or outpatient)).
    short: Type of medication usage
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-category
      strength: example
    comments: Used for categorization like administration setting (inpatient/outpatient) or legal category.

  - name: MedicationRequest.priority
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Indicates how quickly the Medication Request should be addressed with respect to other requests.
    short: routine | urgent | asap | stat
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-priority|4.0.1
      strength: required

  - name: MedicationRequest.doNotPerform
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: If true indicates that the provider is asking for the medication request not to occur.
    short: True if request is prohibiting action
    isModifier: true
    modifierReason: If true, this element negates the request to occur.
    comments: If not specified, the request is positive ("do perform"). If true, existing active orders for the same med should be cancelled/ended.

  - name: MedicationRequest.reportedBoolean
    flags: [Σ]
    cardinality: 0..1 # Choice: reported[x] = reportedBoolean | reportedReference
    type: boolean
    description: Indicates if this record was captured as a secondary 'reported' record rather than as an original primary source-of-truth record.
    short: Reported rather than primary record - boolean flag

  - name: MedicationRequest.reportedReference
    flags: [Σ]
    cardinality: 0..1 # Choice: reported[x] = reportedBoolean | reportedReference
    type: Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization)
    description: Indicates if this record was captured as a secondary 'reported' record rather than as an original primary source-of-truth record. It may also indicate the source of the report.
    short: Reported rather than primary record - source reference

  - name: MedicationRequest.medicationCodeableConcept
    flags: [Σ]
    cardinality: 1..1 # Choice: medication[x] = medicationCodeableConcept | medicationReference
    type: CodeableConcept
    description: Identifies the medication being requested. This is a link to a resource that represents the medication which may be the details of the medication or simply an attribute carrying a code that identifies the medication from a known list of medications.
    short: Medication to be taken (coded concept)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes # Note R4 uses SNOMED CT example binding here
      strength: example
    comments: Use MedicationReference if details like form, lot number, or compounding are needed.

  - name: MedicationRequest.medicationReference
    flags: [Σ]
    cardinality: 1..1 # Choice: medication[x] = medicationCodeableConcept | medicationReference
    type: Reference(Medication)
    description: Identifies the medication being requested. This is a link to a resource that represents the medication which may be the details of the medication or simply an attribute carrying a code that identifies the medication from a known list of medications.
    short: Medication to be taken (resource reference)
    comments: Use MedicationReference if details like form, lot number, or compounding are needed.

  - name: MedicationRequest.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: A link to a resource representing the person or set of individuals to whom the medication will be given.
    short: Who or group medication request is for
    comments: Mandatory. Use anonymized subject if actual subject isn't provided in secondary use cases.

  - name: MedicationRequest.encounter
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this [x] was created or to which the creation of this record is tightly associated.
    short: Encounter created as part of encounter/admission/stay
    comments: Typically the encounter where the event occurred. Link to EpisodeOfCare via extension if needed.

  - name: MedicationRequest.supportingInformation
    cardinality: 0..*
    type: Reference(Any)
    description: Include additional information (for example, patient height and weight) that supports the ordering of the medication.
    short: Information to support ordering of the medication
    comments: Can reference relevant MedicationStatements, observations (height/weight), etc.

  - name: MedicationRequest.authoredOn
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The date (and perhaps time) when the prescription was initially written or authored on.
    short: When request was initially authored

  - name: MedicationRequest.requester
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device)
    description: The individual, organization, or device that initiated the request and has responsibility for its activation.
    short: Who/What requested the Request

  - name: MedicationRequest.performer
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson | CareTeam)
    description: The specified desired performer of the medication treatment (e.g. the performer of the medication administration).
    short: Intended performer of administration

  - name: MedicationRequest.performerType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the type of performer of the administration of the medication.
    short: Desired kind of performer of the medication administration
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/performer-role
      strength: example
    comments: Specifies required performer type if performer isn't named, or requirements if named performer is unavailable.

  - name: MedicationRequest.recorder
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole)
    description: The person who entered the order on behalf of another individual for example in the case of a verbal or a telephone order.
    short: Person who entered the request

  - name: MedicationRequest.reasonCode
    cardinality: 0..*
    type: CodeableConcept
    description: The reason or the indication for ordering or not ordering the medication.
    short: Reason or indication for ordering or not ordering the medication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code
      strength: example
    comments: This is the clinical indication. Use reasonReference for a full Condition or Observation resource link.

  - name: MedicationRequest.reasonReference
    cardinality: 0..*
    type: Reference(Condition | Observation)
    description: Condition or observation that supports why the medication was ordered.
    short: Condition or observation that supports why the prescription is being written

  - name: MedicationRequest.instantiatesCanonical
    flags: [Σ]
    cardinality: 0..*
    type: canonical(ActivityDefinition | PlanDefinition) # Added potential targets based on typical usage
    description: The URL pointing to a protocol, guideline, orderset, or other definition that is adhered to in whole or in part by this MedicationRequest.
    short: Instantiates FHIR protocol or definition

  - name: MedicationRequest.instantiatesUri
    flags: [Σ]
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, orderset or other definition that is adhered to in whole or in part by this MedicationRequest.
    short: Instantiates external protocol or definition

  - name: MedicationRequest.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation)
    description: A plan or request that is fulfilled in whole or in part by this medication request.
    short: What request fulfills

  - name: MedicationRequest.groupIdentifier
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: A shared identifier common to all requests that were authorized more or less simultaneously by a single author, representing the identifier of the requisition or prescription.
    short: Composite request this is part of
    comments: Links requests ordered together (e.g., single prescription form with multiple meds).

  - name: MedicationRequest.courseOfTherapyType
    cardinality: 0..1
    type: CodeableConcept
    description: The description of the overall pattern of the administration of the medication to the patient.
    short: Overall pattern of medication administration
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-course-of-therapy
      strength: example
    comments: E.g., "continuous", "acute", "seasonal". Not the same as a protocol.

  - name: MedicationRequest.insurance
    cardinality: 0..*
    type: Reference(Coverage | ClaimResponse)
    description: Insurance plans, coverage extensions, pre-authorizations and/or pre-determinations that may be required for delivering the requested service.
    short: Associated insurance coverage

  - name: MedicationRequest.note
    cardinality: 0..*
    type: Annotation
    description: Extra information about the prescription that could not be conveyed by the other attributes.
    short: Information about the prescription

  - name: MedicationRequest.dosageInstruction
    cardinality: 0..*
    type: Dosage
    description: Indicates how the medication is to be used by the patient.
    short: How the medication should be taken
    comments: Can be repeated for complex dosing (e.g., tapering). See also renderedDosageInstruction (R5).

  - name: MedicationRequest.dispenseRequest
    cardinality: 0..1
    type: BackboneElement
    description: Indicates the specific details for the dispense or medication supply part of a medication request (also known as a Medication Prescription or Medication Order). Note that this information is not always sent with the order. There may be in some settings (e.g. hospitals) institutional or system support for completing the dispense details in the pharmacy department.
    short: Medication supply authorization

  - name: MedicationRequest.dispenseRequest.initialFill
    cardinality: 0..1
    type: BackboneElement
    description: Indicates the quantity or duration for the first dispense of the medication.
    short: First fill details
    comments: If populating, must include either quantity or duration.

  - name: MedicationRequest.dispenseRequest.initialFill.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The amount or quantity to provide as part of the first dispense.
    short: First fill quantity

  - name: MedicationRequest.dispenseRequest.initialFill.duration
    cardinality: 0..1
    type: Duration
    description: The length of time that the first dispense is expected to last.
    short: First fill duration

  - name: MedicationRequest.dispenseRequest.dispenseInterval
    cardinality: 0..1
    type: Duration
    description: The minimum period of time that must occur between dispenses of the medication.
    short: Minimum period of time between dispenses

  - name: MedicationRequest.dispenseRequest.validityPeriod
    cardinality: 0..1
    type: Period
    description: This indicates the validity period of a prescription (stale dating the Prescription).
    short: Time period supply is authorized for
    comments: Reflects prescriber's perspective. Dispenses must occur within this period.

  - name: MedicationRequest.dispenseRequest.numberOfRepeatsAllowed
    cardinality: 0..1
    type: unsignedInt
    description: An integer indicating the number of times, in addition to the original dispense, (aka refills or repeats) that the patient can receive the prescribed medication. Usage Notes: This integer does not include the original order dispense. This means that if an order indicates dispense 30 tablets plus "3 repeats", then the order can be dispensed a total of 4 times and the patient can receive a total of 120 tablets. A prescriber may explicitly say that zero refills are permitted after the initial dispense.
    short: Number of refills authorized
    comments: Total authorized fills = numberOfRepeatsAllowed + 1.

  - name: MedicationRequest.dispenseRequest.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The amount that is to be dispensed for one fill.
    short: Amount of medication to supply per dispense

  - name: MedicationRequest.dispenseRequest.expectedSupplyDuration
    cardinality: 0..1
    type: Duration
    description: Identifies the period time over which the supplied product is expected to be used, or the length of time the dispense is expected to last.
    short: Number of days supply per dispense
    comments: May be used instead of quantity, e.g., "90 days supply". Quantity is generally preferred for precision.

  - name: MedicationRequest.dispenseRequest.performer
    cardinality: 0..1
    type: Reference(Organization)
    description: Indicates the intended dispensing Organization specified by the prescriber.
    short: Intended dispenser

  - name: MedicationRequest.substitution
    cardinality: 0..1
    type: BackboneElement
    description: Indicates whether or not substitution can or should be part of the dispense. In some cases, substitution must happen, in other cases substitution must not happen. This block explains the prescriber's intent. If nothing is specified substitution may be done.
    short: Any restrictions on medication substitution

  - name: MedicationRequest.substitution.allowedBoolean
    cardinality: 1..1 # Choice: allowed[x] = allowedBoolean | allowedCodeableConcept
    type: boolean
    description: True if the prescriber allows a different drug to be dispensed from what was prescribed.
    short: Whether substitution is allowed or not (boolean)

  - name: MedicationRequest.substitution.allowedCodeableConcept
    cardinality: 1..1 # Choice: allowed[x] = allowedBoolean | allowedCodeableConcept
    type: CodeableConcept
    description: True if the prescriber allows a different drug to be dispensed from what was prescribed. Coded concepts can be used to specify the type of substitution allowed.
    short: Whether substitution is allowed or not (coded concept)
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ActSubstanceAdminSubstitutionCode # Note R4 uses v3 example binding here
      strength: example

  - name: MedicationRequest.substitution.reason
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the reason for the substitution, or why substitution must or must not be performed.
    short: Why should (not) substitution be made
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-SubstanceAdminSubstitutionReason # Note R4 uses v3 example binding here
      strength: example

  - name: MedicationRequest.priorPrescription
    cardinality: 0..1
    type: Reference(MedicationRequest)
    description: A link to a resource representing an earlier order related order or prescription.
    short: An order/prescription that is being replaced

  - name: MedicationRequest.detectedIssue
    cardinality: 0..*
    type: Reference(DetectedIssue)
    description: Indicates an actual or potential clinical issue with or between one or more active or proposed clinical actions for a patient; e.g. Drug-drug interaction, duplicate therapy, dosage alert etc.
    short: Clinical Issue with action

  - name: MedicationRequest.eventHistory
    cardinality: 0..*
    type: Reference(Provenance)
    description: Links to Provenance records for past versions of this resource or fulfilling request or event resources that identify key state transitions or updates that are likely to be relevant to a user looking at the current version of the resource.
    short: A list of events of interest in the lifecycle
    comments: Might not include all provenances, only "relevant" ones. Should not include provenance for the current version itself.

```

```yaml
# No constraints explicitly listed in the R4 structure definition table for MedicationRequest.
constraints: []
```

## Search Parameters

Search parameters defined for the MedicationRequest resource in FHIR R4:

```yaml
searchParameters:
  - name: authoredon
    type: date
    description: Return prescriptions written on this date
    expression: MedicationRequest.authoredOn
  - name: category
    type: token
    description: Returns prescriptions with different categories
    expression: MedicationRequest.category
  - name: code # Common clinical parameter
    type: token
    description: Return prescriptions of this medication code
    expression: (MedicationRequest.medication as CodeableConcept) # Targets the CodeableConcept choice
  - name: date # Common medication parameter
    type: date
    description: Returns medication request to be administered on a specific date
    expression: MedicationRequest.dosageInstruction.timing.event # Note: R4 definition - may require more specific path based on Timing structure
  - name: encounter # Common medication parameter
    type: reference
    description: Return prescriptions with this encounter identifier
    expression: MedicationRequest.encounter
    targets: [Encounter]
  - name: identifier # Common clinical parameter
    type: token
    description: Return prescriptions with this external identifier
    expression: MedicationRequest.identifier
  - name: intended-dispenser
    type: reference
    description: Returns prescriptions intended to be dispensed by this Organization
    expression: MedicationRequest.dispenseRequest.performer
    targets: [Organization]
  - name: intended-performer
    type: reference
    description: Returns the intended performer of the administration of the medication request
    expression: MedicationRequest.performer
    targets: [Practitioner, Organization, Patient, Device, RelatedPerson, CareTeam, PractitionerRole] # Added PractitionerRole based on element definition
  - name: intended-performertype
    type: token
    description: Returns requests for a specific type of performer
    expression: MedicationRequest.performerType
  - name: intent
    type: token
    description: Returns prescriptions with different intents
    expression: MedicationRequest.intent
  - name: medication # Common medication parameter
    type: reference
    description: Return prescriptions for this medication reference
    expression: (MedicationRequest.medication as Reference) # Targets the Reference choice
    targets: [Medication]
  - name: patient # Common clinical parameter
    type: reference
    description: Returns prescriptions for a specific patient
    expression: MedicationRequest.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: priority
    type: token
    description: Returns prescriptions with different priorities
    expression: MedicationRequest.priority
  - name: requester
    type: reference
    description: Returns prescriptions prescribed by this prescriber
    expression: MedicationRequest.requester
    targets: [Practitioner, PractitionerRole, Organization, Patient, RelatedPerson, Device] # Combined targets from R4 definition
  - name: status # Common medication parameter
    type: token
    description: Status of the prescription
    expression: MedicationRequest.status
  - name: subject
    type: reference
    description: The identity of a patient or group to list orders for
    expression: MedicationRequest.subject
    targets: [Patient, Group] # Correct targets for the subject element

```