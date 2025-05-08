Okay, here is the FHIR R6 Medication resource definition in the requested Markdown and YAML format:

---

# FHIR Resource: Medication

```yaml
resource:
  name: Medication
  hl7_workgroup: Pharmacy
  maturity_level: 4
  standard_status: Trial Use
  security_category: Business
  compartments: [] # No defined compartments
```

This resource is primarily used for the identification and definition of a medication, including ingredients, for the purposes of prescribing, dispensing, and administering a medication as well as for making statements about medication use.

## Background and Scope

The Medication resource allows for medications to be characterized by their form, ingredients, and packaging. It is used to:
*   Identify a medication using codes (e.g., RxNorm, SNOMED CT) or textual descriptions.
*   Specify ingredients, their strengths (as a ratio, quantity, or codeable concept), and whether they are active.
*   Describe compounded products by listing multiple ingredients, which can be base chemicals or other manufactured products.
*   Optionally include details about packaging, such as lot number and expiration date, via the `batch` element.
*   Convey the total volume or amount of the drug in a product when not inferred by the product code.

The resource primarily refers to drug dictionaries for full details on composition and efficacy, but allows for specifying some details directly, especially for custom formulations.

## Resource Details

The following defines the core elements and constraints of the Medication resource.

```yaml
elements:
  - name: Medication
    description: This resource is primarily used for the identification and definition of a medication, including ingredients, for the purposes of prescribing, dispensing, and administering a medication as well as for making statements about medication use.
    short: Definition of a Medication
    type: DomainResource

  - name: Medication.identifier
    flags: [Σ]
    cardinality: 0..*
    type: Identifier
    description: Business identifier for this medication.
    short: Business identifier for this medication
    comments: The serial number could be included as an identifier.

  - name: Medication.code
    flags: [Σ]
    cardinality: 0..1
    type: CodeableConcept
    description: A code (or set of codes) that specify this medication, or a textual description. Usage note This could be a standard medication code such as a code from RxNorm, SNOMED CT, IDMP etc. It could also be a national or local formulary code, optionally with translations to other code systems. The name of the medication can be conveyed in the code.text even if it is different from any of the coding displayName values.
    short: Codes that identify this medication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: Depending on the context of use, the code that was actually selected by the user (prescriber, dispenser, etc.) will have the coding.userSelected set to true. As described in the coding datatype "A coding may be marked as a "userSelected" if a user selected the particular coded value in a user interface (e.g. the user selects an item in a pick-list). If a user selected coding exists, it is the preferred choice for performing translations etc. Other codes can only be literal translations to alternative code systems, or codes at a lower level of granularity (e.g. a generic code for a vendor-specific primary one).

  - name: Medication.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: A code to indicate if the medication is in active use.
    short: active | inactive | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-status
      strength: required
    isModifier: true
    modifierReason: This element changes the interpretation of all descriptive attributes.
    comments: This status is intended to identify if the medication in a local system is in active use within a drug database or inventory. For example, a pharmacy system may create a new drug file record for a compounded product "ABC Hospital Special Cream" with an active status. At some point in the future, it may be determined that the drug record was created with an error and the status is changed to "entered in error". This status is not intended to specify if a medication is part of a particular formulary. It is possible that the drug record may be referenced by multiple formularies or catalogues and each of those entries would have a separate status.

  - name: Medication.marketingAuthorizationHolder
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: The company or other legal entity that has authorization, from the appropriate drug regulatory authority, to market a medicine in one or more jurisdictions. Typically abbreviated MAH.Note The MAH may manufacture the product and may also contract the manufacturing of the product to one or more companies (organizations).
    short: Organization that has authorization to market medication

  - name: Medication.doseForm
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the form of the item. Powder; tablets; capsule.
    short: powder | tablets | capsule +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-form-codes
      strength: example
    comments: When Medication is referenced from MedicationRequest, this is the ordered form. When Medication is referenced within MedicationDispense, this is the dispensed form. When Medication is referenced within MedicationAdministration, this is administered form.

  - name: Medication.totalVolume
    flags: [Σ]
    cardinality: 0..1
    type: Quantity
    description: When the specified product code does not infer a package size, this is the specific amount of drug in the product. For example, when specifying a product that has the same strength (For example, Insulin glargine 100 unit per mL solution for injection), this attribute provides additional clarification of the package amount (For example, 3 mL, 10mL, etc.).
    short: When the specified product code does not infer a package size, this is the specific amount of drug in the product

  - name: Medication.ingredient
    cardinality: 0..*
    type: BackboneElement
    description: Identifies a particular constituent of interest in the product.
    short: Active or inactive ingredient
    comments: The ingredients need not be a complete list. If an ingredient is not specified, this does not indicate whether an ingredient is present or absent. If an ingredient is specified it does not mean that all ingredients are specified. It is possible to specify both inactive and active ingredients. If Medication.code represents a fully specified product (the product + the strength + the dosage form) then including ingredients is duplicative. However, there may be implementation considerations which dictate including ingredients when Medication.code is a fully specified product. For compounded products, active and inactive ingredients should be included. However, even with all ingredients specified, a Medication resource should not be considered a "recipe" as the sequence and techniques for preparing the final product cannot be included.

  - name: Medication.ingredient.item
    cardinality: 1..1
    type: CodeableReference(Substance | Medication)
    description: The ingredient (substance or medication) that the ingredient.strength relates to. This is represented as a concept from a code system or described in another resource (Substance or Medication).
    short: The ingredient (substance or medication) that the ingredient.strength relates to
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: The ingredient may reference a medication substance (for example, amoxicillin) or another medication (for example in the case of a compounded product, Glaxal Base).

  - name: Medication.ingredient.isActive
    cardinality: 0..1
    type: boolean
    description: Indication of whether this ingredient affects the therapeutic action of the drug.
    short: Active ingredient indicator
    requirements: True indicates that the ingredient affects the therapeutic action of the drug (i.e. active). False indicates that the ingredient does not affect the therapeutic action of the drug (i.e. inactive).

  - name: Medication.ingredient.strength[x]
    cardinality: 0..1
    type: Ratio | CodeableConcept | Quantity
    description: Specifies how many (or how much) of the items there are in this Medication. For example, 250 mg per tablet. This is expressed as a ratio where the numerator is 250mg and the denominator is 1 tablet but can also be expressed a quantity when the denominator is assumed to be 1 tablet.
    short: Quantity of ingredient present
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-ingredientstrength
      strength: preferred

  - name: Medication.batch
    cardinality: 0..1
    type: BackboneElement
    description: Information that only applies to packages (not products).
    short: Details about packaged medications

  - name: Medication.batch.lotNumber
    cardinality: 0..1
    type: string
    description: The assigned lot number of a batch of the specified product.
    short: Identifier assigned to batch

  - name: Medication.batch.expirationDate
    cardinality: 0..1
    type: dateTime
    description: When this specific batch of product will expire.
    short: When batch will expire

  - name: Medication.definition
    cardinality: 0..1
    type: Reference(MedicationKnowledge)
    description: A reference to a knowledge resource that provides more information about this medication. This element can be used to help with Cross Border use cases and separately it may also be useful if someone needs to drill into more medication specific information.
    short: Knowledge about this medication
```

