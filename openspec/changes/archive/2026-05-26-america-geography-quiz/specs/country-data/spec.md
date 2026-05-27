# country-data Specification

## Requirements

### Requirement: Dataset Structure
The dataset MUST include 35+ sovereign countries. Each entry REQUIRES: ISO alpha-2 code, name, capital, coordinates [lat, lng], region, and fun fact.

**Scenario: Valid entry**
- GIVEN dataset loaded
- WHEN querying "Mexico"
- THEN entry SHALL have ISO `MX`, name, capital, coordinates, region `north-america`, non-empty fun fact

### Requirement: Territories Toggle
Territories (e.g., Puerto Rico) MAY be included as optional. Default: excluded. Toggle SHALL include them.

**Scenario: Excluded by default**
- GIVEN dataset lists "Puerto Rico" as territory
- WHEN quiz loads
- THEN it SHALL NOT appear; toggling on SHALL include it

### Requirement: Build Validation
Dataset MUST validate at build time. Duplicates, missing coordinates, invalid GeoJSON SHALL fail the build.

**Scenario: Duplicate ISO fails**
- GIVEN two entries share ISO code
- WHEN build validates
- THEN build SHALL fail with clear error

**Scenario: Missing coordinates fails**
- GIVEN entry has null coordinates
- WHEN build validates
- THEN build SHALL fail naming the country and field
