Okay, here is the CarePlan resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided FHIR R4 HTML content.

---

# FHIR Resource: CarePlan

```yaml
resource:
  name: CarePlan
  hl7_workgroup: Patient Care
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

Describes the intention of how one or more practitioners intend to deliver care for a particular patient, group or community for a period of time, possibly limited to care for a specific condition or set of conditions.

## Background and Scope

The CarePlan resource describes the intended plan of care for a patient, group, or community over a period, potentially focused on specific conditions. It is a key part of the FHIR workflow specification.

Key aspects include:

*   **Versatility:** Used across healthcare settings for varying complexities, from simple reminders (like immunizations) to detailed multi-disciplinary plans (like oncology). Can apply to individuals, groups (including veterinary or research subjects), or community health initiatives.
*   **Intermediate Detail:** Captures core participants and intended actions. More complex details like dependencies or precise timing often require extensions.
*   **Wide Applicability:** Examples include cross-organizational plans, disease management plans (nutrition, neurology), guideline-driven plans (stroke, diabetes), and patient/caregiver-authored plans.
*   **Plan Lifecycle:** Represents both proposed plans (e.g., recommendations) and active plans, distinguished by the `status` element.

## Boundaries and Relationships

*   **Activities:** Can be defined inline (`activity.detail`) for simplicity or by referencing specific FHIR Request resources (e.g., `ServiceRequest`, `MedicationRequest`) for detailed, standalone definitions. A `CarePlan` provides context by grouping activities, goals, and participants; individual activities (like appointments) might exist without an overarching `CarePlan`.
*   **Focus:** Can be linked to specific `Condition` resources or be independent, focusing instead on a type of care (e.g., nutritional) or the care provided by a particular team.
*   **vs. ImmunizationRecommendation:** For plans solely focused on immunizations, `ImmunizationRecommendation` is preferred.
*   **vs. PlanDefinition:** `CarePlan` represents a plan instance for a *specific* patient or group. Generic protocols or order set definitions should use the `PlanDefinition` resource.

## Resource Details

The following defines the core elements and constraints of the CarePlan resource based on FHIR R4.

```yaml
elements:
  - name: CarePlan
    description: Describes the intention of how one or more practitioners intend to deliver care for a particular patient, group or community for a period of time, possibly limited to care for a specific condition or set of conditions.
    short: Healthcare plan for patient or group
    type: DomainResource
    comments: The base resource definition.

  - name: CarePlan.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this care plan by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this plan
    comments: This is a business identifier, not a resource identifier (see discussion). It is best practice for the identifier to only appear on a single resource instance, however business practices may occasionally dictate that multiple resource instances with the same identifier can exist - possibly even with different resource types. For example, multiple Patient and a Person resource instance might share the same social insurance number.

  - name: CarePlan.instantiatesCanonical
    flags: [Σ]
    cardinality: 0..*
    type: canonical(PlanDefinition | Questionnaire | Measure | ActivityDefinition | OperationDefinition)
    description: The URL pointing to a FHIR-defined protocol, guideline, questionnaire or other definition that is adhered to in whole or in part by this CarePlan.
    short: Instantiates FHIR protocol or definition

  - name: CarePlan.instantiatesUri
    flags: [Σ]
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, questionnaire or other definition that is adhered to in whole or in part by this CarePlan.
    short: Instantiates external protocol or definition

  - name: CarePlan.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan)
    description: A care plan that is fulfilled in whole or in part by this care plan.
    short: Fulfills CarePlan

  - name: CarePlan.replaces
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan)
    description: Completed or terminated care plan whose function is taken by this new care plan.
    short: CarePlan replaced by this CarePlan
    comments: The replacement could be because the initial care plan was immediately rejected (due to an issue) or because the previous care plan was completed, but the need for the action described by the care plan remains ongoing.

  - name: CarePlan.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan)
    description: A larger care plan of which this particular care plan is a component or step.
    short: Part of referenced CarePlan

  - name: CarePlan.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates whether the plan is currently being acted upon, represents future intentions or is now a historical record.
    short: draft | active | on-hold | revoked | completed | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-status|4.0.1 # Based on R4 definition page
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid.

  - name: CarePlan.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates the level of authority/intentionality associated with the care plan and where the care plan fits into the workflow chain.
    short: proposal | plan | order | option
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-intent|4.0.1 # Based on R4 definition page
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of other descriptive attributes (e.g., recommended vs. authorized).

  - name: CarePlan.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies what "kind" of plan this is to support differentiation between multiple co-existing plans; e.g. "Home health", "psychiatric", "asthma", "disease management", "wellness plan", etc.
    short: Type of plan
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-category
      strength: example
    comments: There may be multiple axes of categorization and one plan may serve multiple purposes. In some cases, this may be redundant with references to CarePlan.addresses.

  - name: CarePlan.title
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: Human-friendly name for the care plan.
    short: Human-friendly name for the care plan

  - name: CarePlan.description
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A description of the scope and nature of the plan.
    short: Summary of nature of plan
    comments: CarePlan.description is not intended to convey the entire care plan. It is possible to convey the entire care plan narrative using CarePlan.text instead.

  - name: CarePlan.subject
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | Group)
    description: Identifies the patient or group whose intended care is described by the plan.
    short: Who the care plan is for

  - name: CarePlan.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this CarePlan was created or to which the creation of this record is tightly associated.
    short: Encounter created as part of
    comments: This will typically be the encounter the event occurred within, but some activities may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter. CarePlan activities conducted as a result of the care plan may well occur as part of other encounters.

  - name: CarePlan.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: Indicates when the plan did (or is intended to) come into effect and end.
    short: Time period plan covers
    comments: Any activities scheduled as part of the plan should be constrained to the specified period regardless of whether the activities are planned within a single encounter/episode or across multiple encounters/episodes (e.g. the longitudinal management of a chronic condition).

  - name: CarePlan.created
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: Represents when this particular CarePlan record was created in the system, which is often a system-generated date.
    short: Date record was first recorded

  - name: CarePlan.author
    flags: [Σ]
    cardinality: 0..1 # Note: R4 definition page shows 0..1, differs from R3
    type: Reference(Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam)
    description: When populated, the author is responsible for the care plan. The care plan is attributed to the author.
    short: Who is the designated responsible party

  - name: CarePlan.contributor
    cardinality: 0..*
    type: Reference(Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam)
    description: Identifies the individual(s) or organization who provided the contents of the care plan.
    short: Who provided the content of the care plan
    comments: Collaborative care plans may have multiple contributors.

  - name: CarePlan.careTeam
    cardinality: 0..*
    type: Reference(CareTeam)
    description: Identifies all people and organizations who are expected to be involved in the care envisioned by this plan.
    short: Who's involved in plan?

  - name: CarePlan.addresses
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Condition) # Note: R4 Definition page only lists Condition, not CodeableReference like R5. Sticking to R4 source.
    description: Identifies the conditions/problems/concerns/diagnoses/etc. whose management and/or mitigation are handled by this plan.
    short: Health issues this plan addresses
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings # Implied binding from description/requirements
      strength: example

  - name: CarePlan.supportingInfo
    cardinality: 0..*
    type: Reference(Any)
    description: Identifies portions of the patient's record that specifically influenced the formation of the plan. These might include comorbidities, recent procedures, limitations, recent assessments, etc.
    short: Information considered as part of plan
    comments: Use "concern" (addresses) to identify specific conditions addressed by the care plan. supportingInfo can be used to convey one or more Advance Directives or Medical Treatment Consent Directives by referencing Consent or any other request resource with intent = directive.

  - name: CarePlan.goal
    cardinality: 0..*
    type: Reference(Goal)
    description: Describes the intended objective(s) of carrying out the care plan.
    short: Desired outcome of plan
    comments: Goal can be achieving a particular change or merely maintaining a current state or even slowing a decline.

  - name: CarePlan.activity
    flags: [I] # Has constraint cpl-3
    cardinality: 0..*
    type: BackboneElement
    description: Identifies a planned action to occur as part of the plan. For example, a medication to be used, lab tests to perform, self-monitoring, education, etc.
    short: Action to occur as part of plan

  - name: CarePlan.activity.outcomeCodeableConcept
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies the outcome at the point when the status of the activity is assessed. For example, the outcome of an education activity could be patient understands (or not).
    short: Results of the activity
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-activity-outcome
      strength: example

  - name: CarePlan.activity.outcomeReference
    cardinality: 0..*
    type: Reference(Any)
    description: Details of the outcome or action resulting from the activity. The reference to an "event" resource, such as Procedure or Encounter or Observation, is the result/outcome of the activity itself. The activity can be conveyed using CarePlan.activity.detail OR using the CarePlan.activity.reference (a reference to a “request” resource).
    short: Appointment, Encounter, Procedure, etc.

  - name: CarePlan.activity.progress
    cardinality: 0..*
    type: Annotation
    description: Notes about the adherence/status/progress of the activity.
    short: Comments about the activity status/progress
    comments: This element should NOT be used to describe the activity to be performed - that occurs within the resource pointed to by detail.reference.

  - name: CarePlan.activity.reference
    flags: [I] # Affected by constraint cpl-3
    cardinality: 0..1
    type: Reference(Appointment | CommunicationRequest | DeviceRequest | MedicationRequest | NutritionOrder | Task | ServiceRequest | VisionPrescription | RequestGroup)
    description: The details of the proposed activity represented in a specific resource.
    short: Activity details defined in specific resource

  - name: CarePlan.activity.detail
    flags: [I] # Affected by constraint cpl-3
    cardinality: 0..1
    type: BackboneElement
    description: A simple summary of a planned activity suitable for a general care plan system (e.g. form driven) that doesn't know about specific resources such as procedure etc.
    short: In-line definition of activity

  - name: CarePlan.activity.detail.kind
    cardinality: 0..1
    type: code
    description: A description of the kind of resource the in-line definition of a care plan activity is representing. The CarePlan.activity.detail is an in-line definition when a resource is not referenced using CarePlan.activity.reference. For example, a MedicationRequest, a ServiceRequest, or a CommunicationRequest.
    short: Appointment | CommunicationRequest | DeviceRequest | MedicationRequest | NutritionOrder | Task | ServiceRequest | VisionPrescription
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-activity-kind|4.0.1 # Based on R4 definition page
      strength: required

  - name: CarePlan.activity.detail.instantiatesCanonical
    cardinality: 0..*
    type: canonical(PlanDefinition | ActivityDefinition | Questionnaire | Measure | OperationDefinition)
    description: The URL pointing to a FHIR-defined protocol, guideline, questionnaire or other definition that is adhered to in whole or in part by this CarePlan activity.
    short: Instantiates FHIR protocol or definition

  - name: CarePlan.activity.detail.instantiatesUri
    cardinality: 0..*
    type: uri
    description: The URL pointing to an externally maintained protocol, guideline, questionnaire or other definition that is adhered to in whole or in part by this CarePlan activity.
    short: Instantiates external protocol or definition

  - name: CarePlan.activity.detail.code
    cardinality: 0..1
    type: CodeableConcept
    description: Detailed description of the type of planned activity; e.g. what lab test, what procedure, what kind of encounter.
    short: Detail type of activity
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/procedure-code
      strength: example

  - name: CarePlan.activity.detail.reasonCode
    cardinality: 0..*
    type: CodeableConcept
    description: Provides the rationale that drove the inclusion of this particular activity as part of the plan or the reason why the activity was prohibited.
    short: Why activity should be done or why activity was prohibited
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example

  - name: CarePlan.activity.detail.reasonReference
    cardinality: 0..*
    type: Reference(Condition | Observation | DiagnosticReport | DocumentReference)
    description: Indicates another resource, such as the health condition(s), whose existence justifies this request and drove the inclusion of this particular activity as part of the plan.
    short: Why activity is needed

  - name: CarePlan.activity.detail.goal
    cardinality: 0..*
    type: Reference(Goal)
    description: Internal reference that identifies the goals that this activity is intended to contribute towards meeting.
    short: Goals this activity relates to

  - name: CarePlan.activity.detail.status
    flags: [?!]
    cardinality: 1..1
    type: code
    description: Identifies what progress is being made for the specific activity.
    short: not-started | scheduled | in-progress | on-hold | completed | cancelled | stopped | unknown | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-activity-status|4.0.1 # Based on R4 definition page
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid. It also contains stopped and cancelled which have workflow implications.

  - name: CarePlan.activity.detail.statusReason
    cardinality: 0..1
    type: CodeableConcept
    description: Provides reason why the activity isn't yet started, is on hold, was cancelled, etc.
    short: Reason for current status

  - name: CarePlan.activity.detail.doNotPerform
    flags: [?!]
    cardinality: 0..1
    type: boolean
    description: If true, indicates that the described activity is one that must NOT be engaged in when following the plan. If false, or missing, indicates that the described activity is one that should be engaged in when following the plan.
    short: If true, activity is prohibiting action
    isModifier: true
    modifierReason: If true, this element negates the action described.

  - name: CarePlan.activity.detail.scheduledTiming # Representing scheduled[x] choice
    cardinality: 0..1
    type: Timing
    description: The period, timing or frequency upon which the described activity is to occur.
    short: When activity is to occur (Timing)

  - name: CarePlan.activity.detail.scheduledPeriod # Representing scheduled[x] choice
    cardinality: 0..1
    type: Period
    description: The period, timing or frequency upon which the described activity is to occur.
    short: When activity is to occur (Period)

  - name: CarePlan.activity.detail.scheduledString # Representing scheduled[x] choice
    cardinality: 0..1
    type: string
    description: The period, timing or frequency upon which the described activity is to occur.
    short: When activity is to occur (string)

  - name: CarePlan.activity.detail.location
    cardinality: 0..1
    type: Reference(Location)
    description: Identifies the facility where the activity will occur; e.g. home, hospital, specific clinic, etc.
    short: Where it should happen

  - name: CarePlan.activity.detail.performer
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | RelatedPerson | Patient | CareTeam | HealthcareService | Device)
    description: Identifies who's expected to be involved in the activity.
    short: Who will be responsible?

  - name: CarePlan.activity.detail.productCodeableConcept # Representing product[x] choice
    cardinality: 0..1
    type: CodeableConcept
    description: Identifies the food, drug or other product to be consumed or supplied in the activity.
    short: What is to be administered/supplied (CodeableConcept)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example

  - name: CarePlan.activity.detail.productReference # Representing product[x] choice
    cardinality: 0..1
    type: Reference(Medication | Substance)
    description: Identifies the food, drug or other product to be consumed or supplied in the activity.
    short: What is to be administered/supplied (Reference)

  - name: CarePlan.activity.detail.dailyAmount
    cardinality: 0..1
    type: SimpleQuantity
    description: Identifies the quantity expected to be consumed in a given day.
    short: How to consume/day?

  - name: CarePlan.activity.detail.quantity
    cardinality: 0..1
    type: SimpleQuantity
    description: Identifies the quantity expected to be supplied, administered or consumed by the subject.
    short: How much to administer/supply/consume

  - name: CarePlan.activity.detail.description
    cardinality: 0..1
    type: string
    description: This provides a textual description of constraints on the intended activity occurrence, including relation to other activities. It may also include objectives, pre-conditions and end-conditions. Finally, it may convey specifics about the activity such as body site, method, route, etc.
    short: Extra info describing activity to perform

  - name: CarePlan.note
    cardinality: 0..*
    type: Annotation
    description: General notes about the care plan not covered elsewhere.
    short: Comments about the plan

