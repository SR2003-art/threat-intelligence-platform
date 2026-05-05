package com.internship.tool.audit;

import com.internship.tool.indicator.ThreatIndicator;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

@Aspect
@Component
public class AuditLogAspect {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public AuditLogAspect(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @AfterReturning(
            pointcut = "execution(* com.internship.tool.indicator.ThreatIndicatorRepository.create(..))",
            returning = "result"
    )
    public void afterCreate(Object result) {
        Long entityId = result instanceof ThreatIndicator indicator ? indicator.id() : null;
        writeAudit("THREAT_INDICATOR", entityId, "CREATE", Map.of("method", "create"));
    }

    @AfterReturning(
            pointcut = "execution(* com.internship.tool.indicator.ThreatIndicatorRepository.update(..))",
            returning = "result"
    )
    public void afterUpdate(Object result) {
        Long entityId = result instanceof ThreatIndicator indicator ? indicator.id() : null;
        writeAudit("THREAT_INDICATOR", entityId, "UPDATE", Map.of("method", "update"));
    }

    @Before("execution(* com.internship.tool.indicator.ThreatIndicatorRepository.softDelete(..))")
    public void beforeDelete(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        Long entityId = args.length > 0 && args[0] instanceof Long id ? id : null;
        writeAudit("THREAT_INDICATOR", entityId, "DELETE", Map.of("method", "softDelete"));
    }

    private void writeAudit(
            String entityType,
            Long entityId,
            String action,
            Map<String, Object> details
    ) {
        String actor = resolveActor();
        var params = new MapSqlParameterSource()
                .addValue("entity_type", entityType)
                .addValue("entity_id", entityId)
                .addValue("action", action)
                .addValue("actor", actor)
                .addValue("details", toJson(details));

        jdbcTemplate.update("""
                INSERT INTO audit_log (entity_type, entity_id, action, actor, details)
                VALUES (:entity_type, :entity_id, :action, :actor, CAST(:details AS JSON))
                """, params);
    }

    private String resolveActor() {
        var attrs = RequestContextHolder.getRequestAttributes();
        if (attrs instanceof ServletRequestAttributes servletAttrs) {
            String actor = servletAttrs.getRequest().getHeader("X-Actor");
            if (actor != null && !actor.isBlank()) {
                return actor.trim();
            }
        }
        return "system";
    }

    private String toJson(Map<String, Object> details) {
        StringBuilder builder = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, Object> entry : details.entrySet()) {
            if (!first) {
                builder.append(",");
            }
            builder.append("\"")
                    .append(escape(entry.getKey()))
                    .append("\":\"")
                    .append(escape(String.valueOf(entry.getValue())))
                    .append("\"");
            first = false;
        }
        builder.append("}");
        return builder.toString();
    }

    private String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
