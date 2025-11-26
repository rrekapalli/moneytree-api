package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerAlertRepository extends JpaRepository<ScreenerAlert, UUID> {

    List<ScreenerAlert> findByScreenerId(UUID screenerId);

    List<ScreenerAlert> findByIsEnabledTrue();
}

