package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerFunctionParam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerFunctionParamRepository extends JpaRepository<ScreenerFunctionParam, Long> {

    List<ScreenerFunctionParam> findByFunctionId(Long functionId);

    @Query("SELECT sfp FROM ScreenerFunctionParam sfp WHERE sfp.function.id = ?1 ORDER BY sfp.paramOrder")
    List<ScreenerFunctionParam> findByFunctionIdOrderByParamOrder(Long functionId);
}

