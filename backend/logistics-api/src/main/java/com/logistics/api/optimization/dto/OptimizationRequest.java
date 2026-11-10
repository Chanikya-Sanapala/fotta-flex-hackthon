package com.logistics.api.optimization.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record OptimizationRequest(
    @NotNull LocalDate planningDate,
    String scenarioName,
    String trafficScenario
) {
    public OptimizationRequest {
        if (scenarioName == null || scenarioName.isBlank()) {
            scenarioName = "DEFAULT";
        }
        if (trafficScenario == null || trafficScenario.isBlank()) {
            trafficScenario = "NORMAL";
        }
    }
}