## Search Parameters

Search parameters defined for the Medication resource:

```yaml
searchParameters:
  - name: code
    type: token
    description: Returns medications for a specific code
    expression: Medication.code
  - name: expiration-date
    type: date
    description: Returns medications in a batch with this expiration date
    expression: Medication.batch.expirationDate
  - name: form
    type: token
    description: Returns medications for a specific dose form
    expression: Medication.doseForm
  - name: identifier
    type: token
    description: Returns medications with this external identifier
    expression: Medication.identifier
  - name: ingredient
    type: reference
    description: Returns medications for this ingredient reference
    expression: Medication.ingredient.item.reference
    targets: [Medication, Substance]
  - name: ingredient-code
    type: token
    description: Returns medications for this ingredient code
    expression: Medication.ingredient.item.concept
  - name: lot-number
    type: token
    description: Returns medications in a batch with this lot number
    expression: Medication.batch.lotNumber
  - name: marketingauthorizationholder
    type: reference
    description: Returns medications made or sold for this marketing authorization holder
    expression: Medication.marketingAuthorizationHolder
    targets: [Organization]
  - name: serial-number # Note: Description from HTML says "Returns medications in a batch with this lot number" but expression is Medication.identifier
    type: token
    description: Returns medications in a batch with this lot number
    expression: Medication.identifier
  - name: status
    type: token
    description: Returns medications for this status
    expression: Medication.status
```