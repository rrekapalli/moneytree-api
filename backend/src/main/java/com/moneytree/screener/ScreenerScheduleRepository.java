package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerScheduleRepository extends JpaRepository<ScreenerSchedule, UUID> {

    @Query("SELECT ss FROM ScreenerSchedule ss WHERE ss.screener.id = ?1")
    List<ScreenerSchedule> findByScreenerId(UUID screenerId);

    List<ScreenerSchedule> findByIsEnabledTrue();
}

