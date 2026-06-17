package com.tbilling.repository;

import com.tbilling.domain.AuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
  List<AuditLog> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<AuditLog> findTop200ByOrderByCreatedAtDesc();
}
