Okay, here is the FHIR Observation resource definition (version R4) presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Observation

```yaml
resource:
  name: Observation
  hl7_workgroup: Orders and Observations
  maturity_level: 5 # N (Normative) corresponds to level 5
  standard_status: Normative
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

Measurements and simple assertions made about a patient, device, or other subject.

## Scope and Usage

Observations are central to healthcare, supporting diagnosis, monitoring progress, determining baselines, and capturing various characteristics. They typically represent simple name/value pairs with associated metadata.

**Key Use Cases:**

*   **Vital Signs:** Body weight, blood pressure, temperature.
*   **Laboratory Data:** Blood glucose, eGFR.
*   **Imaging Results:** Bone density, fetal measurements (often linked via DiagnosticReport).
*   **Clinical Findings:** Abdominal tenderness (boundary with Condition can be subtle).
*   **Device Measurements:** EKG data, Pulse Oximetry.
*   **Clinical Assessment Tools:** APGAR scores, Glasgow Coma Scale.
*   **Personal Characteristics:** Eye color.
*   **Social History:** Tobacco use, family support, cognitive status.
*   **Core Characteristics:** Pregnancy status, death assertion.

**Grouping Observations:**

*   **DiagnosticReport:** Provides clinical/workflow context for a set of Observations (e.g., lab reports). Observations are referenced via `DiagnosticReport.result`.
*   **Observation.component:** Used for tightly coupled results interpreted together (e.g., systolic/diastolic BP). All components share metadata like method, performer, time.
*   **Observation.hasMember / Observation.derivedFrom:** Used to link independent Observation resources (e.g., BMI derived from separate height and weight Observations).

**Core Profiles:**

*   **Vital Signs:** Defines minimum expectations for recording vital signs using the Observation resource.

## Boundaries and Relationships

*   **Observation vs. Other Resources:** Observation is for measurements and point-in-time assessments. Use specialized resources when available (e.g., `AllergyIntolerance`, `MedicationStatement`, `Condition`, `Procedure`, `QuestionnaireResponse`). In cases of ambiguity or source system limitations (like V2 feeds), data might appear in Observation even if another resource is technically more appropriate.
*   **Observation vs. Media:** Use `Media` for observations whose value is audio, video, or image data.
*   **Observation vs. DiagnosticReport:** `DiagnosticReport` provides broader context (clinical interpretation, narrative, order linkage) and references `Observation` resources for atomic results. Laboratory, pathology, and imaging reports are typically represented as `DiagnosticReport`.
*   **Observation vs. ClinicalImpression:** Summative impressions or interpretations, sometimes included in `Observation` or `DiagnosticReport` from labs, are distinct from the broader clinical reasoning process captured in `ClinicalImpression`.

## Resource Details

The following defines the core elements and constraints of the Observation resource.

```yaml
elements:
  - name: Observation
    type: DomainResource
    description: Measurements and simple assertions made about a patient, device or other subject.
    short: Measurements and simple assertions
    comments: Used for simple observations such as device measurements, laboratory atomic results, vital signs, height, weight, smoking status, comments, etc. Other resources are used to provide context for observations such as laboratory reports, etc.

  - name: Observation.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: A unique identifier assigned to this observation.
    short: Business Identifier for observation

  - name: Observation.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | DeviceRequest | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest)
    description: A plan, proposal or order that is fulfilled in whole or in part by this event. For example, a MedicationRequest may require a patient to have laboratory test performed before it is dispensed.
    short: Fulfills plan, proposal or order

  - name: Observation.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(MedicationAdministration | MedicationDispense | MedicationStatement | Procedure | Immunization | ImagingStudy)
    description: A larger event of which this particular Observation is a component or step. For example, an observation as part of a procedure.
    short: Part of referenced event
    comments: To link an Observation to an Encounter use `encounter`. See the Notes section for guidance on referencing another Observation.

  - name: Observation.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the result value.
    short: registered | preliminary | final | amended +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid

  - name: Observation.category
    cardinality: 0..*
    type: CodeableConcept
    description: A code that classifies the general type of observation being made.
    short: Classification of type of observation
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-category
      strength: preferred
    comments: In addition to the required category valueset, this element allows various categorization schemes based on the owner’s definition of the category and effectively multiple categories can be used at once. The level of granularity is defined by the category concepts in the value set.

  - name: Observation.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Describes what was observed. Sometimes this is called the observation "name".
    short: Type of observation (code / type)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes
      strength: example
    comments: All code-value and, if present, component.code-component.value pairs need to be taken into account to correctly understand the meaning of the observation.

  - name: Observation.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group | Device | Location)
    description: The patient, or group of patients, location, or device this observation is about and into whose record the observation is placed. If the actual focus of the observation is different from the subject (or a sample of, part, or region of the subject), the `focus` element or the `code` itself specifies the actual focus of the observation.
    short: Who and/or what the observation is about
    comments: One would expect this element to be a cardinality of 1..1. The only circumstance in which the subject can be missing is when the observation is made by a device that does not know the patient. In this case, the observation SHALL be matched to a patient through some context/channel matching technique, and at this point, the observation should be updated.

  - name: Observation.focus
    flags: [Σ, TU, ?!] # Added ?! as it's a modifier in R5, implies potential modifier nature in R4 contextually.
    cardinality: 0..*
    type: Reference(Any)
    description: The actual focus of an observation when it is not the patient of record representing something or someone associated with the patient such as a spouse, parent, fetus, or donor. For example, fetus observations in a mother's record. The focus of an observation could also be an existing condition, an intervention, the subject's diet, another observation of the subject, or a body structure such as tumor or implanted device. An example use case would be using the Observation resource to capture whether the mother is trained to change her child's tracheostomy tube. In this example, the child is the patient of record and the mother is the focus.
    short: What the observation is about, when it is not about the subject of record
    isModifier: true # Implicitly modifier due to definition.
    modifierReason: This element changes the target of the observation from the primary subject.

  - name: Observation.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The healthcare event (e.g. a patient and healthcare provider interaction) during which this observation is made.
    short: Healthcare event during which this observation is made
    comments: This will typically be the encounter the event occurred within, but some events may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission laboratory tests).

  - name: Observation.effective[x]
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period | Timing | instant
    description: The time or time-period the observed value is asserted as being true. For biological subjects - e.g. human patients - this is usually called the "physiologically relevant time". This is usually either the time of the procedure or of specimen collection, but very often the source of the date/time is not known, only the date/time itself.
    short: Clinically relevant time/time-period for observation
    comments: At least a date should be present unless this observation is a historical report. For recording imprecise or "fuzzy" times (For example, a blood glucose measurement taken "after breakfast") use the Timing datatype which allow the measurement to be tied to regular life events.

  - name: Observation.issued
    flags: [Σ]
    cardinality: 0..1
    type: instant
    description: The date and time this version of the observation was made available to providers, typically after the results have been reviewed and verified.
    short: Date/Time this version was made available
    comments: For Observations that don't require review and verification, it may be the same as the lastUpdated time of the resource itself. For Observations that do require review and verification for certain updates, it might not be the same as the lastUpdated time of the resource itself due to a non-clinically significant update that doesn't require the new version to be reviewed and verified again.

  - name: Observation.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | RelatedPerson)
    description: Who was responsible for asserting the observed value as "true".
    short: Who is responsible for the observation

  - name: Observation.value[x]
    flags: [Σ]
    cardinality: 0..1
    type: Quantity | CodeableConcept | string | boolean | integer | Range | Ratio | SampledData | time | dateTime | Period
    description: The information determined as a result of making the observation, if the information has a simple value.
    short: Actual result
    comments: |
      * An observation may have:
        1. a single value here
        2. both a value and a set of related or component values
        3. only a set of related or component values.
      * If a value is present, the datatype for this element should be determined by the `code`.
      * `CodeableConcept` with just a text would be used instead of a string if the field was usually coded, or if the type associated with the `code` defines a coded value.
      * Attachment is used if the observation result value is a binary file such as an image. If the observation result value is derived from the binary file (for example 'X' detected and here is the the proof in this image), the binary file may be directly represented using DocumentReference and referenced by `derivedFrom`.
      * For additional guidance, see the Notes section in the FHIR specification.

  - name: Observation.dataAbsentReason
    cardinality: 0..1
    type: CodeableConcept
    description: Provides a reason why the expected value in the element Observation.value[x] is missing.
    short: Why the result value is missing
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/data-absent-reason
      strength: extensible
    comments: Null or exceptional values can be represented two ways in FHIR Observations. One way is to simply include them in the value set and represent the exceptions in the value. The alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values. For example, the dataAbsentReason code "error" could be used when the measurement was not completed.

  - name: Observation.interpretation
    cardinality: 0..*
    type: CodeableConcept
    description: A categorical assessment of an observation value. For example, high, low, normal.
    short: High, low, normal, etc.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-interpretation
      strength: extensible
    comments: Historically used for laboratory results (known as 'abnormal flag'), its use extends to other use cases where coded interpretations are relevant. Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.

  - name: Observation.note
    cardinality: 0..*
    type: Annotation
    description: Comments about the observation or the results.
    short: Comments about the observation
    comments: May include general statements about the observation, or statements about significant, unexpected or unreliable results values, or information about its source when relevant to its interpretation.

  - name: Observation.bodySite
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the site on the subject's body where the observation was made (i.e. the target site).
    short: Observed body part
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site
      strength: example
    comments: Only used if not implicit in code found in Observation.code. In many systems, this may be represented as a related observation instead of an inline component.

  - name: Observation.method
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates the mechanism used to perform the observation.
    short: How it was done
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-methods
      strength: example
    comments: Only used if not implicit in code for Observation.code.

  - name: Observation.specimen
    cardinality: 0..1
    type: Reference(Specimen)
    description: The specimen that was used when this observation was made.
    short: Specimen used for this observation
    comments: Should only be used if not implicit in code found in `Observation.code`. Observations are not made on specimens themselves; they are made on a subject, but in many cases by the means of a specimen.

  - name: Observation.device
    cardinality: 0..1
    type: Reference(Device | DeviceMetric)
    description: The device used to generate the observation data.
    short: (Measurement) Device
    comments: Note that this is not meant to represent a device involved in the transmission of the result, e.g., a gateway. Such devices may be documented using the Provenance resource where relevant.

  - name: Observation.referenceRange
    cardinality: 0..*
    type: BackboneElement
    description: Guidance on how to interpret the value by comparison to a normal or recommended range. Multiple reference ranges are interpreted as an "OR". In other words, to represent two distinct target populations, two `referenceRange` elements would be used.
    short: Provides guide for interpretation
    comments: Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.

  - name: Observation.referenceRange.low
    cardinality: 0..1
    type: SimpleQuantity
    description: The value of the low bound of the reference range. The low bound of the reference range endpoint is inclusive of the value (e.g. reference range is >=5 - <=9). If the low bound is omitted, it is assumed to be meaningless (e.g. reference range is <=2.3).
    short: Low Range, if relevant

  - name: Observation.referenceRange.high
    cardinality: 0..1
    type: SimpleQuantity
    description: The value of the high bound of the reference range. The high bound of the reference range endpoint is inclusive of the value (e.g. reference range is >=5 - <=9). If the high bound is omitted, it is assumed to be meaningless (e.g. reference range is >= 2.3).
    short: High Range, if relevant

  - name: Observation.referenceRange.type
    cardinality: 0..1
    type: CodeableConcept
    description: Codes to indicate the what part of the targeted reference population it applies to. For example, the normal or therapeutic range.
    short: Reference range qualifier
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/referencerange-meaning
      strength: preferred
    comments: This SHOULD be populated if there is more than one range. If this element is not present then the normal range is assumed.

  - name: Observation.referenceRange.appliesTo
    cardinality: 0..*
    type: CodeableConcept
    description: Codes to indicate the target population this reference range applies to. For example, a reference range may be based on the normal population or a particular sex or race. Multiple `appliesTo` are interpreted as an "AND" of the target populations. For example, to represent a target population of African American females, both a code of female and a code for African American would be used.
    short: Reference range population
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/referencerange-appliesto
      strength: example
    comments: This SHOULD be populated if there is more than one range. If this element is not present then the normal population is assumed.

  - name: Observation.referenceRange.age
    cardinality: 0..1
    type: Range
    description: The age at which this reference range is applicable. This is a neonatal age (e.g. number of weeks at term) if the meaning says so.
    short: Applicable age range, if relevant

  - name: Observation.referenceRange.text
    cardinality: 0..1
    type: string
    description: Text based reference range in an observation which may be used when a quantitative range is not appropriate for an observation. An example would be a reference value of "Negative" or a list or table of "normals".
    short: Text based reference range in an observation

  - name: Observation.hasMember
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Observation | QuestionnaireResponse | MolecularSequence)
    description: This observation is a group observation (e.g. a battery, a panel of tests, a set of vital sign measurements) that includes the target as a member of the group.
    short: Related resource that belongs to the Observation group
    comments: When using this element, an observation will typically have either a value or a set of related resources, although both may be present in some cases. For a discussion on the ways Observations can assembled in groups together, see Notes section.

  - name: Observation.derivedFrom
    flags: [Σ]
    cardinality: 0..*
    type: Reference(DocumentReference | ImagingStudy | Media | QuestionnaireResponse | Observation | MolecularSequence)
    description: The target resource that represents a measurement from which this observation value is derived. For example, a calculated anion gap or a fetal measurement based on an ultrasound image.
    short: Related measurements the observation is made from
    comments: All the reference choices that are listed in this element can represent clinical observations and other measurements that may be the source for a derived value. The most common reference will be another Observation.

  - name: Observation.component
    flags: [Σ]
    cardinality: 0..*
    type: BackboneElement
    description: Some observations have multiple component observations. These component observations are expressed as separate code value pairs that share the same attributes. Examples include systolic and diastolic component observations for blood pressure measurement and multiple component observations for genetics observations.
    short: Component results
    comments: For a discussion on the ways Observations can be assembled in groups together see Notes section.

  - name: Observation.component.code
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: Describes what was observed. Sometimes this is called the observation "code".
    short: Type of component observation (code / type)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes
      strength: example
    comments: All code-value and component.code-component.value pairs need to be taken into account to correctly understand the meaning of the observation.

  - name: Observation.component.value[x]
    flags: [Σ]
    cardinality: 0..1
    type: Quantity | CodeableConcept | string | boolean | integer | Range | Ratio | SampledData | time | dateTime | Period
    description: The information determined as a result of making the observation, if the information has a simple value.
    short: Actual component result
    comments: Used when observation has a set of component observations. An observation may have both a value (e.g. an Apgar score) and component observations (the observations from which the Apgar score was derived). If a value is present, the datatype for this element should be determined by the code.

  - name: Observation.component.dataAbsentReason
    cardinality: 0..1
    type: CodeableConcept
    description: Provides a reason why the expected value in the element Observation.component.value[x] is missing.
    short: Why the component result value is missing
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/data-absent-reason
      strength: extensible
    comments: "Null" or exceptional values can be represented two ways in FHIR Observations. One way is to simply include them in the value set and represent the exceptions in the value. The alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values.

  - name: Observation.component.interpretation
    cardinality: 0..*
    type: CodeableConcept
    description: A categorical assessment of an observation value. For example, high, low, normal.
    short: High, low, normal, etc.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-interpretation
      strength: extensible
    comments: Historically used for laboratory results (known as 'abnormal flag'), its use extends to other use cases where coded interpretations are relevant.

  - name: Observation.component.referenceRange
    cardinality: 0..*
    type: BackboneElement # Reuses the structure of Observation.referenceRange
    description: Guidance on how to interpret the value by comparison to a normal or recommended range.
    short: Provides guide for interpretation of component result value
    comments: Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient.

