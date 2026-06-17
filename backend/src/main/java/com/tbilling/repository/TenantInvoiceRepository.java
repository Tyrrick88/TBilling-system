package com.tbilling.repository;

import com.tbilling.domain.TenantInvoice;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantInvoiceRepository extends JpaRepository<TenantInvoice, UUID> {
  List<TenantInvoice> findTop100ByTenantIdOrderByCreatedAtDesc(UUID tenantId);

  List<TenantInvoice> findTop100ByOrderByCreatedAtDesc();
}
