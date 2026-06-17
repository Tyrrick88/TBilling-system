package com.tbilling.security;

import com.tbilling.domain.UserAccount;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class AuthenticatedUser implements UserDetails {
  private final UUID id;
  private final UUID tenantId;
  private final String name;
  private final String email;
  private final String passwordHash;
  private final String role;
  private final boolean enabled;

  public AuthenticatedUser(UserAccount account) {
    this.id = account.id;
    this.tenantId = account.tenant == null ? null : account.tenant.id;
    this.name = account.name;
    this.email = account.email;
    this.passwordHash = account.passwordHash;
    this.role = account.role.name();
    this.enabled = account.enabled;
  }

  public UUID id() {
    return id;
  }

  public UUID tenantId() {
    return tenantId;
  }

  public String name() {
    return name;
  }

  public String role() {
    return role;
  }

  public boolean isSuperAdmin() {
    return "ROLE_SUPER_ADMIN".equals(role);
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority(role));
  }

  @Override
  public String getPassword() {
    return passwordHash;
  }

  @Override
  public String getUsername() {
    return email;
  }

  @Override
  public boolean isEnabled() {
    return enabled;
  }
}
