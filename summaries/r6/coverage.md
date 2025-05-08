# FHIR Resource: Coverage

```yaml
resource:
  name: Coverage
  hl7_workgroup: Financial Management
  maturity_level: 4
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - RelatedPerson
```

Financial instrument which may be used to reimburse or pay for health care products and services. Includes both insurance and self-payment.

## Background and Scope

The Coverage resource provides high-level identifiers and descriptors for a specific insurance plan or self-payment arrangement for an individual. It typically contains information found on an insurance card.

Key aspects include:

*   **Purpose:** Links covered parties (patients) to the payors (insurers or self-pay parties) responsible for healthcare costs. It holds the "insurance card" level information.
*   **Self-Pay:** Can register 'SelfPay' where an individual or organization (other than an insurer) takes responsibility for payment. This is distinct from being an account guarantor.
*   **Workflow:** Considered an "event" resource from a FHIR workflow perspective.
*   **Related Resources:**
    *   `Contract`: Holds details of agreements (like insurance contracts).
    *   `InsurancePlan`: Defines the *details* of an insurance plan offered by an insurer (benefit structure, costs, networks), whereas `Coverage` is an *instance* of that plan for a specific person. `Coverage` may link to an `InsurancePlan`.

## Resource Details

The following defines the core elements and constraints of the Coverage resource.

