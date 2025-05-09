# FHIR Device Resource: R4 to R6 Migration Guide

This document details significant changes to the FHIR Device resource between versions R4 and R6, focusing on aspects critical for implementers. It aims to be clear, actionable, dense, and precise to aid in migration and system adaptation when moving from R4 or when supporting both R4 and R6 versions of the Device resource.

## 1. Executive Summary: Key Impacts for Implementers

Migrating the Device resource from R4 to R6 involves several substantial changes, primarily focused on refining its scope, improving data modeling for specific concepts, and enhancing interoperability through new structures and clarifications.

Key impacts include:

1.  **Association with Patient/Owner (Breaking Change):** The R4 `Device.patient` and `Device.owner` elements have been **removed**. In R6, these relationships (device linked to a patient, or device ownership/custodianship) are now managed by the separate **`DeviceAssociation` resource**. This is a fundamental shift requiring significant data model and workflow changes.
2.  **Status Refinement:**
    *   `Device.status` in R6 now *only* refers to the status of the Device resource record itself (`active`, `inactive`, `entered-in-error`).
    *   A new element, **`Device.availabilityStatus` (CodeableConcept)**, has been added in R6 to represent the physical availability of the device (e.g., `lost`, `damaged`, `available`). This replaces the R4 `Device.statusReason` element which was bound to a similar value set.
3.  **UDI Enhancements:**
    *   `Device.udiCarrier.deviceIdentifier` and `Device.udiCarrier.issuer` cardinality changed from `0..1` in R4 to **`1..1` in R6**, making them mandatory if `udiCarrier` is present.
    *   A new element `Device.udiCarrier.deviceIdentifierSystem` (`uri`, `0..1`) was added to specify the namespace for the `deviceIdentifier`.
4.  **New Structured Information Elements:**
    *   **`Device.conformsTo` (BackboneElement, `0..*`):** Replaces R4's `Device.specialization`. This new backbone allows for more detailed representation of standards, specifications, or guidances the device conforms to.
    *   **`Device.additive` (BackboneElement, `0..*`):** New element to describe materials added to a container device (e.g., anticoagulants in a specimen tube).
    *   **`Device.category` (CodeableConcept, `0..*`):** New element for high-level grouping of devices.
    *   **`Device.biologicalSourceEvent` (Identifier, `0..1`):** New element to track production identifiers for biological source material, replacing the more generic R4 `Device.distinctIdentifier`.
5.  **Element Renaming and Type Changes:**
    *   `Device.deviceName` (R4) is renamed to **`Device.name`** in R6. Its sub-element `Device.name.type` changed from `code` to `CodeableConcept` and a new `Device.name.display` (boolean) sub-element was added.
    *   `Device.version` (R4 BackboneElement) is renamed to **`Device.deviceVersion`** in R6. A new `installDate` sub-element was added.
    *   `Device.property.valueQuantity` and `Device.property.valueCode` (R4) are consolidated into a polymorphic **`Device.property.value[x]`** in R6, supporting a wider range of data types.
6.  **Search Parameter Overhaul:** Several search parameters were removed (e.g., `patient`, `organization`, `url`), new ones added (e.g., `biological-source-event`, `expiration-date`, `lot-number`, `specification`), and some renamed or had their expressions updated (e.g., R4 `type` to R6 `code`, R4 `name` to R6 `device-name`).
7.  **Element Removals:** `Device.statusReason`, `Device.distinctIdentifier`, `Device.specialization`, and `Device.url` were removed from R4.

Implementers must carefully review these changes, particularly the handling of patient/owner associations, status fields, and the new structured elements, to ensure a smooth transition or dual support.

## 2. Overall Resource Scope and Purpose Evolution

