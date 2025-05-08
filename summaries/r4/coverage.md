Here is the FHIR R4 resource definition for Coverage, presented in Markdown with embedded YAML blocks:

---

# FHIR Resource: Coverage

```yaml
resource:
  name: Coverage
  hl7_workgroup: Financial Management
  maturity_level: 4 # Based on build.fhir.org; R4 official page states 2
  standard_status: Trial Use
  security_category: Patient
  compartments:
    - Patient
    - RelatedPerson
```

Financial instrument which may be used to reimburse or pay for health care products and services. Includes both insurance and self-payment.

## Background and Scope

The Coverage resource provides high-level identifiers and descriptors of an insurance plan or self-payment agreement, typically the information which would appear on an insurance card. It is used to detail how healthcare products and services may be paid for, either in part or whole.

This resource may also be used to register 'SelfPay' scenarios where an individual or organization (other than an insurer) takes responsibility for payment for a portion of the health care costs. SelfPay should not be confused with being a guarantor of the patient's account. Coverage is considered an "event" resource from a FHIR workflow perspective.

Coverage relates to other eClaim resources:
*   **Coverage**: Contains specific insurance plan details for an individual (i.e., insurance card information) or self-pay details.
*   **Contract**: Holds legal agreements between parties, which can include service contracts, insurance contracts, or directives.
*   **InsurancePlan**: Defines the details of an insurance plan offered by an insurer (this is the plan definition, not a list of individuals who have purchased the plan).

The Coverage resource is referenced by resources such as `Account`, `Claim`, `ClaimResponse`, `CoverageEligibilityRequest`, `CoverageEligibilityResponse`, `DeviceRequest`, `EnrollmentRequest`, `ExplanationOfBenefit`, `MedicationRequest`, `ServiceRequest`, and `Task`.

## Resource Details

The following defines the core elements of the Coverage resource.

