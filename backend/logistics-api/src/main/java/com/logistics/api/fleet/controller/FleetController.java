package com.logistics.api.fleet.controller;

import com.logistics.api.fleet.dto.FleetVehicleResponse;
import com.logistics.api.fleet.service.FleetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fleet")
@CrossOrigin(origins = "http://localhost:5173")
public class FleetController {

    private final FleetService fleetService;

    public FleetController(FleetService fleetService) {
        this.fleetService = fleetService;
    }

    @GetMapping
    public ResponseEntity<List<FleetVehicleResponse>> getFleet(
            @RequestParam(required = false) Boolean active) {
        return ResponseEntity.ok(fleetService.getFleet(active));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FleetVehicleResponse> getVehicleById(@PathVariable String id) {
        return ResponseEntity.ok(fleetService.getVehicleById(id));
    }
}

