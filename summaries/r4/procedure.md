Okay, here is the FHIR R4 Procedure resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Procedure

```yaml
resource:
  name: Procedure
  hl7_workgroup: Patient Care
  maturity_level: 3 # Note: HTML shows 3 for R4, build page shows 4 for R5
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
    - Device  # Added based on performer/subject types
    - Group   # Added based on subject type
```

An action that is or was performed on or for a patient. This can be a physical intervention like an operation, or less invasive like long term services, counseling, or hypnotherapy.

## Background and Scope

This resource records details of current and historical procedures performed on or for a patient (or other subjects like groups, devices, locations). It covers a wide range of activities including surgical, diagnostic, endoscopic procedures, biopsies, counseling, physiotherapy, personal support services, transportation, home modification, exercise, etc. Procedures can be performed by healthcare professionals, service providers, friends, relatives, or the patient themselves.

Key aspects include:

*   **Focus:** Provides summary information about the procedure occurrence, not typically real-time snapshots, though it can represent summary progress for long-running procedures.
*   **Workflow:** Procedure is an `event` resource in the FHIR workflow model.
*   **Distinctions:**
    *   Use more specific resources if available (e.g., `Immunization`, `MedicationAdministration`, `Communication`).
    *   `Communication` is for information disclosure; `Procedure` implies intent to change the patient's mind-set or requires verifying comprehension.
    *   `Observation` and `DiagnosticReport` capture results of diagnostic procedures. The `Procedure` resource is used when details *about the diagnostic activity itself* (e.g., anesthesia, incision) are important. Not all diagnostic results require a separate `Procedure` record.
    *   `Task` represents workflow steps (e.g., fulfilling an order), while `Procedure` represents actions intended to cause physical or mental change.
*   **Property Usage:**
    *   Elements like `category`, `bodySite`, etc., might be inferable from `Procedure.code`. Implementations may vary in populating these redundant fields. Avoid nonsensical combinations.
    *   `usedReference`/`usedCode`: For items incidental to the procedure (scalpels, gauze).
    *   `focalDevice`: For devices that are the *focus* of the procedure (implanted, removed, manipulated).

## Resource Details

The following defines the core elements and constraints of the Procedure resource based on FHIR R4.

