package com.internship.tool.indicator;

import java.time.LocalDateTime;

public record ThreatIndicator(
        Long id,
        String indicatorType,
        String value,
        Integer confidence,
        String severity,
        String status,
        String source,
        String sourceReference,
        String title,
        String description,
        LocalDateTime lastObserved
) {
}
