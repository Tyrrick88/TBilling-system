package com.tbilling.domain;

import com.tbilling.domain.Enums.NetworkEventType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "network_events")
public class NetworkEvent extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "tenant_id")
  public Tenant tenant;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public NetworkEventType type;

  @Column(nullable = false)
  public String provider = "Starlink";

  public Integer latencyMs;
  public Integer packetLossPercent;
  public String message;
}
