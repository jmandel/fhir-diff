Okay, here is the FHIR Goal resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Goal

```yaml
resource:
  name: Goal
  hl7_workgroup: Patient Care
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Group
    - Patient
```

Describes the intended objective(s) for a patient, group or organization care, for example, weight loss, restoring an activity of daily living, obtaining herd immunity via immunization, meeting a process improvement objective, etc.

## Background and Scope

A Goal represents a desired health state or objective to be achieved by a subject (patient, group, or organization) over time, often as a result of healthcare interventions or natural progression.

Key aspects include:

*   **Purpose:** Goals can target prevention, cure, mitigation, life prolongation, or symptom management.
*   **Subject:** Can be an individual patient, a group (e.g., for population health objectives like education or screening, or health state like addiction reduction), or an organization (e.g., for process improvement targets like infection control or cost management).
*   **Context:** Goals are typically established within a `CarePlan` but can also be referenced directly by request resources (like `MedicationRequest` or `ServiceRequest`) using extensions.
*   **Definition vs. Instance:** The `Goal` resource represents a *specific* goal instance for a particular subject, not a template or potential goal within a protocol definition (which uses `PlanDefinition`).
*   **Evaluation:** Goal progress is often evaluated using `Observation` resources.
*   **Boundaries:**
    *   Distinguished from legal Advance Directives, which use `Consent` (category `ADV`) or request resources (`intent=directive`). However, clinical goals *within* an Advance Directive can be represented as `Goal` resources. Informal directives (e.g., "I want to die at home") *could* also be represented as Goals.
*   **Lifecycle & Status:**
    *   `lifecycleStatus`: Tracks the overall state (e.g., `proposed`, `active`, `completed`, `cancelled`).
    *   `achievementStatus`: Tracks the progress towards the target (e.g., `in-progress`, `improving`, `achieved`, `not-attainable`).
    *   `statusDate`: Records when the current `achievementStatus` took effect.
    *   `statusReason`: Explains the current `lifecycleStatus` (especially for `rejected`, `on-hold`, `cancelled`).
*   **Targets:** Goals define specific targets (`Goal.target`) which include:
    *   `measure`: The parameter being tracked (e.g., HbA1c, weight).
    *   `detail[x]`: The target value (e.g., Quantity, Range, CodeableConcept).
    *   `due[x]`: The timeframe (date or duration) by which the target should be met.
*   **Acceptance:** The `acceptance` backbone element allows recording agreement and priority from various stakeholders (patient, practitioners, etc.).
*   **Continuity:** The `continuous` flag indicates if ongoing activity is needed to sustain the goal after it's initially met (e.g., maintaining HbA1c vs. a one-time vaccination goal).

## Resource Details

The following defines the core elements and constraints of the Goal resource.

