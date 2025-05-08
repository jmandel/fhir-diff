Okay, here is the FHIR R6 Encounter resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Encounter

```yaml
resource:
  name: Encounter
  hl7_workgroup: Patient Administration
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

An interaction between a patient and healthcare provider(s) for the purpose of providing healthcare service(s) or assessing the health status of a patient. Encounter is primarily used to record information about the actual activities that occurred, where Appointment is used to record planned activities.

## Background and Scope

The Encounter resource represents a wide range of interactions across different healthcare settings (ambulatory, inpatient, emergency, home health, virtual). It covers the lifecycle from pre-admission/planning through the actual interaction or stay to discharge/completion.

Key aspects include:

*   **Setting Classification:** The `class` element (e.g., inpatient, outpatient) is important for context and business rules. Admission/discharge details are grouped in the `admission` component.
*   **Granularity Flexibility:** The level of detail (e.g., one encounter per stay vs. one per visit) varies. Encounters can be nested using `partOf`.
*   **Planning vs. Actual:** `Appointment` is for scheduling; `Encounter` records the *actual* interaction. An `Encounter` can have a `planned` status before the event.
*   **Status Management:**
    *   `status`: Tracks the encounter workflow state (e.g., `planned`, `in-progress`, `completed`). Note: R6 updated status codes.
    *   `subjectStatus`: Tracks the *patient's* state within the encounter (e.g., `arrived`, `triaged`, `departed`). Example binding, extensible locally.
    *   `EncounterHistory`: New R6 resource to track detailed status/class history, replacing R4's backbone elements.
    *   "Admitted" status is inferred from context (e.g., `class`, `status`, `admission` component), not a single field.
    *   Leave/Hold: Statuses like `on-leave` (subject) and `on-hold` (encounter) can represent temporary pauses (e.g., weekend leave).
*   **Boundaries:**
    *   `Appointment` is fulfilled and linked to a new `Encounter` when the event starts.
    *   `Communication` is for non-direct interactions (e.g., messages) without a duration.
*   **Nesting Example:** A hospital stay (`Encounter` A) might contain department transfers (`Encounter` B, C, partOf A) and consultations (`Encounter` D, E, partOf C or A). Profiling constrains this.
*   **Associated Encounter Extension:** Use the standard extension (`http://hl7.org/fhir/StructureDefinition/encounter-associatedEncounter`) to link resources to an Encounter when no dedicated property exists.

## Resource Details

The following defines the core elements and constraints of the Encounter resource.

