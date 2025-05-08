Okay, here is the FHIR Patient resource definition presented in the requested Markdown format with embedded YAML blocks, based on the R6 build HTML provided.

---

# FHIR Resource: Patient

```yaml
resource:
  name: Patient
  hl7_workgroup: Patient Administration
  maturity_level: N # Normative
  standard_status: Normative (from v4.0.0)
  security_category: Patient
  compartments:
    - Patient
    - Practitioner
    - RelatedPerson
```

Demographics and other administrative information about an individual or animal that is the subject of potential, past, current, or future health-related care, services, or processes.

## Background and Scope

The Patient resource covers data about individuals and animals across a wide range of health-related activities, including clinical care, social services, public health, research, and financial services (e.g., insurance subscriber). It focuses on the demographic and administrative information ("who") needed for various procedures.

Key points:

*   **Core Demographics:** Contains essential administrative data like identifiers, name, contact info, birth date, gender, address, marital status, etc.
*   **Multiple Records:** An individual receiving care at different organizations may have multiple Patient resources representing them.
*   **Extensibility:** Concepts like race, ethnicity, and organ donor status, which vary by jurisdiction, are typically handled via extensions or profiles rather than being in the core resource.
*   **Patient vs. Related Entities:**
    *   `Person`: Used to link different resource instances (Patient, Practitioner, RelatedPerson) representing the *same* individual across different roles or systems.
    *   `Patient.contact`: Stores contact details (name, relationship, telecom, address) for parties related to the patient (guardian, friend, etc.) directly within the Patient resource. Used when the contact doesn't need to be independently referenced.
    *   `RelatedPerson`: A separate resource representing individuals related to the patient, used when the related person needs to be referenced independently (e.g., in CarePlans, Appointments).
*   **Animal Patients:** The resource supports veterinary use cases via the standard `patient-animal` extension for species, breed, and gender status. The owner is typically represented using `RelatedPerson`.
*   **Linking & Merging:**
    *   `Patient.link`: Used *within* the Patient resource to connect duplicate or related Patient/RelatedPerson records representing the same individual. Uses types like `replaced-by`, `replaces`, `refer`, `seealso`.
    *   `$merge` Operation: A specific operation for formally merging duplicate Patient records.
    *   `Linkage` Resource: Generally *not* used for linking Patient records; `Patient.link` or `Person` are preferred for patient identity management.
*   **Gender and Sex:**
    *   `Patient.gender`: Represents administrative gender for record-keeping and matching.
    *   Specific aspects like gender identity, sex for clinical use (SPCU), sex assigned at birth, and clinical observations about sex characteristics are handled via standard extensions (like `genderIdentity`, `sexParameterForClinicalUse`) or the `Observation` resource, often following guidance like the Gender Harmony IG.

## Resource Details

The following defines the core elements and constraints of the Patient resource.

