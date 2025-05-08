Okay, here is the DiagnosticReport resource definition presented in the requested Markdown format with embedded YAML blocks, based on the provided HTML content for FHIR R6/Build.

---

# FHIR Resource: DiagnosticReport

```yaml
resource:
  name: DiagnosticReport
  hl7_workgroup: Orders and Observations
  maturity_level: 3
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Group
    - Patient
    - Practitioner
```

The findings and interpretation of diagnostic tests performed on patients, groups of patients, products, substances, devices, and locations, and/or specimens derived from these. The report includes clinical context such as requesting provider information, and some mix of atomic results, images, textual and coded interpretations, and formatted representation of diagnostic reports. The report also includes non-clinical context such as batch analysis and stability reporting of products and substances.

## Background and Scope

The DiagnosticReport resource represents the output of a diagnostic service, conveying information typically provided when investigations are complete. It serves as an *event* resource within FHIR workflow patterns.

Key aspects include:

*   **Versatile Content:** Can contain a mix of atomic results (`Observation` resources referenced via `result`), images (`media`, `study`), textual reports (`conclusion`, `presentedForm`), and coded interpretations (`conclusionCode`, `category`, `code`). The specific mix depends on the diagnostic procedure type.
*   **Broad Applicability:** Suitable for various diagnostic areas including:
    *   Laboratory (Chemistry, Hematology, Microbiology, etc.)
    *   Pathology/Histopathology
    *   Imaging (X-ray, CT, MRI)
    *   Other diagnostics (Cardiology, Gastroenterology)
    *   Product/Substance quality testing.
*   **Clinical Context:** Includes information about the subject (`subject`), specimen (`specimen`), requesting information (`basedOn`), encounter (`encounter`), and performers/interpreters (`performer`, `resultsInterpreter`).
*   **Report Structure:** While atomic results are linked via `result`, the overall structure and narrative flow can be defined using a referenced `Composition` resource (`composition`).
*   **Representation:** Can include both structured data and a formatted representation (`presentedForm`, often PDF) for human readability and clinical fidelity. A clinically safe narrative (`text`) is always required.
*   **Status Management:** The `status` element tracks the report's lifecycle (e.g., `registered`, `partial`, `final`, `amended`, `cancelled`, `entered-in-error`). Handling updates and retractions is crucial.
*   **Relationship to Other Resources:**
    *   **Observation:** Referenced via `result` to provide atomic findings. DiagnosticReport adds clinical context and interpretation.
    *   **ServiceRequest:** Referenced via `basedOn` to link the report to the original order/request.
    *   **Procedure:** Referenced via `procedure` to link to the procedure(s) that generated the report content.
    *   **ImagingStudy/GenomicStudy:** Referenced via `study` to link to detailed metadata about complex studies (like DICOM imaging sets or genomic analyses).
    *   **Composition:** Optionally referenced via `composition` to provide a structured organization of the report content.
    *   **DocumentReference:** Used for referencing non-FHIR objects or standalone documents. `DiagnosticReport.media.link` now references DocumentReference instead of Media. There can be overlap (e.g., a scanned report could be a `presentedForm` *and* referenced by a `DocumentReference`).

*   **Not Intended For:** Cumulative result presentation (like tabular views over time) or full detailed structured reporting for sequencing (planned for future releases).

## Resource Details

The following defines the core elements and constraints of the DiagnosticReport resource.

