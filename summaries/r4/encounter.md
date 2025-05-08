Okay, here is the FHIR R4 Encounter resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Encounter (R4)

```yaml
resource:
  name: Encounter
  hl7_workgroup: Patient Administration
  maturity_level: 2 # R4 Maturity Level
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

An interaction between a patient and healthcare provider(s) for the purpose of providing healthcare service(s) or assessing the health status of a patient.

## Background and Scope (R4)

The Encounter resource in FHIR R4 represents various interactions between patients and providers across settings like ambulatory, emergency, home health, and inpatient care. It covers the process from pre-admission/planning through the actual interaction or stay to discharge/completion.

Key aspects for R4:

*   **Broad Scope:** Not all elements apply to every setting. Admission/discharge details are grouped within the `hospitalization` component.
*   **Classification:** The `class` element (required in R4) is crucial for distinguishing the encounter setting (e.g., inpatient, outpatient) and context.
*   **Granularity:** The level of detail (e.g., single encounter for a hospital stay vs. separate encounters per visit) varies. Encounters can be nested using the `partOf` element.
*   **Planning vs. Actual:** `Appointment` handles scheduling, while `Encounter` records the *actual* interaction. An `Encounter` can exist in a `planned` status before the event.
*   **Status Management:**
    *   `status`: Tracks the overall workflow state (e.g., `planned`, `arrived`, `in-progress`, `finished`).
    *   `statusHistory`: An optional backbone element tracks the history of status changes, useful when version history isn't available or sufficient.
    *   "Admitted" Status: Admission is inferred contextually (e.g., `class`, `status` like `in-progress`, presence of `hospitalization` component).
    *   `onleave`: A status representing periods like weekend leave.
*   **Boundaries:**
    *   `Encounter` is for the actual event; `Appointment` is for planning. Appointments are typically fulfilled and linked to an `Encounter`.
    *   `Communication` is for non-direct interactions (like messages) without a recorded duration.
*   **Nesting Example:** A hospital stay (`Encounter` A) might contain moves (`Encounter` B, C, partOf A) and specific visits (`Encounter` D, E, partOf C or A). Profiling is expected for specific use cases.
*   **Associated Encounter Extension:** Use the standard extension (`http://hl7.org/fhir/StructureDefinition/encounter-associatedEncounter`) when no specific property exists to link resources to an Encounter.
*   **History Tracking:** R4 uses `statusHistory` and `classHistory` backbone elements to track changes over time, unlike R5 which introduced the separate `EncounterHistory` resource.

## Resource Details

The following defines the core elements and constraints of the R4 Encounter resource.

