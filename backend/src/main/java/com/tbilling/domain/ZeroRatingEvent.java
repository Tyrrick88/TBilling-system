package com.tbilling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "zero_rating_events")
public class ZeroRatingEvent extends BaseEntity {
  @ManyToOne
  @JoinColumn(name = "tenant_id")
  public Tenant tenant;

  @Column(nullable = false)
  public String action;

  @Column(nullable = false)
  public int ipRangeCount = 0;

  public String message;
}
