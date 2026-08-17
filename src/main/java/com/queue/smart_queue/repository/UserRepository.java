package com.queue.smart_queue.repository;

import com.queue.smart_queue.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

}
