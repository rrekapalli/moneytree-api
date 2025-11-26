package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerStar;
import com.moneytree.screener.entity.ScreenerStarId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScreenerStarRepository extends JpaRepository<ScreenerStar, ScreenerStarId> {

    List<ScreenerStar> findByScreenerId(Long screenerId);

    List<ScreenerStar> findByUserId(Long userId);
}

