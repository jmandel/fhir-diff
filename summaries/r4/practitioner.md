Okay, I will process the FHIR Practitioner R4 definition based on the provided HTML content and format it similarly to your Encounter example. I will prioritize the R4 specification content from `https://hl7.org/fhir/R4/practitioner.html` and its linked R4 definitions page for element structure and search parameters to ensure R4 accuracy. Textual descriptions will be sourced from these R4 pages.

---

# FHIR Resource: Practitioner

```yaml
resource:
  name: Practitioner
  hl7_workgroup: Patient Administration
  maturity_level: 3
  standard_status: Trial Use
  security_category: Individual
  compartments:
    - Practitioner
```

A person who is directly or indirectly involved in the provisioning of healthcare.

## Background and Scope

The Practitioner resource covers all individuals engaged in healthcare processes and related services as part of their formal responsibilities. This resource is used for attributing activities and responsibilities to these individuals. This includes a wide range of professionals such as physicians, dentists, pharmacists, nurses, midwives, therapists, medical technicians, social workers, IT personnel involved in patient record management, and even service animals with formal roles in care.

**Boundaries and Relationships:**

*   The Practitioner resource is **not** for individuals involved informally (e.g., friends, relatives caring for a patient). Such individuals are typically represented as `Patient.contact` or `RelatedPerson`.
*   The primary distinction between a `Practitioner` and a `RelatedPerson` is whether the person/animal operates on behalf of the care delivery organization across multiple patients (`Practitioner`) or is allocated tasks specifically for a `RelatedPerson`'s patient without being formally associated with the organization (`RelatedPerson`).
*   An extension `animalSpecies` can denote the species of a service animal.
*   `PractitionerRole`: Details the roles a practitioner is approved for within specific organizations, locations, and services.
*   `CareTeam`: Practitioners are often grouped into care teams, where their specific role within that team is defined.

Practitioners may perform different roles within the same or different organizations. Depending on jurisdictional practices, it might be necessary to maintain separate Practitioner Resources for each role or have a single Practitioner with multiple roles. Roles can be time-limited. The represented organization is not necessarily the direct employer.

## Resource Details

The following defines the core elements of the Practitioner resource.

```yaml
elements:
  - name: Practitioner
    description: A person who is directly or indirectly involved in the provisioning of healthcare.
    short: A person with a formal responsibility in the provisioning of healthcare or related services
    type: DomainResource

  - name: Practitioner.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: An identifier that applies to this person in this role.
    short: An identifier for the person as this agent
    comments: Often, specific identities are assigned for the agent.

  - name: Practitioner.active
    flags: [Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this practitioner's record is in active use.
    short: Whether this practitioner's record is in active use
    comments: If the practitioner is not in use by one organization, then it should mark the period on the PractitionerRole with an end date (even if they are active) as they may be active in another role.

  - name: Practitioner.name
    flags: [Σ]
    cardinality: 0..*
    type: HumanName
    description: The name(s) associated with the practitioner.
    short: The name(s) associated with the practitioner
    comments: The selection of the use property should ensure that there is a single usual name specified, and others use the nickname (alias), old, or other values as appropriate.

  - name: Practitioner.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the practitioner, e.g. a telephone number or an email address.
    short: A contact detail for the practitioner (that apply to all roles)
    comments: Practitioner may have multiple ways to be contacted with different uses or applicable periods.

  - name: Practitioner.address
    flags: [Σ]
    cardinality: 0..*
    type: Address
    description: Address(es) of the practitioner that are not role specific (typically home address). Work addresses are not typically entered in this property as they are usually role dependent.
    short: Address(es) of the practitioner that are not role specific (typically home address)
    comments: The PractitionerRole does not have an address value on it, as it is expected that the location property be used for this purpose.

  - name: Practitioner.gender
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the person is considered to have for administration and record keeping purposes.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender
      strength: required

  - name: Practitioner.birthDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: The date of birth for the practitioner.
    short: The date on which the practitioner was born

  - name: Practitioner.photo
    cardinality: 0..*
    type: Attachment
    description: Image of the person.
    short: Image of the person

  - name: Practitioner.qualification
    cardinality: 0..*
    type: BackboneElement
    description: The official certifications, training, and licenses that authorize or otherwise pertain to the provision of care by the practitioner. For example, a medical license issued by a medical board authorizing the practitioner to practice medicine within a certian locality.
    short: Certification, licenses, or training pertaining to the provision of care
    comments: The PractitionerRole.specialty defines the functional role. Those specialties may or might not require a qualification.

  - name: Practitioner.qualification.identifier
    cardinality: 0..*
    type: Identifier
    description: An identifier that applies to this person's qualification in this role.
    short: An identifier for this qualification for the practitioner

  - name: Practitioner.qualification.code
    cardinality: 1..1
    type: CodeableConcept
    description: Coded representation of the qualification.
    short: Coded representation of the qualification
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0360 # Example from v2 table 0360, Version 2.7
      strength: example

  - name: Practitioner.qualification.period
    cardinality: 0..1
    type: Period
    description: Period during which the qualification is valid.
    short: Period during which the qualification is valid

  - name: Practitioner.qualification.issuer
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization that regulates and issues the qualification.
    short: Organization that regulates and issues the qualification

  - name: Practitioner.communication
    cardinality: 0..*
    type: CodeableConcept
    description: A language the practitioner can use in patient communication.
    short: A language the practitioner can use in patient communication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/languages # Common Languages
      strength: preferred
    comments: If no language is specified, this implies that the default local language is spoken. For animals, language is not a relevant field.

constraints: [] # Practitioner R4 specification does not list formal constraints in this section.
```

## Search Parameters

Search parameters defined for the Practitioner resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Whether the practitioner record is active
    expression: Practitioner.active
  - name: address
    type: string
    description: A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
    expression: Practitioner.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: Practitioner.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: Practitioner.address.country
  - name: address-postalcode
    type: string
    description: A postalCode specified in an address
    expression: Practitioner.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: Practitioner.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: Practitioner.address.use
  - name: communication
    type: token
    description: One of the languages that the practitioner can communicate with
    expression: Practitioner.communication # Searches the CodeableConcept
  - name: email
    type: token
    description: A value in an email contact
    expression: Practitioner.telecom.where(system='email')
  - name: family
    type: string
    description: A portion of the family name
    expression: Practitioner.name.family
  - name: gender
    type: token
    description: Gender of the practitioner
    expression: Practitioner.gender
  - name: given
    type: string
    description: A portion of the given name
    expression: Practitioner.name.given
  - name: identifier
    type: token
    description: A practitioner's Identifier
    expression: Practitioner.identifier
  - name: name
    type: string
    description: A server defined search that may match any of the string fields in the HumanName, including family, give, prefix, suffix, suffix, and/or text
    expression: Practitioner.name
  - name: phone
    type: token
    description: A value in a phone contact
    expression: Practitioner.telecom.where(system='phone')
  - name: phonetic
    type: string
    description: A portion of either family or given name using some kind of phonetic matching algorithm
    expression: Practitioner.name
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: Practitioner.telecom
```