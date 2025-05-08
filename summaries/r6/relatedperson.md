---

# FHIR Resource: RelatedPerson

```yaml
resource:
  name: RelatedPerson
  hl7_workgroup: Patient Administration
  maturity_level: 5
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - RelatedPerson
```

Information about a person that is involved in a patient's health or the care for a patient, but who is not the primary target of healthcare.

## Background and Scope

The RelatedPerson resource is used to store information about individuals who have a personal or non-healthcare-specific professional relationship with a patient. These individuals are often sources of information about the patient but are not the primary recipients of healthcare themselves.

Key aspects include:

*   **Scope:** Covers individuals like a patient's spouse, relatives, friends, neighbors, legal guardians, attorneys, or even service animals like guide dogs. It's primarily for attribution of information. For simple contact purposes, `Patient.contact` is preferred, though an individual might be both.
*   **Distinction from Practitioner:** Practitioners operate on behalf of a care delivery organization across multiple patients. RelatedPersons are typically not organization-affiliated and are involved due to their specific relationship with the patient.
*   **Relationship to Patient Resource:** If an individual represented by a RelatedPerson resource is also a patient themselves, they can have a separate Patient resource. The `Patient.link` element can be used to indicate that these two resources refer to the same individual. The RelatedPerson resource is used when they are involved in another patient's care, while the Patient resource is used when they are the target of care. For example, a mother is a Patient for her own care and a RelatedPerson for her child's care.
*   **Distinction from PersonalRelationship:** The RelatedPerson resource includes details of both the individual and their relationship to the patient, used when this information is documented within the context of a patient's chart. A RelatedPerson can be an actor (i.e., can perform actions), whereas a PersonalRelationship resource describes a relationship but cannot act.
*   **Animal Species:** The standard `animalSpecies` extension can be used to indicate the species of a service animal if the RelatedPerson represents an animal.

## Resource Details

The following defines the core elements and constraints of the RelatedPerson resource.

```yaml
elements:
  - name: RelatedPerson
    description: Information about a person that is involved in a patient's health or the care for a patient, but who is not the primary target of healthcare.
    short: A person that is related to a patient, but who is not a direct target of care
    type: DomainResource
    comments: The base resource definition.

  - name: RelatedPerson.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifier for a person within a particular scope. RelatedPerson identifiers might not be unique across instances within a system, as a single human individual may be represented as many different RelatedPerson resources with different roles, periods, or relationships. Systems MAY use identifier for user identities (using the type='USER'). Refer to the Security and Privacy section for additional guidance on representing user identities.
    short: A human identifier for this person

  - name: RelatedPerson.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this related person record is in active use. This element is labeled as a modifier because it may be used to mark that the resource was created in error.
    short: Whether this related person's record is in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid
    comments: If missing, this resource is generally assumed to be active.

  - name: RelatedPerson.patient
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient)
    description: The patient this person is related to.
    short: The patient this person is related to

  - name: RelatedPerson.relationship
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The nature of the personal relationship between the related person and the patient. The directionality of the relationship is from the RelatedPerson to the Patient. For example, if the Patient is a child, and the RelatedPerson is the mother, the relationship would be PRN (parent) or MTH (mother).
    short: The personal relationship of the related person to the patient
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-PersonalRelationshipRoleType
      strength: Preferred
    comments: This property is for personal relationships. Functional relationships are represented in RelatedPerson.role.

  - name: RelatedPerson.role
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The nature of the functional relationship between the patient and the related person.
    short: The functional role of the related person to the patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype
      strength: Preferred
    comments: This property is for functional relationships. Personal relationships are represented in RelatedPerson.relationship.

  - name: RelatedPerson.name
    flags: [Σ]
    cardinality: 0..*
    type: HumanName
    description: A name associated with the person.
    short: A name associated with the person

  - name: RelatedPerson.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the person, e.g. a telephone number or an email address. RelatedPerson may have multiple ways to be contacted with different uses or applicable periods. May need to have options for contacting the person urgently and also to help with identification.
    short: A contact detail for the person
    comments: DO NOT use .telecom properties to represent user identities. Refer to the Security and Privacy section for additional guidance on representing user identities.

  - name: RelatedPerson.gender
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the person is considered to have for administration and record keeping purposes.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender
      strength: Required

  - name: RelatedPerson.birthDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: The date on which the related person was born.
    short: The date on which the related person was born

  - name: RelatedPerson.address
    flags: [Σ]
    cardinality: 0..*
    type: Address
    description: Address where the related person can be contacted or visited.
    short: Address where the related person can be contacted or visited

  - name: RelatedPerson.photo
    cardinality: 0..*
    type: Attachment
    description: Image of the person.
    short: Image of the person

  - name: RelatedPerson.period
    cardinality: 0..1
    type: Period
    description: The period of time during which this relationship is or was active. If there are no dates defined, then the interval is unknown.
    short: Period of time that this relationship is considered valid
    comments: If an individual has a relationship with a patient over multiple, non-adjacent periods, there should be a distinct RelatedPerson instance for each period. For example, if a person is a roommate for a period of time, moves out, and is later a roommate with the same person again, you would have two RelatedPerson instances.

  - name: RelatedPerson.communication
    cardinality: 0..*
    type: BackboneElement
    description: A language which may be used to communicate with the related person about the patient's health.
    short: A language which may be used to communicate with the related person about the patient's health
    comments: If no language is specified, this implies that the default local language is spoken. If you need to convey proficiency for multiple modes, then you need multiple RelatedPerson.Communication associations. If the RelatedPerson does not speak the default local language, then the Interpreter Required Standard can be used to explicitly declare that an interpreter is required.

  - name: RelatedPerson.communication.language
    cardinality: 1..1
    type: CodeableConcept
    description: The language which may be used to communicate with the individual. The language is commonly represented using the ISO-639-1 alpha code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha code for the region in upper case. For example, "en" for English, or "en-US" for American English versus "en-AU" for Australian English, sgn-US for American Sign Language, sgn-NL for Dutch Sign Language, etc.
    short: The language which can be used to communicate with the related person about the patient's health
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/all-languages # Additional binding to Common Languages (starter) exists
      strength: Required
    comments: Not all systems actually code this but instead have it as free text. Hence CodeableConcept instead of code as the data type.

  - name: RelatedPerson.communication.preferred
    cardinality: 0..1
    type: boolean
    description: Indicates whether or not the related person prefers this language (over other languages he or she masters up a certain level).
    short: Language preference indicator
    comments: This language is specifically identified for communicating healthcare information.
```

