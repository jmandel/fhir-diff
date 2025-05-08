Okay, here is the ServiceRequest resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided HTML content for FHIR R6/Build.

---

# FHIR Resource: ServiceRequest

```yaml
resource:
  name: ServiceRequest
  hl7_workgroup: Orders and Observations
  maturity_level: 4
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

A record of a request for service such as diagnostic investigations, treatments, or operations to be performed. When the ServiceRequest is active, it represents an authorization to perform the service.

## Background and Scope

ServiceRequest represents an order, proposal, or plan for diagnostic or other services for a subject (patient, group, device, location). Examples include diagnostic tests, therapies, procedures, consultations, community services, and nursing services. It can originate from a practitioner (CPOE) or a CDS system.

Key aspects include:

*   **Intent:** The `intent` element clarifies if it's a proposal, plan, order, etc.
*   **Workflow:** A clinical system creates the request, which is then processed by a fulfilling organization. The request status is updated, and results (e.g., Procedure, DiagnosticReport, Observation) are linked back via their `basedOn` element.
*   **Granularity:** Each ServiceRequest typically represents a single procedure. Multiple related requests can be grouped using `requisition` or coordinated using `RequestOrchestration`.
*   **Fulfillment:** ServiceRequest represents the *request* or *authorization*. Actual execution tracking might involve the `Task` resource, especially for administrative actions or complex fulfillment steps. See the [Request pattern Fulfillment/Execution](https://build.fhir.org/request.html#fulfillment) section for details.
*   **Associated Information:**
    *   `specimen`: Primarily used when the request is for an existing specimen. For requests leading to specimen collection, the `Specimen` resource typically points back to the `ServiceRequest`. The `specimenSuggestion` extension is preferred for new requests where a specific specimen type or context is needed. (Note: `ServiceRequest.specimen` itself is deprecated).
    *   `bodySite` / `bodyStructure`: Specify the anatomic location if not implicit in the `code`.
    *   `supportingInfo`: Used for clinical context like AOEs (Ask at Order Entry Questions), diagnoses, or findings influencing the service.
    *   `orderDetail`: Provides specific instructions on *how* the service should be delivered (e.g., catheter type, bandage application method).

## Boundaries and Relationships

*   **ServiceRequest vs. Task:** ServiceRequest focuses on the *intent* (proposal, plan, order) to perform a service. Task tracks the *execution* and administrative steps related to fulfilling a request or managing workflow. A ServiceRequest might authorize the creation of one or more Tasks.
*   **ServiceRequest vs. CommunicationRequest:** CommunicationRequest is for simple information disclosure. ServiceRequest is used when the information delivery involves training, counseling, or verifying comprehension (i.e., aiming to change the recipient's state).
*   **Note on orderDetail:** The structure of `orderDetail` is complex; feedback is ongoing regarding its modeling, especially concerning the `parameterFocus` element.

## Resource Details

The following defines the core elements and constraints of the ServiceRequest resource.

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
    comments: The identifier.type element is used to distinguish between the identifiers assigned by the orderer (known as the 'Placer' in HL7 V2) and the producer of the observations in response to the order (known as the 'Filler' in HL7 V2).

  - name: ServiceRequest.instantiatesCanonical
    flags: [Σ]
    cardinality: 0..*
    type: canonical(ActivityDefinition | PlanDefinition)
    description: The URL pointing to a FHIR-defined protocol, guideline, orderset or other definition that is adhered to in whole or in part by this ServiceRequest.
    short: Instantiates FHIR protocol or definition
    comments: The PlanDefinition resource is used to describe series, sequences, or groups of actions to be taken, while the ActivityDefinition resource is used to define each specific step or activity to be performed.

  - name: ServiceRequest.instantiatesUri
    flags: [Σ]
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, orderset or other definition that is adhered to in whole or in part by this ServiceRequest.
    short: Instantiates external protocol or definition
    comments: This might be an HTML page, PDF, etc. or could just be a non-resolvable URI identifier.

  - name: ServiceRequest.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest | MedicationRequest | RequestOrchestration | NutritionOrder)
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
    comments: Requests are linked either by a "basedOn" relationship or by having a common requisition. Requests that are part of the same requisition are generally treated independently.

  - name: ServiceRequest.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the order.
    short: draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-status|6.0.0-cibuild
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: The status is generally controlled by the requester. Performer activities are reflected on the corresponding event or Task resource.

  - name: ServiceRequest.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Whether the request is a proposal, plan, an original order or a reflex order.
    short: proposal | plan | directive | order +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-intent|6.0.0-cibuild
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of all descriptive attributes (e.g. recommended vs. authorized time or performer).
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
    comments: Multiple categories may exist depending on context. Granularity is defined by the value set.

  - name: ServiceRequest.priority
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Indicates how quickly the ServiceRequest should be addressed with respect to other requests.
    short: routine | urgent | asap | stat
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-priority|6.0.0-cibuild
      strength: required

  - name: ServiceRequest.doNotPerform
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Set this to true if the record is saying that the service/procedure should NOT be performed.
    short: True if service/procedure should not be performed
    isModifier: true
    modifierReason: If true this element negates the specified action.
    comments: Used for prohibitions (e.g., do not ambulate). If code also contains negation, it reinforces the prohibition (not a double negative).

  - name: ServiceRequest.code
    flags: [Σ, C]
    cardinality: 0..1
    type: CodeableReference(ActivityDefinition | PlanDefinition)
    description: A code or reference that identifies a particular service (i.e., procedure, diagnostic investigation, or panel of investigations) that has been requested.
    short: What is being requested/ordered
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-code
      strength: example
    comments: May embed specimen/organ system (e.g., serum glucose). PlanDefinition can group multiple activities.

  - name: ServiceRequest.orderDetail
    flags: [Σ, C]
    cardinality: 0..*
    type: BackboneElement
    description: Additional details and instructions about how the services are to be delivered. For example, an order for a urinary catheter may have an order detail for an external or indwelling catheter, or an order for a bandage may require additional instructions specifying how the bandage should be applied. Questions or additional information to be gathered from a patient may be included here.
    short: Additional information about the request
    comments: For existing information supporting delivery, use supportingInformation.

  - name: ServiceRequest.orderDetail.parameterFocus
    cardinality: 0..1
    type: CodeableReference(Device | DeviceDefinition | DeviceRequest | SupplyRequest | Medication | MedicationRequest | BiologicallyDerivedProduct | Substance)
    description: Indicates the context of the order details by reference.
    short: The context of the order details by reference

  - name: ServiceRequest.orderDetail.parameter
    flags: [Σ]
    cardinality: 1..*
    type: BackboneElement
    description: The parameter details for the service being requested.
    short: The parameter details for the service being requested

  - name: ServiceRequest.orderDetail.parameter.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: A value representing the additional detail or instructions for the order (e.g., catheter insertion, body elevation, descriptive device configuration and/or setting instructions).
    short: The detail of the order being requested
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/servicerequest-orderdetail-parameter-code
      strength: example

  - name: ServiceRequest.orderDetail.parameter.value[x]
    flags: [Σ]
    cardinality: 1..1
    type: Quantity | Ratio | Range | boolean | CodeableConcept | string | Period
    description: Indicates a value for the order detail.
    short: The value for the order detail
    comments: Use CodeableConcept for coded concepts, string for free text or non-single concepts.

  - name: ServiceRequest.quantity[x]
    flags: [Σ]
    cardinality: 0..1
    type: Quantity | Ratio | Range
    description: An amount of service being requested.
    short: Service amount
    comments: Can be quantity (e.g., $1500), ratio (e.g., 20 visits/month), or range (e.g., 8-10 sessions).

  - name: ServiceRequest.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group | Location | Device)
    description: On whom or what the service is to be performed. This is usually a human patient, but can also be requested on animals, groups of humans or animals, devices such as dialysis machines, or even locations (typically for environmental scans).
    short: Individual or Entity the service is ordered for

  - name: ServiceRequest.focus
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Any)
    description: The actual focus of a service request when it is not the subject of record representing something or someone associated with the subject such as a spouse, parent, fetus, or donor. The focus of a service request could also be an existing condition, an intervention, the subject's diet, another service request on the subject, or a body structure such as tumor or implanted device.
    short: What the service request is about, when it is not about the subject of record

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

  - name: ServiceRequest.asNeeded
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Indicates that the service (e.g., procedure, lab test) should be performed when needed (Boolean option).
    short: Perform the service "as needed"

  - name: ServiceRequest.asNeededFor
    flags: [Σ, C]
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates specific criteria that need to be met to perform the service (e.g., lab results or symptoms).
    short: Specified criteria for the service
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-as-needed-reason
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
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device | Group)
    description: The individual who initiated the request and has responsibility for its activation.
    short: Who/what is requesting service
    comments: Not the dispatcher; this is the authorizer. Does not handle delegation (use Provenance). Group is only for family/household, not practitioner groups (use Organization/CareTeam).

  - name: ServiceRequest.performerType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Desired type of performer for doing the requested service.
    short: Performer role
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participant-role
      strength: example
    comments: Describes capacity (e.g., "psychiatrist"), not the task.

  - name: ServiceRequest.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson | Group)
    description: The desired performer for doing the requested service. For example, the surgeon, dermatopathologist, endoscopist, etc.
    short: Requested performer
    comments: Multiple performers are alternatives unless performerOrder extension is used. Use CareTeam for groups of performers acting together. Group is only for family/household.

  - name: ServiceRequest.location
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Location)
    description: The preferred location(s) where the procedure should actually happen in coded or free text form. E.g. at home or nursing day care center.
    short: Requested location
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ServiceDeliveryLocationRoleType
      strength: example

  - name: ServiceRequest.reason
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Condition | Observation | DiagnosticReport | DocumentReference | DetectedIssue | Procedure)
    description: The reason or the indication for requesting the service (e.g., procedure, lab test).
    short: Reason or indication for requesting the service
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-reason
      strength: example
    comments: Explains why the request is made. Reference Observation/Condition if possible. Use reason.concept.text for free text.

  - name: ServiceRequest.insurance
    cardinality: 0..*
    type: Reference(Coverage | ClaimResponse)
    description: Insurance plans, coverage extensions, pre-authorizations and/or pre-determinations that may be needed for delivering the requested service.
    short: Associated insurance coverage

  - name: ServiceRequest.supportingInfo
    cardinality: 0..*
    type: CodeableReference(Any)
    description: Additional clinical information about the patient or specimen that may influence the services or their interpretations. This information includes diagnosis, clinical findings and other observations. In laboratory ordering these are typically referred to as 'ask at order entry questions (AOEs).' This includes observations explicitly requested by the producer (filler) to provide context or supporting information needed to complete the order. For example, reporting the amount of inspired oxygen for blood gas measurements.
    short: Additional clinical information
    comments: Use orderDetail for instructions on *how* to deliver the service.

  - name: ServiceRequest.specimen
    flags: [Σ, XD]
    cardinality: 0..*
    type: Reference(Specimen)
    deprecated: true # Added based on XD flag and comments
    description: One or more specimens that the laboratory procedure will use. (Deprecated: Use specimenSuggestion extension or have Specimen reference ServiceRequest).
    short: Procedure Samples (Deprecated)
    comments: Discouraged from use. Prefer linking from Specimen to ServiceRequest or using the specimenSuggestion extension.

  - name: ServiceRequest.bodySite
    flags: [Σ, C]
    cardinality: 0..*
    type: CodeableConcept
    description: Anatomic location where the procedure should be performed. This is the target site.
    short: Coded location on Body
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example
    comments: Only used if not implicit in code. For tracking BodySite as a resource, use the procedure-targetBodyStructure extension.

  - name: ServiceRequest.bodyStructure
    flags: [Σ, C]
    cardinality: 0..1
    type: Reference(BodyStructure)
    description: Anatomic location where the procedure should be performed. This is the target site.
    short: BodyStructure-based location on the body

  - name: ServiceRequest.note
    cardinality: 0..*
    type: Annotation
    description: Any other notes and comments made about the service request. For example, internal billing notes.
    short: Comments

  - name: ServiceRequest.patientInstruction
    cardinality: 0..*
    type: BackboneElement
    description: Instructions in terms that are understood by the patient or consumer.
    short: Patient or consumer-oriented instructions

  - name: ServiceRequest.patientInstruction.instruction[x]
    flags: [Σ]
    cardinality: 0..1
    type: markdown | Reference(DocumentReference)
    description: Instructions in terms that are understood by the patient or consumer.
    short: Patient or consumer-oriented instructions

  - name: ServiceRequest.relevantHistory
    cardinality: 0..*
    type: Reference(Provenance)
    description: Key events in the history of the request.
    short: Request provenance
    comments: Might not include all provenances. Should not include provenance for the current version. Provenances should reference historical versions of this ServiceRequest.

constraints:
  - key: bdystr-1
    severity: Rule
    location: ServiceRequest # Changed from (base) for consistency
    description: bodyStructure SHALL only be present if bodySite is not present
    expression: bodySite.exists() implies bodyStructure.empty()
  - key: prr-1
    severity: Rule
    location: ServiceRequest # Changed from (base) for consistency
    description: orderDetail SHALL only be present if code is present
    expression: orderDetail.empty() or code.exists()
  - key: asn-1
    severity: Rule
    location: ServiceRequest # Changed from (base) for consistency
    description: asNeededFor SHALL only be present if asNeeded is empty or true
    expression: asNeededFor.empty() or (asNeeded = true or asNeeded.empty())
```

