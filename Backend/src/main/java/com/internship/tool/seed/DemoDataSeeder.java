package com.internship.tool.seed;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Component
public class DemoDataSeeder implements ApplicationRunner {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public DemoDataSeeder(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        Long count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM threat_indicator",
                Map.of(),
                Long.class
        );
        if (count != null && count > 0) {
            return;
        }

        List<Map<String, Object>> records = List.of(
                record("IPV4", "185.220.101.4", 92, "HIGH", "ACTIVE", "AbuseIPDB", "https://abuseipdb.com/check/185.220.101.4", "Tor exit node used in brute-force campaigns", 1),
                record("DOMAIN", "login-microsoft-security-check[.]com", 88, "CRITICAL", "ACTIVE", "PhishTank", "https://phishtank.org", "Credential harvesting domain mimicking Microsoft", 2),
                record("URL", "hxxps://cdn-update-secure[.]net/install.ps1", 85, "HIGH", "ACTIVE", "Internal SOC", "IR-2026-041", "Malicious PowerShell delivery URL", 3),
                record("EMAIL", "payroll-support@secure-banking-alerts.com", 77, "MEDIUM", "ACTIVE", "Spamhaus", "https://spamhaus.org", "Business email compromise lure sender", 4),
                record("IPV4", "45.155.205.233", 95, "CRITICAL", "ACTIVE", "MISP Feed", "event-22491", "C2 server associated with ransomware affiliate", 5),
                record("DOMAIN", "support-appleid-verification[.]org", 81, "HIGH", "ACTIVE", "OpenPhish", "https://openphish.com", "Apple ID phishing kit host", 6),
                record("URL", "hxxp://update-agent[.]cc/client.exe", 74, "MEDIUM", "EXPIRED", "ThreatFox", "ioc-99312", "Legacy malware dropper no longer reachable", 9),
                record("IPV4", "103.27.109.17", 67, "MEDIUM", "ACTIVE", "GreyNoise", "scan-observed", "Aggressive scanning across SSH and RDP", 2),
                record("DOMAIN", "jira-auth-company[.]co", 83, "HIGH", "FALSE_POSITIVE", "User Report", "helpdesk-9132", "Reported suspicious but confirmed benign redirect", 7),
                record("URL", "hxxps://pastebin[.]com/raw/q8mXx2fA", 64, "LOW", "ACTIVE", "Internal SOC", "hunt-118", "Potential staging script observed in telemetry", 11),
                record("IPV4", "91.219.236.77", 79, "MEDIUM", "ACTIVE", "Abuse.ch", "sslbl-io", "Botnet infrastructure overlap with prior campaigns", 12),
                record("EMAIL", "it-helpdesk@company-reset-password.com", 86, "HIGH", "ACTIVE", "User Report", "ticket-7421", "Mass phishing email sender targeting internal users", 1),
                record("DOMAIN", "vpn-corporate-login[.]net", 90, "CRITICAL", "ACTIVE", "Internal SOC", "IR-2026-052", "Fake VPN portal used for MFA theft", 2),
                record("URL", "hxxps://raw.githubusercontent[.]com/temp/dropper/main/install.sh", 71, "MEDIUM", "ACTIVE", "ThreatFox", "ioc-10072", "Shell payload fetched by compromised hosts", 8),
                record("IPV4", "196.251.89.44", 82, "HIGH", "ACTIVE", "AbuseIPDB", "https://abuseipdb.com/check/196.251.89.44", "Repeated auth bypass attempts on web gateways", 4)
        );

        for (Map<String, Object> record : records) {
            var params = new MapSqlParameterSource(record);
            jdbcTemplate.update("""
                    INSERT INTO threat_indicator (
                        indicator_type, indicator_value, confidence, severity, status,
                        source_name, source_reference, description, last_seen_at
                    ) VALUES (
                        :indicator_type, :indicator_value, :confidence, :severity, :status,
                        :source_name, :source_reference, :description, :last_seen_at
                    )
                    """, params);
        }
    }

    private Map<String, Object> record(
            String indicatorType,
            String indicatorValue,
            Integer confidence,
            String severity,
            String status,
            String sourceName,
            String sourceReference,
            String description,
            int daysAgo
    ) {
        return Map.of(
                "indicator_type", indicatorType,
                "indicator_value", indicatorValue,
                "confidence", confidence,
                "severity", severity,
                "status", status,
                "source_name", sourceName,
                "source_reference", sourceReference,
                "description", description,
                "last_seen_at", Timestamp.valueOf(LocalDateTime.now().minusDays(daysAgo))
        );
    }
}
