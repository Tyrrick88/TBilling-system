package com.tbilling.domain;

import com.tbilling.domain.Enums.TransactionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction extends BaseEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  public Tenant tenant;

  @ManyToOne(optional = false)
  @JoinColumn(name = "package_id", nullable = false)
  public InternetPackage internetPackage;

  @ManyToOne
  @JoinColumn(name = "session_id")
  public HotspotSession session;

  @Column(nullable = false)
  public String phone;

  @Column(nullable = false)
  public BigDecimal amountKes;

  @Column(nullable = false, unique = true)
  public String checkoutRequestId;

  public String merchantRequestId;
  public String mpesaReceiptNumber;
  public String resultCode;
  public String resultDescription;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public TransactionStatus status = TransactionStatus.PENDING;

  public Instant paidAt;
}
