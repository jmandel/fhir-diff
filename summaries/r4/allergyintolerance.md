Okay, here is the AllergyIntolerance R4 resource definition presented in the requested Markdown/YAML format.

---

# FHIR Resource: AllergyIntolerance

```yaml
resource:
  name: AllergyIntolerance
  hl7_workgroup: Patient Care
  maturity_level: 3
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
    - RelatedPerson
```

Risk of harmful or undesirable physiological response which is specific to an individual and associated with exposure to a substance.

## Background and Scope

The AllergyIntolerance resource records a clinical assessment of a propensity, or potential risk, for an individual to have an adverse reaction upon future exposure to a specified substance or class of substance. It also allows for recording information about specific reaction events.

Key aspects include:

*   **Purpose:** Documents allergy/intolerance risks to support clinical care, information exchange, adverse reaction reporting, and decision support.
*   **Substances:** Covers a broad range, including therapeutic substances, foods, biological products, environmental agents (e.g., pollen, dander), metal salts, etc.
*   **Reaction Types:** Differentiates between `allergy` (typically immune-mediated or pseudoallergic) and `intolerance` (non-immune, idiosyncratic reactions). If the distinction is unclear, the `type` element can be omitted. This distinction is less important than documenting the `manifestation` and `criticality`.
*   **Scope:** Focuses on individual sensitivity, distinct from expected reactions like toxicity, overdose, or interactions. It is *not* used for recording adverse events due to process errors (e.g., maladministration), alerts (use `Flag` or `DetectedIssue`), or failed therapy. Reactions to physical stimuli (light, heat) should be recorded as `Condition`.
*   **Causative Agent:** An identified substance (or class) is required. Uncertainty can be noted using `verificationStatus`. Multiple potential causes should each have their own AllergyIntolerance instance initially marked as `unconfirmed`.
*   **Certainty and Status:**
    *   `verificationStatus`: Tracks the certainty of the propensity (e.g., `unconfirmed`, `confirmed`, `refuted`, `entered-in-error`).
    *   `clinicalStatus`: Tracks the current state of the allergy/intolerance itself (e.g., `active`, `inactive`, `resolved`). Required if `verificationStatus` is not `entered-in-error`.
*   **Criticality vs. Severity:**
    *   `criticality`: Assesses the potential *future* clinical harm (low, high, unable-to-assess). Default should be 'low'. 'High' implies absolute contraindication.
    *   `reaction.severity`: Describes the severity (mild, moderate, severe) of a *specific past reaction event*.
*   **Negation:** Statements like "No Known Allergies" (NKA) or "No Known Drug Allergies" (NKDA) can be represented using specific codes in the `code` element or the `substanceExposureRisk` extension (preferred for flexibility). Using `List.emptyReason` is discouraged for NKA to keep all allergy data queryable within AllergyIntolerance resources. A `refuted` verificationStatus indicates a ruled-out allergy.
*   **Relationships:**
    *   Distinct from `RiskAssessment` (general risks) and `Immunization.reaction` (which might *trigger* creating an AllergyIntolerance record).

## Resource Details

The following defines the core elements and constraints of the AllergyIntolerance resource.