## Search Parameters

Search parameters defined for the ServiceRequest resource:

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
    targets: [CarePlan, MedicationRequest, RequestOrchestration, NutritionOrder, ServiceRequest]
  - name: body-site
    type: token
    description: Where procedure is going to be done
    expression: ServiceRequest.bodySite
  - name: body-structure
    type: reference
    description: Body structure Where procedure is going to be done
    expression: ServiceRequest.bodyStructure
    targets: [BodyStructure]
  - name: category
    type: token
    description: Classification of service
    expression: ServiceRequest.category
  - name: code-concept # Note: Split from original 'code' which could be ref or concept
    type: token
    description: What is being requested/ordered (coded concept)
    expression: ServiceRequest.code.concept
  - name: code-reference # Note: Split from original 'code' which could be ref or concept
    type: reference
    description: What is being requested/ordered (resource reference)
    expression: ServiceRequest.code.reference
    targets: [ActivityDefinition, PlanDefinition] # Added based on element type
  - name: encounter
    type: reference
    description: An encounter in which this request is made
    expression: ServiceRequest.encounter
    targets: [Encounter]
  - name: group-or-identifier # Note: Combined from requisition and identifier based on description
    type: token
    description: Requisition ID or other identifier
    expression: ServiceRequest.requisition | ServiceRequest.identifier
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
    description: proposal | plan | directive | order +
    expression: ServiceRequest.intent
  - name: location-code # Note: Based on new location element
    type: token
    description: The preferred location specified in the ServiceRequest (coded)
    expression: ServiceRequest.location.concept
  - name: location-reference # Note: Based on new location element
    type: reference
    description: The preferred location specified in the ServiceRequest (resource reference)
    expression: ServiceRequest.location.reference
    targets: [Location]
  - name: occurrence
    type: date
    description: When service should occur
    expression: ServiceRequest.occurrence.ofType(dateTime) | ServiceRequest.occurrence.ofType(Period) | ServiceRequest.occurrence.ofType(Timing)
  - name: patient
    type: reference
    description: Search by subject - a patient
    expression: ServiceRequest.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Requested performer
    expression: ServiceRequest.performer
    targets: [Practitioner, Group, Organization, CareTeam, Device, Patient, HealthcareService, PractitionerRole, RelatedPerson]
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
    targets: [Practitioner, Group, Organization, Device, Patient, PractitionerRole, RelatedPerson]
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
    description: draft | active | on-hold | revoked | completed | entered-in-error | unknown | ended # Added 'ended' based on element def
    expression: ServiceRequest.status
  - name: subject
    type: reference
    description: Search by subject
    expression: ServiceRequest.subject
    targets: [Group, Device, Patient, Location]
```