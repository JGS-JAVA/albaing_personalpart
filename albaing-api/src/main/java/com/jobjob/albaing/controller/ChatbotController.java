package com.jobjob.albaing.controller;

import com.jobjob.albaing.service.DialogflowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
// 커밋하기
@RestController
@RequestMapping("/chatbot")
public class ChatbotController {
    private final DialogflowService dialogflowService;
    public ChatbotController(DialogflowService dialogflowService) {
        this.dialogflowService = dialogflowService;
    }
    @PostMapping("/dialogflow")
    public ResponseEntity<Map<String, String>> handleChatbotMessage(@RequestParam String sessionId,
                                                                    @RequestParam String message) {
        try {
            String responseMessage = dialogflowService.detectIntent(sessionId, message);
            Map<String, String> response = new HashMap<>();
            response.put("response", responseMessage);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("response", "서버 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}