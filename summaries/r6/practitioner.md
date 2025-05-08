Here's the Practitioner resource definition in the requested Markdown and YAML format:

---

# FHIR Resource: Practitioner

```yaml
resource:
  name: Practitioner
  hl7_workgroup: Patient Administration
  maturity_level: 5
  standard_status: Trial Use
  security_category: Individual
  compartments:
    - Practitioner
```

A person who is directly or indirectly involved in the provisioning of healthcare or related services.

## Background and Scope

**Scope and Usage:**
Practitioner covers individuals engaged in healthcare and related services as part of their formal responsibilities. This includes a wide range of roles from physicians, dentists, and pharmacists to nurses, IT personnel, and even service animals (e.g., a ward-assigned dog capable of detecting cancer). The resource is used for attributing activities and responsibilities to these individuals. It is differentiated from `RelatedPerson`, which is used for individuals involved in care who typically have a personal relationship or a non-healthcare-specific professional relationship to the patient, rather than formal responsibilities within a healthcare organization.

**Boundaries and Relationships:**
The Practitioner resource should NOT be used for persons involved without a formal responsibility, such as friends or relatives caring for a patient; these are typically registered as a Patient's `Contact` or, if performing an action, as a `RelatedPerson`. The primary distinction is whether the person/animal operates on behalf of the care delivery organization across multiple patients (Practitioner) or is associated with a specific patient without formal organizational ties (RelatedPerson). An extension, `animalSpecies`, can denote the species of a service animal. The `PractitionerRole` resource details the roles a practitioner is approved for within specific organizations, locations, and services. Practitioners are often part of `CareTeams`, which define their specific role within that team. Autonomous systems or machines (including AI/ML) are represented by the `Device` resource.

**Background and Context:**
A Practitioner may perform different roles within the same or different organizations. Depending on jurisdiction and custom, it may be necessary to maintain a specific Practitioner resource for each role or have a single Practitioner with multiple roles. These roles can be time-limited. The organization a practitioner is associated with in a role context need not be their direct employer.

## Resource Details

The following defines the core elements of the Practitioner resource.

