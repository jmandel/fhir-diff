Okay, here is the DocumentReference resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided HTML source for FHIR R6/Build.

---

# FHIR Resource: DocumentReference

```yaml
resource:
  name: DocumentReference
  hl7_workgroup: Orders and Observations
  maturity_level: 5
  standard_status: Trial Use
  security_category: Not Classified # Note: Source HTML states "Not Classified"
  compartments:
    - Device
    - Encounter
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

A reference to a document of any kind for any purpose. While the term “document” implies a more narrow focus, for this resource this "document" encompasses *any* serialized object with a mime-type, it includes formal patient-centric documents (CDA), clinical notes, scanned paper, non-patient specific documents like policy text, as well as a photo, video, or audio recording acquired or used in healthcare. The DocumentReference resource provides metadata about the document so that the document can be discovered and managed. The actual content may be inline base64 encoded data or provided by direct reference.

## Background and Scope

The `DocumentReference` resource serves as an index for various types of documents and binary objects within a healthcare system, making them discoverable and manageable. This includes, but is not limited to:

*   Structured documents like CDA or FHIR Documents.
*   Unstructured content like PDF files, scanned paper, faxes, and clinical notes.
*   Media files such as images (JPEG, TIFF), videos (MP4), and audio (WAV, MP3).
*   Other formats like CSV, RTF, or specific records like prescriptions or immunizations.

It's commonly used in document indexing systems like IHE XDS and MHD.

**Key Concepts & Boundaries:**

*   **Metadata Focus:** `DocumentReference` primarily holds metadata *about* the document, not necessarily the document content itself (though inline content via `Attachment.data` is possible). The actual document is often linked via `Attachment.url`.
*   **vs. DiagnosticReport/Observation:** `DiagnosticReport` is preferred for structured results (Observations) with associated context. `DocumentReference` can reference unstructured reports or media like images/audio that might also be represented as an `Observation`'s value. Sometimes, both might represent the same underlying information if different metadata or workflows are needed. Implementation Guides often clarify the preferred approach.
*   **vs. ImagingStudy/ImagingSelection:** While `DocumentReference` can contain DICOM images, `ImagingStudy` and `ImagingSelection` are often preferred for clinical imaging workflows, especially when integrating with systems like WADO-RS for image retrieval and rendering. `DocumentReference` can still be used for image transfer, potentially linking to a WADO-RS source via `Attachment.url`.
*   **vs. FHIR Documents:** FHIR defines its own <a href="https://build.fhir.org/documents.html">Document format</a> for content authored *in* FHIR. `DocumentReference` is a more general mechanism to refer to *any* document or media file, including FHIR Documents stored elsewhere.
*   **Content Access:** The referenced document can be stored in various ways: as a FHIR `Binary` resource, on another FHIR server, via external services (like XDS RetrieveDocumentSet, WADO-RS), or retrieved via other mechanisms specified externally.
*   **Provenance:** It's crucial to distinguish the provenance of the `DocumentReference` resource itself (managed via `Resource.meta`) from the provenance of the *document it references* (described by elements like `author`, `attester`, `custodian`, `date`).

## Resource Details

The following defines the core elements and constraints of the DocumentReference resource.

```yaml
elements:
  - name: DocumentReference
    description: A reference to a document of any kind for any purpose. While the term “document” implies a more narrow focus, for this resource this "document" encompasses *any* serialized object with a mime-type, it includes formal patient-centric documents (CDA), clinical notes, scanned paper, non-patient specific documents like policy text, as well as a photo, video, or audio recording acquired or used in healthcare. The DocumentReference resource provides metadata about the document so that the document can be discovered and managed. The actual content may be inline base64 encoded data or provided by direct reference.
    short: A reference to a document
    type: DomainResource
    comments: Usually, this is used for documents other than those defined by FHIR.

  - name: DocumentReference.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifiers assigned to this document reference by the performer and/or other systems. These identifiers remain constant as the resource is updated and propagates from server to server.
    short: Business identifiers for the document
    comments: The structure and format of this identifier would be consistent with the specification corresponding to the format of the document. (e.g. for a DICOM standard document, a 64-character numeric UID; for an HL7 CDA format, the CDA Document Id root and extension).

  - name: DocumentReference.version
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: An explicitly assigned identifier of a variation of the content in the DocumentReference.
    short: An explicitly assigned identifier of a variation of the content in the DocumentReference
    comments: While each resource, including the DocumentReference itself, has its own version identifier, this is a formal identifier for the logical version of the DocumentReference as a whole. It would remain constant if the resources were moved to a new server, and all got new individual resource versions, for example.

  - name: DocumentReference.basedOn
    cardinality: 0..*
    type: Reference(Appointment | AppointmentResponse | CarePlan | Claim | CommunicationRequest | Contract | CoverageEligibilityRequest | DeviceRequest | EnrollmentRequest | ImmunizationRecommendation | MedicationRequest | NutritionOrder | RequestOrchestration | ServiceRequest | SupplyRequest | VisionPrescription)
    description: A procedure that is fulfilled in whole or in part by the creation of this media.
    short: Procedure that caused this media to be created

  - name: DocumentReference.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The current state of the document reference.
    short: current | superseded | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/document-reference-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This is the status of the DocumentReference object, which might be independent from the docStatus element.

  - name: DocumentReference.docStatus
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: The status of the underlying document.
    short: registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | deprecated | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/composition-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: The document that is pointed to might be in various lifecycle states.

  - name: DocumentReference.modality
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: Imaging modality used. This may include both acquisition and non-acquisition modalities.
    short: Imaging modality used
    binding:
      valueSet: http://dicom.nema.org/medical/dicom/current/output/chtml/part16/sect_CID_33.html # External link
      strength: extensible

  - name: DocumentReference.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: Specifies the particular kind of document referenced (e.g. History and Physical, Discharge Summary, Progress Note). This usually equates to the purpose of making the document referenced.
    short: Kind of document (LOINC if possible)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/doc-typecodes
      strength: preferred
    comments: Key metadata element describing the document that describes he exact type of document. Helps humans to assess whether the document is of interest when viewing a list of documents.

  - name: DocumentReference.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A categorization for the type of document referenced - helps for indexing and searching. This may be implied by or derived from the code specified in the DocumentReference.type.
    short: Categorization of document
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/referenced-item-category
      strength: example
    comments: Key metadata element describing the the category or classification of the document. This is a broader perspective that groups similar documents based on how they would be used. This is a primary key used in searching.

  - name: DocumentReference.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Any) # Note: R6 allows Reference(Any) here. Earlier versions were more constrained.
    description: Who or what the document is about. The document can be about a person, (patient or healthcare practitioner), a device (e.g. a machine) or even a group of subjects (such as a document about a herd of farm animals, or a set of patients that share a common exposure).
    short: Who/what is the subject of the document

  - name: DocumentReference.context
    flags: [Σ, C]
    cardinality: 0..*
    type: Reference(Appointment | Encounter | EpisodeOfCare)
    description: The Encounter during which this document reference was created or to which the creation of this record is tightly associated.
    short: Context the document reference is part of (e.g. Encounter) # Adjusted short desc. for clarity
    comments: This will typically be the encounter the document reference was created during, but some document references may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission lab tests).

  - name: DocumentReference.event
    cardinality: 0..*
    type: CodeableReference(Any)
    description: This list of codes represents the main clinical acts, such as a colonoscopy or an appendectomy, being documented. In some cases, the event is inherent in the type Code, such as a "History and Physical Report" in which the procedure being documented is necessarily a "History and Physical" act.
    short: Main clinical acts documented
    binding:
      valueSet: http://terminology.hl7.org/6.3.0/ValueSet-v3-ActCode # External link
      strength: example
    comments: An event can further specialize the act inherent in the type, such as where it is simply "Procedure Report" and the procedure was a "colonoscopy". If one or more event codes are included, they shall not conflict with the values inherent in the class or type elements as such a conflict would create an ambiguous situation.

  - name: DocumentReference.related
    cardinality: 0..*
    type: Reference(Any)
    description: Any other resource this document reference was created or to which the creation of this record is tightly associated.
    short: Related identifiers or resources associated with the document reference
    comments: Use only for references not covered by other elements.

  - name: DocumentReference.bodySite
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(BodyStructure)
    description: The anatomic structures included in the document.
    short: Body part included
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site # Matched example binding style
      strength: example

  - name: DocumentReference.facilityType
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    description: The kind of facility where the patient was seen.
    short: Kind of facility where patient was seen
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-facilitycodes
      strength: example

  - name: DocumentReference.practiceSetting
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    description: This property may convey specifics about the practice setting where the content was created, often reflecting the clinical specialty.
    short: Additional details about where the content was created (e.g. clinical specialty)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/c80-practice-codes
      strength: example
    comments: This element should be based on a coarse classification system for the class of specialty practice. Recommend the use of the classification system for Practice Setting, such as that described by the Subject Matter Domain in LOINC.

  - name: DocumentReference.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The time period over which the service that is described by the document was provided.
    short: Time of service that is being documented

  - name: DocumentReference.date
    flags: [Σ]
    cardinality: 0..1
    type: dateTime # Note: Changed from 'instant' in R4
    description: When the document reference was created.
    short: When this document reference was created
    comments: Referencing/indexing time is used for tracking, organizing versions and searching. Provide the most precise timestamp available.

  - name: DocumentReference.author
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson | CareTeam | Group)
    description: Identifies who is responsible for adding the information to the document.
    short: Who and/or what authored the document
    comments: Not necessarily who did the actual data entry (i.e. typist) or who was the source (informant). Using Group is only allowed in the circumstance where the group represents a family or a household, and should not represent groups of Practitioners.

  - name: DocumentReference.attester
    cardinality: 0..*
    type: BackboneElement
    description: A participant who has authenticated the accuracy of the document.
    short: Attests to accuracy of the document
    comments: Only list each attester once.

  - name: DocumentReference.attester.mode
    cardinality: 1..1
    type: CodeableConcept
    description: The type of attestation the authenticator offers.
    short: personal | professional | legal | official
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/composition-attestation-mode
      strength: preferred

  - name: DocumentReference.attester.time
    cardinality: 0..1
    type: dateTime
    description: When the document was attested by the party.
    short: When the document was attested

  - name: DocumentReference.attester.party
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Practitioner | PractitionerRole | Organization | Group)
    description: Who attested the document in the specified way.
    short: Who attested the document
    comments: Using Group is only allowed in the circumstance where the group represents a family or a household, and should not represent groups of Practitioners.

  - name: DocumentReference.custodian
    cardinality: 0..1
    type: Reference(Organization)
    description: Identifies the organization or group who is responsible for ongoing maintenance of and access to the document.
    short: Organization which maintains the document
    comments: Identifies the logical organization (software system, vendor, or department) to go to find the current version, where to report issues, etc. This is different from the physical location (URL, disk drive, or server) of the document, which is the technical location of the document, which host may be delegated to the management of some other organization.

  - name: DocumentReference.relatesTo
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Relationships that this document has with other document references that already exist.
    short: Relationships to other documents
    comments: This element is labeled as a modifier because documents that append to other documents are incomplete on their own. # Pulled from R4B definition as R6 doesn't explicitly state modifier status here but implies it via relationship types like 'appends'.

  - name: DocumentReference.relatesTo.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept # Note: Changed from 'code' in R4
    description: The type of relationship that this document has with anther document.
    short: The relationship type with another document
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/document-relationship-type
      strength: extensible # Note: Changed from 'required' in R4
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
    type: markdown # Note: Changed from 'string' in R4
    description: Human-readable description of the source document.
    short: Human-readable description
    comments: What the document is about, a terse summary of the document.

  - name: DocumentReference.securityLabel
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A set of Security-Tag codes specifying the level of privacy/security of the Document found at DocumentReference.content.attachment.url. Note that DocumentReference.meta.security contains the security labels of the data elements in DocumentReference, while DocumentReference.securityLabel contains the security labels for the document the reference refers to.
    short: Document security-tags
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/security-label-examples
      strength: example
    comments: The confidentiality codes can carry multiple vocabulary items. HL7 has developed HCS. Use is up to policy domain. In HCS there are code systems specific to Confidentiality, Sensitivity, Integrity, and Handling Caveats. Some values would come from a local vocabulary.

  - name: DocumentReference.content
    flags: [Σ]
    cardinality: 1..*
    type: BackboneElement
    description: The document and format referenced. If there are multiple content element repetitions, these must all represent the same document in different format, or attachment metadata.
    short: Document referenced
    comments: content element shall not contain different versions of the same content. For version handling use multiple DocumentReference with .relatesTo.

  - name: DocumentReference.content.attachment
    flags: [Σ]
    cardinality: 1..1
    type: Attachment
    description: The document or URL of the document along with critical metadata to prove content has integrity.
    short: Where to access the document

  - name: DocumentReference.content.profile
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: An identifier of the document constraints, encoding, structure, and template that the document conforms to beyond the base format indicated in the mimeType.
    short: Content profile rules for the document
    comments: |
      Note that IHE often issues URNs for formatCode codes, not all documents can be identified by a URI.
      For FHIR content, .profile should indicate the structureDefinition profile canonical URI(s) that the content complies with.

  - name: DocumentReference.content.profile.value[x]
    flags: [Σ]
    cardinality: 1..1
    type: Coding | uri | canonical
    description: Code|uri|canonical.
    short: Code|uri|canonical
    binding:
      valueSet: http://terminology.hl7.org/6.3.0/ValueSet-v3-HL7FormatCodes # External link
      strength: preferred

