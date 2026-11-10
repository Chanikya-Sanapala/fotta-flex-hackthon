package com.logistics.api.customer.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.logistics.api.customer.dto.CustomerSiteRequest;
import com.logistics.api.customer.entity.CustomerSite;
import com.logistics.api.customer.service.CustomerSiteService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer-sites")
@CrossOrigin(origins = "http://localhost:5173")
public class CustomerSiteController {

    private final CustomerSiteService customerSiteService;

    public CustomerSiteController(CustomerSiteService customerSiteService) {
        this.customerSiteService = customerSiteService;
    }

    @PostMapping
    public ResponseEntity<CustomerSite> createSite(
            @Valid @RequestBody CustomerSiteRequest request) {

        CustomerSite createdSite =
                customerSiteService.createSite(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createdSite);
    }

    @GetMapping
    public ResponseEntity<List<CustomerSite>> getAllSites() {

        return ResponseEntity.ok(
                customerSiteService.getAllSites()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerSite> getSiteById(
            @PathVariable String id) {

        return ResponseEntity.ok(
                customerSiteService.getSiteById(id)
        );
    }

    @GetMapping("/region/{regionId}")
    public ResponseEntity<List<CustomerSite>> getSitesByRegion(
            @PathVariable String regionId) {

        return ResponseEntity.ok(
                customerSiteService.getSitesByRegion(regionId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerSite> updateSite(
            @PathVariable String id,
            @Valid @RequestBody CustomerSiteRequest request) {

        CustomerSite updatedSite =
                customerSiteService.updateSite(id, request);

        return ResponseEntity.ok(updatedSite);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(
            @PathVariable String id) {

        customerSiteService.deleteSite(id);

        return ResponseEntity.noContent().build();
    }
}