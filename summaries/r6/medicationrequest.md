Okay, here is the FHIR MedicationRequest R6 resource definition presented in the requested Markdown and YAML format.

---

# FHIR Resource: MedicationRequest

```yaml
resource:
  name: MedicationRequest
  hl7_workgroup: Pharmacy
  maturity_level: 4
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Group
    - Patient
    - Practitioner
```

An order or request for both supply of the medication and the instructions for administration of the medication to a patient. The resource is called "MedicationRequest" rather than "MedicationPrescription" or "MedicationOrder" to generalize the use across inpatient and outpatient settings, including care plans, etc., and to harmonize with workflow patterns.

## Background and Scope

MedicationRequest covers various medication orders including inpatient, outpatient/community prescriptions, over-the-counter drugs, parenteral nutrition, and supplements. It supports ordering medication-related devices like prefilled syringes but excludes devices with medication coatings (use DeviceRequest or SupplyRequest) or non-medication items. It can also represent reported orders from external systems for informational purposes.

This resource functions as a "request" within FHIR workflow patterns. Each MedicationRequest handles a single medication; multiple medications require multiple linked instances (e.g., using `groupIdentifier` or `RequestOrchestration` for complex relationships like timing or precedence).

## Boundaries and Relationships

*   **MedicationRequest vs. other resources:**
    *   `MedicationDispense`: Records the *provision* of medication.
    *   `MedicationAdministration`: Records the *consumption/administration* of medication.
    *   `MedicationStatement`: Records the *patient's reported or known medication usage*, outside the direct order-dispense-administer workflow.
    *   `SupplyRequest`/`DeviceRequest`: Used for ordering supplies or devices, even if patient-related, when the primary focus isn't the medication itself or detailed administration instructions.
*   **Fulfillment:** Represents the authorization for dispense and administration. The actual fulfillment steps are typically managed by the `Task` resource.
*   **Protocols:** Can be instantiated based on `ActivityDefinition` or `PlanDefinition`.
*   **Grouping:** Use `groupIdentifier` for simple grouping of orders placed simultaneously. Use `RequestOrchestration` for complex relationships (timing, precedence, conditional logic) between requests. Do *not* use `List` or `Composition` for workflow grouping.

## Resource Details

The following defines the core elements and constraints of the MedicationRequest resource.

