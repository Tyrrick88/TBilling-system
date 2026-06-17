package com.tbilling.service;

import com.tbilling.api.Contracts.ChartPoint;
import com.tbilling.api.Contracts.OverviewResponse;
import com.tbilling.api.Contracts.PlatformAnalyticsResponse;
import com.tbilling.domain.Enums.SessionStatus;
import com.tbilling.domain.Enums.TenantStatus;
import com.tbilling.domain.Enums.TransactionStatus;
import com.tbilling.repository.HotspotSessionRepository;
import com.tbilling.repository.PaymentTransactionRepository;
import com.tbilling.repository.TenantRepository;
import com.tbilling.tenant.TenantGuard;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AnalyticsService {
  private final HotspotSessionRepository sessions;
  private final PaymentTransactionRepository transactions;
  private final TenantRepository tenants;
  private final TenantGuard tenantGuard;

  public AnalyticsService(
      HotspotSessionRepository sessions,
      PaymentTransactionRepository transactions,
      TenantRepository tenants,
      TenantGuard tenantGuard) {
    this.sessions = sessions;
    this.transactions = transactions;
    this.tenants = tenants;
    this.tenantGuard = tenantGuard;
  }

  @Transactional(readOnly = true)
  public OverviewResponse tenantOverview() {
    UUID tenantId = tenantGuard.requireTenantId();
    LocalDate today = LocalDate.now();
    var start = today.atStartOfDay(ZoneId.systemDefault()).toInstant();
    var end = today.plusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
    BigDecimal todayRevenue =
        transactions.sumTenantRevenue(tenantId, TransactionStatus.PAID, start, end);

    return new OverviewResponse(
        sessions.countByTenantIdAndStatus(tenantId, SessionStatus.ACTIVE),
        todayRevenue,
        sessions.countByTenantIdAndCreatedAtBetween(tenantId, start, end),
        99.8,
        transactions.countByTenantIdAndStatus(tenantId, TransactionStatus.PAID),
        lastSevenDaySeries(todayRevenue),
        hourlySeries());
  }

  @Transactional(readOnly = true)
  public PlatformAnalyticsResponse platformOverview() {
    BigDecimal revenue = transactions.sumPlatformRevenue(TransactionStatus.PAID);
    long clients = tenants.findByStatusNotOrderByCreatedAtDesc(TenantStatus.DELETED).size();
    return new PlatformAnalyticsResponse(
        revenue,
        sessions.countByStatus(SessionStatus.ACTIVE),
        clients,
        99.9,
        tenants.findByStatusNotOrderByCreatedAtDesc(TenantStatus.DELETED).stream()
            .map(tenant -> new ChartPoint(tenant.name, BigDecimal.ZERO))
            .toList(),
        tenants.findByStatusNotOrderByCreatedAtDesc(TenantStatus.DELETED).stream()
            .map(tenant -> new ChartPoint(tenant.locationName, BigDecimal.ONE))
            .toList());
  }

  private List<ChartPoint> lastSevenDaySeries(BigDecimal todayRevenue) {
    LocalDate today = LocalDate.now();
    List<ChartPoint> points = new ArrayList<>();
    for (int index = 6; index >= 0; index--) {
      LocalDate date = today.minusDays(index);
      points.add(new ChartPoint(date.toString(), index == 0 ? todayRevenue : BigDecimal.ZERO));
    }
    return points;
  }

  private List<ChartPoint> hourlySeries() {
    List<ChartPoint> points = new ArrayList<>();
    for (int hour = 0; hour < 24; hour += 3) {
      points.add(new ChartPoint(String.format("%02d:00", hour), BigDecimal.ZERO));
    }
    return points;
  }
}
