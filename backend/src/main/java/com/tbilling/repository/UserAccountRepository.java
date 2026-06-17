package com.tbilling.repository;

import com.tbilling.domain.Enums.UserRole;
import com.tbilling.domain.UserAccount;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
  Optional<UserAccount> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  List<UserAccount> findByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  long countByRole(UserRole role);
}
