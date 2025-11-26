package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioTransactionRepository extends JpaRepository<PortfolioTransaction, UUID> {

    List<PortfolioTransaction> findByPortfolioId(UUID portfolioId);

    List<PortfolioTransaction> findByPortfolioIdAndTradeDateBetween(UUID portfolioId, LocalDate start, LocalDate end);

    List<PortfolioTransaction> findBySymbol(String symbol);

    List<PortfolioTransaction> findByTxnType(String txnType);

    @Query("SELECT pt FROM PortfolioTransaction pt WHERE pt.portfolio.id = ?1 ORDER BY pt.tradeDate DESC, pt.tradeTime DESC")
    List<PortfolioTransaction> findByPortfolioIdOrderByTradeDateDesc(UUID portfolioId);
}

