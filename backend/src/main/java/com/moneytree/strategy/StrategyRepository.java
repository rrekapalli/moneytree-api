package com.moneytree.strategy;

import com.moneytree.strategy.entity.Strategy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StrategyRepository extends JpaRepository<Strategy, UUID> {

    @Query("SELECT s FROM Strategy s WHERE s.user.id = ?1")
    List<Strategy> findByUserId(UUID userId);

    @Query("SELECT s FROM Strategy s WHERE s.user.id = ?1 AND s.name = ?2")
    Optional<Strategy> findByUserIdAndName(UUID userId, String name);

    @Query("SELECT s FROM Strategy s WHERE s.user.id = ?1 AND s.isActive = ?2")
    List<Strategy> findByUserIdAndIsActive(UUID userId, Boolean isActive);

    @Query("SELECT s FROM Strategy s WHERE s.isActive = true ORDER BY s.updatedAt DESC")
    List<Strategy> findAllActiveOrderByUpdatedAtDesc();

    @Query("SELECT s FROM Strategy s ORDER BY s.updatedAt DESC")
    List<Strategy> findAllByOrderByUpdatedAtDesc();

    @Query("SELECT s FROM Strategy s WHERE s.user.id = ?1 ORDER BY s.updatedAt DESC")
    List<Strategy> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
