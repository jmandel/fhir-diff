Okay, here is the DocumentReference resource definition presented in the requested Markdown format with embedded YAML, based on the provided FHIR R4 HTML content.

---

# FHIR Resource: DocumentReference

```yaml
resource:
  name: DocumentReference
  hl7_workgroup: Structured Documents # As per R4 page link
  maturity_level: 3 # As per R4 page table
  standard_status: Trial Use # As per R4 page table
  security_category: Not Classified # As per R4 page table
  compartments:
    - Device
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

A reference to a document of any kind for any purpose. Provides metadata about the document so that the document can be discovered and managed. The scope of a document is any serialized object with a mime-type, so includes formal patient-centric documents (CDA), clinical notes, scanned paper, and non-patient specific documents like policy text.

## Background and Scope

A DocumentReference resource indexes various documents (e.g., CDA, FHIR documents, PDFs, scanned paper, images, clinical notes) to make them accessible within a healthcare system. It provides metadata for discovery and management, while the actual content might be stored elsewhere (e.g., using the Binary resource, via URL, or retrieved via services like XDS).

Key points:

*   **Broad Definition:** Covers any serialized object with a mime-type that establishes its own context and has defined update management.
*   **Indexing Focus:** Primarily used in document indexing systems (like IHE XDS).
*   **Metadata vs. Content:** Contains metadata *about* the document. The actual document content is referenced via the `content.attachment` element (which can hold the data directly or a URL).
*   **Provenance:** Distinguishes between the provenance of the *DocumentReference resource* itself (in `meta`) and the provenance of the *document it references* (described by elements like `author`, `authenticator`, `custodian`, `date`).
*   **Document Status:** `status` refers to the lifecycle of the DocumentReference resource (e.g., `current`, `superseded`), while `docStatus` reflects the status of the underlying document content (e.g., `preliminary`, `final`, `amended`).
*   **Relationships:** The `relatesTo` element captures relationships like replacement, transformation, signing, or appending between documents. Clients should check these relationships when accessing documents.
*   **Generation Operation:** A specific operation (`_query=generate`) can be used to ask a server to create a DocumentReference based on an existing document URI.

## Resource Details

The following defines the core elements and constraints of the DocumentReference resource.

```yaml
elements:
  - name: DocumentReference
    description: A reference to a document of any kind for any purpose. Provides metadata about the document so that the document can be discovered and managed. The scope of a document is any seralized object with a mime-type, so includes formal patient centric documents (CDA), cliical notes, scanned paper, and non-patient specific documents like policy text.
    short: A reference to a document
    type: DomainResource
    comments: Usually, this is used for documents other than those defined by FHIR.

  - name: DocumentReference.masterIdentifier
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: Document identifier as assigned by the source of the document. This identifier is specific to this version of the document. This unique identifier may be used elsewhere to identify this version of the document.
    short: Master Version Specific Identifier

  - name: DocumentReference.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Other identifiers associated with the document, including version independent identifiers.
    short: Other identifiers for the document

  - name: DocumentReference.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of this document reference.
    short: current | superseded | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/document-reference-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This is the status of the DocumentReference object, which might be independent from the docStatus element.

  - name: DocumentReference.docStatus
    flags: [Σ]
    cardinality: 0..1
    type: code
    description: The status of the underlying document.
    short: preliminary | final | amended | entered-in-error # Note: R5 adds more codes here
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/composition-status|4.0.1 # Note: Binding name 'CompositionStatus' implies this is often derived from a Composition resource.
      strength: required
    comments: The document that is pointed to might be in various lifecycle states.

  - name: DocumentReference.type
    flags: [Σ]
    cardinality: 0..1 # Note: Changed from 1..1 in R3
    type: CodeableConcept
    description: Specifies the particular kind of document referenced  (e.g. History and Physical, Discharge Summary, Progress Note). This usually equates to the purpose of making the document referenced.
    short: Kind of document (LOINC if possible)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-doc-typecodes # 'Document Type Value Set' in R4 page
      strength: preferred
    comments: Key metadata element describing the document that describes he exact type of document. Helps humans to assess whether the document is of interest when viewing a list of documents.

  - name: DocumentReference.category
    flags: [Σ]
    cardinality: 0..* # Note: Changed from 0..1 in R3 ('class' renamed to 'category')
    type: CodeableConcept
    description: A categorization for the type of document referenced - helps for indexing and searching. This may be implied by or derived from the code specified in the DocumentReference.type.
    short: Categorization of document
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/document-classcodes # 'Document Class Value Set' in R4 page
      strength: example
    comments: Key metadata element describing the the category or classification of the document. This is a broader perspective that groups similar documents based on how they would be used. This is a primary key used in searching.

  - name: DocumentReference.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Practitioner | Group | Device)
    description: Who or what the document is about. The document can be about a person, (patient or healthcare practitioner), a device (e.g. a machine) or even a group of subjects (such as a document about a herd of farm animals, or a set of patients that share a common exposure).
    short: Who/what is the subject of the document

  - name: DocumentReference.date
    flags: [Σ]
    cardinality: 0..1 # Note: Added in R4 (replaces R3 'created' and 'indexed')
    type: instant
    description: When the document reference was created.
    short: When this document reference was created
    comments: Referencing/indexing time is used for tracking, organizing versions and searching. Provide the most precise timestamp available.

  - name: DocumentReference.author
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson)
    description: Identifies who is responsible for adding the information to the document.
    short: Who and/or what authored the document
    comments: Not necessarily who did the actual data entry (i.e. typist) or who was the source (informant).

  - name: DocumentReference.authenticator
    cardinality: 0..1
    type: Reference(Practitioner | PractitionerRole | Organization)
    description: Which person or organization authenticates that this document is valid.
    short: Who/what authenticated the document

  - name: DocumentReference.custodian
    cardinality: 0..1
    type: Reference(Organization)
    description: Identifies the organization or group who is responsible for ongoing maintenance of and access to the document.
    short: Organization which maintains the document
    comments: Identifies the logical organization (software system, vendor, or department) to go to find the current version, where to report issues, etc.

  - name: DocumentReference.relatesTo
    flags: [Σ] # Note: No longer a modifier in R4
    cardinality: 0..*
    type: BackboneElement
    description: Relationships that this document has with other document references that already exist.
    short: Relationships to other documents

  - name: DocumentReference.relatesTo.code
    flags: [Σ]
    cardinality: 1..1
    type: code
    description: The type of relationship that this document has with anther document.
    short: replaces | transforms | signs | appends
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/document-relationship-type|4.0.1
      strength: required
    comments: If this document appends another document, then the document cannot be fully understood without also accessing the referenced document.

  - name: DocumentReference.relatesTo.target
    flags: [Σ]
    cardinality: 1..1
    type: Reference(DocumentReference)
    description: The target document of this relationship.
    short: Target of the relationship

  - name: DocumentReference.description
    flags: [Σ]
    cardinality: 0..1
    type: string # Note: R5 changes this to markdown
    description: Human-readable description of the source document.
    short: Human-readable description
    comments: What the document is about,  a terse summary of the document.

  - name: DocumentReference.securityLabel
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A set of Security-Tag codes specifying the level of privacy/security of the Document. Note that DocumentReference.meta.security contains the security labels of the "reference" to the document, while DocumentReference.securityLabel contains a snapshot of the security labels on the document the reference refers to.
    short: Document security-tags
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/security-labels # 'All Security Labels' in R4 page
      strength: extensible
    comments: Recommended practice is to use the HL7 Healthcare Privacy and Security Classification System (HCS).

  - name: DocumentReference.content
    flags: [Σ]
    cardinality: 1..*
    type: BackboneElement
    description: The document and format referenced. There may be multiple content element repetitions, each with a different format.
    short: Document referenced
    comments: content element shall not contain different versions of the same content. For version handling use multiple DocumentReference with .relatesTo.

  - name: DocumentReference.content.attachment
    flags: [Σ]
    cardinality: 1..1
    type: Attachment
    description: The document or URL of the document along with critical metadata to prove content has integrity.
    short: Where to access the document

  - name: DocumentReference.content.format
    flags: [Σ]
    cardinality: 0..1
    type: Coding
    description: An identifier of the document encoding, structure, and template that the document conforms to beyond the base format indicated in the mimeType.
    short: Format/content rules for the document
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/formatcodes # 'DocumentReference Format Code Set' in R4 page
      strength: preferred
    comments: Note that IHE often issues URNs for formatCode codes.

  - name: DocumentReference.context
    flags: [Σ]
    cardinality: 0..1
    type: BackboneElement
    description: The clinical context in which the document was prepared.
    short: Clinical context of document

  - name: DocumentReference.context.encounter
    cardinality: 0..* # Note: Changed from 0..1 in R3
    type: Reference(Encounter | EpisodeOfCare) # Note: Added EpisodeOfCare in R4
    description: Describes the clinical encounter or type of care that the document content is associated with.
    short: Context of the document content
    comments: This will typically be the encounter the document reference was created during.

  - name: DocumentReference.context.event
    cardinality: 0..*
    type: CodeableConcept
    description: This list of codes represents the main clinical acts, such as a colonoscopy or an appendectomy, being documented. In some cases, the event is inherent in the type Code, such as a "History and Physical Report" in which the procedure being documented is necessarily a "History and Physical" act.
    short: Main clinical acts documented
    binding:
      valueSet: http://terminology.hl7.org/CodeSystem/v3-ActCode # Link points to v3 ActCode in R4 page
      strength: example
    comments: An event can further specialize the act inherent in the type.

  - name: DocumentReference.context.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The time period over which the service that is described by the document was provided.
    short: Time of service that is being documented

  - name: DocumentReference.context.facilityType
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of facility where the patient was seen.
    short: Kind of facility where patient was seen
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-facilitycodes # 'Facility Type Code Value Set' in R4 page
      strength: example

  - name: DocumentReference.context.practiceSetting
    cardinality: 0..1
    type: CodeableConcept
    description: This property may convey specifics about the practice setting where the content was created, often reflecting the clinical specialty.
    short: Additional details about where the content was created (e.g. clinical specialty)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-practice-codes # 'Practice Setting Code Value Set' in R4 page
      strength: example
    comments: Recommend the use of the classification system for Practice Setting, such as that described by the Subject Matter Domain in LOINC.

  - name: DocumentReference.context.sourcePatientInfo
    cardinality: 0..1
    type: Reference(Patient)
    description: The Patient Information as known when the document was published. May be a reference to a version specific, or contained.
    short: Patient demographics from source

  - name: DocumentReference.context.related
    cardinality: 0..*
    type: Reference(Any) # Note: Changed from BackboneElement in R3
    description: Related identifiers or resources associated with the DocumentReference.
    short: Related identifiers or resources
    comments: Use only for references not covered by other elements.

