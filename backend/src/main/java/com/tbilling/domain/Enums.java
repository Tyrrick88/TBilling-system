package com.tbilling.domain;

public final class Enums {
  private Enums() {}

  public enum TenantStatus {
    ACTIVE,
    SUSPENDED,
    DELETED
  }

  public enum UserRole {
    ROLE_SUPER_ADMIN,
    ROLE_CLIENT_ADMIN,
    ROLE_USER
  }

  public enum PackageStatus {
    ACTIVE,
    INACTIVE
  }

  public enum SessionStatus {
    PENDING,
    ACTIVE,
    EXPIRED,
    REVOKED
  }

  public enum TransactionStatus {
    PENDING,
    PAID,
    FAILED,
    REFUNDED,
    TIMEOUT
  }

  public enum NetworkEventType {
    HEALTH_CHECK,
    FAILOVER_TRIGGERED,
    FAILOVER_RECOVERED,
    ZERO_RATING_SYNC,
    ROUTER_API_ERROR
  }

  public enum FailoverStatus {
    OPEN,
    RESOLVED
  }

  public enum InvoiceStatus {
    DRAFT,
    SENT,
    PAID,
    OVERDUE,
    VOID
  }
}