```

```yaml
constraints:
  - key: docRef-1
    severity: Warning # Mapped from source HTML
    location: DocumentReference # Mapped from (base)
    description: facilityType SHALL only be present if context is not an encounter
    expression: facilityType.empty() or context.where(resolve() is Encounter).empty()
  - key: docRef-2
    severity: Warning # Mapped from source HTML
    location: DocumentReference # Mapped from (base)
    description: practiceSetting SHALL only be present if context is not present
    expression: practiceSetting.empty() or context.where(resolve() is Encounter).empty()
```

## Search Parameters

Search parameters defined for the DocumentReference resource:

```yaml
searchParameters:
  - name: attester
    type: reference
    description: Who attested the document
    expression: DocumentReference.attester.party
    targets: [Practitioner, Group, Organization, Patient, PractitionerRole, RelatedPerson]
  - name: author
    type: reference
    description: Who and/or what authored the document
    expression: DocumentReference.author
    targets: [Practitioner, Group, Organization, CareTeam, Device, Patient, PractitionerRole, RelatedPerson]
  - name: based-on
    type: reference
    description: Procedure that caused this media to be created
    expression: DocumentReference.basedOn
    targets: [Appointment, MedicationRequest, RequestOrchestration, VisionPrescription, ServiceRequest, SupplyRequest, AppointmentResponse, CoverageEligibilityRequest, CarePlan, EnrollmentRequest, NutritionOrder, DeviceRequest, Contract, Claim, CommunicationRequest, ImmunizationRecommendation]
  - name: bodysite
    type: token
    description: The body site studied
    expression: DocumentReference.bodySite.concept
  - name: bodysite-reference
    type: reference
    description: The body site studied
    expression: DocumentReference.bodySite.reference
    targets: [BodyStructure] # Derived from CodeableReference(BodyStructure)
  - name: category
    type: token
    description: Categorization of document
    expression: DocumentReference.category
  - name: contenttype # Spelled out based on attachment.contentType
    type: token
    description: Mime type of the content, with charset etc.
    expression: DocumentReference.content.attachment.contentType
  - name: context
    type: reference
    description: Context of the document content
    expression: DocumentReference.context
    targets: [Appointment, EpisodeOfCare, Encounter]
  - name: creation
    type: date
    description: Date attachment was first created
    expression: DocumentReference.content.attachment.creation
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
  - name: doc-status
    type: token
    description: preliminary | final | amended | entered-in-error # Note: List differs slightly from element definition, using search param list
    expression: DocumentReference.docStatus
  - name: event-code
    type: token
    description: Main clinical acts documented
    expression: DocumentReference.event.concept
  - name: event-reference
    type: reference
    description: Main clinical acts documented
    expression: DocumentReference.event.reference
    targets: [Any] # Derived from CodeableReference(Any)
  - name: facility
    type: token
    description: Kind of facility where patient was seen
    expression: DocumentReference.facilityType
  - name: format-canonical
    type: uri
    description: Profile canonical content rules for the document
    expression: (DocumentReference.content.profile.value.ofType(canonical))
  - name: format-code
    type: token
    description: Format code content rules for the document
    expression: (DocumentReference.content.profile.value.ofType(Coding))
  - name: format-uri
    type: uri
    description: Profile URI content rules for the document
    expression: (DocumentReference.content.profile.value.ofType(uri))
  - name: identifier
    type: token
    description: Identifier of the attachment binary # Description differs slightly, using search param table one
    expression: DocumentReference.identifier
  - name: language
    type: token
    description: Human language of the content (BCP-47)
    expression: DocumentReference.content.attachment.language
  - name: location
    type: uri
    description: Uri where the data can be found
    expression: DocumentReference.content.attachment.url
  - name: modality
    type: token
    description: The modality used
    expression: DocumentReference.modality
  - name: patient
    type: reference
    description: Who/what is the subject of the document
    expression: DocumentReference.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: period
    type: date
    description: Time of service that is being documented
    expression: DocumentReference.period
  - name: related
    type: reference
    description: Related identifiers or resources
    expression: DocumentReference.related
    targets: [Any] # Derived from Reference(Any)
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
    components:
      - definition: relatesto # Assumed name based on standard pattern
        expression: target
      - definition: relation # Assumed name based on standard pattern
        expression: code
  - name: security-label
    type: token
    description: Document security-tags
    expression: DocumentReference.securityLabel
  - name: setting
    type: token
    description: Additional details about where the content was created (e.g. clinical specialty)
    expression: DocumentReference.practiceSetting
  - name: status
    type: token
    description: current | superseded | entered-in-error
    expression: DocumentReference.status
  - name: subject
    type: reference
    description: Who/what is the subject of the document
    expression: DocumentReference.subject
    targets: [Any] # Derived from Reference(Any)
  - name: type
    type: token
    description: Kind of document (LOINC if possible)
    expression: DocumentReference.type
  - name: version
    type: string
    description: The business version identifier
    expression: DocumentReference.version
```

---