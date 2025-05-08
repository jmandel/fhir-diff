Okay, I will process the HTML definition for FHIR R4 QuestionnaireResponse and output it in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: QuestionnaireResponse

```yaml
resource:
  name: QuestionnaireResponse
  hl7_workgroup: FHIR Infrastructure
  maturity_level: 3
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Device
    - Encounter
    - Patient
    - Practitioner
    - RelatedPerson
```

A structured set of questions and their answers. The questions are ordered and grouped into coherent subsets, corresponding to the structure of the grouping of the questionnaire being responded to.

## Background and Scope

The `QuestionnaireResponse` resource provides a structured set of answers to questions, typically defined in a corresponding `Questionnaire` resource. It is used across various healthcare scenarios, including capturing medical history, patient-reported outcomes, research data, clinical assessments, intake forms, and insurance claims.

Key aspects include:

*   **Purpose:** To record the specific answers given to a predefined set of questions, maintaining the context of what was asked, in what order, and how it was answered.
*   **Linkage to Questionnaire:** A `QuestionnaireResponse` often references a `Questionnaire` that defines the questions, their organization, and constraints on answers. This link enables validation of the response against the questionnaire's rules.
*   **Data Capture:** It captures the specifics of data collection, such as exactly which questions were asked and the responses provided. This is distinct from resources like `Observation`, where the focus is on the meaning of the observed value rather than the specific question asked.
*   **Lifecycle:** A `QuestionnaireResponse` instance is generated each time a questionnaire is completed. It can represent a complete or partially filled set of answers and may be updated or amended over time.
*   **Context:** The resource can link to relevant contextual information, such as the `subject` (who the answers are about), the `author` (who recorded the answers), the `source` (who provided the answers), and the `encounter` during which the response was captured.
*   **Validation:** Responses can be validated against the defining `Questionnaire` to ensure completeness (required questions answered) and correctness (answers conform to data types, cardinality, etc.).
*   **Usage Examples:** Past medical history, family disease history, social history, research case report forms (CRFs), quality evaluation forms, patient intake forms, and insurance claim forms.

## Resource Details

The following defines the core elements and constraints of the QuestionnaireResponse resource.