```yaml
elements:
  - name: DiagnosticReport
    description: The findings and interpretation of diagnostic tests performed on patients, groups of patients, products, substances, devices, and locations, and/or specimens derived from these. The report includes clinical context such as requesting provider information, and some mix of atomic results, images, textual and coded interpretations, and formatted representation of diagnostic reports. The report also includes non-clinical context such as batch analysis and stability reporting of products and substances.
    short: A Diagnostic report - a combination of request information, atomic results, images, interpretation, as well as formatted reports
    type: DomainResource
    comments: This is intended to capture a single report and is not suitable for use in displaying summary information that covers multiple reports. For example, this resource has not been designed for laboratory cumulative reporting formats nor detailed structured reports for sequencing.

  - name: DiagnosticReport.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifiers assigned to this report by the performer or other systems.
    short: Business identifier for report
    comments: Usually assigned by the Information System of the diagnostic service provider (filler id). Use type codes PLAC/FILL to distinguish Placer/Filler identifiers.

  - name: DiagnosticReport.basedOn
    cardinality: 0..*
    type: Reference(CarePlan | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest)
    description: Details concerning a service requested.
    short: What was requested
    comments: Note: Usually there is one test request for each result, however in some circumstances multiple test requests may be represented using a single test result resource. Note that there are also cases where one request leads to multiple reports.

  - name: DiagnosticReport.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the diagnostic report.
    short: registered | partial | preliminary | modified | final | amended | corrected | appended | cancelled | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/diagnostic-report-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: DiagnosticReport.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A code that classifies the clinical discipline, department or diagnostic service that created the report (e.g. cardiology, biochemistry, hematology, MRI). This is used for searching, sorting and display purposes.
    short: Service category
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/diagnostic-service-sections
      strength: example
    comments: Multiple categories are allowed using various categorization schemes. The level of granularity is defined by the category concepts in the value set. More fine-grained filtering can be performed using the metadata and/or terminology hierarchy in DiagnosticReport.code.

  - name: DiagnosticReport.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: A code or name that describes this diagnostic report.
    short: Name/Code for this diagnostic report
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/report-codes
      strength: preferred
    comments: DiagnosticReport.code is primarily meant to characterize the nature of the entire report, not to summarize the content in detail. In the case where multiple orderables are included in a single report, then the single DiagnosticReport.code would represent the entire 'panel' that the report is covering.

  - name: DiagnosticReport.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group | Device | Location | Organization | Practitioner | Medication | Substance | BiologicallyDerivedProduct)
    description: The subject of the report. Usually, but not always, this is a patient. However, diagnostic services also perform analyses on specimens collected from a variety of other sources.
    short: The subject of the report - usually, but not always, the patient

  - name: DiagnosticReport.relatesTo
    cardinality: 0..*
    type: RelatedArtifact
    description: Other DiagnosticReports that the current DiagnosticReport replaces, amendens, extends, or otherwise relates to.
    short: Related DiagnosticReports

  - name: DiagnosticReport.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The encounter (e.g. a patient and healthcare provider interaction) that is associated with the DiagnosticReport.
    short: Encounter associated with the DiagnosticReport
    comments: This will typically be the encounter, when it exists, during which the data or specimens (e.g. imaging, blood draw, or assessment procedure) that are being reported by the DiagnosticReport were obtained/acquired. When a DiagnosticReport is based on a ServiceRequest (order), the ServiceRequest.encounter referenced in DiagnosticReport.basedOn may be used to associate the two.

  - name: DiagnosticReport.effective[x]
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period
    description: The time or time-period the observed values are related to. When the subject of the report is a patient, this is usually either the time of the procedure or of specimen collection(s), but very often the source of the date/time is not known, only the date/time itself.
    short: Clinically relevant time/time-period for the results that are included in the report
    comments: If the diagnostic procedure was performed on the patient, this is the time it was performed. If there are specimens, the diagnostically relevant time can be derived from the specimen collection times, but the specimen information is not always available, and the exact relationship between the specimens and the diagnostically relevant time is not always automatic.

  - name: DiagnosticReport.issued
    flags: [Σ]
    cardinality: 0..1
    type: instant
    description: The date and time that this version of the report was made available to providers, typically after the report was reviewed and verified.
    short: DateTime this version was made
    comments: May be different from the update time of the resource itself, because that is the status of the record (potentially a secondary copy), not the actual release time of the report.

  - name: DiagnosticReport.procedure
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Procedure)
    description: The procedure(s) that are reported on in the DiagnosticReport.
    short: The procedure(s) from which the report was produced
    comments: This is a summary of the report, not a list of results.

  - name: DiagnosticReport.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Device)
    description: The diagnostic service that is responsible for issuing the report.
    short: Responsible Diagnostic Service
    comments: This is not necessarily the source of the atomic data items or the entity that interpreted the results. It is the entity that takes responsibility for the clinical report. In the regulated context of diagnostic laboratory work on humans, it is extremely likely that regulation requires a human performer. Point of care testing, veterinary testing, drug screens, and environmental surveillance are common cases where the device is the performer with no additional human interaction or direct oversight.

  - name: DiagnosticReport.resultsInterpreter
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam)
    description: The practitioner or organization that is responsible for the report's conclusions and interpretations.
    short: Primary result interpreter
    comments: Might not be the same entity that takes responsibility for the clinical report.

  - name: DiagnosticReport.specimen
    cardinality: 0..*
    type: Reference(Specimen)
    description: Details about the specimens on which this diagnostic report is based.
    short: Specimens this report is based on
    comments: If the specimen is sufficiently specified with a code in the test result name, then this additional data may be redundant. If there are multiple specimens, these may be represented per observation or group.

  - name: DiagnosticReport.result
    flags: [C] # Constraint dgr-1 affects this element
    cardinality: 0..*
    type: Reference(Observation)
    description: [Observations](observation.html)  that are part of this diagnostic report.
    short: Observations
    comments: Observations can contain observations.

  - name: DiagnosticReport.note
    cardinality: 0..*
    type: Annotation
    description: Comments about the diagnostic report.
    short: Comments about the diagnostic report
    comments: May include general statements about the diagnostic report, or statements about significant, unexpected or unreliable results values contained within the diagnostic report, or information about its source when relevant to its interpretation.

  - name: DiagnosticReport.study
    cardinality: 0..*
    type: Reference(GenomicStudy | ImagingStudy)
    description: One or more links to full details of any study performed during the diagnostic investigation. An ImagingStudy might comprise a set of radiologic images obtained via a procedure that are analyzed as a group. Typically, this is imaging performed by DICOM enabled modalities, but this is not required. A fully enabled PACS viewer can use this information to provide views of the source images. A GenomicStudy might comprise one or more analyses, each serving a specific purpose. These analyses may vary in method (e.g., karyotyping, CNV, or SNV detection), performer, software, devices used, or regions targeted.
    short: Reference to full details of an analysis associated with the diagnostic report
    comments: For laboratory-type studies like GenomeStudy, type resources will be used for tracking additional metadata and workflow aspects of complex studies. ImagingStudy and the media element are somewhat overlapping - typically, the list of image references in the media element will also be found in one of the imaging study resources. However, each caters to different types of displays for different types of purposes. Neither, either, or both may be provided.

  - name: DiagnosticReport.supportingInfo
    cardinality: 0..*
    type: BackboneElement
    description: This backbone element contains supporting information that was used in the creation of the report not included in the results already included in the report.
    short: Additional information supporting the diagnostic report

  - name: DiagnosticReport.supportingInfo.type
    cardinality: 1..1
    type: CodeableConcept
    description: The code value for the role of the supporting information in the diagnostic report.
    short: Supporting information role code
    binding:
      valueSet: http://terminology.hl7.org/ValueSet/v2-0936 # Using v6.3.0 link from HTML source
      strength: example

  - name: DiagnosticReport.supportingInfo.reference
    cardinality: 1..1
    type: Reference(ImagingStudy | Procedure | Observation | DiagnosticReport | Citation | FamilyMemberHistory | AllergyIntolerance | DeviceUsage | Condition | GenomicStudy)
    description: The reference for the supporting information in the diagnostic report.
    short: Supporting information reference

  - name: DiagnosticReport.media
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: A list of key images or data associated with this report. The images or data are generally created during the diagnostic process, and may be directly of the patient, or of treated specimens (i.e. slides of interest).
    short: Key images or data associated with this report

  - name: DiagnosticReport.media.comment
    cardinality: 0..1
    type: string
    description: A comment about the image or data. Typically, this is used to provide an explanation for why the image or data is included, or to draw the viewer's attention to important features.
    short: Comment about the image or data (e.g. explanation)
    comments: The comment should be displayed with the image or data. It would be common for the report to include additional discussion of the image or data contents or in other sections such as the conclusion.

  - name: DiagnosticReport.media.link
    flags: [Σ]
    cardinality: 1..1
    type: Reference(DocumentReference)
    description: Reference to the image or data source.
    short: Reference to the image or data source

  - name: DiagnosticReport.composition
    flags: [C] # Constraint dgr-1 affects this element
    cardinality: 0..1
    type: Reference(Composition)
    description: Reference to a Composition resource instance that provides structure for organizing the contents of the DiagnosticReport.
    short: Reference to a Composition resource for the DiagnosticReport structure
    comments: The Composition provides structure to the content of the DiagnosticReport (and only contains contents referenced in the DiagnosticReport) - e.g., to order the sections of an anatomic pathology structured report.

  - name: DiagnosticReport.conclusion
    cardinality: 0..1
    type: markdown
    description: Concise and clinically contextualized summary conclusion (interpretation/impression) of the diagnostic report.
    short: Clinical conclusion (interpretation) of test results

  - name: DiagnosticReport.conclusionCode
    cardinality: 0..*
    type: CodeableReference(Observation | Condition)
    description: One or more codes and/or references that represent the summary conclusion (interpretation/impression) of the diagnostic report.
    short: Codes and/or references for the clinical conclusion of test results
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example

  - name: DiagnosticReport.recomendation # Note: Typo 'recomendation' exists in source HTML
    flags: [Σ]
    cardinality: 0..*
    type: CodeableReference(Any)
    description: Proposed follow-up actions based on the findings and interpretations of the diagnostic test for which this report is the subject.
    short: Recommendations based on findings and interpretations
    comments: The resources that should be referenced include CarePlan, ServiceRequest, CommunicationRequest, etc. that allow for proposed actions and next steps.

  - name: DiagnosticReport.presentedForm
    cardinality: 0..*
    type: Attachment
    description: Rich text representation of the entire result as issued by the diagnostic service. Multiple formats are allowed but they SHALL be semantically equivalent.
    short: Entire report as issued
    comments: "application/pdf" is recommended as the most reliable and interoperable in this context.

  - name: DiagnosticReport.communication
    cardinality: 0..*
    type: Reference(Communication)
    description: Communications initiated during the generation of the DiagnosticReport by members of the organization fulfilling that order. e.g. direct communication of time critical results by the radiologist to the referring physician.
    short: Communication initiated during the reporting process
    comments: Note: This can document attempted communications as well as completed communications. Communications that follow publication of the report (e.g. between the referring physician and the patient or a subsequent specialist) are not referenced here. DiagnosticReport.recommendation might also contain references to ServiceRequest or CommunicationRequest instances for proposed subsequent communications.

constraints:
  - key: dgr-1
    severity: Rule
    location: (base)
    description: When a Composition is referenced in `DiagnosticReport.composition`, all Observation resources referenced in `Composition.entry` must also be referenced in `DiagnosticReport.result` or in the `Observation.hasMember` references.
    expression: composition.exists() implies (composition.resolve().section.entry.reference.where(resolve() is Observation) in (result.reference|result.reference.resolve().hasMember.reference))

```

