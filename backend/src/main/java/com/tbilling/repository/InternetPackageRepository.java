package com.tbilling.repository;

import com.tbilling.domain.Enums.PackageStatus;
import com.tbilling.domain.InternetPackage;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternetPackageRepository extends JpaRepository<InternetPackage, UUID> {
  List<InternetPackage> findByTenantIdOrderBySortOrderAscCreatedAtAsc(UUID tenantId);

  List<InternetPackage> findByTenantIdAndStatusOrderBySortOrderAscCreatedAtAsc(
      UUID tenantId, PackageStatus status);
}