constraints:
  - key: cpl-3
    severity: Rule
    location: CarePlan.activity
    description: Provide a reference or detail, not both
    expression: detail.empty() or reference.empty()

```

## Search Parameters

Search parameters defined for the CarePlan resource:

```yaml
searchParameters:
  - name: activity-code
    type: token
    description: Detail type of activity
    expression: CarePlan.activity.detail.code
  - name: activity-date
    type: date
    description: Specified date occurs within period specified by CarePlan.activity.detail.scheduled[x]
    expression: CarePlan.activity.detail.scheduled # Note: Expression covers Timing, Period, or String - behavior depends on server implementation for string.
  - name: activity-reference
    type: reference
    description: Activity details defined in specific resource
    expression: CarePlan.activity.reference
    targets: [Appointment, CommunicationRequest, DeviceRequest, MedicationRequest, NutritionOrder, Task, ServiceRequest, VisionPrescription, RequestGroup] # As listed in R4 definition
  - name: based-on
    type: reference
    description: Fulfills CarePlan
    expression: CarePlan.basedOn
    targets: [CarePlan]
  - name: care-team
    type: reference
    description: Who's involved in plan?
    expression: CarePlan.careTeam
    targets: [CareTeam]
  - name: category
    type: token
    description: Type of plan
    expression: CarePlan.category
  - name: condition
    type: reference
    description: Health issues this plan addresses
    expression: CarePlan.addresses # This targets Reference(Condition)
    targets: [Condition]
  - name: date
    type: date
    description: Time period plan covers
    expression: CarePlan.period
  - name: encounter
    type: reference
    description: Encounter created as part of
    expression: CarePlan.encounter
    targets: [Encounter]
  - name: goal
    type: reference
    description: Desired outcome of plan
    expression: CarePlan.goal
    targets: [Goal]
  - name: identifier
    type: token
    description: External Ids for this plan
    expression: CarePlan.identifier
  - name: instantiates-canonical
    type: reference
    description: Instantiates FHIR protocol or definition
    expression: CarePlan.instantiatesCanonical
    targets: [PlanDefinition, Questionnaire, Measure, ActivityDefinition, OperationDefinition] # Canonical reference targets
  - name: instantiates-uri
    type: uri
    description: Instantiates external protocol or definition
    expression: CarePlan.instantiatesUri
  - name: intent
    type: token
    description: proposal | plan | order | option
    expression: CarePlan.intent
  - name: part-of
    type: reference
    description: Part of referenced CarePlan
    expression: CarePlan.partOf
    targets: [CarePlan]
  - name: patient
    type: reference
    description: Who the care plan is for
    expression: CarePlan.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Matches if the practitioner/organization/relatedPerson/patient/careteam/healthcareservice/device is listed as a performer in any of the "simple" activities.
    expression: CarePlan.activity.detail.performer
    targets: [Practitioner, PractitionerRole, Organization, RelatedPerson, Patient, CareTeam, HealthcareService, Device] # As listed in R4 definition
  - name: replaces
    type: reference
    description: CarePlan replaced by this CarePlan
    expression: CarePlan.replaces
    targets: [CarePlan]
  - name: status
    type: token
    description: draft | active | on-hold | revoked | completed | entered-in-error | unknown
    expression: CarePlan.status
  - name: subject
    type: reference
    description: Who the care plan is for
    expression: CarePlan.subject
    targets: [Patient, Group]

```