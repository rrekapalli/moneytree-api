package com.moneytree.portfolio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Placeholder service for portfolio CRUD operations.
 *
 * TODO: Copy concrete behavior and data mappings from the existing MoneyPlant backend.
 */
@Service
public class PortfolioService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioService.class);

    public List<String> listPortfolios() {
        log.info("listPortfolios called (placeholder)");
        return Collections.emptyList();
    }
}


