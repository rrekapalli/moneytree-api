package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerStar;
import com.moneytree.screener.entity.ScreenerStarId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerStarService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerStarService.class);
    private final ScreenerStarRepository repository;

    public ScreenerStarService(ScreenerStarRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerStar> findByScreenerId(Long screenerId) {
        return repository.findByScreenerId(screenerId);
    }

    public List<ScreenerStar> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Optional<ScreenerStar> findById(Long screenerId, Long userId) {
        return repository.findById(new ScreenerStarId(screenerId, userId));
    }

    public ScreenerStar save(ScreenerStar star) {
        return repository.save(star);
    }

    public void deleteById(Long screenerId, Long userId) {
        repository.deleteById(new ScreenerStarId(screenerId, userId));
    }
}

