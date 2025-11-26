package com.moneytree.screener;

import com.moneytree.screener.entity.Screener;
import com.moneytree.user.UserRepository;
import com.moneytree.user.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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
    private final UserRepository userRepository;

    public ScreenerService(ScreenerRepository screenerRepository, UserRepository userRepository) {
        this.screenerRepository = screenerRepository;
        this.userRepository = userRepository;
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
        
        // Generate UUID if not set
        if (screener.getScreenerId() == null) {
            screener.setScreenerId(UUID.randomUUID());
        }
        
        // If owner is not set, find or create a default user
        if (screener.getOwner() == null) {
            User defaultUser = userRepository.findFirstByOrderByCreatedAtAsc()
                    .orElseGet(() -> {
                        // Create a default test user if none exists
                        User newUser = new User();
                        newUser.setId(UUID.randomUUID());
                        newUser.setEmail("test@moneytree.com");
                        newUser.setProvider("test");
                        newUser.setProviderUserId("test-user");
                        newUser.setIsEnabled(true);
                        newUser.setCreatedAt(Instant.now());
                        return userRepository.save(newUser);
                    });
            screener.setOwner(defaultUser);
        }
        
        return screenerRepository.save(screener);
    }

    public Optional<Screener> updateScreener(Screener screener) {
        log.info("updateScreener id={}", screener.getScreenerId());
        if (!screenerRepository.existsById(screener.getScreenerId())) {
            return Optional.empty();
        }
        return Optional.of(screenerRepository.save(screener));
    }

    public boolean deleteScreener(UUID id) {
        log.info("deleteScreener id={}", id);
        if (!screenerRepository.existsById(id)) {
            return false;
        }
        screenerRepository.deleteById(id);
        return true;
    }
}


