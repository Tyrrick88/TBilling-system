package com.tbilling.service;

import com.tbilling.api.Contracts.ZeroRatingSyncResponse;
import com.tbilling.domain.NetworkEvent;
import com.tbilling.domain.Tenant;
import com.tbilling.domain.ZeroRatingEvent;
import com.tbilling.domain.Enums.NetworkEventType;
import com.tbilling.repository.NetworkEventRepository;
import com.tbilling.repository.TenantRepository;
import com.tbilling.repository.ZeroRatingEventRepository;
import com.tbilling.tenant.TenantGuard;
import java.time.Instant;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ZeroRatingService {
  private static final List<String> WHATSAPP_CIDRS =
      List.of("31.13.86.0/24", "157.240.0.0/16", "179.60.192.0/22", "185.60.216.0/22");

  private final TenantRepository tenants;
  private final ZeroRatingEventRepository zeroRatingEvents;
  private final NetworkEventRepository networkEvents;
  private final RouterOsClient routerOsClient;
  private final TenantGuard tenantGuard;

  public ZeroRatingService(
      TenantRepository tenants,
      ZeroRatingEventRepository zeroRatingEvents,
      NetworkEventRepository networkEvents,
      RouterOsClient routerOsClient,
      TenantGuard tenantGuard) {
    this.tenants = tenants;
    this.zeroRatingEvents = zeroRatingEvents;
    this.networkEvents = networkEvents;
    this.routerOsClient = routerOsClient;
    this.tenantGuard = tenantGuard;
  }

  @Transactional
  public ZeroRatingSyncResponse syncCurrentTenant() {
    return syncTenant(tenantGuard.requireTenant());
  }

  @Scheduled(cron = "0 0 3 ? * MON")
  @Transactional
  public void weeklySync() {
    tenants.findAll().stream().filter(tenant -> tenant.zeroRatingEnabled).forEach(this::syncTenant);
  }

  private ZeroRatingSyncResponse syncTenant(Tenant tenant) {
    routerOsClient.syncZeroRatedRanges(tenant, WHATSAPP_CIDRS);

    ZeroRatingEvent event = new ZeroRatingEvent();
    event.tenant = tenant;
    event.action = "SYNC";
    event.ipRangeCount = WHATSAPP_CIDRS.size();
    event.message = "Synced WhatsApp text zero-rating ranges";
    zeroRatingEvents.save(event);

    NetworkEvent networkEvent = new NetworkEvent();
    networkEvent.tenant = tenant;
    networkEvent.type = NetworkEventType.ZERO_RATING_SYNC;
    networkEvent.provider = "MikroTik";
    networkEvent.message = event.message;
    networkEvents.save(networkEvent);

    return new ZeroRatingSyncResponse(tenant.id, WHATSAPP_CIDRS.size(), event.message, Instant.now());
  }
}
