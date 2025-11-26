package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerParamset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ScreenerParamsetService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerParamsetService.class);
    private final ScreenerParamsetRepository repository;

    public ScreenerParamsetService(ScreenerParamsetRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerParamset> findByScreenerVersionId(UUID screenerVersionId) {
        return repository.findByScreenerVersionId(screenerVersionId);
    }

    public Optional<ScreenerParamset> findByScreenerVersionIdAndName(UUID screenerVersionId, String name) {
        return repository.findByScreenerVersionIdAndName(screenerVersionId, name);
    }

    public Optional<ScreenerParamset> findById(UUID id) {
        return repository.findById(id);
    }

    public ScreenerParamset save(ScreenerParamset paramset) {
        return repository.save(paramset);
    }

    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}

