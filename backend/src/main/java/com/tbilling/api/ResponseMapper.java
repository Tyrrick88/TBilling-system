package com.tbilling.api;

import com.tbilling.api.Contracts.FailoverEventResponse;
import com.tbilling.api.Contracts.IspConfigResponse;
import com.tbilling.api.Contracts.InvoiceResponse;
import com.tbilling.api.Contracts.NetworkEventResponse;
import com.tbilling.api.Contracts.PackageResponse;
import com.tbilling.api.Contracts.SessionResponse;
import com.tbilling.api.Contracts.TenantResponse;
import com.tbilling.api.Contracts.TransactionResponse;
import com.tbilling.api.Contracts.UserResponse;
import com.tbilling.domain.FailoverEvent;
import com.tbilling.domain.HotspotSession;
import com.tbilling.domain.InternetPackage;
import com.tbilling.domain.IspConfig;
import com.tbilling.domain.NetworkEvent;
import com.tbilling.domain.PaymentTransaction;
import com.tbilling.domain.Tenant;
import com.tbilling.domain.TenantInvoice;
import com.tbilling.domain.UserAccount;

public final class ResponseMapper {
  private ResponseMapper() {}

  public static TenantResponse tenant(Tenant tenant) {
    return new TenantResponse(
        tenant.id,
        tenant.name,
        tenant.businessName,
        tenant.slug,
        tenant.locationName,
        tenant.status,
        tenant.logoUrl,
        tenant.mpesaPaybill,
        tenant.supportPhone,
        tenant.supportWhatsapp,
        tenant.zeroRatingEnabled,
        tenant.billingModel,
        tenant.monthlyFee,
        tenant.revenueSharePercent,
        tenant.createdAt);
  }

  public static UserResponse user(UserAccount user) {
    return new UserResponse(
        user.id,
        user.tenant == null ? null : user.tenant.id,
        user.name,
        user.email,
        user.role.name(),
        user.enabled);
  }

  public static PackageResponse internetPackage(InternetPackage internetPackage) {
    return new PackageResponse(
        internetPackage.id,
        internetPackage.tenant.id,
        internetPackage.name,
        internetPackage.speedMbps,
        internetPackage.durationMinutes,
        internetPackage.priceKes,
        internetPackage.status,
        internetPackage.sortOrder,
        internetPackage.whatsappCallsAllowed,
        internetPackage.streamingAllowed);
  }

  public static SessionResponse session(HotspotSession session) {
    return new SessionResponse(
        session.id,
        session.tenant.id,
        session.internetPackage == null ? null : session.internetPackage.id,
        session.internetPackage == null ? "Free WhatsApp" : session.internetPackage.name,
        session.phone,
        session.macAddress,
        session.radiusUsername,
        session.status,
        session.startsAt,
        session.expiresAt,
        session.dataUsedBytes,
        session.createdAt);
  }

  public static TransactionResponse transaction(PaymentTransaction transaction) {
    return new TransactionResponse(
        transaction.id,
        transaction.tenant.id,
        transaction.internetPackage.id,
        transaction.internetPackage.name,
        transaction.phone,
        transaction.amountKes,
        transaction.checkoutRequestId,
        transaction.mpesaReceiptNumber,
        transaction.status,
        transaction.paidAt,
        transaction.createdAt);
  }

  public static NetworkEventResponse networkEvent(NetworkEvent event) {
    return new NetworkEventResponse(
        event.id,
        event.tenant == null ? null : event.tenant.id,
        event.type.name(),
        event.provider,
        event.latencyMs,
        event.packetLossPercent,
        event.message,
        event.createdAt);
  }

  public static FailoverEventResponse failoverEvent(FailoverEvent event) {
    return new FailoverEventResponse(
        event.id,
        event.tenant == null ? null : event.tenant.id,
        event.fromProvider,
        event.toProvider,
        event.reason,
        event.status.name(),
        event.createdAt,
        event.resolvedAt);
  }

  public static IspConfigResponse ispConfig(IspConfig config) {
    return new IspConfigResponse(
        config.id,
        config.primaryProvider,
        config.backupProvider,
        config.latencyThresholdMs,
        config.failureThreshold,
        config.notificationWebhook);
  }

  public static InvoiceResponse invoice(TenantInvoice invoice) {
    return new InvoiceResponse(
        invoice.id,
        invoice.tenant.id,
        invoice.tenant.name,
        invoice.invoiceNumber,
        invoice.amountKes,
        invoice.dueDate,
        invoice.status,
        invoice.createdAt);
  }
}