```yaml
elements:
  - name: Encounter
    description: An interaction between a patient and healthcare provider(s) for the purpose of providing healthcare service(s) or assessing the health status of a patient.
    short: An interaction during which services are provided to the patient
    type: DomainResource

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
    description: planned | arrived | triaged | in-progress | onleave | finished | cancelled +.
    short: planned | arrived | triaged | in-progress | onleave | finished | cancelled +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-status|4.0.1 # Explicit R4 version
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: Encounter.statusHistory
    cardinality: 0..*
    type: BackboneElement
    description: The status history permits the encounter resource to contain the status history without needing to read through the historical versions of the resource, or even have the server store them.
    short: List of past encounter statuses

  - name: Encounter.statusHistory.status
    cardinality: 1..1
    type: code
    description: planned | arrived | triaged | in-progress | onleave | finished | cancelled +.
    short: planned | arrived | triaged | in-progress | onleave | finished | cancelled +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-status|4.0.1 # Explicit R4 version
      strength: required

  - name: Encounter.statusHistory.period
    cardinality: 1..1
    type: Period
    description: The time that the episode was in the specified status.
    short: The time that the episode was in the specified status

  - name: Encounter.class
    flags: [Σ]
    cardinality: 1..1 # Made mandatory in R4
    type: Coding # Note: Type is Coding, not CodeableConcept in the R4 structure definition table
    description: Concepts representing classification of patient encounter such as ambulatory (outpatient), inpatient, emergency, home health or others due to local variations.
    short: Classification of patient encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v3-ActEncounterCode # R4 uses v3 value set
      strength: extensible

  - name: Encounter.classHistory
    cardinality: 0..*
    type: BackboneElement
    description: The class history permits the tracking of the encounters transitions without needing to go through the resource history. This would be used for a case where an admission starts of as an emergency encounter, then transitions into an inpatient scenario. Doing this and not restarting a new encounter ensures that any lab/diagnostic results can more easily follow the patient and not require re-processing and not get lost or cancelled during a kind of discharge from emergency to inpatient.
    short: List of past encounter classes

  - name: Encounter.classHistory.class
    cardinality: 1..1
    type: Coding # Note: Type is Coding
    description: inpatient | outpatient | ambulatory | emergency +.
    short: inpatient | outpatient | ambulatory | emergency +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v3-ActEncounterCode # R4 uses v3 value set
      strength: extensible

  - name: Encounter.classHistory.period
    cardinality: 1..1
    type: Period
    description: The time that the episode was in the specified class.
    short: The time that the episode was in the specified class

  - name: Encounter.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Specific type of encounter (e.g. e-mail consultation, surgical day-care, skilled nursing, rehabilitation).
    short: Specific type of encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-type
      strength: example

  - name: Encounter.serviceType
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept # New in R4
    description: Broad categorization of the service that is to be provided (e.g. cardiology).
    short: Specific type of service
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/service-type
      strength: example

  - name: Encounter.priority
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the urgency of the encounter.
    short: Indicates the urgency of the encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v3-ActPriority
      strength: example

  - name: Encounter.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group)
    description: The patient or group present at the encounter.
    short: The patient or group present at the encounter

  - name: Encounter.episodeOfCare
    flags: [Σ]
    cardinality: 0..*
    type: Reference(EpisodeOfCare)
    description: Where a specific encounter should be classified as a part of a specific episode(s) of care this field should be used. This association can facilitate grouping of related encounters together for a specific purpose, such as government reporting, issue tracking, association via a common problem. The association is recorded on the encounter as these are typically created after the episode of care and grouped on entry rather than editing the episode of care to append another encounter to it (the episode of care could span years).
    short: Episode(s) of care that this encounter should be recorded against

  - name: Encounter.basedOn
    cardinality: 0..*
    type: Reference(ServiceRequest) # Renamed from incomingReferral in R3; Target type changed
    description: The request this encounter satisfies (e.g. incoming referral or procedure request).
    short: The ServiceRequest that initiated this encounter

  - name: Encounter.participant
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: The list of people responsible for providing the service.
    short: List of participants involved in the encounter

  - name: Encounter.participant.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Role of participant in encounter.
    short: Role of participant in encounter
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-participant-type
      strength: extensible

  - name: Encounter.participant.period
    cardinality: 0..1
    type: Period
    description: The period of time that the specified participant participated in the encounter. These can overlap or be sub-sets of the overall encounter's period.
    short: Period of time during the encounter that the participant participated

  - name: Encounter.participant.individual # Renamed from 'actor' in some context? No, R4 uses individual.
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson) # PractitionerRole added in R4
    description: Persons involved in the encounter other than the patient.
    short: Persons involved in the encounter other than the patient

  - name: Encounter.appointment
    flags: [Σ]
    cardinality: 0..* # Changed from 0..1 in R3
    type: Reference(Appointment)
    description: The appointment that scheduled this encounter.
    short: The appointment that scheduled this encounter

  - name: Encounter.period
    cardinality: 0..1
    type: Period
    description: The start and end time of the encounter.
    short: The start and end time of the encounter

  - name: Encounter.length
    cardinality: 0..1
    type: Duration
    description: Quantity of time the encounter lasted. This excludes the time during leaves of absence.
    short: Quantity of time the encounter lasted (less time absent)

  - name: Encounter.reasonCode # New in R4 (split from R3 'reason')
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Reason the encounter takes place, expressed as a code. For admissions, this can be used for a coded admission diagnosis.
    short: Coded reason the encounter takes place
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-reason
      strength: preferred

  - name: Encounter.reasonReference # New in R4 (split from R3 'reason')
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Condition | Procedure | Observation | ImmunizationRecommendation)
    description: Reason the encounter takes place, expressed as a reference. For admissions, this may be used for an admission diagnosis.
    short: Reason the encounter takes place (reference)

  - name: Encounter.diagnosis
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: The list of diagnosis relevant to this encounter.
    short: The list of diagnosis relevant to this encounter

  - name: Encounter.diagnosis.condition
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Condition | Procedure)
    description: Reason the encounter takes place, as specified using information from another resource. For admissions, this is the admission diagnosis. The indication will typically be a Condition (with other resources referenced in the evidence.detail), or a Procedure.
    short: The diagnosis or procedure relevant to the encounter

  - name: Encounter.diagnosis.use # New in R4 (replaces R3 'role')
    cardinality: 0..1
    type: CodeableConcept
    description: Role that this diagnosis has within the encounter (e.g. admission, billing, discharge …).
    short: Role that this diagnosis has within the encounter (e.g. admission, billing, discharge …)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/diagnosis-role # Name implies diagnosis role, R4 uses this VS
      strength: preferred

  - name: Encounter.diagnosis.rank
    cardinality: 0..1
    type: positiveInt
    description: Ranking of the diagnosis (for each role type).
    short: Ranking of the diagnosis (for each role type)

  - name: Encounter.account
    cardinality: 0..*
    type: Reference(Account)
    description: The set of accounts that may be used for billing for this Encounter.
    short: The set of accounts that may be used for billing for this Encounter

  - name: Encounter.hospitalization
    cardinality: 0..1
    type: BackboneElement
    description: Details about the admission to a healthcare service.
    short: Details about the admission to a healthcare service

  - name: Encounter.hospitalization.preAdmissionIdentifier
    cardinality: 0..1
    type: Identifier
    description: Pre-admission identifier.
    short: Pre-admission identifier

  - name: Encounter.hospitalization.origin
    cardinality: 0..1
    type: Reference(Location | Organization) # Organization added in R4
    description: The location/organization from which the patient came before admission.
    short: The location/organization from which the patient came before admission

  - name: Encounter.hospitalization.admitSource
    cardinality: 0..1
    type: CodeableConcept
    description: From where patient was admitted (physician referral, transfer).
    short: From where patient was admitted (physician referral, transfer)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-admit-source
      strength: preferred

  - name: Encounter.hospitalization.reAdmission
    cardinality: 0..1
    type: CodeableConcept
    description: Whether this hospitalization is a readmission and why if known.
    short: The type of hospital re-admission that has occurred (if any). If the value is absent, then this is not identified as a readmission
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/v2-0092 # Uses V2 table
      strength: example

  - name: Encounter.hospitalization.dietPreference
    cardinality: 0..*
    type: CodeableConcept
    description: Diet preferences reported by the patient.
    short: Diet preferences reported by the patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-diet
      strength: example

  - name: Encounter.hospitalization.specialCourtesy
    cardinality: 0..*
    type: CodeableConcept
    description: Special courtesies (VIP, board member).
    short: Special courtesies (VIP, board member)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-special-courtesy
      strength: preferred

  - name: Encounter.hospitalization.specialArrangement
    cardinality: 0..*
    type: CodeableConcept
    description: Any special requests that have been made for this hospitalization encounter, such as the provision of specific equipment or other things.
    short: Wheelchair, translator, stretcher, etc.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/encounter-special-arrangements
      strength: preferred

  - name: Encounter.hospitalization.destination
    cardinality: 0..1
    type: Reference(Location | Organization) # Organization added in R4
    description: Location/organization to which the patient is discharged.
    short: Location/organization to which the patient is discharged

  - name: Encounter.hospitalization.dischargeDisposition
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
      valueSet: http://hl7.org/fhir/ValueSet/encounter-location-status|4.0.1 # Explicit R4 version
      strength: required

  - name: Encounter.location.physicalType # New in R4
    cardinality: 0..1
    type: CodeableConcept
    description: This will be used to specify the required levels (bed/ward/room/etc.) desired to be recorded to simplify either messaging or query.
    short: The physical type of the location (usually the level in the location hierachy - bed room ward etc.)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/location-physical-type
      strength: example

  - name: Encounter.location.period
    cardinality: 0..1
    type: Period
    description: Time period during which the patient was present at the location.
    short: Time period during which the patient was present at the location

  - name: Encounter.serviceProvider
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization that is primarily responsible for this Encounter's services. This MAY be the same as the organization on the Patient record, however it could be different, such as if the actor performing the services was from an external organization (which may be billed seperately) for an external consultation. Refer to the example bundle showing an abbreviated set of Encounters for a colonoscopy.
    short: The organization (facility) responsible for this encounter

  - name: Encounter.partOf
    cardinality: 0..1
    type: Reference(Encounter)
    description: Another Encounter of which this encounter is a part of (administratively or in time).
    short: Another Encounter this encounter is part of

constraints: # Based on R4 definitions page
  - key: enc-1 # R4 Definition: https://hl7.org/fhir/R4/encounter-definitions.html#Encounter.participant.constraint
    severity: Rule
    location: Encounter.participant
    description: A type must be provided when no explicit participant is specified
    expression: individual.exists() or type.exists()
  - key: enc-2 # R4 Definition: https://hl7.org/fhir/R4/encounter-definitions.html#Encounter.participant.constraint
    severity: Rule
    location: Encounter.participant
    description: A type cannot be provided for a patient participant
    expression: individual.exists(resolve() is Patient) implies type.empty() # R4 constraint only mentions Patient, not Group

```

