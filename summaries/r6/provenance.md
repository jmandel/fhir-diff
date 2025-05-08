---

# FHIR Resource: Provenance

```yaml
resource:
  name: Provenance
  hl7_workgroup: Security
  maturity_level: 4
  standard_status: Trial Use
  security_category: Not Classified
  compartments:
    - Device
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource. Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility. Provenance assertions are a form of contextual metadata and can themselves become important records with their own provenance. Provenance statement indicates clinical significance in terms of confidence in authenticity, reliability, and trustworthiness, integrity, and stage in lifecycle (e.g. Document Completion - has the artifact been legally authenticated), all of which may impact security, privacy, and trust policies.

## Background and Scope

The Provenance resource tracks information about the activity that created, revised, deleted, or signed a version of a resource. It describes the entities and agents involved, which helps in assessing the quality, reliability, and trustworthiness of the resource.

Key aspects include:

*   **Purpose:** To record the context of how information in a resource was obtained. It's typically prepared by the application initiating the resource's creation or update. This contrasts with `AuditEvent`, which is often created by the responding application to track events as they occur.
*   **Relationship to Target:** Provenance resources reference the resource(s) they describe (the `target`). Multiple Provenance records can exist for a single resource or version.
*   **W3C Provenance Model:** The FHIR Provenance resource is based on the W3C Provenance model, focusing on the "Generation" of an "Entity" (the FHIR resource). It involves:
    *   **Entity:** The resource being created or updated (`target`), and other resources used in the process (`entity`).
    *   **Agent:** Participants (persons, devices, systems, organizations) responsible for the activity.
    *   **Activity:** The event that generated or modified the target resource.
*   **Referencing:** Provenance relies on unique and unambiguous references to all involved resources, entities, and agents, often including versioning information.
*   **Overlap:** Many FHIR resources have their own provenance-related elements (e.g., author, recorder). These should be used preferentially. The Provenance resource is for additional details or when an explicit, separate record of provenance is needed.

## Resource Details

The following defines the core elements and constraints of the Provenance resource.

```yaml
elements:
  - name: Provenance
    short: Who, What, When for a set of resources
    description: Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource. Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility. Provenance assertions are a form of contextual metadata and can themselves become important records with their own provenance. Provenance statement indicates clinical significance in terms of confidence in authenticity, reliability, and trustworthiness, integrity, and stage in lifecycle (e.g. Document Completion - has the artifact been legally authenticated), all of which may impact security, privacy, and trust policies.
    type: DomainResource
    comments: Some parties may be duplicated between the target resource and its provenance. For instance, the prescriber is usually (but not always) the author of the prescription resource. This resource is defined with close consideration for W3C Provenance.

  - name: Provenance.target
    flags: [Σ]
    cardinality: 1..*
    type: Reference(Any)
    short: Target Reference(s) (usually version specific)
    description: The Reference(s) that were generated or updated by the activity described in this resource. A provenance can point to more than one target if multiple resources were created/updated by the same activity.
    comments: Target references are usually version specific, but might not be, if a version has not been assigned or if the provenance information is part of the set of resources being maintained (i.e. a document). When using the RESTful API, the identity of the resource might not be known (especially not the version specific one); the client may either submit the resource first, and then the provenance, or it may submit both using a single transaction. See the notes on transaction for further discussion.

  - name: Provenance.occurred[x]
    flags: [Σ]
    cardinality: 0..1
    type: Period | dateTime
    short: When the activity occurred
    description: The period during which the activity occurred.
    comments: The period can be a little arbitrary; where possible, the time should correspond to human assessment of the activity time.

  - name: Provenance.recorded
    flags: [Σ]
    cardinality: 0..1
    type: instant
    short: When the activity was recorded / updated
    description: The date and time at which the provenance information was recorded / updated, whether in the FHIR Provenance resource or in some other form that is later communicated in the FHIR Provenance.
    comments: This can be a little different from the lastUpdated on the Provenance resource if there is a delay between recording the event and updating the provenance and target resource.

  - name: Provenance.policy
    cardinality: 0..*
    type: uri
    short: Policy or plan the activity was defined by
    description: Policy or plan the activity was defined by. Typically, a single activity may have multiple applicable policy documents, such as patient consent, guarantor funding, etc.
    comments: For example, Where an OAuth token authorizes, the unique identifier from the OAuth token is placed into the policy element. Where a policy engine (e.g. XACML) holds policy logic, the unique policy identifier is placed into the policy element.

  - name: Provenance.location
    cardinality: 0..1
    type: Reference(Location)
    short: Where the activity occurred
    description: Where the activity occurred.

  - name: Provenance.authorization
    cardinality: 0..*
    type: CodeableReference() # Note: HTML page seems to miss target types, but it's a generic CodeableReference
    short: Authorization (purposeOfUse) related to the event
    description: The authorization (e.g., PurposeOfUse) that was used during the event being recorded.
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-PurposeOfUse
      strength: example

  - name: Provenance.why
    cardinality: 0..1
    type: markdown
    short: Why was the event performed?
    description: Describes why the event recorded in this provenenace occurred in textual form.

  - name: Provenance.activity
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    short: Activity that occurred
    description: An activity is something that occurs over a period of time and acts upon or with entities; it may include consuming, processing, transforming, modifying, relocating, using, or generating entities.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-activity-type
      strength: example

  - name: Provenance.basedOn
    flags: [TU]
    cardinality: 0..*
    type: Reference(Any)
    short: Workflow authorization within which this event occurred
    description: A plan, proposal or order that is fulfilled in whole or in part by this provenance.
    comments: Allows tracing of authorization for the provenance and tracking whether proposals/recommendations were acted upon.

  - name: Provenance.patient
    flags: [Σ, TU]
    cardinality: 0..1
    type: Reference(Patient)
    short: The patient is the subject of the data created/updated (.target) by the activity
    description: The patient element is available to enable deterministic tracking of activities that involve the patient as the subject of the data used in an activity.
    comments: When the .patient is populated it shall be accurate to the subject of the target data. The .patient shall not be populated when the target data created/updated (.target) by the activity does not involve a subject. Note that when the patient is an agent, they will be recorded as an agent. When the Patient resource is Created, Updated, or Deleted it will be recorded as an entity. May also affect access control.

  - name: Provenance.encounter
    flags: [TU]
    cardinality: 0..1
    type: Reference(Encounter)
    short: Encounter within which this event occurred or which the event is tightly associated
    description: This will typically be the encounter the event occurred, but some events may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission lab tests).
    comments: Links the provenance to the Encounter context. May also affect access control.

  - name: Provenance.agent
    flags: [Σ, C]
    cardinality: 1..*
    type: BackboneElement
    short: Actor involved
    description: An actor taking a role in an activity for which it can be assigned some degree of responsibility for the activity taking place.
    comments: Several agents may be associated (i.e. has some responsibility for an activity) with an activity and vice-versa. An agent can be a person, an organization, software, device, or other entities that may be ascribed responsibility.

  - name: Provenance.agent.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    short: How the agent participated
    description: The Functional Role of the agent with respect to the activity.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participation-role-type
      strength: example
    comments: For example assembler, author, prescriber, signer, investigator, etc. Functional roles reflect functional aspects of relationships between entities. Functional roles are bound to the realization/performance of acts, where actions might be concatenated to an activity or even to a process. This element will hold the functional role that the agent played in the activity that is the focus of this Provenance. Where an agent played multiple functional roles, they will be listed as multiple .agent elements representing each functional participation. See ISO 21298:2018 - Health Informatics - Functional and structural roles, and ISO 22600-2:2014 - Health Informatics - Privilege Management and Access Control - Part 2: formal models.

  - name: Provenance.agent.role
    cardinality: 0..*
    type: CodeableConcept
    short: What the agents role was
    description: The structural roles of the agent indicating the agent's competency. The security role enabling the agent with respect to the activity.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/security-role-type
      strength: example
    comments: For example Chief-of-Radiology, Nurse, Physician, Medical-Student, etc. Structural roles reflect the structural aspects of relationships between entities. Structural roles describe prerequisites, feasibilities, or competences for acts. Functional roles reflect functional aspects of relationships between entities. Functional roles are bound to the realization/performance of acts, where actions might be concatenated to an activity or even to a process. See ISO 21298:2018 - Health Informatics - Functional and structural roles, and ISO 22600-2:2014 - Health Informatics - Privilege Management and Access Control - Part 2: formal models.

  - name: Provenance.agent.who
    flags: [Σ, C]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson | Group | HealthcareService)
    short: The agent that participated in the event
    description: Indicates who or what performed in the event.

  - name: Provenance.agent.onBehalfOf
    flags: [C]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | Group | HealthcareService)
    short: The agent that delegated
    description: The agent that delegated authority to perform the activity performed by the agent.who element.

  - name: Provenance.entity
    flags: [Σ, TU]
    cardinality: 0..*
    type: BackboneElement
    short: An entity used in this activity
    description: An entity used in this activity.

  - name: Provenance.entity.role
    flags: [Σ]
    cardinality: 1..1
    type: code
    short: revision | quotation | source | instantiates | removal
    description: How the entity was used during the activity.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-entity-role
      strength: required

  - name: Provenance.entity.what
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Any)
    short: Identity of entity
    description: Identity of the Entity used. May be a logical or physical uri and maybe absolute or relative.
    comments: The what.identifier should be used for entities that are not a Resource type.

  - name: Provenance.entity.agent
    cardinality: 0..*
    type: Provenance.agent # Indicates structure is reused from Provenance.agent
    short: Entity is attributed to this agent
    description: The entity is attributed to an agent to express the agent's responsibility for that entity, possibly along with other agents. This description can be understood as shorthand for saying that the agent was responsible for the activity which used the entity.
    comments: A usecase where one Provenance.entity.agent is used where the Entity that was used in the creation/updating of the Target, is not in the context of the same custodianship as the Target, and thus the meaning of Provenance.entity.agent is to say that the entity referenced is managed elsewhere and that this Agent provided access to it. This would be similar to where the Entity being referenced is managed outside FHIR, such as through HL7 V2, v3, or XDS. This might be where the Entity being referenced is managed in another FHIR resource server. Thus it explains the Provenance of that Entity's use in the context of this Provenance activity.

  - name: Provenance.signature
    flags: [TU]
    cardinality: 0..*
    type: Signature
    short: Signature on target
    description: A digital signature on the target Reference(s). The signer should match a Provenance.agent. The purpose of the signature is indicated.

