Okay, here is the Immunization resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Immunization

```yaml
resource:
  name: Immunization
  hl7_workgroup: Public Health
  maturity_level: 5
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
```

Describes the event of a patient being administered a vaccine or a record of an immunization as reported by a patient, a clinician or another party.

## Background and Scope

The Immunization resource records the administration of vaccines to patients (human or animal) across various healthcare settings. It covers both current and historical immunizations. For FHIR purposes, "immunization" and "vaccination" are used synonymously.

Key aspects include:

*   **Scope:** Intended specifically for vaccines. Administration of non-vaccine agents, even those with immunological effects, should use the `MedicationAdministration` resource. If a system *must* use `MedicationAdministration` for a vaccine (e.g., for workflow), it SHOULD also expose an equivalent `Immunization` resource.
*   **Product Details:**
    *   `vaccineCode`: Indicates the type of vaccine (e.g., CVX code). Can be general or specific.
    *   `administeredProduct`: (Optional) Identifies the specific product used, potentially linking to a `Medication` resource for more details (e.g., NDC code).
    *   `manufacturer`, `lotNumber`, `expirationDate`: Capture details directly on `Immunization` but are often derived from the linked `Medication` resource if `administeredProduct` is used.
*   **Relationships:**
    *   `MedicationAdministration`: Used for non-vaccine medications. See "Scope" above for overlap handling.
    *   `AllergyIntolerance`: If an `Immunization.reaction` is identified as an allergy or intolerance, a separate `AllergyIntolerance` resource should be created.
    *   `Communication`: Use this resource to document educational materials provided related to the immunization.
*   **Status Management:**
    *   `status`: Indicates if the event was `completed`, `entered-in-error`, or `not-done`.
    *   `statusReason`: Explains why an immunization marked as `not-done` was not performed.
*   **Data Source:**
    *   `primarySource`: Boolean indicating if the data comes directly from the administering entity (`true`) or from a secondary report (`false`).
    *   `informationSource`: Specifies the source (Patient, Practitioner, Org, etc.) when `primarySource` is `false` or unknown.
*   **Occurrence Time:** `occurrenceDateTime` is preferred. `occurrenceString` can be used for patient-reported events where the exact date isn't known (though strongly discouraged for provider records). Timezone handling is important.
*   **Potency:** `isSubpotent` flag and `subpotentReason` capture issues like recalls or partial administration.

## Resource Details

The following defines the core elements and constraints of the Immunization resource.