```yaml
elements:
  - name: QuestionnaireResponse
    description: A structured set of questions and their answers. The questions are ordered and grouped into coherent subsets, corresponding to the structure of the grouping of the questionnaire being responded to.
    short: A structured set of questions and their answers
    type: DomainResource
    comments: The QuestionnaireResponse contains enough information about the questions asked and their organization that it can be interpreted somewhat independently from the Questionnaire it is based on. I.e. You don't need access to the Questionnaire in order to extract basic information from a QuestionnaireResponse.

  - name: QuestionnaireResponse.identifier
    flags: [Σ]
    cardinality: 0..1
    type: Identifier
    description: A business identifier assigned to a particular completed (or partially completed) questionnaire.
    short: Unique id for this set of answers
    comments: Note This is a business identifier, not a resource identifier (see discussion).

  - name: QuestionnaireResponse.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest)
    description: The order, proposal or plan that is fulfilled in whole or in part by this QuestionnaireResponse. For example, a ServiceRequest seeking an intake assessment or a decision support recommendation to assess for post-partum depression.
    short: Request fulfilled by this QuestionnaireResponse

  - name: QuestionnaireResponse.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Observation | Procedure)
    description: A procedure or observation that this questionnaire was performed as part of the execution of. For example, the surgery a checklist was executed as part of.
    short: Part of this action
    comments: Not to be used to link an questionnaire response to an Encounter - use 'context' for that.

  - name: QuestionnaireResponse.questionnaire
    flags: [Σ]
    cardinality: 0..1 # Note: The R4 spec implies 0..1 in the table, though some interpretations/profiles might make it 1..1. The definition page from build.fhir.org (newer) says 1..1. Sticking to R4 table.
    type: canonical(Questionnaire)
    description: The Questionnaire that defines and organizes the questions for which answers are being provided.
    short: Form being answered
    comments: If a QuestionnaireResponse references a Questionnaire that can be resolved, then the QuestionnaireResponse structure must be consistent with the Questionnaire.

  - name: QuestionnaireResponse.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The position of the questionnaire response within its overall lifecycle.
    short: in-progress | completed | amended | entered-in-error | stopped
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/questionnaire-answers-status
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status 'entered-in-error' which means that the resource should not be treated as valid.
    comments: Unknown does not represent "other" - one of the defined statuses must apply. Unknown is used when the authoring system is not sure what the current status is.

  - name: QuestionnaireResponse.subject
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Any)
    description: The subject of the questionnaire response. This could be a patient, organization, practitioner, device, etc. This is who/what the answers apply to, but is not necessarily the source of information.
    short: The subject of the questions
    comments: If the Questionnaire declared a subjectType, the resource pointed to by this element must be an instance of one of the listed types.

  - name: QuestionnaireResponse.encounter
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Encounter)
    description: The Encounter during which this questionnaire response was created or to which the creation of this record is tightly associated.
    short: Encounter the questionnaire response is part of
    comments: This will typically be the encounter the questionnaire response was created during, but some questionnaire responses may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter.

  - name: QuestionnaireResponse.authored
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The date and/or time that this set of answers were last changed.
    short: Date the answers were gathered
    comments: May be different from the lastUpdateTime of the resource itself, because that reflects when the data was known to the server, not when the data was captured. This element is optional to allow for systems that might not know the value, however it SHOULD be populated if possible.

  - name: QuestionnaireResponse.author
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Device | Practitioner | PractitionerRole | Patient | RelatedPerson | Organization)
    description: Person who received the answers to the questions in the QuestionnaireResponse and recorded them in the system.
    short: Person who received and recorded the answers
    comments: Device should only be used if it directly determined the answers, not if it was merely used as a capture tool to record answers provided by others.

  - name: QuestionnaireResponse.source
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | Practitioner | PractitionerRole | RelatedPerson)
    description: The person who answered the questions about the subject.
    short: The person who answered the questions
    comments: If not specified, no inference can be made about who provided the data. Device should only be used if it directly determined the answers, not if it was merely used as a capture tool.

  - name: QuestionnaireResponse.item
    flags: [I]
    cardinality: 0..*
    type: BackboneElement
    description: A group or question item from the original questionnaire for which answers are provided.
    short: Groups and questions
    comments: Groups cannot have answers and therefore must nest directly within item. When dealing with questions, nesting must occur within each answer because some questions may have multiple answers.

  - name: QuestionnaireResponse.item.linkId
    cardinality: 1..1
    type: string
    description: The item from the Questionnaire that corresponds to this item in the QuestionnaireResponse resource.
    short: Pointer to specific item from Questionnaire

  - name: QuestionnaireResponse.item.definition
    cardinality: 0..1
    type: uri
    description: A reference to an ElementDefinition that provides the details for the item.
    short: ElementDefinition - details for the item
    comments: The ElementDefinition must be in a StructureDefinition, and must have a fragment identifier that identifies the specific data element by its id (Element.id). E.g. http://hl7.org/fhir/StructureDefinition/Observation#Observation.value[x].

  - name: QuestionnaireResponse.item.text
    cardinality: 0..1
    type: string
    description: Text that is displayed above the contents of the group or as the text of the question being answered.
    short: Name for group or question text
    comments: The text for an item SHOULD be identical to the text from the corresponding Questionnaire.item.

  - name: QuestionnaireResponse.item.answer
    cardinality: 0..*
    type: BackboneElement
    description: The respondent's answer(s) to the question.
    short: The response(s) to the question
    comments: The value is nested because we cannot have a repeating structure that has variable type.

  - name: QuestionnaireResponse.item.answer.value[x]
    cardinality: 0..1
    type: boolean | decimal | integer | date | dateTime | time | string | uri | Attachment | Coding | Quantity | Reference(Any)
    description: The answer (or one of the answers) provided by the respondent to the question.
    short: Single-valued answer to the question
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/questionnaire-answers
      strength: example
    comments: Must match the datatype specified by Questionnaire.item.type in the corresponding Questionnaire. Comparison of value to the values defined in the Questionnaire SHALL NOT pay attention to Coding.display, Reference.display, Quantity.unit unless those are the only elements present.

  - name: QuestionnaireResponse.item.answer.item
    cardinality: 0..*
    type: QuestionnaireResponse.item # Recursive definition
    description: Nested groups and/or questions found within this particular answer.
    short: Nested groups and questions
    comments: Only used when nesting beneath a question - see item.item for nesting beneath groups.

  - name: QuestionnaireResponse.item.item
    cardinality: 0..*
    type: QuestionnaireResponse.item # Recursive definition
    description: Questions or sub-groups nested beneath a question or group.
    short: Nested questionnaire response items
    comments: Only used when nesting beneath a group - see item.answer.item for nesting beneath questions.

constraints:
  - key: qrs-1
    severity: Rule
    location: QuestionnaireResponse.item
    description: Nested item can't be beneath both item and answer.
    expression: (answer.exists() and item.exists()).not()
```

## Search Parameters

Search parameters defined for the QuestionnaireResponse resource:

```yaml
searchParameters:
  - name: author
    type: reference
    description: The author of the questionnaire response
    expression: QuestionnaireResponse.author
    targets: [Device, Practitioner, PractitionerRole, Patient, RelatedPerson, Organization]
  - name: authored
    type: date
    description: When the questionnaire response was last changed
    expression: QuestionnaireResponse.authored
  - name: based-on
    type: reference
    description: Plan/proposal/order fulfilled by this questionnaire response
    expression: QuestionnaireResponse.basedOn
    targets: [CarePlan, ServiceRequest]
  - name: encounter
    type: reference
    description: Encounter associated with the questionnaire response
    expression: QuestionnaireResponse.encounter
    targets: [Encounter]
  - name: identifier
    type: token
    description: The unique identifier for the questionnaire response
    expression: QuestionnaireResponse.identifier
  - name: part-of
    type: reference
    description: Procedure or observation this questionnaire response was performed as a part of
    expression: QuestionnaireResponse.partOf
    targets: [Observation, Procedure]
  - name: patient
    type: reference
    description: The patient that is the subject of the questionnaire response
    expression: QuestionnaireResponse.subject.where(resolve() is Patient)
    targets: [Patient]
  - name: questionnaire
    type: reference
    description: The questionnaire the answers are provided for
    expression: QuestionnaireResponse.questionnaire
    targets: [Questionnaire]
  - name: source
    type: reference
    description: The individual providing the information reflected in the questionnaire response
    expression: QuestionnaireResponse.source
    targets: [Patient, Practitioner, PractitionerRole, RelatedPerson]
  - name: status
    type: token
    description: The status of the questionnaire response (in-progress | completed | amended | entered-in-error | stopped)
    expression: QuestionnaireResponse.status
  - name: subject
    type: reference
    description: The subject of the questionnaire response
    expression: QuestionnaireResponse.subject
    targets: [Patient, Group, Device, Practitioner, Organization] # Common targets for 'Any'
```