```yaml
elements:
  - name: Procedure
    description: An action that is or was performed on or for a patient. This can be a physical intervention like an operation, or less invasive like long term services, counseling, or hypnotherapy.
    short: An action that is being or was performed on a patient
    type: DomainResource
    comments: The base resource definition.

  - name: Procedure.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this procedure by the performer or other systems which remain constant as the resource is updated and is propagated from server to server.
    short: External Identifiers for this procedure

  - name: Procedure.instantiatesCanonical
    flags: [Σ]
    cardinality: 0..*
    type: canonical(PlanDefinition | ActivityDefinition | Measure | OperationDefinition | Questionnaire)
    description: The URL pointing to a FHIR-defined protocol, guideline, order set or other definition that is adhered to in whole or in part by this Procedure.
    short: Instantiates FHIR protocol or definition

  - name: Procedure.instantiatesUri
    flags: [Σ]
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, order set or other definition that is adhered to in whole or in part by this Procedure.
    short: Instantiates external protocol or definition

  - name: Procedure.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest)
    description: A reference to a resource that contains details of the request for this procedure.
    short: A request for this procedure

  - name: Procedure.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Procedure | Observation | MedicationAdministration)
    description: A larger event of which this particular procedure is a component or step.
    short: Part of referenced event

  - name: Procedure.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the state of the procedure. Generally, this will be the in-progress or completed state.
    short: preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/event-status|4.0.1 # R4 uses 4.0.1 version
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid. It also contains not-done which indicates the procedure was not performed.

  - name: Procedure.statusReason
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Captures the reason for the current state of the procedure.
    short: Reason for current status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-not-performed-reason # From R4 page
      strength: example
    comments: Generally used for "exception" statuses like "not-done", "on-hold", "stopped".

  - name: Procedure.category
    flags: [Σ]
    cardinality: 0..1 # R4 Definition uses 0..1, R5 build uses 0..*
    type: CodeableConcept
    description: A code that classifies the procedure for searching, sorting and display purposes (e.g. "Surgical Procedure").
    short: Classification of the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-category # From R4 page
      strength: example

  - name: Procedure.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The specific procedure that is performed. Use text if the exact nature of the procedure cannot be coded (e.g. "Laparoscopic Appendectomy").
    short: Identification of the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-code # From R4 page
      strength: example

  - name: Procedure.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group) # R4 only lists Patient | Group
    description: The person, animal or group on which the procedure was performed.
    short: Who the procedure was performed on

  - name: Procedure.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this Procedure was created or performed or to which the creation of this record is tightly associated.
    short: Encounter created as part of

  - name: Procedure.performed[x] # Renamed from occurrence[x] in later versions
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period | string | Age | Range # R4 includes string, Age, Range
    description: Estimated or actual date, date-time, period, or age when the procedure was performed. Allows a period to support complex procedures that span more than one date, and also allows for the length of the procedure to be captured.
    short: When the procedure was performed
    comments: Indicates when the procedure actually occurred. Age is used for patient-reported age at time of procedure. Range for patient-reported age range.

  - name: Procedure.recorder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole)
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the procedure
    comments: The recorder takes responsibility. Source may be captured using reportedReference (though that's not in R4 base). Scribes typically handled via Provenance.

  - name: Procedure.asserter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole)
    description: Individual who is making the procedure statement.
    short: Person who asserts this procedure

  - name: Procedure.performer
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Limited to "real" people rather than equipment. # R4 comment, R5 allows more
    short: The people who performed the procedure

  - name: Procedure.performer.function
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Distinguishes the type of involvement of the performer in the procedure. For example, surgeon, anaesthetist, endoscopist.
    short: Type of performance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/performer-role # R4 uses performer-role
      strength: example

  - name: Procedure.performer.actor
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device)
    description: The practitioner, organization, patient, related person, or device who was involved in the procedure.
    short: Who performed the procedure

  - name: Procedure.performer.onBehalfOf
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization the device or practitioner was acting on behalf of.
    short: Organization the device or practitioner was acting for

  - name: Procedure.location
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Location)
    description: The location where the procedure actually happened. E.g. a newborn at home, a tracheostomy at a restaurant.
    short: Where the procedure happened

  - name: Procedure.reasonCode
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The coded reason why the procedure was performed. This may be a coded entity of some type, or may simply be present as text.
    short: Coded reason procedure performed
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-reason # From R4 page
      strength: example

  - name: Procedure.reasonReference
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Condition | Observation | Procedure | DiagnosticReport | DocumentReference) # R4 includes these targets
    description: The justification of why the procedure was performed.
    short: The justification that the procedure was performed

  - name: Procedure.bodySite
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Detailed and structured anatomical location information. Multiple locations are allowed - e.g. multiple punch biopsies of a lesion.
    short: Target body sites
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site # From R4 page
      strength: example

  - name: Procedure.outcome
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The outcome of the procedure - did it resolve the reasons for the procedure being performed?
    short: The result of procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-outcome # From R4 page
      strength: example
    comments: Often captures short-term outcomes observed during or immediately after the procedure. Long-term outcomes might be recorded as Observations.

  - name: Procedure.report
    cardinality: 0..*
    type: Reference(DiagnosticReport | DocumentReference | Composition) # R4 includes these targets
    description: This could be a histology result, pathology report, surgical report, etc.
    short: Any report resulting from the procedure
    comments: Multiple reports are possible, e.g., for multiple biopsies.

  - name: Procedure.complication
    cardinality: 0..*
    type: CodeableConcept
    description: Any complications that occurred during the procedure, or in the immediate post-performance period. These are generally tracked separately from the notes, which will typically describe the procedure itself rather than any 'post procedure' issues.
    short: Complication following the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code # From R4 page
      strength: example

  - name: Procedure.complicationDetail
    cardinality: 0..*
    type: Reference(Condition)
    description: Any complications that occurred during the procedure, or in the immediate post-performance period.
    short: A condition that is a result of the procedure

  - name: Procedure.followUp
    cardinality: 0..*
    type: CodeableConcept
    description: If the procedure required specific follow up - e.g. removal of sutures. The follow up may be represented as a simple note or could potentially be more complex, in which case the CarePlan resource can be used.
    short: Instructions for follow up
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-followup # From R4 page
      strength: example

  - name: Procedure.note
    cardinality: 0..*
    type: Annotation
    description: Any other notes and comments about the procedure.
    short: Additional information about the procedure

  - name: Procedure.focalDevice
    cardinality: 0..*
    type: BackboneElement
    description: A device that is implanted, removed or otherwise manipulated (calibration, battery replacement, fitting a prosthesis, attaching a wound-vac, etc.) as a focal portion of the Procedure.
    short: Manipulated, implanted, or removed device

  - name: Procedure.focalDevice.action
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of change that happened to the device during the procedure.
    short: Kind of change to device
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-action # From R4 page
      strength: preferred

  - name: Procedure.focalDevice.manipulated
    cardinality: 1..1
    type: Reference(Device)
    description: The device that was manipulated (changed) during the procedure.
    short: Device that was changed

  - name: Procedure.usedReference
    cardinality: 0..*
    type: Reference(Device | Medication | Substance) # R4 includes these targets
    description: Identifies medications, devices and any other substance used as part of the procedure.
    short: Items used during procedure
    comments: For devices incidental to the procedure, not the main focus (use focalDevice for that). Used for tracking, contamination, etc.

  - name: Procedure.usedCode
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies coded items that were used as part of the procedure.
    short: Coded items used during the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-kind # R4 uses device-kind
      strength: example
```

