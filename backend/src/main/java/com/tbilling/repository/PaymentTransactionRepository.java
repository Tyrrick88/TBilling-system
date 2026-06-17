package com.tbilling.repository;

import com.tbilling.domain.Enums.TransactionStatus;
import com.tbilling.domain.PaymentTransaction;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
  Optional<PaymentTransaction> findByCheckoutRequestId(String checkoutRequestId);

  List<PaymentTransaction> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  long countByTenantIdAndStatus(UUID tenantId, TransactionStatus status);

  @Query(
      "select coalesce(sum(t.amountKes), 0) from PaymentTransaction t "
          + "where t.tenant.id = :tenantId and t.status = :status and t.createdAt between :start and :end")
  BigDecimal sumTenantRevenue(
      @Param("tenantId") UUID tenantId,
      @Param("status") TransactionStatus status,
      @Param("start") Instant start,
      @Param("end") Instant end);

  @Query("select coalesce(sum(t.amountKes), 0) from PaymentTransaction t where t.status = :status")
  BigDecimal sumPlatformRevenue(@Param("status") TransactionStatus status);
}
