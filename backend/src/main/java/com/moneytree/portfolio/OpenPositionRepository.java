package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.OpenPosition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpenPositionRepository extends JpaRepository<OpenPosition, Integer> {

    List<OpenPosition> findByPortfolioId(Long portfolioId);

    Optional<OpenPosition> findByPortfolioIdAndSymbol(Long portfolioId, String symbol);

    List<OpenPosition> findBySymbol(String symbol);

    @Query("SELECT op FROM OpenPosition op WHERE op.portfolio.id = ?1 ORDER BY op.entryDate DESC")
    List<OpenPosition> findByPortfolioIdOrderByEntryDateDesc(Long portfolioId);
}

