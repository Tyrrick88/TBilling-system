package com.tbilling.service;

import com.tbilling.domain.Enums.SessionStatus;
import com.tbilling.domain.HotspotSession;
import com.tbilling.domain.PaymentTransaction;
import com.tbilling.repository.HotspotSessionRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProvisioningService {
  private static final Logger log = LoggerFactory.getLogger(ProvisioningService.class);

  private final HotspotSessionRepository sessions;
  private final RouterOsClient routerOsClient;

  public ProvisioningService(HotspotSessionRepository sessions, RouterOsClient routerOsClient) {
    this.sessions = sessions;
    this.routerOsClient = routerOsClient;
  }

  @Transactional
  public HotspotSession provisionPaidSession(PaymentTransaction transaction) {
    if (transaction.session != null) {
      return transaction.session;
    }

    HotspotSession session = new HotspotSession();
    session.tenant = transaction.tenant;
    session.internetPackage = transaction.internetPackage;
    session.phone = transaction.phone;
    session.status = SessionStatus.ACTIVE;
    session.startsAt = Instant.now();
    session.expiresAt = session.startsAt.plus(transaction.internetPackage.durationMinutes, ChronoUnit.MINUTES);
    session.radiusUsername = "tb-" + transaction.phone + "-" + transaction.id.toString().substring(0, 8);
    routerOsClient.createRadiusUser(session);
    log.info("Provisioned hotspot session {} for tenant {}", session.radiusUsername, session.tenant.slug);
    return sessions.save(session);
  }
}
