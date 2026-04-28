CREATE TABLE threats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,

    threat_name VARCHAR(255) NOT NULL,
    description TEXT,

    severity VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE',

    source VARCHAR(100),
    ip_address VARCHAR(45),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_threat_name ON threats(threat_name);
CREATE INDEX idx_severity ON threats(severity);
CREATE INDEX idx_status ON threats(status);
CREATE INDEX idx_ip_address ON threats(ip_address);