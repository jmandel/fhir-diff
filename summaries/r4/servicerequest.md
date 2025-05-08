Okay, here is the FHIR ServiceRequest R4 resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: ServiceRequest

```yaml
resource:
  name: ServiceRequest
  hl7_workgroup: Orders and Observations
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

A record of a request for service such as diagnostic investigations, treatments, or operations to be performed. When the ServiceRequest is active, it represents an authorization to perform the service.

## Background and Scope

ServiceRequest is a versatile resource representing a request for various healthcare services, including diagnostic tests, procedures, therapies, counseling, referrals, and community services. It acts as a request resource within the FHIR workflow pattern.

Key aspects include:

*   **Purpose:** Captures requests for services to be planned, proposed, or performed, indicated by the `intent` element. This distinguishes it from resources recording the *actual* event (like `Procedure` or `DiagnosticReport`).
*   **Workflow:** Typically originates from a clinical system (e.g., CPOE) or CDS, potentially as part of a `CarePlan`. It's then fulfilled by a performing organization, which updates the request status and ultimately generates results (e.g., `DiagnosticReport`, `Observation`, `Procedure`).
*   **Subject:** Primarily for requests concerning a single `Patient`, but also supports requests related to `Group`, `Device`, or `Location` (e.g., environmental testing).
*   **Granularity:** Represents a request for a *single* primary service. Multiple services require multiple `ServiceRequest` instances, which can be linked via `basedOn` or `requisition` elements.
*   **Intent:** The `intent` element is crucial, differentiating proposals, plans, orders (original, reflex, filler), etc.
*   **Status:** The `status` element tracks the state of the *request* (draft, active, completed, revoked etc.), managed primarily by the requester. Performer activity is tracked via related event resources or `Task`.
*   **Prohibition:** The `doNotPerform` flag allows representing requests *not* to perform a service.
*   **Specificity:** Details like `code`, `orderDetail`, `bodySite`, `specimen`, `reasonCode`/`reasonReference`, and `supportingInfo` provide context necessary for fulfilling the request.
*   **Boundaries:**
    *   `ServiceRequest` is the *request*; `Procedure`, `DiagnosticReport`, `Observation`, etc., are the *results* of fulfilling the request.
    *   `Task` is generally for administrative actions or tracking workflow steps, while `ServiceRequest` is the clinical authorization or plan. A `Task` might track the fulfillment of a `ServiceRequest`.
    *   `CommunicationRequest` is for simple information disclosure, while `ServiceRequest` is used for requests involving interaction like training or counseling.

## Resource Details

The following defines the core elements and constraints of the ServiceRequest resource based on FHIR R4.

```yaml
elements:
  - name: ServiceRequest
    description: A record of a request for service such as diagnostic investigations, treatments, or operations to be performed. When the ServiceRequest is active, it represents an authorization to perform the service.
    short: A request for a service to be performed
    type: DomainResource
    comments: The base resource definition.

  - name: ServiceRequest.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifiers assigned to this order instance by the orderer and/or the receiver and/or order fulfiller.
    short: Identifiers assigned to this order
    comments: The identifier.type element is used to distinguish between identifiers assigned by the orderer (placer) and the producer (filler).

  - name: ServiceRequest.instantiatesCanonical
    flags: [Σ]
    cardinality: 0..*
    type: canonical(ActivityDefinition | PlanDefinition)
    description: The URL pointing to a FHIR-defined protocol, guideline, orderset or other definition that is adhered to in whole or in part by this ServiceRequest.
    short: Instantiates FHIR protocol or definition

  - name: ServiceRequest.instantiatesUri
    flags: [Σ]
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, orderset or other definition that is adhered to in whole or in part by this ServiceRequest.
    short: Instantiates external protocol or definition

  - name: ServiceRequest.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest | MedicationRequest)
    description: Plan/proposal/order fulfilled by this request.
    short: What request fulfills

  - name: ServiceRequest.replaces
    flags: [Σ]
    cardinality: 0..*
    type: Reference(ServiceRequest)
    description: The request takes the place of the referenced completed or terminated request(s).
    short: What request replaces

  - name: ServiceRequest.requisition
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: A shared identifier common to all service requests that were authorized more or less simultaneously by a single author, representing the composite or group identifier.
    short: Composite Request ID
    comments: Used to link requests treated independently but part of the same authorization event.

  - name: ServiceRequest.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the order.
    short: draft | active | on-hold | revoked | completed | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid.
    comments: This status is generally managed by the requester. Performer status updates often occur on related Event or Task resources.

  - name: ServiceRequest.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Whether the request is a proposal, plan, an original order or a reflex order.
    short: proposal | plan | directive | order | original-order | reflex-order | filler-order | instance-order | option
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-intent
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of all descriptive attributes (e.g., recommended vs. authorized time or performer).
    comments: This element is immutable. It alters when and how the resource is applicable.

  - name: ServiceRequest.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A code that classifies the service for searching, sorting and display purposes (e.g. "Surgical Procedure").
    short: Classification of service
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/servicerequest-category
      strength: example
    comments: Multiple categories may apply depending on context.

  - name: ServiceRequest.priority
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Indicates how quickly the ServiceRequest should be addressed with respect to other requests.
    short: routine | urgent | asap | stat
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-priority
      strength: required
    comments: If missing, assume normal priority.

  - name: ServiceRequest.doNotPerform
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Set this to true if the record is saying that the service/procedure should NOT be performed.
    short: True if service/procedure should not be performed
    isModifier: true
    modifierReason: If true this element negates the specified action.
    comments: Used for prohibitions like "do not ambulate". A double negative (negated code + doNotPerform=true) reinforces prohibition.

  - name: ServiceRequest.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: A code that identifies a particular service (i.e., procedure, diagnostic investigation, or panel of investigations) that have been requested.
    short: What is being requested/ordered
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-code
      strength: example
    comments: May embed specimen/body site (e.g., 'serum glucose', 'chest x-ray').

  - name: ServiceRequest.orderDetail
    flags: [Σ, I] # I flag due to constraint prr-1
    cardinality: 0..*
    type: CodeableConcept
    description: Additional details and instructions about the how the services are to be delivered. For example, an order for a urinary catheter may have an order detail for an external or indwelling catheter, or an order for a bandage may require additional instructions specifying how the bandage should be applied.
    short: Additional order information
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/servicerequest-orderdetail
      strength: example
    comments: Use supportingInfo for existing clinical context.

  - name: ServiceRequest.quantity[x]
    flags: [Σ]
    cardinality: 0..1
    type: Quantity | Ratio | Range
    description: An amount of service being requested which can be a quantity ( for example $1,500 home modification), a ratio ( for example, 20 half day visits per month), or a range (2.0 to 1.8 Gy per fraction).
    short: Service amount

  - name: ServiceRequest.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group | Location | Device)
    description: On whom or what the service is to be performed. This is usually a human patient, but can also be requested on animals, groups of humans or animals, devices such as dialysis machines, or even locations (typically for environmental scans).
    short: Individual or Entity the service is ordered for

  - name: ServiceRequest.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: An encounter that provides additional information about the healthcare context in which this request is made.
    short: Encounter in which the request was created

  - name: ServiceRequest.occurrence[x]
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period | Timing
    description: The date/time at which the requested service should occur.
    short: When service should occur

  - name: ServiceRequest.asNeeded[x]
    flags: [Σ]
    cardinality: 0..1
    type: boolean | CodeableConcept
    description: If a CodeableConcept is present, it indicates the pre-condition for performing the service. For example "pain", "on flare-up", etc. If boolean true, indicates service is "as needed".
    short: Preconditions for service or boolean indicating "as needed"
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-as-needed-reason # Applies to CodeableConcept choice
      strength: example

  - name: ServiceRequest.authoredOn
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: When the request transitioned to being actionable.
    short: Date request signed

  - name: ServiceRequest.requester
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device)
    description: The individual who initiated the request and has responsibility for its activation.
    short: Who/what is requesting service
    comments: Not the dispatcher; typically the authorizer who receives results.

  - name: ServiceRequest.performerType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Desired type of performer for doing the requested service.
    short: Performer role
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participant-role
      strength: example
    comments: Describes capacity (e.g., 'psychiatrist'), not the task itself.

  - name: ServiceRequest.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson)
    description: The desired performer for doing the requested service. For example, the surgeon, dermatopathologist, endoscopist, etc.
    short: Requested performer
    comments: Represents alternative performers if multiple are listed. Use CareTeam for required groups (A *and* B).

  - name: ServiceRequest.locationCode
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The preferred location(s) where the procedure should actually happen in coded or free text form. E.g. at home or nursing day care center.
    short: Requested location (coded)
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ServiceDeliveryLocationRoleType
      strength: example

  - name: ServiceRequest.locationReference
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Location)
    description: A reference to the the preferred location(s) where the procedure should actually happen. E.g. at home or nursing day care center.
    short: Requested location (reference)

  - name: ServiceRequest.reasonCode
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: An explanation or justification for why this service is being requested in coded or textual form. This is often for billing purposes. May relate to the resources referred to in `supportingInfo`.
    short: Explanation/Justification for procedure or service (coded)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-reason
      strength: example

  - name: ServiceRequest.reasonReference
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Condition | Observation | DiagnosticReport | DocumentReference)
    description: Indicates another resource that provides a justification for why this service is being requested. May relate to the resources referred to in `supportingInfo`.
    short: Explanation/Justification for service or service (reference)

  - name: ServiceRequest.insurance
    cardinality: 0..*
    type: Reference(Coverage | ClaimResponse)
    description: Insurance plans, coverage extensions, pre-authorizations and/or pre-determinations that may be needed for delivering the requested service.
    short: Associated insurance coverage

  - name: ServiceRequest.supportingInfo
    cardinality: 0..*
    type: Reference(Any)
    description: Additional clinical information about the patient or specimen that may influence the services or their interpretations. This information includes diagnosis, clinical findings and other observations. In laboratory ordering these are typically referred to as "ask at order entry questions (AOEs)". This includes observations explicitly requested by the producer (filler) to provide context or supporting information needed to complete the order. For example, reporting the amount of inspired oxygen for blood gas measurements.
    short: Additional clinical information

  - name: ServiceRequest.specimen
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Specimen)
    description: One or more specimens that the laboratory procedure will use.
    short: Procedure Samples
    comments: Often the reference is from Specimen.request to ServiceRequest. If specimen is known at request time, reference here.

  - name: ServiceRequest.bodySite
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Anatomic location where the procedure should be performed. This is the target site.
    short: Location on Body
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example
    comments: Only used if not implicit in `code`. Use `procedure-targetBodyStructure` extension for BodyStructure resource reference.

  - name: ServiceRequest.note
    cardinality: 0..*
    type: Annotation
    description: Any other notes and comments made about the service request. For example, internal billing notes.
    short: Comments

  - name: ServiceRequest.patientInstruction
    flags: [Σ]
    cardinality: 0..1 # Note: R4 source says 0..1 for the string, build.fhir.org says 0..* for a backbone? Sticking to R4 0..1 string for this version.
    type: string
    description: Instructions in terms that are understood by the patient or consumer.
    short: Patient or consumer-oriented instructions

  - name: ServiceRequest.relevantHistory
    cardinality: 0..*
    type: Reference(Provenance)
    description: Key events in the history of the request.
    short: Request provenance
    comments: Should reference historical versions of this request.

