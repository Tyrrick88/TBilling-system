package com.tbilling.api;

import com.tbilling.api.Contracts.PackageResponse;
import com.tbilling.api.Contracts.PaymentStartResponse;
import com.tbilling.api.Contracts.StartPaymentRequest;
import com.tbilling.api.Contracts.TenantResponse;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Tenant;
import com.tbilling.service.PackageService;
import com.tbilling.service.PaymentService;
import com.tbilling.service.TenantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/portal/{tenantSlug}")
public class PortalController {
  private final TenantService tenantService;
  private final PackageService packageService;
  private final PaymentService paymentService;

  public PortalController(
      TenantService tenantService, PackageService packageService, PaymentService paymentService) {
    this.tenantService = tenantService;
    this.packageService = packageService;
    this.paymentService = paymentService;
  }

  @GetMapping
  public TenantResponse tenant(@PathVariable String tenantSlug) {
    return ResponseMapper.tenant(tenantService.tenantBySlug(tenantSlug));
  }

  @GetMapping("/packages")
  public List<PackageResponse> packages(@PathVariable String tenantSlug) {
    Tenant tenant = tenantService.tenantBySlug(tenantSlug);
    return packageService.listPortalPackages(tenant);
  }

  @PostMapping("/payments/stk-push")
  public PaymentStartResponse startPayment(
      @PathVariable String tenantSlug, @Valid @RequestBody StartPaymentRequest request) {
    Tenant tenant = tenantService.tenantBySlug(tenantSlug);
    return paymentService.startPayment(tenant, request);
  }
}
