package com.tbilling.domain;

import com.tbilling.domain.Enums.SessionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "hotspot_sessions")
public class HotspotSession extends BaseEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  public Tenant tenant;

  @ManyToOne
  @JoinColumn(name = "package_id")
  public InternetPackage internetPackage;

  @Column(nullable = false)
  public String phone;

  public String macAddress;
  public String radiusUsername;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public SessionStatus status = SessionStatus.PENDING;

  public Instant startsAt;
  public Instant expiresAt;

  @Column(nullable = false)
  public long dataUsedBytes = 0;
}
