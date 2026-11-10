package com.logistics.api.fleet.service;

import com.logistics.api.common.exception.ResourceNotFoundException;
import com.logistics.api.fleet.dto.FleetVehicleResponse;
import com.logistics.api.fleet.repository.VehicleRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class FleetService {

    private final VehicleRepository vehicleRepository;
    private final JdbcTemplate jdbc;

    public FleetService(VehicleRepository vehicleRepository, JdbcTemplate jdbc) {
        this.vehicleRepository = vehicleRepository;
        this.jdbc = jdbc;
    }

    public List<FleetVehicleResponse> getFleet(Boolean activeOnly) {
        String baseSql = """
            SELECT 
                v.vehicle_id,
                v.registration_no,
                v.vehicle_type,
                v.is_active,
                vc.max_weight_kg,
                vc.max_volume_m3,
                d_info.driver_id,
                d_info.driver_name,
                d_info.shift_id,
                d_info.shift_date,
                d_info.shift_start,
                d_info.shift_end,
                d_info.status AS shift_status,
                depot.site_id AS depot_id,
                depot.site_name AS depot_name,
                r_info.route_id,
                r_info.route_status,
                r_info.total_weight_kg AS route_weight_kg,
                r_info.total_volume_m3 AS route_volume_m3,
                r_info.stop_count
            FROM vehicle v
            LEFT JOIN LATERAL (
                SELECT vc.max_weight_kg, vc.max_volume_m3
                FROM vehicle_capacity vc
                WHERE vc.vehicle_id = v.vehicle_id
                ORDER BY vc.effective_from DESC
                LIMIT 1
            ) vc ON true
            LEFT JOIN LATERAL (
                SELECT d.driver_id, d.driver_name, ds.shift_id, ds.shift_date, ds.shift_start, ds.shift_end, ds.status
                FROM driver d
                JOIN driver_shift ds ON ds.driver_id = d.driver_id
                WHERE d.is_active = true
                ORDER BY ds.shift_date DESC, ds.shift_start ASC
                LIMIT 1
            ) d_info ON true
            LEFT JOIN LATERAL (
                SELECT site_id, site_name 
                FROM customer_site 
                WHERE site_type IN ('WAREHOUSE', 'DEPOT') AND is_active = true
                ORDER BY site_id ASC
                LIMIT 1
            ) depot ON true
            LEFT JOIN LATERAL (
                SELECT r.route_id, r.status AS route_status, r.total_weight_kg, r.total_volume_m3,
                       (SELECT COUNT(*) FROM route_stop rs WHERE rs.route_id = r.route_id) AS stop_count
                FROM route r
                WHERE r.vehicle_id = v.vehicle_id
                  AND r.status NOT IN ('CANCELLED')
                ORDER BY r.created_at DESC
                LIMIT 1
            ) r_info ON true
            """;

        if (Boolean.TRUE.equals(activeOnly)) {
            baseSql += " WHERE v.is_active = true ";
        }

        baseSql += " ORDER BY v.vehicle_id ASC ";

        return jdbc.query(baseSql, (rs, rowNum) -> mapRowToFleetVehicle(rs));
    }

    public FleetVehicleResponse getVehicleById(String vehicleId) {
        // First check vehicle existence via repository
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId);
        }

        String sql = """
            SELECT 
                v.vehicle_id,
                v.registration_no,
                v.vehicle_type,
                v.is_active,
                vc.max_weight_kg,
                vc.max_volume_m3,
                d_info.driver_id,
                d_info.driver_name,
                d_info.shift_id,
                d_info.shift_date,
                d_info.shift_start,
                d_info.shift_end,
                d_info.status AS shift_status,
                depot.site_id AS depot_id,
                depot.site_name AS depot_name,
                r_info.route_id,
                r_info.route_status,
                r_info.total_weight_kg AS route_weight_kg,
                r_info.total_volume_m3 AS route_volume_m3,
                r_info.stop_count
            FROM vehicle v
            LEFT JOIN LATERAL (
                SELECT vc.max_weight_kg, vc.max_volume_m3
                FROM vehicle_capacity vc
                WHERE vc.vehicle_id = v.vehicle_id
                ORDER BY vc.effective_from DESC
                LIMIT 1
            ) vc ON true
            LEFT JOIN LATERAL (
                SELECT d.driver_id, d.driver_name, ds.shift_id, ds.shift_date, ds.shift_start, ds.shift_end, ds.status
                FROM driver d
                JOIN driver_shift ds ON ds.driver_id = d.driver_id
                WHERE d.is_active = true
                ORDER BY ds.shift_date DESC, ds.shift_start ASC
                LIMIT 1
            ) d_info ON true
            LEFT JOIN LATERAL (
                SELECT site_id, site_name 
                FROM customer_site 
                WHERE site_type IN ('WAREHOUSE', 'DEPOT') AND is_active = true
                ORDER BY site_id ASC
                LIMIT 1
            ) depot ON true
            LEFT JOIN LATERAL (
                SELECT r.route_id, r.status AS route_status, r.total_weight_kg, r.total_volume_m3,
                       (SELECT COUNT(*) FROM route_stop rs WHERE rs.route_id = r.route_id) AS stop_count
                FROM route r
                WHERE r.vehicle_id = v.vehicle_id
                  AND r.status NOT IN ('CANCELLED')
                ORDER BY r.created_at DESC
                LIMIT 1
            ) r_info ON true
            WHERE v.vehicle_id = ?
            """;

        List<FleetVehicleResponse> results = jdbc.query(sql, (rs, rowNum) -> mapRowToFleetVehicle(rs), vehicleId);
        if (results.isEmpty()) {
            throw new ResourceNotFoundException("Vehicle not found with ID: " + vehicleId);
        }
        return results.get(0);
    }

    private FleetVehicleResponse mapRowToFleetVehicle(ResultSet rs) throws SQLException {
        String routeStatus = rs.getString("route_status");
        String routeId = rs.getString("route_id");
        int stopCount = rs.getInt("stop_count");

        String dispatchStatus;
        if (routeId == null || "COMPLETED".equalsIgnoreCase(routeStatus) || "CANCELLED".equalsIgnoreCase(routeStatus)) {
            dispatchStatus = "STANDBY";
        } else if ("DISPATCHED".equalsIgnoreCase(routeStatus) || "IN_PROGRESS".equalsIgnoreCase(routeStatus)) {
            dispatchStatus = "DISPATCHED";
        } else if ("DRAFT".equalsIgnoreCase(routeStatus) || "APPROVED".equalsIgnoreCase(routeStatus)) {
            dispatchStatus = "PLANNED";
        } else {
            dispatchStatus = "STANDBY";
        }

        LocalDate shiftDate = rs.getDate("shift_date") != null ? rs.getDate("shift_date").toLocalDate() : null;
        OffsetDateTime shiftStart = toOffsetDateTime(rs.getTimestamp("shift_start"));
        OffsetDateTime shiftEnd = toOffsetDateTime(rs.getTimestamp("shift_end"));

        return new FleetVehicleResponse(
            rs.getString("vehicle_id"),
            rs.getString("registration_no"),
            rs.getString("vehicle_type"),
            rs.getBoolean("is_active"),
            rs.getBigDecimal("max_weight_kg"),
            rs.getBigDecimal("max_volume_m3"),
            rs.getString("driver_id"),
            rs.getString("driver_name"),
            rs.getString("shift_id"),
            shiftDate,
            shiftStart,
            shiftEnd,
            rs.getString("shift_status"),
            rs.getString("depot_id"),
            rs.getString("depot_name"),
            routeId,
            routeStatus,
            stopCount,
            rs.getBigDecimal("route_weight_kg"),
            rs.getBigDecimal("route_volume_m3"),
            dispatchStatus
        );
    }

    private OffsetDateTime toOffsetDateTime(Timestamp timestamp) {
        if (timestamp == null) {
            return null;
        }
        return timestamp.toInstant().atOffset(ZoneOffset.UTC);
    }
}