```yaml
elements:
  - name: Goal
    description: Describes the intended objective(s) for a patient, group or organization care, for example, weight loss, restoring an activity of daily living, obtaining herd immunity via immunization, meeting a process improvement objective, etc.
    short: Describes the intended objective(s) for a patient, group or organization
    type: DomainResource
    comments: Goal can be achieving a particular change or merely maintaining a current state or even slowing a decline.

  - name: Goal.identifier
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this goal by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this goal
    comments: This is a business identifier, not a resource identifier (see discussion). It is best practice for the identifier to only appear on a single resource instance, however business practices may occasionally dictate that multiple resource instances with the same identifier can exist - possibly even with different resource types. For example, multiple Patient and a Person resource instance might share the same social insurance number.

  - name: Goal.lifecycleStatus
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The state of the goal throughout its lifecycle.
    short: proposed | planned | accepted | active | on-hold | completed | cancelled | entered-in-error | rejected
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This element is labeled as a modifier because the lifecycleStatus contains codes that mark the resource as not currently valid.

  - name: Goal.achievementStatus
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the progression, or lack thereof, towards the goal against the target.
    short: in-progress | improving | worsening | no-change | achieved | sustaining | not-achieved | no-progress | not-attainable
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-achievement
      strength: preferred

  - name: Goal.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates a category the goal falls within.
    short: E.g. Treatment, dietary, behavioral, etc
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-category
      strength: example

  - name: Goal.continuous
    cardinality: 0..1
    type: boolean
    description: After meeting the goal, ongoing activity is needed to sustain the goal objective.
    short: After meeting the goal, ongoing activity is needed to sustain the goal objective
    comments: For example, getting a yellow fever vaccination for a planned trip is a goal that is designed to be completed (continuous = false). A goal to sustain HbA1c levels would not be a one-time goal (continuous = true).

  - name: Goal.priority
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Identifies the mutually agreed level of importance associated with reaching/sustaining the goal.
    short: high-priority | medium-priority | low-priority
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-priority
      strength: preferred
    comments: Extensions are available to track priorities as established by each participant (i.e. Priority from the patient's perspective, different practitioners' perspectives, family member's perspectives). The ordinal extension on Coding can be used to convey a numerically comparable ranking to priority. (Keep in mind that different coding systems may use a "low value=important").

  - name: Goal.description
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Human-readable and/or coded description of a specific desired objective of care, such as "control blood pressure" or "negotiate an obstacle course" or "dance with child at wedding".
    short: Code or text describing goal
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-description
      strength: example
    comments: If no code is available, use CodeableConcept.text.

  - name: Goal.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group | Organization)
    description: Identifies the patient, group or organization for whom the goal is being established.
    short: Who this goal is intended for

  - name: Goal.start[x]
    flags: [Σ]
    cardinality: 0..1
    type: date | CodeableConcept
    description: The date or event after which the goal should begin being pursued.
    short: When goal pursuit begins
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-start-event
      strength: example

  - name: Goal.acceptance
    cardinality: 0..*
    type: BackboneElement
    description: Information about the acceptance and relative priority assigned to the goal by the patient, practitioners and other stakeholders.
    short: Individual acceptance of goal

  - name: Goal.acceptance.participant
    cardinality: 1..1
    type: Reference(Patient | Practitioner | RelatedPerson | PractitionerRole | CareTeam | Organization)
    description: The person ororganization whose acceptance/priority is being reflected.
    short: Individual or organization whose acceptance is reflected

  - name: Goal.acceptance.status
    cardinality: 0..1
    type: code
    description: Indicates whether the specified individual has accepted the goal or not.
    short: agree | disagree | pending
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-accept-status
      strength: required

  - name: Goal.acceptance.priority
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the relative priority assigned to the goal by the stakeholder.
    short: Priority of goal for individual
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-priority
      strength: example

  - name: Goal.target
    flags: [C]
    cardinality: 0..*
    type: BackboneElement
    description: Indicates what should be done by when.
    short: Target outcome for the goal
    comments: When multiple targets are present for a single goal instance, all targets must be met for the overall goal to be met.

  - name: Goal.target.measure
    flags: [Σ, C]
    cardinality: 0..1
    type: CodeableConcept
    description: The parameter whose value is being tracked, e.g. body weight, blood pressure, or hemoglobin A1c level.
    short: The parameter whose value is being tracked
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes # Note: Inferred binding from context (LOINC Codes)
      strength: example

  - name: Goal.target.detail[x]
    flags: [Σ, C]
    cardinality: 0..1
    type: Quantity | Range | CodeableConcept | string | boolean | integer | Ratio
    description: The target value of the focus to be achieved to signify the fulfillment of the goal, e.g. 150 pounds, 7.0%. Either the high or low or both values of the range can be specified. When a low value is missing, it indicates that the goal is achieved at any focus value at or below the high value. Similarly, if the high value is missing, it indicates that the goal is achieved at any focus value at or above the low value. A CodeableConcept target value could be Positive, Negative, Abnormal, Normal, Present, Absent, Yes, No.
    short: The target value to be achieved
    comments: A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Goal.target.measure defines a coded value.

  - name: Goal.target.due[x]
    flags: [Σ]
    cardinality: 0..1
    type: date | Duration
    description: Indicates either the date or the duration after start by which the goal should be met.
    short: Reach goal on or before

  - name: Goal.statusDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: Identifies when the current achievement status took effect. I.e. When achieved, when improving, etc.
    short: When goal achievment status took effect
    comments: To see the date for past statuses, query history.

  - name: Goal.statusReason
    cardinality: 0..*
    type: CodeableConcept # Note: Changed from 'string' in R4 to 'CodeableConcept' in R6
    description: Captures the reason for the current lifecycle status.
    short: Reason for current lifecycle status
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-status-reason
      strength: example
    comments: This will typically be captured for statuses such as rejected, on-hold or cancelled, but could be present for others.

  - name: Goal.source # Note: Renamed from 'expressedBy' in R4
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Practitioner | PractitionerRole | RelatedPerson | CareTeam | Group) # Note: CareTeam, Group added in R6
    description: Indicates whose goal this is - patient goal, practitioner goal, etc.
    short: Who's responsible for creating Goal?
    comments: This is the individual or team responsible for establishing the goal, not necessarily who recorded it. (For that, use the Provenance resource.). Using Group is only allowed when the group represents a family or a household and should not represent groups of Practitioners.

  - name: Goal.addresses
    cardinality: 0..*
    type: Reference(Condition | Observation | MedicationStatement | MedicationRequest | NutritionOrder | ServiceRequest | RiskAssessment | Procedure | NutritionIntake) # Note: MedicationRequest, Procedure, NutritionIntake added in R6
    description: The identified conditions and other resources that provide the context for why the goal exists.
    short: Issues addressed by this goal

  - name: Goal.note
    cardinality: 0..*
    type: Annotation
    description: Any comments related to the goal.
    short: Comments about the goal
    comments: May be used for progress notes, concerns or other related information that doesn't actually describe the goal itself.

constraints:
  - key: gol-1
    severity: Rule
    location: Goal.target
    description: Goal.target.measure is required if Goal.target.detail is populated
    expression: (detail.exists() and measure.exists()) or detail.exists().not()
```

