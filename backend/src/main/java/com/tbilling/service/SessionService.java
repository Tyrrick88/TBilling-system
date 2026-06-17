package com.tbilling.service;

import com.tbilling.api.Contracts.SessionResponse;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Enums.SessionStatus;
import com.tbilling.repository.HotspotSessionRepository;
import com.tbilling.tenant.TenantGuard;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SessionService {
  private final HotspotSessionRepository sessions;
  private final TenantGuard tenantGuard;

  public SessionService(HotspotSessionRepository sessions, TenantGuard tenantGuard) {
    this.sessions = sessions;
    this.tenantGuard = tenantGuard;
  }

  @Transactional(readOnly = true)
  public List<SessionResponse> listSessions(String status) {
    UUID tenantId = tenantGuard.requireTenantId();
    if (status == null || status.isBlank()) {
      return sessions.findTop100ByTenantIdOrderByCreatedAtDesc(tenantId).stream()
          .map(ResponseMapper::session)
          .toList();
    }
    return sessions.findByTenantIdAndStatusOrderByCreatedAtDesc(tenantId, SessionStatus.valueOf(status)).stream()
        .map(ResponseMapper::session)
        .toList();
  }
}
