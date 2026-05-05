package com.internship.tool.indicator;

import java.time.LocalDateTime;

public record ThreatIndicator(
        Long id,
        String indicatorType,
        String indicatorValue,
        Integer confidence,
        String severity,
        String status,
        String sourceName,
        String sourceReference,
        String description,
        LocalDateTime lastSeenAt
) {
}
