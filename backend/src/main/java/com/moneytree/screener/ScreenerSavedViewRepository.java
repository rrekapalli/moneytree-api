package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSavedView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerSavedViewRepository extends JpaRepository<ScreenerSavedView, UUID> {

    List<ScreenerSavedView> findByScreenerId(UUID screenerId);

    List<ScreenerSavedView> findByUserId(UUID userId);

    Optional<ScreenerSavedView> findByScreenerIdAndUserIdAndName(UUID screenerId, UUID userId, String name);
}

