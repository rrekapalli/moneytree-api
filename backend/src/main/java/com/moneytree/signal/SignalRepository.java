package com.moneytree.signal;

import com.moneytree.signal.entity.Signal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SignalRepository extends JpaRepository<Signal, Integer> {

    List<Signal> findByPortfolioId(Long portfolioId);

    List<Signal> findBySymbol(String symbol);

    List<Signal> findBySignalType(String signalType);

    List<Signal> findByExecutedFalse();

    List<Signal> findByPortfolioIdAndExecutedFalse(Long portfolioId);

    @Query("SELECT s FROM Signal s WHERE s.portfolio.id = ?1 ORDER BY s.timestamp DESC")
    List<Signal> findByPortfolioIdOrderByTimestampDesc(Long portfolioId);

    List<Signal> findByTimestampBetween(Instant start, Instant end);
}

