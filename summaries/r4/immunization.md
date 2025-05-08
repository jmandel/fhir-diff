Okay, here is the FHIR R4 Immunization resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Immunization

```yaml
resource:
  name: Immunization
  hl7_workgroup: Public Health and Emergency Response
  maturity_level: 3 # Note: Build page shows 5, R4 page shows 3. Using R4 page value.
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
```

Describes the event of a patient being administered a vaccine or a record of an immunization as reported by a patient, a clinician or another party.

## Background and Scope

The Immunization resource covers the recording of current and historical administration of vaccines to patients (human and animal) across various healthcare settings and regions. It does not cover non-vaccine agents. While "immunization" and "vaccination" aren't clinically identical, they are used synonymously in FHIR for this resource.

Key aspects include:

*   **Purpose:** Recording the event of vaccine administration or documenting historical immunizations.
*   **Scope:** Intended for vaccines, not other medications (use `MedicationAdministration` for those). If `MedicationAdministration` is used for workflow, an equivalent `Immunization` resource SHOULD also be exposed.
*   **History:** Covers creation, revision, and querying of immunization history, aligning with HL7 v2 and v3 immunization concepts.
*   **Reactions:** `Immunization.reaction` can capture adverse events temporarily associated with the immunization. If determined to be an allergy or intolerance, a separate `AllergyIntolerance` resource should be created.
*   **Source of Information:** `primarySource` indicates if the data came directly from the administering entity. `reportOrigin` (or `informationSource` in newer versions) specifies the source if it's secondary information.
*   **Subpotency:** `isSubpotent` and `subpotentReason` capture details if a dose was not fully potent (e.g., partial administration, recall).
*   **Protocols:** `protocolApplied` details the vaccination schedule or protocol being followed.
*   **Occurrence:** The `occurrence[x]` element captures the date/time of administration. While `dateTime` is preferred, `string` is allowed for patient-reported events where the exact date isn't known. Time zone handling is crucial to avoid date shifts.

## Resource Details

The following defines the core elements and constraints of the Immunization resource based on FHIR R4.

