package com.queue.smart_queue.repository;

import com.queue.smart_queue.model.Counter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CounterRepository extends JpaRepository<Counter, Long> {

}