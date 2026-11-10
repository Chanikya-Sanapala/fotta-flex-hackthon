# RoutePilot — Enterprise Logistics Intelligence & Route Optimization Platform

RoutePilot is an enterprise-grade logistics dispatch and route optimization platform. Designed for high-tempo dispatch desks, it balances delivery demand with vehicle capacity constraints using heuristic routing, dual-limit payload checks (weight in kg and volume in m³), customer priority rules, and spatial proximity calculations.

The platform pairs a **Spring Boot 4.1.2 / Java 17** backend and **PostgreSQL 16** relational data engine with a **React 19 / Vite / Tailwind CSS v4** frontend featuring a minimal, light Apple-inspired glassmorphism interface.

---

## Architecture Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                   RoutePilot Web Client (React 19 + Vite)              │
│       Overview  ·  Route Planning  ·  Fleet Assets  ·  Deliveries      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST (Port 8080)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Spring Boot 4.1.2 Backend (Java 17)                    │
│   ┌─────────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│   │ Optimization Engine │  │  Fleet Service   │  │Delivery Service │   │
│   │  (Nearest Neighbour)│  │ (Capacity/Shift) │  │(Route Sequences)│   │
│   └─────────────────────┘  └──────────────────┘  └─────────────────┘   │
│   ┌─────────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│   │Customer Site Service│  │ Actuator Health  │  │Global Exceptions│   │
│   └─────────────────────┘  └──────────────────┘  └─────────────────┘   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ JDBC / JPA
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      PostgreSQL 16 Database                            │
│  customer_site · vehicle · vehicle_capacity · driver · driver_shift    │
│    orders · delivery · route · route_stop · optimization_assignment    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## End-to-End Functional Workflow

RoutePilot manages the entire logistics planning cycle from order demand ingestion to vehicle dispatch and exception handling:

```
[Customer Sites & Orders] ──▶ [Fleet & Driver Shifts] ──▶ [Route Optimizer Engine]
                                                                    │
           ┌────────────────────────────────────────────────────────┴──────────────────────────┐
           ▼                                                                                   ▼
 [Assigned Route Stops]                                                              [Unserved Exceptions]
 - Sequential Stops (1..N)                                                           - Payload Exceeded
 - Haversine Distance & Transit Duration                                             - Time Window Violation
 - Payload Accumulation (kg & m³)                                                    - Driver Shift Limit
           │                                                                                   │
           ▼                                                                                   ▼
 [Active Fleet Dispatch]                                                             [Exception Reporting]
 - Route Status: PLANNED / DISPATCHED                                                - Reason Code Audit
 - Real-Time Control Center Table                                                    - Scenario Re-planning
```

### 1. Logistics Network & Order Demand Ingestion
- Central distribution hubs (`WAREHOUSE` or `DEPOT`) and customer delivery drop-off sites (`CUSTOMER`) are registered in `customer_site` with precise geographic coordinates (latitude / longitude).
- Customer orders generate scheduled deliveries with specific demand weights (kg), volumes (m³), service dwell times (minutes), and priority tiers (`URGENT`, `HIGH`, `NORMAL`, `LOW`).

### 2. Fleet Asset & Driver Shift Verification
- Available delivery vehicles (`vehicle`), registered capacity limits (`vehicle_capacity`), and active drivers (`driver`) are cross-referenced with daily scheduled shifts (`driver_shift`).
- Before routing, RoutePilot verifies vehicle payload ceilings (e.g., 1,000 kg / 10.0 m³) and ensures active driver shift windows (`shift_start` to `shift_end`).

### 3. Heuristic Route Optimization
- The dispatcher initiates an optimization run from the **Route Planning** view by supplying a target `planningDate`, scenario identifier, and traffic multiplier (`NORMAL`, `PEAK`, `LOW`).
- `POST /api/v1/optimization/run` executes a deterministic **Nearest Neighbour** heuristic algorithm:
  1. Computes straight-line Haversine distances from the departure depot to candidate delivery sites.
  2. Greedily assigns the nearest feasible delivery stop.
  3. Enforces dual capacity checks on every candidate addition:
     $$\sum \text{weight} \le \text{maxWeightKg} \quad \text{and} \quad \sum \text{volume} \le \text{maxVolumeM3}$$
  4. Returns the vehicle back to the depot after the final delivery stop.
  5. Computes total estimated travel duration plus accumulated on-site service dwell times.

### 4. Route Generation & Sequence Assignment
- Upon completion, the engine inserts a persistent `route` record and ordered `route_stop` records (`sequence_number = 1..N`).
- Associated deliveries in the `delivery` table transition to `PLANNED` status.
- If demand exceeds vehicle payload or volume limits, unassigned deliveries are recorded in `optimization_assignment` with `assignment_status = 'UNSERVED'` and machine reason codes (e.g., `VEHICLE_CAPACITY_EXCEEDED`).

### 5. Control Center Monitoring & Audit
- **Overview Dashboard:** Scans real-time KPI metrics, route execution summaries, and logistics facility counts.
- **Route Planning:** Displays the sequential stop-by-stop itinerary (`Stop 01`, `Stop 02`, etc.), total distance, and duration.
- **Fleet View:** Streams verified asset records, capacity utilization progress bars, active driver assignments, and database table lineage.
- **Deliveries View:** Searchable directory of all delivery records, orders, assigned stop numbers, and facility destinations.

---