```

```yaml
constraints:
  - key: prr-1
    severity: Rule
    location: (base) # Refers to ServiceRequest resource level
    description: orderDetail SHALL only be present if code is present
    expression: orderDetail.empty() or code.exists()
```

## Search Parameters

Search parameters defined for the ServiceRequest resource in FHIR R4:

```yaml
searchParameters:
  - name: authored
    type: date
    description: Date request signed
    expression: ServiceRequest.authoredOn
  - name: based-on
    type: reference
    description: What request fulfills
    expression: ServiceRequest.basedOn
    targets: [CarePlan, MedicationRequest, ServiceRequest]
  - name: body-site
    type: token
    description: Where procedure is going to be done
    expression: ServiceRequest.bodySite
  - name: category
    type: token
    description: Classification of service
    expression: ServiceRequest.category
  - name: code
    type: token
    description: What is being requested/ordered
    expression: ServiceRequest.code
  - name: encounter
    type: reference
    description: An encounter in which this request is made
    expression: ServiceRequest.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: Identifiers assigned to this order
    expression: ServiceRequest.identifier
  - name: instantiates-canonical
    type: reference
    description: Instantiates FHIR protocol or definition
    expression: ServiceRequest.instantiatesCanonical
    targets: [PlanDefinition, ActivityDefinition]
  - name: instantiates-uri
    type: uri
    description: Instantiates external protocol or definition
    expression: ServiceRequest.instantiatesUri
  - name: intent
    type: token
    description: proposal | plan | directive | order | original-order | reflex-order | filler-order | instance-order | option
    expression: ServiceRequest.intent
  - name: occurrence
    type: date
    description: When service should occur
    expression: ServiceRequest.occurrence
  - name: patient
    type: reference
    description: Search by subject - a patient
    expression: ServiceRequest.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Requested performer
    expression: ServiceRequest.performer
    targets: [Practitioner, Organization, CareTeam, Device, Patient, HealthcareService, PractitionerRole, RelatedPerson]
  - name: performer-type
    type: token
    description: Performer role
    expression: ServiceRequest.performerType
  - name: priority
    type: token
    description: routine | urgent | asap | stat
    expression: ServiceRequest.priority
  - name: replaces
    type: reference
    description: What request replaces
    expression: ServiceRequest.replaces
    targets: [ServiceRequest]
  - name: requester
    type: reference
    description: Who/what is requesting service
    expression: ServiceRequest.requester
    targets: [Practitioner, Organization, Device, Patient, PractitionerRole, RelatedPerson]
  - name: requisition
    type: token
    description: Composite Request ID
    expression: ServiceRequest.requisition
  - name: specimen
    type: reference
    description: Specimen to be tested
    expression: ServiceRequest.specimen
    targets: [Specimen]
  - name: status
    type: token
    description: draft | active | on-hold | revoked | completed | entered-in-error | unknown
    expression: ServiceRequest.status
  - name: subject
    type: reference
    description: Search by subject
    expression: ServiceRequest.subject
    targets: [Group, Device, Patient, Location]
  # Note: R4 definition page does not list reason-code/reason-reference search params explicitly, though they are common.
  # Adding them based on common practice and derivable structure.
  - name: reason-code # Assumed based on reasonCode element
    type: token
    description: Explanation/Justification for procedure or service
    expression: ServiceRequest.reasonCode
  - name: reason-reference # Assumed based on reasonReference element
    type: reference
    description: Explanation/Justification for service or service
    expression: ServiceRequest.reasonReference
    targets: [Condition, Observation, DiagnosticReport, DocumentReference] # Extracted from reasonReference definition
```

---