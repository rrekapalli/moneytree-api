package com.moneytree.screener;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Placeholder service for screener CRUD operations.
 *
 * TODO: Copy concrete behavior and data mappings from the existing MoneyPlant backend.
 */
@Service
public class ScreenerService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerService.class);

    public List<String> listScreeners() {
        log.info("listScreeners called (placeholder)");
        return Collections.emptyList();
    }
}


