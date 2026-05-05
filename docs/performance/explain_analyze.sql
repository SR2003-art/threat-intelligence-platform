-- Run these on MySQL 8+ to validate query plans.
-- Use representative bind values from production-like traffic.

-- 1) Filtered paginated listing
EXPLAIN ANALYZE
SELECT id, indicator_type, indicator_value, confidence, severity, status, source_name, source_reference, description, last_seen_at
FROM threat_indicator
WHERE status <> 'INACTIVE'
  AND ('ACTIVE' = '' OR status = 'ACTIVE')
  AND ('%phish%' = '%%' OR (
      LOWER(indicator_value) LIKE '%phish%'
      OR LOWER(COALESCE(description, '')) LIKE '%phish%'
      OR LOWER(COALESCE(source_name, '')) LIKE '%phish%'
      OR LOWER(indicator_type) LIKE '%phish%'
  ))
  AND ('2026-01-01' IS NULL OR DATE(last_seen_at) >= '2026-01-01')
  AND ('2026-12-31' IS NULL OR DATE(last_seen_at) <= '2026-12-31')
ORDER BY id DESC
LIMIT 10 OFFSET 0;

-- 2) Filtered count query
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM threat_indicator
WHERE status <> 'INACTIVE'
  AND ('ACTIVE' = '' OR status = 'ACTIVE')
  AND ('%phish%' = '%%' OR (
      LOWER(indicator_value) LIKE '%phish%'
      OR LOWER(COALESCE(description, '')) LIKE '%phish%'
      OR LOWER(COALESCE(source_name, '')) LIKE '%phish%'
      OR LOWER(indicator_type) LIKE '%phish%'
  ))
  AND ('2026-01-01' IS NULL OR DATE(last_seen_at) >= '2026-01-01')
  AND ('2026-12-31' IS NULL OR DATE(last_seen_at) <= '2026-12-31');

-- 3) Stats high severity query
EXPLAIN ANALYZE
SELECT COUNT(*)
FROM threat_indicator
WHERE severity IN ('HIGH', 'CRITICAL')
  AND status <> 'INACTIVE';