## Search Parameters

Search parameters defined for the FHIR R4 Procedure resource:

```yaml
searchParameters:
  - name: based-on
    type: reference
    description: A request for this procedure
    expression: Procedure.basedOn
    targets: [CarePlan, ServiceRequest] # R4 targets
  - name: category
    type: token
    description: Classification of the procedure
    expression: Procedure.category
  - name: code
    type: token
    description: A code to identify a procedure
    expression: Procedure.code
  - name: date
    type: date
    description: When the procedure was performed
    expression: Procedure.performed
  - name: encounter
    type: reference
    description: Encounter created as part of
    expression: Procedure.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: A unique identifier for a procedure
    expression: Procedure.identifier
  - name: instantiates-canonical
    type: reference
    description: Instantiates FHIR protocol or definition
    expression: Procedure.instantiatesCanonical
    targets: [PlanDefinition, ActivityDefinition, Measure, OperationDefinition, Questionnaire] # R4 targets
  - name: instantiates-uri
    type: uri
    description: Instantiates external protocol or definition
    expression: Procedure.instantiatesUri
  - name: location
    type: reference
    description: Where the procedure happened
    expression: Procedure.location
    targets: [Location]
  - name: part-of
    type: reference
    description: Part of referenced event
    expression: Procedure.partOf
    targets: [Procedure, Observation, MedicationAdministration]
  - name: patient
    type: reference
    description: Search by subject - a patient
    expression: Procedure.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: The reference to the practitioner
    expression: Procedure.performer.actor
    targets: [Practitioner, PractitionerRole, Organization, Patient, RelatedPerson, Device] # R4 targets
  - name: reason-code
    type: token
    description: Coded reason procedure performed
    expression: Procedure.reasonCode
  - name: reason-reference
    type: reference
    description: The justification that the procedure was performed
    expression: Procedure.reasonReference
    targets: [Condition, Observation, Procedure, DiagnosticReport, DocumentReference] # R4 targets
  - name: status
    type: token
    description: preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
    expression: Procedure.status
  - name: subject
    type: reference
    description: Search by subject
    expression: Procedure.subject
    targets: [Patient, Group] # R4 targets
```