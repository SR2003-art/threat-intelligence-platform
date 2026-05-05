package com.internship.tool.indicator;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

import java.util.List;

@RestController
@RequestMapping("/threat-indicators")
public class ThreatIndicatorController {

    private final ThreatIndicatorRepository repository;

    public ThreatIndicatorController(ThreatIndicatorRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ThreatIndicator> getAll() {
        return repository.findAllActive();
    }

    @GetMapping("/all")
    public PagedResponse<ThreatIndicator> getAllPaged(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return repository.findAllActivePaged(page, size);
    }

    @GetMapping("/search")
    public List<ThreatIndicator> search(@RequestParam("q") String query) {
        if (query == null || query.isBlank()) {
            return repository.findAllActive();
        }
        return repository.searchActive(query.trim());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ThreatIndicator create(@Valid @RequestBody ThreatIndicatorRequest request) {
        return repository.create(request);
    }

    @PutMapping("/{id}")
    public ThreatIndicator update(
            @PathVariable("id") Long id,
            @Valid @RequestBody ThreatIndicatorRequest request
    ) {
        return repository.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        repository.softDelete(id);
    }
}