```yaml
elements:
  - name: Encounter
    description: An interaction between a patient and healthcare provider(s) for the purpose of providing healthcare service(s) or assessing the health status of a patient. Encounter is primarily used to record information about the actual activities that occurred, where Appointment is used to record planned activities.
    short: An interaction during which services are provided to the patient
    type: DomainResource
    comments: The base resource definition.

  - name: Encounter.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifier(s) by which this encounter is known.
    short: Identifier(s) by which this encounter is known

  - name: Encounter.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The current state of the encounter (not the state of the patient within the encounter - that is subjectState).
    short: planned | in-progress | on-hold | discharged | completed | cancelled | discontinued | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-status # Note: Build version removed for canonical URL
      strength: required
    comments: Note that internal business rules will determine the appropriate transitions that may occur between statuses (and also classes).
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: Encounter.class
    flags: [Σ]
    cardinality: 0..* # Changed from 1..1 in R4
    type: CodeableConcept # Changed from Coding in R4
    description: Concepts representing classification of patient encounter such as ambulatory (outpatient), inpatient, emergency, home health or others due to local variations.
    short: Classification of patient encounter context - e.g. Inpatient, outpatient
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/encounter-class
      strength: preferred

  - name: Encounter.priority
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the urgency of the encounter.
    short: Indicates the urgency of the encounter
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-ActPriority
      strength: example

  - name: Encounter.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Specific type of encounter (e.g. e-mail consultation, surgical day-care, skilled nursing, rehabilitation).
    short: Specific type of encounter (e.g. e-mail consultation, surgical day-care, ...)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-type
      strength: example
    comments: Since there are many ways to further classify encounters, this element is 0..*.

  - name: Encounter.serviceType
    flags: [Σ]
    cardinality: 0..* # Changed from 0..1 in R4
    type: CodeableReference(HealthcareService) # Changed from CodeableConcept in R4
    description: Broad categorization of the service that is to be provided (e.g. cardiology).
    short: Specific type of service
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/service-type
      strength: example

  - name: Encounter.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group)
    description: The patient or group related to this encounter. In some use-cases the patient MAY not be present, such as a case meeting about a patient between several practitioners or a careteam.
    short: The patient or group related to this encounter
    comments: While the encounter is always about the patient, the patient might not actually be known in all contexts of use, and there may be a group of patients that could be anonymous or alternately in veterinary care a herd of sheep receiving treatment.

  - name: Encounter.subjectStatus # New in R6
    cardinality: 0..1
    type: CodeableConcept
    description: The subjectStatus value can be used to track the patient's status within the encounter. It details whether the patient has arrived or departed, has been triaged or is currently in a waiting status.
    short: The current status of the subject in relation to the Encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-subject-status
      strength: example
    comments: Different use-cases are likely to have different permitted transitions between states, such as an Emergency department could use `arrived` when the patient first presents, then `triaged` once has been assessed by a nurse, then `receiving-care` once treatment begins, however other sectors may use a different set of these values, or their own custom set in place of this example valueset provided.

  - name: Encounter.episodeOfCare
    flags: [Σ]
    cardinality: 0..*
    type: Reference(EpisodeOfCare)
    description: Where a specific encounter should be classified as a part of a specific episode(s) of care this field should be used. This association can facilitate grouping of related encounters together for a specific purpose, such as government reporting, issue tracking, association via a common problem. The association is recorded on the encounter as these are typically created after the episode of care and grouped on entry rather than editing the episode of care to append another encounter to it (the episode of care could span years).
    short: Episode(s) of care that this encounter should be recorded against

  - name: Encounter.basedOn
    cardinality: 0..*
    type: Reference(CarePlan | DeviceRequest | MedicationRequest | ServiceRequest | RequestOrchestration | NutritionOrder | VisionPrescription | ImmunizationRecommendation) # Expanded types in R6
    description: The request this encounter satisfies (e.g. incoming referral or procedure request).
    short: The request that initiated this encounter

  - name: Encounter.careTeam # New in R6
    cardinality: 0..*
    type: Reference(CareTeam)
    description: The group(s) of individuals, organizations that are allocated to participate in this encounter. The participants backbone will record the actuals of when these individuals participated during the encounter.
    short: The group(s) that are allocated to participate in this encounter

  - name: Encounter.partOf
    cardinality: 0..1
    type: Reference(Encounter)
    description: Another Encounter of which this encounter is a part of (administratively or in time).
    short: Another Encounter this encounter is part of
    comments: This is also used for associating a child's encounter back to the mother's encounter. Refer to the Notes section in the Patient resource for further details.

  - name: Encounter.serviceProvider
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization that is primarily responsible for this Encounter's services. This MAY be the same as the organization on the Patient record, however it could be different, such as if the actor performing the services was from an external organization (which may be billed seperately) for an external consultation. Refer to the colonoscopy example on the Encounter examples tab.
    short: The organization (facility) responsible for this encounter

  - name: Encounter.participant
    flags: [Σ, C]
    cardinality: 0..*
    type: BackboneElement
    description: The list of people responsible for providing the service.
    short: List of participants involved in the encounter
    comments: Any Patient or Group present in the participation.actor must also be the subject, though the subject may be absent from the participation.actor for cases where the patient (or group) is not present, such as during a case review conference.

  - name: Encounter.participant.type
    flags: [Σ, C]
    cardinality: 0..*
    type: CodeableConcept
    description: Role of participant in encounter.
    short: Role of participant in encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-participant-type
      strength: extensible
    comments: The participant type indicates how an individual actor participates in an encounter. It includes non-practitioner participants, and for practitioners this is to describe the action type in the context of this encounter (e.g. Admitting Dr, Attending Dr, Translator, Consulting Dr). This is different to the practitioner roles which are functional roles, derived from terms of employment, education, licensing, etc.

  - name: Encounter.participant.period
    cardinality: 0..1
    type: Period
    description: The period of time that the specified participant participated in the encounter. These can overlap or be sub-sets of the overall encounter's period.
    short: Period of time during the encounter that the participant participated

  - name: Encounter.participant.actor # Renamed from 'individual' in R4
    flags: [Σ, C]
    cardinality: 0..1
    type: Reference(Patient | Group | RelatedPerson | Practitioner | PractitionerRole | Device | HealthcareService) # Expanded types in R6
    description: Person involved in the encounter, the patient/group is also included here to indicate that the patient was actually participating in the encounter. Not including the patient here covers use cases such as a case meeting between practitioners about a patient - non contact times.
    short: The individual, device, or service participating in the encounter
    comments: For planning purposes, Appointments may include a CareTeam participant. However, CareTeam is not included in Encounter.participant, as the specific individual should be assigned. Similarly, Location can be included in Appointment.participant but is tracked on Encounter.location.

  - name: Encounter.appointment
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Appointment)
    description: The appointment that scheduled this encounter.
    short: The appointment that scheduled this encounter

  - name: Encounter.virtualService # New in R6
    cardinality: 0..*
    type: VirtualServiceDetail
    description: Connection details of a virtual service (e.g. conference call).
    short: Connection details of a virtual service (e.g. conference call)
    comments: Consider using Location.virtualService for persistent rooms. Extensions can be used on participant for participant-specific links.

  - name: Encounter.actualPeriod # Renamed from 'period' in R4
    cardinality: 0..1
    type: Period
    description: The actual start and end time of the encounter.
    short: The actual start and end time of the encounter
    comments: If not (yet) known, the end of the Period may be omitted.

  - name: Encounter.plannedStartDate # New in R6
    cardinality: 0..1
    type: dateTime
    description: The planned start date/time (or admission date) of the encounter.
    short: The planned start date/time (or admission date) of the encounter

  - name: Encounter.plannedEndDate # New in R6
    cardinality: 0..1
    type: dateTime
    description: The planned end date/time (or discharge date) of the encounter.
    short: The planned end date/time (or discharge date) of the encounter

  - name: Encounter.length
    cardinality: 0..1
    type: Duration
    description: Actual quantity of time the encounter lasted. This excludes the time during leaves of absence. When missing it is the time in between the start and end values.
    short: Actual quantity of time the encounter lasted (less time absent)
    comments: May differ from the time in Encounter.actualPeriod due to leave of absence(s).

  - name: Encounter.reason # Changed from reasonCode/reasonReference in R4
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: The list of medical reasons that are expected to be addressed during the episode of care.
    short: The list of medical reasons that are expected to be addressed during the episode of care
    comments: The reason communicates what medical problem the patient has that should be addressed during the episode of care. This reason could be patient reported complaint, a clinical indication that was determined in a previous encounter or episode of care, or some planned care such as an immunization recommendation. In the case where you have a primary reason, but are expecting to also address other problems, you can list the primary reason with a use code of 'Chief Complaint', while the other problems being addressed would have a use code of 'Reason for Visit'.

  - name: Encounter.reason.use # New structure in R6
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: What the reason value should be used as e.g. Chief Complaint, Health Concern, Health Maintenance (including screening).
    short: What the reason value should be used for/as
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-reason-use
      strength: example

  - name: Encounter.reason.value # New structure in R6
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Condition | DiagnosticReport | Observation | ImmunizationRecommendation | Procedure)
    description: Reason the encounter takes place, expressed as a code or a reference to another resource. For admissions, this can be used for a coded admission diagnosis.
    short: Reason the encounter takes place (core or reference)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-reason
      strength: preferred

  - name: Encounter.diagnosis
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: The list of diagnosis relevant to this encounter.
    short: The list of diagnosis relevant to this encounter
    comments: Also note that for the purpose of billing, the diagnoses are recorded in the account where they can be ranked appropriately for how the invoicing/claiming documentation needs to be prepared.

  - name: Encounter.diagnosis.condition
    flags: [Σ]
    cardinality: 0..* # Changed from 1..1 in R4
    type: CodeableReference(Condition) # Changed from Reference(Condition | Procedure) in R4
    description: The coded diagnosis or a reference to a Condition (with other resources referenced in the evidence.detail), the use property will indicate the purpose of this specific diagnosis.
    short: The diagnosis relevant to the encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code
      strength: example

  - name: Encounter.diagnosis.use
    cardinality: 0..* # Changed from 0..1 in R4
    type: CodeableConcept
    description: Role that this diagnosis has within the encounter (e.g. admission, billing, discharge …).
    short: Role that this diagnosis has within the encounter (e.g. admission, billing, discharge …)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-diagnosis-use
      strength: preferred

  - name: Encounter.account
    cardinality: 0..*
    type: Reference(Account)
    description: The set of accounts that may be used for billing for this Encounter.
    short: The set of accounts that may be used for billing for this Encounter
    comments: The billing system may choose to allocate billable items associated with the Encounter to different referenced Accounts based on internal business rules. Also note that the Encounter.account properties are meant to represent long-running or perpetual accounts. For short-lived, episodic accounts, see Account.covers.

  - name: Encounter.dietPreference # Moved from R4 hospitalization
    cardinality: 0..*
    type: CodeableConcept
    description: Diet preferences reported by the patient.
    short: Diet preferences reported by the patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-diet
      strength: example
    comments: For example, a patient may request both a dairy-free and nut-free diet preference (not mutually exclusive). Use the nutritionOrder resource for a complete description of the nutrition needs.

  - name: Encounter.specialArrangement # Moved from R4 hospitalization
    cardinality: 0..*
    type: CodeableConcept
    description: Any special requests that have been made for this encounter, such as the provision of specific equipment or other things.
    short: Wheelchair, translator, stretcher, etc
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-special-arrangements
      strength: preferred

  - name: Encounter.specialCourtesy # Moved from R4 hospitalization
    cardinality: 0..*
    type: CodeableConcept
    description: Special courtesies that may be provided to the patient during the encounter (VIP, board member, professional courtesy).
    short: Special courtesies (VIP, board member)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-special-courtesy
      strength: preferred
    comments: Although the specialCourtesy property can contain values like VIP, the purpose of this field is intended to be used for flagging additional benefits that might occur for the patient during the encounter. It is not specifically intended to be used for securing the specific record - that is the purpose of the security meta tag.

  - name: Encounter.admission # Renamed from 'hospitalization' in R4
    cardinality: 0..1
    type: BackboneElement
    description: Details about the stay during which a healthcare service is provided. This does not describe the event of admitting the patient, but rather any information that is relevant from the time of admittance until the time of discharge.
    short: Details about the admission to a healthcare service
    comments: An Encounter may cover more than just the inpatient stay. The duration recorded in the period of this encounter covers the entire scope of this admission record.

  - name: Encounter.admission.preAdmissionIdentifier
    cardinality: 0..1
    type: Identifier
    description: Pre-admission identifier.
    short: Pre-admission identifier

  - name: Encounter.admission.origin
    cardinality: 0..1
    type: Reference(Location | Organization)
    description: The location/organization from which the patient came before admission.
    short: The location/organization from which the patient came before admission

  - name: Encounter.admission.admitSource
    cardinality: 0..1
    type: CodeableConcept
    description: From where patient was admitted (physician referral, transfer).
    short: From where patient was admitted (physician referral, transfer)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-admit-source
      strength: preferred

  - name: Encounter.admission.reAdmission
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates that this encounter is directly related to a prior admission, often because the conditions addressed in the prior admission were not fully addressed.
    short: Indicates that the patient is being re-admitted
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0092
      strength: example

  - name: Encounter.admission.destination
    cardinality: 0..1
    type: Reference(Location | Organization)
    description: Location/organization to which the patient is discharged.
    short: Location/organization to which the patient is discharged

  - name: Encounter.admission.dischargeDisposition
    cardinality: 0..1
    type: CodeableConcept
    description: Category or kind of location after discharge.
    short: Category or kind of location after discharge
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-discharge-disposition
      strength: example

  - name: Encounter.location
    cardinality: 0..*
    type: BackboneElement
    description: List of locations where the patient has been during this encounter.
    short: List of locations where the patient has been
    comments: Virtual encounters can be recorded in the Encounter by specifying a location reference to a location of type "kind" such as "client's home" and an encounter.class = "virtual".

  - name: Encounter.location.location
    cardinality: 1..1
    type: Reference(Location)
    description: The location where the encounter takes place.
    short: Location the encounter takes place

  - name: Encounter.location.status
    cardinality: 0..1
    type: code
    description: The status of the participants' presence at the specified location during the period specified. If the participant is no longer at the location, then the period will have an end date/time.
    short: planned | active | reserved | completed
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-location-status
      strength: required
    comments: When the patient is no longer active at a location, then the period end date is entered, and the status may be changed to completed.

  - name: Encounter.location.form # Renamed from 'physicalType' in R4
    cardinality: 0..1
    type: CodeableConcept
    description: This will be used to specify the required levels (bed/ward/room/etc.) desired to be recorded to simplify either messaging or query.
    short: The physical type of the location (usually the level in the location hierarchy - bed, room, ward, virtual etc.)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-form
      strength: example
    comments: This information is de-normalized from the Location resource to support the easier understanding of the encounter resource and processing in messaging or query. There may be many levels in the hierarchy, and this may only pic specific levels that are required for a specific usage scenario.

  - name: Encounter.location.period
    cardinality: 0..1
    type: Period
    description: Time period during which the patient was present at the location.
    short: Time period during which the patient was present at the location

```

