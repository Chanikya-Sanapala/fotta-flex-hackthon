package com.logistics.api.delivery.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record DeliveryResponse(
    String deliveryId,
    String orderId,
    String siteId,
    String siteName,
    String siteAddress,
    BigDecimal latitude,
    BigDecimal longitude,
    String siteType,
    LocalDate deliveryDate,
    BigDecimal demandWeightKg,
    BigDecimal demandVolumeM3,
    Integer serviceDurationMinutes,
    String priority,
    String status,
    OffsetDateTime createdAt,
    String routeId,
    Integer sequenceNumber,
    String vehicleId,
    String driverId
) {}

