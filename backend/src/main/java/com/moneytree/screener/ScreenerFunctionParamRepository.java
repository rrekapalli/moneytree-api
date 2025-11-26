package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerFunctionParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerFunctionParamRepository extends JpaRepository<ScreenerFunctionParam, UUID> {

    @Query("SELECT sfp FROM ScreenerFunctionParam sfp WHERE sfp.function.id = ?1")
    List<ScreenerFunctionParam> findByFunctionId(UUID functionId);

    @Query("SELECT sfp FROM ScreenerFunctionParam sfp WHERE sfp.function.id = ?1 ORDER BY sfp.paramOrder")
    List<ScreenerFunctionParam> findByFunctionIdOrderByParamOrder(UUID functionId);
}

