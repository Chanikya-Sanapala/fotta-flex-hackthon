
package com.logistics.api.region.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "region")
public class Region {

    @Id
    @Column(name = "region_id", length = 40, nullable = false)
    private String regionId;

    @Column(name = "region_name", length = 150, nullable = false)
    private String regionName;

    @Column(name = "min_latitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal minLatitude;

    @Column(name = "max_latitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal maxLatitude;

    @Column(name = "min_longitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal minLongitude;

    @Column(name = "max_longitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal maxLongitude;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Region() {
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = OffsetDateTime.now();
        }
    }

    public String getRegionId() {
        return regionId;
    }

    public void setRegionId(String regionId) {
        this.regionId = regionId;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
    }

    public BigDecimal getMinLatitude() {
        return minLatitude;
    }

    public void setMinLatitude(BigDecimal minLatitude) {
        this.minLatitude = minLatitude;
    }

    public BigDecimal getMaxLatitude() {
        return maxLatitude;
    }

    public void setMaxLatitude(BigDecimal maxLatitude) {
        this.maxLatitude = maxLatitude;
    }

    public BigDecimal getMinLongitude() {
        return minLongitude;
    }

    public void setMinLongitude(BigDecimal minLongitude) {
        this.minLongitude = minLongitude;
    }

    public BigDecimal getMaxLongitude() {
        return maxLongitude;
    }

    public void setMaxLongitude(BigDecimal maxLongitude) {
        this.maxLongitude = maxLongitude;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }
}
