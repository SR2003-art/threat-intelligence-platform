-- Performance indexes for filtered pagination and analytics queries.

CREATE INDEX idx_threat_indicator_status_last_seen_id
    ON threat_indicator (status, last_seen_at, id);

CREATE INDEX idx_threat_indicator_severity_status
    ON threat_indicator (severity, status);
