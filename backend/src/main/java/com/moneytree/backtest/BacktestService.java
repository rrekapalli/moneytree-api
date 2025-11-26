package com.moneytree.backtest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Placeholder service for backtest CRUD operations.
 *
 * TODO: Copy concrete behavior and data mappings from the existing MoneyPlant backend.
 */
@Service
public class BacktestService {

    private static final Logger log = LoggerFactory.getLogger(BacktestService.class);

    public List<String> listBacktests() {
        log.info("listBacktests called (placeholder)");
        return Collections.emptyList();
    }
}


