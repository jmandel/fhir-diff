Okay, here is the FHIR R4 Condition resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Condition (R4)

```yaml
resource:
  name: Condition
  hl7_workgroup: Patient Care
  maturity_level: 3 # Note: The build page indicates 5, but the R4 page states 3. Using R4 page value.
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
    # Note: Group compartment added based on build page, not explicitly listed on R4 page header but relevant due to subject type.
    - Group
```

A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept that has risen to a level of concern.

## Background and Scope

The Condition resource is used to record detailed information about conditions, problems, diagnoses, or other clinically relevant concepts. It serves multiple purposes:

*   **Point-in-Time Diagnosis:** Recording a diagnosis made during an encounter (e.g., `category` = `encounter-diagnosis`).
*   **Problem List Management:** Tracking ongoing health issues or concerns for a patient (e.g., `category` = `problem-list-item`).
*   **General Health Concerns:** Documenting issues expressed by the patient, related person, or care team member that might not be on a formal problem list but still warrant recording due to their impact on health.

**Key Characteristics:**

*   **Broad Applicability:** Can represent diseases, illnesses, injuries, symptoms (when persistent or requiring management), health states (like pregnancy), post-procedural states (like amputation status), social factors impacting health (like unemployment), risk factors, and family history items relevant to the patient's current care.
*   **Source Flexibility:** Conditions can be asserted by clinicians, patients, related persons, or other care team members (captured in `asserter`). The `recorder` field captures who entered the information into the system.
*   **Clinical Status:** `clinicalStatus` tracks the state of the condition itself (e.g., `active`, `inactive`, `resolved`). `verificationStatus` tracks the certainty of the diagnosis (e.g., `confirmed`, `provisional`, `refuted`). These are modifier elements.
*   **Onset and Abatement:** `onset[x]` and `abatement[x]` record the start and end (or remission) of the condition, supporting various data types (dateTime, Age, Period, Range, string).
*   **Severity and Staging:** `severity` provides a subjective assessment, while the `stage` element allows for structured recording of clinical or pathological staging, potentially linking to formal assessments (`stage.assessment`).
*   **Evidence:** The `evidence` element links the condition to supporting findings (like symptoms, observations, or diagnostic reports).
*   **Negation/Absence:** Generally, Condition is not used for asserting absence. "No known problems" might be coded or handled via `List.emptyReason`. Refuted conditions (`verificationStatus` = `refuted`) are used when a previously suspected condition is disproven. Specific questions about condition absence (e.g., pre-op checks) are better handled by `QuestionnaireResponse` or `Observation`.

**Boundaries:**

*   **Observation vs. Condition:** Use `Observation` for transient signs/symptoms or findings that contribute to establishing a condition diagnosis. Use `Condition` for persistent symptoms requiring management, diagnoses, or long-term health concerns.
*   **AllergyIntolerance vs. Condition:** While an allergy can be represented as a Condition, the `AllergyIntolerance` resource is required for actionable decision support regarding allergies/intolerances.
*   **Encounter Diagnosis:** While Condition can represent an encounter diagnosis (`category` = `encounter-diagnosis`), the `Encounter.diagnosis` element provides specific context like role (admission, discharge) and rank within that encounter.

## Resource Details

The following defines the core elements and constraints of the Condition resource (based on FHIR R4).

