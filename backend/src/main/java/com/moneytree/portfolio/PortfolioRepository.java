package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.Portfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {

    List<Portfolio> findByIsActiveTrue();

    @Query("SELECT p FROM Portfolio p WHERE p.user.id = ?1")
    List<Portfolio> findByUserId(UUID userId);

    @Query("SELECT p FROM Portfolio p WHERE p.user.id = ?1 AND p.name = ?2")
    Optional<Portfolio> findByUserIdAndName(UUID userId, String name);

    @Query("SELECT p FROM Portfolio p WHERE p.isActive = true ORDER BY p.updatedAt DESC")
    List<Portfolio> findAllActiveOrderByCreatedAtDesc();
}