```yaml
elements:
  - name: AllergyIntolerance
    description: Risk of harmful or undesirable physiological response which is specific to an individual and associated with exposure to a substance.
    short: Allergy or Intolerance (generally: Risk of adverse reaction to a substance)
    type: DomainResource
    comments: The base resource definition. Substances include therapeutics, food, plant/animal materials, insect venom, etc.

  - name: AllergyIntolerance.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this AllergyIntolerance by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External ids for this item
    comments: This is a business identifier, not a resource identifier.

  - name: AllergyIntolerance.clinicalStatus
    flags: [?!, Σ, I]
    cardinality: 0..1
    type: CodeableConcept
    description: The clinical status of the allergy or intolerance.
    short: active | inactive | resolved
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-clinical|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the codes inactive and resolved that mark the AllergyIntolerance as no longer active.
    comments: Should be present if verificationStatus is not 'entered-in-error' and the code isn't a general negation (like NKA).

  - name: AllergyIntolerance.verificationStatus
    flags: [?!, Σ, I]
    cardinality: 0..1
    type: CodeableConcept
    description: Assertion about certainty associated with the propensity, or potential risk, of a reaction to the identified substance (including pharmaceutical product). The verification status pertains to the allergy or intolerance, itself, not to any specific AllergyIntolerance attribute.
    short: unconfirmed | confirmed | refuted | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-verification|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the codes refuted and entered-in-error that mark the AllergyIntolerance as not currently valid.

  - name: AllergyIntolerance.type
    flags: [Σ]
    cardinality: 0..1
    type: code # Note: Source HTML shows CodeableConcept in definitions but code in structure/examples/bindings. Using 'code' per structure/binding.
    description: Identification of the underlying physiological mechanism for the reaction risk.
    short: allergy | intolerance - Underlying mechanism (if known)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-type|4.0.1
      strength: required # Note: Binding strength is 'preferred' in definitions text, but 'required' in structure/bindings table. Using 'required'.
    comments: Omit if unclear whether it's an allergy or intolerance. Many legacy systems captured this.

  - name: AllergyIntolerance.category
    flags: [Σ]
    cardinality: 0..*
    type: code
    description: Category of the identified substance.
    short: food | medication | environment | biologic
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-category|4.0.1
      strength: required
    comments: Often derivable from coded substance. Use with caution as categorization can be subjective.

  - name: AllergyIntolerance.criticality
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Estimate of the potential clinical harm, or seriousness, of the reaction to the identified substance.
    short: low | high | unable-to-assess
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-criticality|4.0.1
      strength: required
    comments: Represents potential future harm. Default is 'low'. 'High' implies absolute contraindication. Differs from reaction severity.

  - name: AllergyIntolerance.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Code for an allergy or intolerance statement (either a positive or a negated/excluded statement). This may be a code for a substance or pharmaceutical product (e.g., "Latex"), an allergy/intolerance condition (e.g., "Latex allergy"), or a negated statement (e.g., "No known allergy", "No latex allergy").
    short: Code that identifies the allergy or intolerance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-code
      strength: example
    comments: Strongly recommend using terminology (RxNorm, SNOMED CT, etc.). If substance/product is coded, implies positive allergy/intolerance unless 'type' or 'verificationStatus' indicate otherwise. Consider 'substanceExposureRisk' extension as alternative for structured negation.

  - name: AllergyIntolerance.patient
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient)
    description: The patient who has the allergy or intolerance.
    short: Who the allergy or intolerance is for

  - name: AllergyIntolerance.encounter
    cardinality: 0..1
    type: Reference(Encounter)
    description: The encounter when the allergy or intolerance was asserted.
    short: Encounter when the allergy or intolerance was asserted

  - name: AllergyIntolerance.onsetDateTime
    cardinality: 0..1 # Choice[x] element
    type: dateTime
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified. (DateTime specific)
    short: When allergy or intolerance was identified (DateTime)

  - name: AllergyIntolerance.onsetAge
    cardinality: 0..1 # Choice[x] element
    type: Age
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified. (Age specific)
    short: When allergy or intolerance was identified (Age)

  - name: AllergyIntolerance.onsetPeriod
    cardinality: 0..1 # Choice[x] element
    type: Period
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified. (Period specific)
    short: When allergy or intolerance was identified (Period)

  - name: AllergyIntolerance.onsetRange
    cardinality: 0..1 # Choice[x] element
    type: Range
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified. (Range specific)
    short: When allergy or intolerance was identified (Range)

  - name: AllergyIntolerance.onsetString
    cardinality: 0..1 # Choice[x] element
    type: string
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified. (String specific)
    short: When allergy or intolerance was identified (string)

  - name: AllergyIntolerance.recordedDate
    cardinality: 0..1
    type: dateTime
    description: The recordedDate represents when this particular AllergyIntolerance record was created in the system, which is often a system-generated date.
    short: Date allergy or intolerance was first recorded
    comments: Useful for establishing presence before a certain date when onset is unknown. Preserve original if possible.

  - name: AllergyIntolerance.recorder
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson) # R4 version added PractitionerRole/RelatedPerson
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the sensitivity

  - name: AllergyIntolerance.asserter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole) # R4 version added PractitionerRole
    description: The source of the information about the allergy that is recorded.
    short: Source of the information about the allergy

  - name: AllergyIntolerance.lastOccurrence # Renamed from lastDate in some previous versions, matches R4 name lastOccurrence
    cardinality: 0..1
    type: dateTime
    description: Represents the date and/or time of the last known occurrence of a reaction event.
    short: Date(/time) of last known occurrence of a reaction
    comments: Can use note for textual descriptions like 'In Childhood'.

  - name: AllergyIntolerance.note
    cardinality: 0..*
    type: Annotation
    description: Additional narrative about the propensity for the Adverse Reaction, not captured in other fields.
    short: Additional text not captured in other fields
    comments: For general condition notes, not specific reaction event notes.

  - name: AllergyIntolerance.reaction
    cardinality: 0..*
    type: BackboneElement
    description: Details about each adverse reaction event linked to exposure to the identified substance.
    short: Adverse Reaction Events linked to exposure to substance

  - name: AllergyIntolerance.reaction.substance
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the specific substance (or pharmaceutical product) considered to be responsible for the Adverse Reaction event. Note: the substance for a specific reaction may be different from the substance identified as the cause of the risk, but it must be consistent with it.
    short: Specific substance or pharmaceutical product considered to be responsible for event
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/substance-code
      strength: example
    comments: Should align with AllergyIntolerance.code but can be more specific (e.g., brand name if code is generic).

  - name: AllergyIntolerance.reaction.manifestation
    cardinality: 1..*
    type: CodeableConcept # Note: Source HTML definition says CodeableReference(Observation), but structure table says CodeableConcept. Using CodeableConcept per structure table/binding.
    description: Clinical symptoms and/or signs that are observed or associated with the adverse reaction event.
    short: Clinical symptoms/signs associated with the Event
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings # Based on SNOMED CT Clinical Findings example binding
      strength: example
    comments: Prefer coded terms (SNOMED CT, ICD-10).

  - name: AllergyIntolerance.reaction.description
    cardinality: 0..1
    type: string
    description: Text description about the reaction as a whole, including details of the manifestation if required.
    short: Description of the event as a whole

  - name: AllergyIntolerance.reaction.onset
    cardinality: 0..1
    type: dateTime
    description: Record of the date and/or time of the onset of the Reaction.
    short: Date(/time) when manifestations showed

  - name: AllergyIntolerance.reaction.severity
    cardinality: 0..1
    type: code
    description: Clinical assessment of the severity of the reaction event as a whole, potentially considering multiple different manifestations.
    short: mild | moderate | severe (of event as a whole)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/reaction-event-severity|4.0.1
      strength: required
    comments: Subjective assessment of a specific past event. Differs from overall criticality.

  - name: AllergyIntolerance.reaction.exposureRoute
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the route by which the subject was exposed to the substance.
    short: How the subject was exposed to the substance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/route-codes # Based on SNOMED CT Route Codes example binding
      strength: example

  - name: AllergyIntolerance.reaction.note
    cardinality: 0..*
    type: Annotation
    description: Additional text about the adverse reaction event not captured in other fields.
    short: Text about event not captured in other fields
    comments: For notes specific to this reaction event.

constraints:
  - key: ait-1
    severity: rule # Mapped from 'Rule'
    location: (base) # Mapped from (base)
    description: AllergyIntolerance.clinicalStatus SHALL be present if verificationStatus is not entered-in-error.
    expression: verificationStatus.coding.where(system = 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification' and code = 'entered-in-error').exists() or clinicalStatus.exists()
  - key: ait-2
    severity: rule # Mapped from 'Rule'
    location: (base) # Mapped from (base)
    description: AllergyIntolerance.clinicalStatus SHALL NOT be present if verification Status is entered-in-error
    expression: verificationStatus.coding.where(system = 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification' and code = 'entered-in-error').empty() or clinicalStatus.empty()

```

