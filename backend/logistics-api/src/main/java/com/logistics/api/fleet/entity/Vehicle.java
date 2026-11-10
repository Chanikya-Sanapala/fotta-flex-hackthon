package com.logistics.api.fleet.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @Column(name = "vehicle_id", length = 40, nullable = false)
    private String vehicleId;

    @Column(name = "registration_no", length = 50, nullable = false, unique = true)
    private String registrationNo;

    @Column(name = "vehicle_type", length = 50, nullable = false)
    private String vehicleType;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Vehicle() {
    }

    public Vehicle(String vehicleId, String registrationNo, String vehicleType, boolean active) {
        this.vehicleId = vehicleId;
        this.registrationNo = registrationNo;
        this.vehicleType = vehicleType;
        this.active = active;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getRegistrationNo() {
        return registrationNo;
    }

    public void setRegistrationNo(String registrationNo) {
        this.registrationNo = registrationNo;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

