Okay, here is the FHIR R4 Patient resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Patient

```yaml
resource:
  name: Patient
  hl7_workgroup: Patient Administration
  maturity_level: Normative # Mapped from 'N' in source
  standard_status: Normative # From v4.0.0
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
    - RelatedPerson
```

Demographics and other administrative information about an individual or animal receiving care or other health-related services.

## Background and Scope

The Patient resource covers demographic and administrative details for individuals (patients) and animals involved in health-related activities, including curative care, psychiatric care, social services, pregnancy care, nursing, dietary services, and personal health tracking.

Key aspects include:

*   **Purpose:** Focuses on the "who" – demographic information supporting administrative, financial, and logistic procedures.
*   **Decentralized Records:** A patient receiving care at multiple organizations typically has separate Patient resources maintained by each organization.
*   **Extensibility:** Core resource includes common demographics. Jurisdiction-specific elements like race, ethnicity, nationality, or organ donor status are handled via profiles and extensions due to variations in definitions and value sets globally.
*   **Identifiers:** The resource `id` is immutable. Clinically relevant identifiers like Medical Record Numbers (MRNs) should be stored in the `identifier` element, as they might change (e.g., due to record merges).
*   **Linking Records:**
    *   `Patient.link`: Used specifically within the Patient resource to link records referring to the *same actual patient*. This handles duplicates (`replaced-by`, `replaces`), references in patient indices (`refer`), and distributed records (`seealso`).
    *   `Person` Resource: Links different resource types (Patient, Practitioner, RelatedPerson, Person) believed to represent the same individual, often used in non-healthcare specific registries or for cross-resource type linkage.
    *   `Linkage` Resource: Provides a more general mechanism for asserting links between any resources, but `Patient.link` is preferred within the Patient resource itself for ensuring linked records are considered during clinical workflows.
*   **Contacts vs. RelatedPerson:**
    *   `Patient.contact`: Stores details of contact parties (guardian, partner, friend) directly within the Patient resource. This information travels *with* the patient record but cannot be referenced directly by other resources.
    *   `RelatedPerson` Resource: Used when a related individual needs to be referenced by other resources (e.g., CarePlan, Encounter participant).
*   **Gender and Sex:**
    *   `Patient.gender`: Represents *administrative gender* for record-keeping and matching.
    *   Other aspects (Clinical Sex, Gender Identity, Sex Assigned at Birth, Legal Sex) are typically represented using `Observation` resources or specific extensions (like `genderIdentity`).
*   **Veterinary Care:** Supported via the standard `patient-animal` extension for species, breed, and gender status. The owner/client is represented using `RelatedPerson`.
*   **Mother/Newborn:** Family relationships use `RelatedPerson`. Linking encounters during maternity uses `Encounter.partOf`. Clinical relevance uses `FamilyMemberHistory`.

## Resource Details

The following defines the core elements and constraints of the Patient resource.