```yaml
elements:
  - name: Immunization
    description: Describes the event of a patient being administered a vaccine or a record of an immunization as reported by a patient, a clinician or another party.
    short: Immunization event information
    type: DomainResource
    comments: The base resource definition.

  - name: Immunization.identifier
    cardinality: 0..*
    type: Identifier
    description: A unique identifier assigned to this immunization record.
    short: Business identifier

  - name: Immunization.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates the current status of the immunization event.
    short: completed | entered-in-error | not-done
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains statuses 'entered-in-error' and 'not-done' which means that the resource should not be treated as valid.
    comments: Will generally be set to show that the immunization has been completed or not done.

  - name: Immunization.statusReason
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the reason the immunization event was not performed.
    short: Reason not done
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-status-reason
      strength: example
    comments: This is generally only used for the status of "not-done". The reason for performing the immunization event is captured in reasonCode, not here.

  - name: Immunization.vaccineCode
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Vaccine that was administered or was to be administered.
    short: Vaccine product administered
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/vaccine-code
      strength: example
    comments: The code can be generic (e.g., flu vaccine CVX) or specific (e.g., NDC). Multiple codes (like NDC and CVX) can be provided if appropriate for the same vaccine.

  - name: Immunization.patient
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient)
    description: The patient who either received or did not receive the immunization.
    short: Who was immunized

  - name: Immunization.encounter
    cardinality: 0..1
    type: Reference(Encounter)
    description: The visit or admission or other contact between patient and health care provider the immunization was performed as part of.
    short: Encounter immunization was part of

  - name: Immunization.occurrenceDateTime
    flags: [Σ]
    cardinality: 1..1 # Choice element occurrence[x] is 1..1
    type: dateTime
    description: Date vaccine administered or was to be administered.
    short: Vaccine administration date
    comments: Specific date/time is preferred. Preserve time zone. Use string variant if exact date is unknown (patient-reported).

  - name: Immunization.occurrenceString
    flags: [Σ]
    cardinality: 1..1 # Choice element occurrence[x] is 1..1
    type: string
    description: Date vaccine administered or was to be administered.
    short: Vaccine administration date (string)
    comments: Use when exact date is not known (e.g., patient-reported history). Exact dateTime is preferred.

  - name: Immunization.recorded
    cardinality: 0..1
    type: dateTime
    description: The date the occurrence of the immunization was first captured in the record - potentially significantly after the occurrence of the event.
    short: When the immunization was first captured

  - name: Immunization.primarySource
    flags: [Σ]
    cardinality: 0..1 # Changed from 1..1 in R3
    type: boolean
    description: An indication that the content of the record is based on information from the person who administered the vaccine. This reflects the context under which the data was originally recorded.
    short: Indicates context the data was recorded in
    comments: Reflects the “reliability” of the content. True = data originated from the administrator.

  - name: Immunization.reportOrigin # Renamed from informationSource in build? Sticking to R4 definition.
    cardinality: 0..1
    type: CodeableConcept
    description: The source of the data when the report of the immunization event is not based on information from the person who administered the vaccine.
    short: Indicates the source of a secondarily reported record
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-origin
      strength: example
    comments: Typically will not be populated if primarySource = True.

  - name: Immunization.location
    cardinality: 0..1
    type: Reference(Location)
    description: The service delivery location where the vaccine administration occurred.
    short: Where immunization occurred

  - name: Immunization.manufacturer
    cardinality: 0..1
    type: Reference(Organization)
    description: Name of vaccine manufacturer.
    short: Vaccine manufacturer

  - name: Immunization.lotNumber
    cardinality: 0..1
    type: string
    description: Lot number of the vaccine product.
    short: Vaccine lot number

  - name: Immunization.expirationDate
    cardinality: 0..1
    type: date
    description: Date vaccine batch expires.
    short: Vaccine expiration date

  - name: Immunization.site
    cardinality: 0..1
    type: CodeableConcept
    description: Body site where vaccine was administered.
    short: Body site vaccine was administered
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-site
      strength: example

  - name: Immunization.route
    cardinality: 0..1
    type: CodeableConcept
    description: The path by which the vaccine product is taken into the body.
    short: How vaccine entered body
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-route
      strength: example

  - name: Immunization.doseQuantity
    cardinality: 0..1
    type: SimpleQuantity
    description: The quantity of vaccine product that was administered.
    short: Amount of vaccine administered

  - name: Immunization.performer # Renamed from practitioner in R3
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Indicates who performed the immunization event.
    short: Who performed event

  - name: Immunization.performer.function # Moved from practitioner.role in R3
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the type of performance (e.g. ordering provider, administering provider, etc.).
    short: What type of performance was done
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-function # Changed from immunization-role
      strength: extensible

  - name: Immunization.performer.actor # Moved from practitioner.actor in R3
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization) # Added PractitionerRole, Organization
    description: The practitioner or organization who performed the action.
    short: Individual or organization who was performing

  - name: Immunization.note
    flags: [Σ]
    cardinality: 0..*
    type: Annotation
    description: Extra information about the immunization that is not conveyed by the other attributes.
    short: Additional immunization notes

  - name: Immunization.reasonCode # Moved from explanation.reason in R3
    cardinality: 0..*
    type: CodeableConcept
    description: Reasons why the vaccine was administered.
    short: Why immunization occurred
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-reason
      strength: example

  - name: Immunization.reasonReference # New in R4
    cardinality: 0..*
    type: Reference(Condition | Observation | DiagnosticReport)
    description: Condition, Observation or DiagnosticReport that supports why the immunization was administered.
    short: Why immunization occurred (resource reference)

  - name: Immunization.isSubpotent # New in R4
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Indication if a dose is considered to be subpotent. By default, a dose should be considered to be potent.
    short: Dose potency
    isModifier: true
    modifierReason: An immunization event with a subpotent vaccine doesn't protect the patient the same way as a potent dose.
    comments: Typically recognized retrospectively (e.g., recall) or immediately (e.g., partial administration).

  - name: Immunization.subpotentReason # New in R4
    cardinality: 0..*
    type: CodeableConcept
    description: Reason why a dose is considered to be subpotent.
    short: Reason for being subpotent
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-subpotent-reason
      strength: example

  - name: Immunization.education # New in R4
    cardinality: 0..*
    type: BackboneElement
    description: Educational material presented to the patient (or guardian) at the time of vaccine administration.
    short: Educational material presented to patient

  - name: Immunization.education.documentType # New in R4
    cardinality: 0..1
    type: string
    description: Identifier of the material presented to the patient.
    short: Educational material document identifier

  - name: Immunization.education.reference # New in R4
    cardinality: 0..1
    type: uri
    description: Reference pointer to the educational material given to the patient if the information was online.
    short: Educational material reference pointer

  - name: Immunization.education.publicationDate # New in R4
    cardinality: 0..1
    type: dateTime
    description: Date the educational material was published.
    short: Educational material publication date

  - name: Immunization.education.presentationDate # New in R4
    cardinality: 0..1
    type: dateTime
    description: Date the educational material was given to the patient.
    short: Educational material presentation date

  - name: Immunization.programEligibility # New in R4
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates a patient's eligibility for a funding program.
    short: Patient eligibility for a vaccination program
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-program-eligibility
      strength: example

  - name: Immunization.fundingSource # New in R4
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the source of the vaccine actually administered. This may be different than the patient eligibility (e.g. the patient may be eligible for a publically purchased vaccine but due to inventory issues, vaccine purchased with private funds was actually administered).
    short: Funding source for the vaccine
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-funding-source
      strength: example

  - name: Immunization.reaction
    cardinality: 0..*
    type: BackboneElement
    description: Categorical data indicating that an adverse event is associated in time to an immunization.
    short: Details of a reaction that follows immunization
    comments: May indicate an allergy/intolerance; if so, create a separate AllergyIntolerance resource.

  - name: Immunization.reaction.date
    cardinality: 0..1
    type: dateTime
    description: Date of reaction to the immunization.
    short: When reaction started

  - name: Immunization.reaction.detail
    cardinality: 0..1
    type: Reference(Observation)
    description: Details of the reaction.
    short: Additional information on reaction

  - name: Immunization.reaction.reported
    cardinality: 0..1
    type: boolean
    description: Self-reported indicator.
    short: Indicates self-reported reaction

  - name: Immunization.protocolApplied # Renamed from vaccinationProtocol in R3
    cardinality: 0..*
    type: BackboneElement
    description: The protocol (set of recommendations) being followed by the provider who administered the dose.
    short: Protocol followed by the provider

  - name: Immunization.protocolApplied.series
    cardinality: 0..1
    type: string
    description: One possible path to achieve presumed immunity against a disease - within the context of an authority.
    short: Name of vaccine series

  - name: Immunization.protocolApplied.authority
    cardinality: 0..1
    type: Reference(Organization)
    description: Indicates the authority who published the protocol (e.g. ACIP) that is being followed.
    short: Who is responsible for publishing the recommendations

  - name: Immunization.protocolApplied.targetDisease
    cardinality: 0..* # Changed from 1..* in R3
    type: CodeableConcept
    description: The vaccine preventable disease the dose is being administered against.
    short: Vaccine preventable disease being targeted
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-target-disease
      strength: example

  - name: Immunization.protocolApplied.doseNumberPositiveInt # Renamed from doseSequence(positiveInt) in R3
    cardinality: 1..1 # Choice element doseNumber[x] is 1..1
    type: positiveInt
    description: Nominal position in a series.
    short: Dose number within series

  - name: Immunization.protocolApplied.doseNumberString # New choice type in R4
    cardinality: 1..1 # Choice element doseNumber[x] is 1..1
    type: string
    description: Nominal position in a series.
    short: Dose number within series (string)

  - name: Immunization.protocolApplied.seriesDosesPositiveInt # Renamed from seriesDoses(positiveInt) in R3
    cardinality: 0..1 # Choice element seriesDoses[x] is 0..1
    type: positiveInt
    description: The recommended number of doses to achieve immunity.
    short: Recommended number of doses for immunity

  - name: Immunization.protocolApplied.seriesDosesString # New choice type in R4
    cardinality: 0..1 # Choice element seriesDoses[x] is 0..1
    type: string
    description: The recommended number of doses to achieve immunity.
    short: Recommended number of doses for immunity (string)

constraints:
  - key: imm-1
    severity: Rule
    location: Immunization.education
    description: One of documentType or reference SHALL be present
    expression: documentType.exists() or reference.exists()

```

