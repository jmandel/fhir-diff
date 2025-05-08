Here is the FHIR R4 DiagnosticReport resource definition in the requested Markdown and YAML format:

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
    - Patient
    - Practitioner
```

The findings and interpretation of diagnostic tests performed on patients, groups of patients, devices, and locations, and/or specimens derived from these. The report includes clinical context such as requesting and provider information, and some mix of atomic results, images, textual and coded interpretations, and formatted representation of diagnostic reports.

## Background and Scope

The DiagnosticReport resource is an *event* resource from a FHIR workflow perspective. It represents the set of information typically provided by a diagnostic service when investigations are complete. This information can include a mix of atomic results, text reports, images, and codes, varying by the diagnostic procedure and outcomes. It can be conveyed via FHIR Documents, RESTful API, or Messaging.

Key aspects include:

*   **Versatility:** Suitable for various reports like Laboratory (Clinical Chemistry, Hematology, Microbiology), Pathology/Histopathology, Imaging (X-ray, CT, MRI), and other diagnostics (Cardiology, Gastroenterology).
*   **Content:** Contains information about the report itself, the subject (patient, group, device, location), specimen(s), request details, atomic `Observation` results, and `ImagingStudy` references. Conclusions can be text, structured codes, or attached formatted documents (e.g., PDF).
*   **Terminology:**
    *   A practitioner "requests" "tests".
    *   The diagnostic service returns a "report".
    *   The report may contain a "narrative" (written summary) and/or "results" (individual atomic data, which are `Observation` resources).
    *   Results can be assembled in "groups" (often called panels or batteries).
*   **Boundaries:**
    *   `Procedure`: Used to describe details of how the diagnostic procedure was performed, if significant.
    *   `Observation`: Referenced by `DiagnosticReport` to provide atomic results. `DiagnosticReport` adds clinical context, interpretations, and mixed content types.
    *   `Composition`: For more narrative-driven reports with less workflow focus (e.g., histology), `Composition` might be more appropriate. `DiagnosticReport` is better for highly structured reports with workflow support.
*   **Identifiers:** The `identifier` element can use `type` codes like "PLAC" (Placer) and "FILL" (Filler) to distinguish between requester and performer identifiers.
*   **Effective Time:** `effective[x]` (dateTime or Period) indicates the clinically relevant time of the report, such as specimen collection time or procedure time. It SHALL be included.
*   **Status Management:**
    *   `status` tracks the report's lifecycle (e.g., `partial`, `final`, `amended`, `entered-in-error`).
    *   Retracted reports should have their status set to `entered-in-error`, and the narrative/conclusion should indicate withdrawal.
*   **Report Content Presentation:**
    *   **Atomic Data:** Via `result` (references to `Observation` resources).
    *   **Narrative:** XHTML representation in `text` element (must be clinically safe).
    *   **Presented Form:** Via `presentedForm` (e.g., PDF), for rich formatting. The conclusion and coded diagnoses (atomic data) SHOULD be duplicated in the narrative and presented form if present.
*   **Genetics:** `DiagnosticReport` and `Observation` are heavily used for genetic reporting, with a dedicated <a href="http://hl7.org/fhir/uv/genomics-reporting/index.html">Genomics Reporting Implementation Guide</a>.

## Resource Details

The following defines the core elements of the DiagnosticReport resource for FHIR R4.

```yaml
elements:
  - name: DiagnosticReport
    description: The findings and interpretation of diagnostic tests performed on patients, groups of patients, devices, and locations, and/or specimens derived from these. The report includes clinical context such as requesting and provider information, and some mix of atomic results, images, textual and coded interpretations, and formatted representation of diagnostic reports.
    short: A Diagnostic report - a combination of request information, atomic results, images, interpretation, as well as formatted reports
    type: DomainResource
    comments: This is intended to capture a single report and is not suitable for use in displaying summary information that covers multiple reports. For example, this resource has not been designed for laboratory cumulative reporting formats nor detailed structured reports for sequencing.

  - name: DiagnosticReport.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Identifiers assigned to this report by the performer or other systems.
    short: Business identifier for report
    comments: The identifier datatype has a `type` element that may be used to distinguish the identifiers assigned by the requester and the performer of the request (known as the 'Placer' and 'Filler' in the HL7 Version 2 Messaging Standard). Use the identifier type code "PLAC" for the Placer Identifier and "FILL" for the Filler identifier.

  - name: DiagnosticReport.basedOn
    cardinality: 0..*
    type: Reference(CarePlan | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest)
    description: Details concerning a service requested.
    short: What was requested

  - name: DiagnosticReport.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the diagnostic report.
    short: registered | partial | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | unknown
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/diagnostic-report-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status 'entered-in-error' which means that the resource should not be treated as valid.
    comments: Applications consuming diagnostic reports must take careful note of updated (revised) reports and ensure that retracted reports are appropriately handled. A report should not be final until all the individual data items reported with it are final or appended. If the report has been withdrawn following a previous final release, the DiagnosticReport and associated Observations should be retracted by replacing the status codes with 'entered-in-error'.

  - name: DiagnosticReport.category
    flags: [Σ]
    cardinality: 0..*
    type: CodeableConcept
    description: A code that classifies the clinical discipline, department or diagnostic service that created the report (e.g. cardiology, biochemistry, hematology, MRI). This is used for searching, sorting and display purposes.
    short: Service category
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/diagnostic-service-sections
      strength: example

  - name: DiagnosticReport.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: A code or name that describes this diagnostic report.
    short: Name/Code for this diagnostic report
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/report-codes
      strength: preferred
    comments: The DiagnosticReport.code always contains the name of the report itself.

  - name: DiagnosticReport.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group | Device | Location)
    description: The subject of the report. Usually, but not always, this is a patient. However, diagnostic services also perform analyses on specimens collected from a variety of other sources.
    short: The subject of the report - usually, but not always, the patient

  - name: DiagnosticReport.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The healthcare event (e.g. a patient and healthcare provider interaction) which this DiagnosticReport is about.
    short: Health care event when test ordered

  - name: DiagnosticReport.effectiveDateTime
    flags: [Σ]
    cardinality: 0..1 # Choice with effectivePeriod
    type: dateTime
    description: The time or time-period the observed values are related to. When the subject of the report is a patient, this is usually either the time of the procedure or of specimen collection(s), but very often the source of the date/time is not known, only the date/time itself.
    short: Clinically relevant time/time-period for report
    comments: If the diagnostic procedure was performed on the patient directly, the effective[x] element is a dateTime, the time it was performed. If specimens were taken, the clinically relevant time of the report can be derived from the specimen collection times, but since detailed specimen information is not always available, and nor is the clinically relevant time always exactly the specimen collection time (e.g. complex timed tests), the reports SHALL always include an effective[x] element.

  - name: DiagnosticReport.effectivePeriod
    flags: [Σ]
    cardinality: 0..1 # Choice with effectiveDateTime
    type: Period
    description: The time or time-period the observed values are related to. When the subject of the report is a patient, this is usually either the time of the procedure or of specimen collection(s), but very often the source of the date/time is not known, only the date/time itself.
    short: Clinically relevant time/time-period for report
    comments: If the diagnostic procedure was performed on the patient directly, the effective[x] element is a dateTime, the time it was performed. If specimens were taken, the clinically relevant time of the report can be derived from the specimen collection times, but since detailed specimen information is not always available, and nor is the clinically relevant time always exactly the specimen collection time (e.g. complex timed tests), the reports SHALL always include an effective[x] element.

  - name: DiagnosticReport.issued
    flags: [Σ]
    cardinality: 0..1
    type: instant
    description: The date and time that this version of the report was made available to providers, typically after the report was reviewed and verified.
    short: DateTime this version was made

  - name: DiagnosticReport.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam)
    description: The diagnostic service that is responsible for issuing the report.
    short: Responsible Diagnostic Service

  - name: DiagnosticReport.resultsInterpreter
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam)
    description: The practitioner or organization that is responsible for the report's conclusions and interpretations.
    short: Primary result interpreter

  - name: DiagnosticReport.specimen
    cardinality: 0..*
    type: Reference(Specimen)
    description: Details about the specimens on which this diagnostic report is based.
    short: Specimens this report is based on

  - name: DiagnosticReport.result
    cardinality: 0..*
    type: Reference(Observation)
    description: "[Observations](observation.html) that are part of this diagnostic report."
    short: Observations
    comments: These Observations can be simple observations (e.g. atomic results) or groups/panels of other observations. The Observation.code indicates the nature of the observation or panel. There is rarely a need for more than two levels of nesting in the Observation tree.

  - name: DiagnosticReport.imagingStudy
    cardinality: 0..*
    type: Reference(ImagingStudy)
    description: One or more links to full details of any imaging performed during the diagnostic investigation. Typically, this is imaging performed by DICOM enabled modalities, but this is not required. A fully enabled PACS viewer can use this information to provide views of the source images.
    short: Reference to full details of imaging associated with the diagnostic report
    comments: ImagingStudy and the media element are somewhat overlapping - typically, the list of image references in the media element will also be found in one of the imaging study resources. Neither, either, or both may be provided.

  - name: DiagnosticReport.media
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: A list of key images associated with this report. The images are generally created during the diagnostic process, and may be directly of the patient, or of treated specimens (i.e. slides of interest).
    short: Key images associated with this report

  - name: DiagnosticReport.media.comment
    cardinality: 0..1
    type: string
    description: A comment about the image. Typically, this is used to provide an explanation for why the image is included, or to draw the viewer's attention to important features.
    short: Comment about the image (e.g. explanation)

  - name: DiagnosticReport.media.link
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Media)
    description: Reference to the image source.
    short: Reference to the image source

  - name: DiagnosticReport.conclusion
    cardinality: 0..1
    type: string
    description: Concise and clinically contextualized summary conclusion (interpretation/impression) of the diagnostic report.
    short: Clinical conclusion (interpretation) of test results

  - name: DiagnosticReport.conclusionCode
    cardinality: 0..*
    type: CodeableConcept
    description: One or more codes that represent the summary conclusion (interpretation/impression) of the diagnostic report.
    short: Codes for the clinical conclusion of test results
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/clinical-findings
      strength: example

  - name: DiagnosticReport.presentedForm
    cardinality: 0..*
    type: Attachment
    description: Rich text representation of the entire result as issued by the diagnostic service. Multiple formats are allowed but they SHALL be semantically equivalent.
    short: Entire report as issued
    comments: "'application/pdf' is recommended as the most reliable and interoperable in this context."
