# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Dispatch Controllers and Fleet Operations Coordinators operating in a high-tempo enterprise control desk environment. Their primary job is planning daily dispatch scenarios, optimizing vehicle route sequencing, resolving capacity bottlenecks and unserved exceptions, and tracking active vehicle-driver assignments across distribution hubs.

## Product Purpose

RoutePilot serves as an enterprise logistics control tower platform that generates balanced, capacity-constrained delivery routes using nearest-neighbour routing heuristics, vehicle payload thresholds (weight in kg and volume in m³), customer priority constraints, and straight-line proximity calculations. Success means fast, reliable route sequencing with zero duplicate dispatches, clear exception reporting for unserved stops, and total operational clarity.

## Positioning

Unlike generic AI dashboard concepts or consumer delivery trackers, RoutePilot is an industrial-grade operations platform designed for mission-critical logistics desks: high-density data tables, zero decorative visual noise, instant scanability, and transparent heuristic route explainability.

## Operating Context

- Real-time interaction with a Spring Boot REST API (`/api/v1/optimization/run`, `/api/v1/customer-sites`, `/actuator/health`) backed by PostgreSQL.
- Multi-monitor or high-resolution desktop control rooms, with tablet and mobile field accessibility.
- Operators review dozens of customer stops per run, requiring compact tabular presentation, monospace identifiers, clear status pills, and instant scenario re-planning.

## Capabilities and Constraints

- **Route Optimization Engine:** Executes Nearest Neighbour routing based on straight-line Haversine distance and service time estimates; enforces vehicle weight and volume capacity constraints.
- **Empty Delivery Handling:** Explicitly catches empty delivery scenarios (`assignedCount: 0`) and returns actionable system messages without crashing.
- **Exception Reporting:** Surfaces unserved delivery demands with machine reason codes (e.g., `VEHICLE_CAPACITY_EXCEEDED`, `NO_CAPACITY`).
- **Network Directory:** Live querying of customer sites, warehouses, and depots via `/api/v1/customer-sites`.
- **Backend Architecture Boundary:** Backend does not currently provide standalone `/api/v1/vehicles` or `/api/v1/deliveries` endpoints; UI displays active dispatch state from optimization runs and database schema reference profiles.

## Brand Commitments

- **Product Identity:** RoutePilot ("Logistics Intelligence").
- **Palette Foundation:** Deep navy (`#080d18`, `#0b1220`, `#101827`) and charcoal foundations with restrained electric cyan (`cyan-400`, `cyan-300`) accent hierarchy.
- **Visual Discipline:** Premium enterprise SaaS control tower; avoid generic AI-generated aesthetics, excessive gradients, glassmorphism, or non-functional animations.
- **Density:** Compact and high-density information architecture suited for logistics control desks.

## Evidence on Hand

- Fully functional Spring Boot backend running on port 8080 with Actuator health, Customer Sites, and Optimization run endpoints.
- PostgreSQL V1 schema with tables for `region`, `customer_site`, `vehicle`, `vehicle_capacity`, `driver`, `driver_shift`, `delivery`, `route`, `route_stop`, and `optimization_assignment`.
- Existing React 19 + Vite + Tailwind CSS v4 frontend codebase with working 4-module navigation.

## Product Principles

1. **Operational Readability First:** Critical metrics (payload, stops, distance, duration, run ID) must be visible and scannable at a single glance without unnecessary scrolling or decorative distraction.
2. **Deterministic & Transparent:** Label routing metrics accurately (straight-line Haversine estimates) and clearly distinguish between assigned deliveries and unserved capacity exceptions.
3. **High-Density Control Tower Layout:** Compact row heights, crisp monospace identifiers (`DEL-...`, `RUN-...`, `VEH-...`), and functional status badges take precedence over spacious consumer whitespace.
4. **Resilient Error & Empty States:** Every state—loading, empty scenario, offline API, server exception—must provide clear operational context and recovery actions.
5. **Architectural Honesty:** Accurately represent backend capabilities and data sources without inventing fake API endpoints or masking backend boundaries.

