package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.TenantCreateRequest;
import com.tbilling.api.Contracts.TenantResponse;
import com.tbilling.api.Contracts.TenantSettingsRequest;
import com.tbilling.api.Contracts.TenantUpdateRequest;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Enums.TenantStatus;
import com.tbilling.domain.Enums.UserRole;
import com.tbilling.domain.Tenant;
import com.tbilling.domain.UserAccount;
import com.tbilling.repository.TenantRepository;
import com.tbilling.repository.UserAccountRepository;
import com.tbilling.tenant.TenantGuard;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TenantService {
  private final TenantRepository tenants;
  private final UserAccountRepository users;
  private final PasswordEncoder passwordEncoder;
  private final TenantGuard tenantGuard;

  public TenantService(
      TenantRepository tenants,
      UserAccountRepository users,
      PasswordEncoder passwordEncoder,
      TenantGuard tenantGuard) {
    this.tenants = tenants;
    this.users = users;
    this.passwordEncoder = passwordEncoder;
    this.tenantGuard = tenantGuard;
  }

  @Transactional(readOnly = true)
  public List<TenantResponse> listTenants() {
    return tenants.findByStatusNotOrderByCreatedAtDesc(TenantStatus.DELETED).stream()
        .map(ResponseMapper::tenant)
        .toList();
  }

  @Transactional(readOnly = true)
  @Cacheable(cacheNames = "tenantBySlug", key = "#slug")
  public Tenant tenantBySlug(String slug) {
    return tenants.findBySlug(slug).orElseThrow(() -> ApiException.notFound("Tenant not found"));
  }

  @Transactional(readOnly = true)
  public TenantResponse currentSettings() {
    return ResponseMapper.tenant(tenantGuard.requireTenant());
  }

  @Transactional
  @CacheEvict(cacheNames = {"tenantBySlug", "portalPackages"}, allEntries = true)
  public TenantResponse createTenant(TenantCreateRequest request) {
    String slug = normalizeSlug(request.slug());
    if (tenants.existsBySlug(slug)) {
      throw ApiException.badRequest("Tenant slug already exists");
    }
    if (users.existsByEmailIgnoreCase(request.adminEmail())) {
      throw ApiException.badRequest("Admin email already exists");
    }

    Tenant tenant = new Tenant();
    tenant.name = request.name();
    tenant.businessName = request.businessName();
    tenant.slug = slug;
    tenant.locationName = request.locationName();
    tenant.monthlyFee = defaultMoney(request.monthlyFee());
    tenant.revenueSharePercent = defaultMoney(request.revenueSharePercent());
    tenants.save(tenant);

    UserAccount admin = new UserAccount();
    admin.tenant = tenant;
    admin.name = request.adminName();
    admin.email = request.adminEmail().toLowerCase(Locale.ROOT);
    admin.passwordHash = passwordEncoder.encode(request.adminPassword());
    admin.role = UserRole.ROLE_CLIENT_ADMIN;
    users.save(admin);

    return ResponseMapper.tenant(tenant);
  }

  @Transactional
  @CacheEvict(cacheNames = {"tenantBySlug", "portalPackages"}, allEntries = true)
  public TenantResponse updateTenant(UUID tenantId, TenantUpdateRequest request) {
    Tenant tenant = tenants.findById(tenantId).orElseThrow(() -> ApiException.notFound("Tenant not found"));
    applyTenantUpdate(tenant, request);
    return ResponseMapper.tenant(tenant);
  }

  @Transactional
  @CacheEvict(cacheNames = {"tenantBySlug", "portalPackages"}, allEntries = true)
  public TenantResponse updateCurrentSettings(TenantSettingsRequest request) {
    Tenant tenant = tenantGuard.requireTenant();
    if (request.logoUrl() != null) tenant.logoUrl = request.logoUrl();
    if (request.locationName() != null) tenant.locationName = request.locationName();
    if (request.mpesaPaybill() != null) tenant.mpesaPaybill = request.mpesaPaybill();
    if (request.supportPhone() != null) tenant.supportPhone = request.supportPhone();
    if (request.supportWhatsapp() != null) tenant.supportWhatsapp = request.supportWhatsapp();
    if (request.zeroRatingEnabled() != null) tenant.zeroRatingEnabled = request.zeroRatingEnabled();
    return ResponseMapper.tenant(tenant);
  }

  @Transactional
  @CacheEvict(cacheNames = {"tenantBySlug", "portalPackages"}, allEntries = true)
  public TenantResponse suspendTenant(UUID tenantId) {
    Tenant tenant = tenants.findById(tenantId).orElseThrow(() -> ApiException.notFound("Tenant not found"));
    tenant.status = TenantStatus.SUSPENDED;
    return ResponseMapper.tenant(tenant);
  }

  @Transactional
  @CacheEvict(cacheNames = {"tenantBySlug", "portalPackages"}, allEntries = true)
  public void deleteTenant(UUID tenantId) {
    Tenant tenant = tenants.findById(tenantId).orElseThrow(() -> ApiException.notFound("Tenant not found"));
    tenant.status = TenantStatus.DELETED;
  }

  private void applyTenantUpdate(Tenant tenant, TenantUpdateRequest request) {
    if (request.name() != null) tenant.name = request.name();
    if (request.businessName() != null) tenant.businessName = request.businessName();
    if (request.locationName() != null) tenant.locationName = request.locationName();
    if (request.status() != null) tenant.status = TenantStatus.valueOf(request.status());
    if (request.logoUrl() != null) tenant.logoUrl = request.logoUrl();
    if (request.mpesaPaybill() != null) tenant.mpesaPaybill = request.mpesaPaybill();
    if (request.supportPhone() != null) tenant.supportPhone = request.supportPhone();
    if (request.supportWhatsapp() != null) tenant.supportWhatsapp = request.supportWhatsapp();
    if (request.zeroRatingEnabled() != null) tenant.zeroRatingEnabled = request.zeroRatingEnabled();
    if (request.billingModel() != null) tenant.billingModel = request.billingModel();
    if (request.monthlyFee() != null) tenant.monthlyFee = request.monthlyFee();
    if (request.revenueSharePercent() != null) tenant.revenueSharePercent = request.revenueSharePercent();
  }

  private BigDecimal defaultMoney(BigDecimal value) {
    return value == null ? BigDecimal.ZERO : value;
  }

  private String normalizeSlug(String value) {
    return value.toLowerCase(Locale.ROOT).trim().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
  }
}
