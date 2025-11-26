package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.OpenPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OpenPositionRepository extends JpaRepository<OpenPosition, UUID> {

    @Query("SELECT op FROM OpenPosition op WHERE op.portfolio.id = ?1")
    List<OpenPosition> findByPortfolioId(UUID portfolioId);

    @Query("SELECT op FROM OpenPosition op WHERE op.portfolio.id = ?1 AND op.symbol = ?2")
    Optional<OpenPosition> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);

    List<OpenPosition> findBySymbol(String symbol);

    @Query("SELECT op FROM OpenPosition op WHERE op.portfolio.id = ?1 ORDER BY op.entryDate DESC")
    List<OpenPosition> findByPortfolioIdOrderByEntryDateDesc(UUID portfolioId);
}

