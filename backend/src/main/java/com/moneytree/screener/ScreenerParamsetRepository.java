package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerParamset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerParamsetRepository extends JpaRepository<ScreenerParamset, UUID> {

    @Query("SELECT sp FROM ScreenerParamset sp WHERE sp.screenerVersion.id = ?1")
    List<ScreenerParamset> findByScreenerVersionId(UUID screenerVersionId);

    @Query("SELECT sp FROM ScreenerParamset sp WHERE sp.screenerVersion.id = ?1 AND sp.name = ?2")
    Optional<ScreenerParamset> findByScreenerVersionIdAndName(UUID screenerVersionId, String name);
}

