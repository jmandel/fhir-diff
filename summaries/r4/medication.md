Okay, here is the FHIR R4 Medication resource definition presented in the requested Markdown format with embedded YAML blocks.

---

# FHIR Resource: Medication

```yaml
resource:
  name: Medication
  hl7_workgroup: Pharmacy
  maturity_level: 4 # Taken from the header of the 'medication-definitions.html' (build.fhir.org) provided
  standard_status: Trial Use
  security_category: Business
  compartments: [] # "No defined compartments" or "Not linked to any defined compartments"
```

This resource is primarily used for the identification and definition of a medication, including ingredients, for the purposes of prescribing, dispensing, and administering a medication as well as for making statements about medication use.

## Background and Scope

The Medication resource identifies a medication item, which can be a packaged product, a manufactured item, or a compounded product. It supports various healthcare workflows by allowing medications to be characterized by their form, ingredients, and packaging details.

Key aspects include:

*   **Identification:** Medications are typically identified using standard codes (e.g., RxNorm, SNOMED CT) or local formulary codes. Business identifiers can also be used.
*   **Composition:** The resource can describe ingredients, their strengths, and whether they are active. This is crucial for compounded medications where base chemicals and manufactured products might be combined.
*   **Packaging:** For packaged medications, details like the amount of drug in the package (e.g., total volume or count) can be specified. Batch-specific information like lot number and expiration date can also be included.
*   **Form:** The physical form of the medication (e.g., tablet, powder, solution) is an important characteristic.
*   **Status:** A status indicates if the medication definition is active, inactive, or entered-in-error within the system defining it. This is distinct from formulary status.
*   **Usage Context:** The Medication resource is referenced by various other resources like `MedicationRequest`, `MedicationDispense`, `MedicationAdministration`, and `MedicationStatement` to specify the actual medication involved in those events.