```yaml
constraints: []
```

## Search Parameters

Search parameters defined for the RelatedPerson resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Indicates if the related person record is active
    expression: RelatedPerson.active
  - name: address
    type: string
    description: A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
    expression: RelatedPerson.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: RelatedPerson.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: RelatedPerson.address.country
  - name: address-postalcode
    type: string
    description: A postal code specified in an address
    expression: RelatedPerson.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: RelatedPerson.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: RelatedPerson.address.use
  - name: birthdate
    type: date
    description: The Related Person's date of birth
    expression: RelatedPerson.birthDate
  - name: email
    type: token
    description: A value in an email contact
    expression: RelatedPerson.telecom.where(system='email')
  - name: family
    type: string
    description: A portion of the family name of the related person
    expression: RelatedPerson.name.family
  - name: gender
    type: token
    description: Gender of the related person
    expression: RelatedPerson.gender
  - name: given
    type: string
    description: A portion of the given name of the related person
    expression: RelatedPerson.name.given
  - name: identifier
    type: token
    description: An Identifier of the RelatedPerson
    expression: RelatedPerson.identifier
  - name: name
    type: string
    description: A server defined search that may match any of the string fields in the HumanName, including family, give, prefix, suffix, suffix, and/or text
    expression: RelatedPerson.name
  - name: patient
    type: reference
    description: The patient this related person is related to
    expression: RelatedPerson.patient
    targets: [Patient]
  - name: phone
    type: token
    description: A value in a phone contact
    expression: RelatedPerson.telecom.where(system='phone')
  - name: phonetic
    type: string
    description: A portion of name using some kind of phonetic matching algorithm
    expression: RelatedPerson.name
  - name: relationship
    type: token
    description: The personal relationship between the patient and the relatedperson
    expression: RelatedPerson.relationship
  - name: role
    type: token
    description: The functional relationship between the patient and the relatedperson
    expression: RelatedPerson.role # Corrected from source HTML which had RelatedPerson.relationship
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: RelatedPerson.telecom
```