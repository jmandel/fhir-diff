Okay, I will process the provided HTML for the FHIR R4 Provenance resource and transform it into the requested Markdown format with embedded YAML blocks. I will prioritize the content from the `hl7.org/fhir/R4/provenance.html` source for R4-specific definitions.

---

# FHIR Resource: Provenance

```yaml
resource:
  name: Provenance
  hl7_workgroup: Security
  maturity_level: 3
  standard_status: Trial Use
  security_category: Not Classified
  compartments:
    - Device
    - Patient
    - Practitioner
    - RelatedPerson
```

Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource. Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility. Provenance assertions are a form of contextual metadata and can themselves become important records with their own provenance. Provenance statement indicates clinical significance in terms of confidence in authenticity, reliability, and trustworthiness, integrity, and stage in lifecycle (e.g. Document Completion - has the artifact been legally authenticated), all of which may impact security, privacy, and trust policies.

## Background and Scope

The Provenance resource is designed to track the history of a resource, detailing the activities, entities, and agents involved in its lifecycle. This information is crucial for assessing data quality, reliability, and trustworthiness.

Key aspects include:

*   **Purpose:** Records the creation, revision, deletion, or signing of a resource version, identifying who did what, when, and often why.
*   **Relationship to AuditEvent:** While `AuditEvent` records security-relevant events as they occur (often by the system responding to an action), `Provenance` is a record-keeping assertion about the context of a resource's state, typically created by the system initiating the change.
*   **W3C PROV Alignment:** Based on the W3C Provenance model, the FHIR `Provenance` resource primarily covers the "Generation" of an "Entity" (the FHIR resource). "Usage" and other "Activities" are more aligned with `AuditEvent`.
*   **Core Model:** A `Provenance` resource describes a single activity that generated or updated one or more `target` resources. This activity involves `agent`(s) (performers, authors, devices, etc.) and may use other `entity`(s) (sources, inputs).
*   **Referencing:** Relies on references to identify targets, agents, and entities. These references should be unique and unambiguous; version-specific references are preferred for targets when applicable.
*   **Usage Scenarios:**
    *   **Document Bundles:** Can identify the provenance of parts or all of a document.
    *   **RESTful Systems:** Tracks provenance for resources managed via API. Transactions are recommended to ensure atomicity when creating/updating a resource and its provenance record.
*   **HTTP X-Provenance Header:** A mechanism to submit a Provenance resource alongside a POST or PUT operation for a target resource. The server is expected to populate the `target` element of the received Provenance.
*   **Signatures:** The `Provenance.signature` element allows for digital signatures on the target resource(s) to ensure integrity and non-repudiation.
*   **Provenance of Removal:** Can document the deletion of a resource, including who performed the deletion.
*   **Import and Transformation:** Useful for recording the activity of systems that transform data (e.g., HL7 v2 to FHIR, CDA to FHIR), identifying the transforming agent and the original source data as an entity.

## Resource Details

The following defines the core elements of the Provenance resource based on FHIR R4.

