package com.tbilling.repository;

import com.tbilling.domain.FailoverEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FailoverEventRepository extends JpaRepository<FailoverEvent, UUID> {
  List<FailoverEvent> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<FailoverEvent> findTop100ByOrderByCreatedAtDesc();
}
