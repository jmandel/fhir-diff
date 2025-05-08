Okay, here is the AllergyIntolerance resource definition presented in the requested Markdown and YAML format, based on the provided HTML content.

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

This resource records a clinical assessment of an allergy or intolerance – the propensity or potential risk for an individual to have an adverse reaction upon future exposure to a specific substance or class of substance. It captures information about reaction events characterized by harmful or undesirable physiological responses triggered by exposure.

Key aspects include:

*   **Scope:** Covers reactions to therapeutic substances, food, plant/animal materials, insect venom, etc. It focuses on allergies (often immune-mediated) and intolerances (non-immune, idiosyncratic reactions). The distinction can be difficult in practice; if unknown, the `type` element should be omitted.
*   **Purpose:** Used for direct patient care, managing allergy lists, information exchange, informing adverse reaction reporting, and supporting clinical decision support.
*   **Differentiation:**
    *   Records individual sensitivity, distinct from expected reactions like toxicity, overdose, or interactions.
    *   Requires a causative substance; uncertainty is handled via `verificationStatus`. Multiple potential causes should use separate instances.
    *   `Condition` resource should be used for reactions to physical stimuli (light, heat, etc.).
    *   Not used for general adverse events, process failures, failed therapy, or alerts (use `Flag` or `DetectedIssue`).
*   **Substance Granularity:** Can record specific substances (e.g., amoxicillin) or classes (e.g., penicillins).
*   **Criticality vs. Severity:**
    *   `criticality`: Overall potential clinical harm (Low Risk default, High Risk for life-threatening potential). Assesses future risk.
    *   `reaction.severity`: Clinical assessment of a specific reaction event's severity (mild, moderate, severe).
*   **Negation/Absence:** Handles statements like "No Known Allergies" (NKA) or ruling out specific allergies (`verificationStatus` = `refuted`). Use of specific codes (e.g., SNOMED CT: 716186003 for NKA) or the `substanceExposureRisk` extension is preferred over list-level negation (`List.emptyReason`). If an allergy is added, any conflicting "no known..." records must be updated (e.g., to `refuted`).
*   **Verification:** `verificationStatus` tracks the certainty (unconfirmed, presumed, confirmed, refuted, entered-in-error).
*   **Relationships:**
    *   Related to `RiskAssessment` but focuses specifically on substance reactions.
    *   Reactions noted in `Immunization.reaction` should be created as separate `AllergyIntolerance` records if deemed clinically relevant for allergy checking.

## Resource Details

The following defines the core elements and constraints of the AllergyIntolerance resource.

