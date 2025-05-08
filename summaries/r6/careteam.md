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
```

The Care Team includes all the people, organizations, and care teams who participate or plan to participate in the coordination and delivery of care.

## Background and Scope

The CareTeam resource is designed to list the individuals, organizations, and even other care teams that are involved, or are planned to be involved, in the healthcare of a subject. This subject can be a single patient, a group (e.g., for family therapy), or even relate to an event before a specific subject is known (like an emergency response team).

Key aspects of CareTeam include:

*   **Versatile Membership:** Participants are not restricted to healthcare practitioners; they can include family members, guardians, the patient themselves, or other caregivers.
*   **Dynamic Nature:** A CareTeam can change over time. Members might join or leave, reflecting the evolving needs of the patient or the phase of care (e.g., a rehabilitation team).
*   **Contextual Application:** A CareTeam can be specific to various contexts such as a particular care plan, an episode of care, or an encounter. It can also represent a comprehensive list of all known team members across different healthcare interactions.
*   **Subject Focus:** The CareTeam is typically associated with a `subject`, which can be a `Patient` or a `Group`. It can also exist without a subject, for instance, for an event-specific team (e.g., code blue team) before a patient is identified.

## Boundaries and Relationships

*   **CareTeam vs. Group:** `CareTeam` is distinct from `Group`. While `Group` identifies an undifferentiated set of individuals targeted by clinical activities (e.g., clinical trial participants), `CareTeam` details the specific members (individuals or organizations) and their roles in delivering care.
*   **Referenced By:** Resources like `EpisodeOfCare`, `Encounter`, and `CarePlan` can reference `CareTeam` to identify the set of individuals and their respective roles involved in the care defined by those resources.

## Resource Details

The following defines the core elements and constraints of the CareTeam resource.

```yaml
elements:
  - name: CareTeam
    description: The Care Team includes all the people, organizations, and care teams who participate or plan to participate in the coordination and delivery of care.
    short: Planned participants in the coordination and delivery of care
    type: DomainResource
    comments: The base resource definition.

  - name: CareTeam.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this care team by the performer or other systems which remain constant as the resource is updated and propagates from server to server.
    short: External Ids for this team
    comments: This is a business identifier, not a resource identifier (see discussion).  It is best practice for the identifier to only appear on a single resource instance, however business practices may occasionally dictate that multiple resource instances with the same identifier can exist - possibly even with different resource types.  For example, multiple Patient and a Person resource instance might share the same social insurance number.

  - name: CareTeam.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: Indicates the current state of the care team.
    short: proposed | active | suspended | inactive | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-team-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because the status contains the code entered-in-error that marks the care team as not currently valid.

  - name: CareTeam.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Identifies what kind of team.  This is to support differentiation between multiple co-existing teams, such as care plan team, episode of care team, longitudinal care team.
    short: Type of team
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/care-team-category
      strength: example
    comments: There may be multiple axis of categorization and one team may serve multiple purposes.

  - name: CareTeam.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A label for human use intended to distinguish like teams.  E.g. the "red" vs. "green" trauma teams.
    short: Name of the team, such as crisis assessment team
    comments: The meaning/purpose of the team is conveyed in CareTeam.category.  This element may also convey semantics of the team (e.g. "Red trauma team"), but its primary purpose is to distinguish between identical teams in a human-friendly way.  ("Team 18735" isn't as friendly.).

  - name: CareTeam.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group)
    description: Identifies the patient or group whose intended care is handled by the team.
    short: Who care team is for
    comments: Use Group for care provision to all members of the group (e.g. group therapy).  Use Patient for care provision to an individual patient.

  - name: CareTeam.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: Indicates when the team did (or is intended to) come into effect and end.
    short: Time period team covers

  - name: CareTeam.participant
    flags: [C]
    cardinality: 0..*
    type: BackboneElement
    description: Identifies all people and organizations who are expected to be involved in the care team.
    short: Members of the team

  - name: CareTeam.participant.role
    flags: [Σ, C]
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates specific responsibility of an individual within the care team, such as "Primary care physician", "Trained social worker counselor", "Caregiver", etc.
    short: Type of involvement
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/participant-role
      strength: example
    comments: Roles may sometimes be inferred by type of Practitioner.  These are relationships that hold only within the context of the care team.  General relationships should be handled as properties of the Patient resource directly.  If a participant has multiple roles within the team, then there should be multiple participants.

  - name: CareTeam.participant.member
    flags: [Σ, C]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam | Group)
    description: The specific person or organization who is participating/expected to participate in the care team.
    short: Who is involved
    comments: Patient only needs to be listed if they have a role other than "subject of care". Member is optional because some participants may be known only by their role, particularly in draft plans. Using Group is only allowed when the group represents a family or a household and should not represent groups of Practitioners.

  - name: CareTeam.participant.onBehalfOf
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam | Group)
    description: Entity that the participant is acting as a proxy of, or an agent of, or in the interest of, or as a representative of.
    short: Entity that the participant is acting as a proxy of, or an agent of, or in the interest of, or as a representative of
    comments: Using Group is only allowed when the group represents a family or a household and should not represent groups of Practitioners.

  - name: CareTeam.participant.effective[x]
    cardinality: 0..1
    type: Period | Timing
    description: When the member is generally available within this care team.
    short: When the member is generally available within this care team
    comments: This is populated while creating / managing the CareTeam to ensure there is coverage when servicing CarePlan activities from the Schedule.

  - name: CareTeam.reason
    cardinality: 0..*
    type: CodeableReference(Condition)
    description: Describes why the care team exists.
    short: Why the care team exists
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings # Assumed, was SNOMEDCTClinicalFindings
      strength: example

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
    short: A contact detail for the care team (that applies to all members)
    comments: The ContactPoint.use code of home is not appropriate to use. These contacts are not the contact details of individual care team members.

  - name: CareTeam.note
    cardinality: 0..*
    type: Annotation
    description: Comments made about the CareTeam.
    short: Comments made about the CareTeam

constraints:
  - key: ctm-2
    severity: Warning
    location: CareTeam.participant
    description: CareTeam.participant.role or CareTeam.participant.member exists
    expression: role.exists() or member.exists()

```

## Notes

*   The `Provenance` resource can be used for detailed review information, such as when the care team was last reviewed and by whom.

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
    expression: CareTeam.period # Standard 'date' search param often covers period
  - name: identifier
    type: token
    description: External Ids for this team
    expression: CareTeam.identifier
  - name: name
    type: string
    description: Name of the team, such as crisis assessment team
    expression: CareTeam.name | CareTeam.extension('http://hl7.org/fhir/StructureDefinition/careteam-alias').value # As per search parameter definition in HTML
  - name: participant
    type: reference
    description: Who is involved
    expression: CareTeam.participant.member
    targets: [Practitioner, Group, Organization, CareTeam, Patient, PractitionerRole, RelatedPerson]
  - name: patient
    type: reference
    description: Who care team is for
    expression: CareTeam.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: status
    type: token
    description: proposed | active | suspended | inactive | entered-in-error
    expression: CareTeam.status
  - name: subject
    type: reference
    description: Who care team is for
    expression: CareTeam.subject
    targets: [Group, Patient]
# Note: The HTML page for CareTeam search parameters does not list reason-code or reason-reference explicitly.
# If they were standard, they would be:
# - name: reason-code
#   type: token
#   description: Why the care team exists (coded)
#   expression: CareTeam.reason.concept
# - name: reason-reference
#   type: reference
#   description: Why the care team exists (reference)
#   expression: CareTeam.reason.reference
#   targets: [Condition]
```