```yaml
elements:
  - name: Patient
    flags: [N] # Normative Resource
    description: Demographics and other administrative information about an individual or animal that is the subject of potential, past, current, or future health-related care, services, or processes.
    short: Information about an individual or animal receiving health care services
    type: DomainResource
    comments: The base resource definition.

  - name: Patient.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: An identifier for this patient.
    short: An identifier for this patient
    comments: Systems MAY use identifier for user identities (using the type='USER'). Refer to the Security and Privacy section for additional guidance. Should not contain the resource id.

  - name: Patient.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether this patient record is in active use. Many systems use this to mark non-current patients (e.g., unseen for some time) or records created in error. Deceased patients may also be marked inactive.
    short: Whether this patient's record is in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid
    comments: If a record is inactive and linked to an active record, future updates should occur on the linked active record. General assumption is active if missing.

  - name: Patient.name
    flags: [Σ]
    cardinality: 0..*
    type: HumanName
    description: A name associated with the individual.
    short: A name associated with the patient
    comments: A patient may have multiple names. For animals, name is assigned by humans; use given name, optionally family name.

  - name: Patient.telecom
    flags: [Σ]
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail (e.g. a telephone number or an email address) by which the individual may be contacted.
    short: A contact detail for the individual
    comments: May reach the patient indirectly (e.g., home phone, pet owner's phone). Do not use for user identities.

  - name: Patient.gender
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the patient is considered to have for administration and record keeping purposes. See the [Patient Gender and Sex section](patient.html#gender) for additional information.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender
      strength: required
    comments: May not match biological sex or gender identity. Specific aspects are handled by Observations or extensions.

  - name: Patient.birthDate
    flags: [Σ]
    cardinality: 0..1
    type: date
    description: The date of birth for the individual.
    short: The date of birth for the individual
    comments: Partial dates allowed. Use 'patient-birthTime' extension if time is needed.

  - name: Patient.deceased[x]
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean | dateTime
    description: Indicates the date when the individual died, or, if the date is not known or cannot be estimated, a flag indicating the patient is known to be deceased.
    short: Indicates if/when the individual is deceased
    isModifier: true
    modifierReason: This element is labeled as a modifier because once a patient is marked as deceased, the actions that are appropriate to perform on the patient may be significantly different.
    comments: Absence implies no statement about deceased status (often interpreted as alive).

  - name: Patient.address
    flags: [Σ]
    cardinality: 0..*
    type: Address
    description: An address for the individual.
    short: An address for the individual
    comments: Patient may have multiple addresses with different uses or applicable periods.

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
    type: boolean | integer
    description: Indicates whether the patient is part of a multiple (boolean) or indicates the actual birth order (integer). Count is relative to live births and fetal losses (see 'patient-multipleBirthTotal' extension). Boolean can track known multiple fetuses before birth.
    short: Whether patient is part of a multiple birth
    comments: Integer indicates birth number in sequence (e.g., 2 for middle triplet). Boolean true for all if order unknown. Integer only used after live birth.

  - name: Patient.photo
    cardinality: 0..*
    type: Attachment
    description: Image of the patient.
    short: Image of the patient
    comments: Guidelines suggest ID photos (not clinical), thumbnail size, low byte count.

  - name: Patient.contact
    flags: [C] # Has Constraints
    cardinality: 0..*
    type: BackboneElement
    description: A contact party (e.g. guardian, partner, friend) for the patient.
    short: A contact party (e.g. guardian, partner, friend) for the patient
    comments: Covers various contact types. Not for pedigree/family ties beyond contact info.

  - name: Patient.contact.relationship
    cardinality: 0..*
    type: CodeableConcept
    description: The nature of the personal relationship between the patient and the contact person.
    short: The kind of personal relationship
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v3-PersonalRelationshipRoleType
      strength: preferred
    comments: For personal relationships. Functional relationships use Patient.contact.role.

  - name: Patient.contact.role
    flags: [TU] # Trial Use
    cardinality: 0..*
    type: CodeableConcept
    description: The nature of the functional role between the patient and the contact person.
    short: The kind of functional role
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/relatedperson-relationshiptype
      strength: preferred
    comments: For functional relationships. Personal relationships use Patient.contact.relationship.

  - name: Patient.contact.name
    flags: [C] # Affected by constraints
    cardinality: 0..1
    type: HumanName
    description: A name associated with the contact person. Alternate/additional names for this contact can be found in the `additionalName` property.
    short: A name associated with the contact person

  - name: Patient.contact.additionalName
    flags: [TU] # Trial Use
    cardinality: 0..*
    type: HumanName
    description: Additional names for the contact person.
    short: Additional names for the contact person
    comments: Added for backward compatibility. Implementers should check both `name` and `additionalName` for a complete list.

  - name: Patient.contact.telecom
    flags: [C] # Affected by constraints
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the person, e.g. a telephone number or an email address.
    short: A contact detail for the person

  - name: Patient.contact.address
    flags: [C] # Affected by constraints
    cardinality: 0..1
    type: Address
    description: Address for the contact person. Alternate/additional addresses for this contact can be found in the `additionalAddress` property.
    short: Address for the contact person

  - name: Patient.contact.additionalAddress
    flags: [TU] # Trial Use
    cardinality: 0..*
    type: Address
    description: Additional addresses for the contact person.
    short: Additional addresses for the contact person
    comments: Added for backward compatibility. Implementers should check both `address` and `additionalAddress` for a complete list.

  - name: Patient.contact.gender
    cardinality: 0..1
    type: code
    description: Administrative Gender - the gender that the contact person is considered to have for administration and record keeping purposes.
    short: male | female | other | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/administrative-gender
      strength: required

  - name: Patient.contact.organization
    flags: [C] # Affected by constraints
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization on behalf of which the contact is acting or for which the contact is working.
    short: Organization that is associated with the contact

  - name: Patient.contact.period
    cardinality: 0..1
    type: Period
    description: The period during which this contact person or organization is valid to be contacted relating to this patient.
    short: The period during which this contact person or organization is valid

  - name: Patient.communication
    cardinality: 0..*
    type: BackboneElement
    description: A language which may be used to communicate with the patient about his or her health.
    short: A language which may be used to communicate with the patient
    comments: Absence implies default local language. Not relevant for animals.

  - name: Patient.communication.language
    cardinality: 1..1
    type: CodeableConcept
    description: The language which may be used to communicate with the individual.
    short: The language which can be used to communicate with the patient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/all-languages # BCP-47 codes
      strength: required
      additional:
        - purpose: starter
          valueSet: http://hl7.org/fhir/ValueSet/languages # Common languages

  - name: Patient.communication.preferred
    cardinality: 0..1
    type: boolean
    description: Indicates whether or not the patient prefers this language (over other languages he masters up a certain level).
    short: Language preference indicator
    comments: Indicates preference for healthcare communication.

  - name: Patient.generalPractitioner
    cardinality: 0..*
    type: Reference(Organization | Practitioner | PractitionerRole)
    description: Patient's nominated care provider.
    short: Patient's nominated primary care provider
    comments: May be GP, care manager, or organization. Not for Care Teams (use CareTeam resource). Multiple allowed (e.g., home and university GP).

  - name: Patient.managingOrganization
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization that is the custodian of the patient record.
    short: Organization that is the custodian of the patient record
    comments: Only one per record. Other orgs have separate records, potentially linked.

  - name: Patient.link
    flags: [?!, Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Link to a Patient or RelatedPerson resource that concerns the same actual individual.
    short: Link to another patient resource that concerns the same actual patient
    isModifier: true
    modifierReason: This element is labeled as a modifier because it might not be the main Patient resource, and the referenced patient should be used instead of this Patient record (when link.type is 'replaced-by').
    comments: Used for handling duplicates or distributed records. Links are not assumed to be bilateral.

  - name: Patient.link.other
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | RelatedPerson)
    description: Link to a Patient or RelatedPerson resource that concerns the same actual individual.
    short: The other patient or related person resource that the link refers to
    comments: Referencing RelatedPerson avoids needing a Person resource just for this link.

  - name: Patient.link.type
    flags: [Σ]
    cardinality: 1..1
    type: code
    description: The type of link between this patient resource and another patient resource.
    short: replaced-by | replaces | refer | seealso
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/link-type
      strength: required

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
  - name: death-date
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
    description: All patients/related persons linked to the given patient
    expression: Patient.link.other
    targets: [Patient, RelatedPerson]
  - name: name
    type: string
    description: A server defined search that may match any of the string fields in the HumanName, including family, given, prefix, suffix, and/or text
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
    expression: Patient.name # Note: Matching algorithm is server-specific
  - name: telecom
    type: token
    description: The value in any kind of telecom details of the patient
    expression: Patient.telecom
```