*   **R4 Focus:** Primarily administrative tracking of individual device instances, their static information (manufacturer, UDI), location, and direct links to patient and owner.
*   **R6 Refinement:**
    *   The core purpose remains tracking device instances, but with a clearer separation of concerns.
    *   **Decoupling of Associations:** Patient and owner associations are now explicitly managed by the `DeviceAssociation` resource, making the `Device` resource itself more focused on the intrinsic properties of the device.
    *   **Enhanced Status Model:** Clearer distinction between the record's status (`Device.status`) and the device's physical availability (`Device.availabilityStatus`).
    *   **Richer Conformance and Additive Information:** Introduction of `conformsTo` and `additive` allows for more structured and detailed representation of these aspects.
    *   **Explicit Categorization:** Addition of `Device.category` for better high-level classification.
    *   The R6 documentation provides more comprehensive guidance on UDI representation and interaction with other resources in the device module (e.g., `DeviceDefinition`, `DeviceMetric`, `DeviceAlert`).

*   **Impact:** Systems supporting R6 will need to interact with `DeviceAssociation` for patient/owner linkage. The refined status model requires changes in how device availability is recorded and queried. The new elements offer opportunities for richer data capture but also require new handling logic.

## 3. Element-Level Changes

### 3.1. New Elements in R6

The following significant elements have been added in R6:

*   **`Device.udiCarrier.deviceIdentifierSystem`**
    *   **Cardinality:** `0..1`
    *   **Type:** `uri`
    *   **Short Description/Purpose:** Establishes the namespace for the `deviceIdentifier` value.
    *   **Key Impact/Action for Implementers:** If using UDIs, this allows for more precise identification of the `deviceIdentifier`'s context.

*   **`Device.availabilityStatus`**
    *   **Cardinality:** `0..1`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/device-availability-status` (extensible) (e.g., `lost`, `damaged`, `destroyed`, `available`)
    *   **Short Description/Purpose:** Describes the physical availability of the device. This conceptually replaces R4's `Device.statusReason`.
    *   **Key Impact/Action for Implementers:** **Breaking Change** from R4's `statusReason`. Data from `statusReason` (if used for availability) needs to be migrated. Logic handling device availability must be updated.

*   **`Device.biologicalSourceEvent`**
    *   **Cardinality:** `0..1`
    *   **Type:** `Identifier`
    *   **Short Description/Purpose:** Production identifier for biological source material from which the device (or part of it) was derived. Replaces R4's `Device.distinctIdentifier` for this specific use case.
    *   **Key Impact/Action for Implementers:** For devices with biological components (e.g., HCT/Ps), use this new element for traceability. Data from R4 `distinctIdentifier` related to biological sources should be migrated here.

*   **`Device.name.display`** (within the renamed `Device.name` backbone)
    *   **Cardinality:** `0..1`
    *   **Type:** `boolean`
    *   **isModifier:** `true`
    *   **Short Description/Purpose:** Indicates if this specific name is the default or preferred name to be displayed.
    *   **Key Impact/Action for Implementers:** If multiple names are provided, this flag helps identify the primary display name. Subject to constraint `dev-1`.

*   **`Device.category`**
    *   **Cardinality:** `0..*`
    *   **Type:** `CodeableConcept`
    *   **Binding:** `http://hl7.org/fhir/ValueSet/device-category` (example strength)
    *   **Short Description/Purpose:** High-level grouping for the device (e.g., active, implantable, single-use).
    *   **Key Impact/Action for Implementers:** Provides a new way to classify devices, useful for queries and categorization.

*   **`Device.deviceVersion.installDate`** (within the renamed `Device.deviceVersion` backbone)
    *   **Cardinality:** `0..1`
    *   **Type:** `dateTime`
    *   **Short Description/Purpose:** The date the version was installed on the device.
    *   **Key Impact/Action for Implementers:** Useful for tracking software/firmware update history.

