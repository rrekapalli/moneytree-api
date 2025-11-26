package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerParamset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScreenerParamsetRepository extends JpaRepository<ScreenerParamset, Long> {

    List<ScreenerParamset> findByScreenerVersionId(Long screenerVersionId);

    Optional<ScreenerParamset> findByScreenerVersionIdAndName(Long screenerVersionId, String name);
}

