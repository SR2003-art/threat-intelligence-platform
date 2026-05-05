package com.internship.tool.indicator;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/threat-indicators")
@Tag(name = "Threat Indicators", description = "Threat indicator management endpoints")
public class ThreatIndicatorController {

    private final ThreatIndicatorRepository repository;
    private static final long MAX_UPLOAD_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_UPLOAD_TYPES = Set.of(
            "text/csv",
            "application/json",
            "text/plain"
    );

    public ThreatIndicatorController(ThreatIndicatorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Operation(summary = "Get all active indicators")
    public List<ThreatIndicator> getAll() {
        return repository.findAllActive();
    }

    @GetMapping("/all")
    @Operation(summary = "Get paged indicators with filters")
    public PagedResponse<ThreatIndicator> getAllPaged(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "fromDate", required = false) LocalDate fromDate,
            @RequestParam(value = "toDate", required = false) LocalDate toDate
    ) {
        return repository.findAllActivePagedFiltered(page, size, query, status, fromDate, toDate);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get indicator dashboard statistics")
    public IndicatorStatsResponse stats() {
        return repository.getStats();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get indicator by ID")
    public ThreatIndicator getOne(@PathVariable("id") Long id) {
        return repository.getById(id);
    }

    @GetMapping("/search")
    @Operation(summary = "Search active indicators")
    public List<ThreatIndicator> search(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return repository.findAllActive();
        }
        return repository.searchActive(query.trim());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create indicator")
    public ThreatIndicator create(@Valid @RequestBody ThreatIndicatorRequest request) {
        return repository.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update indicator")
    public ThreatIndicator update(
            @PathVariable("id") Long id,
            @Valid @RequestBody ThreatIndicatorRequest request
    ) {
        return repository.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Soft delete indicator")
    public void delete(@PathVariable("id") Long id) {
        repository.softDelete(id);
    }

    @GetMapping(value = "/export", produces = "text/csv")
    @Operation(
            summary = "Export active indicators to CSV",
            description = "Returns all active indicators as CSV content"
    )
    public ResponseEntity<String> exportCsv() {
        List<ThreatIndicator> rows = repository.findAllActive();
        StringBuilder csv = new StringBuilder();
        csv.append("id,indicatorType,indicatorValue,confidence,severity,status,sourceName,sourceReference,lastSeenAt,description\n");
        for (ThreatIndicator row : rows) {
            csv.append(csvValue(row.id()))
                    .append(",").append(csvValue(row.indicatorType()))
                    .append(",").append(csvValue(row.indicatorValue()))
                    .append(",").append(csvValue(row.confidence()))
                    .append(",").append(csvValue(row.severity()))
                    .append(",").append(csvValue(row.status()))
                    .append(",").append(csvValue(row.sourceName()))
                    .append(",").append(csvValue(row.sourceReference()))
                    .append(",").append(csvValue(row.lastSeenAt()))
                    .append(",").append(csvValue(row.description()))
                    .append("\n");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename("threat-indicators-" + LocalDate.now() + ".csv")
                        .build().toString())
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Upload indicator file",
            description = "Validates uploaded file type and size before processing",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            schema = @Schema(type = "object"))
            )
    )
    public UploadResponse upload(@RequestPart("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        if (file.getSize() > MAX_UPLOAD_BYTES) {
            throw new IllegalArgumentException("File exceeds max size of 5MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_UPLOAD_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Unsupported file type. Allowed: text/csv, application/json, text/plain");
        }

        return new UploadResponse(
                file.getOriginalFilename(),
                contentType,
                file.getSize(),
                "accepted",
                LocalDateTime.now().toString()
        );
    }

    private String csvValue(Object value) {
        if (value == null) {
            return "";
        }
        String text = String.valueOf(value);
        String escaped = text.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    public record UploadResponse(
            String fileName,
            String contentType,
            long sizeBytes,
            String status,
            String uploadedAt
    ) {
    }
}