```yaml
elements:
  - name: Condition
    description: A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept that has risen to a level of concern.
    short: Detailed information about conditions, problems or diagnoses
    type: DomainResource
    comments: The base resource definition. Note specific constraints apply (see constraints section).

  - name: Condition.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this condition by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this condition

  - name: Condition.clinicalStatus
    flags: [?!, Σ, I] # I from con-3, con-4, con-5
    cardinality: 0..1 # Note: Build page says 1..1, R4 page says 0..1. R4 page structure table takes precedence for R4 definition. Guideline con-3 suggests it should be present for problem-list-items not entered-in-error.
    type: CodeableConcept
    description: The clinical status of the condition.
    short: active | recurrence | relapse | inactive | remission | resolved # Build page adds 'unknown'
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-clinical # R4 version
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains codes that mark the condition as no longer active.
    comments: Required since it is a modifier if present. For problem list items, should not be unknown. May be unknown for encounter diagnoses derived from claims.

  - name: Condition.verificationStatus
    flags: [?!, Σ, I] # I from con-3, con-5
    cardinality: 0..1
    type: CodeableConcept
    description: The verification status to support the clinical status of the condition. The verification status pertains to the condition, itself, not to any specific condition attribute.
    short: unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-ver-status # R4 version
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the code 'refuted' and 'entered-in-error' which mark the Condition as not currently valid.
    comments: Not always required (e.g., symptom in ED). Clinical judgment might require more specific codes (e.g., SNOMED).

  - name: Condition.category
    flags: [I] # I from con-3
    cardinality: 0..*
    type: CodeableConcept
    description: A category assigned to the condition.
    short: problem-list-item | encounter-diagnosis
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-category # R4 version
      strength: extensible # R4 spec page says extensible, build page says preferred. Following R4 spec page.
    comments: Categorization is often contextual.

  - name: Condition.severity
    cardinality: 0..1
    type: CodeableConcept
    description: A subjective assessment of the severity of the condition as evaluated by the clinician.
    short: Subjective severity of condition
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-severity # R4 version
      strength: preferred
    comments: Coding severity with terminology is preferred.

  - name: Condition.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the condition, problem or diagnosis.
    short: Identification of the condition, problem or diagnosis
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code # R4 version
      strength: example
    comments: May include codes for "history of", "risk of", "fear of", or negated conditions if appropriate terminology is used.

  - name: Condition.bodySite
    flags: [Σ, I] # I from con-4 (Build page)
    cardinality: 0..*
    type: CodeableConcept
    description: The anatomical location where this condition manifests itself.
    short: Anatomical location, if relevant
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site # R4 version
      strength: example
    comments: Only used if not implicit in Condition.code. Should not be present if Condition.bodyStructure is used (per build page constraint con-4).

  # Note: Condition.bodyStructure is present in the build page definitions but not R4 page. Omitting for strict R4 representation based on user request for R4.
  # - name: Condition.bodyStructure
  #   flags: [I] # I from con-4 (Build page)
  #   cardinality: 0..1
  #   type: Reference(BodyStructure)
  #   description: Indicates the body structure on the subject's body where this condition manifests itself.
  #   short: Anatomical body structure
  #   comments: Should be consistent with Condition.code. Cannot be used if Condition.bodySite is used.

  - name: Condition.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: Indicates the patient or group who the condition record is associated with.
    short: Who has the condition?
    comments: Group is typically used for veterinary or public health.

  - name: Condition.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this Condition was created or to which the creation of this record is tightly associated.
    short: Encounter created as part of / associated with
    comments: Indicates the encounter this record is associated with, which might differ from the encounter where the condition was first known.

  - name: Condition.onset[x]
    flags: [Σ]
    cardinality: 0..1
    # type: Choice of dateTime, Age, Period, Range, string - represented implicitly by specific element names below
    description: Estimated or actual date or date-time the condition, situation, or concern began, in the opinion of the clinician.
    short: Estimated or actual date, date-time, or age of onset
    comments: Age for patient-reported age; Period for imprecise time frame; Range for imprecise age range. Ambiguity may exist regarding whether onset applies to the current code or an earlier representation (e.g., onset of asthma vs. onset of severe asthma).

  - name: Condition.onsetDateTime
    # Part of onset[x] choice
    cardinality: 0..1
    type: dateTime
    description: Estimated or actual date/time of onset.
    short: Estimated or actual date/time of onset

  - name: Condition.onsetAge
    # Part of onset[x] choice
    cardinality: 0..1
    type: Age
    description: Estimated or actual age of onset.
    short: Estimated or actual age of onset

  - name: Condition.onsetPeriod
    # Part of onset[x] choice
    cardinality: 0..1
    type: Period
    description: Estimated or actual period of onset.
    short: Estimated or actual period of onset

  - name: Condition.onsetRange
    # Part of onset[x] choice
    cardinality: 0..1
    type: Range
    description: Estimated or actual range of ages of onset.
    short: Estimated or actual range of ages of onset

  - name: Condition.onsetString
    # Part of onset[x] choice
    cardinality: 0..1
    type: string
    description: Estimated or actual onset expressed as string.
    short: Estimated or actual onset as string

  - name: Condition.abatement[x]
    flags: [I] # I from con-4
    cardinality: 0..1
    # type: Choice of dateTime, Age, Period, Range, string - represented implicitly by specific element names below
    description: The date or estimated date that the condition resolved or went into remission. This is called "abatement" because of the many overloaded connotations associated with "remission" or "resolution" - Some conditions, such as chronic conditions, are never really resolved, but they can abate.
    short: When in resolution/remission
    comments: No explicit distinction between resolution/remission. Age for patient-reported age of abatement. If absent, assume condition is still valid. AbatementString implies condition is abated. Ambiguity may exist similar to onset[x].

  - name: Condition.abatementDateTime
    # Part of abatement[x] choice
    cardinality: 0..1
    type: dateTime
    description: Date/time condition abated.
    short: Date/time condition abated

  - name: Condition.abatementAge
    # Part of abatement[x] choice
    cardinality: 0..1
    type: Age
    description: Age condition abated.
    short: Age condition abated

  - name: Condition.abatementPeriod
    # Part of abatement[x] choice
    cardinality: 0..1
    type: Period
    description: Period condition abated.
    short: Period condition abated

  - name: Condition.abatementRange
    # Part of abatement[x] choice
    cardinality: 0..1
    type: Range
    description: Age range condition abated.
    short: Age range condition abated

  - name: Condition.abatementString
    # Part of abatement[x] choice
    cardinality: 0..1
    type: string
    description: Condition abatement expressed as string.
    short: Condition abatement as string

  - name: Condition.recordedDate
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The recordedDate represents when this particular Condition record was created in the system, which is often a system-generated date.
    short: Date record was first recorded
    comments: Can be used to establish presence on/before a date when onset is unknown. Preserve sender's value if provided; otherwise, receipt timestamp might be used. Renamed from 'assertedDate' in R3.

  - name: Condition.recorder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson)
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the condition
    comments: The recorder is the most recent author, might differ from the asserter. Added in R4.

  - name: Condition.asserter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson) # Build page adds Device, sticking to R4 page definition.
    description: Individual who is making the condition statement.
    short: Person who asserts this condition
    comments: Could be a Practitioner, Patient, RelatedPerson. If data enterer differs, use Provenance.

  - name: Condition.stage
    flags: [I] # I from con-1
    cardinality: 0..* # Changed from 0..1 in R3
    type: BackboneElement
    description: Clinical stage or grade of a condition. May include formal severity assessments.
    short: Stage/grade, usually assessed formally

  - name: Condition.stage.summary
    flags: [I] # I from con-1
    cardinality: 0..1
    type: CodeableConcept
    description: A simple summary of the stage such as "Stage 3". The determination of the stage is disease-specific.
    short: Simple summary (disease specific)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-stage # R4 version
      strength: example

  - name: Condition.stage.assessment
    flags: [I] # I from con-1
    cardinality: 0..*
    type: Reference(ClinicalImpression | DiagnosticReport | Observation)
    description: Reference to a formal record of the evidence on which the staging assessment is based.
    short: Formal record of assessment

  - name: Condition.stage.type
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of staging, such as pathological or clinical staging.
    short: Kind of staging
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-stage-type # R4 version
      strength: example
    comments: Added in R4.

  - name: Condition.evidence
    flags: [Σ, I] # I from con-2
    cardinality: 0..*
    type: BackboneElement
    description: Supporting evidence / manifestations that are the basis of the Condition's verification status, such as evidence that confirmed or refuted the condition.
    short: Supporting evidence / manifestations

  - name: Condition.evidence.code
    flags: [Σ, I] # I from con-2
    cardinality: 0..*
    type: CodeableConcept
    description: A manifestation or symptom that led to the recording of this condition.
    short: Manifestation/symptom code
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/manifestation-or-symptom # R4 version
      strength: example

  - name: Condition.evidence.detail
    flags: [Σ, I] # I from con-2
    cardinality: 0..*
    type: Reference(Any)
    description: Links to other relevant information, including pathology reports.
    short: Supporting information found elsewhere (report, observation, etc.)

  - name: Condition.note
    cardinality: 0..*
    type: Annotation
    description: Additional information about the Condition. This is a general notes/comments entry for description of the Condition, its diagnosis and prognosis.
    short: Additional information about the Condition
```

