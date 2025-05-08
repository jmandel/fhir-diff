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
    - Patient
```

Describes the intended objective(s) for a patient, group or organization care, for example, weight loss, restoring an activity of daily living, obtaining herd immunity via immunization, meeting a process improvement objective, etc.

## Background and Scope

A Goal in healthcare services delivery is generally an expressed desired health state to be achieved by a subject of care (or family/group) over a period or at a specific point in time. This desired target health state may be achieved as a result of healthcare intervention(s) or resulting from natural recovery over time.

Key aspects include:

*   **Purpose:** Goals can address the prevention of illness, cure or mitigation of a condition, prolongation of life, or mitigation of pain and discomfort.
*   **Subject:** Goals can be for individual patients, groups (e.g., for population health objectives like education or screening, or health state like addiction reduction), or organizations (e.g., infection control, cost management).
*   **Lifecycle & Status:**
    *   `lifecycleStatus`: Tracks the overall state of the goal (e.g., `proposed`, `active`, `completed`).
    *   `achievementStatus`: Describes the progression towards the goal (e.g., `in-progress`, `achieved`, `not-achieved`).
*   **Context:** Goals are typically established in the context of a `CarePlan`. They represent specific instances for a particular subject, not general templates (which are handled by `PlanDefinition`).
*   **Evaluation:** Goals are often evaluated using `Observation` resources, which can be linked via `outcomeReference`.

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
    comments: This is a business identifier, not a resource identifier.

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
    modifierReason: This element is labeled as a modifier because the lifecycleStatus contains codes that mark the resource as not currently valid.

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
    short: E.g. Treatment, dietary, behavioral, etc.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-category
      strength: example

  - name: Goal.priority
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Identifies the mutually agreed level of importance associated with reaching/sustaining the goal.
    short: high-priority | medium-priority | low-priority
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-priority
      strength: preferred

  - name: Goal.description
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Human-readable and/or coded description of a specific desired objective of care, such as "control blood pressure" or "negotiate an obstacle course" or "dance with child at wedding".
    short: Code or text describing goal
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings # Example binding to SNOMED CT Clinical Findings
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
    # type: date | CodeableConcept # This is a choice type
    description: The date or event after which the goal should begin being pursued.
    short: When goal pursuit begins
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/goal-start-event
      strength: example
    # Specific choices for start[x]
  - name: Goal.startDate
    type: date
    cardinality: 0..1 # Part of start[x] choice
    description: The date after which the goal should begin being pursued.
    short: Starting date for goal
  - name: Goal.startCodeableConcept
    type: CodeableConcept
    cardinality: 0..1 # Part of start[x] choice
    description: The event after which the goal should begin being pursued.
    short: Event triggering goal pursuit

  - name: Goal.target
    flags: [C] # Constraint 'gol-1' applies here
    cardinality: 0..*
    type: BackboneElement
    description: Indicates what should be done by when.
    short: Target outcome for the goal
    comments: When multiple targets are present for a single goal instance, all targets must be met for the overall goal to be met.

  - name: Goal.target.measure
    flags: [Σ, C] # Constraint 'gol-1' applies here
    cardinality: 0..1
    type: CodeableConcept
    description: The parameter whose value is being tracked, e.g. body weight, blood pressure, or hemoglobin A1c level.
    short: The parameter whose value is being tracked
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes # Example binding to LOINC Codes
      strength: example

  - name: Goal.target.detail[x]
    flags: [Σ, C] # Constraint 'gol-1' applies here
    cardinality: 0..1
    # type: Quantity | Range | CodeableConcept | string | boolean | integer | Ratio # This is a choice type
    description: The target value of the focus to be achieved to signify the fulfillment of the goal, e.g. 150 pounds, 7.0%. Either the high or low or both values of the range can be specified. When a low value is missing, it indicates that the goal is achieved at any focus value at or below the high value. Similarly, if the high value is missing, it indicates that the goal is achieved at any focus value at or above the low value.
    short: The target value to be achieved
    comments: A CodeableConcept with just a text would be used instead of a string if the field was usually coded, or if the type associated with the Goal.target.measure defines a coded value.
    # Specific choices for detail[x]
  - name: Goal.target.detailQuantity
    type: Quantity
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailRange
    type: Range
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailCodeableConcept
    type: CodeableConcept
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailString
    type: string
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailBoolean
    type: boolean
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailInteger
    type: integer
    cardinality: 0..1 # Part of detail[x] choice
  - name: Goal.target.detailRatio
    type: Ratio
    cardinality: 0..1 # Part of detail[x] choice

  - name: Goal.target.due[x]
    flags: [Σ]
    cardinality: 0..1
    # type: date | Duration # This is a choice type
    description: Indicates either the date or the duration after start by which the goal should be met.
    short: Reach goal on or before
    # Specific choices for due[x]
  - name: Goal.target.dueDate
    type: date
    cardinality: 0..1 # Part of due[x] choice
  - name: Goal.target.dueDuration
    type: Duration
    cardinality: 0..1 # Part of due[x] choice

  - name: Goal.statusDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: Identifies when the current status. I.e. When initially created, when achieved, when cancelled, etc.
    short: When goal status took effect

  - name: Goal.statusReason
    cardinality: 0..1
    type: string # In R4, this is a string. In R5/build, it's CodeableConcept. Sticking to R4 spec.
    description: Captures the reason for the current status.
    short: Reason for current status

  - name: Goal.expressedBy
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Practitioner | PractitionerRole | RelatedPerson)
    description: Indicates whose goal this is - patient goal, practitioner goal, etc.
    short: Who's responsible for creating Goal?

  - name: Goal.addresses
    cardinality: 0..*
    type: Reference(Condition | Observation | MedicationStatement | NutritionOrder | ServiceRequest | RiskAssessment)
    description: The identified conditions and other health record elements that are intended to be addressed by the goal.
    short: Issues addressed by this goal

  - name: Goal.note
    cardinality: 0..*
    type: Annotation
    description: Any comments related to the goal.
    short: Comments about the goal

  - name: Goal.outcomeCode
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies the change (or lack of change) at the point when the status of the goal is assessed.
    short: What result was achieved regarding the goal?
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings # Example binding to SNOMED CT Clinical Findings
      strength: example

  - name: Goal.outcomeReference
    cardinality: 0..*
    type: Reference(Observation)
    description: Details of what's changed (or not changed).
    short: Observation that resulted from goal

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
  - name: category
    type: token
    description: E.g. Treatment, dietary, behavioral, etc.
    expression: Goal.category
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
    description: Who this goal is intended for (if patient)
    expression: Goal.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: start-date
    type: date
    description: When goal pursuit begins
    expression: (Goal.start as date) # Based on Goal.startDate
  - name: subject
    type: reference
    description: Who this goal is intended for
    expression: Goal.subject
    targets: [Patient, Group, Organization]
  - name: target-date
    type: date
    description: Reach goal on or before
    expression: (Goal.target.due as date) # Based on Goal.target.dueDate

```