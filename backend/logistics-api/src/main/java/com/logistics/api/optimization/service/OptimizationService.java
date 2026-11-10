
package com.logistics.api.optimization.service;

import com.logistics.api.common.exception.ResourceNotFoundException;
import com.logistics.api.optimization.dto.OptimizationRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class OptimizationService {

    private final JdbcTemplate jdbc;

    public OptimizationService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private record Stop(
        String deliveryId,
        String siteId,
        double latitude,
        double longitude,
        double weight,
        double volume,
        int serviceMinutes,
        String priority
    ) {}

    private record Vehicle(
        String vehicleId,
        String driverId,
        String shiftId,
        String depotSiteId,
        double maxWeight,
        double maxVolume,
        double depotLat,
        double depotLon
    ) {}

    @Transactional
    public Map<String, Object> optimize(OptimizationRequest request) {
        LocalDate date = request.planningDate();
        String runId = "RUN-" + UUID.randomUUID();

        jdbc.update("""
            INSERT INTO optimization_run
            (run_id, planning_date, scenario_name, traffic_scenario,
             algorithm_name, algorithm_version, configuration,
             status, started_at)
            VALUES (?, ?, ?, ?, 'NEAREST_NEIGHBOUR', '1.0',
                    CAST(? AS jsonb), 'RUNNING', now())
            """,
            runId, date, request.scenarioName(), request.trafficScenario(),
            "{\"capacity_check\":true,\"distance_metric\":\"haversine\"}"
        );

        List<Vehicle> vehicles = jdbc.query("""
            SELECT v.vehicle_id, d.driver_id, ds.shift_id,
                   depot.site_id, vc.max_weight_kg, vc.max_volume_m3,
                   depot.latitude, depot.longitude
            FROM vehicle v
            JOIN vehicle_capacity vc ON vc.vehicle_id = v.vehicle_id
            JOIN driver d ON d.is_active = true
            JOIN driver_shift ds ON ds.driver_id = d.driver_id
            JOIN customer_site depot ON depot.site_type = 'WAREHOUSE'
                                      AND depot.is_active = true
            WHERE v.is_active = true
              AND vc.effective_from <= ?
              AND (vc.effective_to IS NULL OR vc.effective_to >= ?)
              AND ds.shift_date = ?
              AND ds.status = 'SCHEDULED'
              AND ds.shift_start < ds.shift_end
            ORDER BY v.vehicle_id, d.driver_id
            LIMIT 1
            """,
            (rs, row) -> new Vehicle(
                rs.getString("vehicle_id"),
                rs.getString("driver_id"),
                rs.getString("shift_id"),
                rs.getString("site_id"),
                rs.getDouble("max_weight_kg"),
                rs.getDouble("max_volume_m3"),
                rs.getDouble("latitude"),
                rs.getDouble("longitude")
            ),
            date, date, date
        );

        if (vehicles.isEmpty()) {
            throw new IllegalStateException(
                "No active vehicle, capacity, driver and scheduled shift combination found for " + date
            );
        }

        Vehicle vehicle = vehicles.get(0);

        List<Stop> deliveries = jdbc.query("""
            SELECT d.delivery_id, d.site_id, cs.latitude, cs.longitude,
                   d.demand_weight_kg, d.demand_volume_m3,
                   d.service_duration_minutes, d.priority
            FROM delivery d
            JOIN customer_site cs ON cs.site_id = d.site_id
            WHERE d.delivery_date = ?
              AND d.status IN ('PENDING', 'VALIDATED')
              AND cs.is_active = true
            """,
            (rs, row) -> new Stop(
                rs.getString("delivery_id"),
                rs.getString("site_id"),
                rs.getDouble("latitude"),
                rs.getDouble("longitude"),
                rs.getDouble("demand_weight_kg"),
                rs.getDouble("demand_volume_m3"),
                rs.getInt("service_duration_minutes"),
                rs.getString("priority")
            ),
            date
        );

        // Handle empty delivery lists before accessing any delivery.
        if (deliveries.isEmpty()) {
            jdbc.update("""
                UPDATE optimization_run
                SET status = 'COMPLETED',
                    completed_at = now(),
                    objective_value = 0
                WHERE run_id = ?
                """, runId);

            Map<String, Object> emptyResult = new LinkedHashMap<>();
            emptyResult.put("runId", runId);
            emptyResult.put("status", "COMPLETED");
            emptyResult.put("algorithm", "NEAREST_NEIGHBOUR");
            emptyResult.put("assignedCount", 0);
            emptyResult.put("unserved", List.of());
            emptyResult.put("totalDistanceKm", 0);
            emptyResult.put("totalDurationMinutes", 0);
            emptyResult.put("totalWeightKg", 0);
            emptyResult.put("totalVolumeM3", 0);
            emptyResult.put("orderedDeliveries", List.of());
            emptyResult.put(
                "message",
                "No pending deliveries available for optimization"
            );

            return emptyResult;
        }

        List<Stop> assigned = new ArrayList<>();
        List<Map<String, String>> unserved = new ArrayList<>();

        double totalWeight = 0;
        double totalVolume = 0;

        for (Stop stop : deliveries) {
            if (totalWeight + stop.weight() <= vehicle.maxWeight()
                && totalVolume + stop.volume() <= vehicle.maxVolume()) {

                assigned.add(stop);
                totalWeight += stop.weight();
                totalVolume += stop.volume();

            } else {
                unserved.add(Map.of(
                    "deliveryId", stop.deliveryId(),
                    "reason", "VEHICLE_CAPACITY_EXCEEDED"
                ));
            }
        }

        if (assigned.isEmpty()) {
            for (Stop stop : deliveries) {
                jdbc.update("""
                    INSERT INTO optimization_assignment
                    (run_id, delivery_id, route_id,
                     assignment_status, unserved_reason_code)
                    VALUES (?, ?, NULL, 'UNSERVED', 'NO_CAPACITY')
                    """,
                    runId, stop.deliveryId()
                );
            }

            jdbc.update("""
                UPDATE delivery
                SET status = 'UNSERVED'
                WHERE delivery_id IN (
                    SELECT delivery_id
                    FROM optimization_assignment
                    WHERE run_id = ?
                      AND assignment_status = 'UNSERVED'
                )
                """, runId);

            jdbc.update("""
                UPDATE optimization_run
                SET status = 'COMPLETED',
                    completed_at = now()
                WHERE run_id = ?
                """, runId);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("runId", runId);
            response.put("status", "COMPLETED");
            response.put("algorithm", "NEAREST_NEIGHBOUR");
            response.put("assignedCount", 0);
            response.put("unserved", unserved);
            response.put("totalDistanceKm", 0);
            response.put("totalDurationMinutes", 0);
            response.put("totalWeightKg", 0);
            response.put("totalVolumeM3", 0);
            response.put("orderedDeliveries", List.of());

            return response;
        }

        List<Stop> ordered = nearestNeighbour(
            assigned,
            vehicle.depotLat(),
            vehicle.depotLon()
        );

        String routeId = "RT-" + UUID.randomUUID();

        double distance = calculateRouteDistance(
            ordered,
            vehicle.depotLat(),
            vehicle.depotLon()
        );

        int duration = ordered.stream()
            .mapToInt(Stop::serviceMinutes)
            .sum() + (int) Math.ceil(distance * 3);

        jdbc.update("""
            INSERT INTO route
            (route_id, run_id, vehicle_id, driver_id, shift_id,
             depot_site_id, route_date, status, total_distance_km,
             total_duration_minutes, total_weight_kg, total_volume_m3)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?, ?, ?)
            """,
            routeId,
            runId,
            vehicle.vehicleId(),
            vehicle.driverId(),
            vehicle.shiftId(),
            vehicle.depotSiteId(),
            date,
            distance,
            duration,
            totalWeight,
            totalVolume
        );

        int sequence = 1;

        for (Stop stop : ordered) {
            jdbc.update("""
                INSERT INTO route_stop
                (stop_id, route_id, delivery_id, sequence_number)
                VALUES (?, ?, ?, ?)
                """,
                UUID.randomUUID().toString(),
                routeId,
                stop.deliveryId(),
                sequence++
            );

            jdbc.update("""
                INSERT INTO optimization_assignment
                (run_id, delivery_id, route_id, assignment_status)
                VALUES (?, ?, ?, 'ASSIGNED')
                """,
                runId,
                stop.deliveryId(),
                routeId
            );

            jdbc.update("""
                UPDATE delivery
                SET status = 'PLANNED'
                WHERE delivery_id = ?
                """,
                stop.deliveryId()
            );
        }

        for (Map<String, String> item : unserved) {
            jdbc.update("""
                INSERT INTO optimization_assignment
                (run_id, delivery_id, route_id,
                 assignment_status, unserved_reason_code)
                VALUES (?, ?, NULL, 'UNSERVED', ?)
                """,
                runId,
                item.get("deliveryId"),
                item.get("reason")
            );
        }

        jdbc.update("""
            UPDATE delivery
            SET status = 'UNSERVED'
            WHERE delivery_id IN (
                SELECT delivery_id
                FROM optimization_assignment
                WHERE run_id = ?
                  AND assignment_status = 'UNSERVED'
            )
            """, runId);

        jdbc.update("""
            UPDATE optimization_run
            SET status = 'COMPLETED',
                objective_value = ?,
                completed_at = now()
            WHERE run_id = ?
            """,
            distance,
            runId
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("runId", runId);
        response.put("status", "COMPLETED");
        response.put("algorithm", "NEAREST_NEIGHBOUR");
        response.put("routeId", routeId);
        response.put("vehicleId", vehicle.vehicleId());
        response.put("driverId", vehicle.driverId());
        response.put("assignedCount", ordered.size());
        response.put("unserved", unserved);
        response.put("totalDistanceKm",
            Math.round(distance * 100.0) / 100.0);
        response.put("totalDurationMinutes", duration);
        response.put("totalWeightKg", totalWeight);
        response.put("totalVolumeM3", totalVolume);
        response.put(
            "orderedDeliveries",
            ordered.stream().map(Stop::deliveryId).toList()
        );

        return response;
    }

    private List<Stop> nearestNeighbour(
        List<Stop> stops,
        double startLat,
        double startLon
    ) {
        List<Stop> remaining = new ArrayList<>(stops);
        List<Stop> result = new ArrayList<>();

        double lat = startLat;
        double lon = startLon;

        while (!remaining.isEmpty()) {
            final double currentLat = lat;
            final double currentLon = lon;

            Stop nearest = remaining.stream()
                .min(Comparator.comparingDouble(
                    s -> haversine(
                        currentLat,
                        currentLon,
                        s.latitude(),
                        s.longitude()
                    )
                ))
                .orElseThrow();

            result.add(nearest);
            remaining.remove(nearest);

            lat = nearest.latitude();
            lon = nearest.longitude();
        }

        return result;
    }

    private double calculateRouteDistance(
        List<Stop> stops,
        double startLat,
        double startLon
    ) {
        double distance = 0;
        double lat = startLat;
        double lon = startLon;

        for (Stop stop : stops) {
            distance += haversine(
                lat,
                lon,
                stop.latitude(),
                stop.longitude()
            );

            lat = stop.latitude();
            lon = stop.longitude();
        }

        return distance + haversine(
            lat,
            lon,
            startLat,
            startLon
        );
    }

    private double haversine(
        double lat1,
        double lon1,
        double lat2,
        double lon2
    ) {
        double earthRadius = 6371.0;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1))
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        return earthRadius * 2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getLatestCompletedOptimization(LocalDate planningDate) {
        if (planningDate == null) {
            throw new IllegalArgumentException("planningDate is required");
        }

        String sql = """
            SELECT 
                r.run_id,
                r.status AS run_status,
                r.algorithm_name,
                rt.route_id,
                rt.vehicle_id,
                rt.driver_id,
                rt.total_distance_km,
                rt.total_duration_minutes,
                rt.total_weight_kg,
                rt.total_volume_m3
            FROM optimization_run r
            LEFT JOIN route rt ON rt.run_id = r.run_id
            WHERE r.planning_date = ?
              AND r.status = 'COMPLETED'
            ORDER BY r.completed_at DESC NULLS LAST, r.created_at DESC
            LIMIT 1
            """;

        List<Map<String, Object>> runs = jdbc.query(sql, (rs, rowNum) -> {
            Map<String, Object> runData = new HashMap<>();
            runData.put("runId", rs.getString("run_id"));
            runData.put("status", rs.getString("run_status"));
            runData.put("algorithm", rs.getString("algorithm_name"));
            runData.put("routeId", rs.getString("route_id"));
            runData.put("vehicleId", rs.getString("vehicle_id"));
            runData.put("driverId", rs.getString("driver_id"));
            runData.put("totalDistanceKm", rs.getObject("total_distance_km") != null 
                ? Math.round(rs.getDouble("total_distance_km") * 100.0) / 100.0 : 0.0);
            runData.put("totalDurationMinutes", rs.getObject("total_duration_minutes") != null 
                ? (int) Math.round(rs.getDouble("total_duration_minutes")) : 0);
            runData.put("totalWeightKg", rs.getObject("total_weight_kg") != null 
                ? rs.getDouble("total_weight_kg") : 0.0);
            runData.put("totalVolumeM3", rs.getObject("total_volume_m3") != null 
                ? rs.getDouble("total_volume_m3") : 0.0);
            return runData;
        }, planningDate);

        if (runs.isEmpty()) {
            throw new ResourceNotFoundException("No completed optimization run found for planning date: " + planningDate);
        }

        Map<String, Object> runData = runs.get(0);
        String runId = (String) runData.get("runId");
        String routeId = (String) runData.get("routeId");

        List<String> orderedDeliveries = new ArrayList<>();
        if (routeId != null) {
            String stopsSql = """
                SELECT delivery_id
                FROM route_stop
                WHERE route_id = ?
                ORDER BY sequence_number ASC
                """;
            orderedDeliveries = jdbc.query(stopsSql, (rs, rowNum) -> rs.getString("delivery_id"), routeId);
        }

        String unservedSql = """
            SELECT delivery_id, unserved_reason_code
            FROM optimization_assignment
            WHERE run_id = ?
              AND assignment_status = 'UNSERVED'
            ORDER BY delivery_id ASC
            """;
        List<Map<String, String>> unserved = jdbc.query(unservedSql, (rs, rowNum) -> {
            Map<String, String> item = new LinkedHashMap<>();
            item.put("deliveryId", rs.getString("delivery_id"));
            item.put("reason", rs.getString("unserved_reason_code") != null ? rs.getString("unserved_reason_code") : "UNSERVED");
            return item;
        }, runId);

        String assignedCountSql = """
            SELECT COUNT(*)
            FROM optimization_assignment
            WHERE run_id = ?
              AND assignment_status = 'ASSIGNED'
            """;
        Integer assignedCount = jdbc.queryForObject(assignedCountSql, Integer.class, runId);
        if (assignedCount == null) {
            assignedCount = orderedDeliveries.size();
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("runId", runId);
        response.put("status", runData.get("status"));
        response.put("algorithm", runData.get("algorithm"));
        response.put("routeId", routeId);
        response.put("vehicleId", runData.get("vehicleId"));
        response.put("driverId", runData.get("driverId"));
        response.put("assignedCount", assignedCount);
        response.put("totalDistanceKm", runData.get("totalDistanceKm"));
        response.put("totalDurationMinutes", runData.get("totalDurationMinutes"));
        response.put("totalWeightKg", runData.get("totalWeightKg"));
        response.put("totalVolumeM3", runData.get("totalVolumeM3"));
        response.put("orderedDeliveries", orderedDeliveries);
        response.put("unserved", unserved);

        return response;
    }
}
