package com.tbilling.service;

import com.tbilling.api.ApiException;
import com.tbilling.api.Contracts.MpesaCallbackRequest;
import com.tbilling.api.Contracts.PaymentStartResponse;
import com.tbilling.api.Contracts.PaymentStatusResponse;
import com.tbilling.api.Contracts.StartPaymentRequest;
import com.tbilling.api.Contracts.TransactionResponse;
import com.tbilling.api.ResponseMapper;
import com.tbilling.domain.Enums.TransactionStatus;
import com.tbilling.domain.HotspotSession;
import com.tbilling.domain.InternetPackage;
import com.tbilling.domain.PaymentTransaction;
import com.tbilling.domain.Tenant;
import com.tbilling.repository.InternetPackageRepository;
import com.tbilling.repository.PaymentTransactionRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PaymentService {
  private final PaymentTransactionRepository transactions;
  private final InternetPackageRepository packages;
  private final ProvisioningService provisioningService;

  public PaymentService(
      PaymentTransactionRepository transactions,
      InternetPackageRepository packages,
      ProvisioningService provisioningService) {
    this.transactions = transactions;
    this.packages = packages;
    this.provisioningService = provisioningService;
  }

  @Transactional
  public PaymentStartResponse startPayment(Tenant tenant, StartPaymentRequest request) {
    InternetPackage internetPackage =
        packages.findById(request.packageId()).orElseThrow(() -> ApiException.notFound("Package not found"));
    if (!internetPackage.tenant.id.equals(tenant.id)) {
      throw ApiException.badRequest("Package does not belong to this tenant");
    }

    PaymentTransaction transaction = new PaymentTransaction();
    transaction.tenant = tenant;
    transaction.internetPackage = internetPackage;
    transaction.phone = request.phone();
    transaction.amountKes = internetPackage.priceKes;
    transaction.checkoutRequestId = "ws_CO_" + UUID.randomUUID().toString().replace("-", "");
    transaction.merchantRequestId = "MR_" + UUID.randomUUID().toString().replace("-", "");
    transactions.save(transaction);

    return new PaymentStartResponse(
        transaction.checkoutRequestId,
        transaction.merchantRequestId,
        transaction.status,
        "STK Push queued. Daraja sandbox/mock mode is active until credentials are configured.");
  }

  @Transactional(readOnly = true)
  public PaymentStatusResponse status(String checkoutRequestId) {
    PaymentTransaction transaction = findByCheckout(checkoutRequestId);
    return new PaymentStatusResponse(
        transaction.checkoutRequestId,
        transaction.status,
        transaction.resultDescription,
        transaction.session == null ? null : transaction.session.id,
        transaction.paidAt);
  }

  @Transactional
  public PaymentStatusResponse handleCallback(MpesaCallbackRequest request) {
    PaymentTransaction transaction = findByCheckout(request.checkoutRequestId());
    transaction.resultCode = request.resultCode();
    transaction.resultDescription = request.resultDescription();
    transaction.merchantRequestId = request.merchantRequestId();
    transaction.mpesaReceiptNumber = request.mpesaReceiptNumber();
    if ("0".equals(request.resultCode())) {
      transaction.status = TransactionStatus.PAID;
      transaction.paidAt = Instant.now();
      HotspotSession session = provisioningService.provisionPaidSession(transaction);
      transaction.session = session;
    } else {
      transaction.status = TransactionStatus.FAILED;
    }
    return status(transaction.checkoutRequestId);
  }

  @Transactional(readOnly = true)
  public List<TransactionResponse> currentTenantTransactions(UUID tenantId) {
    return transactions.findTop100ByTenantIdOrderByCreatedAtDesc(tenantId).stream()
        .map(ResponseMapper::transaction)
        .toList();
  }

  private PaymentTransaction findByCheckout(String checkoutRequestId) {
    return transactions
        .findByCheckoutRequestId(checkoutRequestId)
        .orElseThrow(() -> ApiException.notFound("Payment transaction not found"));
  }
}