constraints:
  - key: prov-1
    severity: Rule
    location: Provenance.agent
    description: Who and onBehalfOf cannot be the same
    expression: who.resolve().exists() and onBehalfOf.resolve().exists() implies who.resolve() != onBehalfOf.resolve()
  - key: prov-2
    severity: Rule
    location: Provenance.agent
    description: If who is a PractitionerRole, onBehalfOf can't reference the same Practitioner
    expression: who.resolve().ofType(PractitionerRole).practitioner.resolve().exists() and onBehalfOf.resolve().ofType(Practitioner).exists() implies who.resolve().practitioner.resolve() != onBehalfOf.resolve()
  - key: prov-3
    severity: Rule
    location: Provenance.agent
    description: If who is an organization, onBehalfOf can't be a PractitionerRole within that organization
    expression: who.resolve().ofType(Organization).exists() and onBehalfOf.resolve().ofType(PractitionerRole).organization.resolve().exists() implies who.resolve() != onBehalfOf.resolve().organization.resolve()
  - key: prov-4
    severity: Rule
    location: Provenance.agent
    description: If who is an organization, onBehalfOf can't be a healthcare service within that organization
    expression: who.resolve().ofType(Organization).exists() and onBehalfOf.resolve().ofType(HealthcareService).providedBy.resolve().exists() implies who.resolve() != onBehalfOf.resolve().ofType(HealthcareService).providedBy.resolve()

