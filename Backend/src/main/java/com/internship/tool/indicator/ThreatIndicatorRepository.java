package com.internship.tool.indicator;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.GeneratedKeyHolder;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class ThreatIndicatorRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    private static final RowMapper<ThreatIndicator> ROW_MAPPER = (rs, rowNum) -> new ThreatIndicator(
            rs.getLong("id"),
            rs.getString("indicator_type"),
            rs.getString("value"),
            rs.getObject("confidence", Integer.class),
            rs.getString("severity"),
            rs.getString("status"),
            rs.getString("source"),
            rs.getString("source_reference"),
            rs.getString("title"),
            rs.getString("description"),
            rs.getTimestamp("last_observed") == null ? null : rs.getTimestamp("last_observed").toLocalDateTime()
    );

    public ThreatIndicatorRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<ThreatIndicator> findAllActive() {
        return jdbcTemplate.query("""
                SELECT id, indicator_type, value, confidence, severity, status, source, source_reference, title, description, last_observed
                FROM threat_indicator
                WHERE status <> 'inactive'
                ORDER BY id DESC
                """, ROW_MAPPER);
    }

    public List<ThreatIndicator> searchActive(String q) {
        return jdbcTemplate.query("""
                SELECT id, indicator_type, value, confidence, severity, status, source, source_reference, title, description, last_observed
                FROM threat_indicator
                WHERE status <> 'inactive'
                  AND (
                    LOWER(value) LIKE :q
                    OR LOWER(title) LIKE :q
                    OR LOWER(description) LIKE :q
                    OR LOWER(source) LIKE :q
                  )
                ORDER BY id DESC
                """, Map.of("q", "%" + q.toLowerCase() + "%"), ROW_MAPPER);
    }

    public ThreatIndicator create(ThreatIndicatorRequest request) {
        var keyHolder = new GeneratedKeyHolder();
        var params = requestToParams(request).addValue("last_observed", Timestamp.valueOf(LocalDateTime.now()));
        jdbcTemplate.update("""
                INSERT INTO threat_indicator (
                    indicator_type, value, confidence, severity, status, source, source_reference, title, description, last_observed
                ) VALUES (
                    :indicator_type, :value, :confidence, :severity, :status, :source, :source_reference, :title, :description, :last_observed
                )
                """, params, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) {
            throw new IllegalStateException("Failed to create threat indicator");
        }
        return findById(key.longValue());
    }

    public ThreatIndicator update(Long id, ThreatIndicatorRequest request) {
        var params = requestToParams(request)
                .addValue("id", id)
                .addValue("last_observed", Timestamp.valueOf(LocalDateTime.now()));
        int updated = jdbcTemplate.update("""
                UPDATE threat_indicator
                SET indicator_type = :indicator_type,
                    value = :value,
                    confidence = :confidence,
                    severity = :severity,
                    status = :status,
                    source = :source,
                    source_reference = :source_reference,
                    title = :title,
                    description = :description,
                    last_observed = :last_observed
                WHERE id = :id
                """, params);
        if (updated == 0) {
            throw new IndicatorNotFoundException(id);
        }
        return findById(id);
    }

    public void softDelete(Long id) {
        int updated = jdbcTemplate.update("""
                UPDATE threat_indicator
                SET status = 'inactive', updated_at = CURRENT_TIMESTAMP(3)
                WHERE id = :id
                """, Map.of("id", id));
        if (updated == 0) {
            throw new IndicatorNotFoundException(id);
        }
    }

    public ThreatIndicator findById(Long id) {
        var rows = jdbcTemplate.query("""
                SELECT id, indicator_type, value, confidence, severity, status, source, source_reference, title, description, last_observed
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
                .addValue("indicator_type", request.indicatorType().toLowerCase())
                .addValue("value", request.value())
                .addValue("confidence", request.confidence())
                .addValue("severity", request.severity().toLowerCase())
                .addValue("status", request.status().toLowerCase())
                .addValue("source", request.source())
                .addValue("source_reference", request.sourceReference())
                .addValue("title", request.title())
                .addValue("description", request.description());
    }
}