*   **`Device.conformsTo` (BackboneElement)**
    *   **Cardinality:** `0..*`
    *   **Type:** BackboneElement, containing:
        *   `category`: `CodeableConcept` (e.g., communication, performance, measurement)
        *   `specification`: `CodeableConcept` (specific standard/specification)
        *   `version`: `string` (version of the standard)
    *   **Short Description/Purpose:** Identifies standards, specifications, or guidances the device conforms to. This replaces the R4 `Device.specialization` element with a more structured approach.
    *   **Key Impact/Action for Implementers:** **Breaking Change** for R4 `Device.specialization`. Data must be migrated to this new structure. Offers richer detail on device capabilities and compliance.

*   **`Device.additive` (BackboneElement)**
    *   **Cardinality:** `0..*`
    *   **Type:** BackboneElement, containing:
        *   `type`: `CodeableReference(Substance)` (the additive substance)
        *   `quantity`: `SimpleQuantity` (amount of additive)
        *   `performer`: `Reference(Practitioner | PractitionerRole | Organization | Patient | RelatedPerson)` (who added it)
        *   `performed`: `dateTime` (when it was added)
    *   **Short Description/Purpose:** Describes material added to a container device (e.g., anticoagulants in specimen tubes).
    *   **Key Impact/Action for Implementers:** New capability for devices like specimen containers. Systems handling such devices may need to implement this.

### 3.2. Modified Elements (R4 to R6)

Key existing elements have been modified as follows:

*   **`Device.udiCarrier.deviceIdentifier`**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `1..1`
    *   **Key Impact/Action for Implementers:** **Breaking Change.** If a `udiCarrier` element is present, `deviceIdentifier` is now mandatory. Systems creating Device resources must ensure this is populated.

*   **`Device.udiCarrier.issuer`**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `1..1`
    *   **Key Impact/Action for Implementers:** **Breaking Change.** If a `udiCarrier` element is present, `issuer` is now mandatory. Systems creating Device resources must ensure this is populated.

*   **`Device.udiCarrier.entryType`**
    *   **R4 Value Set:** Contained `barcode | rfid | manual | card | self-reported | unknown`. (Comment noted 'manual+' suggesting extensibility)
    *   **R6 Value Set:** `http://hl7.org/fhir/ValueSet/udi-entry-type` now also includes `electronic-transmission`.
    *   **Key Impact/Action for Implementers:** A new option `electronic-transmission` is available. Review mappings if this new code is relevant.

*   **`Device.status`**
    *   **R4 Short Description:** "active | inactive | entered-in-error | unknown" - focused on availability.
    *   **R6 Short Description:** "active | inactive | entered-in-error" - explicitly "The Device record status. This is not the status of the device like availability."
    *   **R4 Value Set:** `http://hl7.org/fhir/ValueSet/device-status|4.0.1` (included `unknown`).
    *   **R6 Value Set:** `http://hl7.org/fhir/ValueSet/device-status` (does not include `unknown`). The physical availability is now handled by `Device.availabilityStatus`.
    *   **Key Impact/Action for Implementers:** **Breaking Change in Semantics.** `Device.status` no longer reflects device availability. The `unknown` status is removed. Logic and data related to device availability must now use `Device.availabilityStatus`. Data migration will be needed to map R4 `Device.status` values (especially `active`, `inactive` when they meant availability) to R6 `Device.availabilityStatus`.

*   **`Device.name` (Renamed from `Device.deviceName`)**
    *   **R4 Path:** `Device.deviceName`
    *   **R6 Path:** `Device.name`
    *   Sub-elements:
        *   `Device.deviceName.name` (R4) -> `Device.name.value` (R6) (Type: `string`, Cardinality: `1..1` remains)
        *   `Device.deviceName.type` (R4)
            *   **R4 Type:** `code`
            *   **R4 Binding:** `http://hl7.org/fhir/ValueSet/device-nametype` (required strength, values: `udi-label-name | user-friendly-name | patient-reported-name | manufacturer-name | model-name | other`)
        *   `Device.name.type` (R6)
            *   **R6 Type:** `CodeableConcept`
            *   **R6 Binding:** `http://hl7.org/fhir/ValueSet/device-nametype` (extensible strength, values: `registered-name | user-friendly-name | patient-reported-name`) - Note value set changes.
        *   New in R6: `Device.name.display` (`boolean`, `0..1`, `isModifier: true`)
    *   **Key Impact/Action for Implementers:** **Breaking Change** due to renaming and type change of `type`. Data migration is needed. The `name.type` change to `CodeableConcept` allows for more flexible coding. The `name.display` flag helps manage multiple names. Value set for `name.type` has changed, requiring review of existing codes.