## Search Parameters

Search parameters defined for the DiagnosticReport resource:

```yaml
searchParameters:
  - name: based-on
    type: reference
    description: Reference to the service request.
    expression: DiagnosticReport.basedOn
    targets: [CarePlan, ImmunizationRecommendation, MedicationRequest, NutritionOrder, ServiceRequest]
  - name: category
    type: token
    description: Which diagnostic discipline/department created the report
    expression: DiagnosticReport.category
  - name: code
    type: token
    description: The code for the report, as opposed to codes for the atomic results, which are the names on the observation resource referred to from the result
    expression: DiagnosticReport.code
  - name: conclusioncode-code # Note: Name derived from HTML 'conclusioncode-code'
    type: token
    description: A coded conclusion (interpretation/impression) on the report
    expression: DiagnosticReport.conclusionCode.concept
  - name: conclusioncode-reference # Note: Name derived from HTML 'conclusioncode-reference'
    type: reference
    description: A reference for the conclusion (interpretation/impression) on the report
    expression: DiagnosticReport.conclusionCode.reference
    targets: [Condition, Observation] # From CodeableReference(Observation | Condition) on conclusionCode
  - name: date
    type: date
    description: The clinically relevant time of the report
    expression: DiagnosticReport.effective.ofType(dateTime) | DiagnosticReport.effective.ofType(Period)
  - name: encounter
    type: reference
    description: The Encounter when the order was made
    expression: DiagnosticReport.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: An identifier for the report
    expression: DiagnosticReport.identifier
  - name: issued
    type: date
    description: When the report was issued
    expression: DiagnosticReport.issued
  - name: media
    type: reference
    description: A reference to the image source.
    expression: DiagnosticReport.media.link
    targets: [DocumentReference] # Changed from Media in R4 based on element definition
  - name: patient
    type: reference
    description: The subject of the report if a patient
    expression: DiagnosticReport.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Who is responsible for the report
    expression: DiagnosticReport.performer
    targets: [Practitioner, PractitionerRole, Organization, CareTeam, HealthcareService, Device]
  - name: procedure
    type: reference
    description: The procedure(s) from which the report was produced.
    expression: DiagnosticReport.procedure
    targets: [Procedure]
  - name: result
    type: reference
    description: Link to an atomic result (observation resource)
    expression: DiagnosticReport.result
    targets: [Observation]
  - name: results-interpreter
    type: reference
    description: Who was the source of the report
    expression: DiagnosticReport.resultsInterpreter
    targets: [Practitioner, PractitionerRole, Organization, CareTeam]
  - name: specimen
    type: reference
    description: The specimen details
    expression: DiagnosticReport.specimen
    targets: [Specimen]
  - name: status
    type: token
    description: The status of the report
    expression: DiagnosticReport.status
  - name: study
    type: reference
    description: Studies associated with the diagnostic report
    expression: DiagnosticReport.study
    targets: [GenomicStudy, ImagingStudy]
  - name: subject
    type: reference
    description: The subject of the report
    expression: DiagnosticReport.subject
    targets: [Patient, Group, Device, Location, Organization, Practitioner, Medication, Substance, BiologicallyDerivedProduct]

```