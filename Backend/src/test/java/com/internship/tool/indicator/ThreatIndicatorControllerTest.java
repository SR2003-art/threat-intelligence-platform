package com.internship.tool.indicator;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ThreatIndicatorController.class)
@Import(ApiExceptionHandler.class)
class ThreatIndicatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ThreatIndicatorRepository repository;

    private ThreatIndicator sample() {
        return new ThreatIndicator(
                1L,
                "IPV4",
                "1.1.1.1",
                80,
                "HIGH",
                "ACTIVE",
                "FeedX",
                "ref-1",
                "desc",
                LocalDateTime.now()
        );
    }

    @Test
    void getAll_returns200() throws Exception {
        when(repository.findAllActive()).thenReturn(List.of(sample()));
        mockMvc.perform(get("/threat-indicators"))
                .andExpect(status().isOk());
    }

    @Test
    void getAllPaged_returns200() throws Exception {
        when(repository.findAllActivePagedFiltered(eq(0), eq(10), any(), any(), any(), any()))
                .thenReturn(new PagedResponse<>(List.of(sample()), 1, 0, 10, 1));

        mockMvc.perform(get("/threat-indicators/all?page=0&size=10"))
                .andExpect(status().isOk());
    }

    @Test
    void getStats_returns200() throws Exception {
        when(repository.getStats()).thenReturn(new IndicatorStatsResponse(
                1, 1, 1, 80.0, List.of(new IndicatorStatsResponse.SeverityPoint("HIGH", 1))
        ));
        mockMvc.perform(get("/threat-indicators/stats"))
                .andExpect(status().isOk());
    }

    @Test
    void getById_returns200() throws Exception {
        when(repository.getById(1L)).thenReturn(sample());
        mockMvc.perform(get("/threat-indicators/1"))
                .andExpect(status().isOk());
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        when(repository.getById(99L)).thenThrow(new IndicatorNotFoundException(99L));
        mockMvc.perform(get("/threat-indicators/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void search_returns200() throws Exception {
        when(repository.searchActive("ioc")).thenReturn(List.of(sample()));
        mockMvc.perform(get("/threat-indicators/search?q=ioc"))
                .andExpect(status().isOk());
    }

    @Test
    void create_returns201() throws Exception {
        when(repository.create(any())).thenReturn(sample());
        mockMvc.perform(post("/threat-indicators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "indicatorType":"IPV4",
                                  "indicatorValue":"1.1.1.1",
                                  "confidence":80,
                                  "severity":"HIGH",
                                  "status":"ACTIVE",
                                  "sourceName":"FeedX",
                                  "sourceReference":"ref-1",
                                  "description":"desc"
                                }
                                """))
                .andExpect(status().isCreated());
    }

    @Test
    void create_validationError_returns400() throws Exception {
        mockMvc.perform(post("/threat-indicators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "indicatorType":"",
                                  "indicatorValue":"",
                                  "severity":"",
                                  "status":""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_returns200() throws Exception {
        when(repository.update(eq(1L), any())).thenReturn(sample());
        mockMvc.perform(put("/threat-indicators/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "indicatorType":"IPV4",
                                  "indicatorValue":"1.1.1.1",
                                  "confidence":80,
                                  "severity":"HIGH",
                                  "status":"ACTIVE",
                                  "sourceName":"FeedX",
                                  "sourceReference":"ref-1",
                                  "description":"desc"
                                }
                                """))
                .andExpect(status().isOk());
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete("/threat-indicators/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_notFound_returns404() throws Exception {
        doThrow(new IndicatorNotFoundException(2L)).when(repository).softDelete(2L);
        mockMvc.perform(delete("/threat-indicators/2"))
                .andExpect(status().isNotFound());
    }
}