```yaml
elements:
  - name: MedicationRequest
    description: An order or request for both supply of the medication and the instructions for administration of the medication to a patient. The resource is called "MedicationRequest" rather than "MedicationPrescription" or "MedicationOrder" to generalize the use across inpatient and outpatient settings, including care plans, etc., and to harmonize with workflow patterns.
    short: Ordering of medication for patient or group
    type: DomainResource
    comments: Base resource definition. Alternate names: Prescription, Order.

  - name: MedicationRequest.identifier
    cardinality: 0..*
    type: Identifier
    description: Identifiers associated with this medication request that are defined by business processes and/or used to refer to it when a direct URL reference to the resource itself is not appropriate. They are business identifiers assigned to this resource by the performer or other systems and remain constant as the resource is updated and propagates from server to server.
    short: External ids for this request
    comments: This is a business identifier, not a resource identifier.

  - name: MedicationRequest.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation | RequestOrchestration)
    description: A plan or request that is fulfilled in whole or in part by this medication request.
    short: A plan or request that is fulfilled in whole or in part by this medication request

  - name: MedicationRequest.priorPrescription
    cardinality: 0..1
    type: Reference(MedicationRequest)
    description: Reference to an order/prescription that is being replaced by this MedicationRequest.
    short: Reference to an order/prescription that is being replaced by this MedicationRequest

  - name: MedicationRequest.groupIdentifier
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: A shared identifier common to multiple independent Request instances that were activated/authorized more or less simultaneously by a single author. The presence of the same identifier on each request ties those requests together and may have business ramifications in terms of reporting of results, billing, etc. E.g. a requisition number shared by a set of lab tests ordered together, or a prescription number shared by all meds ordered at one time.
    short: Composite request this is part of
    requirements: Requests are linked either by a "basedOn" relationship (i.e. one request is fulfilling another) or by having a common requisition. Requests that are part of the same requisition are generally treated independently from the perspective of changing their state or maintaining them after initial creation.

  - name: MedicationRequest.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the current state of the order. Generally, this will be active or completed state.
    short: active | on-hold | ended | stopped | completed | cancelled | entered-in-error | draft | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-status|6.0.0-cibuild
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: Clinical decision support systems should take the status into account when determining which medications to include in their algorithms.

  - name: MedicationRequest.statusReason
    cardinality: 0..1
    type: CodeableConcept
    description: Captures the reason for the current state of the MedicationRequest.
    short: Reason for current status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-status-reason
      strength: example
    comments: This is generally only used for "exception" statuses such as "suspended" or "cancelled". The reason why the MedicationRequest was created at all is captured in reason, not here.

  - name: MedicationRequest.statusChanged
    cardinality: 0..1
    type: dateTime
    description: The date (and perhaps time) when the status was changed.
    short: When the status was changed

  - name: MedicationRequest.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Whether the request is a proposal, plan, or an original order.
    short: proposal | plan | order | original-order | reflex-order | filler-order | instance-order | option
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-intent|6.0.0-cibuild
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of all descriptive attributes. For example "the time the request is recommended to occur" vs. "the time the request is authorized to occur" or "who is recommended to perform the request" vs. "who is authorized to perform the request
    comments: Type of requester may be restricted for different intents (e.g., only Practitioner for 'original-order'). An 'instance-order' may populate a MAR.

  - name: MedicationRequest.category
    cardinality: 0..*
    type: CodeableConcept
    description: An arbitrary categorization or grouping of the medication request. It could be used for indicating where meds are intended to be administered, eg. in an inpatient setting or in a patient's home, or a legal category of the medication.
    short: Grouping or category of medication request
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-admin-location
      strength: example
    comments: Example use is to specify administration location (inpatient, community, etc.).

  - name: MedicationRequest.priority
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Indicates how quickly the Medication Request should be addressed with respect to other requests.
    short: routine | urgent | asap | stat
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-priority|6.0.0-cibuild
      strength: required

  - name: MedicationRequest.doNotPerform
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: If true, indicates the provider is ordering a patient should not take the specified medication. The reason for this order can be provided in the .reason element. A MedicationRequest with .doNotPerform = true will not result in any dispense or administration. A request not to take or administer medication is a standalone request, and does not update any other medication request. When true, active orders that may exist for the same medication are expected to be canceled/ended, and new orders for the same medication are not expected.
    short: If true, indicates the provider is ordering a patient should not take the specified medication
    isModifier: true
    modifierReason: This element is labeled as a modifier because this element negates the request to occur (ie, this is a request for the medication not to be ordered or prescribed, etc.)
    comments: If not specified, the request is positive ("do perform").

  - name: MedicationRequest.medication
    flags: [Σ]
    cardinality: 1..1
    type: CodeableReference(Medication)
    description: Identifies the medication being requested. This is a link to a resource that represents the medication which may be the details of the medication or simply an attribute carrying a code that identifies the medication from a known list of medications.
    short: Medication to be taken
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: Use a code for specific products. Reference Medication resource if more detail (form, lot, compounding) is needed.

  - name: MedicationRequest.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: The individual or group for whom the medication has been requested.
    short: Individual or group for whom the medication has been requested
    comments: Subject is mandatory. Use an anonymized subject if the actual subject is not provided (secondary use cases).

  - name: MedicationRequest.informationSource
    cardinality: 0..*
    type: Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization | Group)
    description: The person or organization who provided the information about this request, if the source is someone other than the requestor. The informationSource element is generally used when details of a prescription are being reported by someone who is not the requestor, e.g., I indicate that I received a prescription for a med out of my jurisdiction and the details are recorded in the system as a MedicationRequest. Normally when this element is populated, the .reported element would be set to "true".
    short: The person or organization who provided the information about this request, if the source is someone other than the requestor
    comments: Used when reporting an existing order from another source. Distinguishes the reporter from the original requester.

  - name: MedicationRequest.encounter
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this [x] was created or to which the creation of this record is tightly associated.
    short: Encounter created as part of encounter/admission/stay
    comments: Typically the encounter where the event occurred, but could be before or after if contextually linked.

  - name: MedicationRequest.supportingInformation
    cardinality: 0..*
    type: Reference(Any)
    description: Information to support fulfilling (i.e. dispensing or administering) of the medication, for example, patient height and weight, a MedicationStatement for the patient).
    short: Information to support fulfilling of the medication
    comments: Can reference related MedicationStatements.

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

  - name: MedicationRequest.reported
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Indicates if this record was captured as a secondary 'reported' record rather than as an original primary source-of-truth record. It may also indicate the source of the report.
    short: Reported rather than primary record
    comments: Assume original record if not populated.

  - name: MedicationRequest.performerType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the type of performer of the administration of the medication.
    short: Desired kind of performer of the medication administration
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-intended-performer-role
      strength: extensible
    comments: Specifies required performer type if performer is absent, or requirements if designated performer is unavailable.

  - name: MedicationRequest.performer
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | DeviceDefinition | RelatedPerson | CareTeam | HealthcareService | Group)
    description: The specified desired performer of the medication treatment (e.g. the performer of the medication administration). For devices, this is the device that is intended to perform the administration of the medication. An IV Pump would be an example of a device that is performing the administration. Both the IV Pump and the practitioner that set the rate or bolus on the pump can be listed as performers.
    short: Intended performer of administration

  - name: MedicationRequest.device
    cardinality: 0..*
    type: CodeableReference(DeviceDefinition)
    description: The intended type of device that is to be used for the administration of the medication (for example, PCA Pump).
    short: Intended type of device for the administration

  - name: MedicationRequest.recorder
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole)
    description: The person who entered the order on behalf of another individual for example in the case of a verbal or a telephone order.
    short: Person who entered the request

  - name: MedicationRequest.reason
    cardinality: 0..*
    type: CodeableReference(Condition | Observation | DiagnosticReport | Procedure)
    description: The reason or the indication for ordering or not ordering the medication.
    short: Reason or indication for ordering or not ordering the medication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code
      strength: example
    comments: Can be a code or a reference. Use reference if full Condition details are needed.

  - name: MedicationRequest.courseOfTherapyType
    cardinality: 0..1
    type: CodeableConcept
    description: The description of the overall pattern of the administration of the medication to the patient.
    short: Overall pattern of medication administration
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medicationrequest-course-of-therapy
      strength: extensible
    comments: Distinct from the protocol of the medication.

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

  - name: MedicationRequest.renderedDosageInstruction
    cardinality: 0..1
    type: markdown
    description: The full representation of the dose of the medication included in all dosage instructions. To be used when multiple dosage instructions are included to represent complex dosing such as increasing or tapering doses.
    short: Full representation of the dosage instructions
    requirements: The content of the renderedDosageInstructions must not be different than the dose represented in the dosageInstruction content.

  - name: MedicationRequest.effectiveDosePeriod
    cardinality: 0..1
    type: Period
    description: The period over which the medication is to be taken. Where there are multiple dosageInstruction lines (for example, tapering doses), this is the earliest date and the latest end date of the dosageInstructions.
    short: Period over which the medication is to be taken

  - name: MedicationRequest.dosageInstruction
    cardinality: 0..*
    type: Dosage
    description: Specific instructions for how the medication is to be used by the patient.
    short: Specific instructions for how the medication should be taken
    comments: Complex scenarios (e.g., PO or IV option) may require multiple grouped MedicationRequest resources.

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
    comments: If populating this element, either the quantity or the duration must be included.

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
    requirements: Indicates when the Prescription becomes valid, and when it ceases to be a dispensable Prescription.
    comments: Reflects prescriber's perspective. Dispenses must not occur outside this period. Lower bound is earliest first fill date. If no upper bound, it's open-ended or subject to regulation.

  - name: MedicationRequest.dispenseRequest.numberOfRepeatsAllowed
    cardinality: 0..1
    type: unsignedInt
    description: An integer indicating the number of times, in addition to the original dispense, (aka refills or repeats) that the patient can receive the prescribed medication. Usage Notes: This integer does not include the original order dispense. This means that if an order indicates dispense 30 tablets plus "3 repeats", then the order can be dispensed a total of 4 times and the patient can receive a total of 120 tablets. A prescriber may explicitly say that zero refills are permitted after the initial dispense.
    short: Number of refills authorized
    comments: If displaying "number of authorized fills", add 1 to this number.

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

  - name: MedicationRequest.dispenseRequest.dispenser
    cardinality: 0..1
    type: Reference(Organization)
    description: Indicates the intended performing Organization that will dispense the medication as specified by the prescriber.
    short: Intended performer of dispense

  - name: MedicationRequest.dispenseRequest.dispenserInstruction
    cardinality: 0..*
    type: Annotation
    description: Provides additional information to the dispenser, for example, counselling to be provided to the patient.
    short: Additional information for the dispenser

  - name: MedicationRequest.dispenseRequest.doseAdministrationAid
    cardinality: 0..1
    type: CodeableConcept
    description: Provides information about the type of adherence packaging to be supplied for the medication dispense.
    short: Type of adherence packaging to use for the dispense
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-dose-aid
      strength: example

  - name: MedicationRequest.substitution
    cardinality: 0..1
    type: BackboneElement
    description: Indicates whether or not substitution can or should be part of the dispense. In some cases, substitution must happen, in other cases substitution must not happen. This block explains the prescriber's intent. If nothing is specified substitution may be done.
    short: Any restrictions on medication substitution

  - name: MedicationRequest.substitution.allowed[x]
    cardinality: 1..1
    type: boolean | CodeableConcept
    description: True if the prescriber allows a different drug to be dispensed from what was prescribed.
    short: Whether substitution is allowed or not
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ActSubstanceAdminSubstitutionCode
      strength: preferred
    comments: This element is labeled as a modifier because whether substitution is allow or not, it cannot be ignored.

  - name: MedicationRequest.substitution.reason
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the reason for the substitution, or why substitution must or must not be performed.
    short: Why should (not) substitution be made
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-SubstanceAdminSubstitutionReason
      strength: example

  - name: MedicationRequest.eventHistory
    flags: [TU] # Inherited from element definition
    cardinality: 0..*
    type: Reference(Provenance)
    description: Links to Provenance records for past versions of this resource or fulfilling request or event resources that identify key state transitions or updates that are likely to be relevant to a user looking at the current version of the resource.
    short: A list of events of interest in the lifecycle
    comments: May not include all versions. SHALL NOT include provenance for the current version. Provenances should reference a historical version of this request.

constraints: [] # No constraints were explicitly listed in the provided HTML definition

```

