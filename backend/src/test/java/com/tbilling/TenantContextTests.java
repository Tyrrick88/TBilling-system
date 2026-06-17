package com.tbilling;

import com.tbilling.tenant.TenantContext;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TenantContextTests {
  @AfterEach
  void clear() {
    TenantContext.clear();
  }

  @Test
  void storesTenantAndSuperAdminFlagPerThread() {
    UUID tenantId = UUID.randomUUID();
    TenantContext.setTenantId(tenantId);
    TenantContext.setSuperAdmin(true);

    assertThat(TenantContext.tenantId()).contains(tenantId);
    assertThat(TenantContext.isSuperAdmin()).isTrue();
  }

  @Test
  void clearRemovesState() {
    TenantContext.setTenantId(UUID.randomUUID());
    TenantContext.setSuperAdmin(true);

    TenantContext.clear();

    assertThat(TenantContext.tenantId()).isEmpty();
    assertThat(TenantContext.isSuperAdmin()).isFalse();
  }
}
