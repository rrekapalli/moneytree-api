package com.moneytree.signal;

import com.moneytree.signal.entity.Signal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface SignalRepository extends JpaRepository<Signal, UUID> {

    @Query("SELECT s FROM Signal s WHERE s.portfolio.id = ?1")
    List<Signal> findByPortfolioId(UUID portfolioId);

    List<Signal> findBySymbol(String symbol);

    List<Signal> findBySignalType(String signalType);

    List<Signal> findByExecutedFalse();

    @Query("SELECT s FROM Signal s WHERE s.portfolio.id = ?1 AND s.executed = false")
    List<Signal> findByPortfolioIdAndExecutedFalse(UUID portfolioId);

    @Query("SELECT s FROM Signal s WHERE s.portfolio.id = ?1 ORDER BY s.timestamp DESC")
    List<Signal> findByPortfolioIdOrderByTimestampDesc(UUID portfolioId);

    List<Signal> findByTimestampBetween(Instant start, Instant end);
}