constraints:
  - key: obs-3
    severity: Rule
    location: Observation.referenceRange
    description: Must have at least a low or a high or text
    expression: low.exists() or high.exists() or text.exists()
  - key: obs-6
    severity: Rule
    location: (base) # Applies to the Observation resource itself
    description: dataAbsentReason SHALL only be present if Observation.value[x] is not present
    expression: dataAbsentReason.empty() or value.empty()
  - key: obs-7
    severity: Rule
    location: (base) # Applies to the Observation resource itself
    description: If Observation.code is the same as an Observation.component.code then the value element associated with the code SHALL NOT be present
    expression: value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()

```

## Search Parameters

Search parameters defined for the Observation resource:

```yaml
searchParameters:
  - name: based-on
    type: reference
    description: Reference to the service request.
    expression: Observation.basedOn
    targets: [CarePlan, DeviceRequest, ImmunizationRecommendation, MedicationRequest, NutritionOrder, ServiceRequest]
  - name: category
    type: token
    description: The classification of the type of observation
    expression: Observation.category
  - name: code
    type: token
    description: The code of the observation type
    expression: Observation.code
  - name: code-value-concept
    type: composite
    description: Code and coded value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-concept
        expression: value.as(CodeableConcept)
  - name: code-value-date
    type: composite
    description: Code and date/time value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-date
        expression: value.as(DateTime) | value.as(Period)
  - name: code-value-quantity
    type: composite
    description: Code and quantity value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-quantity
        expression: value.as(Quantity)
  - name: code-value-string
    type: composite
    description: Code and string value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-string
        expression: value.as(string)
  - name: combo-code
    type: token
    description: The code of the observation type or component type
    expression: Observation.code | Observation.component.code
  - name: combo-code-value-concept
    type: composite
    description: Code and coded value parameter pair, including in components
    components:
      - definition: combo-code # Assumed based on pattern, confirm actual component name if specified elsewhere
        expression: code
      - definition: combo-value-concept # Assumed based on pattern
        expression: value.as(CodeableConcept)
  - name: combo-code-value-quantity
    type: composite
    description: Code and quantity value parameter pair, including in components
    components:
      - definition: combo-code # Assumed based on pattern
        expression: code
      - definition: combo-value-quantity # Assumed based on pattern
        expression: value.as(Quantity)
  - name: combo-data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.value[x] or Observation.component.value[x] is missing.
    expression: Observation.dataAbsentReason | Observation.component.dataAbsentReason
  - name: combo-value-concept
    type: token
    description: The value or component value of the observation, if the value is a CodeableConcept
    expression: (Observation.value as CodeableConcept) | (Observation.component.value as CodeableConcept)
  - name: combo-value-quantity
    type: quantity
    description: The value or component value of the observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: (Observation.value as Quantity) | (Observation.value as SampledData) | (Observation.component.value as Quantity) | (Observation.component.value as SampledData)
  - name: component-code
    type: token
    description: The component code of the observation type
    expression: Observation.component.code
  - name: component-code-value-concept
    type: composite
    description: Component code and component coded value parameter pair
    components:
      - definition: component-code
        expression: code
      - definition: component-value-concept
        expression: value.as(CodeableConcept)
  - name: component-code-value-quantity
    type: composite
    description: Component code and component quantity value parameter pair
    components:
      - definition: component-code
        expression: code
      - definition: component-value-quantity
        expression: value.as(Quantity)
  - name: component-data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.component.value[x] is missing.
    expression: Observation.component.dataAbsentReason
  - name: component-value-concept
    type: token
    description: The value of the component observation, if the value is a CodeableConcept
    expression: (Observation.component.value as CodeableConcept)
  - name: component-value-quantity
    type: quantity
    description: The value of the component observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: (Observation.component.value as Quantity) | (Observation.component.value as SampledData)
  - name: data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.value[x] is missing.
    expression: Observation.dataAbsentReason
  - name: date
    type: date
    description: Obtained date/time. If the obtained element is a period, a date that falls in the period
    expression: Observation.effective # effective[x] covers dateTime, Period, Timing, instant
  - name: derived-from
    type: reference
    description: Related measurements the observation is made from
    expression: Observation.derivedFrom
    targets: [DocumentReference, ImagingStudy, Media, QuestionnaireResponse, Observation, MolecularSequence] # Note: R5 adds GenomicStudy, ImagingSelection
  - name: device
    type: reference
    description: The Device that generated the observation data.
    expression: Observation.device
    targets: [Device, DeviceMetric]
  - name: encounter
    type: reference
    description: Encounter related to the observation
    expression: Observation.encounter
    targets: [Encounter]
  - name: focus
    type: reference
    description: The focus of an observation when the focus is not the patient of record.
    expression: Observation.focus
    targets: [Any] # Focus can be any resource type
  - name: has-member
    type: reference
    description: Related resource that belongs to the Observation group
    expression: Observation.hasMember
    targets: [Observation, QuestionnaireResponse, MolecularSequence]
  - name: identifier
    type: token
    description: The unique id for a particular observation
    expression: Observation.identifier
  - name: method
    type: token
    description: The method used for the observation
    expression: Observation.method
  - name: part-of
    type: reference
    description: Part of referenced event
    expression: Observation.partOf
    targets: [MedicationAdministration, MedicationDispense, MedicationStatement, Procedure, Immunization, ImagingStudy] # Note: R5 adds GenomicStudy
  - name: patient
    type: reference
    description: The subject that the observation is about (if patient)
    expression: Observation.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Who performed the observation
    expression: Observation.performer
    targets: [Practitioner, PractitionerRole, Organization, CareTeam, Patient, RelatedPerson] # Note: R5 adds HealthcareService
  - name: specimen
    type: reference
    description: Specimen used for this observation
    expression: Observation.specimen
    targets: [Specimen] # Note: R5 adds Group
  - name: status
    type: token
    description: The status of the observation
    expression: Observation.status
  - name: subject
    type: reference
    description: The subject that the observation is about
    expression: Observation.subject
    targets: [Patient, Group, Device, Location] # Note: R5 adds Organization, Procedure, Practitioner, Medication, Substance, BiologicallyDerivedProduct, NutritionProduct
  - name: value-concept
    type: token
    description: The value of the observation, if the value is a CodeableConcept
    expression: (Observation.value as CodeableConcept)
  - name: value-date
    type: date
    description: The value of the observation, if the value is a date or period of time
    expression: (Observation.value as dateTime) | (Observation.value as Period)
  - name: value-quantity
    type: quantity
    description: The value of the observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: (Observation.value as Quantity) | (Observation.value as SampledData)
  - name: value-string
    type: string
    description: The value of the observation, if the value is a string, and also searches in CodeableConcept.text
    expression: (Observation.value as string) | (Observation.value as CodeableConcept).text

```