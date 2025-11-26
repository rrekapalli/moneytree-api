package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerVersion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerVersionService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerVersionService.class);
    private final ScreenerVersionRepository repository;

    public ScreenerVersionService(ScreenerVersionRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerVersion> findByScreenerId(Long screenerId) {
        return repository.findByScreenerIdOrderByVersionNumberDesc(screenerId);
    }

    public Optional<ScreenerVersion> findByScreenerIdAndVersionNumber(Long screenerId, Integer versionNumber) {
        return repository.findByScreenerIdAndVersionNumber(screenerId, versionNumber);
    }

    public Optional<ScreenerVersion> findById(Long id) {
        return repository.findById(id);
    }

    public ScreenerVersion save(ScreenerVersion version) {
        return repository.save(version);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

