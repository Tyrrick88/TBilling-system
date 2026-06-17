package com.tbilling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "isp_configs")
public class IspConfig extends BaseEntity {
  @Column(nullable = false)
  public String primaryProvider = "Starlink";

  @Column(nullable = false)
  public String backupProvider = "Airtel/JTL";

  @Column(nullable = false)
  public int latencyThresholdMs = 300;

  @Column(nullable = false)
  public int failureThreshold = 2;

  public String notificationWebhook;
}