```yaml
elements:
  - name: Immunization
    description: Describes the event of a patient being administered a vaccine or a record of an immunization as reported by a patient, a clinician or another party.
    short: Immunization event information
    type: DomainResource

  - name: Immunization.identifier
    cardinality: 0..*
    type: Identifier
    description: A unique identifier assigned to this immunization record.
    short: Business identifier

  - name: Immunization.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | MedicationRequest | ServiceRequest | ImmunizationRecommendation)
    description: A plan, order or recommendation fulfilled in whole or in part by this immunization.
    short: Authority that the immunization event is based on
    comments: Allows tracing of an authorization for the Immunization.

  - name: Immunization.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates the current status of the immunization event.
    short: completed | entered-in-error | not-done
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains statuses entered-in-error and not-done which means that the resource should not be treated as valid
    comments: Will generally be set to show that the immunization has been completed or not done.

  - name: Immunization.statusReason
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the reason the immunization event was not performed.
    short: Reason for current status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-status-reason
      strength: example
    comments: This is generally only used for the status of "not-done". The reason for performing the immunization event is captured in reasonCode, not here.

  - name: Immunization.vaccineCode
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Vaccine that was administered or was to be administered.
    short: Vaccine administered
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/vaccine-code
      strength: example
    comments: Multiple codes (e.g., NDC and CVX) can be provided if appropriate for the same vaccine.

  - name: Immunization.administeredProduct
    cardinality: 0..1
    type: CodeableReference(Medication)
    description: An indication of which product was administered to the patient. This is typically a more detailed representation of the concept conveyed by the vaccineCode data element. If a Medication resource is referenced, it may be to a stand-alone resource or a contained resource within the Immunization resource.
    short: Product that was administered

  - name: Immunization.manufacturer
    cardinality: 0..1
    type: CodeableReference(Organization)
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

  - name: Immunization.supportingInformation
    cardinality: 0..*
    type: Reference(Any)
    description: Additional information that is relevant to the immunization (e.g. for a vaccine recipient who is pregnant, the gestational age of the fetus). The reason why a vaccine was given (e.g. occupation, underlying medical condition) should be conveyed in Immunization.reason, not as supporting information. The reason why a vaccine was not given (e.g. contraindication) should be conveyed in Immunization.statusReason, not as supporting information.
    short: Additional information in support of the immunization

  - name: Immunization.occurrenceDateTime
    flags: [Σ]
    cardinality: 1..1 # Choice element, only one occurrence type allowed
    type: dateTime
    description: Date vaccine administered or was to be administered.
    short: Vaccine administration date
    comments: Exact date/time preferred. Preserve original timezone.

  - name: Immunization.occurrenceString
    flags: [Σ]
    cardinality: 1..1 # Choice element, only one occurrence type allowed
    type: string
    description: Date vaccine administered or was to be administered.
    short: Vaccine administration date (string)
    comments: Acceptable when exact date is unknown (e.g., patient recall), but dateTime is strongly preferred.

  - name: Immunization.primarySource
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Indicates whether the data contained in the resource was captured by the individual/organization which was responsible for the administration of the vaccine rather than as 'secondary reported' data documented by a third party. A value of 'true' means this data originated with the individual/organization which was responsible for the administration of the vaccine.
    short: Indicates context the data was captured in
    comments: Reflects the “reliability” of the content.

  - name: Immunization.informationSource
    cardinality: 0..1
    type: CodeableReference(Patient | Practitioner | PractitionerRole | RelatedPerson | Organization)
    description: Typically the source of the data when the report of the immunization event is not based on information from the person who administered the vaccine.
    short: Indicates the source of a reported record
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-origin
      strength: example
    comments: Typically will not be populated if primarySource = True, not required even if primarySource = False.

  - name: Immunization.location
    cardinality: 0..1
    type: Reference(Location)
    description: The service delivery location where the vaccine administration occurred.
    short: The service delivery location

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

  - name: Immunization.performer
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Indicates who performed the immunization event.
    short: Who performed event

  - name: Immunization.performer.function
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the function played by the performer in the immunization event (e.g. ordering provider, administering provider, etc.).
    short: Type of performance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-function
      strength: extensible

  - name: Immunization.performer.actor
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson)
    description: The practitioner or organization who performed the action.
    short: Individual or organization who was performing
    comments: When the individual practitioner who performed the action is known, it is best to send.

  - name: Immunization.note
    flags: [Σ]
    cardinality: 0..*
    type: Annotation
    description: Extra information about the immunization that is not conveyed by the other attributes.
    short: Additional immunization notes

  - name: Immunization.reason
    cardinality: 0..*
    type: CodeableReference(Condition | Observation | DiagnosticReport)
    description: Describes why the immunization occurred in coded or textual form, or Indicates another resource (Condition, Observation or DiagnosticReport) whose existence justifies this immunization.
    short: Why immunization occurred
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-reason
      strength: example

  - name: Immunization.isSubpotent
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Indication if a dose is considered to be subpotent. By default, a dose should be considered to be potent.
    short: Dose potency
    isModifier: true
    modifierReason: This element is labeled as a modifier because an immunization event with a subpotent vaccine doesn't protect the patient the same way as a potent dose.
    comments: Typically retrospective (e.g., recall), but can be immediate (e.g., partial administration).

  - name: Immunization.subpotentReason
    cardinality: 0..*
    type: CodeableConcept
    description: Reason why a dose is considered to be subpotent.
    short: Reason for being subpotent
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-subpotent-reason
      strength: example

  - name: Immunization.programEligibility
    cardinality: 0..*
    type: BackboneElement
    description: Indicates a patient's eligibility for a funding program.
    short: Patient eligibility for a specific vaccination program

  - name: Immunization.programEligibility.program
    cardinality: 1..1
    type: CodeableConcept
    description: Indicates which program the patient had their eligility evaluated for.
    short: The program that eligibility is declared for
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-vaccine-funding-program
      strength: example

  - name: Immunization.programEligibility.programStatus
    cardinality: 1..1
    type: CodeableConcept
    description: Indicates the patient's eligility status for for a specific payment program.
    short: The patient's eligibility status for the program
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-program-eligibility
      strength: example

  - name: Immunization.fundingSource
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
    comments: A reaction may indicate an allergy/intolerance; if so, create a separate AllergyIntolerance resource.

  - name: Immunization.reaction.date
    cardinality: 0..1
    type: dateTime
    description: Date of reaction to the immunization.
    short: When reaction started

  - name: Immunization.reaction.manifestation
    cardinality: 0..1
    type: CodeableReference(Observation)
    description: Details of the reaction.
    short: Additional information on reaction

  - name: Immunization.reaction.reported
    cardinality: 0..1
    type: boolean
    description: Self-reported indicator.
    short: Indicates self-reported reaction

  - name: Immunization.protocolApplied
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
    cardinality: 0..*
    type: CodeableConcept
    description: The vaccine preventable disease the dose is being administered against.
    short: Vaccine preventable disease being targeted
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/immunization-target-disease
      strength: example

  - name: Immunization.protocolApplied.doseNumber
    cardinality: 0..1
    type: CodeableConcept # Changed from positiveInt | string in R4/R4B
    description: Nominal position in a series as intended by the practitioner administering the dose.
    short: Dose number within series
    binding:
      # No official ValueSet defined in core spec, but often uses simple strings/codes
      strength: example
    comments: May be a coded concept (e.g., "Dose 1", "Booster") or text.

  - name: Immunization.protocolApplied.seriesDoses
    cardinality: 0..1
    type: CodeableConcept # Changed from positiveInt | string in R4/R4B
    description: The recommended number of doses to achieve immunity as intended by the practitioner administering the dose.
    short: Recommended number of doses for immunity
    binding:
      # No official ValueSet defined in core spec
      strength: example
    comments: May be a coded concept or text.

```

