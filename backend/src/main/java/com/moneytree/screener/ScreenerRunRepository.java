package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerRunRepository extends JpaRepository<ScreenerRun, UUID> {

    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screener.id = ?1")
    List<ScreenerRun> findByScreenerId(UUID screenerId);

    List<ScreenerRun> findByStatus(String status);

    List<ScreenerRun> findByRunForTradingDay(LocalDate tradingDay);

    @Query("SELECT sr FROM ScreenerRun sr WHERE sr.screener.id = ?1 ORDER BY sr.startedAt DESC")
    List<ScreenerRun> findByScreenerIdOrderByStartedAtDesc(UUID screenerId);
}