```

## Search Parameters

Search parameters defined for the Provenance resource:

```yaml
searchParameters:
  - name: activity
    type: token
    description: Activity that occurred
    expression: Provenance.activity
  - name: agent
    type: reference
    description: Who participated
    expression: Provenance.agent.who
    targets: [Practitioner, PractitionerRole, Organization, CareTeam, Patient, Device, RelatedPerson, Group, HealthcareService]
  - name: agent-role
    type: token
    description: What the agent's role was
    expression: Provenance.agent.role
  - name: agent-type
    type: token
    description: How the agent participated
    expression: Provenance.agent.type
  - name: based-on
    type: reference
    description: Reference to the service request.
    expression: Provenance.basedOn
    targets: [Any]
  - name: encounter
    type: reference
    description: Encounter related to the Provenance
    expression: Provenance.encounter
    targets: [Encounter]
  - name: entity
    type: reference
    description: Identity of entity
    expression: Provenance.entity.what
    targets: [Any]
  - name: location
    type: reference
    description: Where the activity occurred, if relevant
    expression: Provenance.location
    targets: [Location]
  - name: patient
    type: reference
    description: Where the activity involved patient data
    expression: Provenance.patient
    targets: [Patient]
  - name: recorded
    type: date
    description: When the activity was recorded / updated
    expression: Provenance.recorded
  - name: signature-type
    type: token
    description: Indication of the reason the entity signed the object(s)
    expression: Provenance.signature.type
  - name: target
    type: reference
    description: Target Reference(s) (usually version specific)
    expression: Provenance.target
    targets: [Any]
  - name: when
    type: date
    description: When the activity occurred
    expression: (Provenance.occurred.ofType(dateTime)) # Or Provenance.occurredPeriod
```