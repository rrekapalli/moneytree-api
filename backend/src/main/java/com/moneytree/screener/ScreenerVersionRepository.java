package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerVersionRepository extends JpaRepository<ScreenerVersion, UUID> {

    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screener.id = ?1")
    List<ScreenerVersion> findByScreenerId(UUID screenerId);

    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screener.id = ?1 AND sv.versionNumber = ?2")
    Optional<ScreenerVersion> findByScreenerIdAndVersionNumber(UUID screenerId, Integer versionNumber);

    List<ScreenerVersion> findByStatus(String status);

    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screener.id = ?1 ORDER BY sv.versionNumber DESC")
    List<ScreenerVersion> findByScreenerIdOrderByVersionNumberDesc(UUID screenerId);
}

