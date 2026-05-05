package com.internship.tool.indicator;

import java.util.List;

public record IndicatorStatsResponse(
        long totalIndicators,
        long activeIndicators,
        long highSeverityIndicators,
        double averageConfidence,
        List<SeverityPoint> severityBreakdown
) {
    public record SeverityPoint(String severity, long count) {
    }
}
