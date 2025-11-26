package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerFunctionParam;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerFunctionParamService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerFunctionParamService.class);
    private final ScreenerFunctionParamRepository repository;

    public ScreenerFunctionParamService(ScreenerFunctionParamRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerFunctionParam> findByFunctionId(Long functionId) {
        return repository.findByFunctionIdOrderByParamOrder(functionId);
    }

    public Optional<ScreenerFunctionParam> findById(Long id) {
        return repository.findById(id);
    }

    public ScreenerFunctionParam save(ScreenerFunctionParam param) {
        return repository.save(param);
    }

    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}

