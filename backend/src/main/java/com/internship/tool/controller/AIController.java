package com.internship.tool.controller;

import com.internship.tool.service.AIServiceClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Tag(name = "AI", description = "AI assistant endpoints")
public class AIController {

    private final AIServiceClient aiServiceClient;

    public AIController(AIServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping("/ai/test")
    @Operation(summary = "Test AI service availability")
    public String testAI() {
        return aiServiceClient.callAIService();
    }

    @PostMapping("/ai/recommend")
    @Operation(summary = "Get AI recommendations for a prompt")
    public String recommend(@RequestBody RecommendRequest request) {
        return aiServiceClient.getRecommendations(request.prompt());
    }

    public record RecommendRequest(String prompt) {
    }
}