package com.moneytree.screener;

import com.moneytree.screener.entity.Screener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScreenerRepository extends JpaRepository<Screener, UUID> {

    List<Screener> findByIsPublicTrue();

    @Query("SELECT s FROM Screener s WHERE s.owner.id = ?1")
    List<Screener> findByOwnerId(UUID ownerId);

    @Query("SELECT s FROM Screener s WHERE s.isPublic = true OR s.owner.id = ?1 ORDER BY s.createdAt DESC")
    List<Screener> findPublicOrOwnedByUser(UUID userId);
}

