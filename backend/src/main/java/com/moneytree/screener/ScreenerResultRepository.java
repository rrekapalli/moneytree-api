package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerResult;
import com.moneytree.screener.entity.ScreenerResultId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerResultRepository extends JpaRepository<ScreenerResult, ScreenerResultId> {

    List<ScreenerResult> findByScreenerRunId(Long screenerRunId);

    List<ScreenerResult> findByScreenerRunIdAndMatchedTrue(Long screenerRunId);

    List<ScreenerResult> findBySymbol(String symbol);

    @Query("SELECT sr FROM ScreenerResult sr WHERE sr.screenerRunId = ?1 ORDER BY sr.rankInRun ASC")
    List<ScreenerResult> findByScreenerRunIdOrderByRankAsc(Long screenerRunId);

    @Query("SELECT sr FROM ScreenerResult sr WHERE sr.screenerRunId = ?1 ORDER BY sr.score0_1 DESC")
    List<ScreenerResult> findByScreenerRunIdOrderByScoreDesc(Long screenerRunId);
}

