package com.tbilling.domain;

import com.tbilling.domain.Enums.TenantStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {
  @Column(nullable = false)
  public String name;

  @Column(nullable = false)
  public String businessName;

  @Column(nullable = false, unique = true)
  public String slug;

  @Column(nullable = false)
  public String locationName;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public TenantStatus status = TenantStatus.ACTIVE;

  public String logoUrl;
  public String mpesaPaybill;
  public String supportPhone;
  public String supportWhatsapp;

  @Column(nullable = false)
  public boolean zeroRatingEnabled = true;

  @Column(nullable = false)
  public String billingModel = "MONTHLY";

  @Column(nullable = false)
  public BigDecimal monthlyFee = BigDecimal.ZERO;

  @Column(nullable = false)
  public BigDecimal revenueSharePercent = BigDecimal.ZERO;
}