## Search Parameters

Search parameters defined for the Immunization resource:

```yaml
searchParameters:
  - name: date
    type: date
    description: Vaccination (non)-Administration Date
    expression: (Immunization.occurrence.ofType(dateTime))
  - name: encounter
    type: reference
    description: The Encounter this Immunization was part of
    expression: Immunization.encounter
    targets: [Encounter]
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
    expression: Immunization.manufacturer.reference
    targets: [Organization] # Extracted from CodeableReference(Organization)
  - name: patient
    type: reference
    description: The patient for the vaccination record
    expression: Immunization.patient
    targets: [Patient]
  - name: performer
    type: reference
    description: The practitioner, individual or organization who played a role in the vaccination
    expression: Immunization.performer.actor
    targets: [Practitioner, Organization, Patient, PractitionerRole, RelatedPerson]
  - name: reaction
    type: reference
    description: Additional information on reaction
    expression: Immunization.reaction.manifestation.reference
    targets: [Observation] # Extracted from CodeableReference(Observation)
  - name: reaction-date
    type: date
    description: When reaction started
    expression: Immunization.reaction.date
  - name: reason-code
    type: token
    description: Reason why the vaccine was administered
    expression: Immunization.reason.concept
  - name: reason-reference
    type: reference
    description: Reference to a resource (by instance)
    expression: Immunization.reason.reference
    targets: [Condition, Observation, DiagnosticReport] # Extracted from CodeableReference(...)
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