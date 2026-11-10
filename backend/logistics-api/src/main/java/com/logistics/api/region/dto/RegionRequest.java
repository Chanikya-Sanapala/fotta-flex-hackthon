
package com.logistics.api.region.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record RegionRequest(

        @NotBlank(message = "Region ID is required")
        @Size(max = 40, message = "Region ID cannot exceed 40 characters")
        String regionId,

        @NotBlank(message = "Region name is required")
        @Size(max = 150, message = "Region name cannot exceed 150 characters")
        String regionName,

        @NotNull
        @Digits(integer = 3, fraction = 7)
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal minLatitude,

        @NotNull
        @Digits(integer = 3, fraction = 7)
        @DecimalMin("-90.0")
        @DecimalMax("90.0")
        BigDecimal maxLatitude,

        @NotNull
        @Digits(integer = 3, fraction = 7)
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal minLongitude,

        @NotNull
        @Digits(integer = 3, fraction = 7)
        @DecimalMin("-180.0")
        @DecimalMax("180.0")
        BigDecimal maxLongitude

) {
}
