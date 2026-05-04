package com.internship.tool.indicator;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ThreatIndicatorRequest(
        @NotBlank @Size(max = 32) String indicatorType,
        @NotBlank @Size(max = 2048) String value,
        @Min(0) @Max(100) Integer confidence,
        @NotBlank @Size(max = 16) String severity,
        @NotBlank @Size(max = 24) String status,
        @NotBlank @Size(max = 255) String source,
        @Size(max = 512) String sourceReference,
        @Size(max = 512) String title,
        String description
) {
}
