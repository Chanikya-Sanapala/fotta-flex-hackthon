package com.logistics.api.customer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CustomerSiteRequest(

        @NotBlank(message = "Site ID is required")
        @Size(max = 40, message = "Site ID must not exceed 40 characters")
        String siteId,

        @NotBlank(message = "Region ID is required")
        @Size(max = 40, message = "Region ID must not exceed 40 characters")
        String regionId,

        @NotBlank(message = "Site name is required")
        @Size(max = 200, message = "Site name must not exceed 200 characters")
        String siteName,

        String address,

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be at least -90")
        @DecimalMax(value = "90.0", message = "Latitude must not exceed 90")
        BigDecimal latitude,

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be at least -180")
        @DecimalMax(value = "180.0", message = "Longitude must not exceed 180")
        BigDecimal longitude,

        @NotBlank(message = "Site type is required")
        @Pattern(
                regexp = "CUSTOMER|WAREHOUSE|DEPOT",
                message = "Site type must be CUSTOMER, WAREHOUSE, or DEPOT"
        )
        String siteType,

        Boolean active
) {
}