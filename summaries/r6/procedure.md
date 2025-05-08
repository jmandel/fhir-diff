Okay, here is the FHIR Procedure resource definition presented in the requested Markdown and YAML format, following the structure of the Encounter example.

---

# FHIR Resource: Procedure

```yaml
resource:
  name: Procedure
  hl7_workgroup: Patient Care
  maturity_level: 4
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

An action that is or was performed on or for a patient, practitioner, device, organization, or location. For example, this can be a physical intervention on a patient like an operation, or less invasive like long term services, counseling, or hypnotherapy. This can be a quality or safety inspection for a location, organization, or device. This can be an accreditation procedure on a practitioner for licensing.

## Background and Scope

The Procedure resource records details of current and historical procedures performed on, with, or for various subjects including patients, practitioners, devices, organizations, or locations.

Key aspects include:

*   **Broad Scope:** Covers surgical, diagnostic, therapeutic (counseling, physiotherapy), personal support services, inspections, and accreditation processes. Procedures can be performed by professionals, service providers, relatives, or the patient.
*   **Non-Patient Subjects:** Can represent actions on non-patient entities, like location inspections or practitioner accreditation.
*   **Summary vs. Real-time:** Provides summary information, not real-time snapshots, though it could summarize progress for long-running procedures (e.g., psychotherapy).
*   **Relationship to Other Resources:**
    *   Use specific resources if available (e.g., `Immunization`, `MedicationAdministration`, `Communication`, `NutritionIntake`).
    *   **Communication vs. Procedure:** Procedure implies intent to change the subject's state (physical or mental), while Communication is for information disclosure.
    *   **Observation/DiagnosticReport:** Procedure describes *how* a diagnostic test was performed if those details (e.g., anesthetic, incision) are relevant. Many diagnostic results don't require a separate Procedure resource.
    *   **Task:** Task represents workflow steps (e.g., fulfilling an order), while Procedure represents actions intended to cause physical or mental change.
*   **Filtering and Grouping:**
    *   `partOf`: Links subordinate procedures to a main one, allowing filtering.
    *   `category`: Can classify procedures (e.g., surgical, billable) for sorting and display.
*   **Incidental vs. Focal Devices:**
    *   `used`: Captures items *used during* the procedure (scalpels, gauze).
    *   `focalDevice`: Captures devices that were the *focus* of the procedure (implanted, removed, manipulated).

## Resource Details

The following defines the core elements and constraints of the Procedure resource.

```yaml
elements:
  - name: Procedure
    description: An action that is or was performed on or for a patient, practitioner, device, organization, or location. For example, this can be a physical intervention on a patient like an operation, or less invasive like long term services, counseling, or hypnotherapy. This can be a quality or safety inspection for a location, organization, or device. This can be an accreditation procedure on a practitioner for licensing.
    short: An action that is being or was performed on an individual or entity
    type: DomainResource
    comments: The base resource definition.

  - name: Procedure.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this procedure by the performer or other systems which remain constant as the resource is updated and is propagated from server to server.
    short: External Identifiers for this procedure
    comments: Best practice is for the identifier to only appear on a single resource instance, though business practices may occasionally dictate otherwise.

  - name: Procedure.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest | MedicationRequest)
    description: A reference to a resource that contains details of the request for this procedure.
    short: A request for this procedure

  - name: Procedure.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Procedure | Observation | MedicationAdministration)
    description: A larger event of which this particular procedure is a component or step.
    short: Part of referenced event
    comments: E.g., anesthesia MedicationAdministration is partOf surgical Procedure; IV insertion Procedure is partOf MedicationAdministration.

  - name: Procedure.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: A code specifying the state of the procedure. Generally, this will be the in-progress or completed state.
    short: preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/event-status|6.0.0-cibuild
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: '"unknown" is used when the state applies but is not known by the authoring system.'

  - name: Procedure.statusReason
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Captures the reason for the current state of the procedure.
    short: Reason for current status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-not-performed-reason
      strength: example
    comments: Generally used for "exception" statuses like 'not-done', 'on-hold', 'stopped'. The reason for performing the procedure itself is in Procedure.reason.

  - name: Procedure.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A code that classifies the procedure for searching, sorting and display purposes (e.g. "Surgical Procedure").
    short: Classification of the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-category
      strength: example

  - name: Procedure.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The specific procedure that is performed. Use text if the exact nature of the procedure cannot be coded (e.g. "Laparoscopic Appendectomy").
    short: Identification of the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-code
      strength: example

  - name: Procedure.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group | Device | Practitioner | Organization | Location)
    description: On whom or on what the procedure was performed. This is usually an individual human, but can also be performed on animals, groups of humans or animals, organizations or practitioners (for licensing), locations or devices (for safety inspections or regulatory authorizations). If the actual focus of the procedure is different from the subject, the focus element specifies the actual focus of the procedure.
    short: Individual or entity the procedure was performed on

  - name: Procedure.focus
    flags: [?!, Σ]
    cardinality: 0..1
    type: Reference(Patient | Group | RelatedPerson | Practitioner | Organization | CareTeam | PractitionerRole | Specimen)
    description: Who is the target of the procedure when it is not the subject of record only. If focus is not present, then subject is the focus. If focus is present and the subject is one of the targets of the procedure, include subject as a focus as well. If focus is present and the subject is not included in focus, it implies that the procedure was only targeted on the focus. For example, when a caregiver is given education for a patient, the caregiver would be the focus and the procedure record is associated with the subject (e.g. patient). For example, use focus when recording the target of the education, training, or counseling is the parent or relative of a patient.
    short: Who is the target of the procedure when it is not the subject of record only
    isModifier: true
    modifierReason: This element is labeled as a modifier because it changes who is the target of the procedure.

  - name: Procedure.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this Procedure was created or performed or to which the creation of this record is tightly associated.
    short: The Encounter during which this Procedure was created
    comments: Typically the encounter the event occurred within, but could be initiated before or after.

  - name: Procedure.occurrence[x] # Renamed from HTML display occurrenceDateTime/Period/etc. to match pattern
    flags: [Σ]
    cardinality: 0..1
    # Type is dateTime | Period | string | Age | Range | Timing
    type: dateTime | Period | string | Age | Range | Timing # Representing choice type
    description: Estimated or actual date, date-time, period, or age when the procedure did occur or is occurring. Allows a period to support complex procedures that span more than one date, and also allows for the length of the procedure to be captured.
    short: When the procedure occurred or is occurring
    comments: Indicates actual occurrence time. Age/Range often used for patient-reported history. dateTime precision varies. Ongoing events shouldn't include upper bound in Period/Timing.bounds.

  - name: Procedure.recorded
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The date the occurrence of the procedure was first captured in the record regardless of Procedure.status (potentially after the occurrence of the event).
    short: When the procedure was first captured in the subject's record

  - name: Procedure.recorder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole)
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the procedure
    comments: The recorder takes responsibility. Source of information can be in reportedReference. Scribe typically handled via Provenance.

  - name: Procedure.reported[x] # Renamed from HTML display reportedBoolean/Reference to match pattern
    flags: [Σ]
    cardinality: 0..1
    # Type is boolean | Reference(Patient | RelatedPerson | Practitioner | PractitionerRole | Organization)
    type: boolean | Reference(Patient | RelatedPerson | Practitioner | PractitionerRole | Organization) # Representing choice type
    description: Indicates if this record was captured as a secondary 'reported' record rather than as an original primary source-of-truth record. It may also indicate the source of the report.
    short: Reported rather than primary record

  - name: Procedure.performer
    flags: [Σ, C]
    cardinality: 0..*
    type: BackboneElement
    description: Indicates who or what performed the procedure and how they were involved.
    short: Who performed the procedure and what they did

  - name: Procedure.performer.function
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Distinguishes the type of involvement of the performer in the procedure. For example, surgeon, anaesthetist, endoscopist.
    short: Type of performance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participant-role
      strength: example

  - name: Procedure.performer.actor
    flags: [Σ, C]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device | CareTeam | HealthcareService)
    description: Indicates who or what performed the procedure.
    short: Who performed the procedure

  - name: Procedure.performer.onBehalfOf
    flags: [C]
    cardinality: 0..1
    type: Reference(Organization)
    description: The Organization the Patient, RelatedPerson, Device, CareTeam, and HealthcareService was acting on behalf of.
    short: Organization the device or practitioner was acting for
    comments: Indicates which organization an actor (if not Practitioner/PractitionerRole) was acting for.

  - name: Procedure.performer.period
    cardinality: 0..1
    type: Period
    description: Time period during which the performer performed the procedure.
    short: When the performer performed the procedure

  - name: Procedure.location
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Location)
    description: The location where the procedure actually happened. E.g. a newborn at home, a tracheostomy at a restaurant.
    short: Where the procedure happened

  - name: Procedure.reason
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Condition | Observation | Procedure | DiagnosticReport | DocumentReference)
    description: The coded reason or reference why the procedure was performed. This may be a coded entity of some type, be present as text, or be a reference to one of several resources that justify the procedure.
    short: The justification that the procedure was performed
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-reason
      strength: example
    comments: Use concept for simple coded reasons, reference for resources with more detail (like onset). If both present, they should be consistent.

  - name: Procedure.bodySite
    flags: [Σ, C]
    cardinality: 0..*
    type: CodeableConcept
    description: Detailed and structured anatomical location information. Multiple locations are allowed - e.g. multiple punch biopsies of a lesion.
    short: Target body sites
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example

  - name: Procedure.bodyStructure
    cardinality: 0..*
    type: Reference(BodyStructure)
    description: Indicates the body structure on the subject's body where the procedure was performed.
    short: Target body structure
    comments: Should be consistent with Procedure.code. Cannot be used if Procedure.bodySite is used.

  - name: Procedure.outcome
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Observation)
    description: The short term outcome of the procedure assessed during the procedure, at the conclusion of the procedure, during the immediate post-performance period, or at discharge. The outcome is usually expected to be within the encounter during which the procedure was performed.
    short: The result of procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-outcome
      strength: example
    comments: Short term outcomes. Long term outcomes typically documented as Observation. Narrative-only outcomes can use CodeableReference.concept.text.

  - name: Procedure.report
    cardinality: 0..*
    type: Reference(DiagnosticReport | DocumentReference | Composition)
    description: This could be a histology result, pathology report, surgical report, etc.
    short: Any report resulting from the procedure
    comments: Multiple reports possible (e.g., multiple biopsies).

  - name: Procedure.complication
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Condition)
    description: Any complications that occurred during the procedure, or in the immediate post-performance period. These are generally tracked separately from the notes, which will typically describe the procedure itself rather than any 'post procedure' issues.
    short: Complication following the procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code
      strength: example
    comments: Narrative-only complications can use CodeableReference.concept.text.

  - name: Procedure.followUp
    cardinality: 0..*
    type: CodeableReference(ServiceRequest | PlanDefinition)
    description: If the procedure required specific follow up - e.g. removal of sutures. The follow up may be represented as a simple note or could potentially be more complex, in which case the CarePlan resource can be used. CarePlan can reference the Procedure via CarePlan.addresses.
    short: Instructions for follow up
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-followup
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
      valueSet: http://hl7.org/fhir/ValueSet/device-action
      strength: preferred

  - name: Procedure.focalDevice.manipulated
    cardinality: 1..1
    type: Reference(Device)
    description: The device that was manipulated (changed) during the procedure.
    short: Device that was changed

  - name: Procedure.used
    cardinality: 0..*
    type: CodeableReference(Device | Medication | Substance | BiologicallyDerivedProduct)
    description: Identifies medications, devices and any other substance used as part of the procedure.
    short: Items used during procedure
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/device-type
      strength: example
    comments: For devices actually implanted or removed, use Procedure.focalDevice.manipulated. Used for tracking contamination, etc.

  - name: Procedure.supportingInfo
    cardinality: 0..*
    type: Reference(Any)
    description: Other resources from the patient record that may be relevant to the procedure. The information from these resources was either used to create the instance or is provided to help with its interpretation. This extension should not be used if more specific inline elements or extensions are available.
    short: Extra information relevant to the procedure