```yaml
elements:
  - name: AllergyIntolerance
    description: Risk of harmful or undesirable physiological response which is specific to an individual and associated with exposure to a substance.
    short: Allergy or Intolerance (generally Risk of adverse reaction to a substance)
    type: DomainResource
    comments: Substances include, but are not limited to, a therapeutic substance administered correctly at an appropriate dosage for the individual; food; material derived from plants or animals; or venom from insect stings.

  - name: AllergyIntolerance.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this AllergyIntolerance by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External ids for this item
    comments: This is a business identifier, not a resource identifier (see discussion). It is best practice for the identifier to only appear on a single resource instance, however business practices may occasionally dictate that multiple resource instances with the same identifier can exist - possibly even with different resource types. For example, multiple Patient and a Person resource instance might share the same social insurance number.

  - name: AllergyIntolerance.clinicalStatus
    flags: [?!, Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The clinical status of the allergy or intolerance.
    short: active | inactive | resolved
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-clinical
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the codes inactive and resolved that mark the AllergyIntolerance as no longer active.
    comments: AllergyIntolerance.clinicalStatus should be present if verificationStatus is not entered-in-error and the AllergyIntolerance.code isn't negated (No Known Allergy, No Drug Allergy, No Food Allergy, No Latex Allergy). Refer to discussion if clinicalStatus is missing data. The data type is CodeableConcept because clinicalStatus has some clinical judgment involved, such that there might need to be more specificity than the required FHIR value set allows. For example, a SNOMED coding might allow for additional specificity.

  - name: AllergyIntolerance.verificationStatus
    flags: [?!, Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Assertion about certainty associated with the propensity, or potential risk, of a reaction to the identified substance (including pharmaceutical product). The verification status pertains to the allergy or intolerance, itself, not to any specific AllergyIntolerance attribute.
    short: unconfirmed | presumed | confirmed | refuted | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-verification
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the codes refuted and entered-in-error that mark the AllergyIntolerance as not currently valid.
    comments: The data type is CodeableConcept because verificationStatus has some clinical judgment involved, such that there might need to be more specificity than the required FHIR value set allows. For example, a SNOMED coding might allow for additional specificity.

  - name: AllergyIntolerance.type
    flags: [Σ, TU]
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the underlying physiological mechanism for the reaction risk.
    short: allergy | intolerance - Underlying mechanism (if known)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-type
      strength: preferred
    comments: Allergic (typically immune-mediated) reactions have been traditionally regarded as an indicator for potential escalation to significant future risk... If, as is commonly the case, it is unclear whether the reaction is due to an allergy or an intolerance, then the type element should be omitted from the resource.

  - name: AllergyIntolerance.category
    flags: [Σ]
    cardinality: 0..*
    type: code
    description: Category of the identified substance.
    short: food | medication | environment | biologic
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-category
      strength: required
    comments: This data element has been included because it is currently being captured in some clinical systems... category should be used with caution because category can be subjective based on the sender.

  - name: AllergyIntolerance.criticality
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Estimate of the potential clinical harm, or seriousness, of the reaction to the identified substance.
    short: low | high | unable-to-assess
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergy-intolerance-criticality
      strength: required
    comments: The default criticality value... 'High Risk' is flagged if the clinician has identified a propensity for a more serious or potentially life-threatening reaction... Criticality is the worst it could be in the future (i.e. situation-agnostic) whereas severity is situation-dependent.

  - name: AllergyIntolerance.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Code for an allergy or intolerance statement (either a positive or a negated/excluded statement). This may be a code for a substance or pharmaceutical product... or a general or categorical negated statement (e.g., "No known allergy"...). Note the substance for a specific reaction may be different... but must be consistent...
    short: Code that identifies the allergy or intolerance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/allergyintolerance-code
      strength: example
    comments: It is strongly recommended that this element be populated using a terminology... Plain text should only be used if there is no appropriate terminology available... When a substance or product code is specified... the "default" semantic context is that this is a positive statement... The 'substanceExposureRisk' extension is available as a structured and more flexible alternative... If the 'substanceExposureRisk' extension is present, the AllergyIntolerance.code element SHALL be omitted.

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

  - name: AllergyIntolerance.onset[x]
    cardinality: 0..1
    type: dateTime | Age | Period | Range | string
    description: Estimated or actual date, date-time, or age when allergy or intolerance was identified.
    short: When allergy or intolerance was identified
    comments: Age is generally used when the patient reports an age... Period is generally used to convey an imprecise onset... Range is generally used to convey an imprecise age range...

  - name: AllergyIntolerance.recordedDate
    cardinality: 0..1
    type: dateTime
    description: The recordedDate represents when this particular AllergyIntolerance record was created in the system, which is often a system-generated date.
    short: Date allergy or intolerance was first recorded
    comments: When onset date is unknown, recordedDate can be used to establish if the allergy or intolerance was present on or before a given date...

  - name: AllergyIntolerance.recorder
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson | Organization)
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the sensitivity
    comments: Because the recorder takes responsibility for accurately recording information in the record, the recorder is the most recent author. The recorder might or might not be the asserter. By contrast, the recordedDate is when the allergy or intolerance was first recorded.

  - name: AllergyIntolerance.asserter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole)
    description: The source of the information about the allergy that is recorded.
    short: Source of the information about the allergy
    comments: The recorder takes responsibility for the content, but can reference the source from where they got it.

  - name: AllergyIntolerance.lastReactionOccurrence
    cardinality: 0..1
    type: dateTime
    description: Represents the date and/or time of the last known occurrence of a reaction event.
    short: Date(/time) of last known occurrence of a reaction
    comments: This date may be replicated by one of the Onset of Reaction dates. Where a textual representation of the date of last occurrence is required e.g. 'In Childhood', '10 years ago' the AllergyIntolerance.note element should be used.

  - name: AllergyIntolerance.note
    cardinality: 0..*
    type: Annotation
    description: Additional narrative about the propensity for the Adverse Reaction, not captured in other fields.
    short: Additional text not captured in other fields
    comments: For example including reason for flagging a seriousness of 'High Risk'; and instructions related to future exposure... The notes should be related to an allergy or intolerance as a condition in general... For episode notes use AllergyIntolerance.reaction...

  - name: AllergyIntolerance.reaction
    flags: [TU]
    cardinality: 0..*
    type: BackboneElement
    description: Details about each adverse reaction event linked to exposure to the identified substance.
    short: Adverse Reaction Events linked to exposure to substance

  - name: AllergyIntolerance.reaction.substance
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the specific substance (or pharmaceutical product) considered to be responsible for the Adverse Reaction event. Note the substance for a specific reaction may be different from the substance identified as the cause of the risk, but it must be consistent with it...
    short: Specific substance or pharmaceutical product considered to be responsible for event
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/substance-code
      strength: example
    comments: Coding of the specific substance... with a terminology capable of triggering decision support should be used wherever possible... In the case of an allergy... to a class of substances... the 'reaction.substance' element could be used to code the specific substance...

  - name: AllergyIntolerance.reaction.manifestation
    cardinality: 1..*
    type: CodeableReference(Observation)
    description: Clinical symptoms and/or signs that are observed or associated with the adverse reaction event.
    short: Clinical symptoms/signs associated with the Event
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example
    comments: Manifestation can be expressed as a single word, phrase or brief description... It is preferable that manifestation should be coded with a terminology...

  - name: AllergyIntolerance.reaction.description
    cardinality: 0..1
    type: string
    description: Text description about the reaction as a whole, including details of the manifestation if required.
    short: Description of the event as a whole
    comments: Use the description to provide any details of a particular event... Information, related to the event, but not describing a particular care should be captured in the note field.

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
      valueSet: http://hl7.org/fhir/ValueSet/reaction-event-severity
      strength: required
    comments: It is acknowledged that this assessment is very subjective... Objective scales can be included... as extensions.

  - name: AllergyIntolerance.reaction.exposureRoute
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the route by which the subject was exposed to the substance.
    short: How the subject was exposed to the substance
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/route-codes
      strength: example
    comments: Coding of the route of exposure with a terminology should be used wherever possible.

  - name: AllergyIntolerance.reaction.note
    cardinality: 0..*
    type: Annotation
    description: Additional text about the adverse reaction event not captured in other fields.
    short: Text about event not captured in other fields
    comments: Use this field to record information indirectly related to a particular event and not captured in the description...

constraints: [] # No formal constraints were listed in the provided HTML snippet

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
  - name: code # Shared name, see https://hl7.org/fhir/searchparameter-registry.html#clinical-code
    type: token
    description: Code that identifies the allergy or intolerance
    expression: AllergyIntolerance.code | AllergyIntolerance.reaction.substance
  - name: criticality
    type: token
    description: low | high | unable-to-assess
    expression: AllergyIntolerance.criticality
  - name: date # Shared name, see https://hl7.org/fhir/searchparameter-registry.html#clinical-date
    type: date
    description: Date first version of the resource instance was recorded
    expression: AllergyIntolerance.recordedDate
  - name: identifier # Shared name, see https://hl7.org/fhir/searchparameter-registry.html#clinical-identifier
    type: token
    description: External ids for this item
    expression: AllergyIntolerance.identifier
  - name: last-reaction-date
    type: date
    description: Date(/time) of last known occurrence of a reaction
    expression: AllergyIntolerance.lastReactionOccurrence
  - name: manifestation-code
    type: token
    description: Clinical symptoms/signs associated with the Event
    expression: AllergyIntolerance.reaction.manifestation.concept
  - name: manifestation-reference
    type: reference
    description: Clinical symptoms/signs associated with the Event
    expression: AllergyIntolerance.reaction.manifestation.reference
    targets: [Observation] # Derived from element type CodeableReference(Observation)
  - name: patient # Shared name, see https://hl7.org/fhir/searchparameter-registry.html#clinical-patient
    type: reference
    description: Who the sensitivity is for
    expression: AllergyIntolerance.patient
    targets: [Patient]
  - name: route
    type: token
    description: How the subject was exposed to the substance
    expression: AllergyIntolerance.reaction.exposureRoute
  - name: severity
    type: token
    description: mild | moderate | severe (of event as a whole)
    expression: AllergyIntolerance.reaction.severity
  - name: type # Shared name, see https://hl7.org/fhir/searchparameter-registry.html#clinical-type
    type: token
    description: allergy | intolerance - Underlying mechanism (if known)
    expression: AllergyIntolerance.type
  - name: verification-status
    type: token
    description: unconfirmed | presumed | confirmed | refuted | entered-in-error
    expression: AllergyIntolerance.verificationStatus

```

---