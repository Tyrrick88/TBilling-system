package com.tbilling.repository;

import com.tbilling.domain.ZeroRatingEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZeroRatingEventRepository extends JpaRepository<ZeroRatingEvent, UUID> {
  List<ZeroRatingEvent> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);
}
