package com.queue.smart_queue.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "counters")
@Data
public class Counter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer counterNumber;
    private String operatorName;
    private Boolean isOpen;
}