```

```yaml
constraints: []
```

## Search Parameters

Search parameters defined for the DiagnosticReport resource:

```yaml
searchParameters:
  - name: based-on
    type: reference
    description: Reference to the service request.
    expression: DiagnosticReport.basedOn
    targets: [CarePlan, MedicationRequest, NutritionOrder, ServiceRequest, ImmunizationRecommendation]
  - name: category
    type: token
    description: Which diagnostic discipline/department created the report
    expression: DiagnosticReport.category
  - name: code
    type: token
    description: The code for the report, as opposed to codes for the atomic results, which are the names on the observation resource referred to from the result
    expression: DiagnosticReport.code
  - name: conclusion
    type: token
    description: A coded conclusion (interpretation/impression) on the report
    expression: DiagnosticReport.conclusionCode
  - name: date
    type: date
    description: The clinically relevant time of the report
    expression: DiagnosticReport.effective # Corresponds to effectiveDateTime or effectivePeriod
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
    targets: [Media]
  - name: patient
    type: reference
    description: The subject of the report if a patient
    expression: DiagnosticReport.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Who is responsible for the report
    expression: DiagnosticReport.performer
    targets: [Practitioner, Organization, CareTeam, PractitionerRole]
  - name: result
    type: reference
    description: Link to an atomic result (observation resource)
    expression: DiagnosticReport.result
    targets: [Observation]
  - name: results-interpreter
    type: reference
    description: Who was the source of the report
    expression: DiagnosticReport.resultsInterpreter
    targets: [Practitioner, Organization, CareTeam, PractitionerRole]
  - name: specimen
    type: reference
    description: The specimen details
    expression: DiagnosticReport.specimen
    targets: [Specimen]
  - name: status
    type: token
    description: The status of the report
    expression: DiagnosticReport.status
  - name: subject
    type: reference
    description: The subject of the report
    expression: DiagnosticReport.subject
    targets: [Group, Device, Patient, Location]
```