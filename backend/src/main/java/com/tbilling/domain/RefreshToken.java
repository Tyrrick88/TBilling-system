package com.tbilling.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
public class RefreshToken extends BaseEntity {
  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  public UserAccount user;

  @Column(nullable = false, unique = true)
  public String token;

  @Column(nullable = false)
  public Instant expiresAt;

  @Column(nullable = false)
  public boolean revoked = false;
}
