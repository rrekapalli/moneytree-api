package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSavedView;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerSavedViewService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerSavedViewService.class);
    private final ScreenerSavedViewRepository repository;

    public ScreenerSavedViewService(ScreenerSavedViewRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerSavedView> findByScreenerId(Long screenerId) {
        return repository.findByScreenerId(screenerId);
    }

    public List<ScreenerSavedView> findByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Optional<ScreenerSavedView> findByScreenerIdAndUserIdAndName(Long screenerId, Long userId, String name) {
        return repository.findByScreenerIdAndUserIdAndName(screenerId, userId, name);
    }

    public Optional<ScreenerSavedView> findById(Long id) {
        return repository.findById(id);
    }

    public ScreenerSavedView save(ScreenerSavedView savedView) {
        return repository.save(savedView);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