```yaml
elements:
  - name: Coverage
    type: DomainResource
    description: Financial instrument which may be used to reimburse or pay for health care products and services. Includes both insurance and self-payment.
    short: Insurance or medical plan or a payment agreement
    comments: The Coverage resource contains the insurance card level information, which is customary to provide on claims and other communications between providers and insurers.

  - name: Coverage.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: The identifier of the coverage as issued by the insurer.
    short: Business identifier(s) for this coverage
    comments: The main (and possibly only) identifier for the coverage - often referred to as a Member Id, Certificate number, Personal Health Number or Case ID. May be constructed as the concatenation of the Coverage.SubscriberID and the Coverage.dependant. Note that not all insurers issue unique member IDs therefore searches may result in multiple responses.

  - name: Coverage.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the resource instance.
    short: active | cancelled | draft | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/fm-status
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status entered-in-error which means that the resource should not be treated as valid
    comments: This element is labeled as a modifier because the status contains the code entered-in-error that marks the coverage as not currently valid.

  - name: Coverage.kind
    flags: [Σ]
    cardinality: 1..1
    type: code
    description: The nature of the coverage be it insurance, or cash payment such as self-pay.
    short: insurance | self-pay | other
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-kind
      strength: required

  - name: Coverage.paymentBy
    cardinality: 0..*
    type: BackboneElement
    description: Link to the paying party and optionally what specifically they will be responsible to pay.
    short: Self-pay parties and responsibility

  - name: Coverage.paymentBy.party
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient | RelatedPerson | Organization)
    description: The list of parties providing non-insurance payment for the treatment costs.
    short: Parties performing self-payment

  - name: Coverage.paymentBy.responsibility
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: Description of the financial responsibility.
    short: Party's responsibility

  - name: Coverage.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The type of coverage: social program, medical plan, accident coverage (workers compensation, auto), group health or payment by an individual or organization.
    short: Coverage category such as medical or accident
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-type
      strength: preferred

  - name: Coverage.policyHolder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Organization)
    description: The party who 'owns' the insurance policy.
    short: Owner of the policy
    comments: For example: may be an individual, corporation or the subscriber's employer.

  - name: Coverage.subscriber
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson)
    description: The party who has signed-up for or 'owns' the contractual relationship to the policy or to whom the benefit of the policy for services rendered to them or their family is due.
    short: Subscriber to the policy
    comments: May be self or a parent in the case of dependants. A subscriber is only required on certain types of policies not all policies and that it is appropriate to have just a policyholder and a beneficiary when not other party can join that policy instance.

  - name: Coverage.subscriberId
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: The insurer assigned ID for the Subscriber.
    short: ID assigned to the subscriber

  - name: Coverage.beneficiary
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient)
    description: The party who benefits from the insurance coverage; the patient when products and/or services are provided.
    short: Plan beneficiary

  - name: Coverage.dependent
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A designator for a dependent under the coverage.
    short: Dependent number
    comments: Sometimes the member number is constructed from the subscriberId and the dependant number.

  - name: Coverage.relationship
    cardinality: 0..1
    type: CodeableConcept
    description: The relationship of beneficiary (patient) to the subscriber.
    short: Beneficiary relationship to the subscriber
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/subscriber-relationship
      strength: extensible
    comments: Typically, an individual uses policies which are theirs (relationship='self') before policies owned by others.

  - name: Coverage.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: Time period during which the coverage is in force. A missing start date indicates the start date isn't known, a missing end date means the coverage is continuing to be in force.
    short: Coverage start and end dates

  - name: Coverage.insurer
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The program or plan underwriter, payor, insurance company.
    short: Issuer of the policy
    comments: May provide multiple identifiers such as insurance company identifier or business identifier (BIN number).

  - name: Coverage.class
    cardinality: 0..*
    type: BackboneElement
    description: A suite of underwriter specific classifiers.
    short: Additional coverage classifications
    comments: For example, class may be used to identify a class of coverage or employer group, policy, or plan.

  - name: Coverage.class.type
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: The type of classification for which an insurer-specific class label or number and optional name is provided. For example, type may be used to identify a class of coverage or employer group, policy, or plan.
    short: Type of class such as 'group' or 'plan'
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-class
      strength: extensible

  - name: Coverage.class.value
    flags: [Σ]
    cardinality: 1..1
    type: Identifier
    description: The alphanumeric identifier associated with the insurer issued label.
    short: Value associated with the type
    comments: For example, the Group or Plan number.

  - name: Coverage.class.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A short description for the class.
    short: Human readable description of the type and value

  - name: Coverage.order
    flags: [Σ]
    cardinality: 0..1
    type: positiveInt
    description: The order of applicability of this coverage relative to other coverages which are currently in force. Note, there may be gaps in the numbering and this does not imply primary, secondary etc. as the specific positioning of coverages depends upon the episode of care. For example; a patient might have (0) auto insurance (1) their own health insurance and (2) spouse's health insurance. When claiming for treatments which were not the result of an auto accident then only coverages (1) and (2) above would be applicatble and would apply in the order specified in parenthesis.
    short: Relative order of the coverage

  - name: Coverage.network
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: The insurer-specific identifier for the insurer-defined network of providers to which the beneficiary may seek treatment which will be covered at the 'in-network' rate, otherwise 'out of network' terms and conditions apply.
    short: Insurer network

  - name: Coverage.costToBeneficiary
    cardinality: 0..*
    type: BackboneElement
    description: A suite of codes indicating the cost category and associated amount which have been detailed in the policy and may have been included on the health card.
    short: Patient payments for services/products
    comments: For example by knowing the patient visit co-pay, the provider can collect the amount prior to undertaking treatment.

  - name: Coverage.costToBeneficiary.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The category of patient centric costs associated with treatment.
    short: Cost category
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-copay-type
      strength: extensible
    comments: For example visit, specialist visits, emergency, inpatient care, etc.

  - name: Coverage.costToBeneficiary.category
    cardinality: 0..1
    type: CodeableConcept
    description: Code to identify the general type of benefits under which products and services are provided.
    short: Benefit classification
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/ex-benefitcategory
      strength: example
    comments: Examples include Medical Care, Periodontics, Renal Dialysis, Vision Coverage.

  - name: Coverage.costToBeneficiary.network
    cardinality: 0..1
    type: CodeableConcept
    description: Is a flag to indicate whether the benefits refer to in-network providers or out-of-network providers.
    short: In or out of network
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/benefit-network
      strength: example

  - name: Coverage.costToBeneficiary.unit
    cardinality: 0..1
    type: CodeableConcept
    description: Indicates if the benefits apply to an individual or to the family.
    short: Individual or family
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/benefit-unit
      strength: example

  - name: Coverage.costToBeneficiary.term
    cardinality: 0..1
    type: CodeableConcept
    description: The term or period of the values such as 'maximum lifetime benefit' or 'maximum annual visits'.
    short: Annual or lifetime
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/benefit-term
      strength: example

  - name: Coverage.costToBeneficiary.value[x]
    flags: [Σ]
    cardinality: 0..1
    type: SimpleQuantity | Money # Choice of Quantity or Money
    description: The amount due from the patient for the cost category.
    short: The amount or percentage due from the beneficiary
    comments: Amount may be expressed as a percentage of the service/product cost or a fixed amount of currency.

  - name: Coverage.costToBeneficiary.exception
    cardinality: 0..*
    type: BackboneElement
    description: A suite of codes indicating exceptions or reductions to patient costs and their effective periods.
    short: Exceptions for patient payments

  - name: Coverage.costToBeneficiary.exception.type
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: The code for the specific exception.
    short: Exception category
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-financial-exception
      strength: example

  - name: Coverage.costToBeneficiary.exception.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The timeframe the exception is in force.
    short: The effective period of the exception

  - name: Coverage.subrogation
    cardinality: 0..1
    type: boolean
    description: When 'subrogation=true' this insurance instance has been included not for adjudication but to provide insurers with the details to recover costs.
    short: Reimbursement to insurer
    comments: Typically, automotive and worker's compensation policies would be flagged with 'subrogation=true' to enable healthcare payors to collect against accident claims.

  - name: Coverage.contract
    cardinality: 0..*
    type: Reference(Contract)
    description: The policy(s) which constitute this insurance coverage.
    short: Contract details

  - name: Coverage.insurancePlan
    cardinality: 0..1
    type: Reference(InsurancePlan)
    description: The insurance plan details, benefits and costs, which constitute this insurance coverage.
    short: Insurance plan details
```