```yaml
constraints:
  # Constraints from R4 Page Invariant Table
  - key: con-1 # Renumbered based on build page for consistency
    severity: Rule
    location: Condition.stage
    description: Stage SHALL have summary or assessment
    expression: summary.exists() or assessment.exists()
  - key: con-2 # Renumbered based on build page for consistency
    severity: Rule
    location: Condition.evidence
    description: evidence SHALL have code or details
    expression: code.exists() or detail.exists()
  - key: con-3 # Renumbered based on build page for consistency
    severity: Guideline # Note: R4 page says Guideline, Build page says Warning. Using R4 severity.
    location: (base)
    description: Condition.clinicalStatus SHALL be present if verificationStatus is not entered-in-error and category is problem-list-item
    expression: clinicalStatus.exists() or verificationStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-ver-status' and code = 'entered-in-error').exists() or category.select($this='problem-list-item').empty()
    # Build page constraint con-2 is similar but phrased differently:
    # description: If category is problems list item, the clinicalStatus should not be unknown
    # expression: category.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-category' and code='problem-list-item').exists() implies clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and code='unknown').exists().not()
  - key: con-4 # Renumbered based on build page for consistency
    severity: Rule
    location: (base)
    description: If condition is abated, then clinicalStatus must be either inactive, resolved, or remission
    expression: abatement.empty() or clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and (code='resolved' or code='remission' or code='inactive')).exists()
    # Build page expression (con-3) is slightly different but equivalent:
    # expression: abatement.exists() implies (clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and (code='inactive' or code='resolved' or code='remission')).exists())
  - key: con-5 # Renumbered based on build page for consistency
    severity: Rule
    location: (base)
    description: Condition.clinicalStatus SHALL NOT be present if verification Status is entered-in-error
    expression: verificationStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-ver-status' and code='entered-in-error').empty() or clinicalStatus.empty()
  # Constraint from Build Page (con-4) - Applies if bodyStructure were included, but kept for reference.
  # - key: con-4-build # Using different key to distinguish
  #   severity: Rule
  #   location: (base)
  #   description: bodyStructure SHALL only be present if Condition.bodySite is not present
  #   expression: bodySite.exists() implies bodyStructure.empty()
```