*   **`Device.type`**
    *   **R4 Cardinality:** `0..1`
    *   **R6 Cardinality:** `0..*`
    *   **Key Impact/Action for Implementers:** Now supports multiple types for a single device instance (e.g., for hybrid devices). Systems must be able to handle an array of `CodeableConcept`s.

*   **`Device.deviceVersion` (Renamed from `Device.version`)**
    *   **R4 Path:** `Device.version`
    *   **R6 Path:** `Device.deviceVersion`
    *   Sub-elements are largely similar (`type`, `component`, `value`), but R6 adds `Device.deviceVersion.installDate` (`dateTime`, `0..1`).
    *   `Device.deviceVersion.type` binding: R6 adds an example strength binding to `http://hl7.org/fhir/ValueSet/device-versiontype`.
    *   **Key Impact/Action for Implementers:** Renaming requires code updates. The new `installDate` can be populated if available.

*   **`Device.property.value[x]` (Replaces `valueQuantity` and `valueCode`)**
    *   **R4 Types:** `Device.property.valueQuantity` (`Quantity`, `0..*`), `Device.property.valueCode` (`CodeableConcept`, `0..*`)
    *   **R6 Type:** `Device.property.value[x]` (Choice of: `Quantity`, `CodeableConcept`, `string`, `boolean`, `integer`, `Range`, `Attachment`), Cardinality: `1..1` (Note: R6 makes `value[x]` mandatory if `property` is present, while in R4, `valueQuantity` or `valueCode` could be absent if the other was present, though both were 0..* suggesting multiple values could be sent. The R6 structure implies one value per property entry, but multiple property entries are allowed.)
    *   **Key Impact/Action for Implementers:** **Breaking Change.** R4's separate `valueQuantity` and `valueCode` are replaced by a single polymorphic `value[x]`. Data must be migrated to the appropriate `value[x]` type. R6 allows for a wider range of property value types. The cardinality change to `1..1` for `value[x]` means each `Device.property` entry must have a value.

*   **`Device.safety`**
    *   **R4 Binding Strength:** None explicitly stated (likely example)
    *   **R6 Binding Strength:** `example` to `http://hl7.org/fhir/ValueSet/device-safety`
    *   **Key Impact/Action for Implementers:** Binding clarified, but likely no significant change if already using relevant codes.

### 3.3. Removed Elements from R4

*   **`Device.statusReason`**
    *   **R4 Type:** `CodeableConcept`, `0..*`
    *   **Rationale / Key Impact:** Functionality largely superseded by the new `Device.availabilityStatus` element in R6, which has a more specific purpose and value set.
        *   **Action:** **Breaking Change.** Migrate relevant data from `statusReason` to `availabilityStatus` if it was used for availability concepts.

*   **`Device.distinctIdentifier`**
    *   **R4 Type:** `string`, `0..1`
    *   **Rationale / Key Impact:** For HCT/P products, its purpose is now better served by the new `Device.biologicalSourceEvent` (Identifier) element. For other uses, general identifiers should be in `Device.identifier`.
        *   **Action:** Migrate data to `Device.biologicalSourceEvent` if it pertains to biological source identification. Otherwise, assess if it belongs in `Device.identifier`.

*   **`Device.specialization` (BackboneElement)**
    *   **R4 Type:** BackboneElement, `0..*` (with `systemType` and `version`)
    *   **Rationale / Key Impact:** Replaced by the more comprehensive and structured `Device.conformsTo` backbone element in R6.
        *   **Action:** **Breaking Change.** Data from `specialization` needs to be mapped and migrated to the new `conformsTo` structure.

