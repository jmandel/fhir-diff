Okay, here is the RelatedPerson resource definition in the requested Markdown and YAML format, based on the provided FHIR R4 HTML.

---

# FHIR Resource: RelatedPerson (R4)

```yaml
resource:
  name: RelatedPerson
  hl7_workgroup: Patient Administration
  maturity_level: 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - RelatedPerson
  fhir_version: 4.0.1
```

Information about a person that is involved in the care for a patient, but who is not the target of healthcare, nor has a formal responsibility in the care process.

## Background and Scope

RelatedPersons typically have a personal or non-healthcare-specific professional relationship to the patient. A RelatedPerson resource is primarily used for attribution of information, since RelatedPersons are often a source of information about the patient. For keeping information about people for contact purposes for a patient, use a Patient's `contact` element. Some individuals may serve as both a Patient's Contact and a Related Person.

Examples of RelatedPersons include:
*   A patient's spouse or other relatives/friends.
*   A neighbor bringing a patient to the hospital.
*   The owner or trainer of an animal patient.
*   A patient's attorney or guardian.
*   A Guide Dog (service animal).

The primary distinction between a Practitioner and a RelatedPerson is based on whether the person/animal operates on behalf of the care delivery organization over multiple patients (Practitioner) or is not associated with the organization and is involved specifically for the patient they are related to (RelatedPerson).

A standard extension `animalSpecies` can be used to indicate the species of a service animal.

## Resource Details

The following defines the core elements of the RelatedPerson resource.

```yaml
elements:
  - name: RelatedPerson
    description: Information about a person that is involved in the care for a patient, but who is not the target of healthcare, nor has a formal responsibility in the care process.
    short: A person that is related to a patient, but who is not a direct target of care
    type: DomainResource
    comments: The base resource definition.

  - name: RelatedPerson.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifier for a person within a particular scope.
    short: A human identifier for this person
    comments: RelatedPerson identifiers might not be unique across instances within a system, as a single human individual may be represented as many different RelatedPerson resources with different roles, periods, or relationships. Systems MAY use identifier for user identities (using the type='USER').

  - name: RelatedPerson.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this related person record is in active use.
    short: Whether this related person's record is in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid.
    comments: This resource is generally assumed to be active if no value is provided for the active element.

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
    description: The nature of the relationship between a patient and the related person.
    short: The nature of the relationship
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype
      strength: Preferred
    comments: This value set includes codes for personal relationships (e.g., 'father', 'sibling') and also for roles in relation to the patient (e.g., 'Emergency Contact', 'guardian').

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
    description: A contact detail for the person, e.g. a telephone number or an email address.
    short: A contact detail for the person
    comments: RelatedPerson may have multiple ways to be contacted with different uses or applicable periods. DO NOT use .telecom properties to represent user identities.

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
    comments: If an individual has a relationship with a patient over multiple, non-adjacent periods, there should be a distinct RelatedPerson instance for each period.

  - name: RelatedPerson.communication
    cardinality: 0..*
    type: BackboneElement
    description: A language which may be used to communicate with the related person about the patient's health.
    short: A language which may be used to communicate with about the patient's health
    comments: If no language is specified, this implies that the default local language is spoken.

  - name: RelatedPerson.communication.language
    cardinality: 1..1
    type: CodeableConcept
    description: The ISO-639-1 alpha 2 code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha 2 code for the region in upper case; e.g. "en" for English, or "en-US" for American English versus "en-EN" for England English.
    short: The language which can be used to communicate with the patient about his or her health
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/languages # Common Languages
      strength: Preferred # but limited to AllLanguages
    comments: The language is commonly represented using ISO-639-1 and ISO-3166-1 codes. Not all systems actually code this but instead have it as free text. Hence CodeableConcept instead of code.

  - name: RelatedPerson.communication.preferred
    cardinality: 0..1
    type: boolean
    description: Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).
    short: Language preference indicator
    comments: This language is specifically identified for communicating healthcare information.

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
  - name: gender
    type: token
    description: Gender of the related person
    expression: RelatedPerson.gender
  - name: identifier
    type: token
    description: An Identifier of the RelatedPerson
    expression: RelatedPerson.identifier
  - name: name
    type: string
    description: A server defined search that may match any of the string fields in the HumanName, including family, give, prefix, suffix, and/or text
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
    expression: RelatedPerson.name # Path for phonetic search is typically on name parts
  - name: relationship
    type: token
    description: The relationship between the patient and the relatedperson
    expression: RelatedPerson.relationship
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: RelatedPerson.telecom
```