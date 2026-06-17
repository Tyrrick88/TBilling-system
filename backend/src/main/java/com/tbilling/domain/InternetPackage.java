package com.tbilling.domain;

import com.tbilling.domain.Enums.PackageStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "internet_packages")
public class InternetPackage extends BaseEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  public Tenant tenant;

  @Column(nullable = false)
  public String name;

  @Column(nullable = false)
  public int speedMbps;

  @Column(nullable = false)
  public int durationMinutes;

  @Column(nullable = false)
  public BigDecimal priceKes;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public PackageStatus status = PackageStatus.ACTIVE;

  @Column(nullable = false)
  public int sortOrder = 0;

  @Column(nullable = false)
  public boolean whatsappCallsAllowed = false;

  @Column(nullable = false)
  public boolean streamingAllowed = false;
}
