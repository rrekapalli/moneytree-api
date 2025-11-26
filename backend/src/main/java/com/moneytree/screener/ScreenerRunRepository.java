package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScreenerRunRepository extends JpaRepository<ScreenerRun, Long> {

    List<ScreenerRun> findByScreenerId(Long screenerId);

    List<ScreenerRun> findByStatus(String status);

    List<ScreenerRun> findByRunForTradingDay(LocalDate tradingDay);

    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screener.id = ?1 ORDER BY sr.startedAt DESC")
    List<ScreenerRun> findByScreenerIdOrderByStartedAtDesc(Long screenerId);
}

