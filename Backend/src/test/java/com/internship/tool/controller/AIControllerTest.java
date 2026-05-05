package com.internship.tool.controller;

import com.internship.tool.service.AIServiceClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AIController.class)
class AIControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AIServiceClient aiServiceClient;

    @Test
    void aiTest_returns200() throws Exception {
        when(aiServiceClient.callAIService()).thenReturn("ok");
        mockMvc.perform(get("/ai/test"))
                .andExpect(status().isOk());
    }

    @Test
    void aiRecommend_returns200() throws Exception {
        when(aiServiceClient.getRecommendations("hello")).thenReturn("{\"result\":\"ok\"}");
        mockMvc.perform(post("/ai/recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "prompt":"hello"
                                }
                                """))
                .andExpect(status().isOk());
    }
}
