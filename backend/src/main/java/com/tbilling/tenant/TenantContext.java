package com.tbilling.tenant;

import java.util.Optional;
import java.util.UUID;

public final class TenantContext {
  private static final ThreadLocal<UUID> CURRENT_TENANT = new ThreadLocal<>();
  private static final ThreadLocal<Boolean> SUPER_ADMIN = ThreadLocal.withInitial(() -> false);

  private TenantContext() {}

  public static void setTenantId(UUID tenantId) {
    CURRENT_TENANT.set(tenantId);
  }

  public static Optional<UUID> tenantId() {
    return Optional.ofNullable(CURRENT_TENANT.get());
  }

  public static void setSuperAdmin(boolean value) {
    SUPER_ADMIN.set(value);
  }

  public static boolean isSuperAdmin() {
    return SUPER_ADMIN.get();
  }

  public static void clear() {
    CURRENT_TENANT.remove();
    SUPER_ADMIN.remove();
  }
}
