package com.tbilling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "tenant_id")
  public Tenant tenant;

  @ManyToOne
  @JoinColumn(name = "actor_id")
  public UserAccount actor;

  @Column(nullable = false)
  public String action;

  @Column(nullable = false)
  public String targetType;

  public String targetId;
  public String metadata;
}