## Search Parameters

Search parameters defined for the Immunization resource:

```yaml
searchParameters:
  - name: date
    type: date
    description: Vaccination (non)-Administration Date
    expression: Immunization.occurrence
  - name: identifier
    type: token
    description: Business identifier
    expression: Immunization.identifier
  - name: location
    type: reference
    description: The service delivery location or facility in which the vaccine was / was to be administered
    expression: Immunization.location
    targets: [Location]
  - name: lot-number
    type: string
    description: Vaccine Lot Number
    expression: Immunization.lotNumber
  - name: manufacturer
    type: reference
    description: Vaccine Manufacturer
    expression: Immunization.manufacturer
    targets: [Organization] # Note: R4 spec says Ref(Org), Build page says CodeableRef(Org)
  - name: patient
    type: reference
    description: The patient for the vaccination record
    expression: Immunization.patient
    targets: [Patient]
  - name: performer
    type: reference
    description: The practitioner or organization who played a role in the vaccination
    expression: Immunization.performer.actor
    targets: [Practitioner, PractitionerRole, Organization] # Note: Build page adds Patient, RelatedPerson
  - name: reaction
    type: reference
    description: Additional information on reaction
    expression: Immunization.reaction.detail # Note: R4 spec says reaction.detail, Build page says reaction.manifestation
    targets: [Observation]
  - name: reaction-date
    type: date
    description: When reaction started
    expression: Immunization.reaction.date
  - name: reason-code
    type: token
    description: Reason why the vaccine was administered
    expression: Immunization.reasonCode # Note: Build page lists Immunization.reason.concept
  - name: reason-reference
    type: reference
    description: Why immunization occurred
    expression: Immunization.reasonReference # Note: Build page lists Immunization.reason.reference
    targets: [Condition, Observation, DiagnosticReport]
  - name: series
    type: string
    description: The series being followed by the provider
    expression: Immunization.protocolApplied.series
  - name: status
    type: token
    description: Immunization event status
    expression: Immunization.status
  - name: status-reason
    type: token
    description: Reason why the vaccine was not administered
    expression: Immunization.statusReason
  - name: target-disease
    type: token
    description: The target disease the dose is being administered against
    expression: Immunization.protocolApplied.targetDisease
  - name: vaccine-code
    type: token
    description: Vaccine Product Administered
    expression: Immunization.vaccineCode

```