constraints:
  - key: prc-1
    severity: Rule
    location: Procedure.performer
    description: Procedure.performer.onBehalfOf can only be populated when performer.actor isn't Practitioner or PractitionerRole
    expression: onBehalfOf.exists() and actor.resolve().exists() implies actor.resolve().where($this is Practitioner or $this is PractitionerRole).empty()
  - key: con-4 # Renamed from dom-4 based on common FHIR constraint naming
    severity: Rule
    location: (base) # Procedure
    description: bodyStructure SHALL only be present if Procedure.bodySite is not present
    expression: bodySite.exists() implies bodyStructure.empty()

```

## Search Parameters

Search parameters defined for the Procedure resource:

```yaml
searchParameters:
  - name: based-on
    type: reference
    description: A request for this procedure
    expression: Procedure.basedOn
    targets: [CarePlan, MedicationRequest, ServiceRequest]
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
    description: When the procedure occurred or is occurring
    expression: Procedure.occurrence.ofType(dateTime) | Procedure.occurrence.ofType(Period) | Procedure.occurrence.ofType(Timing)
  - name: encounter
    type: reference
    description: The Encounter during which this Procedure was created
    expression: Procedure.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: A unique identifier for a procedure
    expression: Procedure.identifier
  - name: location
    type: reference
    description: Where the procedure happened
    expression: Procedure.location
    targets: [Location]
  - name: part-of
    type: reference
    description: Part of referenced event
    expression: Procedure.partOf
    targets: [Observation, Procedure, MedicationAdministration]
  - name: patient
    type: reference
    description: Search by subject - a patient
    expression: Procedure.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Who performed the procedure
    expression: Procedure.performer.actor
    targets: [Practitioner, PractitionerRole, Organization, Patient, RelatedPerson, Device, CareTeam, HealthcareService]
  - name: reason-code
    type: token
    description: Reference to a concept (by class)
    expression: Procedure.reason.concept
  - name: reason-reference
    type: reference
    description: Reference to a resource (by instance)
    expression: Procedure.reason.reference
    targets: [Condition, Observation, Procedure, DiagnosticReport, DocumentReference] # Extracted from CodeableReference target types
  - name: report
    type: reference
    description: Any report resulting from the procedure
    expression: Procedure.report
    targets: [Composition, DiagnosticReport, DocumentReference]
  - name: status
    type: token
    description: preparation | in-progress | not-done | on-hold | stopped | completed | entered-in-error | unknown
    expression: Procedure.status
  - name: subject
    type: reference
    description: Search by subject
    expression: Procedure.subject
    targets: [Patient, Group, Device, Practitioner, Organization, Location]

```