## Search Parameters

Search parameters defined for the Goal resource:

```yaml
searchParameters:
  - name: achievement-status
    type: token
    description: in-progress | improving | worsening | no-change | achieved | sustaining | not-achieved | no-progress | not-attainable
    expression: Goal.achievementStatus
  - name: addresses
    type: reference
    description: Issues addressed by this goal
    expression: Goal.addresses
    targets: [Condition, Observation, MedicationStatement, MedicationRequest, NutritionOrder, ServiceRequest, RiskAssessment, Procedure, NutritionIntake]
  - name: category
    type: token
    description: E.g. Treatment, dietary, behavioral, etc.
    expression: Goal.category
  - name: description
    type: token
    description: Code or text describing goal
    expression: Goal.description
  - name: identifier
    type: token
    description: External Ids for this goal
    expression: Goal.identifier
  - name: lifecycle-status
    type: token
    description: proposed | planned | accepted | active | on-hold | completed | cancelled | entered-in-error | rejected
    expression: Goal.lifecycleStatus
  - name: patient
    type: reference
    description: Who this goal is intended for
    expression: Goal.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: start-date
    type: date
    description: When goal pursuit begins
    expression: (Goal.start as date) # FHIR Path adjusted for choice type
  - name: subject
    type: reference
    description: Who this goal is intended for
    expression: Goal.subject
    targets: [Patient, Group, Organization]
  - name: target-date
    type: date
    description: Reach goal on or before
    expression: (Goal.target.due as date) # FHIR Path adjusted for choice type
  - name: target-measure
    type: token
    description: The parameter whose value is being tracked
    expression: Goal.target.measure
```