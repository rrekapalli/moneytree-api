package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PendingOrder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class PendingOrderService {

    private static final Logger log = LoggerFactory.getLogger(PendingOrderService.class);
    private final PendingOrderRepository repository;

    public PendingOrderService(PendingOrderRepository repository) {
        this.repository = repository;
    }

    public List<PendingOrder> findByPortfolioId(UUID portfolioId) {
        return repository.findByPortfolioIdOrderByOrderTimestampDesc(portfolioId);
    }

    public List<PendingOrder> findActiveByPortfolioId(UUID portfolioId) {
        return repository.findActiveByPortfolioId(portfolioId);
    }

    public List<PendingOrder> findByPortfolioIdAndOrderType(UUID portfolioId, String orderType) {
        return repository.findByPortfolioIdAndOrderType(portfolioId, orderType);
    }

    public Optional<PendingOrder> findByOrderId(String orderId) {
        return repository.findByOrderId(orderId);
    }

    public Optional<PendingOrder> findById(UUID id) {
        return repository.findById(id);
    }

    public PendingOrder save(PendingOrder order) {
        return repository.save(order);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

