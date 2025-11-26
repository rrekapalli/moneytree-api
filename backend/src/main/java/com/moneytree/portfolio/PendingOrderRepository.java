package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PendingOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PendingOrderRepository extends JpaRepository<PendingOrder, UUID> {

    List<PendingOrder> findByPortfolioId(UUID portfolioId);

    List<PendingOrder> findByPortfolioIdAndOrderType(UUID portfolioId, String orderType);

    List<PendingOrder> findBySymbol(String symbol);

    List<PendingOrder> findByOrderType(String orderType);

    Optional<PendingOrder> findByOrderId(String orderId);

    @Query("SELECT po FROM PendingOrder po WHERE po.portfolio.id = ?1 ORDER BY po.orderTimestamp DESC")
    List<PendingOrder> findByPortfolioIdOrderByOrderTimestampDesc(UUID portfolioId);

    @Query("SELECT po FROM PendingOrder po WHERE po.portfolio.id = ?1 AND po.remainingQuantity > 0 ORDER BY po.orderTimestamp DESC")
    List<PendingOrder> findActiveByPortfolioId(UUID portfolioId);
}

