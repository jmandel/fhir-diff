---

# FHIR Resource: CareTeam

```yaml
resource:
  name: CareTeam
  hl7_workgroup: Patient Care
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
    - Encounter # Added based on common practice and references
```

The Care Team includes all the people and organizations who plan to participate in the coordination and delivery of care for a patient or group.

## Background and Scope

The CareTeam resource represents a dynamic group of individuals, and potentially organizations or other care teams, who are involved in coordinating and delivering care for a specific patient or a group of patients (e.g., for family therapy). It can also represent organizationally assigned teams without a specific subject, like a rapid response team. Participants are not limited to healthcare practitioners and may include family members, guardians, or the patient themselves.

A CareTeam can be specific to a care plan, an episode of care, an encounter, or represent a comprehensive view of all team members involved in a patient's care. The composition of a CareTeam can change over time, reflecting the evolving needs of the patient (e.g., a rehabilitation team).

**Boundaries and Relationships:**

*   **CareTeam vs. Group:** `CareTeam` is distinct from the `Group` resource. `Group` identifies an undifferentiated set of individuals for clinical activities (e.g., clinical trial participants), whereas `CareTeam` defines specific roles and relationships for participants in the care of a particular patient or group.
*   **Referenced By:** `CareTeam` can be referenced by resources like `EpisodeOfCare`, `Encounter`, or `CarePlan` to specify the individuals and their roles in the care provided.
*   **Provenance:** The `Provenance` resource can be used for detailed audit information, such as when the care team was last reviewed and by whom.

## Resource Details

The following defines the core elements and constraints of the CareTeam resource.

```yaml
elements:
  - name: CareTeam
    description: The Care Team includes all the people and organizations who plan to participate in the coordination and delivery of care for a patient.
    short: Planned participants in the coordination and delivery of care for a patient or group
    type: DomainResource

  - name: CareTeam.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this care team by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this team

  - name: CareTeam.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: Indicates the current state of the care team.
    short: proposed | active | suspended | inactive | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-team-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status 'entered-in-error' which means that the resource should not be treated as valid.

  - name: CareTeam.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies what kind of team. This is to support differentiation between multiple co-existing teams, such as care plan team, episode of care team, longitudinal care team.
    short: Type of team
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-team-category|4.0.1
      strength: example
    comments: There may be multiple axis of categorization and one team may serve multiple purposes.

  - name: CareTeam.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A label for human use intended to distinguish like teams. E.g. the "red" vs. "green" trauma teams.
    short: Name of the team, such as crisis assessment team

  - name: CareTeam.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group)
    description: Identifies the patient or group whose intended care is handled by the team.
    short: Who care team is for
    comments: Use Group for care provision to all members of the group (e.g. group therapy). Use Patient for care provision to an individual patient.

  - name: CareTeam.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this CareTeam was created or to which the creation of this record is tightly associated.
    short: Encounter created as part of

  - name: CareTeam.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: Indicates when the team did (or is intended to) come into effect and end.
    short: Time period team covers

  - name: CareTeam.participant
    cardinality: 0..*
    type: BackboneElement
    description: Identifies all people and organizations who are expected to be involved in the care team.
    short: Members of the team
    comments: Constraint ctm-1 (CareTeam.participant.onBehalfOf can only be populated when CareTeam.participant.member is a Practitioner) applies to this element's children.

  - name: CareTeam.participant.role
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Indicates specific responsibility of an individual within the care team, such as "Primary care physician", "Trained social worker counselor", "Caregiver", etc.
    short: Type of involvement
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participant-role|4.0.1
      strength: example
    comments: Roles may sometimes be inferred by type of Practitioner. These are relationships that hold only within the context of the care team. General relationships should be handled as properties of the Patient resource directly. If a participant has multiple roles within the team, then there should be multiple participant instances.

  - name: CareTeam.participant.member
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam)
    description: The specific person or organization who is participating/expected to participate in the care team.
    short: Who is involved
    comments: Patient only needs to be listed if they have a role other than "subject of care". Member is optional because some participants may be known only by their role, particularly in draft plans. A participant.member can be another CareTeam. If member is a Group, it should typically represent a family or household, not a group of Practitioners.

  - name: CareTeam.participant.onBehalfOf
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization of the practitioner.
    short: Organization of the practitioner

  - name: CareTeam.participant.period
    cardinality: 0..1
    type: Period
    description: Indicates when the specific member or organization did (or is intended to) come into effect and end.
    short: Time period of participant

  - name: CareTeam.reasonCode
    cardinality: 0..*
    type: CodeableConcept
    description: Describes why the care team exists.
    short: Why the care team exists (coded)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings|4.0.1 # Example binding for conditions/problems
      strength: example

  - name: CareTeam.reasonReference
    cardinality: 0..*
    type: Reference(Condition)
    description: Condition(s) that this care team addresses.
    short: Why the care team exists (reference)

  - name: CareTeam.managingOrganization
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Organization)
    description: The organization responsible for the care team.
    short: Organization responsible for the care team

  - name: CareTeam.telecom
    cardinality: 0..*
    type: ContactPoint
    description: A central contact detail for the care team (that applies to all members).
    short: A contact detail for the care team
    comments: The ContactPoint.use code of 'home' is not appropriate to use. These contacts are not the contact details of individual care team members.

  - name: CareTeam.note
    cardinality: 0..*
    type: Annotation
    description: Comments made about the CareTeam.
    short: Comments made about the CareTeam

constraints:
  - key: ctm-1
    severity: Rule
    location: CareTeam.participant
    description: CareTeam.participant.onBehalfOf can only be populated when CareTeam.participant.member is a Practitioner
    expression: onBehalfOf.exists() implies (member.resolve().iif(empty(), true, ofType(Practitioner).exists()))
```

## Search Parameters

Search parameters defined for the CareTeam resource:

```yaml
searchParameters:
  - name: category
    type: token
    description: Type of team
    expression: CareTeam.category
  - name: date
    type: date
    description: Time period team covers
    expression: CareTeam.period
  - name: encounter
    type: reference
    description: Encounter created as part of
    expression: CareTeam.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: External Ids for this team
    expression: CareTeam.identifier
  - name: participant
    type: reference
    description: Who is involved
    expression: CareTeam.participant.member
    targets: [Practitioner, Organization, CareTeam, Patient, PractitionerRole, RelatedPerson]
  - name: patient
    type: reference
    description: Who care team is for (if subject is a Patient)
    expression: CareTeam.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: status
    type: token
    description: proposed | active | suspended | inactive | entered-in-error
    expression: CareTeam.status
  - name: subject
    type: reference
    description: Who care team is for (Patient or Group)
    expression: CareTeam.subject
    targets: [Patient, Group]
```