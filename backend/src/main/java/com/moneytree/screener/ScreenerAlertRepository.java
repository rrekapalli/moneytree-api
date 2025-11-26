package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerAlertRepository extends JpaRepository<ScreenerAlert, Long> {

    List<ScreenerAlert> findByScreenerId(Long screenerId);

    List<ScreenerAlert> findByIsEnabledTrue();
}

