package com.tbilling.repository;

import com.tbilling.domain.Enums.SessionStatus;
import com.tbilling.domain.HotspotSession;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HotspotSessionRepository extends JpaRepository<HotspotSession, UUID> {
  List<HotspotSession> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<HotspotSession> findByTenantIdAndStatusOrderByCreatedAtDesc(UUID tenantId, SessionStatus status);

  long countByTenantIdAndStatus(UUID tenantId, SessionStatus status);

  long countByTenantIdAndCreatedAtBetween(UUID tenantId, Instant start, Instant end);

  long countByStatus(SessionStatus status);
}
