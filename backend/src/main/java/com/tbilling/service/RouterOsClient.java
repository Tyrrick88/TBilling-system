package com.tbilling.service;

import com.tbilling.config.TbillingProperties;
import com.tbilling.domain.HotspotSession;
import com.tbilling.domain.Tenant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class RouterOsClient {
  private static final Logger log = LoggerFactory.getLogger(RouterOsClient.class);

  private final TbillingProperties properties;

  public RouterOsClient(TbillingProperties properties) {
    this.properties = properties;
  }

  public void createRadiusUser(HotspotSession session) {
    if (!properties.mikrotik().enabled()) {
      log.info("MikroTik disabled; simulated RADIUS user {}", session.radiusUsername);
      return;
    }
    log.info(
        "Would create RADIUS user {} on {}:{}",
        session.radiusUsername,
        properties.mikrotik().host(),
        properties.mikrotik().port());
  }

  public void syncZeroRatedRanges(Tenant tenant, List<String> cidrs) {
    if (!properties.mikrotik().enabled()) {
      log.info("MikroTik disabled; simulated zero-rating sync for {} ranges", cidrs.size());
      return;
    }
    log.info("Would sync {} zero-rated ranges for tenant {}", cidrs.size(), tenant.slug);
  }

  public void switchDefaultRoute(String provider) {
    if (!properties.mikrotik().enabled()) {
      log.info("MikroTik disabled; simulated failover route switch to {}", provider);
      return;
    }
    log.info("Would switch MikroTik default route to {}", provider);
  }
}
