package com.tbilling.service;

import com.tbilling.api.Contracts.FailoverEventResponse;
import com.tbilling.api.Contracts.IspConfigRequest;
import com.tbilling.api.Contracts.IspConfigResponse;
import com.tbilling.api.Contracts.NetworkEventResponse;
import com.tbilling.api.Contracts.NetworkStatusResponse;
import com.tbilling.api.ResponseMapper;
import com.tbilling.config.TbillingProperties;
import com.tbilling.domain.Enums.NetworkEventType;
import com.tbilling.domain.IspConfig;
import com.tbilling.domain.NetworkEvent;
import com.tbilling.repository.FailoverEventRepository;
import com.tbilling.repository.IspConfigRepository;
import com.tbilling.repository.NetworkEventRepository;
import com.tbilling.tenant.TenantGuard;
import java.time.Instant;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NetworkService {
  private final NetworkEventRepository networkEvents;
  private final FailoverEventRepository failoverEvents;
  private final IspConfigRepository ispConfigs;
  private final TbillingProperties properties;
  private final TenantGuard tenantGuard;
  private final SimpMessagingTemplate messagingTemplate;

  private volatile NetworkStatusResponse latestStatus =
      new NetworkStatusResponse("Starlink", "Airtel/JTL", "Starlink", 82, 0, false, Instant.now());

  public NetworkService(
      NetworkEventRepository networkEvents,
      FailoverEventRepository failoverEvents,
      IspConfigRepository ispConfigs,
      TbillingProperties properties,
      TenantGuard tenantGuard,
      SimpMessagingTemplate messagingTemplate) {
    this.networkEvents = networkEvents;
    this.failoverEvents = failoverEvents;
    this.ispConfigs = ispConfigs;
    this.properties = properties;
    this.tenantGuard = tenantGuard;
    this.messagingTemplate = messagingTemplate;
  }

  public NetworkStatusResponse currentStatus() {
    return latestStatus;
  }

  @Transactional(readOnly = true)
  public List<NetworkEventResponse> tenantNetworkEvents() {
    return networkEvents.findTop100ByTenantIdOrderByCreatedAtDesc(tenantGuard.requireTenantId()).stream()
        .map(ResponseMapper::networkEvent)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<FailoverEventResponse> tenantFailoverEvents() {
    return failoverEvents.findTop100ByTenantIdOrderByCreatedAtDesc(tenantGuard.requireTenantId()).stream()
        .map(ResponseMapper::failoverEvent)
        .toList();
  }

  @Transactional(readOnly = true)
  public List<NetworkEventResponse> platformErrors() {
    return networkEvents.findTop100ByOrderByCreatedAtDesc().stream().map(ResponseMapper::networkEvent).toList();
  }

  @Transactional(readOnly = true)
  public IspConfigResponse ispConfig() {
    IspConfig config = ispConfigs.findAll().stream().findFirst().orElseGet(this::defaultConfig);
    return ResponseMapper.ispConfig(config);
  }

  @Transactional
  public IspConfigResponse updateIspConfig(IspConfigRequest request) {
    IspConfig config = ispConfigs.findAll().stream().findFirst().orElseGet(this::defaultConfig);
    config.primaryProvider = request.primaryProvider();
    config.backupProvider = request.backupProvider();
    config.latencyThresholdMs = request.latencyThresholdMs();
    config.failureThreshold = request.failureThreshold();
    config.notificationWebhook = request.notificationWebhook();
    return ResponseMapper.ispConfig(ispConfigs.save(config));
  }

  @Scheduled(fixedDelayString = "${NETWORK_MONITOR_DELAY_MS:30000}")
  @Transactional
  public void monitorNetwork() {
    if (!properties.jobs().networkMonitor().enabled()) {
      return;
    }
    NetworkEvent event = new NetworkEvent();
    event.type = NetworkEventType.HEALTH_CHECK;
    event.provider = latestStatus.primaryProvider();
    event.latencyMs = latestStatus.latencyMs();
    event.packetLossPercent = latestStatus.packetLossPercent();
    event.message = "Scheduled ISP health check";
    networkEvents.save(event);
    latestStatus =
        new NetworkStatusResponse(
            latestStatus.primaryProvider(),
            latestStatus.backupProvider(),
            latestStatus.activeProvider(),
            Math.max(40, (latestStatus.latencyMs() + 7) % properties.jobs().networkMonitor().latencyThresholdMs()),
            0,
            false,
            Instant.now());
    messagingTemplate.convertAndSend("/topic/network", latestStatus);
  }

  private IspConfig defaultConfig() {
    IspConfig config = new IspConfig();
    config.primaryProvider = "Starlink";
    config.backupProvider = "Airtel/JTL";
    config.latencyThresholdMs = properties.jobs().networkMonitor().latencyThresholdMs();
    config.failureThreshold = properties.jobs().networkMonitor().failureThreshold();
    return config;
  }
}
