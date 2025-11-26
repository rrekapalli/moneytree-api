package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSavedView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenerSavedViewRepository extends JpaRepository<ScreenerSavedView, Long> {

    List<ScreenerSavedView> findByScreenerId(Long screenerId);

    List<ScreenerSavedView> findByUserId(Long userId);

    Optional<ScreenerSavedView> findByScreenerIdAndUserIdAndName(Long screenerId, Long userId, String name);
}

