package com.queue.smart_queue.repository;

import com.queue.smart_queue.model.Token;
import com.queue.smart_queue.model.TokenStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TokenRepository extends JpaRepository<Token, Long> {

    long countByStatus(TokenStatus status);
    boolean existsByTokenNumber(Integer tokenNumber);
    List<Token> findByStatus(TokenStatus status);
    List<Token> findByStatusOrderByCreatedAtAsc(TokenStatus status);

    @Query("SELECT COUNT(t) FROM Token t WHERE t.status = :status")
    long countTokensByStatus(@Param("status") TokenStatus status);

}
