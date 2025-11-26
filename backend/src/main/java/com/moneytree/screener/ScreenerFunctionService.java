package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerFunction;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerFunctionService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerFunctionService.class);
    private final ScreenerFunctionRepository repository;

    public ScreenerFunctionService(ScreenerFunctionRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerFunction> findAllActive() {
        return repository.findByIsActiveTrue();
    }

    public List<ScreenerFunction> findByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Optional<ScreenerFunction> findByFunctionName(String functionName) {
        return repository.findByFunctionName(functionName);
    }

    public Optional<ScreenerFunction> findById(Long id) {
        return repository.findById(id);
    }

    public ScreenerFunction save(ScreenerFunction function) {
        return repository.save(function);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

