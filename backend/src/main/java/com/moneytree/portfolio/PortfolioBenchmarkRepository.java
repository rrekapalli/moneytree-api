package com.moneytree.portfolio;

import com.moneytree.portfolio.entity.PortfolioBenchmark;
import com.moneytree.portfolio.entity.PortfolioBenchmarkId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortfolioBenchmarkRepository extends JpaRepository<PortfolioBenchmark, PortfolioBenchmarkId> {

    List<PortfolioBenchmark> findByPortfolioId(java.util.UUID portfolioId);

    List<PortfolioBenchmark> findByIndexName(String indexName);
}

