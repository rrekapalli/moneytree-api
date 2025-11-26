package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerSavedView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerSavedViewRepository extends JpaRepository<ScreenerSavedView, UUID> {

    @Query("SELECT ssv FROM ScreenerSavedView ssv WHERE ssv.screener.id = ?1")
    List<ScreenerSavedView> findByScreenerId(UUID screenerId);

    @Query("SELECT ssv FROM ScreenerSavedView ssv WHERE ssv.user.id = ?1")
    List<ScreenerSavedView> findByUserId(UUID userId);

    @Query("SELECT ssv FROM ScreenerSavedView ssv WHERE ssv.screener.id = ?1 AND ssv.user.id = ?2 AND ssv.name = ?3")
    Optional<ScreenerSavedView> findByScreenerIdAndUserIdAndName(UUID screenerId, UUID userId, String name);
}

