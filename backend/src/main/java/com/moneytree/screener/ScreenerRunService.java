package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerRun;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ScreenerRunService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerRunService.class);
    private final ScreenerRunRepository repository;

    public ScreenerRunService(ScreenerRunRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerRun> findByScreenerId(UUID screenerId) {
        return repository.findByScreenerIdOrderByStartedAtDesc(screenerId);
    }

    public List<ScreenerRun> findByStatus(String status) {
        return repository.findByStatus(status);
    }

    public List<ScreenerRun> findByRunForTradingDay(LocalDate tradingDay) {
        return repository.findByRunForTradingDay(tradingDay);
    }

    public Optional<ScreenerRun> findById(UUID id) {
        return repository.findById(id);
    }

    public ScreenerRun save(ScreenerRun run) {
        return repository.save(run);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

