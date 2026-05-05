package com.internship.tool.indicator;

import java.util.List;

public record PagedResponse<T>(
        List<T> content,
        long totalElements,
        int page,
        int size,
        int totalPages
) {
}
