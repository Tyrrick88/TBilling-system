package com.tbilling.domain;

import com.tbilling.domain.Enums.FailoverStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "failover_events")
public class FailoverEvent extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "tenant_id")
  public Tenant tenant;

  @Column(nullable = false)
  public String fromProvider;

  @Column(nullable = false)
  public String toProvider;

  @Column(nullable = false)
  public String reason;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public FailoverStatus status = FailoverStatus.OPEN;

  public Instant resolvedAt;
}
