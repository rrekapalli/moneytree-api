package com.moneytree.signal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * Placeholder service for trading signal CRUD operations.
 *
 * TODO: Copy concrete behavior and data mappings from the existing MoneyPlant backend.
 */
@Service
public class SignalService {

    private static final Logger log = LoggerFactory.getLogger(SignalService.class);

    public List<String> listSignals() {
        log.info("listSignals called (placeholder)");
        return Collections.emptyList();
    }
}