```yaml
elements:
  - name: Patient
    description: Demographics and other administrative information about an individual or animal that is the subject of potential, past, current, or future health-related care, services, or processes.
    short: Information about an individual or animal receiving health care services
    type: DomainResource
    comments: The base resource definition.

  - name: Patient.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: An identifier for this patient. Systems MAY use identifier for user identities (using the type='USER'). Refer to the Security and Privacy section for additional guidance on representing user identities.
    short: An identifier for this patient
    comments: This is a business identifier, not a resource identifier.

  - name: Patient.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this patient record is in active use. Many systems use this property to mark as non-current patients, such as those that have not been seen for a period of time based on an organization's business rules. It is often used to filter patient lists to exclude inactive patients. Deceased patients may also be marked as inactive for the same reasons, but may be active for some time after death.
    short: Whether this patient's record is in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid
    comments: If a record is inactive, and linked to an active record, then future patient/record updates should occur on the other patient. If missing, the resource is assumed to be active.

  - name: Patient.name
    flags: [Σ]
    cardinality: 0..*
    type: HumanName
    description: A name associated with the individual. A patient may have multiple names with different uses or applicable periods. For animals, the name is a "HumanName" in the sense that is assigned and used by humans and has the same patterns. Animal names may be communicated as given names, and optionally may include a family name.
    short: A name associated with the patient

  - name: Patient.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail (e.g. a telephone number or an email address) by which the individual may be contacted. A Patient may have multiple ways to be contacted with different uses or applicable periods. May need to have options for contacting the person urgently and also to help with identification. The address might not go directly to the individual, but may reach another party that is able to proxy for the patient (i.e. home phone, or pet owner's phone). DO NOT use .telecom properties to represent user identities.
    short: A contact detail for the individual

  - name: Patient.gender
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes. See the Patient Gender and Sex section for additional information.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1
      strength: required
    comments: The gender might not match biological sex. Systems providing decision support should ideally use specific Observations but often default to administrative gender; rule enforcement should allow for variation (e.g., hysterectomy on male as warning, not hard error).

  - name: Patient.birthDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: The date of birth for the individual. Partial dates are allowed. Use the standard "patient-birthTime" extension where time is required (e.g., maternity).
    short: The date of birth for the individual

  - name: Patient.deceased[x]
    flags: [?!, Σ]
    cardinality: 0..1
    # Type is boolean OR dateTime
    type: boolean | dateTime
    description: Indicates the date when the individual died, or, if the date is not known or cannot be estimated, a flag indicating the patient is known to be deceased. If there's no value, it means there is no statement on whether the individual is deceased (most systems interpret absence as alive).
    short: Indicates if/when the individual is deceased
    isModifier: true
    modifierReason: Once a patient is marked as deceased, the actions appropriate to perform on the patient may be significantly different.

  - name: Patient.address
    flags: [Σ]
    cardinality: 0..*
    type: Address
    description: An address for the individual. Patient may have multiple addresses with different uses or applicable periods.
    short: An address for the individual

  - name: Patient.maritalStatus
    cardinality: 0..1
    type: CodeableConcept
    description: This field contains a patient's most recent marital (civil) status.
    short: Marital (civil) status of a patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/marital-status
      strength: extensible

  - name: Patient.multipleBirth[x]
    cardinality: 0..1
    # Type is boolean OR integer
    type: boolean | integer
    description: Indicates whether the patient is part of a multiple (boolean) or indicates the actual birth order (integer). The boolean can track multiple fetuses pre-birth. The integer (birth number in sequence, e.g., 2 for middle triplet) should only be used after live birth.
    short: Whether patient is part of a multiple birth

  - name: Patient.photo
    cardinality: 0..*
    type: Attachment
    description: Image of the patient. Guidelines suggest using ID photos (not clinical), thumbnail dimensions, and low byte count.
    short: Image of the patient

  - name: Patient.contact
    flags: [I] # Constraint pat-1 applies here
    cardinality: 0..*
    type: BackboneElement
    description: A contact party (e.g. guardian, partner, friend) for the patient. Covers family members, business contacts, guardians, caregivers. Not for pedigree/family ties beyond contact purposes.
    short: A contact party (e.g. guardian, partner, friend) for the patient

  - name: Patient.contact.relationship
    cardinality: 0..*
    type: CodeableConcept
    description: The nature of the personal relationship between the patient and the contact person.
    short: The kind of personal relationship
    binding:
      # Note: R4 definition page links to v2-0131, but R4 uses patient-contactrelationship. Using the R4 value set.
      valueSet: http://hl7.org/fhir/ValueSet/patient-contactrelationship
      strength: extensible
    comments: This property is for personal relationships. Functional relationships would be represented in `Patient.contact.role`.

  # Note: Patient.contact.role does not exist in R4 base spec, it seems to be from R5 or a profile. Sticking to R4 base.

  - name: Patient.contact.name
    cardinality: 0..1
    type: HumanName
    description: A name associated with the contact person. Where multiple names are required (e.g., legal, usual), also refer to the R5 `additionalName` property (not in R4 base).
    short: A name associated with the contact person

  # Note: Patient.contact.additionalName does not exist in R4 base spec.

  - name: Patient.contact.telecom
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the person, e.g. a telephone number or an email address. May have multiple telecom details with different uses/periods.
    short: A contact detail for the person

  - name: Patient.contact.address
    cardinality: 0..1
    type: Address
    description: Address for the contact person. Where multiple addresses are required, refer to the R5 `additionalAddress` property (not in R4 base).
    short: Address for the contact person

  # Note: Patient.contact.additionalAddress does not exist in R4 base spec.

  - name: Patient.contact.gender
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the contact person is considered to have for administration and record keeping purposes.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender|4.0.1
      strength: required

  - name: Patient.contact.organization
    flags: [I] # Affected by constraint pat-1
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization on behalf of which the contact is acting or for which the contact is working. Relevant for guardians or business contacts.
    short: Organization that is associated with the contact

  - name: Patient.contact.period
    cardinality: 0..1
    type: Period
    description: The period during which this contact person or organization is valid to be contacted relating to this patient.
    short: The period during which this contact person or organization is valid

  - name: Patient.communication
    cardinality: 0..*
    type: BackboneElement
    description: A language which may be used to communicate with the patient about his or her health. If absent, implies default local language. For animals, should be absent. Use multiple entries for multiple modes/languages.
    short: A language which may be used to communicate with the patient

  - name: Patient.communication.language
    cardinality: 1..1
    type: CodeableConcept
    description: The language which may be used to communicate with the individual. Commonly represented using ISO 639-1 (e.g., "en", "en-US").
    short: The language which can be used to communicate with the patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/all-languages # Required binding
      strength: required
      additional: # Preferred binding
        - valueSet: http://hl7.org/fhir/ValueSet/languages
          strength: preferred
          purpose: starter

  - name: Patient.communication.preferred
    cardinality: 0..1
    type: boolean
    description: Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).
    short: Language preference indicator
    comments: This language is specifically identified for communicating healthcare information.

  - name: Patient.generalPractitioner
    cardinality: 0..*
    type: Reference(Organization | Practitioner | PractitionerRole)
    description: Patient's nominated care provider. May be GP, care manager, or organization. Multiple allowed (e.g., home and university GP). Not for Care Teams (use CareTeam resource).
    short: Patient's nominated primary care provider

  - name: Patient.managingOrganization
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization that is the custodian of the patient record. Only one managing organization per record; others link via Patient.link or Person resource.
    short: Organization that is the custodian of the patient record

  - name: Patient.link
    flags: [?!, Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Link to a Patient or RelatedPerson resource that concerns the same actual individual. Used for duplicates, distributed records, or linking Patient/RelatedPerson. No assumption of mutual links.
    short: Link to another patient resource that concerns the same actual person
    isModifier: true
    modifierReason: If link.type is 'replaced-by', this record is superseded by the linked record.

  - name: Patient.link.other
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | RelatedPerson)
    description: Link to a Patient or RelatedPerson resource that concerns the same actual individual. Referencing RelatedPerson removes need for Person resource to link them.
    short: The other patient or related person resource that the link refers to

  - name: Patient.link.type
    flags: [Σ]
    cardinality: 1..1
    type: code
    description: The type of link between this patient resource and another patient resource.
    short: replaced-by | replaces | refer | seealso
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/link-type|4.0.1
      strength: required

```

