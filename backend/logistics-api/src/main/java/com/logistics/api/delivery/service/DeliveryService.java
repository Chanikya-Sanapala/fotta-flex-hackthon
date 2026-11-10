package com.logistics.api.delivery.service;

import com.logistics.api.common.exception.ResourceNotFoundException;
import com.logistics.api.customer.entity.CustomerSite;
import com.logistics.api.delivery.dto.DeliveryResponse;
import com.logistics.api.delivery.entity.Delivery;
import com.logistics.api.delivery.repository.DeliveryRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final JdbcTemplate jdbc;

    public DeliveryService(DeliveryRepository deliveryRepository, JdbcTemplate jdbc) {
        this.deliveryRepository = deliveryRepository;
        this.jdbc = jdbc;
    }

    private record RouteStopInfo(
        String deliveryId,
        String routeId,
        Integer sequenceNumber,
        String vehicleId,
        String driverId
    ) {}

    public List<DeliveryResponse> getDeliveries(String status, LocalDate date) {
        List<Delivery> deliveries;

        if (status != null && !status.isBlank() && date != null) {
            deliveries = deliveryRepository.findByStatusIgnoreCaseAndDeliveryDateOrderByDeliveryIdAsc(status.trim(), date);
        } else if (status != null && !status.isBlank()) {
            deliveries = deliveryRepository.findByStatusIgnoreCaseOrderByDeliveryDateDescDeliveryIdAsc(status.trim());
        } else if (date != null) {
            deliveries = deliveryRepository.findByDeliveryDateOrderByDeliveryIdAsc(date);
        } else {
            deliveries = deliveryRepository.findAllByOrderByDeliveryDateDescDeliveryIdAsc();
        }

        Map<String, RouteStopInfo> routeStopMap = loadRouteStopMap();

        return deliveries.stream()
            .map(delivery -> mapToResponse(delivery, routeStopMap.get(delivery.getDeliveryId())))
            .toList();
    }

    public DeliveryResponse getDeliveryById(String id) {
        Delivery delivery = deliveryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Delivery not found with ID: " + id));

        Map<String, RouteStopInfo> routeStopMap = loadRouteStopMap();
        return mapToResponse(delivery, routeStopMap.get(delivery.getDeliveryId()));
    }

    private Map<String, RouteStopInfo> loadRouteStopMap() {
        Map<String, RouteStopInfo> map = new HashMap<>();
        try {
            List<RouteStopInfo> stops = jdbc.query("""
                SELECT rs.delivery_id, rs.route_id, rs.sequence_number,
                       r.vehicle_id, r.driver_id
                FROM route_stop rs
                JOIN route r ON r.route_id = rs.route_id
                ORDER BY rs.sequence_number ASC
                """,
                (rs, rowNum) -> new RouteStopInfo(
                    rs.getString("delivery_id"),
                    rs.getString("route_id"),
                    rs.getObject("sequence_number") != null ? rs.getInt("sequence_number") : null,
                    rs.getString("vehicle_id"),
                    rs.getString("driver_id")
                )
            );
            for (RouteStopInfo stop : stops) {
                map.put(stop.deliveryId(), stop);
            }
        } catch (Exception e) {
            // If table doesn't have records or query fails, continue without route-stop enrichment
        }
        return map;
    }

    private DeliveryResponse mapToResponse(Delivery delivery, RouteStopInfo routeInfo) {
        CustomerSite site = delivery.getCustomerSite();

        return new DeliveryResponse(
            delivery.getDeliveryId(),
            delivery.getOrderId(),
            site != null ? site.getSiteId() : null,
            site != null ? site.getSiteName() : null,
            site != null ? site.getAddress() : null,
            site != null ? site.getLatitude() : null,
            site != null ? site.getLongitude() : null,
            site != null ? site.getSiteType() : null,
            delivery.getDeliveryDate(),
            delivery.getDemandWeightKg(),
            delivery.getDemandVolumeM3(),
            delivery.getServiceDurationMinutes(),
            delivery.getPriority(),
            delivery.getStatus(),
            delivery.getCreatedAt(),
            routeInfo != null ? routeInfo.routeId() : null,
            routeInfo != null ? routeInfo.sequenceNumber() : null,
            routeInfo != null ? routeInfo.vehicleId() : null,
            routeInfo != null ? routeInfo.driverId() : null
        );
    }
}