## Search Parameters

Search parameters defined for the AllergyIntolerance resource:

```yaml
searchParameters:
  - name: asserter
    type: reference
    description: Source of the information about the allergy
    expression: AllergyIntolerance.asserter
    targets: [Practitioner, Patient, PractitionerRole, RelatedPerson]
  - name: category
    type: token
    description: food | medication | environment | biologic
    expression: AllergyIntolerance.category
  - name: clinical-status
    type: token
    description: active | inactive | resolved
    expression: AllergyIntolerance.clinicalStatus
  - name: code
    type: token
    description: Code that identifies the allergy or intolerance
    expression: AllergyIntolerance.code | AllergyIntolerance.reaction.substance # Combined expression based on description
  - name: criticality
    type: token
    description: low | high | unable-to-assess
    expression: AllergyIntolerance.criticality
  - name: date
    type: date
    description: Date first version of the resource instance was recorded
    expression: AllergyIntolerance.recordedDate
  - name: identifier
    type: token
    description: External ids for this item
    expression: AllergyIntolerance.identifier
  - name: last-date # Name from search param list
    type: date
    description: Date(/time) of last known occurrence of a reaction
    expression: AllergyIntolerance.lastOccurrence # Mapped element name
  - name: manifestation
    type: token
    description: Clinical symptoms/signs associated with the Event
    expression: AllergyIntolerance.reaction.manifestation
  - name: onset
    type: date
    description: Date(/time) when manifestations showed
    expression: AllergyIntolerance.reaction.onset
  - name: patient
    type: reference
    description: Who the sensitivity is for
    expression: AllergyIntolerance.patient
    targets: [Patient]
  - name: recorder
    type: reference
    description: Who recorded the sensitivity
    expression: AllergyIntolerance.recorder
    targets: [Practitioner, Patient, PractitionerRole, RelatedPerson]
  - name: route
    type: token
    description: How the subject was exposed to the substance
    expression: AllergyIntolerance.reaction.exposureRoute
  - name: severity
    type: token
    description: mild | moderate | severe (of event as a whole)
    expression: AllergyIntolerance.reaction.severity
  - name: type
    type: token
    description: allergy | intolerance - Underlying mechanism (if known)
    expression: AllergyIntolerance.type
  - name: verification-status
    type: token
    description: unconfirmed | confirmed | refuted | entered-in-error
    expression: AllergyIntolerance.verificationStatus

```