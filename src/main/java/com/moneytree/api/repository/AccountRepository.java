package com.moneytree.api.repository;

import com.moneytree.api.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByAccountType(String accountType);
    List<Account> findByNameContainingIgnoreCase(String name);
}
