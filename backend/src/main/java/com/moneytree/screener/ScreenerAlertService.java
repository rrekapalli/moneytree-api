package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerAlert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerAlertService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerAlertService.class);
    private final ScreenerAlertRepository repository;

    public ScreenerAlertService(ScreenerAlertRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerAlert> findByScreenerId(Long screenerId) {
        return repository.findByScreenerId(screenerId);
    }

    public Optional<ScreenerAlert> findById(Long id) {
        return repository.findById(id);
    }

    public ScreenerAlert save(ScreenerAlert alert) {
        return repository.save(alert);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

