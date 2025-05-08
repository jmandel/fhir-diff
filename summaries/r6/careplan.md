Here is the FHIR resource definition for CarePlan (R6) in the requested Markdown format:

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
    - Group
    - Patient
```

Describes the intention of how one or more practitioners intend to deliver care for a particular patient, group or community for a period of time, possibly limited to care for a specific condition or set of conditions.

## Background and Scope

CarePlan is a versatile resource used across many healthcare domains, from simple immunization tracking by a GP to complex oncology treatment plans involving multiple disciplines and detailed timelines. It can apply to individual patients, groups (e.g., veterinary care for a herd, public health campaigns), or even clinical research cohorts.

This resource aims for an intermediate level of complexity, capturing essential details about participants and intended actions without mandating discrete data on dependencies and complex timing, which can be added via extensions if needed.

**Key Scope Examples:**
*   Multi-disciplinary, cross-organizational plans (e.g., oncology plans).
*   Condition-specific management plans (e.g., nutritional plans, post-injury neurological plans, prenatal/postpartum plans).
*   Decision-support generated plans based on guidelines (e.g., stroke care, diabetes management).
*   Patient or caregiver-authored plans detailing their goals and actions. (Note: Formal Advance Directives are typically represented using `Consent` or other specific request resources with `intent = directive`).

The `CarePlan` resource can represent proposed plans (e.g., recommendations) as well as active plans, differentiated by the `status` element.

**Boundaries and Relationships:**
*   **Activities:** CarePlan activities are defined using references to various "request" resources (e.g., `ServiceRequest`, `MedicationRequest`). These can be planned or active orders. CarePlans group these activities, goals, and participants to provide context.
*   **Fulfillment:** While `CarePlan` represents authorization and an overview of service provision, the `Task` resource can handle finer details of fulfillment.
*   **Conditions:** CarePlans can be linked to specific `Condition` resources but can also be condition-independent, focusing on a type of care or care provided by specific practitioners.
*   **ImmunizationRecommendation:** This can be seen as a specialized CarePlan for immunizations. Where overlap exists, `ImmunizationRecommendation` is preferred for immunization-specific events.
*   **PlanDefinition:** `CarePlan` represents a specific plan instance for a particular subject. Generic plans, protocols, or order sets are defined using `PlanDefinition`.

## Resource Details

The following defines the core elements of the CarePlan resource.

```yaml
elements:
  - name: CarePlan
    description: Describes the intention of how one or more practitioners intend to deliver care for a particular patient, group or community for a period of time, possibly limited to care for a specific condition or set of conditions.
    short: Healthcare plan for patient or group
    type: DomainResource

  - name: CarePlan.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this care plan by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this plan
    comments: This is a business identifier, not a resource identifier (see discussion).  It is best practice for the identifier to only appear on a single resource instance, however business practices may occasionally dictate that multiple resource instances with the same identifier can exist - possibly even with different resource types.  For example, multiple Patient and a Person resource instance might share the same social insurance number.

  - name: CarePlan.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest | RequestOrchestration | NutritionOrder)
    description: A higher-level request resource (i.e. a plan, proposal or order) that is fulfilled in whole or in part by this care plan.
    short: Fulfills plan, proposal or order

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
    comments: Each care plan is an independent request, such that having a care plan be part of another care plan can cause issues with cascading statuses. As such, this element is still being discussed.

  - name: CarePlan.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates whether the plan is currently being acted upon, represents future intentions or is now a historical record.
    short: draft | active | on-hold | entered-in-error | ended | completed | revoked | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/request-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: The unknown code is not to be used to convey other statuses. The unknown code should be used when one of the statuses applies, but the authoring system doesn't know the current state of the care plan.

  - name: CarePlan.intent
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: Indicates the level of authority/intentionality associated with the care plan and where the care plan fits into the workflow chain.
    short: proposal | plan | order | option | directive
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-intent
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of all descriptive attributes. For example "the time the request is recommended to occur" vs. "the time the request is authorized to occur" or "who is recommended to perform the request" vs. "who is authorized to perform the request"
    comments: This element is expected to be immutable. E.g. A "proposal" instance should never change to be a "plan" instance or "order" instance. Instead, a new instance 'basedOn' the prior instance should be created with the new 'intent' value.

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
    short: The Encounter during which this CarePlan was created
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

  - name: CarePlan.custodian
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam)
    description: When populated, the custodian is responsible for the care plan. The care plan is attributed to the custodian.
    short: Who is the designated responsible party
    comments: The custodian might or might not be a contributor.

  - name: CarePlan.contributor
    cardinality: 0..*
    type: Reference(Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam)
    description: Identifies the individual(s), organization or device who provided the contents of the care plan.
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
    type: CodeableReference(Condition | Procedure | MedicationAdministration)
    description: Identifies the conditions/problems/concerns/diagnoses/etc. whose management and/or mitigation are handled by this plan.
    short: Health issues this plan addresses
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example
    comments: Use CarePlan.addresses.concept when a code sufficiently describes the concern (e.g. condition, problem, diagnosis, risk). Use CarePlan.addresses.reference when referencing a resource, which allows more information to be conveyed, such as onset date. CarePlan.addresses.concept and CarePlan.addresses.reference are not meant to be duplicative. For a single concern, either CarePlan.addresses.concept or CarePlan.addresses.reference can be used. CarePlan.addresses.concept may be a summary code, or CarePlan.addresses.reference may be used to reference a very precise definition of the concern using Condition. Both CarePlan.addresses.concept and CarePlan.addresses.reference can be used if they are describing different concerns for the care plan.

  - name: CarePlan.supportingInfo
    cardinality: 0..*
    type: Reference(Any)
    description: Identifies portions of the patient's record that specifically influenced the formation of the plan. These might include comorbidities, recent procedures, limitations, recent assessments, etc.
    short: Information considered as part of plan
    comments: Use "concern" to identify specific conditions addressed by the care plan. supportingInfo can be used to convey one or more Advance Directives or Medical Treatment Consent Directives by referencing Consent or any other request resource with intent = directive.

  - name: CarePlan.goal
    cardinality: 0..*
    type: Reference(Goal)
    description: Describes the intended objective(s) of carrying out the care plan.
    short: Desired outcome of plan
    comments: Goal can be achieving a particular change or merely maintaining a current state or even slowing a decline.

  - name: CarePlan.activity
    cardinality: 0..*
    type: BackboneElement
    description: Identifies an action that has occurred or is a planned action to occur as part of the plan. For example, a medication to be used, lab tests to perform, self-monitoring that has occurred, education etc.
    short: Action to occur or has occurred as part of plan

  - name: CarePlan.activity.performedActivity
    cardinality: 0..*
    type: CodeableReference(Any)
    description: Identifies the activity that was performed. For example, an activity could be patient education, exercise, or a medication administration. The reference to an "event" resource, such as Procedure or Encounter or Observation, represents the activity that was performed. The requested activity can be conveyed using the CarePlan.activity.plannedActivityReference (a reference to a “request” resource).
    short: Activities that are completed or in progress (concept, or Appointment, Encounter, Procedure, etc.)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-plan-activity-performed
      strength: example
    comments: The activity performed is independent of the outcome of the related goal(s). For example, if the goal is to achieve a target body weight of 150 lbs and an activity is defined to exercise, then the activity performed could be amount and intensity of exercise performed whereas the goal outcome is an observation for the actual body weight measured.

  - name: CarePlan.activity.progress
    cardinality: 0..*
    type: Annotation
    description: Notes about the adherence/status/progress of the activity.
    short: Comments about the activity status/progress
    comments: This element should NOT be used to describe the activity to be performed - that occurs within the resource pointed to by CarePlan.activity.plannedActivityReference.

  - name: CarePlan.activity.plannedActivityReference
    cardinality: 0..1
    type: Reference(Appointment | CommunicationRequest | DeviceRequest | MedicationRequest | NutritionOrder | Task | ServiceRequest | VisionPrescription | RequestOrchestration | ImmunizationRecommendation | SupplyRequest)
    description: The details of the proposed activity represented in a specific resource.
    short: Activity that is intended to be part of the care plan
    comments: Standard extension exists (http://hl7.org/fhir/StructureDefinition/resource-pertainsToGoal) that allows goals to be referenced from any of the referenced resources in CarePlan.activity.plannedActivityReference. The goal should be visible when the resource referenced by CarePlan.activity.plannedActivityReference is viewed independently from the CarePlan. Requests that are pointed to by a CarePlan using this element should *not* point to this CarePlan using the "basedOn" element. i.e. Requests that are part of a CarePlan are not "based on" the CarePlan.

  - name: CarePlan.note
    cardinality: 0..*
    type: Annotation
    description: General notes about the care plan not covered elsewhere.
    short: Comments about the plan

```
## Constraints

*No formal constraints are defined for CarePlan in the provided source material in the same way as `enc-1` for Encounter.*

## Search Parameters

Search parameters defined for the CarePlan resource:

```yaml
searchParameters:
  - name: activity-reference
    type: reference
    description: Activity that is intended to be part of the care plan
    expression: CarePlan.activity.plannedActivityReference
    targets: [Appointment, CommunicationRequest, DeviceRequest, ImmunizationRecommendation, MedicationRequest, NutritionOrder, RequestOrchestration, ServiceRequest, SupplyRequest, Task, VisionPrescription]
  - name: based-on
    type: reference
    description: Fulfills CarePlan
    expression: CarePlan.basedOn
    targets: [CarePlan, NutritionOrder, RequestOrchestration, ServiceRequest]
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
    description: Reference to a resource (by instance)
    expression: CarePlan.addresses.reference
    targets: [Condition, Procedure, MedicationAdministration] # Derived from CodeableReference type on CarePlan.addresses
  - name: custodian
    type: reference
    description: Who is the designated responsible party
    expression: CarePlan.custodian
    targets: [Patient, Practitioner, PractitionerRole, Device, RelatedPerson, Organization, CareTeam]
  - name: date
    type: date
    description: Time period plan covers
    expression: CarePlan.period
  - name: encounter
    type: reference
    description: The Encounter during which this CarePlan was created
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
  - name: intent
    type: token
    description: proposal | plan | order | option | directive
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
  - name: replaces
    type: reference
    description: CarePlan replaced by this CarePlan
    expression: CarePlan.replaces
    targets: [CarePlan]
  - name: status
    type: token
    description: draft | active | on-hold | revoked | completed | entered-in-error | unknown # Note: 'ended' is also in element definition
    expression: CarePlan.status
  - name: subject
    type: reference
    description: Who the care plan is for
    expression: CarePlan.subject
    targets: [Group, Patient]
```