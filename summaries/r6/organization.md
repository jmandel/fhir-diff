---

# FHIR Resource: Organization

```yaml
resource:
  name: Organization
  hl7_workgroup: Patient Administration
  maturity_level: 5
  standard_status: Trial Use
  security_category: Business
  compartments: [] # "No defined compartments"
```

A formally or informally recognized grouping of people or organizations formed for the purpose of achieving some form of collective action.

## Background and Scope

The Organization resource can be used in a shared registry for contact and other information about various organizations, or as a supporting resource referenced by others (e.g., in documents, messages, or as a contained resource). It is suitable for representing diverse entities like companies, institutions, corporations, departments, community groups, healthcare practice groups, and payers/insurers. Multiple registries for different types or levels of organizations can exist.

Key aspects include:

*   **Distinction from Group:** `Organization` represents collections of people acting collectively towards an objective, whereas `Group` is for collections (of people, animals, devices, etc.) gathered for analysis or action *upon* them, not for the collection to act itself.
*   **Service Provision Context:** `Organization` provides services, `HealthcareService` describes these services, and `Location` specifies where services are available.
*   **Hierarchy:** Organizations often form a hierarchy using the `partOf` element to link child organizations to their parent. This represents conceptual structure, while `Location` hierarchies represent physical structure. Locations link to appropriate levels in the Organization hierarchy.
*   **Complex Affiliations:** `OrganizationAffiliation` details more complex, non-hierarchical relationships between organizations (e.g., separate legal entities in a network) that go beyond simple `partOf` structures.
*   **Event Context:** In the context of an event, `Location` indicates where a service occurs, and `Organization` can represent who performed it.

## Resource Details

The following defines the core elements and constraints of the Organization resource.

```yaml
elements:
  - name: Organization
    description: A formally or informally recognized grouping of people or organizations formed for the purpose of achieving some form of collective action.
    short: A grouping of people or organizations with a common purpose
    type: DomainResource
    comments: The base resource definition.

  - name: Organization.identifier
    flags: [Σ, C]
    cardinality: 0..*
    type: Identifier
    description: Identifier for the organization that is used to identify the organization across multiple disparate systems.
    short: Identifies this organization across multiple systems

  - name: Organization.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether the organization's record is still in active use.
    short: Whether the organization's record is still in active use
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that can indicate that a record should not be treated as valid
    comments: |
      This active flag is not intended to be used to mark an organization as temporarily closed or under construction. Instead the Location(s) within the Organization should have the suspended status. If further details of the reason for the suspension are required, then an extension on this element should be used.
      This element is labeled as a modifier because it may be used to mark that the resource was created in error.

  - name: Organization.type
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: The kind(s) of organization that this is.
    short: Kind of organization
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/organization-type
      strength: example
    comments: |
      Organizations can be corporations, wards, sections, clinical teams, government departments, etc. Note that code is generally a classifier of the type of organization; in many applications, codes are used to identity a particular organization (say, ward) as opposed to another of the same type - these are identifiers, not codes.
      When considering if multiple types are appropriate, you should evaluate if child organizations would be a more appropriate use of the concept, as different types likely are in different sub-areas of the organization. This is most likely to be used where type values have orthogonal values, such as a religious, academic and medical center.
      We expect that some jurisdictions will profile this optionality to be a single cardinality.

  - name: Organization.name
    flags: [Σ, C]
    cardinality: 0..1
    type: string
    description: A name associated with the organization.
    short: Name used for the organization
    comments: If the name of an organization changes, consider putting the old name in the alias column so that it can still be located through searches.

  - name: Organization.alias
    cardinality: 0..*
    type: string
    description: A list of alternate names that the organization is known as, or was known as in the past.
    short: A list of alternate names that the organization is known as, or was known as in the past
    comments: There are no dates associated with the alias/historic names, as this is not intended to track when names were used, but to assist in searching so that older names can still result in identifying the organization.

  - name: Organization.description
    flags: [Σ]
    cardinality: 0..1
    type: markdown
    description: Description of the organization, which helps provide additional general context on the organization to ensure that the correct organization is selected.
    short: Additional details about the Organization that could be displayed as further information to identify the Organization beyond its name

  - name: Organization.contact
    flags: [C]
    cardinality: 0..*
    type: ExtendedContactDetail
    description: The contact details of communication devices available relevant to the specific Organization. This can include addresses, phone numbers, fax numbers, mobile numbers, email addresses and web sites.
    short: Official contact details for the Organization
    comments: |
      The address/telecom use code 'home' are not to be used. Note that these contacts are not the contact details of people who provide the service (that would be through PractitionerRole), these are official contacts for the Organization itself for specific purposes. E.g. Mailing Addresses, Billing Addresses, Contact numbers for Booking or Billing Enquiries, general web address, web address for online bookings etc.

  - name: Organization.partOf
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization of which this organization forms a part.
    short: The organization of which this organization forms a part

  - name: Organization.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the organization.
    short: Technical endpoints providing access to services operated for the organization
    comments: |
      Note that an organization might have endpoints listed in any of the referenced directory resources, not just at the top Organization level (i.e. sub Organizations, Locations, HealthcareServices, PractitionerRoles).
      The Endpoint.managingOrganization property indicates the organization that is supporting/managing the technical endpoint.

  - name: Organization.qualification
    cardinality: 0..*
    type: BackboneElement
    description: The official certifications, accreditations, training, designations and licenses that authorize and/or otherwise endorse the provision of care by the organization. For example, an approval to provide a type of services issued by a certifying body (such as the US Joint Commission) to an organization.
    short: Qualifications, certifications, accreditations, licenses, training, etc. pertaining to the provision of care

  - name: Organization.qualification.identifier
    cardinality: 0..*
    type: Identifier
    description: An identifier allocated to this qualification for this organization.
    short: An identifier for this qualification for the organization

  - name: Organization.qualification.code
    cardinality: 1..1
    type: CodeableConcept
    description: Coded representation of the qualification.
    short: Coded representation of the qualification
    binding:
      valueSet: Qualification # Name of the example valueset, as no specific URL is provided in the source for this example binding.
      strength: example

  - name: Organization.qualification.status
    cardinality: 0..1
    type: CodeableConcept
    description: Qualifications often take time to attain and might be tracked during this time, and completed qualifications might not always be valid. This status concept has some overlap with period and both should be considered together. Refer to the descriptions of the codes for how the period should be interpreted. If a qualification is revoked or otherwise cancelled, then the period is likely to be ignored, and might be related to when it was active.
    short: Status/progress of the qualification
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/qualification-status
      strength: preferred

  - name: Organization.qualification.period
    cardinality: 0..1
    type: Period
    description: Period during which the qualification is valid.
    short: Period during which the qualification is valid

  - name: Organization.qualification.issuer
    cardinality: 0..1
    type: Reference(Organization)
    description: Organization that regulates and issues the qualification.
    short: Organization that regulates and issues the qualification
```