```yaml
constraints:
  - key: enc-1
    severity: Rule
    location: Encounter.participant
    description: A type must be provided when no explicit actor is specified
    expression: actor.exists() or type.exists()
  - key: enc-2
    severity: Rule
    location: Encounter.participant
    description: A type cannot be provided for a patient or group participant
    expression: actor.exists(resolve() is Patient or resolve() is Group) implies type.exists().not()
```

## Search Parameters

Search parameters defined for the Encounter resource:

```yaml
searchParameters:
  - name: account
    type: reference
    description: The set of accounts that may be used for billing for this Encounter
    expression: Encounter.account
    targets: [Account]
  - name: appointment
    type: reference
    description: The appointment that scheduled this encounter
    expression: Encounter.appointment
    targets: [Appointment]
  - name: based-on
    type: reference
    description: The ServiceRequest that initiated this encounter
    expression: Encounter.basedOn
    targets: [CarePlan, DeviceRequest, ImmunizationRecommendation, MedicationRequest, NutritionOrder, RequestOrchestration, ServiceRequest, VisionPrescription]
  - name: careteam
    type: reference
    description: Careteam allocated to participate in the encounter
    expression: Encounter.careTeam
    targets: [CareTeam]
  - name: class
    type: token
    description: Classification of patient encounter
    expression: Encounter.class
  - name: date
    type: date
    description: A date within the actualPeriod the Encounter lasted
    expression: Encounter.actualPeriod
  - name: date-start
    type: date
    description: The actual start date of the Encounter
    expression: Encounter.actualPeriod.start
  - name: diagnosis-code
    type: token
    description: The diagnosis or procedure relevant to the encounter (coded)
    expression: Encounter.diagnosis.condition.concept
  - name: diagnosis-reference
    type: reference
    description: The diagnosis or procedure relevant to the encounter (resource reference)
    expression: Encounter.diagnosis.condition.reference
    targets: [Condition] # Derived from CodeableReference(Condition) on diagnosis.condition
  - name: end-date
    type: date
    description: The actual end date of the Encounter
    expression: Encounter.actualPeriod.end
  - name: episode-of-care
    type: reference
    description: Episode(s) of care that this encounter should be recorded against
    expression: Encounter.episodeOfCare
    targets: [EpisodeOfCare]
  - name: identifier
    type: token
    description: Identifier(s) by which this encounter is known
    expression: Encounter.identifier
  - name: length
    type: quantity
    description: Length of encounter in days # Note: Description mentions 'days', but type is Duration
    expression: Encounter.length
  - name: location
    type: reference
    description: Location the encounter takes place
    expression: Encounter.location.location
    targets: [Location]
  - name: location-period
    type: date
    description: Time period during which the patient was present at a location (generally used via composite location-period)
    expression: Encounter.location.period
  - name: location-value-period # Composite parameter definition
    type: composite
    description: Time period during which the patient was present at the location
    components:
      - definition: location
        expression: location # Relative to Encounter.location
      - definition: location-period
        expression: period # Relative to Encounter.location
  - name: part-of
    type: reference
    description: Another Encounter this encounter is part of
    expression: Encounter.partOf
    targets: [Encounter]
  - name: participant
    type: reference
    description: Persons involved in the encounter other than the patient
    expression: Encounter.participant.actor
    targets: [Device, Group, HealthcareService, Patient, Practitioner, PractitionerRole, RelatedPerson]
  - name: participant-type
    type: token
    description: Role of participant in encounter
    expression: Encounter.participant.type
  - name: patient
    type: reference
    description: The patient present at the encounter
    expression: Encounter.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: practitioner
    type: reference
    description: Persons involved in the encounter other than the patient
    expression: Encounter.participant.actor.where(resolve() is Practitioner)
    targets: [Practitioner]
  - name: reason-code
    type: token
    description: Reference to a concept (coded)
    expression: Encounter.reason.value.concept
  - name: reason-reference
    type: reference
    description: Reference to a resource (resource reference)
    expression: Encounter.reason.value.reference
    targets: [Condition, DiagnosticReport, ImmunizationRecommendation, Observation, Procedure] # Derived from CodeableReference on reason.value
  - name: service-provider
    type: reference
    description: The organization (facility) responsible for this encounter
    expression: Encounter.serviceProvider
    targets: [Organization]
  - name: special-arrangement
    type: token
    description: Wheelchair, translator, stretcher, etc.
    expression: Encounter.specialArrangement
  - name: status
    type: token
    description: planned | in-progress | on-hold | completed | cancelled | entered-in-error | unknown # Note: Excludes discharged/discontinued from element definition - based on search param page
    expression: Encounter.status
  - name: subject
    type: reference
    description: The patient or group present at the encounter
    expression: Encounter.subject
    targets: [Group, Patient]
  - name: subject-status
    type: token
    description: The current status of the subject in relation to the Encounter
    expression: Encounter.subjectStatus
  - name: type
    type: token
    description: Specific type of encounter
    expression: Encounter.type

```