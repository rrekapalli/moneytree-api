package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerScheduleRepository extends JpaRepository<ScreenerSchedule, Long> {

    List<ScreenerSchedule> findByScreenerId(Long screenerId);

    List<ScreenerSchedule> findByIsEnabledTrue();
}

