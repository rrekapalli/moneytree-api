package com.moneytree.screener;

import com.moneytree.screener.entity.ScreenerFunction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ScreenerFunctionRepository extends JpaRepository<ScreenerFunction, UUID> {

    Optional<ScreenerFunction> findByFunctionName(String functionName);

    List<ScreenerFunction> findByIsActiveTrue();

    List<ScreenerFunction> findByCategory(String category);
}

