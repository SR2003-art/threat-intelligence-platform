package com.internship.tool.indicator;

public class IndicatorNotFoundException extends RuntimeException {
    public IndicatorNotFoundException(Long id) {
        super("Threat indicator not found: " + id);
    }
}
