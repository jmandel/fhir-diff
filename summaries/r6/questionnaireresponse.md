Okay, here is the definition for the FHIR QuestionnaireResponse resource (R6/Build) presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: QuestionnaireResponse

```yaml
resource:
  name: QuestionnaireResponse
  hl7_workgroup: FHIR Infrastructure
  maturity_level: 5
  standard_status: Trial Use # Note: Source HTML shows 'Trial Use' but Maturity 5 usually implies Normative. Using 'Trial Use' as stated.
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

The **QuestionnaireResponse** resource provides a way to record the answers given when responding to a specific set of questions, often defined formally in a separate [Questionnaire](questionnaire.html) resource. It captures the state of answers at a particular point in time for a specific subject.

Key aspects include:

*   **Purpose:** Records answers from forms like medical histories, research questionnaires, clinical assessments, intake forms, etc. It captures *exactly* what questions were asked, in what order, and the answers provided.
*   **Linkage to Questionnaire:** A `QuestionnaireResponse` often links to a canonical `Questionnaire` resource via the `questionnaire` element. This allows for validation and interpretation against the defined structure and rules. However, a response can exist without a resolvable link.
*   **Structure:** The hierarchy of `item` elements within the `QuestionnaireResponse` mirrors the structure (groups, questions, nesting) defined in the corresponding `Questionnaire`. `linkId` connects response items to their definition in the `Questionnaire`.
*   **Subject vs. Source vs. Author:**
    *   `subject`: Who/what the answers are *about* (e.g., Patient, Device, Organization).
    *   `source`: Who *provided* the answers (e.g., Patient, RelatedPerson, Practitioner). Can be different from the subject (e.g., parent answering for a child).
    *   `author`: Who *recorded* the answers in the system (e.g., Practitioner, Device). Can differ from the source (e.g., clinician entering data told by the patient).
*   **Status Management:** The `status` element tracks the lifecycle (e.g., `in-progress`, `completed`, `amended`). Validation rules from the `Questionnaire` (like required fields) typically only apply once the response is `completed` or `amended`.
*   **Context:** Can be linked to an `encounter` or be `basedOn` a request (like `ServiceRequest`) or be `partOf` another event (like `Procedure` or `Observation`).
*   **Nesting:** Nested questions appear under `item.answer.item`, while items nested within groups appear under `item.item`.
*   **Validation:** Completed responses should be valid against the referenced `Questionnaire`, meaning required items are present, cardinality is met, data types match, and only enabled items are included.
*   **Searching:** Specific search parameters exist to query based on `linkId` and answer values, but using them requires care (see Search Parameters and Notes sections). Extracting data into more specific resources is often preferred for standardized querying.

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
    cardinality: 0..* # R4 was 0..1
    type: Identifier
    description: Business identifiers assigned to this questionnaire response by the performer and/or other systems. These identifiers remain constant as the resource is updated and propagates from server to server.
    short: Business identifier for this set of answers
    comments: Note This is a business identifier, not a resource identifier (see discussion).

  - name: QuestionnaireResponse.basedOn
    flags: [Σ]
    cardinality: 0..*
    type: Reference(CarePlan | ServiceRequest)
    description: A plan, proposal or order that is fulfilled in whole or in part by this questionnaire response. For example, a ServiceRequest seeking an intake assessment or a decision support recommendation to assess for post-partum depression.
    short: Request fulfilled by this QuestionnaireResponse

  - name: QuestionnaireResponse.partOf
    flags: [Σ]
    cardinality: 0..*
    type: Reference(Observation | Procedure)
    description: A procedure or observation that this questionnaire was performed as part of the execution of. For example, the surgery a checklist was executed as part of.
    short: Part of referenced event
    comments: Not to be used to link an questionnaire response to an Encounter - use 'encounter' for that. Composition of questionnaire responses will be handled using the Assemble operation defined in the SDC IG. For relationships to referrals, and other types of requests, use basedOn.

  - name: QuestionnaireResponse.questionnaire
    flags: [Σ]
    cardinality: 1..1 # R4 was 0..1
    type: canonical(Questionnaire)
    description: The Questionnaire that defines and organizes the questions for which answers are being provided.
    short: Canonical URL of Questionnaire being answered
    comments: If a QuestionnaireResponse references a Questionnaire that can be resolved, then the QuestionnaireResponse structure must be consistent with the Questionnaire (i.e. questions must be organized into the same groups, nested questions must still be nested, etc.). It is possible to have a QuestionnaireResponse whose 'questionnaire' element does not resolve. It is also possible for the questionnaire element to not have a value but only extensions (e.g. conveying the title or identifier for the questionnaire). This may happen for legacy data. If there is no formally defined Questionnaire, it is undefined what the 'correct' values for the linkId elements should be and it is possible that linkIds might be inconsistent for QuestionnaireResponses for the same form if captured by distinct systems.

  - name: QuestionnaireResponse.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The current state of the questionnaire response.
    short: in-progress | completed | amended | entered-in-error | stopped
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/questionnaire-answers-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
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
    comments: This will typically be the encounter the questionnaire response was created during, but some questionnaire responses may be initiated prior to or after the official completion of an encounter but still be tied to the context of the encounter (e.g. pre-admission forms). A questionnaire that was initiated during an encounter but not fully completed during the encounter would still generally be associated with the encounter.

  - name: QuestionnaireResponse.authored
    flags: [Σ]
    cardinality: 0..1
    type: dateTime
    description: The date and/or time that this questionnaire response was last modified by the user - e.g. changing answers or revising status.
    short: Date the answers were gathered
    comments: May be different from the lastUpdateTime of the resource itself, because that reflects when the data was known to the server, not when the data was captured. This element is optional to allow for systems that might not know the value, however it SHOULD be populated if possible.

  - name: QuestionnaireResponse.author
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Device | Practitioner | PractitionerRole | Patient | RelatedPerson | Organization | Group) # R4 added Group
    description: The individual or device that received the answers to the questions in the QuestionnaireResponse and recorded them in the system.
    short: The individual or device that received and recorded the answers
    comments: Mapping a subject's answers to multiple choice options and determining what to put in the textual answer is a matter of interpretation. Authoring by device would indicate that some portion of the questionnaire had been auto-populated. Device should only be used if it directly determined the answers, not if it was merely used as a capture tool to record answers provided by others. In the latter case, information about the physical device, software, etc. would be captured using Provenance. NOTE Group is allowed as an author only in situations where it represents a family, household, or similar unit and its contents are limited to Patient and/or RelatedPerson. QuestionnaireResponses authored by other collections of people must use Organization.

  - name: QuestionnaireResponse.source
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson) # R4 added Device, Organization
    description: The individual or device that answered the questions about the subject.
    short: The individual or device that answered the questions
    comments: If not specified, no inference can be made about who provided the data. Device should only be used if it directly determined the answers, not if it was merely used as a capture tool to record answers provided by others. In the latter case, information about the physical device, software, etc. would be captured using Provenance.

  - name: QuestionnaireResponse.item
    flags: [C]
    cardinality: 0..*
    type: BackboneElement
    description: A group or question item from the original questionnaire for which answers are provided.
    short: Groups and questions
    comments: Groups cannot have answers and therefore must nest directly within item. When dealing with questions, nesting must occur within each answer because some questions may have multiple answers (and the nesting occurs for each answer). When dealing with repeating items, each group repetition will be handled by a separate item. However, repeating questions are handled with a single question item and potentially multiple answers.

  - name: QuestionnaireResponse.item.linkId
    flags: [C]
    cardinality: 1..1
    type: string
    description: The item from the Questionnaire that corresponds to this item in the QuestionnaireResponse resource.
    short: Pointer to specific item from Questionnaire

  - name: QuestionnaireResponse.item.definition
    cardinality: 0..* # R4 was 0..1
    type: uri
    description: A reference to an [ElementDefinition](elementdefinition.html) that provides the details for the item.
    short: ElementDefinition - details for the item
    comments: The ElementDefinition must be in a StructureDefinition, and must have a fragment identifier that identifies the specific data element by its id (Element.id). E.g. http://hl7.org/fhir/StructureDefinition/Observation#Observation.value[x]. There is no need for this element if the item pointed to by the linkId has a definition listed.

  - name: QuestionnaireResponse.item.text
    cardinality: 0..1
    type: string
    description: Text that is displayed above the contents of the group or as the text of the question being answered.
    short: Name for group or question text
    comments: The text for an item SHOULD be identical to the text from the corresponding Questionnaire.item. This can't be strictly enforced because it's possible for the Questionnaire to be updated subsequent to the QuestionnaireResponse having been created, however the intention is that the text in the QuestionnaireResponse reflects what the user saw when completing the Questionnaire.

  - name: QuestionnaireResponse.item.answer
    flags: [C]
    cardinality: 0..*
    type: BackboneElement
    description: The respondent's answer(s) to the question.
    short: The response(s) to the question
    comments: The value is nested because we cannot have a repeating structure that has variable type.

  - name: QuestionnaireResponse.item.answer.value[x]
    flags: [C]
    cardinality: 1..1 # R4 was 0..1
    type: boolean | decimal | integer | date | dateTime | time | string | uri | Attachment | Coding | SimpleQuantity | Reference(Any) # Added SimpleQuantity
    description: The answer (or one of the answers) provided by the respondent to the question. Types allowed: boolean, decimal, integer, date, dateTime, time, string, uri, Attachment, Coding, Quantity(SimpleQuantity), Reference(Any).
    short: Single-valued answer to the question
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/questionnaire-answers
      strength: example
    comments: More complex structures (Attachment, Resource and Quantity) will typically be limited to electronic forms that can expose an appropriate user interface to capture the components and enforce the constraints of a complex data type. Additional complex types can be introduced through extensions. Must match the datatype specified by Questionnaire.item.type in the corresponding Questionnaire. Note that a question is answered using one of the possible choices defined with answerOption, answerValueSet or some other means and the answer has a complex data type, all elements within the answer in the QuestionnaireResponse SHOULD match the elements defined corresponding choice value in the Questionnaire. However, it is possible that not all elements will be propagated. Also, some systems might use language translations resulting in different displays. Comparison of value to the values defined in the Questionnaire (whether by answerOption, answerValueSet or answerExpression) SHALL NOT pay attention to Coding.display, Reference.display, Quantity.unit unless those are the only elements present. As well, systems are not required to check for a match on any extensions (e.g. ordinal values, translations, etc.). Systems MAY enforce that if extensions such as ordinal values are present in both Questionnaire and QuestionnaireResponse, they match.

  - name: QuestionnaireResponse.item.answer.item
    cardinality: 0..*
    type: '#QuestionnaireResponse.item' # Reference to self (BackboneElement definition)
    description: Nested groups and/or questions found within this particular answer.
    short: Child items of question
    comments: Only used when nesting beneath a question - see item.item for nesting beneath groups

  - name: QuestionnaireResponse.item.item
    cardinality: 0..*
    type: '#QuestionnaireResponse.item' # Reference to self (BackboneElement definition)
    description: Sub-questions, sub-groups or display items nested beneath a group.
    short: Child items of group item
    comments: Only used when nesting beneath a group - see item.answer.item for nesting beneath questions

constraints:
  - key: qrs-1
    severity: Rule
    location: QuestionnaireResponse.item
    description: Item cannot contain both item and answer
    expression: (answer.exists() and item.exists()).not()
  - key: qrs-2
    severity: Rule
    location: QuestionnaireResponse.item
    description: Repeated answers are combined in the answers array of a single item
    expression: repeat(answer|item).select(item.where(answer.value.exists()).linkId.isDistinct()).allTrue()
  - key: qrs-3
    severity: Rule
    location: QuestionnaireResponse.item.linkId
    description: LinkId cannot have leading or trailing spaces or intevening whitespace other than single space characters
    expression: $this.matches('[^\\s]+( [^\\s]+)*')

```

