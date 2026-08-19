package com.queue.smart_queue.controller;

import com.queue.smart_queue.model.Token;
import com.queue.smart_queue.model.TokenRequest;
import com.queue.smart_queue.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.queue.smart_queue.model.LiveQueueResponse;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "*")
public class QueueController {
   @Autowired
    private TokenService tokenService;
    @PostMapping("/generate")
    public ResponseEntity<Token> generateToken(
            @Valid @RequestBody TokenRequest request) {
        Token token = tokenService.generateToken(request);
        return ResponseEntity.status(201).body(token);
    }
    @GetMapping("/live-status")
    public ResponseEntity<LiveQueueResponse> getLiveStatus() {
        LiveQueueResponse response = tokenService.getLiveStatus();
        return ResponseEntity.ok(response);
    }
    @PutMapping("/next/{counterId}")
    public ResponseEntity<?> nextCustomer(
            @PathVariable Long counterId) {

        Token token = tokenService.processNextToken(counterId);

        if (token == null) {
            return ResponseEntity.ok(Map.of("message", "No Pending Customers"));
        }

        return ResponseEntity.ok(token);
    }
}
