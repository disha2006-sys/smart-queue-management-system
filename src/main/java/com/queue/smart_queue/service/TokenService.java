package com.queue.smart_queue.service;

import com.queue.smart_queue.repository.CounterRepository;
import com.queue.smart_queue.repository.TokenRepository;
import com.queue.smart_queue.repository.UserRepository;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.queue.smart_queue.model.Token;
import com.queue.smart_queue.model.TokenStatus;
import java.time.LocalDateTime;
import com.queue.smart_queue.model.Counter;
import java.util.List;
import com.queue.smart_queue.model.User;
import com.queue.smart_queue.model.TokenRequest;
import com.queue.smart_queue.model.LiveQueueResponse;
import com.queue.smart_queue.exception.CounterNotFoundException;

@Service
@Setter
public class TokenService {
    @Autowired
    private TokenRepository tokenRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CounterRepository counterRepository;

    public Token generateToken(TokenRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setPhoneNumber(request.getPhoneNumber());
        user = userRepository.save(user);
        int tokenNumber;
        do {
            tokenNumber = (int) (System.currentTimeMillis() % 1000);
        } while (tokenRepository.existsByTokenNumber(tokenNumber));

        long pendingCustomers = tokenRepository.countByStatus(TokenStatus.PENDING);
        final int AVG_SERVICE_TIME = 5;
        int estimatedWaitTime =(int) pendingCustomers * AVG_SERVICE_TIME;

        Token token = new Token();
        token.setUser(user);
        token.setTokenNumber(tokenNumber);
        token.setStatus(TokenStatus.PENDING);
        token.setCreatedAt(LocalDateTime.now());
        token.setEstimatedWaitTimeInMins(estimatedWaitTime);
        return tokenRepository.save(token);
    }
    public Token processNextToken(Long counterId) {
        List<Token> servingTokens =
                tokenRepository.findByStatus(TokenStatus.SERVING);
        for (Token token : servingTokens) {
            if (token.getCounter() != null &&
                    token.getCounter().getId().equals(counterId)) {
                token.setStatus(TokenStatus.COMPLETED);
                tokenRepository.save(token);
            }
        }
        List<Token> pendingTokens =
                tokenRepository.findByStatusOrderByCreatedAtAsc(TokenStatus.PENDING);
        if (pendingTokens.isEmpty()) {
            return null;
        }
        Token nextToken = pendingTokens.get(0);
        Counter counter = counterRepository.findById(counterId)
                .orElseThrow(() -> new CounterNotFoundException("Counter not found"));
        nextToken.setStatus(TokenStatus.SERVING);
        nextToken.setCounter(counter);
        return tokenRepository.save(nextToken);

    }
    public LiveQueueResponse getLiveStatus() {
        long pendingCustomers = tokenRepository.countByStatus(TokenStatus.PENDING);
        List<Token> servingTokens = tokenRepository.findByStatus(TokenStatus.SERVING);
        LiveQueueResponse response = new LiveQueueResponse();
        response.setPendingCustomers(pendingCustomers);
        response.setServingTokens(servingTokens);
        return response;
    }
}
