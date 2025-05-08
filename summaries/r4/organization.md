Okay, I will process the provided HTML for the FHIR R4 Organization resource and transform it into the requested Markdown format with embedded YAML blocks.

I will prioritize the R4 specification details from the first HTML block (`organization.html`) for structure, cardinality, types, flags, and bindings. I will use the second HTML block (`organization-definitions.html`, the "build" version) to enrich the textual descriptions (`short`, `description`, `comments`, `modifierReason`) for elements that are part of the R4 Organization resource, ensuring not to include elements exclusive to the build version.

---

# FHIR Resource: Organization

```yaml
resource:
  name: Organization
  hl7_workgroup: Patient Administration
  maturity_level: 3 # As per R4 specification
  standard_status: Trial Use
  security_category: Business
  compartments: [] # R4 Organization is not linked to any defined compartments
```

A formally or informally recognized grouping of people or organizations formed for the purpose of achieving some form of collective action. Includes companies, institutions, corporations, departments, community groups, healthcare practice groups, payer/insurer, etc.

## Background and Scope

The Organization resource can be used in a shared registry for contact and other information or as a supporting resource referenced by others (e.g., in documents, messages, or as contained resources).

Key aspects include:

*   **Purpose:** Represents collections of people/entities that have come together to achieve an objective. This is distinct from the `Group` resource, which identifies collections for analysis or acting upon, where the group itself is not expected to act.
*   **Hierarchy:** Organizations often form a hierarchy, represented using the `partOf` element to link a child organization to its parent. This conceptual structure is distinct from the `Location` resource, which defines the physical hierarchy.
*   **Relationship with Location:** The `Location` hierarchy is linked to the `Organization` hierarchy. Locations are always used for recording where a service occurs (and thus where encounters/observations are associated). The `Organization` referenced in such events might not be the same as the one tied to the physical location where the service took place.
*   **Contact Information:** The resource provides elements for generic, public contact points (`telecom`, `address` directly on Organization) and more specific `contact` entities for designated purposes (e.g., billing, patient inquiries).

### Example Organization Hierarchy

The `partOf` element allows for representing complex organizational structures. For example:

```
Burgers University Medical Center
    Eastern Services (prov)
        Emergency Dept
        Oncology Dept
            Nuclear Medicine Research Trials (edu)
        Maternity Ward
        Childrens Ward
        Day Procedures Unit
    Mobile Services (Ambulance)
    Research Center (edu)
        Nuclear Medicine  (edu)
    Burgers University (edu)
        Nuclear Medicine Faculty (edu)
        Undergraduate Medicine (edu)
        ...
```
*(Note: Physical locations corresponding to these organizational units would be defined using the `Location` resource.)*

## Notes

*   There are two places for contact information: one on `Organization` itself (`telecom`, `address`) and zero or more using the `contact` backbone element. The direct properties are for generic, public organization points of contact. The `contact` element is for reaching a person or party designated by the organization for a specific purpose.

## Resource Details

The following defines the core elements and constraints of the Organization resource.

```yaml
elements:
  - name: Organization
    description: A formally or informally recognized grouping of people or organizations formed for the purpose of achieving some form of collective action. Includes companies, institutions, corporations, departments, community groups, healthcare practice groups, payer/insurer, etc.
    short: A grouping of people or organizations with a common purpose
    type: DomainResource
    comments: The base resource definition.

  - name: Organization.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifier for the organization that is used to identify the organization across multiple disparate systems.
    short: Identifies this organization across multiple systems
    comments: This is a business identifier, not a resource identifier.

  - name: Organization.active
    flags: [?!, Σ]
    cardinality: 0..1
    type: boolean
    description: Whether the organization's record is still in active use.
    short: Whether the organization's record is still in active use
    isModifier: true
    modifierReason: This element is labeled as a modifier because it may be used to mark that the resource was created in error.
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
    flags: [Σ]
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

  - name: Organization.telecom
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail for the organization.
    short: A contact detail for the organization
    comments: The telecom of an organization can never be of use 'home'.

  - name: Organization.address
    cardinality: 0..*
    type: Address
    description: An address for the organization.
    short: An address for the organization
    comments: An address of an organization can never be of use 'home'.

  - name: Organization.partOf
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The organization of which this organization forms a part.
    short: The organization of which this organization forms a part

  - name: Organization.contact
    cardinality: 0..*
    type: BackboneElement
    description: Contact for the organization for a certain purpose.
    short: Contact for the organization for a certain purpose

  - name: Organization.contact.purpose
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates a purpose for which the contact can be reached.
    short: The type of contact
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/contactentity-type # R4 links to contactentity-type.html
      strength: extensible

  - name: Organization.contact.name
    cardinality: 0..1
    type: HumanName
    description: A name associated with the contact.
    short: A name associated with the contact

  - name: Organization.contact.telecom
    cardinality: 0..*
    type: ContactPoint
    description: A contact detail (e.g. a telephone number or an email address) by which the party may be contacted.
    short: Contact details (telephone, email, etc.) for a contact

  - name: Organization.contact.address
    cardinality: 0..1
    type: Address
    description: Visiting or postal addresses for the contact.
    short: Visiting or postal addresses for the contact

  - name: Organization.endpoint
    cardinality: 0..*
    type: Reference(Endpoint)
    description: Technical endpoints providing access to services operated for the organization.
    short: Technical endpoints providing access to services operated for the organization
    comments: |
      Note that an organization might have endpoints listed in any of the referenced directory resources, not just at the top Organization level (i.e. sub Organizations, Locations, HealthcareServices, PractitionerRoles).
      The Endpoint.managingOrganization property indicates the organization that is supporting/managing the technical endpoint.

constraints:
  - key: org-1
    severity: Rule
    location: (base)
    description: The organization SHALL at least have a name or an identifier, and possibly more than one
    expression: (identifier.count() + name.count()) > 0
  - key: org-2
    severity: Rule
    location: Organization.address
    description: An address of an organization can never be of use 'home'
    expression: where(use = 'home').empty()
  - key: org-3
    severity: Rule
    location: Organization.telecom
    description: The telecom of an organization can never be of use 'home'
    expression: where(use = 'home').empty()

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
    expression: Organization.address
  - name: address-city
    type: string
    description: A city specified in an address
    expression: Organization.address.city
  - name: address-country
    type: string
    description: A country specified in an address
    expression: Organization.address.country
  - name: address-postalcode
    type: string
    description: A postal code specified in an address
    expression: Organization.address.postalCode
  - name: address-state
    type: string
    description: A state specified in an address
    expression: Organization.address.state
  - name: address-use
    type: token
    description: A use code specified in an address
    expression: Organization.address.use
  - name: endpoint
    type: reference
    description: Technical endpoints providing access to services operated for the organization
    expression: Organization.endpoint
    targets: [Endpoint]
  - name: identifier
    type: token
    description: Any identifier for the organization (not the accreditation issuer's identifier)
    expression: Organization.identifier
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
    expression: Organization.name # Note: phonetic typically applies to name, R4 spec just states Organization.name
  - name: type
    type: token
    description: A code for the type of organization
    expression: Organization.type
```