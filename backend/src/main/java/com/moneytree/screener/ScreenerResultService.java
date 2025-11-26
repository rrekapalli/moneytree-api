package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ScreenerResultService {

    private static final Logger log = LoggerFactory.getLogger(ScreenerResultService.class);
    private final ScreenerResultRepository repository;

    public ScreenerResultService(ScreenerResultRepository repository) {
        this.repository = repository;
    }

    public List<ScreenerResult> findByScreenerRunId(Long screenerRunId) {
        return repository.findByScreenerRunIdOrderByRankAsc(screenerRunId);
    }

    public List<ScreenerResult> findByScreenerRunIdAndMatched(Long screenerRunId, boolean matched) {
        if (matched) {
            return repository.findByScreenerRunIdAndMatchedTrue(screenerRunId);
        }
        return repository.findByScreenerRunId(screenerRunId);
    }

    public List<ScreenerResult> findByScreenerRunIdOrderByScore(Long screenerRunId) {
        return repository.findByScreenerRunIdOrderByScoreDesc(screenerRunId);
    }

    public Optional<ScreenerResult> findById(Long screenerRunId, String symbol) {
        return repository.findById(new com.moneytree.screener.entity.ScreenerResultId(screenerRunId, symbol));
    }

    public ScreenerResult save(ScreenerResult result) {
        return repository.save(result);
    }

    public void deleteById(Long screenerRunId, String symbol) {
        repository.deleteById(new com.moneytree.screener.entity.ScreenerResultId(screenerRunId, symbol));
    }
}

