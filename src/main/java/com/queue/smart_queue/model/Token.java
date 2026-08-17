package com.queue.smart_queue.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
@Data
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer tokenNumber;

    @Enumerated(EnumType.STRING)
    private TokenStatus status;
    private LocalDateTime createdAt;
    private Integer estimatedWaitTimeInMins;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "counter_id")
    private Counter counter;


}
