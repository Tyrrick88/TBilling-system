package com.tbilling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "analytics_snapshots")
public class AnalyticsSnapshot extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "tenant_id")
  public Tenant tenant;

  @Column(nullable = false)
  public LocalDate snapshotDate;

  @Column(nullable = false)
  public int hourOfDay = 0;

  @Column(nullable = false)
  public long activeSessions = 0;

  @Column(nullable = false)
  public long totalSessions = 0;

  @Column(nullable = false)
  public long zeroRatedDevices = 0;

  @Column(nullable = false)
  public long zeroRatingConversions = 0;

  @Column(nullable = false)
  public BigDecimal revenueKes = BigDecimal.ZERO;
}
