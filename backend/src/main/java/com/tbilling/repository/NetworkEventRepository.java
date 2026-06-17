package com.tbilling.repository;

import com.tbilling.domain.NetworkEvent;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NetworkEventRepository extends JpaRepository<NetworkEvent, UUID> {
  List<NetworkEvent> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<NetworkEvent> findTop100ByOrderByCreatedAtDesc();
}
