package com.tbilling.api;

import com.tbilling.domain.Enums.InvoiceStatus;
import com.tbilling.domain.Enums.PackageStatus;
import com.tbilling.domain.Enums.SessionStatus;
import com.tbilling.domain.Enums.TenantStatus;
import com.tbilling.domain.Enums.TransactionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class Contracts {
  private Contracts() {}

  public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}

  public record RefreshRequest(@NotBlank String refreshToken) {}

  public record AuthResponse(
      String accessToken,
      String refreshToken,
      Instant accessTokenExpiresAt,
      Instant refreshTokenExpiresAt,
      UserResponse user) {}

  public record UserResponse(
      UUID id, UUID tenantId, String name, String email, String role, boolean enabled) {}

  public record TenantCreateRequest(
      @NotBlank String name,
      @NotBlank String businessName,
      @NotBlank String slug,
      @NotBlank String locationName,
      @Email @NotBlank String adminEmail,
      @NotBlank String adminName,
      @NotBlank String adminPassword,
      BigDecimal monthlyFee,
      BigDecimal revenueSharePercent) {}

  public record TenantUpdateRequest(
      String name,
      String businessName,
      String locationName,
      String status,
      String logoUrl,
      String mpesaPaybill,
      String supportPhone,
      String supportWhatsapp,
      Boolean zeroRatingEnabled,
      String billingModel,
      BigDecimal monthlyFee,
      BigDecimal revenueSharePercent) {}

  public record TenantResponse(
      UUID id,
      String name,
      String businessName,
      String slug,
      String locationName,
      TenantStatus status,
      String logoUrl,
      String mpesaPaybill,
      String supportPhone,
      String supportWhatsapp,
      boolean zeroRatingEnabled,
      String billingModel,
      BigDecimal monthlyFee,
      BigDecimal revenueSharePercent,
      Instant createdAt) {}

  public record TenantSettingsRequest(
      String logoUrl,
      String locationName,
      String mpesaPaybill,
      String supportPhone,
      String supportWhatsapp,
      Boolean zeroRatingEnabled) {}

  public record PackageRequest(
      @NotBlank String name,
      @Min(0) int speedMbps,
      @Min(1) int durationMinutes,
      @NotNull @DecimalMin("0") BigDecimal priceKes,
      PackageStatus status,
      int sortOrder,
      boolean whatsappCallsAllowed,
      boolean streamingAllowed) {}

  public record PackageResponse(
      UUID id,
      UUID tenantId,
      String name,
      int speedMbps,
      int durationMinutes,
      BigDecimal priceKes,
      PackageStatus status,
      int sortOrder,
      boolean whatsappCallsAllowed,
      boolean streamingAllowed) {}

  public record ReorderPackagesRequest(List<UUID> packageIds) {}

  public record SessionResponse(
      UUID id,
      UUID tenantId,
      UUID packageId,
      String packageName,
      String phone,
      String macAddress,
      String radiusUsername,
      SessionStatus status,
      Instant startsAt,
      Instant expiresAt,
      long dataUsedBytes,
      Instant createdAt) {}

  public record StartPaymentRequest(
      @NotNull UUID packageId,
      @NotBlank @Pattern(regexp = "^254\\d{9}$", message = "Use 254XXXXXXXXX format") String phone,
      String macAddress) {}

  public record PaymentStartResponse(
      String checkoutRequestId, String merchantRequestId, TransactionStatus status, String message) {}

  public record PaymentStatusResponse(
      String checkoutRequestId,
      TransactionStatus status,
      String resultDescription,
      UUID sessionId,
      Instant paidAt) {}

  public record MpesaCallbackRequest(
      @NotBlank String checkoutRequestId,
      String merchantRequestId,
      @NotBlank String resultCode,
      String resultDescription,
      String mpesaReceiptNumber) {}

  public record TransactionResponse(
      UUID id,
      UUID tenantId,
      UUID packageId,
      String packageName,
      String phone,
      BigDecimal amountKes,
      String checkoutRequestId,
      String mpesaReceiptNumber,
      TransactionStatus status,
      Instant paidAt,
      Instant createdAt) {}

  public record OverviewResponse(
      long activeUsers,
      BigDecimal todayRevenueKes,
      long sessionsToday,
      double networkUptimePercent,
      long zeroRatingConversions,
      List<ChartPoint> revenueSeries,
      List<ChartPoint> sessionsByHour) {}

  public record ChartPoint(String label, BigDecimal value) {}

  public record NetworkStatusResponse(
      String primaryProvider,
      String backupProvider,
      String activeProvider,
      int latencyMs,
      int packetLossPercent,
      boolean failoverActive,
      Instant checkedAt) {}

  public record NetworkEventResponse(
      UUID id, UUID tenantId, String type, String provider, Integer latencyMs, Integer packetLossPercent, String message, Instant createdAt) {}

  public record FailoverEventResponse(
      UUID id, UUID tenantId, String fromProvider, String toProvider, String reason, String status, Instant createdAt, Instant resolvedAt) {}

  public record ZeroRatingSyncResponse(UUID tenantId, int ipRangeCount, String message, Instant syncedAt) {}

  public record PlatformAnalyticsResponse(
      BigDecimal totalRevenueKes,
      long totalActiveSessions,
      long totalRegisteredClients,
      double platformUptimePercent,
      List<ChartPoint> revenueByTenant,
      List<ChartPoint> sessionsByRegion) {}

  public record IspConfigRequest(
      @NotBlank String primaryProvider,
      @NotBlank String backupProvider,
      @Min(50) int latencyThresholdMs,
      @Min(1) int failureThreshold,
      String notificationWebhook) {}

  public record IspConfigResponse(
      UUID id,
      String primaryProvider,
      String backupProvider,
      int latencyThresholdMs,
      int failureThreshold,
      String notificationWebhook) {}

  public record InvoiceRequest(
      @NotNull UUID tenantId,
      @NotNull @DecimalMin("0") BigDecimal amountKes,
      @NotNull LocalDate dueDate) {}

  public record InvoiceResponse(
      UUID id,
      UUID tenantId,
      String tenantName,
      String invoiceNumber,
      BigDecimal amountKes,
      LocalDate dueDate,
      InvoiceStatus status,
      Instant createdAt) {}

  public record LogoUploadResponse(String logoUrl, String message) {}
}