```yaml
constraints:
  - key: org-1
    severity: Rule
    location: Organization
    description: The organization SHALL at least have a name or an identifier, and possibly more than one
    expression: (identifier.count() + name.count()) > 0
  - key: org-3
    severity: Rule
    location: Organization.contact
    description: The telecom of an organization can never be of use 'home'
    expression: telecom.where(use = 'home').empty()
  - key: org-4
    severity: Rule
    location: Organization.contact
    description: The address of an organization can never be of use 'home'
    expression: address.where(use = 'home').empty()
```

## Search Parameters

Search parameters defined for the Organization resource:

```yaml
searchParameters:
  - name: active
    type: token
    description: Is the Organization record active
    expression: Organization.active
  - name: address
    type: string
    description: A server defined search that may match any of the string fields in the Address, including line, city, district, state, country, postalCode, and/or text
    expression: Organization.contact.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: Organization.contact.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: Organization.contact.address.country
  - name: address-postalcode
    type: string
    description: A postal code specified in an address
    expression: Organization.contact.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: Organization.contact.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: Organization.contact.address.use
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the organization
    expression: Organization.endpoint
    targets: [Endpoint]
  - name: identifier
    type: token
    description: Any identifier for the organization (not the accreditation issuer's identifier)
    expression: Organization.identifier | Organization.qualification.identifier
  - name: name
    type: string
    description: A portion of the organization's name or alias
    expression: Organization.name | Organization.alias
  - name: partof
    type: reference
    description: An organization of which this organization forms a part
    expression: Organization.partOf
    targets: [Organization]
  - name: phonetic
    type: string
    description: A portion of the organization's name using some kind of phonetic matching algorithm
    expression: Organization.name
  - name: type
    type: token
    description: A code for the type of organization
    expression: Organization.type
```