## Search Parameters

Search parameters defined for the Condition resource (R4):

```yaml
searchParameters:
  - name: abatement-age
    type: quantity
    description: Abatement as age or age range
    expression: Condition.abatement.as(Age) | Condition.abatement.as(Range)
  - name: abatement-date
    type: date
    description: Date-related abatements (dateTime and period)
    expression: Condition.abatement.as(dateTime) | Condition.abatement.as(Period)
  - name: abatement-string
    type: string
    description: Abatement as a string
    expression: Condition.abatement.as(string)
  - name: asserter
    type: reference
    description: Person who asserts this condition
    expression: Condition.asserter
    targets: [Practitioner, Patient, PractitionerRole, RelatedPerson] # R4 page spec, build adds Device
  - name: body-site
    type: token
    description: Anatomical location, if relevant
    expression: Condition.bodySite
  - name: category
    type: token
    description: The category of the condition
    expression: Condition.category
  - name: clinical-status
    type: token
    description: The clinical status of the condition
    expression: Condition.clinicalStatus
  - name: code
    type: token
    description: Code for the condition
    expression: Condition.code
  - name: encounter
    type: reference
    description: Encounter created as part of
    expression: Condition.encounter
    targets: [Encounter]
  - name: evidence
    type: token
    description: Manifestation/symptom code
    expression: Condition.evidence.code
  - name: evidence-detail
    type: reference
    description: Supporting information found elsewhere
    expression: Condition.evidence.detail
    targets: [Any] # Reference(Any) type
  - name: identifier
    type: token
    description: A unique identifier of the condition record
    expression: Condition.identifier
  - name: onset-age
    type: quantity
    description: Onsets as age or age range
    expression: Condition.onset.as(Age) | Condition.onset.as(Range)
  - name: onset-date
    type: date
    description: Date related onsets (dateTime and Period)
    expression: Condition.onset.as(dateTime) | Condition.onset.as(Period)
  - name: onset-info
    type: string
    description: Onsets as a string
    expression: Condition.onset.as(string)
  - name: patient
    type: reference
    description: Who has the condition? (Patient)
    expression: Condition.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: recorded-date
    type: date
    description: Date record was first recorded
    expression: Condition.recordedDate
  - name: severity
    type: token
    description: The severity of the condition
    expression: Condition.severity
  - name: stage
    type: token
    description: Simple summary (disease specific) stage
    expression: Condition.stage.summary
  - name: subject
    type: reference
    description: Who has the condition? (Patient or Group)
    expression: Condition.subject
    targets: [Group, Patient]
  - name: verification-status
    type: token
    description: unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    expression: Condition.verificationStatus
```