## Search Parameters (R4)

Search parameters defined for the R4 Encounter resource:

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
    targets: [ServiceRequest] # R4 only lists ServiceRequest here
  - name: class
    type: token
    description: Classification of patient encounter
    expression: Encounter.class
  - name: date
    type: date
    description: A date within the period the Encounter lasted
    expression: Encounter.period
  # R4 documentation for 'date' search parameter uses Encounter.period.
  # The R5 example used actualPeriod. Stick to R4 doc.
  # - name: date-start # Not a standard R4 search param
  #   type: date
  #   description: The actual start date of the Encounter
  #   expression: Encounter.period.start
  - name: diagnosis
    type: reference
    description: The diagnosis or procedure relevant to the encounter
    expression: Encounter.diagnosis.condition
    targets: [Condition, Procedure] # R4 lists both Condition and Procedure
  # R4 does not have separate diagnosis-code/diagnosis-reference params. It has 'diagnosis'.
  # - name: diagnosis-code
  #   type: token
  #   description: The diagnosis or procedure relevant to the encounter (coded)
  #   expression: Encounter.diagnosis.condition.concept # Not standard R4 parameter
  # - name: diagnosis-reference
  #   type: reference
  #   description: The diagnosis or procedure relevant to the encounter (resource reference)
  #   expression: Encounter.diagnosis.condition.reference # Not standard R4 parameter
  #   targets: [Condition] # Extracted from type CodeableReference(Condition) on diagnosis.condition
  # - name: end-date # Not a standard R4 search param
  #   type: date
  #   description: The actual end date of the Encounter
  #   expression: Encounter.period.end
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
    description: Length of encounter in days
    expression: Encounter.length
  - name: location
    type: reference
    description: Location the encounter takes place
    expression: Encounter.location.location
    targets: [Location]
  - name: location-period
    type: date
    description: Time period during which the patient was present at the location
    expression: Encounter.location.period
  # R4 does not define a composite location-period search parameter in the base spec page.
  # - name: location-value-period # Typo in source HTML, should likely match definition
  #   type: composite
  #   description: Time period during which the patient was present at the location
  #   components:
  #     - definition: location
  #       expression: location
  #     - definition: location-period
  #       expression: period
  - name: part-of
    type: reference
    description: Another Encounter this encounter is part of
    expression: Encounter.partOf
    targets: [Encounter]
  - name: participant
    type: reference
    description: Persons involved in the encounter other than the patient
    expression: Encounter.participant.individual
    targets: [Practitioner, PractitionerRole, RelatedPerson] # R4 targets for individual
  - name: participant-type
    type: token
    description: Role of participant in encounter
    expression: Encounter.participant.type
  - name: patient # Standard R4 parameter name
    type: reference
    description: The patient present at the encounter
    expression: Encounter.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: practitioner # Standard R4 parameter name
    type: reference
    description: Persons involved in the encounter other than the patient (specifically Practitioner)
    expression: Encounter.participant.individual.where(resolve() is Practitioner)
    targets: [Practitioner]
  - name: reason-code # New in R4
    type: token
    description: Coded reason the encounter takes place
    expression: Encounter.reasonCode
  - name: reason-reference # New in R4
    type: reference
    description: Reason the encounter takes place (reference)
    expression: Encounter.reasonReference
    targets: [Condition, Observation, Procedure, ImmunizationRecommendation]
  - name: service-provider
    type: reference
    description: The organization (facility) responsible for this encounter
    expression: Encounter.serviceProvider
    targets: [Organization]
  - name: special-arrangement
    type: token
    description: Wheelchair, translator, stretcher, etc.
    expression: Encounter.hospitalization.specialArrangement # Note path includes hospitalization
  - name: status
    type: token
    description: planned | arrived | triaged | in-progress | onleave | finished | cancelled +
    expression: Encounter.status
  - name: subject
    type: reference
    description: The patient or group present at the encounter
    expression: Encounter.subject
    targets: [Group, Patient]
  # R4 does not have a subject-status search parameter
  # - name: subject-status
  #   type: token
  #   description: The current status of the subject in relation to the Encounter
  #   expression: Encounter.subjectStatus
  - name: type
    type: token
    description: Specific type of encounter
    expression: Encounter.type

```