```yaml
elements:
  - name: Practitioner
    description: A person who is directly or indirectly involved in the provisioning of healthcare or related services.
    short: A person with a formal responsibility in the provisioning of healthcare or related services
    type: DomainResource

  - name: Practitioner.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: An identifier that applies to this person in this role.
    short: An identifier for the person as this agent
    comments: Note This is a business identifier, not a resource identifier.

  - name: Practitioner.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this practitioner's record is in active use.
    short: Whether this practitioner's record is in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid
    comments: If the practitioner is not in use by one organization, then it should mark the period on the PractitonerRole with an end date (even if they are active) as they may be active in another role. Meaning if Missing This resource is generally assumed to be active if no value is provided for the active element.

  - name: Practitioner.name
    flags: [Σ]
    cardinality: 0..*
    type: HumanName
    description: The name(s) associated with the practitioner.
    short: The name(s) associated with the practitioner
    comments: The selection of the use property should ensure that there is a single usual name specified, and others use the nickname (alias), old, or other values as appropriate. In general, select the value to be used in the ResourceReference.display based on this 1. There is more than 1 name 2. Use = usual 3. Period is current to the date of the usage 4. Use = official 5. Other order as decided by internal business rules.

  - name: Practitioner.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the practitioner, e.g. a telephone number or an email address.
    short: A contact detail for the practitioner (that apply to all roles)
    comments: Practitioner may have multiple ways to be contacted with different uses or applicable periods. May need to have options for contacting the person urgently and also to help with identification. DO NOT use .telecom properties to represent user identities. Refer to the Security and Privacy section for additional guidance on representing user identities.

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

  - name: Practitioner.deceased[x]
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean | dateTime
    description: Indicates if the practitioner is deceased or not.
    short: Indicates if the practitioner is deceased or not
    isModifier: true
    modifierReason: This element is labeled as a modifier because once a practitioner is marked as deceased, the record should only be used/retained for historical purposes.
    comments: If there's no value in the instance, it means there is no statement on whether or not the practitioner is deceased. Most systems will interpret the absence of a value as a sign of the person being alive.

  - name: Practitioner.address
    flags: [Σ]
    cardinality: 0..*
    type: Address
    description: Address(es) of the practitioner that are not role specific (typically home address). Work addresses are not typically entered in this property as they are usually role dependent.
    short: Address(es) of the practitioner that are not role specific (typically home address)
    comments: The PractitionerRole does not have an address value on it, as it is expected that the location property be used for this purpose (which has an address).

  - name: Practitioner.photo
    cardinality: 0..*
    type: Attachment
    description: Image of the person.
    short: Image of the person

  - name: Practitioner.qualification
    cardinality: 0..*
    type: BackboneElement
    description: The official qualifications, certifications, accreditations, training, licenses (and other types of educations/skills/capabilities) that authorize or otherwise pertain to the provision of care by the practitioner. For example, a medical license issued by a medical board of licensure authorizing the practitioner to practice medicine within a certain locality.
    short: Qualifications, certifications, accreditations, licenses, training, etc. pertaining to the provision of care
    comments: The PractitionerRole.specialty defines the functional role that they are practicing at a given organization or location. Those specialties may or might not require a qualification, and are not defined on the practitioner.

  - name: Practitioner.qualification.identifier
    cardinality: 0..*
    type: Identifier
    description: An identifier that applies to this person's qualification.
    short: An identifier for this qualification for the practitioner
    comments: Note This is a business identifier, not a resource identifier. Systems MAY use identifier for user identities (using the type='USER'). Refer to the Security and Privacy section for additional guidance on representing user identities.

  - name: Practitioner.qualification.code
    cardinality: 1..1
    type: CodeableConcept
    description: Coded representation of the qualification.
    short: Coded representation of the qualification
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0360
      strength: example

  - name: Practitioner.qualification.status
    cardinality: 0..1
    type: CodeableConcept
    description: Qualifications often take time to attain and might be tracked during this time, and completed qualifications might not always be valid. This status concept has some overlap with period and both should be considered together. Refer to the descriptions of the codes for how the period should be interpreted. If a qualification is revoked or otherwise cancelled, then the period is likely to be ignored, and m be related to when it was active.
    short: Status/progress of the qualification
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/qualification-status
      strength: preferred

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
    type: BackboneElement
    description: A language which may be used to communicate with the practitioner, often for correspondence/administrative purposes. The `PractitionerRole.communication` property should be used for publishing the languages that a practitioner is able to communicate with patients (on a per Organization/Role basis).
    short: A language which may be used to communicate with the practitioner
    comments: If no language is specified, this *implies* that the default local language is spoken. If you need to convey proficiency for multiple modes, then you need multiple Practitioner.Communication associations, using the `patient-proficiency` extension. For animals, language is not a relevant field, and should be absent from the instance.

  - name: Practitioner.communication.language
    cardinality: 1..1
    type: CodeableConcept
    description: The language which may be used to communicate with the individual. The language is commonly represented using the ISO-639-1 alpha code in lower case for the language, optionally followed by a hyphen and the ISO-3166-1 alpha code for the region in upper case. e.g. "en" for English, "en-US" for American English. Additional Bindings for this element include Common Languages (starter).
    short: The language code used to communicate with the practitioner
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/all-languages
      strength: required
    comments: Not all systems actually code this but instead have it as free text. Hence CodeableConcept instead of code as the data type.

  - name: Practitioner.communication.preferred
    cardinality: 0..1
    type: boolean
    description: Indicates whether or not the person prefers this language (over other languages he masters up a certain level).
    short: Language preference indicator
    comments: This language is specifically identified for communicating directly with the practitioner (typically un-related to patient communications).

constraints: [] # No formal constraints table found in the provided HTML for Practitioner
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
    description: A language to communicate with the practitioner
    expression: Practitioner.communication.language
  - name: death-date
    type: date
    description: The date of death has been provided and satisfies this search value
    expression: (Practitioner.deceased.ofType(dateTime))
  - name: deceased
    type: token
    description: This Practitioner has been marked as deceased, or has a death date entered
    expression: Practitioner.deceased.exists() and Practitioner.deceased != false
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
    expression: Practitioner.identifier | Practitioner.qualification.identifier
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
  - name: qual-code-period # Context for component expressions is Practitioner.qualification
    type: composite
    description: The practitioner has a qualification during a specific period
    components:
      - definition: qualification-code
        expression: code
      - definition: qualification-period
        expression: period
  - name: qualification-code
    type: token
    description: The type of qualification
    expression: Practitioner.qualification.code
  - name: qualification-period
    type: date
    description: The date(s) a qualification is valid for
    expression: Practitioner.qualification.period
  - name: telecom
    type: token
    description: The value in any kind of contact
    expression: Practitioner.telecom
```