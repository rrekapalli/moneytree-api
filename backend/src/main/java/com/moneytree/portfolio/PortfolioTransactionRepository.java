package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PortfolioTransactionRepository extends JpaRepository<PortfolioTransaction, Long> {

    List<PortfolioTransaction> findByPortfolioId(Long portfolioId);

    List<PortfolioTransaction> findByPortfolioIdAndTradeDateBetween(Long portfolioId, LocalDate start, LocalDate end);

    List<PortfolioTransaction> findBySymbol(String symbol);

    List<PortfolioTransaction> findByTxnType(String txnType);

    @Query("SELECT pt FROM PortfolioTransaction pt WHERE pt.portfolio.id = ?1 ORDER BY pt.tradeDate DESC, pt.tradeTime DESC")
    List<PortfolioTransaction> findByPortfolioIdOrderByTradeDateDesc(Long portfolioId);
}

