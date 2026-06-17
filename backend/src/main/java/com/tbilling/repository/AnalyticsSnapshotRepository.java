package com.tbilling.repository;

import com.tbilling.domain.AnalyticsSnapshot;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnalyticsSnapshotRepository extends JpaRepository<AnalyticsSnapshot, UUID> {
  List<AnalyticsSnapshot> findByTenantIdAndSnapshotDateBetweenOrderBySnapshotDateAscHourOfDayAsc(
      UUID tenantId, LocalDate start, LocalDate end);

  List<AnalyticsSnapshot> findBySnapshotDateBetweenOrderBySnapshotDateAscHourOfDayAsc(
      LocalDate start, LocalDate end);
}
