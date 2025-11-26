package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenerVersionRepository extends JpaRepository<ScreenerVersion, Long> {

    List<ScreenerVersion> findByScreenerId(Long screenerId);

    Optional<ScreenerVersion> findByScreenerIdAndVersionNumber(Long screenerId, Integer versionNumber);

    List<ScreenerVersion> findByStatus(String status);

    @Query("SELECT sv FROM ScreenerVersion sv WHERE sv.screener.id = ?1 ORDER BY sv.versionNumber DESC")
    List<ScreenerVersion> findByScreenerIdOrderByVersionNumberDesc(Long screenerId);
}

