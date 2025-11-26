package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerStar;
import com.moneytree.screener.entity.ScreenerStarId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerStarRepository extends JpaRepository<ScreenerStar, ScreenerStarId> {

    List<ScreenerStar> findByScreenerId(UUID screenerId);

    List<ScreenerStar> findByUserId(UUID userId);
}