```yaml
elements:
  - name: Coverage
    description: Financial instrument which may be used to reimburse or pay for health care products and services. Includes both insurance and self-payment.
    short: Insurance or medical plan or payment agreement
    type: DomainResource
    comments: The Coverage resource contains the insurance card level information, which is customary to provide on claims and other communications between providers and insurers.

  - name: Coverage.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: The identifier of the coverage as issued by the insurer.
    short: Business identifier(s) for this coverage
    comments: The main (and possibly only) identifier for the coverage - often referred to as a Member ID, Certificate number, Personal Health Number or Case ID. May be constructed as the concatenation of the Coverage.subscriberId and the Coverage.dependent. Note that not all insurers issue unique member IDs therefore searches may result in multiple responses.

  - name: Coverage.status
    flags: [?!, Σ]
    cardinality: 1..1
    type: code
    description: The status of the resource instance.
    short: active | cancelled | draft | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/fm-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labelled as a modifier because it is a status element that contains status 'entered-in-error' which means that the resource should not be treated as valid.
    comments: Need to track the status of the resource as 'draft' resources may undergo further edits while 'active' resources are immutable and may only have their status changed to 'cancelled'.

  - name: Coverage.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The type of coverage social program, medical plan, accident coverage (workers compensation, auto), group health or payment by an individual or organization.
    short: Coverage category (e.g. medical, auto)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-type
      strength: preferred
    comments: The order of application of coverages is dependent on the types of coverage.

  - name: Coverage.policyHolder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson | Organization)
    description: The party who 'owns' the insurance policy.
    short: Owner of the policy
    comments: For example may be an individual, corporation or the subscriber's employer. This provides employer information in the case of Worker's Compensation and other policies.

  - name: Coverage.subscriber
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Patient | RelatedPerson)
    description: The party who has signed-up for or 'owns' the contractual relationship to the policy or to whom the benefit of the policy for services rendered to them or their family is due.
    short: Subscriber to the policy
    comments: May be self or a parent in the case of dependents. A subscriber is only required on certain types of policies, not all policies; it is appropriate to have just a policyholder and a beneficiary when no other party can join that policy instance. This is the party who is entitled to the benefits under the policy.

  - name: Coverage.subscriberId
    flags: [Σ]
    cardinality: 0..1
    type: string # R4 specific. Later FHIR versions use Identifier.
    description: The insurer assigned ID for the Subscriber.
    short: Subscriber's insurer-assigned ID
    comments: The insurer requires this identifier on correspondence and claims (digital and otherwise).

  - name: Coverage.beneficiary
    flags: [Σ]
    cardinality: 1..1
    type: Reference(Patient)
    description: The party who benefits from the insurance coverage; the patient when products and/or services are provided.
    short: Covered party (patient)
    comments: This is the party who receives treatment for which the costs are reimbursed under the coverage.

  - name: Coverage.dependent
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A designator for a dependent under the coverage.
    short: Dependent number
    comments: For some coverages a single identifier is issued to the Subscriber and then an additional dependent number is issued to each beneficiary. Sometimes the member number is constructed from the subscriberId and the dependent number.

  - name: Coverage.relationship
    cardinality: 0..1
    type: CodeableConcept
    description: The relationship of beneficiary (patient) to the subscriber.
    short: Beneficiary's relationship to subscriber
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/subscriber-relationship
      strength: extensible
    comments: The relationship between the patient and the subscriber is used to determine coordination of benefits. Typically, an individual uses policies which are theirs (relationship='self') before policies owned by others.

  - name: Coverage.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: Time period during which the coverage is in force. A missing start date indicates the start date isn't known, a missing end date means the coverage is continuing to be in force.
    short: Coverage effective period
    comments: Some insurers require the submission of the coverage term.

  - name: Coverage.payor
    flags: [Σ]
    cardinality: 1..*
    type: Reference(Organization | Patient | RelatedPerson)
    description: The program or plan underwriter or payor including both insurance and non-insurance agreements, such as patient-pay agreements.
    short: Issuer of the policy or plan
    comments: May provide multiple identifiers such as insurance company identifier or business identifier (BIN number). Needed to identify the issuer for claim processing and coordination of benefit processing.

  - name: Coverage.class
    cardinality: 0..*
    type: BackboneElement
    description: A suite of underwriter specific classifiers.
    short: Additional policy classifications
    comments: The codes provided on the health card which identify or confirm the specific policy for the insurer. For example, class may be used to identify a class of coverage or employer group, policy, or plan.

  - name: Coverage.class.type
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: The type of classification for which an insurer-specific class label or number and optional name is provided. For example, type may be used to identify a class of coverage or employer group, policy, or plan.
    short: Type of class (e.g. group, plan)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-class
      strength: extensible
    comments: The insurer issued label for a specific health card value.

  - name: Coverage.class.value
    flags: [Σ]
    cardinality: 1..1
    type: string # R4 specific. Later FHIR versions use Identifier.
    description: The alphanumeric string value associated with the insurer issued label.
    short: Value of the class (e.g. plan number)
    comments: For example, the Group or Plan number. The insurer issued label and identifier are necessary to identify the specific policy, group, etc.

  - name: Coverage.class.name
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: A short description for the class.
    short: Name for the class
    comments: Used to provide a meaningful description in correspondence to the patient.

  - name: Coverage.order
    flags: [Σ]
    cardinality: 0..1
    type: positiveInt
    description: The order of applicability of this coverage relative to other coverages which are currently in force. Note, there may be gaps in the numbering and this does not imply primary, secondary etc. as the specific positioning of coverages depends upon the episode of care.
    short: Relative order of coverage
    comments: Used in managing the coordination of benefits. For example, a patient might have (1) auto insurance, (2) their own health insurance, and (3) spouse's health insurance. When claiming for treatments not resulting from an auto accident, only coverages (2) and (3) would apply in that order.

  - name: Coverage.network
    flags: [Σ]
    cardinality: 0..1
    type: string
    description: The insurer-specific identifier for the insurer-defined network of providers to which the beneficiary may seek treatment which will be covered at the 'in-network' rate, otherwise 'out of network' terms and conditions apply.
    short: Insurer network
    comments: Used in referral for treatment and in claims processing.

  - name: Coverage.costToBeneficiary
    cardinality: 0..*
    type: BackboneElement
    description: A suite of codes indicating the cost category and associated amount which have been detailed in the policy and may have been included on the health card.
    short: Patient payments for services/products
    comments: Required by providers to manage financial transaction with the patient. For example, by knowing the patient visit co-pay, the provider can collect the amount prior to undertaking treatment.

  - name: Coverage.costToBeneficiary.type
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: The category of patient centric costs associated with treatment.
    short: Type of cost (e.g. copay, deductible)
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-copay-type
      strength: extensible
    comments: Needed to identify the category associated with the amount for the patient. For example visit, specialist visits, emergency, inpatient care, etc.

  - name: Coverage.costToBeneficiary.value[x]
    flags: [Σ]
    cardinality: 1..1 # R4: valueQuantity or valueMoney, so 1..1 for the choice
    type: SimpleQuantity | Money
    description: The amount due from the patient for the cost category.
    short: Amount or percentage due
    comments: Needed to identify the amount for the patient associated with the category. Amount may be expressed as a percentage of the service/product cost or a fixed amount of currency.

  - name: Coverage.costToBeneficiary.exception
    cardinality: 0..*
    type: BackboneElement
    description: A suite of codes indicating exceptions or reductions to patient costs and their effective periods.
    short: Exceptions to patient costs
    comments: Required by providers to manage financial transaction with the patient.

  - name: Coverage.costToBeneficiary.exception.type
    flags: [Σ]
    cardinality: 1..1
    type: CodeableConcept
    description: The code for the specific exception.
    short: Type of cost exception
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/coverage-financial-exception
      strength: example
    comments: Needed to identify the exception associated with the amount for the patient.

  - name: Coverage.costToBeneficiary.exception.period
    flags: [Σ]
    cardinality: 0..1
    type: Period
    description: The timeframe during when the exception is in force.
    short: Effective period of exception
    comments: Needed to identify the applicable timeframe for the exception for the correct calculation of patient costs.

  - name: Coverage.subrogation
    cardinality: 0..1
    type: boolean
    description: When 'subrogation=true' this insurance instance has been included not for adjudication but to provide insurers with the details to recover costs.
    short: Flag for subrogation
    comments: Typically, automotive and worker's compensation policies would be flagged with 'subrogation=true' to enable healthcare payors to collect against accident claims.

  - name: Coverage.contract
    cardinality: 0..*
    type: Reference(Contract)
    description: The policy(s) which constitute this insurance coverage.
    short: Associated policy contract(s)
    comments: To reference the legally binding contract between the policy holder and the insurer.
```

## Search Parameters

Search parameters defined for the Coverage resource (FHIR R4):

```yaml
searchParameters:
  - name: beneficiary
    type: reference
    description: Covered party
    expression: Coverage.beneficiary
    targets: [Patient]
  - name: class-type # R4 specific naming
    type: token
    description: Coverage class (eg. plan, group)
    expression: Coverage.class.type
  - name: class-value # R4 specific naming
    type: string # R4 Coverage.class.value is string, hence search type is string
    description: Value of the class (eg. Plan number, group number)
    expression: Coverage.class.value
  - name: dependent
    type: string
    description: Dependent number
    expression: Coverage.dependent
  - name: identifier
    type: token
    description: The primary identifier of the insured and the coverage
    expression: Coverage.identifier
  - name: patient # Often an alias for beneficiary
    type: reference
    description: Retrieve coverages for a patient
    expression: Coverage.beneficiary # Same as beneficiary
    targets: [Patient]
  - name: payor
    type: reference
    description: The identity of the insurer or party paying for services
    expression: Coverage.payor
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
  - name: type
    type: token
    description: The kind of coverage (health plan, auto, Workers Compensation)
    expression: Coverage.type
```