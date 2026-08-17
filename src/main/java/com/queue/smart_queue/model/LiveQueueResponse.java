package com.queue.smart_queue.model;

import lombok.Data;
import java.util.List;

@Data
public class LiveQueueResponse {

    private long pendingCustomers;
    private List<Token> servingTokens;
}
