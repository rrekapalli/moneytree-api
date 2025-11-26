package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerParamset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerParamsetRepository extends JpaRepository<ScreenerParamset, UUID> {

    List<ScreenerParamset> findByScreenerVersionId(UUID screenerVersionId);

    Optional<ScreenerParamset> findByScreenerVersionIdAndName(UUID screenerVersionId, String name);
}