*   **`Device.patient`**
    *   **R4 Type:** `Reference(Patient)`, `0..1`
    *   **Rationale / Key Impact:** This direct link has been removed. Patient-device associations are now handled by the `DeviceAssociation` resource in R6.
        *   **Action:** **Major Breaking Change.** Implementers must create/query `DeviceAssociation` resources to manage or find device-patient links. Data migration involves creating `DeviceAssociation` instances from existing `Device.patient` references.

*   **`Device.owner`**
    *   **R4 Type:** `Reference(Organization)`, `0..1`
    *   **Rationale / Key Impact:** This direct link has been removed. Device ownership/custodianship is now handled by the `DeviceAssociation` resource in R6.
        *   **Action:** **Major Breaking Change.** Implementers must create/query `DeviceAssociation` resources for ownership information. Data migration involves creating `DeviceAssociation` instances.

*   **`Device.url`**
    *   **R4 Type:** `uri`, `0..1`
    *   **Rationale / Key Impact:** Element removed. The R6 documentation notes some R4 elements (like endpoint) are planned for a future Extension Pack. Direct network accessibility might be handled differently or via extensions.
        *   **Action:** Assess alternative ways to store this information if needed, possibly via extensions, or await future guidance.

## 4. Key Data Modeling and Relationship Changes

The most profound data modeling change is the **extraction of device-subject and device-owner relationships into the separate `DeviceAssociation` resource.**

*   **R4:** `Device.patient` (Reference(Patient)) and `Device.owner` (Reference(Organization)) directly linked a device instance to a patient or owning organization.
*   **R6:** These direct links are gone.
    *   To associate a device with a patient (e.g., an implanted device, a device used by a patient), a `DeviceAssociation` resource is created where `DeviceAssociation.device` points to the `Device` and `DeviceAssociation.subject` points to the `Patient`.
    *   To indicate ownership or custodianship, `DeviceAssociation.bodyStructure` (for implanted in a location) or `DeviceAssociation.subject` (if directly associated with person/org for other reasons) and specific `category` codes within `DeviceAssociation` would be used.
