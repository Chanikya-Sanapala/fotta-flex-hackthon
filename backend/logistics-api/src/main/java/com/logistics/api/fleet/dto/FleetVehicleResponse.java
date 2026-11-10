package com.logistics.api.fleet.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

public record FleetVehicleResponse(
    String vehicleId,
    String registrationNo,
    String vehicleType,
    boolean active,
    BigDecimal maxWeightKg,
    BigDecimal maxVolumeM3,
    String driverId,
    String driverName,
    String shiftId,
    LocalDate shiftDate,
    OffsetDateTime shiftStart,
    OffsetDateTime shiftEnd,
    String shiftStatus,
    String depotId,
    String depotName,
    String currentRouteId,
    String currentRouteStatus,
    Integer assignedStopsCount,
    BigDecimal assignedWeightKg,
    BigDecimal assignedVolumeM3,
    String dispatchStatus
) {}

