# FHIR Resource: Condition

```yaml
resource:
  name: Condition
  hl7_workgroup: Patient Care
  maturity_level: 5
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept that has risen to a level of concern.

## Background and Scope

The Condition resource is used to record detailed information about conditions, problems, diagnoses, or other health-related issues that are clinically relevant. This can range from formal diagnoses made during encounters to items on a problem list, or even patient-reported concerns that may not be on a formal list.

Key aspects include:

*   **Broad Definition:** Encompasses clinical assessments (diagnoses), ongoing health issues (problems), and other concerns (e.g., social determinants like unemployment, risk factors like fall susceptibility, post-procedural states like amputation). It can also include states not inherently negative, like pregnancy.
*   **Source:** Conditions can be asserted by clinicians, patients, related persons, or care team members.
*   **Distinction from Observation:** While signs and symptoms are often recorded as `Observation` resources, persistent symptoms managed as distinct issues (e.g., chronic headache before a diagnosis) can be recorded as `Condition`. Symptoms resolved without long-term management or used solely to establish a diagnosis are typically `Observation`.
*   **Distinction from AllergyIntolerance:** While an allergy can be represented as a Condition, the `AllergyIntolerance` resource is necessary for decision support related to allergies/intolerances.
*   **Instance vs. State:** A Condition represents a specific instance (e.g., *this* episode of otitis media), not the general categorical state (e.g., the patient is generally prone to ear infections).
*   **Negation and Absence:**
    *   Use `List.emptyReason` for "no known problems" covering the entire scope. Alternatively, use a specific code within `Condition.code` (e.g., SNOMED CT: 160245001).
    *   Refuted conditions (previously believed present, now disproven) are marked using `verificationStatus` = `refuted`.
    *   Absence identified through checklists (e.g., "Are you pregnant? No") should generally be recorded using `QuestionnaireResponse` or `Observation`, not Condition.
    *   Patient denial of a condition can be noted in `Condition.note`.
*   **Code Specificity:** The `Condition.code` might pre-coordinate details like stage or location (especially with SNOMED CT). If so, dedicated elements like `stage` or `bodySite` should not contradict the code.
*   **Evidence:** `Condition.evidence` links to supporting manifestations or assessments (Observations, other Conditions, DiagnosticReports etc.) that form the basis for the Condition assertion. It is *not* used for causality (use extensions or AdverseEvent for that).
*   **Role and Rank:** The role (e.g., admission, discharge) and rank (primary, secondary) of a diagnosis within a specific encounter are handled by properties within the `Encounter` resource (`Encounter.diagnosis.role`, `Encounter.diagnosis.rank`), not directly on the Condition itself when used in that context.

## Resource Details

The following defines the core elements and constraints of the Condition resource.

```yaml
elements:
  - name: Condition
    description: A clinical condition, problem, diagnosis, or other event, situation, issue, or clinical concept that has risen to a level of concern.
    short: Detailed information about conditions, problems or diagnoses
    type: DomainResource
    comments: The base resource definition.

  - name: Condition.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this condition by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this condition
    comments: This is a business identifier, not a resource identifier. Best practice is for it to be unique per resource instance, but exceptions exist.

  - name: Condition.clinicalStatus
    flags: [?!, Σ, C]
    cardinality: 1..1
    type: CodeableConcept
    description: The clinical status of the condition.
    short: active | recurrence | relapse | inactive | remission | resolved | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-clinical|6.0.0-cibuild # Using R6 build value set reference format if known, otherwise omit version
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains codes that mark the condition as no longer active (inactive, remission, resolved).
    comments: Required because it's a modifier. For problem list items, status should not be 'unknown'. May require more specificity (e.g., SNOMED CT) than the base value set provides.

  - name: Condition.verificationStatus
    flags: [?!, Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The verification status to support the clinical status of the condition. The verification status pertains to the condition, itself, not to any specific condition attribute.
    short: unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-ver-status|6.0.0-cibuild # Using R6 build value set reference format if known, otherwise omit version
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains codes 'refuted' and 'entered-in-error' which mark the Condition as not currently valid.
    comments: Not required (e.g., ED abdominal pain might not have a verification status). May allow for more specific codes (e.g., SNOMED CT).

  - name: Condition.category
    flags: [C]
    cardinality: 0..*
    type: CodeableConcept
    description: A category assigned to the condition.
    short: problem-list-item | encounter-diagnosis | ...
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-category|6.0.0-cibuild # Using R6 build value set reference format if known, otherwise omit version
      strength: preferred
    comments: Categorization is often contextual.

  - name: Condition.severity
    cardinality: 0..1
    type: CodeableConcept
    description: A subjective assessment of the severity of the condition as evaluated by the clinician.
    short: Subjective severity of condition
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-severity|6.0.0-cibuild # Using R6 build value set reference format if known, otherwise omit version
      strength: preferred
    comments: Coding severity with a terminology is preferred.

  - name: Condition.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Identification of the condition, problem or diagnosis.
    short: Identification of the condition, problem or diagnosis
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-code|6.0.0-cibuild # Using R6 build value set reference format if known, otherwise omit version
      strength: example
    requirements: Optional to support primarily narrative resources.

  - name: Condition.bodySite
    flags: [Σ, C]
    cardinality: 0..*
    type: CodeableConcept
    description: The anatomical location where this condition manifests itself.
    short: Anatomical location, if relevant
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example
    comments: Only used if not implicit in Condition.code. Cannot co-exist with Condition.bodyStructure.

  - name: Condition.bodyStructure
    flags: [C]
    cardinality: 0..1
    type: Reference(BodyStructure)
    description: Indicates the body structure on the subject's body where this condition manifests itself.
    short: Anatomical body structure
    comments: Should be consistent with Condition.code. Cannot co-exist with Condition.bodySite.

  - name: Condition.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: Indicates the patient or group who the condition record is associated with.
    short: Who has the condition?
    requirements: Group is typically used for veterinary or public health use cases.

  - name: Condition.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this Condition was created or to which the creation of this record is tightly associated.
    short: The Encounter during which this Condition was created
    comments: Indicates the encounter this specific record is associated with, which might differ from the encounter where the condition was first identified.

  - name: Condition.onset[x]
    flags: [Σ]
    cardinality: 0..1
    # type: Choice of: dateTime | Age | Period | Range | string # Represented via multiple fields below
    description: Estimated or actual date or date-time the condition, situation, or concern began, in the opinion of the clinician.
    short: Estimated or actual date, date-time, or age of onset
    comments: Can be dateTime, Age, Period, Range, or string. Ambiguity may exist regarding whether onset applies to the current code or an earlier representation. Age often used for patient-reported onset age. Period for imprecise onset time window. Range for imprecise onset age range.

  - name: Condition.onsetDateTime
    # Part of onset[x] choice
    cardinality: 0..1 # Implicit constraint: only one onset[x] can be present
    type: dateTime
    description: Estimated or actual date/time condition began.
    short: Estimated or actual date/time of onset

  - name: Condition.onsetAge
    # Part of onset[x] choice
    cardinality: 0..1 # Implicit constraint: only one onset[x] can be present
    type: Age
    description: Estimated or actual age condition began.
    short: Estimated or actual age of onset

  - name: Condition.onsetPeriod
    # Part of onset[x] choice
    cardinality: 0..1 # Implicit constraint: only one onset[x] can be present
    type: Period
    description: Estimated or actual period condition began.
    short: Estimated or actual period of onset

  - name: Condition.onsetRange
    # Part of onset[x] choice
    cardinality: 0..1 # Implicit constraint: only one onset[x] can be present
    type: Range
    description: Estimated or actual age range condition began.
    short: Estimated or actual age range of onset

  - name: Condition.onsetString
    # Part of onset[x] choice
    cardinality: 0..1 # Implicit constraint: only one onset[x] can be present
    type: string
    description: Estimated or actual textual description of when condition began.
    short: Textual description of onset

  - name: Condition.abatement[x]
    flags: [C]
    cardinality: 0..1
    # type: Choice of: dateTime | Age | Period | Range | string # Represented via multiple fields below
    description: The date or estimated date that the condition resolved or went into remission. This is called "abatement" because of the many overloaded connotations associated with "remission" or "resolution" - Some conditions, such as chronic conditions, are never really resolved, but they can abate.
    short: When in resolution/remission
    comments: Can be dateTime, Age, Period, Range, or string. If absent, assume condition is still valid. If abatementString exists, condition is considered abated. No explicit distinction between resolution and remission. Ambiguity may exist regarding whether abatement applies to the current code or an earlier representation.

  - name: Condition.abatementDateTime
    # Part of abatement[x] choice
    cardinality: 0..1 # Implicit constraint: only one abatement[x] can be present
    type: dateTime
    description: Date/time condition was resolved/remitted.
    short: Date/time of resolution/remission

  - name: Condition.abatementAge
    # Part of abatement[x] choice
    cardinality: 0..1 # Implicit constraint: only one abatement[x] can be present
    type: Age
    description: Age condition was resolved/remitted.
    short: Age of resolution/remission

  - name: Condition.abatementPeriod
    # Part of abatement[x] choice
    cardinality: 0..1 # Implicit constraint: only one abatement[x] can be present
    type: Period
    description: Period condition was resolved/remitted.
    short: Period of resolution/remission

  - name: Condition.abatementRange
    # Part of abatement[x] choice
    cardinality: 0..1 # Implicit constraint: only one abatement[x] can be present
    type: Range
    description: Age range condition was resolved/remitted. Used for imprecise age.
    short: Age range of resolution/remission

  - name: Condition.abatementString
    # Part of abatement[x] choice
    cardinality: 0..1 # Implicit constraint: only one abatement[x] can be present
    type: string
    description: Textual description of when condition was resolved/remitted.
    short: Textual description of resolution/remission

  - name: Condition.recordedDate
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The recordedDate represents when this particular Condition record was created in the system, which is often a system-generated date.
    short: Date condition was first recorded
    comments: Preferred to preserve sender's recordedDate if available. Can establish presence on/before a date when onset is unknown.

  - name: Condition.recorder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson)
    description: Individual who recorded the record and takes responsibility for its content.
    short: Who recorded the condition
    comments: The recorder is the most recent author, distinct from the asserter. recordedDate is when first recorded.

  - name: Condition.asserter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Patient | RelatedPerson | Device)
    description: Individual or device that is making the condition statement.
    short: Person or device that asserts this condition
    comments: Use Provenance if data enterer differs from asserter but needs tracking.

  - name: Condition.stage
    flags: [C, TU]
    cardinality: 0..*
    type: BackboneElement
    description: A simple summary of the stage such as "Stage 3" or "Early Onset". The determination of the stage is disease-specific, such as cancer, retinopathy of prematurity, kidney diseases, Alzheimer's, or Parkinson disease.
    short: Stage/grade, usually assessed formally
    comments: May interdepend with clinicalStatus.

  - name: Condition.stage.summary
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    description: A simple summary of the stage such as "Stage 3" or "Early Onset". The determination of the stage is disease-specific, such as cancer, retinopathy of prematurity, kidney diseases, Alzheimer's, or Parkinson disease.
    short: Simple summary (disease specific)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-stage
      strength: example

  - name: Condition.stage.assessment
    flags: [C]
    cardinality: 0..*
    type: Reference(ClinicalAssessment | DiagnosticReport | Observation)
    description: Reference to a formal record of the evidence on which the staging assessment is based.
    short: Formal record of assessment

  - name: Condition.stage.type
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of staging, such as pathological or clinical staging.
    short: Kind of staging
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/condition-stage-type
      strength: example

  - name: Condition.evidence
    flags: [Σ, TU]
    cardinality: 0..*
    type: CodeableReference(Any) # R6 Change: Was BackboneElement in R4
    description: Supporting evidence / manifestations that are the basis for determining the Condition.
    short: Supporting evidence for the condition
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example # Binding applies to the concept part of CodeableReference
    comments: Provides basis for Condition.code. Can be codes or references. Don't use for causality (use extensions or AdverseEvent). Can include cumulative evidence if condition was refuted.

  - name: Condition.note
    cardinality: 0..*
    type: Annotation
    description: Additional information about the Condition. This is a general notes/comments entry for description of the Condition, its diagnosis and prognosis.
    short: Additional information about the Condition

