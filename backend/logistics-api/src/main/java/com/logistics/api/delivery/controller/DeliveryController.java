package com.logistics.api.delivery.controller;

import com.logistics.api.delivery.dto.DeliveryResponse;
import com.logistics.api.delivery.service.DeliveryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/deliveries")
@CrossOrigin(origins = "http://localhost:5173")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryResponse>> getDeliveries(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(deliveryService.getDeliveries(status, date));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryResponse> getDeliveryById(@PathVariable String id) {
        return ResponseEntity.ok(deliveryService.getDeliveryById(id));
    }
}