## Constraints

```yaml
constraints:
  - key: pat-1
    severity: Rule
    location: Patient.contact
    description: SHALL at least contain a contact's details or a reference to an organization
    expression: name.exists() or telecom.exists() or address.exists() or organization.exists()
```

## Search Parameters

Search parameters defined for the Patient resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Whether the patient record is active
    expression: Patient.active
  - name: address
    type: string
    description: A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
    expression: Patient.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: Patient.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: Patient.address.country
  - name: address-postalcode
    type: string
    description: A postalCode specified in an address
    expression: Patient.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: Patient.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: Patient.address.use
  - name: birthdate
    type: date
    description: The patient's date of birth
    expression: Patient.birthDate
  - name: death-date # Note: Renamed from 'deathdate' in R4B/R5 to match R4 source table
    type: date
    description: The date of death has been provided and satisfies this search value
    expression: (Patient.deceased as dateTime)
  - name: deceased
    type: token
    description: This patient has been marked as deceased, or has a death date entered
    expression: Patient.deceased.exists() and Patient.deceased != false
  - name: email
    type: token
    description: A value in an email contact
    expression: Patient.telecom.where(system='email')
  - name: family
    type: string
    description: A portion of the family name of the patient
    expression: Patient.name.family
  - name: gender
    type: token
    description: Gender of the patient
    expression: Patient.gender
  - name: general-practitioner
    type: reference
    description: Patient's nominated general practitioner, not the organization that manages the record
    expression: Patient.generalPractitioner
    targets: [Organization, Practitioner, PractitionerRole]
  - name: given
    type: string
    description: A portion of the given name of the patient
    expression: Patient.name.given
  - name: identifier
    type: token
    description: A patient identifier
    expression: Patient.identifier
  - name: language
    type: token
    description: Language code (irrespective of use value)
    expression: Patient.communication.language
  - name: link
    type: reference
    description: All patients linked to the given patient
    expression: Patient.link.other
    targets: [Patient, RelatedPerson]
  - name: name
    type: string
    description: A server defined search that may match any of the string fields in the HumanName, including family, give, prefix, suffix, and/or text
    expression: Patient.name
  - name: organization
    type: reference
    description: The organization that is the custodian of the patient record
    expression: Patient.managingOrganization
    targets: [Organization]
  - name: phone
    type: token
    description: A value in a phone contact
    expression: Patient.telecom.where(system='phone')
  - name: phonetic
    type: string
    description: A portion of either family or given name using some kind of phonetic matching algorithm
    expression: Patient.name # Note: expression points to name, but implies phonetic processing by server
  - name: telecom
    type: token
    description: The value in any kind of telecom details of the patient
    expression: Patient.telecom

```