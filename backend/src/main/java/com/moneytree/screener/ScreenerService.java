package com.moneytree.screener;

import com.moneytree.screener.entity.Screener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for screener CRUD operations using Spring Data JPA.
 */
@Service
@Transactional
public class ScreenerService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerService.class);

    private final ScreenerRepository screenerRepository;

    public ScreenerService(ScreenerRepository screenerRepository) {
        this.screenerRepository = screenerRepository;
    }

    public List<Screener> listScreeners() {
        log.info("listScreeners called");
        return screenerRepository.findByIsPublicTrue();
    }

    public List<Screener> listScreenersByUser(UUID userId) {
        log.info("listScreenersByUser userId={}", userId);
        return screenerRepository.findPublicOrOwnedByUser(userId);
    }

    public List<Screener> listScreenersByOwner(UUID ownerId) {
        log.info("listScreenersByOwner ownerId={}", ownerId);
        return screenerRepository.findByOwnerId(ownerId);
    }

    public Optional<Screener> getScreener(UUID id) {
        log.info("getScreener id={}", id);
        return screenerRepository.findById(id);
    }

    public Screener createScreener(Screener screener) {
        log.info("createScreener name={}", screener.getName());
        return screenerRepository.save(screener);
    }

    public Screener updateScreener(Screener screener) {
        log.info("updateScreener id={}", screener.getScreenerId());
        return screenerRepository.save(screener);
    }

    public void deleteScreener(UUID id) {
        log.info("deleteScreener id={}", id);
        screenerRepository.deleteById(id);
    }
}


