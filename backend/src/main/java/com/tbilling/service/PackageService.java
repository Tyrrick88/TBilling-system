package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.PackageRequest;
import com.tbilling.api.Contracts.PackageResponse;
import com.tbilling.api.Contracts.ReorderPackagesRequest;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Enums.PackageStatus;
import com.tbilling.domain.InternetPackage;
import com.tbilling.domain.Tenant;
import com.tbilling.repository.InternetPackageRepository;
import com.tbilling.tenant.TenantGuard;
import java.util.List;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PackageService {
  private final InternetPackageRepository packages;
  private final TenantGuard tenantGuard;

  public PackageService(InternetPackageRepository packages, TenantGuard tenantGuard) {
    this.packages = packages;
    this.tenantGuard = tenantGuard;
  }

  @Transactional(readOnly = true)
  public List<PackageResponse> listCurrentTenantPackages() {
    UUID tenantId = tenantGuard.requireTenantId();
    return packages.findByTenantIdOrderBySortOrderAscCreatedAtAsc(tenantId).stream()
        .map(ResponseMapper::internetPackage)
        .toList();
  }

  @Transactional(readOnly = true)
  @Cacheable(cacheNames = "portalPackages", key = "#tenant.slug")
  public List<PackageResponse> listPortalPackages(Tenant tenant) {
    return packages.findByTenantIdAndStatusOrderBySortOrderAscCreatedAtAsc(tenant.id, PackageStatus.ACTIVE).stream()
        .map(ResponseMapper::internetPackage)
        .toList();
  }

  @Transactional
  @CacheEvict(cacheNames = "portalPackages", allEntries = true)
  public PackageResponse createPackage(PackageRequest request) {
    InternetPackage internetPackage = new InternetPackage();
    internetPackage.tenant = tenantGuard.requireTenant();
    apply(internetPackage, request);
    return ResponseMapper.internetPackage(packages.save(internetPackage));
  }

  @Transactional
  @CacheEvict(cacheNames = "portalPackages", allEntries = true)
  public PackageResponse updatePackage(UUID packageId, PackageRequest request) {
    InternetPackage internetPackage =
        packages.findById(packageId).orElseThrow(() -> ApiException.notFound("Package not found"));
    tenantGuard.checkTenant(internetPackage.tenant.id);
    apply(internetPackage, request);
    return ResponseMapper.internetPackage(internetPackage);
  }

  @Transactional
  @CacheEvict(cacheNames = "portalPackages", allEntries = true)
  public void deletePackage(UUID packageId) {
    InternetPackage internetPackage =
        packages.findById(packageId).orElseThrow(() -> ApiException.notFound("Package not found"));
    tenantGuard.checkTenant(internetPackage.tenant.id);
    internetPackage.status = PackageStatus.INACTIVE;
  }

  @Transactional
  @CacheEvict(cacheNames = "portalPackages", allEntries = true)
  public List<PackageResponse> reorderPackages(ReorderPackagesRequest request) {
    UUID tenantId = tenantGuard.requireTenantId();
    int sort = 0;
    for (UUID packageId : request.packageIds()) {
      InternetPackage internetPackage =
          packages.findById(packageId).orElseThrow(() -> ApiException.notFound("Package not found"));
      tenantGuard.checkTenant(internetPackage.tenant.id);
      internetPackage.sortOrder = sort++;
    }
    return packages.findByTenantIdOrderBySortOrderAscCreatedAtAsc(tenantId).stream()
        .map(ResponseMapper::internetPackage)
        .toList();
  }

  private void apply(InternetPackage internetPackage, PackageRequest request) {
    internetPackage.name = request.name();
    internetPackage.speedMbps = request.speedMbps();
    internetPackage.durationMinutes = request.durationMinutes();
    internetPackage.priceKes = request.priceKes();
    internetPackage.status = request.status() == null ? PackageStatus.ACTIVE : request.status();
    internetPackage.sortOrder = request.sortOrder();
    internetPackage.whatsappCallsAllowed = request.whatsappCallsAllowed();
    internetPackage.streamingAllowed = request.streamingAllowed();
  }
}
