```markdown
# FHIR Resource: Observation

```yaml
resource:
  name: Observation
  hl7_workgroup: Orders and Observations
  maturity_level: N # Normative
  standard_status: Normative # (from v4.0.0)
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Group
    - Patient
    - Practitioner
    - RelatedPerson
```

Measurements and simple assertions made about a patient, device or other subject.

## Background and Scope

The Observation resource is a fundamental part of healthcare, representing measurements, simple assertions, and characteristics about a subject (patient, device, location, group, substance, etc.). It's an event resource in the FHIR workflow context.

Key use cases include:

*   **Vital Signs:** Body weight, blood pressure, temperature.
*   **Laboratory Data:** Blood glucose, eGFR.
*   **Imaging Results:** Bone density, fetal measurements.
*   **Clinical Findings:** Abdominal tenderness (though boundaries with Condition exist).
*   **Device Measurements:** EKG, Pulse Oximetry.
*   **Device Settings:** Ventilator parameters.
*   **Clinical Assessments:** APGAR scores, Glasgow Coma Scores.
*   **Personal/Social History:** Eye color, tobacco use, pregnancy status, death assertion.
*   **Product/Substance Testing:** pH, Assay results for products.

**Core Profiles:** Implementations using Observation for vital signs concepts **SHALL** conform to the <a href="observation-vitalsigns.html">Vital Signs profiles</a>.

**Boundaries and Relationships:**

*   **Observation vs. Other Resources:** Observation is for measurements and point-in-time assessments. It should *not* be used for contexts covered by more specific resources like `AllergyIntolerance`, `MedicationStatement`, `FamilyMemberHistory`, `Procedure`, or `QuestionnaireResponse`.
*   **Observation vs. Condition:** `Condition` is for clinical diagnoses. `Observation` often provides supporting evidence (symptoms, specific findings) referenced by a `Condition`. Simple symptoms are typically Observations unless they warrant independent management. Overlap exists, and profiling clarifies boundaries. V2 migration might necessitate using Observation for data where the specific type (diagnosis, allergy) isn't known.
*   **Observation vs. DiagnosticReport:** `DiagnosticReport` provides the clinical/workflow context for a set of observations (e.g., lab reports, imaging reports). Observations are referenced *within* a DiagnosticReport to represent the atomic results. Interpretations or summaries might appear in either, depending on workflow, but formal diagnoses belong in `Condition` or `ClinicalAssessment`.
*   **Observation vs. ObservationDefinition:** An Observation instance can instantiate an `ObservationDefinition`, inheriting definitional properties.
*   **Observation Grouping:** Observations can be grouped using:
    *   `DiagnosticReport.result`: Links individual observations to a report/panel.
    *   `Observation.component`: For tightly coupled results sharing metadata (e.g., systolic/diastolic BP). Components are not independent.
    *   `Observation.hasMember`: Links independent observations into a panel or battery, where the parent Observation acts as a grouper (`organizer` = true).
    *   `Observation.derivedFrom`: Links an observation to the source measurement(s) it was calculated from (e.g., BMI derived from height and weight).
*   **New `organizer` element (Trial Use):** Explicitly flags an Observation instance as a grouper for sub-observations (like panels), primarily for laboratory use but applicable elsewhere. When `organizer` is true, `value[x]`, `dataAbsentReason`, and `component` should not be present.

## Resource Details

```yaml
elements:
  - name: Observation
    short: Measurements and simple assertions
    description: Measurements and simple assertions made about a patient, device or other subject.
    type: DomainResource

  - name: Observation.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    short: Business Identifier for observation
    description: A unique identifier assigned to this observation.

  - name: Observation.instantiates[x]
    flags: [Σ, TU]
    cardinality: 0..1
    type: canonical(ObservationDefinition) | Reference(ObservationDefinition)
    short: Instantiates FHIR ObservationDefinition
    description: The reference to a FHIR ObservationDefinition resource that provides the definition that is adhered to in whole or in part by this Observation instance.
    comments: ObservationDefinition can be referenced by its canonical url using instantiatesCanonical, or by a name or an identifier using the appropriate sub-elements of instantiatesReference.

  - name: Observation.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | DeviceRequest | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest)
    short: Fulfills plan, proposal or order
    description: A plan, proposal or order that is fulfilled in whole or in part by this event.  For example, a MedicationRequest may require a patient to have laboratory test performed before  it is dispensed.

  - name: Observation.triggeredBy
    flags: [TU]
    cardinality: 0..*
    type: BackboneElement
    short: Triggering observation(s)
    description: Identifies the observation(s) that triggered the performance of this observation.

  - name: Observation.triggeredBy.observation
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Observation)
    short: Triggering observation
    description: Reference to the triggering observation.

  - name: Observation.triggeredBy.type
    flags: [Σ]
    cardinality: 1..1
    type: code
    short: reflex | repeat | re-run
    description: |-
      The type of trigger.
      Reflex | Repeat | Re-run.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-triggeredbytype
      strength: required

  - name: Observation.triggeredBy.reason
    cardinality: 0..1
    type: string
    short: Reason that the observation was triggered
    description: Provides the reason why this observation was performed as a result of the observation(s) referenced.

  - name: Observation.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(MedicationAdministration | MedicationDispense | MedicationStatement | Procedure | Immunization | ImagingStudy | GenomicStudy)
    short: Part of referenced event
    description: A larger event of which this particular Observation is a component or step.  For example,  an observation as part of a procedure.
    comments: To link an Observation to an Encounter use `encounter`. See the Notes section for guidance on referencing another Observation.

  - name: Observation.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    short: registered | specimen-in-process | preliminary | final | amended | corrected | appended | cancelled | entered-in-error | unknown | cannot-be-obtained
    description: The status of the result value.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This element is labeled as a modifier because the status contains codes that mark the resource as not currently valid.

  - name: Observation.category
    cardinality: 0..*
    type: CodeableConcept
    short: Classification of type of observation
    description: A code that classifies the general type of observation being made.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-category
      strength: preferred
    comments: In addition to the required category valueset, this element allows various categorization schemes based on the owner’s definition of the category and effectively multiple categories can be used at once. The level of granularity is defined by the category concepts in the value set.

  - name: Observation.code
    flags: [Σ, C]
    cardinality: 1..1
    type: CodeableConcept
    short: Type of observation (code / type)
    description: Describes what was observed. Sometimes this is called the observation "name".
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes # LOINC Codes
      strength: example
    comments: '*All* code-value and, if present, component.code-component.value pairs need to be taken into account to correctly understand the meaning of the observation.'

  - name: Observation.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Group | Device | Location | Organization | Procedure | Practitioner | Medication | Substance | BiologicallyDerivedProduct | NutritionProduct)
    short: Who and/or what the observation is about
    description: The patient, or group of patients, location, device, organization, procedure or practitioner this observation is about and into whose or what record the observation is placed. If the actual focus of the observation is different from the subject (or a sample of, part, or region of the subject), the `focus` element or the `code` itself specifies the actual focus of the observation.
    comments: One would expect this element to be a cardinality of 1..1. The only circumstance in which the subject can be missing is when the observation is made by a device that does not know the patient. In this case, the observation SHALL be matched to a patient through some context/channel matching technique, and at this point, the observation should be updated. The subject of an Observation may in some cases be a procedure. This supports the regulatory inspection use case where observations are captured during inspections of a procedure that is being performed (independent of any particular patient or whether patient related at all).

  - name: Observation.focus
    flags: [?!, Σ, TU]
    cardinality: 0..*
    type: Reference(Any)
    short: What the observation is about, when it is not about the subject of record
    description: The actual focus of an observation when it is not the subject of record representing something or someone associated with the patient such as a spouse, parent, fetus, or donor. For example, fetus observations in a mother's record. The focus of an observation could also be an existing condition, an intervention, the subject's diet, another observation of the subject, or a body structure such as tumor or implanted device. An example use case would be using the Observation resource to capture whether the mother is trained to change her child's tracheostomy tube. In this example, the child is the patient of record and the mother is the focus. As another use case, a caregiver (RelatedPerson) has back strain and is unable to provide ADL support to a patient (Subject).
    isModifier: true
    modifierReason: This element is labeled as a modifier because it changes who is the target of the observation. See the use cases in the definition.
    comments: |-
      Examples demonstrating the use of subject and focus in an Observation:
      * A parent is trained to change their child's tracheostomy tube. The child is the subject, and the parent is the focus.
      * A fetal heart rate recorded in a mother's record. The mother is the subject, and the fetus is the focus.
      * Features of a body structure, such as a tumor. The patient is the subject, and the specific body structure is the focus.
      * Metrics captured from a medical device. The patient-attached device is the subject, the specific device metric is the focus, and the observing device itself is referenced in .device.

  - name: Observation.organizer
    flags: [Σ, C, TU]
    cardinality: 0..1
    type: boolean
    short: This observation organizes/groups a set of sub-observations
    description: This observation serves as an organizer or grouper for a set of (one or more) sub-observations.
    comments: An observation that is an organizer/grouper does not have a value (or dataAbsentReason) of its own - all values are included in the sub-observations. The sub-observations are linked using hasMember element references (in some instances there may be no hasMember references, as it is possible that the organizer/grouper observation may be created first, and the sub-observations are not created until a later time). An organizer/grouper observation also does not contain any components.

  - name: Observation.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    short: Healthcare event during which this observation is made
    description: The healthcare event (e.g. a patient and healthcare provider interaction) during which this observation is made.
    comments: This will typically be the encounter the event occurred within, but some events may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission laboratory tests).

  - name: Observation.effective[x]
    flags: [Σ]
    cardinality: 0..1
    type: dateTime | Period | Timing | instant
    short: Clinically relevant time/time-period for observation
    description: The time or time-period the observed value is asserted as being true. For biological subjects - e.g. human patients - this is usually called the "physiologically relevant time". This is usually either the time of the procedure or of specimen collection, but very often the source of the date/time is not known, only the date/time itself.
    comments: At least a date should be present unless this observation is a historical report. For recording imprecise or "fuzzy" times (For example, a blood glucose measurement taken "after breakfast") use the Timing datatype which allow the measurement to be tied to regular life events.

  - name: Observation.issued
    flags: [Σ]
    cardinality: 0..1
    type: instant
    short: Date/Time this version was made available
    description: The date and time this version of the observation was made available to providers, typically after the results have been reviewed and verified.
    comments: For Observations that don't require review and verification, it may be the same as the `lastUpdated` time of the resource itself. For Observations that do require review and verification for certain updates, it might not be the same as the `lastUpdated` time of the resource itself due to a non-clinically significant update that doesn't require the new version to be reviewed and verified again.

  - name: Observation.performer
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Practitioner | PractitionerRole | Organization | CareTeam | Patient | RelatedPerson | HealthcareService)
    short: Who is responsible for the observation
    description: Who was responsible for asserting the observed value as "true".

  - name: Observation.value[x]
    flags: [Σ, C]
    cardinality: 0..1
    type: Quantity | CodeableConcept | string | boolean | integer | Range | Ratio | SampledData | time | dateTime | Period | Attachment | Reference(MolecularSequence)
    short: Actual result
    description: The information determined as a result of making the observation, if the information has a simple value.
    comments: |-
      * An observation may have:
        1. a single value here
        2. both a value and a set of related or component values
        3. only a set of related or component values.
      * If a value is present, the datatype for this element should be determined by the `code`.
      * *CodeableConcept* with just a text would be used instead of a string if the field was usually coded, or if the type associated with the `code` defines a coded value.
      * *Attachment* is used if the observation result value is a binary file such as an image. If the observation result value is derived from the binary file (for example 'X' detected and here is the the proof in this image), the binary file may be directly represented using *DocumentReference* and referenced by `derivedFrom`.
      * The usage of valueReference is restricted to the MolecularSequence resource when used as a definitional resource, not as a patient-specific finding. .
      * For additional guidance, see the Notes section in the main documentation.

  - name: Observation.dataAbsentReason
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    short: Why the result value is missing
    description: Provides a reason why the expected value in the element Observation.value[x] is missing.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/data-absent-reason
      strength: extensible
    comments: |-
      Null or exceptional values can be represented two ways in FHIR Observations. One way is to simply include them in the value set and represent the exceptions in the value. For example, measurement values for a serology test could be "detected", "not detected", "inconclusive", or "specimen unsatisfactory".
      The alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values. For example, the dataAbsentReason code "error" could be used when the measurement was not completed.

  - name: Observation.interpretation
    cardinality: 0..*
    type: CodeableConcept
    short: High, low, normal, etc.
    description: A categorical assessment of an observation value. For example, high, low, normal.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-interpretation
      strength: extensible
    comments: Historically used for laboratory results (known as 'abnormal flag' ), its use extends to other use cases where coded interpretations are relevant. Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.

  - name: Observation.note
    cardinality: 0..*
    type: Annotation
    short: Comments about the observation
    description: Comments about the observation or the results.
    comments: May include general statements about the observation, or statements about significant, unexpected or unreliable results values, or information about its source when relevant to its interpretation.

  - name: Observation.bodySite
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    short: Observed body part
    description: Indicates the site on the subject's body where the observation was made (i.e. the target site).
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/body-site # SNOMED CT Body Structures
      strength: example
    comments: Only used if not implicit in code found in Observation.code. In many systems, this may be represented as a related observation instead of an inline component.

  - name: Observation.bodyStructure
    flags: [C, TU]
    cardinality: 0..1
    type: Reference(BodyStructure)
    short: Observed body structure
    description: Indicates the body structure on the subject's body where the observation was made (i.e. the target site).
    comments: Only used if not implicit in code found in Observation.code or bodySite is used. In many systems, this may be represented as a related observation instead of an inline component.

  - name: Observation.method
    cardinality: 0..1
    type: CodeableConcept
    short: How it was done
    description: Indicates the mechanism used to perform the observation.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-methods
      strength: example
    comments: Only used if not implicit in code for Observation.code.

  - name: Observation.specimen
    flags: [C]
    cardinality: 0..1
    type: Reference(Specimen | Group)
    short: Specimen used for this observation
    description: The specimen that was used when this observation was made.
    comments: Should only be used if not implicit in code found in `Observation.code`. Observations are not made on specimens themselves; they are made on a subject, but in many cases by the means of a specimen. Note that although specimens are often involved, they are not always tracked and reported explicitly. Also note that observation resources may be used in contexts that track the specimen explicitly (e.g. Diagnostic Report).

  - name: Observation.device
    cardinality: 0..1
    type: Reference(Device | DeviceMetric)
    short: A reference to the device that generates the measurements or the device settings for the device
    description: A reference to the device that generates the measurements or the device settings for the device.
    comments: Note that this is not meant to represent a device involved in the transmission of the result, e.g., a gateway. Such devices may be documented using the Provenance resource where relevant.

  - name: Observation.referenceRange
    flags: [C]
    cardinality: 0..*
    type: BackboneElement
    short: Provides guide for interpretation
    description: Guidance on how to interpret the value by comparison to a normal or recommended range. Multiple reference ranges are interpreted as an "OR". In other words, to represent two distinct target populations, two `referenceRange` elements would be used.
    comments: Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.

  - name: Observation.referenceRange.low
    flags: [C]
    cardinality: 0..1
    type: SimpleQuantity
    short: Low Range, if relevant
    description: The value of the low bound of the reference range. The low bound of the reference range endpoint is inclusive of the value (e.g. reference range is >=5 - <=9). If the low bound is omitted, it is assumed to be meaningless (e.g. reference range is <=2.3).

  - name: Observation.referenceRange.high
    flags: [C]
    cardinality: 0..1
    type: SimpleQuantity
    short: High Range, if relevant
    description: The value of the high bound of the reference range. The high bound of the reference range endpoint is inclusive of the value (e.g. reference range is >=5 - <=9). If the high bound is omitted, it is assumed to be meaningless (e.g. reference range is >= 2.3).

  - name: Observation.referenceRange.normalValue
    flags: [TU]
    cardinality: 0..1
    type: CodeableConcept
    short: Normal value, if relevant
    description: The value of the normal value of the reference range.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-referencerange-normalvalue
      strength: extensible

  - name: Observation.referenceRange.type
    flags: [TU]
    cardinality: 0..1
    type: CodeableConcept
    short: Reference range qualifier
    description: Codes to indicate the what part of the targeted reference population it applies to. For example, the normal or therapeutic range.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/referencerange-meaning
      strength: preferred
    comments: This SHOULD be populated if there is more than one range. If this element is not present then the normal range is assumed.

  - name: Observation.referenceRange.appliesTo
    cardinality: 0..*
    type: CodeableConcept
    short: Reference range population
    description: Codes to indicate the target population this reference range applies to. For example, a reference range may be based on the normal population or a particular sex or race. Multiple `appliesTo` are interpreted as an "AND" of the target populations. For example, to represent a target population of African American females, both a code of female and a code for African American would be used.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/referencerange-appliesto
      strength: example
    comments: This SHOULD be populated if there is more than one range. If this element is not present then the normal population is assumed.

  - name: Observation.referenceRange.age
    cardinality: 0..1
    type: Range
    short: Applicable age range, if relevant
    description: The age at which this reference range is applicable. This is a neonatal age (e.g. number of weeks at term) if the meaning says so.

  - name: Observation.referenceRange.text
    flags: [C]
    cardinality: 0..1
    type: markdown
    short: Text based reference range in an observation
    description: Text based reference range in an observation which may be used when a quantitative range is not appropriate for an observation. An example would be a reference value of "Negative" or a list or table of "normals".

  - name: Observation.hasMember
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Observation | QuestionnaireResponse | MolecularSequence)
    short: Related resource that belongs to the Observation group
    description: This observation is a group observation (e.g. a battery, a panel of tests, a set of vital sign measurements) that includes the target as a member of the group.
    comments: When using this element, an observation will typically have either a value or a set of related resources, although both may be present in some cases. For a discussion on the ways Observations can assembled in groups together, see Notes section. Note that a system may calculate results from QuestionnaireResponse into a final score and represent the score as an Observation.

  - name: Observation.derivedFrom
    flags: [Σ]
    cardinality: 0..*
    type: Reference(DocumentReference | ImagingStudy | ImagingSelection | QuestionnaireResponse | Observation | MolecularSequence | GenomicStudy)
    short: Related resource from which the observation is made
    description: The target resource that represents a measurement from which this observation value is derived. For example, a calculated anion gap or a fetal measurement based on an ultrasound image.
    comments: All the reference choices that are listed in this element can represent clinical observations and other measurements that may be the source for a derived value. The most common reference will be another Observation. For a discussion on the ways Observations can assembled in groups together, see Notes section.

  - name: Observation.component
    flags: [Σ, C]
    cardinality: 0..*
    type: BackboneElement
    short: Component results
    description: Some observations have multiple component observations. These component observations are expressed as separate code value pairs that share the same attributes. Examples include systolic and diastolic component observations for blood pressure measurement and multiple component observations for genetics observations.
    comments: For a discussion on the ways Observations can be assembled in groups together see Notes section.

  - name: Observation.component.code
    flags: [Σ, C]
    cardinality: 1..1
    type: CodeableConcept
    short: Type of component observation (code / type)
    description: Describes what was observed. Sometimes this is called the observation "code".
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-codes # LOINC Codes
      strength: example
    comments: '*All* code-value and component.code-component.value pairs need to be taken into account to correctly understand the meaning of the observation.'

  - name: Observation.component.value[x]
    flags: [Σ, C]
    cardinality: 0..1
    type: Quantity | CodeableConcept | string | boolean | integer | Range | Ratio | SampledData | time | dateTime | Period | Attachment | Reference(MolecularSequence)
    short: Actual component result
    description: The information determined as a result of making the observation, if the information has a simple value.
    comments: |-
      Used when observation has a set of component observations:
      * An observation may have both a value (e.g. an Apgar score) and component observations (the observations from which the Apgar score was derived).
      * If a value is present, the datatype for this element should be determined by the `code`.
      * *CodeableConcept* with just a text would be used instead of a string if the field was usually coded, or if the type associated with the `code` defines a coded value.
      * *Attachment* is used if the observation result value is a binary file such as an image. If the observation result value is derived from the binary file (for example 'X' detected and here is the the proof in this image), the binary file may be directly represented using *DocumentReference* and referenced by `derivedFrom`.
      * The usage of valueReference is restricted to the MolecularSequence resource when used as a definitional resource, not as a patient-specific finding. .
      * For additional guidance, see the Notes section in the main documentation.

  - name: Observation.component.dataAbsentReason
    flags: [C]
    cardinality: 0..1
    type: CodeableConcept
    short: Why the component result value is missing
    description: Provides a reason why the expected value in the element Observation.component.value[x] is missing.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/data-absent-reason
      strength: extensible
    comments: |-
      "Null" or exceptional values can be represented two ways in FHIR Observations. One way is to simply include them in the value set and represent the exceptions in the value. For example, measurement values for a serology test could be "detected", "not detected", "inconclusive", or "test not done".
      The alternate way is to use the value element for actual observations and use the explicit dataAbsentReason element to record exceptional values. For example, the dataAbsentReason code "error" could be used when the measurement was not completed. Because of these options, use-case agreements are required to interpret general observations for exceptional values.

  - name: Observation.component.interpretation
    cardinality: 0..*
    type: CodeableConcept
    short: High, low, normal, etc.
    description: A categorical assessment of an observation value. For example, high, low, normal.
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/observation-interpretation
      strength: extensible
    comments: Historically used for laboratory results (known as 'abnormal flag' ), its use extends to other use cases where coded interpretations are relevant. Often reported as one or more simple compact codes this element is often placed adjacent to the result value in reports and flow sheets to signal the meaning/normalcy status of the result.

  - name: Observation.component.referenceRange
    cardinality: 0..*
    type: BackboneElement # Reference to Observation.referenceRange structure
    short: Provides guide for interpretation of component result value
    description: Guidance on how to interpret the value by comparison to a normal or recommended range.
    comments: Most observations only have one generic reference range. Systems MAY choose to restrict to only supplying the relevant reference range based on knowledge about the patient (e.g., specific to the patient's age, gender, weight and other factors), but this might not be possible or appropriate. Whenever more than one reference range is supplied, the differences between them SHOULD be provided in the reference range and/or age properties.

```yaml
constraints:
  - key: obs-3
    severity: Rule
    location: Observation.referenceRange
    description: Must have at least a low or a high or text
    expression: low.exists() or high.exists() or text.exists()
  - key: obs-6
    severity: Rule
    location: (base)
    description: Observation.dataAbsentReason SHALL only be present if Observation.value[x] is not present
    expression: dataAbsentReason.empty() or value.empty()
  - key: obs-7
    severity: Rule
    location: (base)
    description: If Observation.component.code is the same as Observation.code, then Observation.value SHALL NOT be present (the Observation.component.value[x] holds the value).
    expression: value.empty() or component.code.where(coding.intersect(%resource.code.coding).exists()).empty()
  - key: obs-8
    severity: Rule
    location: (base)
    description: bodyStructure SHALL only be present if Observation.bodySite is not present
    expression: bodySite.exists() implies bodyStructure.empty()
  - key: obs-9
    severity: Rule
    location: Observation.specimen
    description: If Observation.specimen is a reference to Group, the group can only have specimens
    expression: (reference.resolve().exists() and reference.resolve() is Group) implies reference.resolve().member.entity.resolve().all($this is Specimen)
  - key: obs-10
    severity: Rule
    location: (base)
    description: Observation.component.dataAbsentReason SHALL only be present if Observation.component.value[x] is not present
    expression: component.empty() or component.where(dataAbsentReason.exists()).all(value.empty())
  - key: obs-11
    severity: Rule
    location: (base)
    description: if organizer exists and organizer = true, then value[x], dataAbsentReason and component SHALL NOT be present
    expression: (organizer.exists() and organizer.allTrue()) implies (value.empty() and dataAbsentReason.empty() and component.empty())

```

## Search Parameters

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
        expression: value.ofType(CodeableConcept)
  - name: code-value-date
    type: composite
    description: Code and date/time value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-date
        expression: value.ofType(dateTime) | value.ofType(Period)
  - name: code-value-quantity
    type: composite
    description: Code and quantity value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-quantity
        expression: value.ofType(Quantity)
  - name: code-value-string
    type: composite
    description: Code and string value parameter pair
    components:
      - definition: code
        expression: code
      - definition: value-string
        expression: value.ofType(string)
  - name: combo-code
    type: token
    description: The code of the observation type or component type
    expression: Observation.code | Observation.component.code
  - name: combo-code-value-concept
    type: composite
    description: Code and coded value parameter pair, including in components
    components:
      - definition: combo-code # Note: Source has definition: code
        expression: code # Note: Source has expression: code
      - definition: combo-value-concept # Note: Source has definition: value-concept
        expression: value.ofType(CodeableConcept) # Note: Source has expression: value.ofType(CodeableConcept)
    # Note: The source HTML describes this as being on Observation | Observation.component, implying combination logic across parent/component.
  - name: combo-code-value-quantity
    type: composite
    description: Code and quantity value parameter pair, including in components
    components:
      - definition: combo-code # Note: Source has definition: code
        expression: code # Note: Source has expression: code
      - definition: combo-value-quantity # Note: Source has definition: value-quantity
        expression: value.ofType(Quantity) # Note: Source has expression: value.ofType(Quantity)
    # Note: The source HTML describes this as being on Observation | Observation.component, implying combination logic across parent/component.
  - name: combo-data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.value[x] or Observation.component.value[x] is missing.
    expression: Observation.dataAbsentReason | Observation.component.dataAbsentReason
  - name: combo-interpretation
    type: token
    description: The interpretation of the observation type or component type
    expression: Observation.interpretation | Observation.component.interpretation
  - name: combo-value-concept
    type: token
    description: The value or component value of the observation, if the value is a CodeableConcept
    expression: Observation.value.ofType(CodeableConcept) | Observation.component.value.ofType(CodeableConcept)
  - name: combo-value-quantity
    type: quantity
    description: The value or component value of the observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: Observation.value.ofType(Quantity) | Observation.value.ofType(SampledData) | Observation.component.value.ofType(Quantity) | Observation.component.value.ofType(SampledData)
  - name: component-code
    type: token
    description: The component code of the observation type
    expression: Observation.component.code
  - name: component-code-value-concept
    type: composite
    description: Component code and component coded value parameter pair
    components:
      - definition: component-code # Note: Source has definition: code
        expression: code # Note: Source has expression: code
      - definition: component-value-concept # Note: Source has definition: value-concept
        expression: value.ofType(CodeableConcept) # Note: Source has expression: value.ofType(CodeableConcept)
    # Note: The source HTML specifies this applies On Observation.component
  - name: component-code-value-quantity
    type: composite
    description: Component code and component quantity value parameter pair
    components:
      - definition: component-code # Note: Source has definition: code
        expression: code # Note: Source has expression: code
      - definition: component-value-quantity # Note: Source has definition: value-quantity
        expression: value.ofType(Quantity) # Note: Source has expression: value.ofType(Quantity)
    # Note: The source HTML specifies this applies On Observation.component
  - name: component-data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.component.value[x] is missing.
    expression: Observation.component.dataAbsentReason
  - name: component-interpretation
    type: token
    description: The component interpretation of the observation type
    expression: Observation.component.interpretation
  - name: component-value-canonical
    type: reference
    description: URL contained in valueCanonical.
    expression: Observation.component.value.ofType(canonical)
    targets: [MolecularSequence] # Based on value[x] type constraint for Reference
  - name: component-value-concept
    type: token
    description: The value of the component observation, if the value is a CodeableConcept
    expression: Observation.component.value.ofType(CodeableConcept)
  - name: component-value-quantity
    type: quantity
    description: The value of the component observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: Observation.component.value.ofType(Quantity) | Observation.component.value.ofType(SampledData)
  - name: component-value-reference
    type: reference
    description: Reference contained in valueReference.
    expression: Observation.component.value.ofType(Reference)
    targets: [MolecularSequence] # Based on value[x] type constraint for Reference
  - name: data-absent-reason
    type: token
    description: The reason why the expected value in the element Observation.value[x] is missing.
    expression: Observation.dataAbsentReason
  - name: date
    type: date
    description: Clinically relevant time/time-period for observation
    expression: Observation.effective.ofType(dateTime) | Observation.effective.ofType(Period) | Observation.effective.ofType(Timing) | Observation.effective.ofType(instant)
  - name: derived-from
    type: reference
    description: Related measurements the observation is made from
    expression: Observation.derivedFrom
    targets: [DocumentReference, GenomicStudy, ImagingSelection, ImagingStudy, MolecularSequence, Observation, QuestionnaireResponse]
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
    targets: [Any] # Any Resource
  - name: has-member
    type: reference
    description: Related resource that belongs to the Observation group
    expression: Observation.hasMember
    targets: [MolecularSequence, Observation, QuestionnaireResponse]
  - name: identifier
    type: token
    description: The unique id for a particular observation
    expression: Observation.identifier
  - name: instantiates-canonical
    type: uri
    description: URL contained in instantiatesCanonical.
    expression: Observation.instantiates.ofType(canonical)
  - name: instantiates-reference
    type: reference
    description: Reference contained in instantiatesReference.
    expression: Observation.instantiates.ofType(Reference)
    targets: [ObservationDefinition]
  - name: interpretation
    type: token
    description: The interpretation of the observation type
    expression: Observation.interpretation
  - name: method
    type: token
    description: The method used for the observation
    expression: Observation.method
  - name: part-of
    type: reference
    description: Part of referenced event
    expression: Observation.partOf
    targets: [GenomicStudy, Immunization, ImagingStudy, MedicationAdministration, MedicationDispense, MedicationStatement, Procedure]
  - name: patient
    type: reference
    description: The subject that the observation is about (if patient)
    expression: Observation.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: performer
    type: reference
    description: Who performed the observation
    expression: Observation.performer
    targets: [Practitioner, PractitionerRole, Organization, CareTeam, Patient, RelatedPerson, HealthcareService]
  - name: specimen
    type: reference
    description: Specimen used for this observation
    expression: Observation.specimen
    targets: [Specimen, Group]
  - name: status
    type: token
    description: The status of the observation
    expression: Observation.status
  - name: subject
    type: reference
    description: The subject that the observation is about
    expression: Observation.subject
    targets: [Patient, Group, Device, Location, Organization, Procedure, Practitioner, Medication, Substance, BiologicallyDerivedProduct, NutritionProduct]
  - name: value-canonical
    type: uri
    description: URL contained in valueCanonical.
    expression: Observation.value.ofType(canonical)
  - name: value-concept
    type: token
    description: The value of the observation, if the value is a CodeableConcept
    expression: Observation.value.ofType(CodeableConcept)
  - name: value-date
    type: date
    description: The value of the observation, if the value is a date or period of time
    expression: Observation.value.ofType(dateTime) | Observation.value.ofType(Period)
  - name: value-quantity
    type: quantity
    description: The value of the observation, if the value is a Quantity, or a SampledData (just search on the bounds of the values in sampled data)
    expression: Observation.value.ofType(Quantity) | Observation.value.ofType(SampledData)
  - name: value-reference
    type: reference
    description: Reference contained in valueReference.
    expression: Observation.value.ofType(Reference)
    targets: [MolecularSequence] # Based on value[x] type constraint for Reference
  - name: value-string
    type: string
    description: String in valueString.
    expression: value.ofType(string)
```

## Notes

*   **Profiling:** Observations can be simple (code, value, status) or complex. Profiles constrain the resource for specific use cases, and extensions add extra detail.
*   **Subject vs. Focus:** Typically, `Observation.code` implies what aspect of the `subject` is observed (e.g., "Blood Glucose" on a Patient). If the observation is *not* directly about the `subject` (e.g., about a specimen, body site, or related person like a fetus or caregiver), use `specimen`, `bodySite`, or `focus`.
*   **Value Representation:** Use `valueCodeableConcept` for coded results, even if only text is available (put it in `valueCodeableConcept.text`). For multiple codings (e.g., SNOMED CT and local), include all in `valueCodeableConcept.coding`. For "other" codes with text descriptions, use the "other" code and put the description in `valueCodeableConcept.text`.
*   **Interoperability (Code/Value Pairs):** Representing findings can vary (e.g., code=Exam, value=Tender vs. code=Abdominal Exam, value=Tenderness vs. code=Abdominal Tenderness, value=True vs. code=Abdominal Tenderness, value=omitted). Profiling is essential to standardize this. Generally prefer specific LOINC/SNOMED codes. Avoid the V3 "Assertion" pattern.
*   **Refining Interpretation:** Use the most specific code possible. Additional context can sometimes be added via multiple codings in `Observation.code` or through grouping/linking mechanisms (`hasMember`, `derivedFrom`, extensions).
*   **Data Types:** `value[x]` has multiple possible data types. `Attachment` is for binary results; `valueBoolean` is rare (use `valueCodeableConcept` with yes/no codes). For exceptional values like below/above detection limits with `valueQuantity`, use the comparator (&lt;, &gt;). For errors or NaN, use `dataAbsentReason`.
*   **Effective Time:** `effective[x]` (dateTime, Period, Timing, instant) represents the physiologically relevant time of the observation (e.g., specimen collection time, time of BP reading).
*   **Reference Ranges:** Provide context for interpreting results. Multiple ranges can be supplied, distinguished by `type` and `appliesTo`.
*   **Cancelled/Not Performed:** Set `status` to "cancelled" and use `dataAbsentReason` (or potentially `valueCodeableConcept` with an appropriate code) to explain why.
*   **Genomics:** Heavily uses Observation and DiagnosticReport. See the [Clinical Genomics Reporting IG](http://hl7.org/fhir/uv/genomics-reporting/index.html). `GenomicStudy` provides analysis metadata. Observations can link to `GenomicStudy` via `partOf` or `derivedFrom`.
*   **Operations:**
    *   `$lastn`: Find the most recent N observations (e.g., last 5 vital signs).
    *   `$stats`: Calculate statistics (avg, min, max, count, percentiles) on numeric observations.

```