*   **Impact:**
    *   **Data Migration:** Existing `Device.patient` and `Device.owner` data needs to be transformed into `DeviceAssociation` resources.
    *   **API Interactions:** Queries for devices associated with a specific patient now require querying `DeviceAssociation` (e.g., `GET DeviceAssociation?subject=Patient/123&_include=DeviceAssociation:device`) instead of directly on `Device` (e.g., R4's `GET Device?patient=Patient/123`).
    *   **System Logic:** Applications need to be updated to create, read, and manage these new `DeviceAssociation` resources. This separation can provide a more flexible and detailed model for various types of associations.

## 5. Significant Constraint Changes

*   **`dev-1` (New in R6):**
    *   **Severity:** Rule
    *   **Expression:** `name.where(display=true).count() <= 1`
    *   **Description:** "only one Device.name.display SHALL be true when there is more than one Device.name"
    *   **Impact:** If multiple `Device.name` entries exist, at most one can be flagged as the preferred display name. This requires validation logic.

No constraints appear to have been directly removed from R4 to R6, as R4 did not list formal constraints in the provided document.

## 6. Search Parameter Differences

Significant changes have occurred in search parameters:

### 6.1. Removed Search Parameters (from R4)

*   **`patient`**: Was `Reference(Patient)`, Expression: `Device.patient`.
    *   **Reason/Impact:** Removed because `Device.patient` element is removed. Patient linkage is now via `DeviceAssociation`. Queries for devices by patient need to target `DeviceAssociation`. **Breaking Change for Queries.**
*   **`organization`**: Was `Reference(Organization)`, Expression: `Device.owner`.
    *   **Reason/Impact:** Removed because `Device.owner` element is removed. Ownership is now via `DeviceAssociation`. Queries for devices by owner need to target `DeviceAssociation`. **Breaking Change for Queries.**
*   **`url`**: Was `uri`, Expression: `Device.url`.
    *   **Reason/Impact:** Removed because `Device.url` element is removed. **Breaking Change for Queries.**

### 6.2. New Search Parameters in R6

*   **`biological-source-event`**: Type: `token`, Expression: `Device.biologicalSourceEvent`
*   **`code-value-concept`**: Type: `composite` (for `Device.conformsTo.specification` + `version`)
*   **`definition`**: Type: `reference`, Expression: `Device.definition` (Targets: `DeviceDefinition`) - This existed implicitly in R4 but is now explicitly listed.
*   **`expiration-date`**: Type: `date`, Expression: `Device.expirationDate`
*   **`lot-number`**: Type: `string`, Expression: `Device.lotNumber`
*   **`manufacture-date`**: Type: `date`, Expression: `Device.manufactureDate`
*   **`parent`**: Type: `reference`, Expression: `Device.parent` (Targets: `Device`)
*   **`serial-number`**: Type: `string`, Expression: `Device.serialNumber | Device.identifier.where(type='SNO')` (More specific than just generic `identifier`)
*   **`specification`**: Type: `token`, Expression: `Device.conformsTo.specification`
*   **`specification-version`**: Type: `composite` (for `Device.conformsTo.specification` + `version`)
*   **`version`**: Type: `string`, Expression: `Device.deviceVersion.value`
*   **`version-type`**: Type: `composite` (for `Device.deviceVersion.type` + `value`)

### 6.3. Modified/Renamed Search Parameters

*   **`code` (R6) vs. `type` (R4 `Device.type`)**
    *   **R4 `type`**: Type: `token`, Expression: `Device.type`
    *   **R6 `code`**: Type: `token`, Expression: `Device.type | Device.definition.resolve().classification.type`
    *   **Impact:** R6 `code` is broader, searching `Device.type` and also `DeviceDefinition.classification.type` via the `definition` reference. R4 `type` was simpler. This is a **Breaking Change** in behavior and name for the old `type` search.
        *   *Note:* R6 also introduces a separate search parameter named `type` with the expression `Device.type | Device.definition.resolve().classification.type`. This seems to be a direct replacement/enhancement of the R4 `type` parameter, and the R6 `code` parameter is a duplicate or a planned alternative. Assuming R6 `type` is the intended evolution of R4 `type`. The provided R6 markdown lists both `code` and `type` with identical expressions for device type; clarification from the standard might be needed, but for migration, assume that searching by device "type" involves this more complex expression.

*   **`device-name` (R6) vs. `device-name` (R4, similar but slightly different expression potential)**
    *   **R4 `device-name`**: Type: `string`, Expression: `Device.deviceName.name | Device.type.coding.display | Device.type.text`
    *   **R6 `device-name`**: Type: `string`, Expression: `Device.name.value | Device.type.coding.display | Device.type.text`
    *   **Impact:** Element path change from `deviceName.name` to `name.value`. Query logic may need slight adjustment if custom parsing was done server-side beyond the FHIR path.

*   **`model` (R4) vs. `model` (R6)**
    *   **R4 `model`**: Expression: `Device.modelNumber` (based on R4 definition page note).
    *   **R6 `model`**: Expression: `Device.modelNumber`.
    *   **Impact:** Seems consistent, but ensure R4 implementations were indeed using `Device.modelNumber` for this search.

*   **`udi-carrier-hrf` (R6) vs. `udi-carrier` (R4)**
    *   **R4 `udi-carrier`**: Expression: `Device.udiCarrier.carrierHRF`
    *   **R6 `udi-carrier-hrf`**: Expression: `Device.udiCarrier.carrierHRF`
    *   **Impact:** Renamed. Queries must use the new parameter name `udi-carrier-hrf`. **Breaking Change for Queries.**

### 6.4. Unchanged Search Parameters (or Minor Semantic Shifts)

*   **`identifier`**: Remains `token`, Expression: `Device.identifier`
*   **`location`**: Remains `reference`, Expression: `Device.location`
*   **`manufacturer`**: Remains `string`, Expression: `Device.manufacturer`
*   **`status`**: Remains `token`, Expression: `Device.status`. However, the *meaning* of `Device.status` has changed (record status vs. availability), so queries using this parameter will behave differently in terms of what they find related to device availability.
*   **`udi-di`**: Remains `string`, Expression: `Device.udiCarrier.deviceIdentifier`

## 7. Key Migration Actions & Considerations

1.  **Handle Patient/Owner Association (Critical - Breaking Change):**
    *   Modify data models to use `DeviceAssociation` resource instead of `Device.patient` and `Device.owner`.
    *   Migrate existing `Device.patient` and `Device.owner` data by creating corresponding `DeviceAssociation` resources.
    *   Update all API queries and application logic that relied on `Device.patient` or `Device.owner` to now query/use `DeviceAssociation`.

2.  **Adapt to Status Model Changes (Critical - Breaking Change):**
    *   Recognize that `Device.status` in R6 is for record status only (`active`, `inactive`, `entered-in-error`).
    *   Implement the new `Device.availabilityStatus` element for physical device availability.
    *   Migrate data from R4 `Device.status` (if it represented availability) and `Device.statusReason` to the new R6 `Device.availabilityStatus`.
    *   Remove the `unknown` value from `Device.status` if used.

3.  **Address UDI Cardinality Changes (Breaking Change):**
    *   Ensure `Device.udiCarrier.deviceIdentifier` and `Device.udiCarrier.issuer` are always populated if `Device.udiCarrier` is present. Update systems creating Device resources.

4.  **Implement New Structured Elements:**
    *   **`conformsTo`:** Migrate data from R4 `Device.specialization` to the new `Device.conformsTo` structure. Implement logic to handle this richer backbone element.
    *   **`additive`:** If dealing with container devices with additives, implement support for this new backbone.
    *   **`category`:** Utilize for high-level device categorization.
    *   **`biologicalSourceEvent`:** Use for traceability of biological components, migrating from R4 `distinctIdentifier` where appropriate.

5.  **Manage Element Renaming and Type Changes:**
    *   **`Device.name` (from `deviceName`):** Update paths. Adapt to `name.type` being `CodeableConcept` (from `code`) and its changed value set. Support new `name.display` boolean.
    *   **`Device.deviceVersion` (from `version`):** Update paths. Consider populating new `installDate`.
    *   **`Device.property.value[x]`:** Update logic to handle the polymorphic `value[x]` and migrate data from `valueQuantity`/`valueCode`. Ensure each property has a value.
    *   **`Device.type` cardinality:** Update systems to handle `0..*` (array) for `Device.type`.

6.  **Update Validation Logic:** Implement the new `dev-1` constraint for `Device.name.display`.

7.  **Revise API Queries (Critical):**
    *   Remove usage of `patient`, `organization`, and `url` search parameters.
    *   Update queries for `udi-carrier` to use `udi-carrier-hrf`.
    *   Update queries for device "type" to use the R6 `type` or `code` search parameter (with its more complex expression).
    *   Familiarize with and utilize new search parameters (e.g., `biological-source-event`, `specification`, `expiration-date`, `lot-number`, `parent`, `serial-number`, `version`).
    *   Be aware of the semantic shift in queries using the `status` parameter.

8.  **Handle Removed Elements:** Ensure no new data is written to `Device.statusReason`, `Device.distinctIdentifier`, `Device.specialization`, or `Device.url`. Plan for migration of any existing data.

9.  **Review Terminology Bindings:** Check changes in value sets (e.g., `Device.name.type`, `Device.udiCarrier.entryType`) and binding strengths.

This migration involves significant structural and semantic changes. Thorough testing of data migration, API interactions, and application logic is crucial.
