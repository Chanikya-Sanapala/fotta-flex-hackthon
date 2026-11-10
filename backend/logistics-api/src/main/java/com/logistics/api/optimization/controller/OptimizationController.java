package com.logistics.api.optimization.controller;

import com.logistics.api.optimization.dto.OptimizationRequest;
import com.logistics.api.optimization.service.OptimizationService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/optimization")
@CrossOrigin(origins = "http://localhost:5173")
public class OptimizationController {

    private final OptimizationService optimizationService;

    public OptimizationController(OptimizationService optimizationService) {
        this.optimizationService = optimizationService;
    }

    @PostMapping("/run")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> runOptimization(
            @Valid @RequestBody OptimizationRequest request) {
        return optimizationService.optimize(request);
    }

    @GetMapping("/latest")
    public Map<String, Object> getLatestOptimization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate planningDate) {
        return optimizationService.getLatestCompletedOptimization(planningDate);
    }
}
