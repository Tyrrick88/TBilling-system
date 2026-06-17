package com.tbilling.api;

import com.tbilling.api.Contracts.FailoverEventResponse;
import com.tbilling.api.Contracts.LogoUploadResponse;
import com.tbilling.api.Contracts.NetworkEventResponse;
import com.tbilling.api.Contracts.NetworkStatusResponse;
import com.tbilling.api.Contracts.OverviewResponse;
import com.tbilling.api.Contracts.PackageRequest;
import com.tbilling.api.Contracts.PackageResponse;
import com.tbilling.api.Contracts.ReorderPackagesRequest;
import com.tbilling.api.Contracts.SessionResponse;
import com.tbilling.api.Contracts.TenantResponse;
import com.tbilling.api.Contracts.TenantSettingsRequest;
import com.tbilling.api.Contracts.TransactionResponse;
import com.tbilling.service.AnalyticsService;
import com.tbilling.service.NetworkService;
import com.tbilling.service.PackageService;
import com.tbilling.service.PaymentService;
import com.tbilling.service.SessionService;
import com.tbilling.service.StorageService;
import com.tbilling.service.TenantService;
import com.tbilling.tenant.TenantGuard;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
  private final AnalyticsService analyticsService;
  private final SessionService sessionService;
  private final PackageService packageService;
  private final PaymentService paymentService;
  private final NetworkService networkService;
  private final TenantService tenantService;
  private final StorageService storageService;
  private final TenantGuard tenantGuard;

  public AdminController(
      AnalyticsService analyticsService,
      SessionService sessionService,
      PackageService packageService,
      PaymentService paymentService,
      NetworkService networkService,
      TenantService tenantService,
      StorageService storageService,
      TenantGuard tenantGuard) {
    this.analyticsService = analyticsService;
    this.sessionService = sessionService;
    this.packageService = packageService;
    this.paymentService = paymentService;
    this.networkService = networkService;
    this.tenantService = tenantService;
    this.storageService = storageService;
    this.tenantGuard = tenantGuard;
  }

  @GetMapping("/overview")
  public OverviewResponse overview() {
    return analyticsService.tenantOverview();
  }

  @GetMapping({"/sessions", "/users"})
  public List<SessionResponse> sessions(@RequestParam(required = false) String status) {
    return sessionService.listSessions(status);
  }

  @GetMapping("/packages")
  public List<PackageResponse> packages() {
    return packageService.listCurrentTenantPackages();
  }

  @PostMapping("/packages")
  public PackageResponse createPackage(@Valid @RequestBody PackageRequest request) {
    return packageService.createPackage(request);
  }

  @PutMapping("/packages/{packageId}")
  public PackageResponse updatePackage(
      @PathVariable UUID packageId, @Valid @RequestBody PackageRequest request) {
    return packageService.updatePackage(packageId, request);
  }

  @DeleteMapping("/packages/{packageId}")
  public void deletePackage(@PathVariable UUID packageId) {
    packageService.deletePackage(packageId);
  }

  @PutMapping("/packages/reorder")
  public List<PackageResponse> reorderPackages(@RequestBody ReorderPackagesRequest request) {
    return packageService.reorderPackages(request);
  }

  @GetMapping("/financials/transactions")
  public List<TransactionResponse> transactions() {
    return paymentService.currentTenantTransactions(tenantGuard.requireTenantId());
  }

  @GetMapping("/network/status")
  public NetworkStatusResponse networkStatus() {
    return networkService.currentStatus();
  }

  @GetMapping("/network/events")
  public List<NetworkEventResponse> networkEvents() {
    return networkService.tenantNetworkEvents();
  }

  @GetMapping({"/network/failovers", "/downtime"})
  public List<FailoverEventResponse> failovers() {
    return networkService.tenantFailoverEvents();
  }

  @GetMapping("/settings")
  public TenantResponse settings() {
    return tenantService.currentSettings();
  }

  @PutMapping("/settings")
  public TenantResponse updateSettings(@RequestBody TenantSettingsRequest request) {
    return tenantService.updateCurrentSettings(request);
  }

  @PostMapping("/settings/logo")
  public LogoUploadResponse uploadLogo(@RequestPart("file") MultipartFile file) {
    return storageService.uploadLogo(file);
  }
}