```yaml
elements:
  - name: Provenance
    description: Provenance of a resource is a record that describes entities and processes involved in producing and delivering or otherwise influencing that resource. Provenance provides a critical foundation for assessing authenticity, enabling trust, and allowing reproducibility. Provenance assertions are a form of contextual metadata and can themselves become important records with their own provenance. Provenance statement indicates clinical significance in terms of confidence in authenticity, reliability, and trustworthiness, integrity, and stage in lifecycle (e.g. Document Completion - has the artifact been legally authenticated), all of which may impact security, privacy, and trust policies.
    short: Who, What, When for a set of resources
    type: DomainResource
    comments: Some parties may be duplicated between the target resource and its provenance. For instance, the prescriber is usually (but not always) the author of the prescription resource. This resource is defined with close consideration for W3C Provenance.

  - name: Provenance.target
    flags: [Σ]
    cardinality: 1..*
    type: Reference(Any)
    description: The Reference(s) that were generated or updated by the activity described in this resource. A provenance can point to more than one target if multiple resources were created/updated by the same activity.
    short: Target Reference(s) (usually version specific)
    comments: Target references are usually version specific, but might not be, if a version has not been assigned or if the provenance information is part of the set of resources being maintained (i.e. a document). When using the RESTful API, the identity of the resource might not be known (especially not the version specific one); the client may either submit the resource first, and then the provenance, or it may submit both using a single transaction.

  - name: Provenance.occurred[x]
    cardinality: 0..1
    type: Period | dateTime
    description: The period during which the activity occurred.
    short: When the activity occurred
    comments: The period can be a little arbitrary; where possible, the time should correspond to human assessment of the activity time.

  - name: Provenance.recorded
    flags: [Σ]
    cardinality: 1..1
    type: instant
    description: The instant of time at which the activity was recorded.
    short: When the activity was recorded / updated
    comments: This can be a little different from the lastUpdated on the Provenance resource if there is a delay between recording the event and updating the provenance and target resource.

  - name: Provenance.policy
    cardinality: 0..*
    type: uri
    description: Policy or plan the activity was defined by. Typically, a single activity may have multiple applicable policy documents, such as patient consent, guarantor funding, etc.
    short: Policy or plan the activity was defined by
    comments: For example, Where an OAuth token authorizes, the unique identifier from the OAuth token is placed into the policy element. Where a policy engine (e.g. XACML) holds policy logic, the unique policy identifier is placed into the policy element.

  - name: Provenance.location
    cardinality: 0..1
    type: Reference(Location)
    description: Where the activity occurred, if relevant.
    short: Where the activity occurred, if relevant

  - name: Provenance.reason
    cardinality: 0..*
    type: CodeableConcept
    description: The reason that the activity was taking place.
    short: Reason the activity is occurring
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-PurposeOfUse
      strength: extensible

  - name: Provenance.activity
    cardinality: 0..1
    type: CodeableConcept
    description: An activity is something that occurs over a period of time and acts upon or with entities; it may include consuming, processing, transforming, modifying, relocating, using, or generating entities.
    short: Activity that occurred
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-activity-type # As per R4, build.fhir.org shows a different (example) binding
      strength: extensible

  - name: Provenance.agent
    cardinality: 1..*
    type: BackboneElement
    description: An actor taking a role in an activity for which it can be assigned some degree of responsibility for the activity taking place.
    short: Actor involved
    comments: Several agents may be associated (i.e. has some responsibility for an activity) with an activity and vice-versa. An agent can be a person, an organization, software, device, or other entities that may be ascribed responsibility.

  - name: Provenance.agent.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The participation the agent had with respect to the activity.
    short: How the agent participated
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-agent-type # As per R4 structure table.
      strength: extensible
    comments: For example, assembler, author, prescriber, signer, investigator, etc. This element is new in R4.

  - name: Provenance.agent.role
    cardinality: 0..*
    type: CodeableConcept
    description: The function of the agent with respect to the activity. The security role enabling the agent with respect to the activity.
    short: What the agent's role was
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/security-role-type # As per R4 structure table.
      strength: example
    comments: For example, Chief-of-Radiology, Nurse, Physician, Medical-Student, etc.

  - name: Provenance.agent.who
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)
    description: The individual, device or organization that participated in the event.
    short: Who participated

  - name: Provenance.agent.onBehalfOf
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)
    description: The individual, device, or organization for whom the change was made.
    short: Who the agent is representing

  - name: Provenance.entity
    cardinality: 0..*
    type: BackboneElement
    description: An entity used in this activity.
    short: An entity used in this activity

  - name: Provenance.entity.role
    flags: [Σ]
    cardinality: 1..1
    type: code
    description: How the entity was used during the activity.
    short: derivation | revision | quotation | source | removal
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-entity-role
      strength: required

  - name: Provenance.entity.what
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Any)
    description: Identity of the Entity used. May be a logical or physical uri and maybe absolute or relative.
    short: Identity of entity
    comments: The what.identifier should be used for entities that are not a Resource type.

  - name: Provenance.entity.agent
    type: BackboneElement # This indicates it's a list of structures similar to Provenance.agent
    cardinality: 0..*
    description: The entity is attributed to an agent to express the agent's responsibility for that entity, possibly along with other agents. This description can be understood as shorthand for saying that the agent was responsible for the activity which used the entity.
    short: Entity is attributed to this agent
    comments: A usecase where one Provenance.entity.agent is used where the Entity that was used in the creation/updating of the Target, is not in the context of the same custodianship as the Target, and thus the meaning of Provenance.entity.agent is to say that the entity referenced is managed elsewhere and that this Agent provided access to it.

  - name: Provenance.entity.agent.type # Duplicating structure from Provenance.agent as per example style
    flags: [Σ] # Assuming Σ based on Provenance.agent.type
    cardinality: 0..1
    type: CodeableConcept
    description: The participation the agent (associated with the entity) had.
    short: How the agent participated (for entity)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/provenance-agent-type
      strength: extensible

  - name: Provenance.entity.agent.role
    cardinality: 0..*
    type: CodeableConcept
    description: The function of the agent (associated with the entity).
    short: What the agent's role was (for entity)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/security-role-type
      strength: example

  - name: Provenance.entity.agent.who
    flags: [Σ] # Assuming Σ based on Provenance.agent.who
    cardinality: 1..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)
    description: The individual, device or organization (associated with the entity).
    short: Who participated (for entity)

  - name: Provenance.entity.agent.onBehalfOf
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization)
    description: The individual, device, or organization for whom the change was made (for entity).
    short: Who the agent is representing (for entity)

  - name: Provenance.signature
    cardinality: 0..*
    type: Signature
    description: A digital signature on the target Reference(s). The signer should match a Provenance.agent. The purpose of the signature is indicated.
    short: Signature on target
```
```yaml
constraints: [] # No constraints are explicitly listed in the R4 HTML summary table. Formal constraints are in the StructureDefinition.
```

## Search Parameters

Search parameters defined for the Provenance resource (FHIR R4):

```yaml
searchParameters:
  - name: agent
    type: reference
    description: Who participated
    expression: Provenance.agent.who
    targets: [Practitioner, PractitionerRole, RelatedPerson, Patient, Device, Organization]
  - name: agent-role
    type: token
    description: What the agent's role was
    expression: Provenance.agent.role
  - name: agent-type
    type: token
    description: How the agent participated
    expression: Provenance.agent.type
  - name: entity
    type: reference
    description: Identity of entity
    expression: Provenance.entity.what
    targets: [Any] # Any FHIR resource
  - name: location
    type: reference
    description: Where the activity occurred, if relevant
    expression: Provenance.location
    targets: [Location]
  - name: patient
    type: reference
    description: Target Reference(s) (usually version specific) pointing to a Patient
    expression: Provenance.target.where(resolve() is Patient)
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
    targets: [Any] # Any FHIR resource
  - name: when # Corresponds to occurred[x]
    type: date
    description: When the activity occurred
    expression: Provenance.occurredDateTime | Provenance.occurredPeriod # FHIR search combines these
```