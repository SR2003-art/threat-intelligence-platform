CREATE TABLE audit_log (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    entity_type VARCHAR(64) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    action VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NULL,
    details JSON NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_log_entity
    ON audit_log (entity_type, entity_id);

CREATE INDEX idx_audit_log_action_created_at
    ON audit_log (action, created_at);

CREATE INDEX idx_audit_log_created_at
    ON audit_log (created_at);