The level of detail captured can vary. For many common use cases, a code pointing to a dictionary entry is sufficient. For others, like custom compounds, more detailed ingredient information is necessary.

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
    description: A code (or set of codes) that specify this medication, or a textual description. Usage note: This could be a standard medication code such as a code from RxNorm, SNOMED CT, IDMP etc. It could also be a national or local formulary code, optionally with translations to other code systems. The name of the medication can be conveyed in the code.text even if it is different from any of the coding displayName values.
    short: Codes that identify this medication
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example
    comments: Depending on the context of use, the code that was actually selected by the user (prescriber, dispenser, etc.) will have the coding.userSelected set to true. As described in the coding datatype: "A coding may be marked as a "userSelected" if a user selected the particular coded value in a user interface (e.g. the user selects an item in a pick-list). If a user selected coding exists, it is the preferred choice for performing translations etc. Other codes can only be literal translations to alternative code systems, or codes at a lower level of granularity (e.g. a generic code for a vendor-specific primary one).

  - name: Medication.status
    flags: [?!, Σ]
    cardinality: 0..1
    type: code
    description: A code to indicate if the medication is in active use.
    short: active | inactive | entered-in-error
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-status|4.0.1
      strength: required
    isModifier: true
    modifierReason: This element is labeled as a modifier because it is a status element that contains status 'entered-in-error' which means that the resource should not be treated as valid.
    comments: This status is intended to identify if the medication in a local system is in active use within a drug database or inventory. For example, a pharmacy system may create a new drug file record for a compounded product "ABC Hospital Special Cream" with an active status. At some point in the future, it may be determined that the drug record was created with an error and the status is changed to "entered in error". This status is not intended to specify if a medication is part of a particular formulary. It is possible that the drug record may be referenced by multiple formularies or catalogues and each of those entries would have a separate status.

  - name: Medication.manufacturer
    flags: [Σ]
    cardinality: 0..1
    type: Reference(Organization)
    description: Describes the details of the manufacturer of the medication product. This is not intended to represent the distributor of a medication product.
    short: Manufacturer of the item

  - name: Medication.form
    cardinality: 0..1
    type: CodeableConcept
    description: Describes the form of the item. Powder; tablets; capsule.
    short: powder | tablets | capsule +
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-form-codes
      strength: example
    comments: When Medication is referenced from MedicationRequest, this is the ordered form. When Medication is referenced within MedicationDispense, this is the dispensed form. When Medication is referenced within MedicationAdministration, this is administered form.

  - name: Medication.amount
    flags: [Σ]
    cardinality: 0..1
    type: Ratio
    description: Specific amount of the drug in the packaged product. For example, when specifying a product that has the same strength (For example, Insulin glargine 100 unit per mL solution for injection), this attribute provides additional clarification of the package amount (For example, 3 mL, 10mL, etc.).
    short: Amount of drug in package

  - name: Medication.ingredient
    cardinality: 0..*
    type: BackboneElement
    description: Identifies a particular constituent of interest in the product.
    short: Active or inactive ingredient
    comments: The ingredients need not be a complete list. If an ingredient is not specified, this does not indicate whether an ingredient is present or absent. If an ingredient is specified it does not mean that all ingredients are specified. It is possible to specify both inactive and active ingredients.

  - name: Medication.ingredient.item[x]
    cardinality: 1..1
    # R4 specific: itemCodeableConcept or itemReference
    # Using itemCodeableConcept as primary representation for type for simplicity here, acknowledging the choice.
    type: CodeableConcept # or Reference(Substance | Medication)
    description: The ingredient (substance or medication) that the ingredient.strength relates to. This is represented as a concept from a code system or described in another resource (Substance or Medication).
    short: The actual ingredient or content
    # Binding for itemCodeableConcept choice
    # binding:
    #   valueSet: http://hl7.org/fhir/ValueSet/medication-codes # Example, as per R5 if item is CC
    #   strength: example
    comments: The ingredient may reference a medication substance (for example, amoxicillin) or another medication (for example in the case of a compounded product, Glaxal Base). This element is a choice of CodeableConcept or Reference(Substance | Medication).

  - name: Medication.ingredient.itemCodeableConcept
    # This is part of the choice item[x]
    cardinality: 1..1 # (if item[x] is itemCodeableConcept)
    type: CodeableConcept
    description: The ingredient (substance or medication) that the ingredient.strength relates to, represented as a concept from a code system.
    short: Coded ingredient
    binding:
      valueSet: http://hl7.org/fhir/ValueSet/medication-codes
      strength: example

  - name: Medication.ingredient.itemReference
    # This is part of the choice item[x]
    cardinality: 1..1 # (if item[x] is itemReference)
    type: Reference(Substance | Medication)
    description: The ingredient (substance or medication) that the ingredient.strength relates to, described in another resource.
    short: Referenced ingredient

  - name: Medication.ingredient.isActive
    cardinality: 0..1
    type: boolean
    description: Indication of whether this ingredient affects the therapeutic action of the drug.
    short: Active ingredient indicator
    comments: True indicates that the ingredient affects the therapeutic action of the drug (i.e. active). False indicates that the ingredient does not affect the therapeutic action of the drug (i.e. inactive).

  - name: Medication.ingredient.strength
    cardinality: 0..1
    type: Ratio
    description: Specifies how many (or how much) of the items there are in this Medication. For example, 250 mg per tablet. This is expressed as a ratio where the numerator is 250mg and the denominator is 1 tablet.
    short: Quantity of ingredient present

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
```

constraints: [] # No specific constraints are listed in a dedicated table for Medication R4 beyond standard element cardinalities and type-checking.

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
    expression: Medication.form
  - name: identifier
    type: token
    description: Returns medications with this external identifier
    expression: Medication.identifier
  - name: ingredient
    type: reference
    description: Returns medications for this ingredient reference
    expression: (Medication.ingredient.item as Reference)
    targets: [Medication, Substance]
  - name: ingredient-code
    type: token
    description: Returns medications for this ingredient code
    expression: (Medication.ingredient.item as CodeableConcept)
  - name: lot-number
    type: token
    description: Returns medications in a batch with this lot number
    expression: Medication.batch.lotNumber
  - name: manufacturer
    type: reference
    description: Returns medications made or sold for this manufacturer
    expression: Medication.manufacturer
    targets: [Organization]
  - name: status
    type: token
    description: Returns medications for this status
    expression: Medication.status
```