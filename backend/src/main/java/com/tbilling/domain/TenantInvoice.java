package com.tbilling.domain;

import com.tbilling.domain.Enums.InvoiceStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tenant_invoices")
public class TenantInvoice extends BaseEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "tenant_id", nullable = false)
  public Tenant tenant;

  @Column(nullable = false, unique = true)
  public String invoiceNumber;

  @Column(nullable = false)
  public BigDecimal amountKes;

  @Column(nullable = false)
  public LocalDate dueDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  public InvoiceStatus status = InvoiceStatus.DRAFT;
}
