# map-interaction Specification

## Requirements

### Requirement: Map Rendering
System MUST render Americas GeoJSON on Leaflet with pan/zoom. Countries SHALL highlight on hover.

**Scenario: Hover highlight**
- GIVEN map loaded
- WHEN user hovers a country
- THEN highlight fill and name tooltip SHALL appear

**Scenario: Tiny island click**
- GIVEN Caribbean islands at zoom ≤5
- WHEN island clicked
- THEN target MUST be ≥8px radius and country SHALL select

### Requirement: Country Selection
MUST support click-to-select. Selection SHALL toggle on second click.

**Scenario: Select and deselect**
- GIVEN no selection
- WHEN user clicks "Mexico"
- THEN highlight SHALL show; second click SHALL deselect

### Requirement: Fly-to Capital
System SHALL animate to capital coordinates via `flyTo`.

**Scenario: Animated navigation**
- GIVEN user selects "Argentina" from list
- WHEN fly-to triggers
- THEN map SHALL animate to its capital at zoom ≥6

### Requirement: Legend
Countries SHALL be color-coded by region. Legend MUST label all four regions.

**Scenario: Legend displayed**
- GIVEN map loaded
- WHEN user views legend
- THEN all 4 regions SHALL have distinct colors and labels

### Requirement: Accessibility
MUST provide keyboard nav and list view alternative.

**Scenario: Keyboard focus**
- GIVEN map focused
- WHEN user Tabs through countries
- THEN focus outline SHALL be visible; Enter selects

**Scenario: List fallback**
- GIVEN user switches to list view
- THEN all countries SHALL be sortable and selectable without map