constraints:
  - key: con-1
    severity: Rule
    location: Condition.stage
    description: Stage SHALL have summary or assessment
    expression: summary.exists() or assessment.exists()
  - key: con-2
    severity: Warning
    location: (base) # Condition
    description: If category is problems list item, the clinicalStatus should not be unknown
    expression: category.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-category' and code='problem-list-item').exists() implies clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and code='unknown').exists().not()
  - key: con-3
    severity: Rule
    location: (base) # Condition
    description: If condition is abated, then clinicalStatus must be either inactive, resolved, or remission.
    expression: abatement.exists() implies (clinicalStatus.coding.where(system='http://terminology.hl7.org/CodeSystem/condition-clinical' and (code='inactive' or code='resolved' or code='remission')).exists())
  - key: con-4
    severity: Rule
    location: (base) # Condition
    description: bodyStructure SHALL only be present if Condition.bodySite is not present
    expression: bodySite.exists() implies bodyStructure.empty()

```

## Search Parameters

Search parameters defined for the Condition resource:

```yaml
searchParameters:
  - name: abatement-age
    type: quantity
    description: Abatement as age or age range
    expression: Condition.abatement.ofType(Age) | Condition.abatement.ofType(Range)
  - name: abatement-date
    type: date
    description: Date-related abatements (dateTime and period)
    expression: Condition.abatement.ofType(dateTime) | Condition.abatement.ofType(Period)
  - name: abatement-string
    type: string
    description: Abatement as a string
    expression: Condition.abatement.ofType(string)
  - name: asserter
    type: reference
    description: Person or device that asserts this condition
    expression: Condition.asserter
    targets: [Practitioner, Device, Patient, PractitionerRole, RelatedPerson]
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
    description: The Encounter during which this Condition was created
    expression: Condition.encounter
    targets: [Encounter]
  - name: evidence # Note: Search parameter name conflicts with element name which is now CodeableReference in R6. Expression targets concept part.
    type: token
    description: Manifestation/symptom coded
    expression: Condition.evidence.concept
  - name: evidence-detail # Note: Expression targets reference part of CodeableReference element named 'evidence' in R6.
    type: reference
    description: Supporting information found elsewhere
    expression: Condition.evidence.reference
    targets: [Any] # Inferred from CodeableReference(Any)
  - name: identifier
    type: token
    description: A unique identifier of the condition record
    expression: Condition.identifier
  - name: onset-age
    type: quantity
    description: Onsets as age or age range
    expression: Condition.onset.ofType(Age) | Condition.onset.ofType(Range)
  - name: onset-date
    type: date
    description: Date related onsets (dateTime and Period)
    expression: Condition.onset.ofType(dateTime) | Condition.onset.ofType(Period)
  - name: onset-info # Name change from onset-string in R4? Source HTML says onset-info.
    type: string
    description: Onsets as a string
    expression: Condition.onset.ofType(string)
  - name: patient
    type: reference
    description: Who has the condition?
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
    description: Simple summary (disease specific)
    expression: Condition.stage.summary
  - name: subject
    type: reference
    description: Who has the condition?
    expression: Condition.subject
    targets: [Group, Patient]
  - name: verification-status
    type: token
    description: unconfirmed | provisional | differential | confirmed | refuted | entered-in-error
    expression: Condition.verificationStatus

```