
-- ============================================================
-- Logistics Optimization Platform
-- V1: Initial relational database schema
-- PostgreSQL 16+
-- ============================================================

CREATE TABLE region (
    region_id VARCHAR(40) PRIMARY KEY,
    region_name VARCHAR(150) NOT NULL,
    min_latitude NUMERIC(10,7) NOT NULL,
    max_latitude NUMERIC(10,7) NOT NULL,
    min_longitude NUMERIC(10,7) NOT NULL,
    max_longitude NUMERIC(10,7) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_region_latitude
        CHECK (min_latitude <= max_latitude),
    CONSTRAINT chk_region_longitude
        CHECK (min_longitude <= max_longitude)
);

CREATE TABLE customer_site (
    site_id VARCHAR(40) PRIMARY KEY,
    region_id VARCHAR(40) NOT NULL REFERENCES region(region_id),
    site_name VARCHAR(200) NOT NULL,
    address TEXT,
    latitude NUMERIC(10,7) NOT NULL,
    longitude NUMERIC(10,7) NOT NULL,
    site_type VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_site_type
        CHECK (site_type IN ('CUSTOMER', 'WAREHOUSE', 'DEPOT')),
    CONSTRAINT chk_site_latitude
        CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_site_longitude
        CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE vehicle (
    vehicle_id VARCHAR(40) PRIMARY KEY,
    registration_no VARCHAR(50) NOT NULL UNIQUE,
    vehicle_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE vehicle_capacity (
    capacity_id VARCHAR(40) PRIMARY KEY,
    vehicle_id VARCHAR(40) NOT NULL REFERENCES vehicle(vehicle_id),
    max_weight_kg NUMERIC(12,2) NOT NULL,
    max_volume_m3 NUMERIC(12,3) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,

    CONSTRAINT chk_vehicle_weight CHECK (max_weight_kg > 0),
    CONSTRAINT chk_vehicle_volume CHECK (max_volume_m3 > 0),
    CONSTRAINT chk_capacity_dates
        CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

CREATE TABLE vehicle_restriction (
    restriction_id VARCHAR(40) PRIMARY KEY,
    vehicle_id VARCHAR(40) NOT NULL REFERENCES vehicle(vehicle_id),
    restriction_type VARCHAR(60) NOT NULL,
    restriction_value VARCHAR(150) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE
);

CREATE TABLE driver (
    driver_id VARCHAR(40) PRIMARY KEY,
    driver_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE driver_shift (
    shift_id VARCHAR(40) PRIMARY KEY,
    driver_id VARCHAR(40) NOT NULL REFERENCES driver(driver_id),
    shift_date DATE NOT NULL,
    shift_start TIMESTAMPTZ NOT NULL,
    shift_end TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED',

    CONSTRAINT chk_shift_time CHECK (shift_end > shift_start),
    CONSTRAINT chk_shift_status
        CHECK (status IN ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE travel_time_matrix (
    matrix_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    origin_site_id VARCHAR(40) NOT NULL REFERENCES customer_site(site_id),
    destination_site_id VARCHAR(40) NOT NULL REFERENCES customer_site(site_id),
    scenario_date DATE NOT NULL,
    departure_bucket TIME NOT NULL,
    scenario_name VARCHAR(60) NOT NULL,
    distance_km NUMERIC(12,3) NOT NULL,
    duration_minutes NUMERIC(12,2) NOT NULL,
    source_type VARCHAR(30) NOT NULL DEFAULT 'SYNTHETIC',

    CONSTRAINT chk_travel_distance CHECK (distance_km >= 0),
    CONSTRAINT chk_travel_duration CHECK (duration_minutes >= 0),
    CONSTRAINT uq_travel_scenario UNIQUE (
        origin_site_id,
        destination_site_id,
        scenario_date,
        departure_bucket,
        scenario_name
    )
);

CREATE TABLE orders (
    order_id VARCHAR(40) PRIMARY KEY,
    customer_site_id VARCHAR(40) NOT NULL REFERENCES customer_site(site_id),
    order_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_order_priority
        CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT chk_order_status
        CHECK (status IN ('CREATED', 'CONFIRMED', 'CANCELLED', 'COMPLETED'))
);

CREATE TABLE order_item (
    item_id VARCHAR(40) PRIMARY KEY,
    order_id VARCHAR(40) NOT NULL REFERENCES orders(order_id),
    item_name VARCHAR(150) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_weight_kg NUMERIC(12,3) NOT NULL,
    unit_volume_m3 NUMERIC(12,4) NOT NULL,

    CONSTRAINT chk_item_quantity CHECK (quantity > 0),
    CONSTRAINT chk_item_weight CHECK (unit_weight_kg >= 0),
    CONSTRAINT chk_item_volume CHECK (unit_volume_m3 >= 0)
);

CREATE TABLE delivery (
    delivery_id VARCHAR(40) PRIMARY KEY,
    order_id VARCHAR(40) NOT NULL REFERENCES orders(order_id),
    site_id VARCHAR(40) NOT NULL REFERENCES customer_site(site_id),
    delivery_date DATE NOT NULL,
    demand_weight_kg NUMERIC(12,2) NOT NULL,
    demand_volume_m3 NUMERIC(12,3) NOT NULL,
    service_duration_minutes INTEGER NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_delivery_weight CHECK (demand_weight_kg >= 0),
    CONSTRAINT chk_delivery_volume CHECK (demand_volume_m3 >= 0),
    CONSTRAINT chk_service_duration CHECK (service_duration_minutes >= 0),
    CONSTRAINT chk_delivery_priority
        CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT chk_delivery_status
        CHECK (status IN (
            'PENDING', 'VALIDATED', 'ASSIGNED', 'PLANNED',
            'DISPATCHED', 'IN_PROGRESS', 'DELIVERED',
            'FAILED', 'UNSERVED', 'CANCELLED'
        ))
);

CREATE TABLE delivery_time_window (
    window_id VARCHAR(40) PRIMARY KEY,
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    earliest_time TIMESTAMPTZ NOT NULL,
    latest_time TIMESTAMPTZ NOT NULL,

    CONSTRAINT chk_delivery_window CHECK (latest_time >= earliest_time)
);

CREATE TABLE delivery_vehicle_requirement (
    requirement_id VARCHAR(40) PRIMARY KEY,
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    requirement_type VARCHAR(60) NOT NULL,
    requirement_value VARCHAR(150) NOT NULL
);

CREATE TABLE optimization_run (
    run_id VARCHAR(40) PRIMARY KEY,
    planning_date DATE NOT NULL,
    scenario_name VARCHAR(60) NOT NULL,
    traffic_scenario VARCHAR(60) NOT NULL,
    algorithm_name VARCHAR(100) NOT NULL,
    algorithm_version VARCHAR(50),
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    random_seed BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
    objective_value NUMERIC(16,4),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_optimization_status
        CHECK (status IN (
            'QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'
        ))
);

CREATE TABLE route (
    route_id VARCHAR(40) PRIMARY KEY,
    run_id VARCHAR(40) NOT NULL REFERENCES optimization_run(run_id),
    vehicle_id VARCHAR(40) NOT NULL REFERENCES vehicle(vehicle_id),
    driver_id VARCHAR(40) NOT NULL REFERENCES driver(driver_id),
    shift_id VARCHAR(40) REFERENCES driver_shift(shift_id),
    depot_site_id VARCHAR(40) NOT NULL REFERENCES customer_site(site_id),
    route_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_distance_km NUMERIC(12,3) NOT NULL DEFAULT 0,
    total_duration_minutes NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_weight_kg NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_volume_m3 NUMERIC(12,3) NOT NULL DEFAULT 0,
    planned_start TIMESTAMPTZ,
    planned_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_route_status
        CHECK (status IN (
            'DRAFT', 'APPROVED', 'DISPATCHED',
            'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
        )),
    CONSTRAINT chk_route_totals CHECK (
        total_distance_km >= 0
        AND total_duration_minutes >= 0
        AND total_weight_kg >= 0
        AND total_volume_m3 >= 0
    )
);

CREATE TABLE optimization_assignment (
    assignment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    run_id VARCHAR(40) NOT NULL REFERENCES optimization_run(run_id),
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    route_id VARCHAR(40) REFERENCES route(route_id),
    assignment_status VARCHAR(30) NOT NULL,
    unserved_reason_code VARCHAR(60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_run_delivery UNIQUE (run_id, delivery_id),
    CONSTRAINT chk_assignment_status
        CHECK (assignment_status IN ('ASSIGNED', 'UNSERVED')),
    CONSTRAINT chk_assignment_route CHECK (
        (assignment_status = 'ASSIGNED' AND route_id IS NOT NULL)
        OR
        (assignment_status = 'UNSERVED' AND route_id IS NULL)
    )
);

CREATE TABLE route_stop (
    stop_id VARCHAR(80) PRIMARY KEY,
    route_id VARCHAR(40) NOT NULL REFERENCES route(route_id),
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    sequence_number INTEGER NOT NULL,
    planned_arrival TIMESTAMPTZ,
    planned_departure TIMESTAMPTZ,
    actual_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,

    CONSTRAINT uq_route_sequence UNIQUE (route_id, sequence_number),
    CONSTRAINT chk_stop_sequence CHECK (sequence_number > 0)
);

CREATE TABLE delivery_outcome (
    outcome_id VARCHAR(40) PRIMARY KEY,
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    outcome_status VARCHAR(30) NOT NULL,
    failure_reason_code VARCHAR(60),
    notes TEXT,
    actual_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_outcome_status
        CHECK (outcome_status IN ('DELIVERED', 'FAILED')),
    CONSTRAINT chk_failure_reason CHECK (
        outcome_status <> 'FAILED' OR failure_reason_code IS NOT NULL
    )
);

CREATE TABLE delivery_event (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    delivery_id VARCHAR(40) NOT NULL REFERENCES delivery(delivery_id),
    event_type VARCHAR(50) NOT NULL,
    previous_status VARCHAR(30),
    new_status VARCHAR(30),
    actor_type VARCHAR(30) NOT NULL,
    actor_id VARCHAR(80),
    source_reference VARCHAR(100),
    idempotency_key VARCHAR(120) UNIQUE,
    event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE route_event (
    event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    route_id VARCHAR(40) NOT NULL REFERENCES route(route_id),
    event_type VARCHAR(50) NOT NULL,
    actor_id VARCHAR(80),
    event_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE validation_run (
    validation_run_id VARCHAR(40) PRIMARY KEY,
    dataset_name VARCHAR(100),
    validation_scope VARCHAR(40) NOT NULL,
    status VARCHAR(20) NOT NULL,
    total_checks INTEGER NOT NULL DEFAULT 0,
    passed_checks INTEGER NOT NULL DEFAULT 0,
    failed_checks INTEGER NOT NULL DEFAULT 0,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,

    CONSTRAINT chk_validation_status
        CHECK (status IN ('RUNNING', 'PASS', 'FAIL')),
    CONSTRAINT chk_validation_counts
        CHECK (
            total_checks >= 0
            AND passed_checks >= 0
            AND failed_checks >= 0
        )
);

CREATE TABLE validation_issue (
    issue_id VARCHAR(40) PRIMARY KEY,
    validation_run_id VARCHAR(40) NOT NULL
        REFERENCES validation_run(validation_run_id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(80),
    rule_code VARCHAR(80) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    expected_value JSONB,
    actual_value JSONB,
    message TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_issue_severity
        CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL'))
);

CREATE TABLE ground_truth (
    ground_truth_id VARCHAR(40) PRIMARY KEY,
    anomaly_code VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    expected_detection_rule VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    injection_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE exception_record (
    exception_id VARCHAR(40) PRIMARY KEY,
    rule_code VARCHAR(80) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    description TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    CONSTRAINT chk_exception_severity
        CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    CONSTRAINT chk_exception_status
        CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'IGNORED'))
);

CREATE TABLE audit_log (
    audit_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    actor_type VARCHAR(30) NOT NULL,
    actor_id VARCHAR(80),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(80),
    before_state JSONB,
    after_state JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Indexes for common lookups
-- ============================================================

CREATE INDEX idx_sites_region ON customer_site(region_id);
CREATE INDEX idx_deliveries_date_status ON delivery(delivery_date, status);
CREATE INDEX idx_deliveries_site ON delivery(site_id);
CREATE INDEX idx_orders_site_date ON orders(customer_site_id, order_date);
CREATE INDEX idx_shifts_driver_date ON driver_shift(driver_id, shift_date);
CREATE INDEX idx_routes_date_status ON route(route_date, status);
CREATE INDEX idx_routes_run ON route(run_id);
CREATE INDEX idx_stops_route_sequence ON route_stop(route_id, sequence_number);
CREATE INDEX idx_stops_delivery ON route_stop(delivery_id);
CREATE INDEX idx_assignment_run_status
    ON optimization_assignment(run_id, assignment_status);
CREATE INDEX idx_delivery_events_delivery_time
    ON delivery_event(delivery_id, occurred_at);
CREATE INDEX idx_route_events_route_time
    ON route_event(route_id, occurred_at);
CREATE INDEX idx_validation_issues_run
    ON validation_issue(validation_run_id);
CREATE INDEX idx_exceptions_status_severity
    ON exception_record(status, severity);
CREATE INDEX idx_travel_matrix_lookup
    ON travel_time_matrix(
        origin_site_id,
        destination_site_id,
        scenario_date,
        scenario_name
    );

-- Initial schema completed.