```

```yaml
constraints:
  # Note: R4 page lists constraints under the element definitions in the detailed description page.
  # These specific constraints (docRef-1, docRef-2) were added in R5, not present in R4 base spec.
  # Including standard constraints if applicable or leaving empty if none explicitly defined for R4 base like this.
  # R4 doesn't have constraints listed in the same way as the R5 example's enc-1/enc-2.
  # Let's leave this empty to accurately reflect the R4 structure page provided.
  []
```

## Search Parameters

Search parameters defined for the DocumentReference resource:

```yaml
searchParameters:
  - name: authenticator
    type: reference
    description: Who/what authenticated the document
    expression: DocumentReference.authenticator
    targets: [Practitioner, PractitionerRole, Organization]
  - name: author
    type: reference
    description: Who and/or what authored the document
    expression: DocumentReference.author
    targets: [Practitioner, PractitionerRole, Organization, Device, Patient, RelatedPerson]
  - name: category
    type: token
    description: Categorization of document
    expression: DocumentReference.category
  - name: contenttype # Note: This searches Attachment.contentType
    type: token
    description: Mime type of the content, with charset etc.
    expression: DocumentReference.content.attachment.contentType
  - name: custodian
    type: reference
    description: Organization which maintains the document
    expression: DocumentReference.custodian
    targets: [Organization]
  - name: date
    type: date
    description: When this document reference was created
    expression: DocumentReference.date
  - name: description
    type: string
    description: Human-readable description
    expression: DocumentReference.description
  - name: encounter
    type: reference
    description: Context of the document content
    expression: DocumentReference.context.encounter
    targets: [Encounter, EpisodeOfCare]
  - name: event
    type: token
    description: Main clinical acts documented
    expression: DocumentReference.context.event
  - name: facility # Searches context.facilityType
    type: token
    description: Kind of facility where patient was seen
    expression: DocumentReference.context.facilityType
  - name: format # Searches content.format
    type: token
    description: Format/content rules for the document
    expression: DocumentReference.content.format
  - name: identifier
    type: token
    description: Master Version Specific Identifier or Other identifiers for the document
    expression: DocumentReference.masterIdentifier | DocumentReference.identifier
  - name: language # Note: This searches Attachment.language
    type: token
    description: Human language of the content (BCP-47)
    expression: DocumentReference.content.attachment.language
  - name: location # Note: This searches Attachment.url
    type: uri
    description: Uri where the data can be found
    expression: DocumentReference.content.attachment.url
  - name: patient
    type: reference
    description: Who/what is the subject of the document (if patient)
    expression: DocumentReference.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: period
    type: date
    description: Time of service that is being documented
    expression: DocumentReference.context.period
  - name: related
    type: reference
    description: Related identifiers or resources
    expression: DocumentReference.context.related
    targets: [Any] # As type is Reference(Any)
  - name: relatesto
    type: reference
    description: Target of the relationship
    expression: DocumentReference.relatesTo.target
    targets: [DocumentReference]
  - name: relation
    type: token
    description: replaces | transforms | signs | appends
    expression: DocumentReference.relatesTo.code
  - name: relationship
    type: composite
    description: Combination of relation and relatesTo
    components: # Extracted from the structure description 'On DocumentReference.relatesTo: relatesto: code, relation: target' - careful with names!
      - definition: relation # Corresponds to relatesTo.code
        expression: code
      - definition: relatesto # Corresponds to relatesTo.target
        expression: target
  - name: security-label
    type: token
    description: Document security-tags
    expression: DocumentReference.securityLabel
  - name: setting # Searches context.practiceSetting
    type: token
    description: Additional details about where the content was created (e.g. clinical specialty)
    expression: DocumentReference.context.practiceSetting
  - name: status
    type: token
    description: current | superseded | entered-in-error
    expression: DocumentReference.status
  - name: subject
    type: reference
    description: Who/what is the subject of the document
    expression: DocumentReference.subject
    targets: [Patient, Practitioner, Group, Device]
  - name: type
    type: token
    description: Kind of document (LOINC if possible)
    expression: DocumentReference.type

```