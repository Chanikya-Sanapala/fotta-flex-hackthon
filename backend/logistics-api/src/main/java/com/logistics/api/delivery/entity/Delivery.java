package com.logistics.api.delivery.entity;

import com.logistics.api.customer.entity.CustomerSite;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "delivery")
public class Delivery {

    @Id
    @Column(name = "delivery_id", length = 40, nullable = false)
    private String deliveryId;

    @Column(name = "order_id", length = 40, nullable = false)
    private String orderId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "site_id", nullable = false)
    private CustomerSite customerSite;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate deliveryDate;

    @Column(name = "demand_weight_kg", precision = 12, scale = 2, nullable = false)
    private BigDecimal demandWeightKg;

    @Column(name = "demand_volume_m3", precision = 12, scale = 3, nullable = false)
    private BigDecimal demandVolumeM3;

    @Column(name = "service_duration_minutes", nullable = false)
    private Integer serviceDurationMinutes;

    @Column(name = "priority", length = 20, nullable = false)
    private String priority = "NORMAL";

    @Column(name = "status", length = 30, nullable = false)
    private String status = "PENDING";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    public Delivery() {
    }

    public String getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(String deliveryId) {
        this.deliveryId = deliveryId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public CustomerSite getCustomerSite() {
        return customerSite;
    }

    public void setCustomerSite(CustomerSite customerSite) {
        this.customerSite = customerSite;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public BigDecimal getDemandWeightKg() {
        return demandWeightKg;
    }

    public void setDemandWeightKg(BigDecimal demandWeightKg) {
        this.demandWeightKg = demandWeightKg;
    }

    public BigDecimal getDemandVolumeM3() {
        return demandVolumeM3;
    }

    public void setDemandVolumeM3(BigDecimal demandVolumeM3) {
        this.demandVolumeM3 = demandVolumeM3;
    }

    public Integer getServiceDurationMinutes() {
        return serviceDurationMinutes;
    }

    public void setServiceDurationMinutes(Integer serviceDurationMinutes) {
        this.serviceDurationMinutes = serviceDurationMinutes;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

