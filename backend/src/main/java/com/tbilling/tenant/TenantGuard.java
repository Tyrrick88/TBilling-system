package com.tbilling.tenant;

import com.tbilling.api.ApiException;
import com.tbilling.domain.Tenant;
import com.tbilling.repository.TenantRepository;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class TenantGuard {
  private final TenantRepository tenants;

  public TenantGuard(TenantRepository tenants) {
    this.tenants = tenants;
  }

  public UUID requireTenantId() {
    return TenantContext.tenantId()
        .orElseThrow(() -> ApiException.forbidden("Tenant context is required for this request"));
  }

  public Tenant requireTenant() {
    UUID tenantId = requireTenantId();
    return tenants.findById(tenantId).orElseThrow(() -> ApiException.notFound("Tenant not found"));
  }

  public void checkTenant(UUID tenantId) {
    if (TenantContext.isSuperAdmin()) {
      return;
    }
    UUID current = requireTenantId();
    if (!current.equals(tenantId)) {
      throw ApiException.forbidden("You cannot access another tenant's data");
    }
  }
}