```yaml
# No constraints were explicitly listed in the provided HTML source snippet.
# If constraints exist for Coverage R6, they would be listed here.
constraints: []
```

## Search Parameters

Search parameters defined for the Coverage resource:

```yaml
searchParameters:
  - name: beneficiary
    type: reference
    description: Covered party
    expression: Coverage.beneficiary
    targets: [Patient]
  - name: class-type
    type: token
    description: Coverage class (e.g. plan, group)
    expression: Coverage.class.type
  - name: class-value
    type: token
    description: Value of the class (e.g. Plan number, group number)
    expression: Coverage.class.value
  - name: dependent
    type: string
    description: Dependent number
    expression: Coverage.dependent
  - name: identifier
    type: token
    description: The primary identifier of the insured and the coverage
    expression: Coverage.identifier
    # Note: Also listed as a common parameter for 64 resources
  - name: insurer
    type: reference
    description: The identity of the insurer
    expression: Coverage.insurer
    targets: [Organization]
  - name: patient
    type: reference
    description: Retrieve coverages for a patient
    expression: Coverage.beneficiary # Note: The actual target is the beneficiary
    targets: [Patient]
    # Note: Also listed as a common parameter for 64 resources
  - name: paymentby-party
    type: reference
    description: Parties who will pay for services
    expression: Coverage.paymentBy.party
    targets: [Organization, Patient, RelatedPerson]
  - name: policy-holder
    type: reference
    description: Reference to the policyholder
    expression: Coverage.policyHolder
    targets: [Organization, Patient, RelatedPerson]
  - name: status
    type: token
    description: The status of the Coverage
    expression: Coverage.status
  - name: subscriber
    type: reference
    description: Reference to the subscriber
    expression: Coverage.subscriber
    targets: [Patient, RelatedPerson]
  - name: subscriberid
    type: token
    description: Identifier of the subscriber
    expression: Coverage.subscriberId
  - name: type
    type: token
    description: The kind of coverage (health plan, auto, Workers Compensation)
    expression: Coverage.type
    # Note: Also listed as a common parameter for 11 resources
```