## REST API Reference

All endpoints return camelCase JSON and include CORS configuration for `http://localhost:5173`.

| Method | Endpoint | Description | Query Parameters / Body |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/optimization/latest` | Retrieve latest completed optimization run | `?planningDate=YYYY-MM-DD` |
| `POST` | `/api/v1/optimization/run` | Execute Nearest Neighbour route optimization | `{ "planningDate": "YYYY-MM-DD", "scenarioName": "...", "trafficScenario": "NORMAL" }` |
| `GET` | `/api/v1/fleet` | Query vehicle registry, capacities, drivers, and dispatch state | `?active=true` *(optional)* |
| `GET` | `/api/v1/fleet/{id}` | Query single vehicle details by vehicle ID | — |
| `GET` | `/api/v1/deliveries` | List operational delivery records with stop sequences | `?status=PLANNED&date=YYYY-MM-DD` *(optional)* |
| `GET` | `/api/v1/deliveries/{id}` | Retrieve delivery details by delivery ID | — |
| `GET` | `/api/v1/customer-sites` | List warehouses, depots, and customer sites | — |
| `GET` | `/actuator/health` | Service health check (`UP` / `DOWN`) | — |

---

## Database Relational Model

PostgreSQL 16 relational tables initialized in `database/migrations/V1__initial_schema.sql`:

```
 customer_site (site_id PK) ────────┐
                                    │
 orders (order_id PK)               ▼
   │                          ┌─────────────┐
   └───▶ delivery (delivery_id PK)          │
           │                                │
           ▼                                ▼
         route_stop ◀───────────── route (route_id PK)
           ▲                         ▲
           │                         ├── vehicle (vehicle_id PK) ◀── vehicle_capacity
 optimization_assignment             └── driver (driver_id PK) ◀──── driver_shift
           ▲
           │
 optimization_run (run_id PK)
```

- **`region` / `customer_site`:** Geographic boundaries, warehouse hubs, and customer delivery points.
- **`vehicle` / `vehicle_capacity`:** Vehicle asset registry with temporal payload weight (kg) and volume (m³) limits.
- **`driver` / `driver_shift`:** Driver credentials, shift dates, and operational schedules.
- **`orders` / `order_item` / `delivery`:** Order items and delivery demands with priority levels and statuses.
- **`optimization_run` / `optimization_assignment`:** Audit log of optimization executions, objective values, and unserved reason codes.
- **`route` / `route_stop`:** Sequential dispatch routes with distance, duration, and stop sequence numbers.

---

## Design System: Light Apple-Inspired Glassmorphism

The frontend adheres to a minimal, light Apple/macOS design system prioritizing legibility, scannability, and structural restraint:

- **Color Tokens:**
  - Background Canvas: `#F5F6F8`
  - Translucent Glass Surfaces: `rgba(255, 255, 255, 0.78)` with `backdrop-filter: blur(16px)`
  - Solid Surfaces: `#FFFFFF`
  - Typography: Primary `#17191D`, Secondary `#777E87`, Tertiary `#9DA4AE`
  - Accent Color: `#4778D5` (Apple System Blue)
  - Status Tiers: Success `#27865B`, Warning `#C28A35`, Danger `#C65353`
  - Subtle Borders: `rgba(20, 30, 50, 0.08)`
- **Zero Icon Dependency:** Eliminates all decorative and icon library dependencies in favor of clean typographic labels, monospace identifiers (`HYD-VAN-001`, `DEL-001`), sequence tags (`Stop 01`), and 4–6px colored CSS status dots.
- **System Typography:** `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif`.

---

## Getting Started

### Prerequisites
- **Java 17+** (JDK)
- **Node.js 18+** & npm
- **Docker & Docker Compose** (for PostgreSQL)

### 1. Start the PostgreSQL Database
```bash
docker-compose up -d postgres
```
Database credentials configured in `docker-compose.yml`:
- Port: `5432`
- Database: `logistics_db`
- Username: `logistics_admin`
- Password: `logistics_dev_password`

### 2. Run the Spring Boot Backend
```bash
cd backend/logistics-api
./mvnw spring-boot:run
```
*(On Windows PowerShell, run `.\mvnw.cmd spring-boot:run`)*

The backend will start on `http://localhost:8080`. Verify health:
```bash
curl http://localhost:8080/actuator/health
# Returns: {"status":"UP","groups":["liveness","readiness"]}
```

### 3. Run the React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Verification & Testing Commands

### Backend Compilation & Tests
```bash
cd backend/logistics-api
.\mvnw.cmd clean compile
```

### Frontend Linting & Production Build
```bash
cd frontend
npm run lint
npm run build
```

### Sample API Invocations (PowerShell)

**1. Query Live Fleet Assets:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/fleet" -Method GET | ConvertTo-Json -Depth 5
```

**2. Query Delivery Records & Sequences:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/deliveries" -Method GET | ConvertTo-Json -Depth 5
```

**3. Run Route Optimization:**
```powershell
$body = @{
    planningDate    = "2026-11-10"
    scenarioName    = "HYDERABAD_DEMO"
    trafficScenario = "NORMAL"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/optimization/run" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

**4. Retrieve Latest Optimization Result:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/v1/optimization/latest?planningDate=2026-11-10" -Method GET | ConvertTo-Json -Depth 5
```

---

## License

This project is developed for enterprise logistics dispatch operations. All rights reserved.
