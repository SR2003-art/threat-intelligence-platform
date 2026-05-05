package com.internship.tool.indicator;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.GeneratedKeyHolder;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository
public class ThreatIndicatorRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private static final RowMapper<ThreatIndicator> ROW_MAPPER = (rs, rowNum) -> new ThreatIndicator(
            rs.getLong("id"),
            rs.getString("indicator_type"),
            rs.getString("indicator_value"),
            rs.getObject("confidence", Integer.class),
            rs.getString("severity"),
            rs.getString("status"),
            rs.getString("source_name"),
            rs.getString("source_reference"),
            rs.getString("description"),
            rs.getTimestamp("last_seen_at") == null ? null : rs.getTimestamp("last_seen_at").toLocalDateTime()
    );

    public ThreatIndicatorRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ThreatIndicator> findAllActive() {
        return jdbcTemplate.query("""
                SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                ORDER BY id DESC
                """, ROW_MAPPER);
    }

    public PagedResponse<ThreatIndicator> findAllActivePaged(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int offset = safePage * safeSize;

        Long totalElements = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                """, Map.of(), Long.class);
        long total = totalElements == null ? 0 : totalElements;
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safeSize);

        List<ThreatIndicator> content = jdbcTemplate.query("""
                SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                ORDER BY id DESC
                LIMIT :size OFFSET :offset
                """, Map.of("size", safeSize, "offset", offset), ROW_MAPPER);

        return new PagedResponse<>(content, total, safePage, safeSize, totalPages);
    }

    public PagedResponse<ThreatIndicator> findAllActivePagedFiltered(
            int page,
            int size,
            String query,
            String status,
            LocalDate fromDate,
            LocalDate toDate
    ) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(size, 1);
        int offset = safePage * safeSize;

        String q = query == null ? "" : query.trim().toLowerCase();
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        var params = new MapSqlParameterSource()
                .addValue("q", "%" + q + "%")
                .addValue("status", normalizedStatus)
                .addValue("fromDate", fromDate)
                .addValue("toDate", toDate)
                .addValue("size", safeSize)
                .addValue("offset", offset);

        Long totalElements = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                  AND (:status = '' OR status = :status)
                  AND (:q = '%%' OR (
                      LOWER(indicator_value) LIKE :q
                      OR LOWER(COALESCE(description, '')) LIKE :q
                      OR LOWER(COALESCE(source_name, '')) LIKE :q
                      OR LOWER(indicator_type) LIKE :q
                  ))
                  AND (:fromDate IS NULL OR DATE(last_seen_at) >= :fromDate)
                  AND (:toDate IS NULL OR DATE(last_seen_at) <= :toDate)
                """, params, Long.class);
        long total = totalElements == null ? 0 : totalElements;
        int totalPages = total == 0 ? 0 : (int) Math.ceil((double) total / safeSize);

        List<ThreatIndicator> content = jdbcTemplate.query("""
                SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                  AND (:status = '' OR status = :status)
                  AND (:q = '%%' OR (
                      LOWER(indicator_value) LIKE :q
                      OR LOWER(COALESCE(description, '')) LIKE :q
                      OR LOWER(COALESCE(source_name, '')) LIKE :q
                      OR LOWER(indicator_type) LIKE :q
                  ))
                  AND (:fromDate IS NULL OR DATE(last_seen_at) >= :fromDate)
                  AND (:toDate IS NULL OR DATE(last_seen_at) <= :toDate)
                ORDER BY id DESC
                LIMIT :size OFFSET :offset
                """, params, ROW_MAPPER);

        return new PagedResponse<>(content, total, safePage, safeSize, totalPages);
    }

    public List<ThreatIndicator> searchActive(String q) {
        return jdbcTemplate.query("""
                SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                  AND (
                    LOWER(indicator_value) LIKE :q
                    OR LOWER(COALESCE(description, '')) LIKE :q
                    OR LOWER(COALESCE(source_name, '')) LIKE :q
                    OR LOWER(indicator_type) LIKE :q
                  )
                ORDER BY id DESC
                """, Map.of("q", "%" + q.toLowerCase() + "%"), ROW_MAPPER);
    }

    public ThreatIndicator getById(Long id) {
        return findById(id);
    }

    public IndicatorStatsResponse getStats() {
        Long totalIndicators = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM threat_indicator
                """, Map.of(), Long.class);

        Long activeIndicators = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                """, Map.of(), Long.class);

        Long highSeverityIndicators = jdbcTemplate.queryForObject("""
                SELECT COUNT(*)
                FROM threat_indicator
                WHERE severity IN ('HIGH', 'CRITICAL')
                  AND status <> 'INACTIVE'
                """, Map.of(), Long.class);

        Double averageConfidence = jdbcTemplate.queryForObject("""
                SELECT COALESCE(AVG(confidence), 0)
                FROM threat_indicator
                WHERE confidence IS NOT NULL
                  AND status <> 'INACTIVE'
                """, Map.of(), Double.class);

        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
                SELECT UPPER(COALESCE(severity, 'UNKNOWN')) AS severity, COUNT(*) AS count
                FROM threat_indicator
                WHERE status <> 'INACTIVE'
                GROUP BY UPPER(COALESCE(severity, 'UNKNOWN'))
                ORDER BY count DESC
                """, Map.of());

        List<IndicatorStatsResponse.SeverityPoint> breakdown = new ArrayList<>();
        for (Map<String, Object> row : rows) {
            String severity = String.valueOf(row.get("severity"));
            long count = ((Number) row.get("count")).longValue();
            breakdown.add(new IndicatorStatsResponse.SeverityPoint(severity, count));
        }

        return new IndicatorStatsResponse(
                totalIndicators == null ? 0 : totalIndicators,
                activeIndicators == null ? 0 : activeIndicators,
                highSeverityIndicators == null ? 0 : highSeverityIndicators,
                averageConfidence == null ? 0 : averageConfidence,
                breakdown
        );
    }

    public ThreatIndicator create(ThreatIndicatorRequest request) {
        var keyHolder = new GeneratedKeyHolder();
        LocalDateTime now = LocalDateTime.now();
        var params = requestToParams(request)
                .addValue("last_seen_at", Timestamp.valueOf(now));
        jdbcTemplate.update("""
                INSERT INTO threat_indicator (
                    indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                ) VALUES (
                    :indicator_type, :indicator_value, :confidence, :severity, :status, :source_name, :source_reference, :description, :last_seen_at
                )
                """, params, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to create threat indicator");
        }
        return toThreatIndicator(key.longValue(), request, now);
    }

    public ThreatIndicator update(Long id, ThreatIndicatorRequest request) {
        LocalDateTime now = LocalDateTime.now();
        var params = requestToParams(request)
                .addValue("id", id)
                .addValue("last_seen_at", Timestamp.valueOf(now));
        int updated = jdbcTemplate.update("""
                UPDATE threat_indicator
                SET indicator_type = :indicator_type,
                    indicator_value = :indicator_value,
                    confidence = :confidence,
                    severity = :severity,
                    status = :status,
                    source_name = :source_name,
                    source_reference = :source_reference,
                    description = :description,
                    last_seen_at = :last_seen_at
                WHERE id = :id
                """, params);
        if (updated == 0) {
            throw new IndicatorNotFoundException(id);
        }
        return toThreatIndicator(id, request, now);
    }

    public void softDelete(Long id) {
        int updated = jdbcTemplate.update("""
                UPDATE threat_indicator
                SET status = 'INACTIVE',
                    updated_at = CURRENT_TIMESTAMP(3)
                WHERE id = :id
                """, Map.of("id", id));
        if (updated == 0) {
            throw new IndicatorNotFoundException(id);
        }
    }

    private ThreatIndicator findById(Long id) {
        var rows = jdbcTemplate.query("""
                SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
                FROM threat_indicator
                WHERE id = :id
                """, Map.of("id", id), ROW_MAPPER);
        if (rows.isEmpty()) {
            throw new IndicatorNotFoundException(id);
        }
        return rows.getFirst();
    }

    private MapSqlParameterSource requestToParams(ThreatIndicatorRequest request) {
        return new MapSqlParameterSource()
                .addValue("indicator_type", request.indicatorType().trim().toUpperCase())
                .addValue("indicator_value", request.indicatorValue().trim())
                .addValue("confidence", request.confidence())
                .addValue("severity", request.severity().trim().toUpperCase())
                .addValue("status", request.status().trim().toUpperCase())
                .addValue("source_name", request.sourceName())
                .addValue("source_reference", request.sourceReference())
                .addValue("description", request.description());
    }

    private ThreatIndicator toThreatIndicator(Long id, ThreatIndicatorRequest request, LocalDateTime lastSeenAt) {
        return new ThreatIndicator(
                id,
                request.indicatorType().trim().toUpperCase(),
                request.indicatorValue().trim(),
                request.confidence(),
                request.severity().trim().toUpperCase(),
                request.status().trim().toUpperCase(),
                request.sourceName(),
                request.sourceReference(),
                request.description(),
                lastSeenAt
        );
    }
}