## Search Parameters

Search parameters defined for the QuestionnaireResponse resource:

```yaml
searchParameters:
  - name: answer-concept
    type: token
    description: Question answers of type coding or boolean found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(boolean) | QuestionnaireResponse.item.answer.value.ofType(Coding)
  - name: answer-date
    type: date
    description: Question answers of type date or dateTime found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(date) | QuestionnaireResponse.item.answer.value.ofType(dateTime)
  - name: answer-number
    type: number
    description: Question answers of type integer or decimal found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(integer) | QuestionnaireResponse.item.answer.value.ofType(decimal)
  - name: answer-quantity
    type: quantity
    description: Question answers of type quantity found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(Quantity)
  - name: answer-reference
    type: reference
    description: Question answers of type reference found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(Reference)
    targets: [Any] # Derived from type Reference(Any) on value[x]
  - name: answer-string
    type: string
    description: Question answers of type string found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    expression: QuestionnaireResponse.item.answer.value.ofType(string)
  - name: author
    type: reference
    description: The author of the questionnaire response
    expression: QuestionnaireResponse.author
    targets: [Practitioner, Group, Organization, Device, Patient, PractitionerRole, RelatedPerson]
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
  - name: item-concept
    type: composite
    description: Question with items having the specified linkId and answers of type boolean or coding found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid # Note: search param name is 'linkid', lowercase
        expression: item.linkId
      - definition: answer-concept
        expression: item.answer.value.ofType(boolean) | item.answer.value.ofType(Coding)
  - name: item-date
    type: composite
    description: Question with items having the specified linkId and answers of type date or dateTime found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-date
        expression: item.answer.value.ofType(date) | item.answer.value.ofType(dateTime)
  - name: item-number
    type: composite
    description: Question with items having the specified linkId and answers of type integer or decimal found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-number
        expression: item.answer.value.ofType(integer) | item.answer.value.ofType(decimal)
  - name: item-quantity
    type: composite
    description: Question with items having the specified linkId and answers of type quantity found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-quantity
        expression: item.answer.value.ofType(Quantity)
  - name: item-reference
    type: composite
    description: Question with items having the specified linkId and answers of type reference found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-reference
        expression: item.answer.value.ofType(Reference)
  - name: item-string
    type: composite
    description: Question with items having the specified linkId and answers of type string found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-string
        expression: item.answer.value.ofType(String) # Source HTML has 'String', typically FHIR uses lowercase 'string' for types. Using 'String' as in source.
  - name: item-subject
    type: reference
    description: Allows searching for QuestionnaireResponses by item value where the item has isSubject=true
    expression: QuestionnaireResponse.item.where(extension('http://hl7.org/fhir/StructureDefinition/questionnaireresponse-isSubject').exists()).answer.value.ofType(Reference)
    # Targets depend on what the reference points to, likely Patient or related resources based on context. Explicit targets not listed in source.
  - name: item-uri
    type: composite
    description: Question with items having the specified linkId and answers of type uri found within the response. (Primarily for use as part of other composite search parameters.) Refer to [questionnaireresponse.html#searching](searching guidance) on the resource page for considerations on the use of this parameter.
    components:
      - definition: linkid
        expression: item.linkId
      - definition: answer-uri
        expression: item.answer.value.ofType(Uri) # Source HTML has 'Uri', typically FHIR uses lowercase 'uri'. Using 'Uri' as in source.
  - name: linkid
    type: token
    description: Question linkIds found within the response
    expression: QuestionnaireResponse.item.linkId
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
    targets: [Practitioner, Organization, Device, Patient, PractitionerRole, RelatedPerson]
  - name: status
    type: token
    description: The status of the questionnaire response
    expression: QuestionnaireResponse.status
  - name: subject
    type: reference
    description: The subject of the questionnaire response
    expression: QuestionnaireResponse.subject
    targets: [Any] # As defined in element definition

```