## Search Parameters

Search parameters defined for the MedicationRequest resource:

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
  - name: code # In Common
    type: token
    description: Return prescriptions of this medication code
    expression: MedicationRequest.medication.concept
  - name: combo-date
    type: date
    description: Returns medication request to be administered on a specific date or within a date range
    expression: MedicationRequest.dosageInstruction.timing.event | (MedicationRequest.dosageInstruction.timing.repeat.bounds.ofType(Period))
  - name: encounter # In Common
    type: reference
    description: Return prescriptions with this encounter identifier
    expression: MedicationRequest.encounter
    targets: [Encounter]
  - name: group-identifier
    type: token
    description: Composite request this is part of
    expression: MedicationRequest.groupIdentifier
  - name: group-or-identifier
    type: token
    description: Group ID or other identifier
    expression: MedicationRequest.groupIdentifier | MedicationRequest.identifier
  - name: identifier # In Common
    type: token
    description: Return prescriptions with this external identifier
    expression: MedicationRequest.identifier
  - name: intended-dispenser
    type: reference
    description: Returns prescriptions intended to be dispensed by this Organization
    expression: MedicationRequest.dispenseRequest.dispenser
    targets: [Organization]
  - name: intended-performer
    type: reference
    description: Returns the intended performer of the administration of the medication request
    expression: MedicationRequest.performer
    targets: [Practitioner, PractitionerRole, Organization, Patient, DeviceDefinition, RelatedPerson, CareTeam, HealthcareService, Group]
  - name: intended-performertype
    type: token
    description: Returns requests for a specific type of performer
    expression: MedicationRequest.performerType
  - name: intent
    type: token
    description: Returns prescriptions with different intents
    expression: MedicationRequest.intent
  - name: medication # In Common
    type: reference
    description: Return prescriptions for this medication reference
    expression: MedicationRequest.medication.reference
    targets: [Medication] # Extracted from CodeableReference(Medication)
  - name: patient # In Common
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
    targets: [Practitioner, PractitionerRole, Organization, Patient, RelatedPerson, Device]
  - name: status # In Common
    type: token
    description: Status of the prescription
    expression: MedicationRequest.status
  - name: subject
    type: reference
    description: The identity of a patient to list orders for
    expression: MedicationRequest.subject
    targets: [Patient, Group]
```

---