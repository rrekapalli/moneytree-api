package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerStar;
import com.moneytree.screener.entity.ScreenerStarId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ScreenerStarService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerStarService.class);
    private final ScreenerStarRepository repository;

    public ScreenerStarService(ScreenerStarRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerStar> findByScreenerId(UUID screenerId) {
        return repository.findByScreenerId(screenerId);
    }

    public List<ScreenerStar> findByUserId(UUID userId) {
        return repository.findByUserId(userId);
    }

    public Optional<ScreenerStar> findById(UUID screenerId, UUID userId) {
        return repository.findById(new ScreenerStarId(screenerId, userId));
    }

    public ScreenerStar save(ScreenerStar star) {
        return repository.save(star);
    }

    public void deleteById(UUID screenerId, UUID userId) {
        repository.deleteById(new ScreenerStarId(screenerId, userId));
    }
}

