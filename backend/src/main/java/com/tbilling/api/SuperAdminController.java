package com.tbilling.api;

import com.tbilling.api.Contracts.InvoiceRequest;
import com.tbilling.api.Contracts.InvoiceResponse;
import com.tbilling.api.Contracts.IspConfigRequest;
import com.tbilling.api.Contracts.IspConfigResponse;
import com.tbilling.api.Contracts.NetworkEventResponse;
import com.tbilling.api.Contracts.PlatformAnalyticsResponse;
import com.tbilling.api.Contracts.TenantCreateRequest;
import com.tbilling.api.Contracts.TenantResponse;
import com.tbilling.api.Contracts.TenantUpdateRequest;
import com.tbilling.service.AnalyticsService;
import com.tbilling.service.BillingService;
import com.tbilling.service.NetworkService;
import com.tbilling.service.TenantService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/super")
public class SuperAdminController {
  private final TenantService tenantService;
  private final AnalyticsService analyticsService;
  private final NetworkService networkService;
  private final BillingService billingService;

  public SuperAdminController(
      TenantService tenantService,
      AnalyticsService analyticsService,
      NetworkService networkService,
      BillingService billingService) {
    this.tenantService = tenantService;
    this.analyticsService = analyticsService;
    this.networkService = networkService;
    this.billingService = billingService;
  }

  @GetMapping("/tenants")
  public List<TenantResponse> tenants() {
    return tenantService.listTenants();
  }

  @PostMapping("/tenants")
  public TenantResponse createTenant(@Valid @RequestBody TenantCreateRequest request) {
    return tenantService.createTenant(request);
  }

  @PutMapping("/tenants/{tenantId}")
  public TenantResponse updateTenant(
      @PathVariable UUID tenantId, @RequestBody TenantUpdateRequest request) {
    return tenantService.updateTenant(tenantId, request);
  }

  @PutMapping("/tenants/{tenantId}/suspend")
  public TenantResponse suspendTenant(@PathVariable UUID tenantId) {
    return tenantService.suspendTenant(tenantId);
  }

  @DeleteMapping("/tenants/{tenantId}")
  public void deleteTenant(@PathVariable UUID tenantId) {
    tenantService.deleteTenant(tenantId);
  }

  @GetMapping("/analytics")
  public PlatformAnalyticsResponse analytics() {
    return analyticsService.platformOverview();
  }

  @GetMapping("/isp-config")
  public IspConfigResponse ispConfig() {
    return networkService.ispConfig();
  }

  @PutMapping("/isp-config")
  public IspConfigResponse updateIspConfig(@Valid @RequestBody IspConfigRequest request) {
    return networkService.updateIspConfig(request);
  }

  @GetMapping("/error-logs")
  public List<NetworkEventResponse> errorLogs() {
    return networkService.platformErrors();
  }

  @GetMapping("/billing")
  public List<InvoiceResponse> invoices() {
    return billingService.listInvoices();
  }

  @PostMapping("/billing")
  public InvoiceResponse createInvoice(@Valid @RequestBody InvoiceRequest request) {
    return billingService.createInvoice(request);
  }
}
