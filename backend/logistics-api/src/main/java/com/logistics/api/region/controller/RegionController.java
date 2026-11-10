
package com.logistics.api.region.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.logistics.api.region.dto.RegionRequest;
import com.logistics.api.region.entity.Region;
import com.logistics.api.region.service.RegionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/regions")
@CrossOrigin(origins = "http://localhost:5173")
public class RegionController {

    private final RegionService regionService;

    public RegionController(RegionService regionService) {
        this.regionService = regionService;
    }

    @GetMapping
    public ResponseEntity<List<Region>> getAllRegions() {
        return ResponseEntity.ok(regionService.getAllRegions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Region> getRegionById(@PathVariable String id) {
        return ResponseEntity.ok(regionService.getRegionById(id));
    }

    @PostMapping
    public ResponseEntity<Region> createRegion(
            @Valid @RequestBody RegionRequest request) {

        Region created = regionService.createRegion(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Region> updateRegion(
            @PathVariable String id,
            @Valid @RequestBody RegionRequest request) {

        return ResponseEntity.ok(
                regionService.updateRegion(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegion(@PathVariable String id) {

        regionService.deleteRegion(id);

        return ResponseEntity.noContent().build();
    }
}
